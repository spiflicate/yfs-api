import { mkdir } from 'node:fs/promises';
import { dirname, relative } from 'node:path';
import {
   redactFixtureKeys,
   sanitizeReportFacts,
   sanitizeReportNotes,
} from './report-sanitization.js';
import {
   buildRequestUrl,
   RequestRouteError,
   requestRoute,
} from './research-http.js';
import {
   buildScenarioContext,
   instantiateScenarios,
   type PlaceholderName,
   parseSports,
   type RouteScenario,
   requiredFixturesForSport,
   type SelectedRoute,
   type SportProfile,
   validateRouteDefinitions,
   verifyKeyFixtures,
} from './route-model.js';
import { staticRouteVerifierConfig } from './static-route-config.js';
import {
   ALL_ROUTE_DEFINITIONS,
   type ExpectedValueType,
   type FailureKind,
   type RouteDefinition,
   type RouteMode,
   type RouteSet,
   type SportCode,
   STATIC_ROUTE_SETS,
} from './static-route-definitions.js';

type RequestStatus =
   | 'expected-rejection'
   | 'failed'
   | 'fixture-unavailable'
   | 'passed';
type ShapeStatus = 'not-run' | 'passed' | 'warning';
interface CliOptions {
   dryRun: boolean;
   includeInvalid: boolean;
   mode: RouteMode | 'all';
   nonInteractive: boolean;
   requireComplete: boolean;
   routeIds: Set<string> | null;
   sports: SportCode[];
   strictShapes: boolean;
}

interface FailureAssessment {
   confidence: 'high' | 'medium';
   kind: FailureKind;
   reason: string;
}

interface DiscoveryRecord {
   facts: Record<string, string[]>;
   mode: RouteMode;
   notes: string[];
   path: string;
   sport: SportCode;
   status: 'failed' | 'passed';
}

interface RouteResult {
   confidence: RouteDefinition['confidence'];
   dumpFilePath?: string;
   facts: Record<string, string[]>;
   failure?: FailureAssessment;
   id: string;
   label: string;
   missingFixtures: PlaceholderName[];
   mode: RouteMode;
   notes: string[];
   path?: string;
   provenance: RouteDefinition['provenance'];
   requestStatus: RequestStatus;
   routeSet: RouteSet;
   shapeNotes: string[];
   shapeStatus: ShapeStatus;
   sport: SportCode;
}

const runId = new Date().toISOString().replace(/[:.]/g, '-');
let dumpSequence = 0;

function printUsage(): never {
   console.error(
      'Usage: bun run research:routes -- [--mode public|private|all] [--sports nfl,mlb,nba,nhl] [--route-ids id1,id2] [--dry-run] [--strict-shapes] [--allow-incomplete] [--include-invalid] [--non-interactive]',
   );
   process.exit(1);
}

function parseMode(value: string): RouteMode | 'all' {
   if (value === 'public' || value === 'private' || value === 'all') {
      return value;
   }
   throw new Error(`Unsupported mode: ${value}`);
}

function parseCliArgs(args: string[]): CliOptions {
   const options: CliOptions = {
      dryRun: false,
      includeInvalid: false,
      mode: staticRouteVerifierConfig.selection.mode,
      nonInteractive: false,
      requireComplete: true,
      routeIds: staticRouteVerifierConfig.selection.routeIds
         ? new Set(staticRouteVerifierConfig.selection.routeIds)
         : null,
      sports: staticRouteVerifierConfig.selection.sports,
      strictShapes: false,
   };

   for (let index = 0; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === '--dry-run') options.dryRun = true;
      else if (arg === '--include-invalid') options.includeInvalid = true;
      else if (arg === '--strict-shapes') options.strictShapes = true;
      else if (arg === '--allow-incomplete')
         options.requireComplete = false;
      else if (arg === '--require-complete') options.requireComplete = true;
      else if (arg === '--non-interactive') options.nonInteractive = true;
      else if (arg === '--mode') {
         const value = args[index + 1];
         if (!value) printUsage();
         options.mode = parseMode(value);
         index += 1;
      } else if (arg === '--sports') {
         const value = args[index + 1];
         if (!value) printUsage();
         options.sports = parseSports(value);
         index += 1;
      } else if (arg === '--route-ids') {
         const value = args[index + 1];
         if (!value) printUsage();
         options.routeIds = new Set(
            value
               .split(',')
               .map((id) => id.trim())
               .filter(Boolean),
         );
         if (!options.routeIds.size) {
            throw new Error('At least one route id is required');
         }
         index += 1;
      } else if (arg) {
         printUsage();
      }
   }

   return options;
}

function selectRoutes(options: CliOptions): SelectedRoute[] {
   const modes: RouteMode[] =
      options.mode === 'all' ? ['public', 'private'] : [options.mode];
   const selected = modes.flatMap((mode) =>
      STATIC_ROUTE_SETS[mode]
         .filter((route) =>
            options.routeIds ? options.routeIds.has(route.id) : true,
         )
         .map((route) => ({ route, routeSet: mode as RouteSet })),
   );

   if (options.includeInvalid) {
      selected.push(
         ...STATIC_ROUTE_SETS.invalid
            .filter((route) => modes.includes(route.mode))
            .filter((route) =>
               options.routeIds ? options.routeIds.has(route.id) : true,
            )
            .map((route) => ({ route, routeSet: 'invalid' as const })),
      );
   }

   if (options.routeIds) {
      const known = new Set(selected.map(({ route }) => route.id));
      const unknown = [...options.routeIds].filter((id) => !known.has(id));
      if (unknown.length) {
         throw new Error(
            `Unknown or unselected route ids: ${unknown.join(', ')}`,
         );
      }
   }

   if (!selected.length) {
      throw new Error('Route selection produced no scenarios');
   }

   return selected;
}

