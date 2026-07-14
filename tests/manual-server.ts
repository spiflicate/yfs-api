import { writeFileSync } from 'fs';
import { homedir, tmpdir } from 'os';
import { join } from 'path';
import {
   type OAuth2Tokens,
   type TokenStorage,
   YahooFantasyClient,
} from '../src/index';

const PORT = parseInt(process.env.PORT || '4567', 10);
const TUNNEL_NAME = 'yahoo-callback';
const HOSTNAME = 'yahoo.jbru.dev';
const REDIRECT_PATH = '/callback';
const TOKEN_FILE = '.oauth2-tokens-server.json';

const CLIENT_ID = process.env.YAHOO_CLIENT_ID;
const CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
   console.error('Missing YAHOO_CLIENT_ID or YAHOO_CLIENT_SECRET');
   process.exit(1);
}

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

class FileTokenStorage implements TokenStorage {
   async save(tokens: OAuth2Tokens) {
      await Bun.write(TOKEN_FILE, JSON.stringify(tokens, null, 2));
   }
   async load(): Promise<OAuth2Tokens | null> {
      const f = Bun.file(TOKEN_FILE);
      if (!(await f.exists())) return null;
      return JSON.parse(await f.text());
   }
   async clear() {
      await Bun.write(TOKEN_FILE, '');
   }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let yfs: YahooFantasyClient | null = null;
let tunnelProc: ReturnType<typeof Bun.spawn> | null = null;
let server: ReturnType<typeof Bun.serve> | null = null;
const validStates = new Set<string>();

function shutdown() {
   console.log('\n  Shutting down...');
   tunnelProc?.kill(15);
   server?.stop();
   process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ---------------------------------------------------------------------------
// Tunnel helpers
// ---------------------------------------------------------------------------

function findTunnelId(): string {
   const r = Bun.spawnSync([
      'cloudflared',
      'tunnel',
      'list',
      '--output',
      'json',
   ]);
   if (r.exitCode !== 0) return '';
   const tunnels = JSON.parse(r.stdout.toString()) as Array<{
      id: string;
      name: string;
   }>;
   return tunnels.find((t) => t.name === TUNNEL_NAME)?.id ?? '';
}

function createTunnel(): string {
   const r = Bun.spawnSync([
      'cloudflared',
      'tunnel',
      'create',
      TUNNEL_NAME,
   ]);
   if (r.exitCode !== 0)
      throw new Error(`Failed to create tunnel: ${r.stderr.toString()}`);
   const m = r.stdout.toString().match(/([a-f0-9-]{36})/);
   if (!m) throw new Error('Could not parse tunnel ID');
   return m[1];
}

// ---------------------------------------------------------------------------
// Server + tunnel
// ---------------------------------------------------------------------------

server = Bun.serve({
   port: PORT,
   async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === REDIRECT_PATH) {
         if (!yfs) return new Response('Initializing...', { status: 503 });

         const code = url.searchParams.get('code');
         const state = url.searchParams.get('state');
         const error = url.searchParams.get('error');

         if (error)
            return new Response(`<h1>Auth error:</h1><pre>${error}</pre>`, {
               headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
         if (!code)
            return new Response('<h1>Missing code parameter</h1>', {
               status: 400,
               headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
         if (!state || !validStates.has(state))
            return new Response('<h1>Invalid or missing state parameter</h1>', {
               status: 400,
               headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
         validStates.delete(state);

         try {
            await yfs.authenticate(code);

            const [user, openidRes] = await Promise.all([
               yfs.api().users().get(),
               fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
                  headers: {
                     Authorization: `Bearer ${yfs.getTokens()?.accessToken ?? ''}`,
                  },
               }),
            ]);
            const openid = await openidRes.json();

            return new Response(
               `<!DOCTYPE html>
<html><body>
<h1>Authenticated!</h1>
<p>State: <code>${state}</code></p>
<h2>Yahoo Fantasy User</h2>
<pre>${JSON.stringify(user, null, 2)}</pre>
<h2>OpenID User Info</h2>
<pre>${JSON.stringify(openid, null, 2)}</pre>
</body></html>`,
               { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
            );
         } catch (e) {
            return new Response(
               `<h1>Auth failed</h1><pre>${e instanceof Error ? e.message : String(e)}</pre>`,
               {
                  status: 500,
                  headers: { 'Content-Type': 'text/html; charset=utf-8' },
               },
            );
         }
      }

      if (yfs) {
         const state = url.searchParams.get('state') || crypto.randomUUID();
         validStates.add(state);
         const authUrl = yfs.getAuthUrl(state);
         return new Response(
            `<!DOCTYPE html>
<html><body>
<h1>Yahoo OAuth Test</h1>
<p>Redirect URI: <code>https://${HOSTNAME}${REDIRECT_PATH}</code></p>
<p>State: <code>${state}</code></p>
<a href="${authUrl}"><button>Authenticate with Yahoo</button></a>
<hr>
<p>Or use this URL directly:</p>
<pre>${authUrl}</pre>
</body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
         );
      }

      return new Response('Starting tunnel...', { status: 503 });
   },
});

console.log(`\n  Local server: http://localhost:${PORT}`);

// ---------------------------------------------------------------------------
// Ensure tunnel
// ---------------------------------------------------------------------------

const id = findTunnelId() || createTunnel();
const credsPath = join(homedir(), '.cloudflared', `${id}.json`);
const configPath = join(tmpdir(), `cloudflared-${id}.yml`);
const cnameTarget = `${id}.cfargotunnel.com`;

// Write config
const yml = [
   `tunnel: ${id}`,
   `credentials-file: ${credsPath}`,
   'ingress:',
   `  - hostname: ${HOSTNAME}`,
   `    service: http://localhost:${PORT}`,
   '  - service: http_status:404',
].join('\n');
writeFileSync(configPath, yml, 'utf-8');

console.log(`  Tunnel:       ${TUNNEL_NAME} (${id})`);
console.log(`  CNAME target: ${cnameTarget}`);
console.log(`  Hostname:     https://${HOSTNAME}`);
console.log(`  Redirect URI: https://${HOSTNAME}${REDIRECT_PATH}\n`);

// Try auto-DNS; warn if it fails
const dnsResult = Bun.spawnSync([
   'cloudflared',
   'tunnel',
   'route',
   'dns',
   '--overwrite-dns',
   id,
   HOSTNAME,
]);
if (dnsResult.exitCode !== 0) {
   console.warn(
      '  ⚠ Could not auto-configure DNS. Add this CNAME in your Cloudflare dashboard:\n',
   );
   console.warn(`     Name: ${HOSTNAME}  →  ${cnameTarget}\n`);
} else {
   console.log('  ✓ DNS record configured\n');
}

// Create Yahoo client
const redirectUri = `https://${HOSTNAME}${REDIRECT_PATH}`;
yfs = new YahooFantasyClient(
   { clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, redirectUri },
   new FileTokenStorage(),
);

// Start tunnel
console.log('  Starting tunnel...\n');
tunnelProc = Bun.spawn(
   ['cloudflared', 'tunnel', '--config', configPath, 'run'],
   {
      stdout: 'inherit',
      stderr: 'inherit',
   },
);

await Bun.sleep(Infinity);
