import { mkdir } from 'node:fs/promises';
import { argv, stdin as input, stdout as output } from 'node:process';
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
import {
   type ExpectedValueType,
   type RouteConfidence,
   type RouteDefinition,
   type RouteMode,
   type RouteSet,
   STATIC_ROUTE_SETS,
} from './static-route-definitions.js';

interface SelectedRoute {
   route: RouteDefinition;
   routeSet: RouteSet;
}

type RequestStatus = 'passed' | 'failed' | 'skipped';
type ShapeStatus = 'passed' | 'warning' | 'not-run';
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

interface RouteResult {
   confidence: RouteConfidence;
   dumpFilePath?: string;
   failureAssessment?: FailureAssessment;
   id: string;
   mode: RouteMode;
   path?: string;
   requestStatus: RequestStatus;
   routeSet: RouteSet;
   retryProbe?: RetryProbe;
   shapeStatus: ShapeStatus;
   requestNotes: string[];
   shapeNotes: string[];
   shapePreview?: string[];
}

type RecommendationAction =
   | 'keep-as-supported'
   | 'league-keys-reprobe-passed'
   | 'league-keys-reprobe-failed'
   | 'fix-test-parameters-and-rerun'
   | 'demote-or-remove'
   | 'fix-shape-expectation'
   | 'verify-auth-or-scope'
   | 'review-empty-data'
   | 'investigate-unknown-failure'
   | 'fill-config-and-rerun';

interface RecommendationBucket {
   action: RecommendationAction;
   reason: string;
   results: RouteResult[];
}

interface RequestExecution {
   parsedResponse: unknown;
   rawBody: string;
   url: string;
}

interface RetryProbe {
   attempts: RetryProbeAttempt[];
   dumpFilePath?: string;
   path: string;
   requestNote: string;
   requestStatus: 'passed' | 'failed';
   trigger: 'league-ids-expected';
}

interface RetryProbeAttempt {
   dumpFilePath?: string;
   label: 'default' | 'parameter-order-variant';
   path: string;
   requestNote: string;
   requestStatus: 'passed' | 'failed';
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

   async clear(): Promise<void> {
      await Bun.write(this.tokenPath, '');
   }
}

const authContextCache: Partial<Record<RouteMode, AuthContext>> = {};
const runDumpFolderName = new Date().toISOString().replace(/[:.]/g, '-');

let dumpFileSequence = 0;

function requireConfigValue(value: string, path: string): string {
   if (!value) {
      throw new Error(
         `Missing required config value at staticRouteVerifierConfig.${path}`,
      );
   }
   return value;
}

function getRouteContext(): Record<string, string | undefined> {
   return staticRouteVerifierConfig.routeContext;
}

function parseMode(mode: RouteMode | 'all'): RouteMode | 'all' {
   if (mode === 'public' || mode === 'private' || mode === 'all') {
      return mode;
   }

   throw new Error(
      `Unsupported config mode: ${mode}. Use public, private, or all.`,
   );
}

function parseRouteIds(routeIds: string[] | undefined): Set<string> | null {
   if (!routeIds?.length) {
      return null;
   }

   return new Set(routeIds.map((value) => value.trim()).filter(Boolean));
}

function parseCliArgs(args: string[]): { includeInvalid: boolean } {
   return {
      includeInvalid: args.includes('--include-invalid'),
   };
}

function selectRoutes(
   mode: RouteMode | 'all',
   routeIds: Set<string> | null,
   includeInvalid: boolean,
): SelectedRoute[] {
   const modes: RouteMode[] =
      mode === 'all' ? ['public', 'private'] : [mode];

   const selectedRoutes = modes.flatMap((currentMode) =>
      STATIC_ROUTE_SETS[currentMode]
         .filter((route) => (routeIds ? routeIds.has(route.id) : true))
         .map((route) => ({ route, routeSet: currentMode as RouteSet })),
   );

   if (!includeInvalid) {
      return selectedRoutes;
   }

   const invalidRoutes = STATIC_ROUTE_SETS.invalid
      .filter((route) => modes.includes(route.mode))
      .filter((route) => (routeIds ? routeIds.has(route.id) : true))
      .map((route) => ({ route, routeSet: 'invalid' as const }));

   return [...selectedRoutes, ...invalidRoutes];
}

function resolveTemplate(
   template: string,
   context: Record<string, string | undefined>,
): { path?: string; missing: string[] } {
   const missing = new Set<string>();
   const path = template.replaceAll(
      /\{\{([A-Z0-9_]+)\}\}/g,
      (_match, key) => {
         const value = context[key];
         if (!value) {
            missing.add(key);
            return `{{${key}}}`;
         }
         return value;
      },
   );

   return missing.size > 0
      ? { missing: [...missing] }
      : { path, missing: [] };
}