function getValueAtPath(root: unknown, path: string): unknown {
   return path.split('.').reduce<unknown>((current, segment) => {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current)) {
         const index = Number.parseInt(segment, 10);
         return Number.isNaN(index) ? undefined : current[index];
      }
      if (typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[segment];
   }, root);
}

function detectValueType(
   value: unknown,
): ExpectedValueType | 'null' | 'undefined' {
   if (value === undefined) return 'undefined';
   if (value === null) return 'null';
   if (Array.isArray(value)) return 'array';
   return typeof value === 'function' || typeof value === 'symbol'
      ? 'undefined'
      : (typeof value as ExpectedValueType);
}

function verifyResponseShape(
   route: RouteDefinition,
   response: unknown,
): string[] {
   const notes: string[] = [];
   for (const path of route.expectations?.requiredPaths ?? []) {
      if (getValueAtPath(response, path) === undefined) {
         notes.push(`missing required path ${path}`);
      }
   }
   for (const [path, expected] of Object.entries(
      route.expectations?.typedPaths ?? {},
   )) {
      const actual = detectValueType(getValueAtPath(response, path));
      if (actual !== expected) {
         notes.push(`expected ${path} to be ${expected}, got ${actual}`);
      }
   }
   for (const path of route.expectations?.nonEmptyArrays ?? []) {
      const value = getValueAtPath(response, path);
      if (!Array.isArray(value) || !value.length) {
         notes.push(`expected ${path} to be a non-empty array`);
      }
   }
   return notes;
}

function hasShapeExpectations(route: RouteDefinition): boolean {
   const expectations = route.expectations;
   return Boolean(
      expectations &&
         ((expectations.requiredPaths?.length ?? 0) > 0 ||
            Object.keys(expectations.typedPaths ?? {}).length > 0 ||
            (expectations.nonEmptyArrays?.length ?? 0) > 0),
   );
}

function hasReturnedData(response: unknown): boolean {
   if (response === null || response === undefined) return false;
   if (Array.isArray(response)) return response.length > 0;
   if (typeof response === 'object')
      return Object.keys(response).length > 0;
   return true;
}

function emptyRequiredArrays(
   route: RouteDefinition,
   response: unknown,
): string[] {
   if (route.allowEmpty) return [];
   const typedArrays = Object.entries(route.expectations?.typedPaths ?? {})
      .filter(([, type]) => type === 'array')
      .map(([path]) => path);
   const paths = new Set([
      ...typedArrays,
      ...(route.expectations?.nonEmptyArrays ?? []),
   ]);
   return [...paths].filter((path) => {
      const value = getValueAtPath(response, path);
      return Array.isArray(value) && value.length === 0;
   });
}

function collectValuesByKey(
   value: unknown,
   keys: ReadonlySet<string>,
   target: Record<string, string[]> = {},
): Record<string, string[]> {
   if (Array.isArray(value)) {
      for (const item of value) collectValuesByKey(item, keys, target);
      return target;
   }
   if (!value || typeof value !== 'object') return target;

   for (const [key, child] of Object.entries(value)) {
      if (
         keys.has(key) &&
         (typeof child === 'string' || typeof child === 'number')
      ) {
         target[key] ??= [];
         const values = target[key];
         const text = String(child);
         if (!values.includes(text) && values.length < 10)
            values.push(text);
      }
      collectValuesByKey(child, keys, target);
   }
   return target;
}

const FACT_KEYS = new Set([
   'code',
   'coverageType',
   'date',
   'gameKey',
   'leagueKey',
   'playerKey',
   'season',
   'teamKey',
   'transactionKey',
   'week',
]);

function extractFacts(response: unknown): Record<string, string[]> {
   const facts = collectValuesByKey(response, FACT_KEYS);
   const add = (key: string, value: unknown): void => {
      if (typeof value === 'string' || typeof value === 'number') {
         facts[key] = [String(value)];
      }
   };
   const object =
      response && typeof response === 'object'
         ? (response as Record<string, unknown>)
         : {};
   const game =
      object.game && typeof object.game === 'object'
         ? (object.game as Record<string, unknown>)
         : undefined;
   const league =
      object.league && typeof object.league === 'object'
         ? (object.league as Record<string, unknown>)
         : undefined;

   if (game) {
      add('gameName', game.name);
      add(
         'gameWeeksCount',
         Array.isArray(game.gameWeeks) ? game.gameWeeks.length : undefined,
      );
      const statCategories = game.statCategories as
         | Record<string, unknown>
         | undefined;
      add(
         'statCategoriesCount',
         Array.isArray(statCategories?.stats)
            ? statCategories.stats.length
            : undefined,
      );
      add(
         'positionTypesCount',
         Array.isArray(game.positionTypes)
            ? game.positionTypes.length
            : undefined,
      );
      add(
         'rosterPositionsCount',
         Array.isArray(game.rosterPositions)
            ? game.rosterPositions.length
            : undefined,
      );
      const dates = game.dates as Record<string, unknown> | undefined;
      const seasonDates = dates?.season as
         | Record<string, unknown>
         | undefined;
      add('seasonStartDate', seasonDates?.startDate);
      add('seasonEndDate', seasonDates?.endDate);
   }

   if (league) {
      add('leagueName', league.name);
      add('rosterType', league.rosterType);
      add('scoringType', league.scoringType);
      add(
         'transactionsCount',
         Array.isArray(league.transactions)
            ? league.transactions.length
            : undefined,
      );
      const draftResults = league.draftResults as
         | Record<string, unknown>
         | undefined;
      add(
         'draftResultsCount',
         Array.isArray(draftResults?.draftResult)
            ? draftResults.draftResult.length
            : undefined,
      );
   }

   return facts;
}

