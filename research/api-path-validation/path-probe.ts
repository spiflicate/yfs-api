import { mkdir } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { HttpClient } from '../../src/client/HttpClient.js';
import { OAuth1Client } from '../../src/client/OAuth1Client.js';
import {
   OAuth2Client,
   type OAuth2Tokens,
} from '../../src/client/OAuth2Client.js';
import { YahooApiError } from '../../src/types/errors.js';
import { API_BASE_URL } from '../../src/utils/constants.js';
import { parseYahooXML } from '../../src/utils/xmlParser.js';
import { staticRouteVerifierConfig } from './static-route-config.ts';
import type { RouteMode } from './static-route-definitions.js';

type FailureKind =
   | 'unsupported-route'
   | 'invalid-test-parameters'
   | 'auth-or-scope'
   | 'empty-data'
   | 'unknown-failure';

interface FailureAssessment {
   confidence: 'high' | 'medium';
   kind: FailureKind;
   nextStep: string;
   reason: string;
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

type AuthContext = PublicAuthContext | PrivateAuthContext;

interface ProbeArgs {
   mode: RouteMode;
   path: string;
}

interface RequestExecution {
   parsedResponse: unknown;
   rawBody: string;
   url: string;
}

class RequestRouteError extends Error {
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
   constructor(private readonly tokenPath = '.oauth2-tokens.json') {}

   async save(tokens: OAuth2Tokens): Promise<void> {
      await Bun.write(this.tokenPath, JSON.stringify(tokens, null, 2));
   }

   async load(): Promise<OAuth2Tokens | null> {
      try {
         const file = Bun.file(this.tokenPath);
         if (!(await file.exists())) {
            return null;
         }

         const content = await file.text();
         if (!content.trim()) {
            return null;
         }

         return JSON.parse(content) as OAuth2Tokens;
      } catch {
         return null;
      }
   }
}

const authContextCache: Partial<Record<RouteMode, AuthContext>> = {};
const runFolderName = new Date().toISOString().replace(/[:.]/g, '-');

function getScriptDirectoryPath(): string {
   return new URL('.', import.meta.url).pathname;
}

function getProbeDumpDirectory(): string {
   return new URL(`./tmp/${runFolderName}`, import.meta.url).pathname;
}

function requireConfigValue(value: string, path: string): string {
   if (!value) {
      throw new Error(
         `Missing required config value at staticRouteVerifierConfig.${path}`,
      );
   }

   return value;
}

function printUsage(): never {
   console.error(
      'Usage: bun run research/api-path-validation/path-probe.ts --mode public "/game/465"',
   );
   console.error(
      'Example: bun run research/api-path-validation/path-probe.ts --mode private "/league/465.l.30702/transactions;count=5"',
   );
   process.exit(1);
}

function parseCliArgs(argv: string[]): ProbeArgs {
   let mode: RouteMode = 'public';
   let path: string | undefined;

   for (let index = 0; index < argv.length; index += 1) {
      const arg = argv[index];

      if (!arg) {
         continue;
      }

      if (arg === '--mode') {
         const value = argv[index + 1];
         if (value !== 'public' && value !== 'private') {
            printUsage();
         }
         mode = value;
         index += 1;
         continue;
      }

      if (arg === '--public') {
         mode = 'public';
         continue;
      }

      if (arg === '--private') {
         mode = 'private';
         continue;
      }

      if (!path && (arg === 'public' || arg === 'private')) {
         mode = arg;
         continue;
      }

      if (!path) {
         path = arg;
         continue;
      }

      printUsage();
   }

   if (!path) {
      printUsage();
   }

   return {
      mode,
      path: normalizeInputPath(path),
   };
}

function normalizeInputPath(inputPath: string): string {
   const trimmed = inputPath.trim();
   if (!trimmed) {
      throw new Error('A non-empty path is required');
   }

   if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const apiPrefix = '/fantasy/v2';
      const pathname = url.pathname.startsWith(apiPrefix)
         ? url.pathname.slice(apiPrefix.length)
         : url.pathname;

      if (!pathname) {
         throw new Error(
            'The provided URL does not include a Yahoo API path',
         );
      }

      return pathname.startsWith('/') ? pathname : `/${pathname}`;
   }