function getValueAtPath(root: unknown, path: string): unknown {
   return path.split('.').reduce<unknown>((current, segment) => {
      if (current === null || current === undefined) {
         return undefined;
      }

      if (Array.isArray(current)) {
         const index = Number.parseInt(segment, 10);
         return Number.isNaN(index) ? undefined : current[index];
      }

      if (typeof current !== 'object') {
         return undefined;
      }

      return (current as Record<string, unknown>)[segment];
   }, root);
}

function detectValueType(
   value: unknown,
): ExpectedValueType | 'null' | 'undefined' {
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

function summarizeValue(value: unknown): string {
   if (Array.isArray(value)) {
      return `array(length=${value.length})`;
   }

   if (value && typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>).slice(
         0,
         6,
      );
      return `object(keys=${keys.join(', ') || 'none'})`;
   }

   return JSON.stringify(value);
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

function verifyResponseShape(
   route: RouteDefinition,
   response: unknown,
): string[] {
   const notes: string[] = [];
   const expectations = route.expectations;

   for (const path of expectations?.requiredPaths ?? []) {
      const value = getValueAtPath(response, path);
      if (value === undefined) {
         notes.push(`missing required path ${path}`);
      }
   }

   for (const [path, expectedType] of Object.entries(
      expectations?.typedPaths ?? {},
   )) {
      const value = getValueAtPath(response, path);
      const actualType = detectValueType(value);
      if (actualType !== expectedType) {
         notes.push(
            `expected ${path} to be ${expectedType}, got ${actualType}`,
         );
      }
   }

   for (const path of expectations?.nonEmptyArrays ?? []) {
      const value = getValueAtPath(response, path);
      if (!Array.isArray(value) || value.length === 0) {
         notes.push(`expected ${path} to be a non-empty array`);
      }
   }

   for (const path of expectations?.samplePaths ?? []) {
      const value = getValueAtPath(response, path);
      if (value !== undefined) {
         notes.push(`sample ${path}: ${summarizeValue(value)}`);
      }
   }

   return notes;
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

function buildRequestUrl(path: string): string {
   const normalizedPath = path.startsWith('/') ? path : `/${path}`;
   const url = new URL(`${API_BASE_URL}${normalizedPath}`);
   url.searchParams.set('format', 'xml');
   return url.toString();
}

function sanitizeFileSegment(value: string): string {
   return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
}

function getRunDumpDirectory(): string {
   return `${staticRouteVerifierConfig.output.responseDumpDirPath}/${runDumpFolderName}`;
}

function getLatestRunMarkerPath(): string {
   return `${staticRouteVerifierConfig.output.responseDumpDirPath}/latest-run.txt`;
}

function createDumpFilePath(
   route: RouteDefinition,
   suffix: string,
): string {
   dumpFileSequence += 1;
   const sequence = String(dumpFileSequence).padStart(3, '0');
   const filename = `${sequence}-${sanitizeFileSegment(route.id)}-${suffix}.json`;
   return `${getRunDumpDirectory()}/${filename}`;
}

async function writeDumpFile(
   route: RouteDefinition,
   suffix: string,
   payload: unknown,
): Promise<string> {
   const dumpFilePath = createDumpFilePath(route, suffix);
   await Bun.write(dumpFilePath, JSON.stringify(payload, null, 2));
   return dumpFilePath;
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

async function runRoute(selectedRoute: SelectedRoute): Promise<RouteResult> {
   const { route, routeSet } = selectedRoute;
   const resolved = resolveTemplate(route.pathTemplate, getRouteContext());
   if (!resolved.path) {
      return {
         confidence: route.confidence,
         dumpFilePath: undefined,
         id: route.id,
         mode: route.mode,
         requestStatus: 'skipped',
         routeSet,
         shapeStatus: 'not-run',
         requestNotes: [
            `missing placeholder values: ${resolved.missing.join(', ')}`,
         ],
         shapeNotes: [],
      };
   }

   try {
      const execution = await requestRoute(route.mode, resolved.path);
      const response = execution.parsedResponse;
      const dumpFilePath = await writeDumpFile(route, 'response', {
         mode: route.mode,
         path: resolved.path,
         rawBody: execution.rawBody,
         response,
         url: execution.url,
      });

      if (!hasReturnedData(response)) {
         const requestNote = 'request succeeded but returned no data';
         return {
            confidence: route.confidence,
            dumpFilePath,
            failureAssessment: assessFailure(requestNote),
            id: route.id,
            mode: route.mode,
            path: resolved.path,
            requestStatus: 'failed',
            routeSet,
            shapeStatus: 'not-run',
            requestNotes: [requestNote],
            shapeNotes: [],
            shapePreview: collectShapePreview(response),
         };
      }

      const shapeNotes = verifyResponseShape(route, response);
      const shapeFailures = shapeNotes.filter(
         (note) => !note.startsWith('sample '),
      );

      return {
         confidence: route.confidence,
         dumpFilePath,
         id: route.id,
         mode: route.mode,
         path: resolved.path,
         requestStatus: 'passed',
         routeSet,
         shapeStatus: shapeFailures.length > 0 ? 'warning' : 'passed',
         requestNotes: ['request succeeded and returned data'],
         shapeNotes,
         shapePreview: collectShapePreview(response),
      };
   } catch (error) {
      const requestNote =
         error instanceof Error ? error.message : String(error);
      const retryProbeResult = isLeagueIdsExpectedFailure(requestNote)
         ? await runLeagueKeyRetryProbe(route, resolved.path)
         : null;
      const retryProbe = retryProbeResult ?? undefined;
      const dumpFilePath = await writeDumpFile(route, 'error', {
         error:
            error instanceof Error
               ? {
                    message: error.message,
                    name: error.name,
                 }
               : { message: String(error), name: 'UnknownError' },
         mode: route.mode,
         path: resolved.path,
         rawBody:
            error instanceof RequestRouteError ? error.rawBody : undefined,
         url: error instanceof RequestRouteError ? error.url : undefined,
      });

      return {
         confidence: route.confidence,
         dumpFilePath,
         failureAssessment: assessFailure(requestNote, retryProbe),
         id: route.id,
         mode: route.mode,
         path: resolved.path,
         requestStatus: 'failed',
         routeSet,
         retryProbe,
         shapeStatus: 'not-run',
         requestNotes: [requestNote],
         shapeNotes: [],
      };
   }
}

function printHeader(
   routes: SelectedRoute[],
   mode: RouteMode | 'all',
   includeInvalid: boolean,
): void {
   const invalidRoutes = routes.filter(
      (selectedRoute) => selectedRoute.routeSet === 'invalid',
   ).length;

   console.log('='.repeat(72));
   console.log('Static Yahoo API Route Verifier');
   console.log('='.repeat(72));
   console.log(`Mode: ${mode}`);
    console.log(`Include invalid: ${includeInvalid ? 'yes' : 'no'}`);
   console.log(`Routes selected: ${routes.length}`);
   console.log(`Invalid routes selected: ${invalidRoutes}`);
   console.log();
}

function formatRouteDescriptor(
   routeSet: RouteSet,
   mode: RouteMode,
   confidence: RouteConfidence,
): string {
   const scope = routeSet === 'invalid' ? `invalid via ${mode}` : routeSet;
   return `${scope} / ${confidence}`;
}

function printResult(result: RouteResult): void {
   const routePrefix =
      result.requestStatus === 'passed'
         ? 'PASS_ROUTE'
         : result.requestStatus === 'failed'
           ? 'FAIL_ROUTE'
           : 'SKIP_ROUTE';
   const shapePrefix =
      result.shapeStatus === 'passed'
         ? 'PASS_SHAPE'
         : result.shapeStatus === 'warning'
           ? 'WARN_SHAPE'
           : 'SKIP_SHAPE';

   console.log(
      `[${routePrefix}] [${shapePrefix}] ${result.id} (${result.routeSet === 'invalid' ? `invalid via ${result.mode}` : result.mode})`,
   );
   console.log(
      `  Route: ${formatRouteDescriptor(result.routeSet, result.mode, result.confidence)}`,
   );
   if (result.path) {
      console.log(`  Path: ${result.path}`);
   }
   if (result.dumpFilePath) {
      console.log(`  Dump: ${result.dumpFilePath}`);
   }
   for (const note of result.requestNotes) {
      console.log(`  - request: ${note}`);
   }
   if (result.failureAssessment) {
      console.log(
         `  - classification: ${formatFailureKind(result.failureAssessment.kind)} (${result.failureAssessment.confidence})`,
      );
      console.log(`  - decision: ${result.failureAssessment.nextStep}`);
   }
   if (result.retryProbe) {
      console.log(
         `  - reprobe: ${result.retryProbe.trigger} -> ${result.retryProbe.requestStatus}`,
      );
      console.log(`  - reprobe path: ${result.retryProbe.path}`);
      console.log(`  - reprobe note: ${result.retryProbe.requestNote}`);
      if (result.retryProbe.dumpFilePath) {
         console.log(`  - reprobe dump: ${result.retryProbe.dumpFilePath}`);
      }
   }
   for (const note of result.shapeNotes) {
      console.log(`  - ${note}`);
   }
   if (result.shapePreview?.length) {
      console.log('  Shape preview:');
      for (const line of result.shapePreview.slice(
         0,
         staticRouteVerifierConfig.output.shapePreviewLines,
      )) {
         console.log(`    ${line}`);
      }
   }
   console.log();
}

function printSummary(results: RouteResult[]): void {
   const routePassed = results.filter(
      (result) => result.requestStatus === 'passed',
   ).length;
   const routeFailed = results.filter(
      (result) => result.requestStatus === 'failed',
   ).length;
   const routeSkipped = results.filter(
      (result) => result.requestStatus === 'skipped',
   ).length;
   const shapePassed = results.filter(
      (result) => result.shapeStatus === 'passed',
   ).length;
   const shapeWarnings = results.filter(
      (result) => result.shapeStatus === 'warning',
   ).length;
   const shapeSkipped = results.filter(
      (result) => result.shapeStatus === 'not-run',
   ).length;

   console.log('='.repeat(72));
   console.log('Summary');
   console.log('='.repeat(72));
   console.log(`Routes passed: ${routePassed}`);
   console.log(`Routes failed: ${routeFailed}`);
   console.log(`Routes skipped: ${routeSkipped}`);
   console.log(`Shapes passed: ${shapePassed}`);
   console.log(`Shapes warned: ${shapeWarnings}`);
   console.log(`Shapes skipped: ${shapeSkipped}`);
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

   if (note.includes('missing placeholder values')) {
      return note;
   }

   return note.slice(0, 200);
}

function isLeagueIdsExpectedFailure(note: string): boolean {
   return summarizeFailure(note)
      .toLowerCase()
      .includes('league ids expected');
}

function getFallbackLeagueKey(mode: RouteMode): string | undefined {
   const context = getRouteContext();

   if (mode === 'public') {
      return context.PUBLIC_LEAGUE_KEY;
   }

   return (
      context.PRIVATE_LEAGUE_KEY ??
      context.PRIVATE_LEAGUE_KEYS?.split(',')
         .map((value) => value.trim())
         .find(Boolean)
   );
}

function buildLeagueKeyFallbackPath(
   mode: RouteMode,
   path: string,
): string | null {
   const leagueKey = getFallbackLeagueKey(mode);
   if (!leagueKey) {
      return null;
   }

   if (path.includes('league_keys=')) {
      return null;
   }

   const leaguesSegmentIndex = path.indexOf('/leagues');
   if (leaguesSegmentIndex !== -1) {
      const insertionIndex = leaguesSegmentIndex + '/leagues'.length;
      return `${path.slice(0, insertionIndex)};league_keys=${leagueKey}${path.slice(insertionIndex)}`;
   }

   const outSegmentIndex = path.indexOf(';out=');
   if (outSegmentIndex === -1) {
      return null;
   }

   const requestedOut = path
      .slice(outSegmentIndex + ';out='.length)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

   if (!requestedOut.includes('leagues')) {
      return null;
   }

   return `${path};league_keys=${leagueKey}`;
}

function buildLeagueKeyOrderVariantPath(path: string): string | null {
   if (!path.includes(';out=') || !path.includes(';league_keys=')) {
      return null;
   }

   const leagueKeysMatch = path.match(/;league_keys=([^;/]+)/);
   if (!leagueKeysMatch) {
      return null;
   }

   const leagueKeysSegment = `;league_keys=${leagueKeysMatch[1]}`;
   const pathWithoutLeagueKeys = path.replace(leagueKeysSegment, '');
   const outIndex = pathWithoutLeagueKeys.indexOf(';out=');
   if (outIndex === -1) {
      return null;
   }

   return `${pathWithoutLeagueKeys.slice(0, outIndex)}${leagueKeysSegment}${pathWithoutLeagueKeys.slice(outIndex)}`;
}

async function executeRetryProbeAttempt(
   route: RouteDefinition,
   failedPath: string,
   retryPath: string,
   label: RetryProbeAttempt['label'],
): Promise<RetryProbeAttempt> {
   try {
      const execution = await requestRoute(route.mode, retryPath);
      const hasData = hasReturnedData(execution.parsedResponse);
      const requestNote = hasData
         ? 'league-key fallback succeeded and returned data'
         : 'league-key fallback succeeded but returned no data';
      const dumpFilePath = await writeDumpFile(
         route,
         label === 'default'
            ? 'league-key-fallback-response'
            : 'league-key-fallback-order-variant-response',
         {
            fallbackPath: retryPath,
            label,
            mode: route.mode,
            originalPath: failedPath,
            rawBody: execution.rawBody,
            response: execution.parsedResponse,
            trigger: 'league-ids-expected',
            url: execution.url,
         },
      );

      return {
         dumpFilePath,
         label,
         path: retryPath,
         requestNote,
         requestStatus: 'passed',
      };
   } catch (error) {
      const requestNote =
         error instanceof Error ? error.message : String(error);
      const dumpFilePath = await writeDumpFile(
         route,
         label === 'default'
            ? 'league-key-fallback-error'
            : 'league-key-fallback-order-variant-error',
         {
            error:
               error instanceof Error
                  ? {
                       message: error.message,
                       name: error.name,
                    }
                  : { message: String(error), name: 'UnknownError' },
            fallbackPath: retryPath,
            label,
            mode: route.mode,
            originalPath: failedPath,
            rawBody:
               error instanceof RequestRouteError
                  ? error.rawBody
                  : undefined,
            trigger: 'league-ids-expected',
            url: error instanceof RequestRouteError ? error.url : undefined,
         },
      );

      return {
         dumpFilePath,
         label,
         path: retryPath,
         requestNote,
         requestStatus: 'failed',
      };
   }
}

async function runLeagueKeyRetryProbe(
   route: RouteDefinition,
   failedPath: string,
): Promise<RetryProbe | null> {
   const retryPath = buildLeagueKeyFallbackPath(route.mode, failedPath);
   if (!retryPath || retryPath === failedPath) {
      return null;
   }

   const attempts: RetryProbeAttempt[] = [];
   const defaultAttempt = await executeRetryProbeAttempt(
      route,
      failedPath,
      retryPath,
      'default',
   );
   attempts.push(defaultAttempt);

   const orderVariantPath =
      defaultAttempt.requestStatus === 'failed'
         ? buildLeagueKeyOrderVariantPath(retryPath)
         : null;

   if (orderVariantPath && orderVariantPath !== retryPath) {
      const variantAttempt = await executeRetryProbeAttempt(
         route,
         failedPath,
         orderVariantPath,
         'parameter-order-variant',
      );
      attempts.push(variantAttempt);
   }

   const successfulAttempt = attempts.find(
      (attempt) => attempt.requestStatus === 'passed',
   );
   const finalAttempt = successfulAttempt ?? attempts.at(-1);

   if (!finalAttempt) {
      return null;
   }

   return {
      attempts,
      dumpFilePath: finalAttempt.dumpFilePath,
      path: finalAttempt.path,
      requestNote: finalAttempt.requestNote,
      requestStatus: finalAttempt.requestStatus,
      trigger: 'league-ids-expected',
   };
}

function assessFailure(
   note: string,
   retryProbe?: RetryProbe,
): FailureAssessment {
   const summary = summarizeFailure(note);
   const normalizedSummary = summary.toLowerCase();

   if (isLeagueIdsExpectedFailure(note)) {
      if (retryProbe?.requestStatus === 'passed') {
         return {
            confidence: 'high',
            kind: 'invalid-test-parameters',
            nextStep:
               'Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.',
            reason:
               'The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.',
         };
      }

      if (retryProbe?.requestStatus === 'failed') {
         const retrySummary = summarizeFailure(retryProbe.requestNote);
         const normalizedRetrySummary = retrySummary.toLowerCase();

         if (
            normalizedRetrySummary.includes('subresource') &&
            normalizedRetrySummary.includes('not supported')
         ) {
            return {
               confidence: 'high',
               kind: 'unsupported-route',
               nextStep:
                  'Demote this route family. Even the explicit league-key reprobe was rejected as unsupported.',
               reason:
                  'Yahoo still rejected the route after replacing the game-derived chain with a concrete league key.',
            };
         }

         return {
            confidence: 'medium',
            kind: 'invalid-test-parameters',
            nextStep:
               'Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.',
            reason:
               'The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.',
         };
      }
   }

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

function toReportDumpLink(dumpFilePath: string | undefined): string | null {
   if (!dumpFilePath) {
      return null;
   }

   if (dumpFilePath.startsWith('research/')) {
      return dumpFilePath.slice('research/'.length);
   }

   return dumpFilePath;
}

function formatStatusLabel(result: RouteResult): string {
   const routeLabel =
      result.requestStatus === 'passed'
         ? 'route passed'
         : result.requestStatus === 'failed'
           ? 'route failed'
           : 'route skipped';
   const shapeLabel =
      result.shapeStatus === 'passed'
         ? 'shape passed'
         : result.shapeStatus === 'warning'
           ? 'shape warning'
           : 'shape not run';

   return `${routeLabel}; ${shapeLabel}`;
}

function formatResultBlock(result: RouteResult): string[] {
   const lines = [`#### ${result.id}`, ''];
   const dumpLink = toReportDumpLink(result.dumpFilePath);

   lines.push(`- Status: ${formatStatusLabel(result)}`);
   lines.push(
      `- Route: ${formatRouteDescriptor(result.routeSet, result.mode, result.confidence)}`,
   );
   lines.push(`- Path: ${result.path ?? '(missing path)'}`);

   if (dumpLink) {
      lines.push(`- Dump: [response file](${dumpLink})`);
   }

   if (result.requestNotes.length > 0) {
      const [firstRequestNote] = result.requestNotes;
      if (firstRequestNote) {
         lines.push(`- Request: ${summarizeFailure(firstRequestNote)}`);
      }
   }

   if (result.failureAssessment) {
      lines.push(
         `- Classification: ${formatFailureKind(result.failureAssessment.kind)} (${result.failureAssessment.confidence} confidence)`,
      );
      lines.push(`- Why: ${result.failureAssessment.reason}`);
      lines.push(`- Next step: ${result.failureAssessment.nextStep}`);
   }

   if (result.retryProbe) {
      lines.push(
         `- Reprobe: ${result.retryProbe.trigger} -> ${result.retryProbe.requestStatus}`,
      );
      lines.push(`- Reprobe path: ${result.retryProbe.path}`);
      lines.push(
         `- Reprobe note: ${summarizeFailure(result.retryProbe.requestNote)}`,
      );
      if (result.retryProbe.dumpFilePath) {
         const retryDumpLink = toReportDumpLink(
            result.retryProbe.dumpFilePath,
         );
         if (retryDumpLink) {
            lines.push(`- Reprobe dump: [response file](${retryDumpLink})`);
         }
      }

      if (result.retryProbe.attempts.length > 1) {
         for (const attempt of result.retryProbe.attempts) {
            lines.push(
               `- Reprobe attempt (${attempt.label}): ${attempt.requestStatus}`,
            );
            lines.push(`- Reprobe attempt path: ${attempt.path}`);
            lines.push(
               `- Reprobe attempt note: ${summarizeFailure(attempt.requestNote)}`,
            );
            if (attempt.dumpFilePath) {
               const attemptDumpLink = toReportDumpLink(
                  attempt.dumpFilePath,
               );
               if (attemptDumpLink) {
                  lines.push(
                     `- Reprobe attempt dump: [response file](${attemptDumpLink})`,
                  );
               }
            }
         }
      }
   }

   if (result.shapeStatus === 'warning' && result.shapeNotes.length > 0) {
      const [firstShapeNote] = result.shapeNotes;
      if (firstShapeNote) {
         lines.push(`- Shape: ${firstShapeNote}`);
      }
   }

   return [...lines, ''];
}

function classifyResults(results: RouteResult[]): RecommendationBucket[] {
   const buckets: RecommendationBucket[] = [
      {
         action: 'keep-as-supported',
         reason:
            'Route succeeded live. Keep as supported in builder typing or docs.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'passed' &&
               result.shapeStatus === 'passed',
         ),
      },
      {
         action: 'fix-shape-expectation',
         reason:
            'Route succeeded live but current shape expectation does not match parsed output.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'passed' &&
               result.shapeStatus === 'warning',
         ),
      },
      {
         action: 'league-keys-reprobe-passed',
         reason:
            'These routes initially failed with league ids expected, but the same path shape succeeded once league_keys was injected.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.retryProbe?.requestStatus === 'passed',
         ),
      },
      {
         action: 'league-keys-reprobe-failed',
         reason:
            'These routes still failed after injecting league_keys. Review the reprobe attempts before treating them as supported.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.retryProbe?.requestStatus === 'failed',
         ),
      },
      {
         action: 'fix-test-parameters-and-rerun',
         reason:
            'Yahoo rejected the supplied ids or filters, so the route may still be real but the probe needs better concrete parameters.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.failureAssessment?.kind ===
                  'invalid-test-parameters' &&
               !result.retryProbe,
         ),
      },
      {
         action: 'demote-or-remove',
         reason:
            'Yahoo explicitly rejected the route shape or subresource chain. Demote docs confidence or remove from the safe builder surface.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.failureAssessment?.kind === 'unsupported-route',
         ),
      },
      {
         action: 'verify-auth-or-scope',
         reason:
            'These failures are blocked by auth or access-control, so route support is still unknown until credentials are corrected.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.failureAssessment?.kind === 'auth-or-scope',
         ),
      },
      {
         action: 'review-empty-data',
         reason:
            'The route returned an empty payload, which is weaker evidence than an explicit rejection and usually needs a better fixture set.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.failureAssessment?.kind === 'empty-data',
         ),
      },
      {
         action: 'investigate-unknown-failure',
         reason:
            'These failures are not yet distinguishable from the current Yahoo error text. Inspect the dump before making support decisions.',
         results: results.filter(
            (result) =>
               result.requestStatus === 'failed' &&
               result.failureAssessment?.kind === 'unknown-failure',
         ),
      },
      {
         action: 'fill-config-and-rerun',
         reason:
            'Route was not exercised because required concrete keys were missing from config.',
         results: results.filter(
            (result) => result.requestStatus === 'skipped',
         ),
      },
   ];

   return buckets.filter((bucket) => bucket.results.length > 0);
}