function assessFailure(note: string): FailureAssessment {
   const normalized = note.toLowerCase();
   if (
      normalized.includes('unauthorized') ||
      normalized.includes('forbidden') ||
      normalized.includes('access token') ||
      normalized.includes('authentication') ||
      normalized.includes('authorization is required')
   ) {
      return {
         confidence: 'high',
         kind: 'auth-or-scope',
         reason: 'Yahoo rejected authentication, authorization, or scope.',
      };
   }
   if (
      normalized.includes('too many requests') ||
      normalized.includes('429') ||
      normalized.includes('timeout') ||
      normalized.includes('timed out') ||
      normalized.includes('503') ||
      normalized.includes('temporary problem')
   ) {
      return {
         confidence: 'high',
         kind: 'rate-limited-or-transient',
         reason:
            'The request hit a rate limit, timeout, or transient service error.',
      };
   }
   if (
      normalized.includes('subresource') &&
      normalized.includes('not supported')
   ) {
      return {
         confidence: 'high',
         kind: 'unsupported-route',
         reason: 'Yahoo explicitly rejected the subresource path.',
      };
   }
   if (
      normalized.includes('ids expected') ||
      normalized.includes('does not exist') ||
      normalized.includes('invalid') ||
      normalized.includes('not found')
   ) {
      return {
         confidence: 'high',
         kind: 'fixture-invalid',
         reason:
            'Yahoo rejected a concrete key, period, or filter fixture.',
      };
   }
   if (
      normalized.includes('returned no data') ||
      normalized.includes('required arrays were empty')
   ) {
      return {
         confidence: 'medium',
         kind: 'empty-data',
         reason: 'The route responded but the selected fixture was empty.',
      };
   }
   if (
      normalized.includes('parse') ||
      normalized.includes('unexpected token')
   ) {
      return {
         confidence: 'medium',
         kind: 'parser-failure',
         reason:
            'The response could not be interpreted by the repository parser.',
      };
   }
   return {
      confidence: 'medium',
      kind: 'unknown-failure',
      reason:
         'The error does not isolate route support from fixture behavior.',
   };
}

function cloneProfiles(sports: SportCode[]): SportProfile[] {
   return staticRouteVerifierConfig.profiles
      .filter((profile) => sports.includes(profile.code))
      .map((profile) => ({
         ...profile,
         context: { ...profile.context },
         privateContext: { ...profile.privateContext },
         publicContext: { ...profile.publicContext },
      }));
}

function firstFact(
   facts: Record<string, string[]>,
   key: string,
): string | undefined {
   return facts[key]?.[0];
}

function valuesForSport(
   facts: Record<string, string[]>,
   key: string,
   gameKey?: string,
): string[] {
   const values = facts[key] ?? [];
   return gameKey
      ? values.filter(
           (value) => value.startsWith(`${gameKey}.`) || value === gameKey,
        )
      : values;
}

