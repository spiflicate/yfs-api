import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { OAuth1Client } from '../../src/auth/oauth1.js';
import { OAuth2Client, type OAuth2Tokens } from '../../src/auth/oauth2.js';
import { YahooApiError } from '../../src/client/errors.js';
import { HttpClient } from '../../src/client/http.js';
import { API_BASE_URL } from '../../src/utils/constants.js';
import { parseYahooXML } from '../../src/utils/xmlParser.js';
import { staticRouteVerifierConfig } from './static-route-config.js';
import type { RouteMode } from './static-route-definitions.js';

export interface RequestExecution {
   parsedResponse: unknown;
   rawBody: string;
   url: string;
}

interface PublicAuthContext {
   http: HttpClient;
   mode: 'public';
}

interface PrivateAuthContext {
   http: HttpClient;
   mode: 'private';
   oauth2: OAuth2Client;
   redirectUri: string;
   storage: ResearchTokenStorage;
   tokens: OAuth2Tokens | null;
}

type AuthContext = PrivateAuthContext | PublicAuthContext;

export class RequestRouteError extends Error {
   constructor(
      message: string,
      readonly rawBody: string,
      readonly url: string,
   ) {
      super(message);
      this.name = 'RequestRouteError';
   }
}

class ResearchTokenStorage {
   constructor(private readonly tokenPath: string) {}

   async save(tokens: OAuth2Tokens): Promise<void> {
      await Bun.write(this.tokenPath, JSON.stringify(tokens, null, 2));
   }

   async load(): Promise<OAuth2Tokens | null> {
      const file = Bun.file(this.tokenPath);
      if (!(await file.exists())) {
         return null;
      }

      const content = await file.text();
      if (!content.trim()) {
         return null;
      }

      try {
         return JSON.parse(content) as OAuth2Tokens;
      } catch (error) {
         throw new Error(
            `Invalid OAuth2 token file ${this.tokenPath}: ${error instanceof Error ? error.message : String(error)}`,
         );
      }
   }
}

const authContextCache: Partial<Record<RouteMode, AuthContext>> = {};

function requireValue(value: string, name: string): string {
   if (!value) {
      throw new Error(`Missing ${name}`);
   }
   return value;
}

async function promptForAuthorizationCode(
   authUrl: string,
   redirectUri: string,
): Promise<string> {
   if (process.env.YAHOO_RESEARCH_NON_INTERACTIVE === '1') {
      throw new Error(
         'OAuth2 authorization is required; rerun interactively or refresh .oauth2-tokens.json first',
      );
   }
   console.log('\nOAuth2 authorization required.');
   console.log(authUrl);
   console.log(`Redirect URI: ${redirectUri}`);
   const rl = createInterface({ input, output });
   try {
      const code = (await rl.question('Authorization code: ')).trim();
      if (!code) {
         throw new Error('No authorization code provided');
      }
      return code;
   } finally {
      rl.close();
   }
}

async function ensurePrivateTokens(
   auth: PrivateAuthContext,
): Promise<OAuth2Tokens> {
   if (auth.tokens && !auth.oauth2.isTokenExpired(auth.tokens)) {
      return auth.tokens;
   }

   if (auth.tokens?.refreshToken) {
      try {
         auth.tokens = await auth.oauth2.refreshAccessToken(
            auth.tokens.refreshToken,
         );
         await auth.storage.save(auth.tokens);
         return auth.tokens;
      } catch {
         auth.tokens = null;
      }
   }

   const code = await promptForAuthorizationCode(
      auth.oauth2.getAuthorizationUrl(`research-${Date.now()}`),
      auth.redirectUri,
   );
   auth.tokens = await auth.oauth2.exchangeCodeForToken(code);
   await auth.storage.save(auth.tokens);
   return auth.tokens;
}

async function getAuthContext(mode: RouteMode): Promise<AuthContext> {
   const cached = authContextCache[mode];
   if (cached) {
      return cached;
   }

   if (mode === 'public') {
      const oauth1 = new OAuth1Client(
         requireValue(
            staticRouteVerifierConfig.auth.public.clientId,
            'YAHOO_CLIENT_ID',
         ),
         requireValue(
            staticRouteVerifierConfig.auth.public.clientSecret,
            'YAHOO_CLIENT_SECRET',
         ),
      );
      const context: PublicAuthContext = {
         mode,
         http: new HttpClient(undefined, undefined, undefined, {
            oauth1Client: oauth1,
            timeout: staticRouteVerifierConfig.request.timeoutMs,
         }),
      };
      authContextCache[mode] = context;
      return context;
   }

   const authConfig = staticRouteVerifierConfig.auth.private;
   const oauth2 = new OAuth2Client(
      requireValue(authConfig.clientId, 'YAHOO_CLIENT_ID'),
      requireValue(authConfig.clientSecret, 'YAHOO_CLIENT_SECRET'),
      requireValue(authConfig.redirectUri, 'OAuth2 redirect URI'),
   );
   const storage = new ResearchTokenStorage(authConfig.tokenFilePath);
   const context = {
      mode,
      oauth2,
      redirectUri: authConfig.redirectUri,
      storage,
      tokens: authConfig.seedTokens ?? (await storage.load()),
   } as PrivateAuthContext;

   context.http = new HttpClient(
      oauth2,
      () => context.tokens,
      async () => {
         if (!context.tokens?.refreshToken) {
            throw new Error('No refresh token available');
         }
         const tokens = await oauth2.refreshAccessToken(
            context.tokens.refreshToken,
         );
         context.tokens = tokens;
         await storage.save(tokens);
         return tokens;
      },
      {
         timeout: staticRouteVerifierConfig.request.timeoutMs,
      },
   );

   if (!context.tokens) {
      await ensurePrivateTokens(context);
   }
   authContextCache[mode] = context;
   return context;
}

export function buildRequestUrl(path: string): string {
   const normalizedPath = path.startsWith('/') ? path : `/${path}`;
   const url = new URL(`${API_BASE_URL}${normalizedPath}`);
   url.searchParams.set('format', 'xml');
   return url.toString();
}

export async function requestRoute(
   mode: RouteMode,
   path: string,
): Promise<RequestExecution> {
   const auth = await getAuthContext(mode);
   if (auth.mode === 'private') {
      await ensurePrivateTokens(auth);
   }

   const url = buildRequestUrl(path);
   try {
      const rawBody = await auth.http.requestRawXml(path, {
         headers: { Accept: 'application/xml' },
      });
      return {
         parsedResponse: parseYahooXML(rawBody),
         rawBody,
         url,
      };
   } catch (error) {
      if (error instanceof YahooApiError) {
         throw new RequestRouteError(
            error.message,
            typeof error.response === 'string'
               ? error.response
               : JSON.stringify(error.response, null, 2),
            url,
         );
      }
      throw new RequestRouteError(
         error instanceof Error ? error.message : String(error),
         '',
         url,
      );
   }
}