function buildActionableReport(
   results: RouteResult[],
   mode: RouteMode | 'all',
   includeInvalid: boolean,
): string {
   const routePassed = results.filter(
      (result) => result.requestStatus === 'passed',
   ).length;
   const routeFailed = results.filter(
      (result) => result.requestStatus === 'failed',
   ).length;
   const routeSkipped = results.filter(
      (result) => result.requestStatus === 'skipped',
   ).length;
   const shapeWarnings = results.filter(
      (result) => result.shapeStatus === 'warning',
   ).length;
   const unsupportedFailures = results.filter(
      (result) => result.failureAssessment?.kind === 'unsupported-route',
   ).length;
   const invalidParameterFailures = results.filter(
      (result) =>
         result.failureAssessment?.kind === 'invalid-test-parameters',
   ).length;
   const leagueKeysReprobePassed = results.filter(
      (result) => result.retryProbe?.requestStatus === 'passed',
   ).length;
   const leagueKeysReprobeFailed = results.filter(
      (result) => result.retryProbe?.requestStatus === 'failed',
   ).length;
   const authOrScopeFailures = results.filter(
      (result) => result.failureAssessment?.kind === 'auth-or-scope',
   ).length;
   const emptyDataFailures = results.filter(
      (result) => result.failureAssessment?.kind === 'empty-data',
   ).length;
   const unknownFailures = results.filter(
      (result) => result.failureAssessment?.kind === 'unknown-failure',
   ).length;
   const invalidRoutesSelected = results.filter(
      (result) => result.routeSet === 'invalid',
   ).length;

   const lines: string[] = [
      '# Actionable Route Report',
      '',
      `- Mode: ${mode}`,
      `- Invalid definitions included: ${includeInvalid ? 'yes' : 'no'}`,
      `- Routes selected: ${results.length}`,
      `- Invalid routes selected: ${invalidRoutesSelected}`,
      `- Routes passed: ${routePassed}`,
      `- Routes failed: ${routeFailed}`,
      `- Routes skipped: ${routeSkipped}`,
      `- Shape warnings: ${shapeWarnings}`,
      '',
      '## Failure Split',
      '',
      `- Likely unsupported routes: ${unsupportedFailures}`,
      `- Likely bad test parameters or fixtures: ${invalidParameterFailures}`,
      `- league_keys reprobe passed: ${leagueKeysReprobePassed}`,
      `- league_keys reprobe still failed: ${leagueKeysReprobeFailed}`,
      `- Auth or scope blockers: ${authOrScopeFailures}`,
      `- Empty-data probes: ${emptyDataFailures}`,
      `- Unknown failures: ${unknownFailures}`,
      '',
      '## Implementation Guidance',
      '',
   ];

   for (const bucket of classifyResults(results)) {
      lines.push(`### ${bucket.action}`);
      lines.push('');
      lines.push(bucket.reason);
      lines.push('');
      for (const result of bucket.results) {
         lines.push(...formatResultBlock(result));
      }
   }

   const explicitFailures = results.filter(
      (result) =>
         result.requestStatus === 'failed' &&
         result.confidence === 'explicit',
   );
   const explicitUnsupportedFailures = explicitFailures.filter(
      (result) => result.failureAssessment?.kind === 'unsupported-route',
   );
   const explicitParameterFailures = explicitFailures.filter(
      (result) =>
         result.failureAssessment?.kind === 'invalid-test-parameters',
   );
   const explicitParameterFailuresWithPassedReprobe =
      explicitParameterFailures.filter(
         (result) => result.retryProbe?.requestStatus === 'passed',
      );
   const explicitParameterFailuresWithFailedReprobe =
      explicitParameterFailures.filter(
         (result) => result.retryProbe?.requestStatus === 'failed',
      );
   const explicitParameterFailuresWithoutReprobe =
      explicitParameterFailures.filter((result) => !result.retryProbe);
   const composedPasses = results.filter(
      (result) =>
         result.requestStatus === 'passed' &&
         result.confidence === 'composed',
   );

   lines.push('## Decision Summary');
   lines.push('');
   lines.push(
      `- Structural failures likely unsupported by Yahoo: ${unsupportedFailures}`,
   );
   lines.push(
      `- Failures likely caused by test parameters or stale fixtures: ${invalidParameterFailures}`,
   );
   lines.push(
      `- league_keys reprobes that validated the original path shape: ${leagueKeysReprobePassed}`,
   );
   lines.push(
      `- league_keys reprobes that still failed after injection: ${leagueKeysReprobeFailed}`,
   );
   lines.push(
      `- Explicit failures to review for doc mismatch: ${explicitFailures.length}`,
   );
   lines.push(
      `- Explicit failures that still need better parameters before judgment: ${explicitParameterFailures.length}`,
   );
   lines.push(
      `- Explicit failures that look structurally unsupported: ${explicitUnsupportedFailures.length}`,
   );
   lines.push(
      `- Composed passes that may justify promotion into builder support: ${composedPasses.length}`,
   );

   if (explicitUnsupportedFailures.length > 0) {
      lines.push('');
      lines.push('### Explicit Unsupported Failures');
      lines.push('');
      for (const result of explicitUnsupportedFailures) {
         lines.push(...formatResultBlock(result));
      }
   }

   if (explicitParameterFailures.length > 0) {
      lines.push('');
      lines.push('### Explicit Parameter-Dependent Failures');
      lines.push('');
      if (explicitParameterFailuresWithPassedReprobe.length > 0) {
         lines.push('#### league_keys reprobe passed');
         lines.push('');
         for (const result of explicitParameterFailuresWithPassedReprobe) {
            lines.push(...formatResultBlock(result));
         }
      }

      if (explicitParameterFailuresWithFailedReprobe.length > 0) {
         lines.push('#### league_keys reprobe still failed');
         lines.push('');
         for (const result of explicitParameterFailuresWithFailedReprobe) {
            lines.push(...formatResultBlock(result));
         }
      }

      if (explicitParameterFailuresWithoutReprobe.length > 0) {
         lines.push('#### No league_keys reprobe applied');
         lines.push('');
         for (const result of explicitParameterFailuresWithoutReprobe) {
            lines.push(...formatResultBlock(result));
         }
      }
   }

   if (composedPasses.length > 0) {
      lines.push('');
      lines.push('### Composed Passes');
      lines.push('');
      for (const result of composedPasses) {
         lines.push(...formatResultBlock(result));
      }
   }

   return lines.join('\n');
}