async function discoverProfile(
   profile: SportProfile,
   mode: RouteMode | 'all',
   publicFixtures: ReadonlySet<PlaceholderName>,
   privateFixtures: ReadonlySet<PlaceholderName>,
): Promise<DiscoveryRecord[]> {
   const records: DiscoveryRecord[] = [];
   const discoveryMode: RouteMode = 'public';
   profile.publicContext ??= {};
   const publicContext = profile.publicContext;

   const publicContextBeforeDiscovery = buildScenarioContext(
      profile,
      'public',
   );
   const privateContextBeforeDiscovery = buildScenarioContext(
      profile,
      'private',
   );
   const needsGameDiscovery = [
      'GAME_KEY',
      'LEAGUE_KEY',
      'LEAGUE_KEYS',
      'PLAYER_KEY',
      'PLAYER_KEYS',
      'SEASON',
      'TEAM_KEY',
      'TEAM_KEYS',
      'TRANSACTION_KEY',
      'TRANSACTION_KEYS',
   ].some(
      (fixture) =>
         (publicFixtures.has(fixture as PlaceholderName) &&
            !publicContextBeforeDiscovery[fixture as PlaceholderName]) ||
         (privateFixtures.has(fixture as PlaceholderName) &&
            !privateContextBeforeDiscovery[fixture as PlaceholderName]),
   );

   if (needsGameDiscovery)
      try {
         const execution = await requestRoute(
            discoveryMode,
            `/game/${profile.code}`,
         );
         const facts = extractFacts(execution.parsedResponse);
         const gameKey = firstFact(facts, 'gameKey');
         const season = firstFact(facts, 'season');
         if (gameKey) profile.context.GAME_KEY ??= gameKey;
         if (season) profile.context.SEASON ??= season;
         const complete = Boolean(gameKey && season);
         if (
            gameKey &&
            publicContext.LEAGUE_KEY &&
            !publicContext.LEAGUE_KEY.startsWith(`${gameKey}.`)
         ) {
            delete publicContext.LEAGUE_KEY;
            delete publicContext.LEAGUE_KEYS;
            delete publicContext.TEAM_KEY;
            delete publicContext.TEAM_KEYS;
         }
         records.push({
            facts,
            mode: discoveryMode,
            notes: [
               complete
                  ? 'current game metadata discovered'
                  : 'game discovery omitted required gameKey or season facts',
            ],
            path: `/game/${profile.code}`,
            sport: profile.code,
            status: complete ? 'passed' : 'failed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: discoveryMode,
            notes: [error instanceof Error ? error.message : String(error)],
            path: `/game/${profile.code}`,
            sport: profile.code,
            status: 'failed',
         });
      }

   if (
      mode !== 'private' &&
      (publicFixtures.has('PLAYER_KEY') ||
         publicFixtures.has('PLAYER_KEYS')) &&
      !publicContext.PLAYER_KEY
   ) {
      const search = profile.context.PLAYER_SEARCH;
      const path = `/game/${profile.code}/players;search=${encodeURIComponent(search ?? '')};count=2`;
      try {
         const execution = await requestRoute('public', path);
         const facts = extractFacts(execution.parsedResponse);
         const playerKeys = valuesForSport(
            facts,
            'playerKey',
            profile.context.GAME_KEY,
         );
         if (playerKeys[0]) {
            publicContext.PLAYER_KEY = playerKeys[0];
            publicContext.PLAYER_KEYS = playerKeys.slice(0, 2).join(',');
         }
         records.push({
            facts,
            mode: 'public',
            notes: [
               playerKeys.length
                  ? 'public player fixtures discovered through observed game search behavior'
                  : 'game search returned no player fixture',
            ],
            path,
            sport: profile.code,
            status: playerKeys.length ? 'passed' : 'failed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: 'public',
            notes: [error instanceof Error ? error.message : String(error)],
            path,
            sport: profile.code,
            status: 'failed',
         });
      }
   }

   if (
      mode !== 'private' &&
      publicContext.LEAGUE_KEY &&
      publicFixtures.has('LEAGUE_KEYS')
   ) {
      publicContext.LEAGUE_KEYS ??= publicContext.LEAGUE_KEY;
   }

   if (
      mode !== 'private' &&
      publicContext.LEAGUE_KEY &&
      (publicFixtures.has('TEAM_KEY') || publicFixtures.has('TEAM_KEYS'))
   ) {
      if (!publicContext.TEAM_KEY) {
         const path = `/league/${publicContext.LEAGUE_KEY}/teams`;
         try {
            const execution = await requestRoute('public', path);
            const facts = extractFacts(execution.parsedResponse);
            const teamKeys = valuesForSport(
               facts,
               'teamKey',
               profile.context.GAME_KEY,
            );
            if (teamKeys[0]) {
               publicContext.TEAM_KEY = teamKeys[0];
               publicContext.TEAM_KEYS = teamKeys.slice(0, 2).join(',');
            }
            records.push({
               facts,
               mode: 'public',
               notes: [
                  teamKeys.length
                     ? 'public team fixtures discovered from configured league'
                     : 'configured public league returned no team fixture',
               ],
               path,
               sport: profile.code,
               status: teamKeys.length ? 'passed' : 'failed',
            });
         } catch (error) {
            records.push({
               facts: {},
               mode: 'public',
               notes: [
                  error instanceof Error ? error.message : String(error),
               ],
               path,
               sport: profile.code,
               status: 'failed',
            });
         }
      }
   }

   if (mode === 'public') return records;

   profile.privateContext ??= {};
   const privateContext = profile.privateContext;
   if (
      privateFixtures.has('DATE') &&
      profile.code !== 'nfl' &&
      !privateContext.DATE
   ) {
      const path = `/game/${profile.code}/dates`;
      try {
         const execution = await requestRoute('public', path);
         const facts = extractFacts(execution.parsedResponse);
         const startDate = firstFact(facts, 'seasonStartDate');
         const endDate = firstFact(facts, 'seasonEndDate');
         const today = new Date().toISOString().slice(0, 10);
         if (startDate && endDate) {
            privateContext.DATE =
               today < startDate
                  ? startDate
                  : today > endDate
                    ? endDate
                    : today;
         }
         records.push({
            facts,
            mode: 'public',
            notes: [
               privateContext.DATE
                  ? 'daily coverage date derived within season bounds'
                  : 'game dates did not provide season bounds',
            ],
            path,
            sport: profile.code,
            status: 'passed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: 'public',
            notes: [error instanceof Error ? error.message : String(error)],
            path,
            sport: profile.code,
            status: 'failed',
         });
      }
   }
   const gameKey = profile.context.GAME_KEY;
   const effectivePrivateContext = buildScenarioContext(profile, 'private');
   const needsPrivateTeam = [
      'LEAGUE_KEY',
      'LEAGUE_KEYS',
      'PLAYER_KEY',
      'PLAYER_KEYS',
      'TEAM_KEY',
      'TEAM_KEYS',
      'TRANSACTION_KEY',
      'TRANSACTION_KEYS',
   ].some(
      (fixture) =>
         privateFixtures.has(fixture as PlaceholderName) &&
         !effectivePrivateContext[fixture as PlaceholderName],
   );
   if (needsPrivateTeam)
      try {
         const teamPath = `/users;use_login=1/games;game_keys=${profile.code}/teams`;
         const execution = await requestRoute('private', teamPath);
         const facts = extractFacts(execution.parsedResponse);
         const teamKey = valuesForSport(facts, 'teamKey', gameKey)[0];
         if (teamKey) {
            privateContext.TEAM_KEY ??= teamKey;
            privateContext.TEAM_KEYS ??= teamKey;
            const leagueKey = teamKey.split('.t.')[0];
            if (leagueKey) {
               privateContext.LEAGUE_KEY ??= leagueKey;
               privateContext.LEAGUE_KEYS ??= leagueKey;
            }
         }
         records.push({
            facts,
            mode: 'private',
            notes: [
               teamKey
                  ? 'private team and league fixtures discovered'
                  : 'authorized account has no team fixture for this sport',
            ],
            path: teamPath,
            sport: profile.code,
            status: 'passed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: 'private',
            notes: [error instanceof Error ? error.message : String(error)],
            path: `/users;use_login=1/games;game_keys=${profile.code}/teams`,
            sport: profile.code,
            status: 'failed',
         });
      }

   if (
      privateContext.TEAM_KEY &&
      !privateContext.PLAYER_KEY &&
      (privateFixtures.has('PLAYER_KEY') ||
         privateFixtures.has('PLAYER_KEYS'))
   ) {
      try {
         const path = `/team/${privateContext.TEAM_KEY}/roster/players`;
         const execution = await requestRoute('private', path);
         const facts = extractFacts(execution.parsedResponse);
         const playerKeys = facts.playerKey ?? [];
         if (playerKeys[0]) {
            privateContext.PLAYER_KEY = playerKeys[0];
            privateContext.PLAYER_KEYS = playerKeys.slice(0, 2).join(',');
         }
         privateContext.DATE ??= firstFact(facts, 'date');
         privateContext.WEEK ??= firstFact(facts, 'week');
         records.push({
            facts,
            mode: 'private',
            notes: ['roster period and player fixtures discovered'],
            path,
            sport: profile.code,
            status: 'passed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: 'private',
            notes: [error instanceof Error ? error.message : String(error)],
            path: `/team/${privateContext.TEAM_KEY}/roster/players`,
            sport: profile.code,
            status: 'failed',
         });
      }
   }

   if (
      privateContext.LEAGUE_KEY &&
      !privateContext.TRANSACTION_KEY &&
      (privateFixtures.has('TRANSACTION_KEY') ||
         privateFixtures.has('TRANSACTION_KEYS'))
   ) {
      try {
         const path = `/league/${privateContext.LEAGUE_KEY}/transactions;count=5`;
         const execution = await requestRoute('private', path);
         const facts = extractFacts(execution.parsedResponse);
         const keys = facts.transactionKey ?? [];
         if (keys[0]) {
            privateContext.TRANSACTION_KEY = keys[0];
            privateContext.TRANSACTION_KEYS = keys.slice(0, 2).join(',');
         }
         records.push({
            facts,
            mode: 'private',
            notes: [
               keys.length
                  ? 'transaction fixtures discovered'
                  : 'league returned no current transaction fixture',
            ],
            path,
            sport: profile.code,
            status: 'passed',
         });
      } catch (error) {
         records.push({
            facts: {},
            mode: 'private',
            notes: [error instanceof Error ? error.message : String(error)],
            path: `/league/${privateContext.LEAGUE_KEY}/transactions;count=5`,
            sport: profile.code,
            status: 'failed',
         });
      }
   }

   return records;
}