   return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function buildRequestUrl(path: string): string {
   const normalizedPath = path.startsWith('/') ? path : `/${path}`;
   const url = new URL(`${API_BASE_URL}${normalizedPath}`);
   url.searchParams.set('format', 'xml');
   return url.toString();
}

function sanitizeFileSegment(value: string): string {
   return value
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
}

async function writeProbeDump(
   mode: RouteMode,
   path: string,
   suffix: 'response' | 'error',
   payload: unknown,
): Promise<string> {
   const pathSlug = sanitizeFileSegment(path.replace(/^\//, '')) || 'root';
   const filename = `${mode}-${pathSlug}-${suffix}.json`;
   const dumpFilePath = `${getProbeDumpDirectory()}/${filename}`;
   await Bun.write(dumpFilePath, JSON.stringify(payload, null, 2));
   return dumpFilePath;
}

async function promptForAuthorizationCode(
   authUrl: string,
   redirectUri: string,
   tokenFilePath: string,
): Promise<string> {
   console.log('\nOAuth2 authorization required.');
   console.log('Open this URL in your browser:');
   console.log(authUrl);
   console.log();
   console.log(`Redirect URI: ${redirectUri}`);
   console.log(`Token file: ${tokenFilePath}`);
   console.log(
      'After Yahoo returns the authorization code, paste it below to finish authentication.',
   );

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
      console.log('Using stored OAuth2 tokens.');
      return auth.tokens;
   }

   if (auth.tokens?.refreshToken) {
      try {
         console.log('Refreshing stored OAuth2 tokens...');
         auth.tokens = await auth.oauth2.refreshAccessToken(
            auth.tokens.refreshToken,
         );
         await auth.storage.save(auth.tokens);
         console.log(
            'OAuth2 token refresh succeeded. Updated tokens saved.',
         );
         return auth.tokens;
      } catch {
         console.log(
            'Stored OAuth2 token refresh failed. Falling back to interactive authentication.',
         );
         auth.tokens = null;
      }
   }

   const code = await promptForAuthorizationCode(
      auth.oauth2.getAuthorizationUrl(`research-${Date.now()}`),
      auth.redirectUri,
      staticRouteVerifierConfig.auth.private.tokenFilePath,
   );
   console.log('Exchanging authorization code for OAuth2 tokens...');
   auth.tokens = await auth.oauth2.exchangeCodeForToken(code);
   await auth.storage.save(auth.tokens);
   console.log(
      `OAuth2 authentication succeeded. Tokens saved to ${staticRouteVerifierConfig.auth.private.tokenFilePath}.`,
   );
   return auth.tokens;
}

async function getAuthContext(mode: RouteMode): Promise<AuthContext> {
   const cached = authContextCache[mode];
   if (cached) {
      return cached;
   }

   if (mode === 'public') {
      const clientId = requireConfigValue(
         staticRouteVerifierConfig.auth.public.clientId,
         'auth.public.clientId',
      );
      const clientSecret = requireConfigValue(
         staticRouteVerifierConfig.auth.public.clientSecret,
         'auth.public.clientSecret',
      );
      const oauth1 = new OAuth1Client(clientId, clientSecret);
      const context: PublicAuthContext = {
         http: new HttpClient(undefined, undefined, undefined, {
            oauth1Client: oauth1,
            rawXml: true,
            timeout: staticRouteVerifierConfig.request.timeoutMs,
         }),
         mode: 'public',
      };
      authContextCache[mode] = context;
      return context;
   }

   const clientId = requireConfigValue(
      staticRouteVerifierConfig.auth.private.clientId,
      'auth.private.clientId',
   );
   const clientSecret = requireConfigValue(
      staticRouteVerifierConfig.auth.private.clientSecret,
      'auth.private.clientSecret',
   );
   const redirectUri = requireConfigValue(
      staticRouteVerifierConfig.auth.private.redirectUri,
      'auth.private.redirectUri',
   );
   const storage = new ResearchTokenStorage(
      staticRouteVerifierConfig.auth.private.tokenFilePath,
   );
   const oauth2 = new OAuth2Client(clientId, clientSecret, redirectUri);
   const context = {
      mode: 'private',
      oauth2,
      redirectUri,
      storage,
      tokens:
         staticRouteVerifierConfig.auth.private.seedTokens ??
         (await storage.load()),
   } as PrivateAuthContext;

   context.http = new HttpClient(
      oauth2,
      () => context.tokens,
      async () => {
         if (!context.tokens?.refreshToken) {
            throw new Error('No refresh token available for refresh');
         }

         const refreshedTokens = await context.oauth2.refreshAccessToken(
            context.tokens.refreshToken,
         );
         context.tokens = refreshedTokens;
         await context.storage.save(refreshedTokens);
         return refreshedTokens;
      },
      {
         rawXml: true,
         timeout: staticRouteVerifierConfig.request.timeoutMs,
      },
   );

   if (!context.tokens) {
      await ensurePrivateTokens(context);
   }

   authContextCache[mode] = context;
   return context;
}

async function requestRoute(
   mode: RouteMode,
   path: string,
): Promise<RequestExecution> {
   const authContext = await getAuthContext(mode);
   const url = buildRequestUrl(path);

   if (authContext.mode === 'private') {
      await ensurePrivateTokens(authContext);
   }

   try {
      const body = await authContext.http.get<string>(path, {
         headers: {
            Accept: 'application/xml',
         },
      });

      return {
         parsedResponse: parseYahooXML(body),
         rawBody: body,
         url,
      };
   } catch (error) {
      if (error instanceof YahooApiError) {
         const rawBody =
            typeof error.response === 'string'
               ? error.response
               : JSON.stringify(error.response, null, 2);
         throw new RequestRouteError(error.message, rawBody, url);
      }

      if (error instanceof Error) {
         throw new RequestRouteError(error.message, '', url);
      }

      throw new RequestRouteError(String(error), '', url);
   }
}

function detectValueType(
   value: unknown,
):
   | 'array'
   | 'boolean'
   | 'number'
   | 'object'
   | 'string'
   | 'null'
   | 'undefined' {
   if (value === undefined) {
      return 'undefined';
   }

   if (value === null) {
      return 'null';
   }

   if (Array.isArray(value)) {
      return 'array';
   }

   switch (typeof value) {
      case 'boolean':
         return 'boolean';
      case 'number':
         return 'number';
      case 'object':
         return 'object';
      case 'string':
         return 'string';
      default:
         return 'undefined';
   }
}

function collectShapePreview(
   value: unknown,
   currentPath = '$',
   depth = 0,
   maxDepth = 3,
   lines: string[] = [],
): string[] {
   const valueType = detectValueType(value);

   if (valueType === 'array') {
      const items = value as unknown[];
      lines.push(`${currentPath}: array(length=${items.length})`);
      if (depth < maxDepth && items.length > 0) {
         collectShapePreview(
            items[0],
            `${currentPath}[0]`,
            depth + 1,
            maxDepth,
            lines,
         );
      }
      return lines;
   }

   if (valueType === 'object') {
      const objectValue = value as Record<string, unknown>;
      const keys = Object.keys(objectValue);
      lines.push(
         `${currentPath}: object(keys=${keys.join(', ') || 'none'})`,
      );
      if (depth < maxDepth) {
         for (const key of keys.slice(0, 8)) {
            collectShapePreview(
               objectValue[key],
               `${currentPath}.${key}`,
               depth + 1,
               maxDepth,
               lines,
            );
         }
      }
      return lines;
   }

   lines.push(`${currentPath}: ${valueType}`);
   return lines;
}

function hasReturnedData(response: unknown): boolean {
   if (response === null || response === undefined) {
      return false;
   }

   if (Array.isArray(response)) {
      return response.length > 0;
   }

   if (typeof response === 'object') {
      return Object.keys(response as Record<string, unknown>).length > 0;
   }

   return true;
}

function summarizeFailure(note: string): string {
   if (note.startsWith('API request failed: ')) {
      return note.slice('API request failed: '.length).slice(0, 200);
   }

   if (note.startsWith('Authentication failed.')) {
      return note.slice(0, 200);
   }

   if (note.includes('subresource')) {
      return note.slice(0, 200);
   }

   if (note.startsWith('HTTP 400')) {
      return 'HTTP 400 from Yahoo';
   }

   if (note.includes('returned no data')) {
      return 'Request returned no data';
   }

   return note.slice(0, 200);
}

function assessFailure(note: string): FailureAssessment {
   const summary = summarizeFailure(note);
   const normalizedSummary = summary.toLowerCase();

   if (
      normalizedSummary.includes('authentication failed') ||
      normalizedSummary.includes('unauthorized') ||
      normalizedSummary.includes('forbidden') ||
      normalizedSummary.includes('access token') ||
      normalizedSummary.includes('insufficient scope')
   ) {
      return {
         confidence: 'high',
         kind: 'auth-or-scope',
         nextStep:
            'Refresh credentials or widen scopes, then rerun before judging the route.',
         reason:
            'Yahoo rejected the request at the auth or access-control layer.',
      };
   }

   if (normalizedSummary.includes('returned no data')) {
      return {
         confidence: 'medium',
         kind: 'empty-data',
         nextStep:
            'Rerun with a different league, week, date, or search term before treating the route as unsupported.',
         reason:
            'The request completed, but the chosen fixtures did not produce payload data.',
      };
   }

   if (
      normalizedSummary.includes('subresource') &&
      normalizedSummary.includes('not supported')
   ) {
      return {
         confidence: 'high',
         kind: 'unsupported-route',
         nextStep:
            'Treat this as a structural route failure unless the docs show a materially different path shape.',
         reason:
            'Yahoo explicitly rejected the requested subresource chain.',
      };
   }

   if (
      normalizedSummary.includes('ids expected') ||
      normalizedSummary.includes('does not exist') ||
      normalizedSummary.includes('invalid ') ||
      normalizedSummary.includes('expected.') ||
      normalizedSummary.includes('expected,')
   ) {
      return {
         confidence: 'high',
         kind: 'invalid-test-parameters',
         nextStep:
            'Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.',
         reason:
            'Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.',
      };
   }

   return {
      confidence: 'medium',
      kind: 'unknown-failure',
      nextStep:
         'Inspect the raw dump and rerun with a narrower probe before deciding whether to demote the route.',
      reason:
         'The error message does not clearly separate route support from bad test inputs.',
   };
}

function formatFailureKind(kind: FailureKind): string {
   switch (kind) {
      case 'unsupported-route':
         return 'likely unsupported route';
      case 'invalid-test-parameters':
         return 'likely invalid test parameters';
      case 'auth-or-scope':
         return 'auth or scope issue';
      case 'empty-data':
         return 'empty-data result';
      case 'unknown-failure':
         return 'unknown failure';
   }
}

async function ensureOutputDirectory(): Promise<void> {
   await mkdir(getProbeDumpDirectory(), { recursive: true });
}

function printSuccessSummary(
   mode: RouteMode,
   path: string,
   dumpFilePath: string,
   url: string,
   response: unknown,
): void {
   console.log('Probe succeeded.');
   console.log(`Mode: ${mode}`);
   console.log(`Path: ${path}`);
   console.log(`URL: ${url}`);
   console.log(`Dump: ${dumpFilePath}`);
   console.log(
      `Returned data: ${hasReturnedData(response) ? 'yes' : 'no'}`,
   );
   console.log('Shape preview:');
   for (const line of collectShapePreview(response).slice(
      0,
      staticRouteVerifierConfig.output.shapePreviewLines,
   )) {
      console.log(`  ${line}`);
   }
}

function printFailureSummary(
   mode: RouteMode,
   path: string,
   dumpFilePath: string,
   url: string,
   note: string,
): void {
   const assessment = assessFailure(note);

   console.log('Probe failed.');
   console.log(`Mode: ${mode}`);
   console.log(`Path: ${path}`);
   console.log(`URL: ${url}`);
   console.log(`Dump: ${dumpFilePath}`);
   console.log(`Request: ${summarizeFailure(note)}`);
   console.log(
      `Classification: ${formatFailureKind(assessment.kind)} (${assessment.confidence} confidence)`,
   );
   console.log(`Why: ${assessment.reason}`);
   console.log(`Next step: ${assessment.nextStep}`);
}

async function main(): Promise<void> {
   const args = parseCliArgs(process.argv.slice(2));

   await ensureOutputDirectory();

   try {
      const execution = await requestRoute(args.mode, args.path);
      const dumpFilePath = await writeProbeDump(
         args.mode,
         args.path,
         'response',
         {
            mode: args.mode,
            path: args.path,
            rawBody: execution.rawBody,
            response: execution.parsedResponse,
            scriptDirectory: getScriptDirectoryPath(),
            url: execution.url,
         },
      );

      printSuccessSummary(
         args.mode,
         args.path,
         dumpFilePath,
         execution.url,
         execution.parsedResponse,
      );
      return;
   } catch (error) {
      const note = error instanceof Error ? error.message : String(error);
      const url =
         error instanceof RequestRouteError
            ? error.url
            : buildRequestUrl(args.path);
      const dumpFilePath = await writeProbeDump(
         args.mode,
         args.path,
         'error',
         {
            error:
               error instanceof Error
                  ? {
                       message: error.message,
                       name: error.name,
                    }
                  : { message: String(error), name: 'UnknownError' },
            mode: args.mode,
            path: args.path,
            rawBody:
               error instanceof RequestRouteError
                  ? error.rawBody
                  : undefined,
            scriptDirectory: getScriptDirectoryPath(),
            url,
         },
      );

      printFailureSummary(args.mode, args.path, dumpFilePath, url, note);
      process.exitCode = 1;
   }
}

await main();
