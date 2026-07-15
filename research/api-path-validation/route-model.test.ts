import { describe, expect, test } from 'bun:test';
import {
   redactFixtureKeys,
   sanitizeReportFacts,
   sanitizeReportNotes,
} from './report-sanitization.js';
import {
   buildScenarioContext,
   instantiateScenarios,
   parseSports,
   requiredFixturesForSport,
   resolveTemplate,
   validateRouteDefinitions,
   verifyKeyFixtures,
} from './route-model.js';
import {
   ALL_ROUTE_DEFINITIONS,
   type RouteDefinition,
} from './static-route-definitions.js';

function definition(
   overrides: Partial<RouteDefinition> = {},
): RouteDefinition {
   return {
      confidence: 'explicit',
      description: 'test route',
      id: 'test-route',
      label: 'Test route',
      mode: 'public',
      pathTemplate: '/game/{{SPORT_CODE}}',
      provenance: 'documented-claim',
      ...overrides,
   };
}

describe('route definition preflight', () => {
   test('accepts the production catalog', () => {
      expect(validateRouteDefinitions(ALL_ROUTE_DEFINITIONS)).toEqual([]);
   });

   test('rejects duplicate ids and unknown placeholders', () => {
      const routes = [
         definition({ pathTemplate: '/game/{{UNKNOWN}}' }),
         definition(),
      ];

      expect(validateRouteDefinitions(routes)).toEqual([
         'test-route uses unknown placeholder UNKNOWN',
         'duplicate route id: test-route',
      ]);
   });

   test('keeps guide audit route references executable', async () => {
      const audit = await Bun.file(
         new URL('GUIDE_AUDIT.md', import.meta.url),
      ).text();
      const references = [...audit.matchAll(/`+route:([a-z0-9-]+)`+/g)].map(
         (match) => match[1],
      );
      const routeIds = new Set(
         ALL_ROUTE_DEFINITIONS.map((route) => route.id),
      );

      expect(references.length).toBeGreaterThan(10);
      expect(references.filter((id) => !routeIds.has(id ?? ''))).toEqual(
         [],
      );
   });

   test('separates guide claims from observed discrepancies', () => {
      const routes = new Map(
         ALL_ROUTE_DEFINITIONS.map((route) => [route.id, route]),
      );

      expect(routes.get('game-players')?.provenance).toBe('observed-only');
      expect(routes.get('invalid-games-out-leagues')?.provenance).toBe(
         'documented-runtime-discrepancy',
      );
      expect(routes.get('game-players-by-key')?.provenance).toBe(
         'documented-claim',
      );
   });

   test('keeps audited pass claims aligned with the checked-in report', async () => {
      const [audit, report] = await Promise.all([
         Bun.file(new URL('GUIDE_AUDIT.md', import.meta.url)).text(),
         Bun.file(
            new URL('actionable-route-report.md', import.meta.url),
         ).text(),
      ]);
      const rows = audit
         .split('\n')
         .map((line) =>
            line.match(
               /^\|.*?\| `+route:([a-z0-9-]+)`+ \|.*?\| Passed ([^;|]+)(?:;| \|)/,
            ),
         )
         .filter((match): match is RegExpMatchArray => Boolean(match));

      expect(audit.match(/strict-shape public run `([^`]+)`/)?.[1]).toBe(
         report.match(/^- Run: (.+)$/m)?.[1],
      );
      expect(rows.length).toBeGreaterThan(5);
      for (const row of rows) {
         const routeId = row[1] ?? '';
         const sports = (row[2] ?? '')
            .split(',')
            .map((sport) => sport.trim().toLowerCase());
         for (const sport of sports) {
            expect(report).toMatch(
               new RegExp(
                  `- ID: ${'`'}${sport}/${routeId}${'`'}[\\s\\S]{0,240}- Status: passed; shape passed`,
               ),
            );
         }
      }

      const fixtureGapRoutes = [
         ...audit.matchAll(
            /^\|.*?\| `+route:([a-z0-9-]+)`+ \|.*?\| Passed NHL; other sports fixture-unavailable \|$/gm,
         ),
      ].map((match) => match[1] ?? '');
      for (const routeId of fixtureGapRoutes) {
         for (const sport of ['nfl', 'mlb', 'nba']) {
            expect(report).toMatch(
               new RegExp(
                  `- ID: ${'`'}${sport}/${routeId}${'`'}[\\s\\S]{0,240}- Status: fixture-unavailable; shape not-run`,
               ),
            );
         }
      }

      const notRunRoutes = [
         ...audit.matchAll(
            /^\|.*?\| `+route:([a-z0-9-]+)`+ \|.*?\| Not run;/gm,
         ),
      ].map((match) => match[1] ?? '');
      for (const routeId of notRunRoutes) {
         expect(report).not.toContain(`/${routeId}${'`'}`);
      }
   });
});

describe('template resolution', () => {
   test('reports missing fixtures instead of silently skipping', () => {
      expect(
         resolveTemplate('/team/{{TEAM_KEY}}/roster;date={{DATE}}', {
            TEAM_KEY: '1.l.2.t.3',
         }),
      ).toEqual({ missing: ['DATE'] });
   });

   test('resolves canonical placeholders', () => {
      expect(
         resolveTemplate('/game/{{SPORT_CODE}}', { SPORT_CODE: 'nfl' }),
      ).toEqual({ missing: [], path: '/game/nfl' });
   });

   test('normalizes singular and plural fixture overrides', () => {
      const context = buildScenarioContext(
         {
            code: 'nhl',
            context: {},
            publicContext: {
               LEAGUE_KEY: '1.l.2',
               PLAYER_KEY: '1.p.3',
               TEAM_KEYS: '1.l.2.t.4,1.l.2.t.5',
               TRANSACTION_KEY: '1.l.2.tr.6',
            },
         },
         'public',
      );

      expect(context.LEAGUE_KEYS).toBe('1.l.2');
      expect(context.PLAYER_KEYS).toBe('1.p.3');
      expect(context.TEAM_KEY).toBe('1.l.2.t.4');
      expect(context.TRANSACTION_KEYS).toBe('1.l.2.tr.6');
   });
});

describe('fixture semantics', () => {
   test('requires returned keys to exactly match requested keys', () => {
      const route = definition({
         expectations: { keyFixtures: { playerKey: 'PLAYER_KEYS' } },
      });

      expect(
         verifyKeyFixtures(
            route,
            { playerKey: ['1.p.1', '1.p.3'] },
            { PLAYER_KEYS: '1.p.1,1.p.2' },
         ),
      ).toEqual([
         'playerKey did not match PLAYER_KEYS: missing [1.p.2], unexpected [1.p.3]',
      ]);
      expect(
         verifyKeyFixtures(
            route,
            { playerKey: ['1.p.2', '1.p.1'] },
            { PLAYER_KEYS: '1.p.1,1.p.2' },
         ),
      ).toEqual([]);
   });
});

describe('cross-sport scenario generation', () => {
   test('applies sport restrictions and preserves fixture gaps', () => {
      const routes = [
         {
            route: definition({
               id: 'weekly',
               mode: 'private',
               pathTemplate: '/team/{{TEAM_KEY}}/roster;week={{WEEK}}',
               sports: ['nfl'],
            }),
            routeSet: 'private' as const,
         },
      ];
      const scenarios = instantiateScenarios(routes, [
         {
            code: 'nfl',
            context: { WEEK: '1' },
            privateContext: { TEAM_KEY: '1.l.2.t.3' },
         },
         {
            code: 'mlb',
            context: { DATE: '2026-07-15' },
            privateContext: { TEAM_KEY: '2.l.2.t.3' },
         },
      ]);

      expect(scenarios).toHaveLength(1);
      expect(scenarios[0]?.id).toBe('nfl/weekly');
      expect(scenarios[0]?.path).toBe('/team/1.l.2.t.3/roster;week=1');
   });

   test('does not require unrelated discovery for targeted routes', () => {
      expect(
         requiredFixturesForSport(
            [{ route: definition(), routeSet: 'public' }],
            'nfl',
         ),
      ).toEqual(new Set(['SPORT_CODE']));
      expect(
         requiredFixturesForSport(
            [
               {
                  route: definition({
                     pathTemplate:
                        '/game/{{SPORT_CODE}}/players;player_keys={{PLAYER_KEYS}}',
                  }),
                  routeSet: 'public',
               },
            ],
            'nfl',
         ),
      ).toEqual(new Set(['SPORT_CODE', 'PLAYER_KEYS']));
   });

   test('creates one baseline scenario per sport', () => {
      const scenarios = instantiateScenarios(
         [{ route: definition(), routeSet: 'public' }],
         [
            { code: 'nfl', context: {} },
            { code: 'mlb', context: {} },
            { code: 'nba', context: {} },
            { code: 'nhl', context: {} },
         ],
      );

      expect(scenarios.map((scenario) => scenario.path)).toEqual([
         '/game/nfl',
         '/game/mlb',
         '/game/nba',
         '/game/nhl',
      ]);
   });
});

describe('sport selection', () => {
   test('normalizes and deduplicates supported sports', () => {
      expect(parseSports('NHL,nfl,nhl')).toEqual(['nhl', 'nfl']);
   });

   test('rejects unsupported sports', () => {
      expect(() => parseSports('nfl,soccer')).toThrow(
         'Unsupported sports: soccer',
      );
   });

   test('rejects an empty sport selection', () => {
      expect(() => parseSports(' , ')).toThrow(
         'At least one sport is required',
      );
   });
});

describe('report sanitization', () => {
   test('redacts every numeric and sport-prefixed fixture key', () => {
      expect(
         redactFixtureKeys(
            '/players/465.p.1,nhl.p.2/league/nfl.l.3/team/465.l.3.t.4/transactions/465.l.3.tr.5,nfl.l.3.pt.6,465.l.3.w.c.7_8',
         ),
      ).toBe(
         '/players/{fixture_key},{fixture_key}/league/{fixture_key}/team/{fixture_key}/transactions/{fixture_key},{fixture_key},{fixture_key}',
      );
   });

   test('removes identifying facts while preserving game evidence', () => {
      expect(
         sanitizeReportFacts({
            gameKey: ['465'],
            leagueName: ['Private league'],
            teamKey: ['465.l.3.t.4'],
         }),
      ).toEqual({ gameKey: ['465'] });
   });

   test('omits raw private failure messages from tracked reports', () => {
      expect(
         sanitizeReportNotes('private', true, [
            'League Example for owner@example.com failed at https://example.test/unknown-id',
         ]),
      ).toBe('raw private failure omitted; see local artifact');
      expect(
         sanitizeReportNotes('public', true, ['league ids expected']),
      ).toBe('league ids expected');
   });
});