function sanitize(value: string): string {
   return value.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
}

function runDirectory(): string {
   return `${staticRouteVerifierConfig.output.responseDumpDirPath}/${runId}`;
}

async function writeDump(
   scenario: RouteScenario,
   suffix: string,
   payload: unknown,
): Promise<string> {
   dumpSequence += 1;
   const file = `${String(dumpSequence).padStart(3, '0')}-${scenario.sport}-${sanitize(scenario.route.id)}-${suffix}.json`;
   const path = `${runDirectory()}/${file}`;
   await Bun.write(path, JSON.stringify(payload, null, 2));
   return path;
}

async function runScenario(scenario: RouteScenario): Promise<RouteResult> {
   if (!scenario.path) {
      return {
         confidence: scenario.route.confidence,
         facts: {},
         id: scenario.id,
         label: scenario.route.label,
         missingFixtures: scenario.missingFixtures,
         mode: scenario.route.mode,
         notes: [
            `missing fixtures: ${scenario.missingFixtures.join(', ')}`,
         ],
         provenance: scenario.route.provenance,
         requestStatus: 'fixture-unavailable',
         routeSet: scenario.routeSet,
         shapeNotes: [],
         shapeStatus: 'not-run',
         sport: scenario.sport,
      };
   }

   try {
      const execution = await requestRoute(
         scenario.route.mode,
         scenario.path,
      );
      const facts = extractFacts(execution.parsedResponse);
      const hasData = hasReturnedData(execution.parsedResponse);
      const emptyArrays = emptyRequiredArrays(
         scenario.route,
         execution.parsedResponse,
      );
      const shapeNotes = verifyResponseShape(
         scenario.route,
         execution.parsedResponse,
      );
      const keyNotes = verifyKeyFixtures(
         scenario.route,
         facts,
         scenario.context,
      );
      const dumpFilePath = await writeDump(scenario, 'response', {
         facts,
         mode: scenario.route.mode,
         path: scenario.path,
         rawBody: execution.rawBody,
         response: execution.parsedResponse,
         sport: scenario.sport,
         url: execution.url,
      });

      if (keyNotes.length) {
         return {
            confidence: scenario.route.confidence,
            dumpFilePath,
            facts,
            failure: {
               confidence: 'high',
               kind: 'response-mismatch',
               reason:
                  'Yahoo returned keys that did not match the requested fixture set.',
            },
            id: scenario.id,
            label: scenario.route.label,
            missingFixtures: [],
            mode: scenario.route.mode,
            notes: keyNotes,
            path: scenario.path,
            provenance: scenario.route.provenance,
            requestStatus: 'failed',
            routeSet: scenario.routeSet,
            shapeNotes,
            shapeStatus: 'not-run',
            sport: scenario.sport,
         };
      }

      if ((!hasData && !scenario.route.allowEmpty) || emptyArrays.length) {
         const note = emptyArrays.length
            ? `request succeeded but required arrays were empty: ${emptyArrays.join(', ')}`
            : 'request succeeded but returned no data';
         return {
            confidence: scenario.route.confidence,
            dumpFilePath,
            facts,
            failure: assessFailure(note),
            id: scenario.id,
            label: scenario.route.label,
            missingFixtures: [],
            mode: scenario.route.mode,
            notes: [note],
            path: scenario.path,
            provenance: scenario.route.provenance,
            requestStatus: 'failed',
            routeSet: scenario.routeSet,
            shapeNotes,
            shapeStatus: 'not-run',
            sport: scenario.sport,
         };
      }

      return {
         confidence: scenario.route.confidence,
         dumpFilePath,
         facts,
         id: scenario.id,
         label: scenario.route.label,
         missingFixtures: [],
         mode: scenario.route.mode,
         notes: [
            scenario.routeSet === 'invalid'
               ? 'unexpectedly accepted known-invalid or provisional path'
               : hasData
                 ? 'request succeeded and returned data'
                 : 'request succeeded with an allowed empty payload',
         ],
         path: scenario.path,
         provenance: scenario.route.provenance,
         requestStatus: 'passed',
         routeSet: scenario.routeSet,
         shapeNotes,
         shapeStatus: hasShapeExpectations(scenario.route)
            ? shapeNotes.length
               ? 'warning'
               : 'passed'
            : 'not-run',
         sport: scenario.sport,
      };
   } catch (error) {
      const note = error instanceof Error ? error.message : String(error);
      const failure = assessFailure(note);
      const dumpFilePath = await writeDump(scenario, 'error', {
         error: note,
         mode: scenario.route.mode,
         path: scenario.path,
         rawBody:
            error instanceof RequestRouteError ? error.rawBody : undefined,
         sport: scenario.sport,
         url:
            error instanceof RequestRouteError
               ? error.url
               : buildRequestUrl(scenario.path),
      });
      return {
         confidence: scenario.route.confidence,
         dumpFilePath,
         facts: {},
         failure,
         id: scenario.id,
         label: scenario.route.label,
         missingFixtures: [],
         mode: scenario.route.mode,
         notes: [note],
         path: scenario.path,
         provenance: scenario.route.provenance,
         requestStatus:
            scenario.routeSet === 'invalid' &&
            scenario.route.expectedFailureKinds?.includes(failure.kind)
               ? 'expected-rejection'
               : 'failed',
         routeSet: scenario.routeSet,
         shapeNotes: [],
         shapeStatus: 'not-run',
         sport: scenario.sport,
      };
   }
}

