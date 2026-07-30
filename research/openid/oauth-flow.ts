/**
 * Interactive Yahoo OAuth2 + OpenID Connect flow.
 *
 * Required environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_REDIRECT_URI (must match the Yahoo app configuration)
 * - YAHOO_OAUTH_SCOPE (optional; defaults to `openid profile email`)
 *
 * The authorization code is pasted after Yahoo redirects back to the
 * configured URI. Tokens are saved to the shared ignored .oauth2-tokens.json
 * file used by the private route probe.
 */

import { writeFile } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { OAuth2Client } from '../../src/auth/oauth2.js';

const authorizationEndpoint =
   'https://api.login.yahoo.com/oauth2/request_auth';
const userInfoEndpoint = 'https://api.login.yahoo.com/openid/v1/userinfo';
const tokenFile = fileURLToPath(
   new URL('../api-path-validation/.oauth2-tokens.json', import.meta.url),
);

function required(name: string): string {
   const value = process.env[name];
   if (!value) throw new Error(`${name} is required`);
   return value;
}

function buildAuthorizationUrl(
   clientId: string,
   redirectUri: string,
   state: string,
   scope: string,
): string {
   const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      state,
   });
   return `${authorizationEndpoint}?${params.toString()}`;
}

async function prompt(message: string): Promise<string> {
   const readline = createInterface({ input, output });
   try {
      return (await readline.question(message)).trim();
   } finally {
      readline.close();
   }
}

function extractAuthorizationCode(
   value: string,
   expectedState: string,
): string {
   const callback = new URL(value);
   if (callback.protocol !== 'http:' && callback.protocol !== 'https:') {
      throw new Error(
         'Authorization input must be an HTTP(S) redirect URL',
      );
   }
   const code = callback.searchParams.get('code');
   const receivedState = callback.searchParams.get('state');
   if (receivedState !== expectedState) {
      throw new Error('OAuth authorization state does not match');
   }
   if (!code)
      throw new Error(
         'Redirect URL does not contain an authorization code',
      );
   return code;
}

async function main(): Promise<void> {
   const clientId = required('YAHOO_CLIENT_ID');
   const clientSecret = required('YAHOO_CLIENT_SECRET');
   const redirectUri = required('YAHOO_REDIRECT_URI');
   const scope =
      process.env.YAHOO_OAUTH_SCOPE?.trim() || 'openid profile email';
   const state = crypto.randomUUID();
   const client = new OAuth2Client(clientId, clientSecret, redirectUri);

   console.log('Open this Yahoo authorization URL:');
   console.log(buildAuthorizationUrl(clientId, redirectUri, state, scope));
   console.log(
      'After authorization, paste the complete HTTP(S) redirect URL.',
   );

   const code = extractAuthorizationCode(
      await prompt('Authorization code or redirect URL: '),
      state,
   );
   if (!code) throw new Error('Authorization code cannot be empty');

   const tokens = await client.exchangeCodeForToken(code);
   const userInfoResponse = await fetch(userInfoEndpoint, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
   });
   if (!userInfoResponse.ok) {
      throw new Error(
         `OIDC userinfo failed with HTTP ${userInfoResponse.status}`,
      );
   }

   const userInfo = (await userInfoResponse.json()) as Record<
      string,
      unknown
   >;
   await writeFile(tokenFile, JSON.stringify(tokens, null, 2), {
      mode: 0o600,
   });

   console.log(
      `OIDC userinfo validated (${Object.keys(userInfo).length} claims).`,
   );
   console.log(`OAuth tokens saved to ${tokenFile}.`);
   console.log(
      `Token expires at ${new Date(tokens.expiresAt).toISOString()}.`,
   );
}

if (import.meta.main) await main();