async function writeActionableReport(
   results: RouteResult[],
   mode: RouteMode | 'all',
   includeInvalid: boolean,
): Promise<void> {
   const report = buildActionableReport(results, mode, includeInvalid);
   const reportPath = staticRouteVerifierConfig.output.reportFilePath;
   await Bun.write(reportPath, report);
   console.log();
   console.log(`Actionable report written to ${reportPath}`);
}

async function ensureOutputDirectories(): Promise<void> {
   await Bun.write(
      `${staticRouteVerifierConfig.output.responseDumpDirPath}/.gitkeep`,
      '',
   );
   await mkdir(getRunDumpDirectory(), { recursive: true });
   await Bun.write(getLatestRunMarkerPath(), `${getRunDumpDirectory()}\n`);
}

async function main(): Promise<void> {
   const cliArgs = parseCliArgs(argv.slice(2));
   const mode = parseMode(staticRouteVerifierConfig.selection.mode);
   const routeIds = parseRouteIds(
      staticRouteVerifierConfig.selection.routeIds,
   );
   const routes = selectRoutes(mode, routeIds, cliArgs.includeInvalid);

   if (routes.length === 0) {
      throw new Error(
         'No routes selected. Check staticRouteVerifierConfig.selection.',
      );
   }

   await ensureOutputDirectories();
   printHeader(routes, mode, cliArgs.includeInvalid);

   const results: RouteResult[] = [];
   for (const route of routes) {
      const result = await runRoute(route);
      results.push(result);
      printResult(result);
   }

   printSummary(results);
   await writeActionableReport(results, mode, cliArgs.includeInvalid);

   if (results.some((result) => result.requestStatus === 'failed')) {
      process.exitCode = 1;
   }
}

await main();