function countStatus(
   results: RouteResult[],
   status: RequestStatus,
): number {
   return results.filter((result) => result.requestStatus === status)
      .length;
}

function reportLink(reportPath: string, targetPath: string): string {
   return relative(dirname(reportPath), targetPath);
}

function renderFacts(facts: Record<string, string[]>): string {
   const entries = Object.entries(facts);
   if (!entries.length) return 'none';
   return entries
      .map(
         ([key, values]) =>
            `${key}=${values.join(',')}${values.length >= 10 ? ' (sample, max 10)' : ''}`,
      )
      .join('; ');
}

function sourceRevision(): string {
   const result = Bun.spawnSync(['git', 'rev-parse', 'HEAD']);
   if (result.exitCode !== 0) return 'unknown';
   const revision = new TextDecoder().decode(result.stdout).trim();
   if (!revision) return 'unknown';
   const status = Bun.spawnSync(['git', 'status', '--porcelain']);
   const dirty = new TextDecoder().decode(status.stdout).trim().length > 0;
   return `${revision}${dirty ? ' + working tree changes' : ''}`;
}

async function sourceFingerprint(): Promise<string> {
   const files = [
      '../../bun.lock',
      '../../package.json',
      '../../src/auth/oauth1.ts',
      '../../src/auth/oauth2.ts',
      '../../src/client/errors.ts',
      '../../src/client/http.ts',
      '../../src/utils/constants.ts',
      '../../src/utils/xmlParser.ts',
      'path-probe.ts',
      'report-sanitization.ts',
      'research-http.ts',
      'route-model.ts',
      'static-route-config.ts',
      'static-route-definitions.ts',
      'static-route-verifier.ts',
   ];
   const hasher = new Bun.CryptoHasher('sha256');
   for (const file of files) {
      hasher.update(file);
      hasher.update(await Bun.file(new URL(file, import.meta.url)).text());
   }
   return hasher.digest('hex');
}

function profileFingerprint(
   profiles: SportProfile[],
   includeSensitive: boolean,
): string {
   const fingerprintProfiles = includeSensitive
      ? profiles
      : profiles.map((profile) => ({
           ...profile,
           context: nonSensitiveContext(profile.context),
           privateContext: nonSensitiveContext(profile.privateContext),
           publicContext: nonSensitiveContext(profile.publicContext),
        }));
   const hasher = new Bun.CryptoHasher('sha256');
   hasher.update(JSON.stringify(fingerprintProfiles));
   return hasher.digest('hex');
}

function nonSensitiveContext(
   context: SportProfile['context'] | undefined,
): SportProfile['context'] {
   return Object.fromEntries(
      Object.entries(context ?? {}).filter(
         ([key]) => !key.endsWith('_KEY') && !key.endsWith('_KEYS'),
      ),
   );
}

function buildReport(
   reportPath: string,
   options: CliOptions,
   discoveries: DiscoveryRecord[],
   results: RouteResult[],
   includeArtifacts: boolean,
   redactFixtures: boolean,
   fingerprint: string,
   profilesFingerprint: string,
): string {
   const displayText = redactFixtures
      ? redactFixtureKeys
      : (value: string) => value;
   const displayFacts = redactFixtures
      ? sanitizeReportFacts
      : (value: Record<string, string[]>) => value;
   const lines = [
      '# Cross-Sport Yahoo Route Report',
      '',
      `- Run: ${runId}`,
      `- Sports: ${options.sports.join(', ')}`,
      `- Mode: ${options.mode}`,
      `- Route IDs: ${options.routeIds ? [...options.routeIds].join(', ') : 'all selected routes'}`,
      `- Source revision: ${sourceRevision()}`,
      `- Source fingerprint: sha256:${fingerprint}`,
      `- Non-sensitive profile fingerprint: sha256:${profilesFingerprint}`,
      `- Profile overrides: ${process.env.YAHOO_ROUTE_PROFILES_JSON ? 'environment override set' : 'defaults only'}`,
      `- Bun: ${Bun.version}`,
      `- Strict shapes: ${options.strictShapes}`,
      `- Require complete: ${options.requireComplete}`,
      `- Include invalid: ${options.includeInvalid}`,
      `- Non-interactive auth: ${options.nonInteractive}`,
      `- Detailed artifacts: ${includeArtifacts ? 'local links below' : 'omitted from tracked summary'}`,
      `- Scenarios: ${results.length}`,
      `- Passed: ${countStatus(results, 'passed')}`,
      `- Failed: ${countStatus(results, 'failed')}`,
      `- Fixture unavailable: ${countStatus(results, 'fixture-unavailable')}`,
      `- Expected rejection: ${countStatus(results, 'expected-rejection')}`,
      `- Shape warnings: ${results.filter((result) => result.shapeStatus === 'warning').length}`,
      '',
      '## Sport Summary',
      '',
      '| Sport | Passed | Failed | Fixture unavailable | Expected rejection | Shape warnings |',
      '| --- | ---: | ---: | ---: | ---: | ---: |',
   ];

   for (const sport of options.sports) {
      const sportResults = results.filter(
         (result) => result.sport === sport,
      );
      lines.push(
         `| ${sport.toUpperCase()} | ${countStatus(sportResults, 'passed')} | ${countStatus(sportResults, 'failed')} | ${countStatus(sportResults, 'fixture-unavailable')} | ${countStatus(sportResults, 'expected-rejection')} | ${sportResults.filter((result) => result.shapeStatus === 'warning').length} |`,
      );
   }

   lines.push('', '## Discovery Facts', '');
   for (const record of discoveries) {
      lines.push(
         `- **${record.sport.toUpperCase()} ${record.mode} ${record.status}** \`${displayText(record.path)}\`: ${redactFixtures ? sanitizeReportNotes(record.mode, record.status === 'failed', record.notes) : record.notes.join('; ')}; ${renderFacts(displayFacts(record.facts))}`,
      );
   }

   for (const sport of options.sports) {
      lines.push('', `## ${sport.toUpperCase()}`, '');
      for (const result of results.filter(
         (candidate) => candidate.sport === sport,
      )) {
         lines.push(
            `### ${result.label}`,
            '',
            `- ID: \`${result.id}\``,
            `- Evidence: ${result.mode} / ${result.confidence} / ${result.provenance} / ${result.routeSet}`,
            `- Status: ${result.requestStatus}; shape ${result.shapeStatus}`,
         );
         if (result.path) {
            lines.push(`- Path: \`${displayText(result.path)}\``);
         }
         if (includeArtifacts && result.dumpFilePath) {
            lines.push(
               `- Dump: [response artifact](${reportLink(reportPath, result.dumpFilePath)})`,
            );
         }
         if (result.missingFixtures.length) {
            lines.push(
               `- Missing fixtures: ${result.missingFixtures.join(', ')}`,
            );
         }
         if (result.failure) {
            lines.push(
               `- Classification: ${result.failure.kind} (${result.failure.confidence})`,
               `- Reason: ${displayText(result.failure.reason)}`,
            );
         }
         lines.push(
            `- Facts: ${renderFacts(displayFacts(result.facts))}`,
            `- Notes: ${redactFixtures ? sanitizeReportNotes(result.mode, Boolean(result.failure), [...result.notes, ...result.shapeNotes]) : [...result.notes, ...result.shapeNotes].join('; ') || 'none'}`,
            '',
         );
      }
   }

   return `${lines.join('\n').trimEnd()}\n`;
}

function printDryRun(scenarios: RouteScenario[]): void {
   console.log('Cross-sport Yahoo route verifier dry run');
   for (const scenario of scenarios) {
      console.log(
         `${scenario.path ? 'READY' : 'FIXTURE'} ${scenario.id} ${scenario.path ?? scenario.missingFixtures.join(',')}`,
      );
   }
   console.log(`Scenarios: ${scenarios.length}`);
   console.log(
      `Ready: ${scenarios.filter((scenario) => scenario.path).length}`,
   );
   console.log(
      `Fixture unavailable: ${scenarios.filter((scenario) => !scenario.path).length}`,
   );
}

function hasBlockingResults(
   results: RouteResult[],
   discoveries: DiscoveryRecord[],
   options: CliOptions,
): boolean {
   if (discoveries.some((record) => record.status === 'failed')) {
      return true;
   }
   if (results.some((result) => result.requestStatus === 'failed')) {
      return true;
   }
   if (
      results.some(
         (result) =>
            result.routeSet === 'invalid' &&
            result.requestStatus === 'passed',
      )
   ) {
      return true;
   }
   if (
      options.requireComplete &&
      results.some(
         (result) => result.requestStatus === 'fixture-unavailable',
      )
   ) {
      return true;
   }
   return (
      options.strictShapes &&
      results.some((result) => result.shapeStatus === 'warning')
   );
}

async function main(): Promise<void> {
   const options = parseCliArgs(process.argv.slice(2));
   if (options.nonInteractive) {
      process.env.YAHOO_RESEARCH_NON_INTERACTIVE = '1';
   }
   const definitionErrors = validateRouteDefinitions(ALL_ROUTE_DEFINITIONS);
   if (definitionErrors.length) {
      throw new Error(
         `Route definition preflight failed:\n- ${definitionErrors.join('\n- ')}`,
      );
   }

   const selected = selectRoutes(options);
   const profiles = cloneProfiles(options.sports);

   if (options.dryRun) {
      const scenarios = instantiateScenarios(selected, profiles);
      printDryRun(scenarios);
      if (
         options.requireComplete &&
         scenarios.some((scenario) => !scenario.path)
      ) {
         process.exitCode = 1;
      }
      return;
   }

   await mkdir(runDirectory(), { recursive: true });
   const discoveries: DiscoveryRecord[] = [];
   for (const profile of profiles) {
      const publicFixtures = requiredFixturesForSport(
         selected.filter(({ route }) => route.mode === 'public'),
         profile.code,
      );
      const privateFixtures = requiredFixturesForSport(
         selected.filter(({ route }) => route.mode === 'private'),
         profile.code,
      );
      discoveries.push(
         ...(await discoverProfile(
            profile,
            options.mode,
            publicFixtures,
            privateFixtures,
         )),
      );
   }

   const scenarios = instantiateScenarios(selected, profiles);
   const results: RouteResult[] = [];
   for (const scenario of scenarios) {
      const result = await runScenario(scenario);
      results.push(result);
      console.log(
         `${result.requestStatus.toUpperCase()} ${result.id}${result.failure ? ` (${result.failure.kind})` : ''}`,
      );
      if (staticRouteVerifierConfig.request.delayMs > 0) {
         await Bun.sleep(staticRouteVerifierConfig.request.delayMs);
      }
   }

   const reportPath = `${runDirectory()}/report.md`;
   const fingerprint = await sourceFingerprint();
   const profilesFingerprint = profileFingerprint(profiles, false);
   const localProfilesFingerprint = profileFingerprint(profiles, true);
   const report = buildReport(
      reportPath,
      options,
      discoveries,
      results,
      true,
      false,
      fingerprint,
      profilesFingerprint,
   );
   const latestReport = buildReport(
      staticRouteVerifierConfig.output.latestReportFilePath,
      options,
      discoveries,
      results,
      false,
      true,
      fingerprint,
      profilesFingerprint,
   );
   await Bun.write(reportPath, report);
   await Bun.write(
      `${runDirectory()}/results.json`,
      JSON.stringify(
         {
            discoveries,
            options: {
               ...options,
               routeIds: options.routeIds ? [...options.routeIds] : null,
            },
            results,
            runId,
            profiles,
            profilesFingerprint,
            localProfilesFingerprint,
            sourceFingerprint: fingerprint,
         },
         null,
         2,
      ),
   );
   await Bun.write(
      staticRouteVerifierConfig.output.latestReportFilePath,
      latestReport,
   );
   await Bun.write(
      `${staticRouteVerifierConfig.output.responseDumpDirPath}/latest-run.txt`,
      `${runDirectory()}\n`,
   );

   console.log(`Report: ${reportPath}`);
   console.log(
      `Passed ${countStatus(results, 'passed')}; failed ${countStatus(results, 'failed')}; fixture unavailable ${countStatus(results, 'fixture-unavailable')}.`,
   );

   if (hasBlockingResults(results, discoveries, options)) {
      process.exitCode = 1;
   }
}

await main();
