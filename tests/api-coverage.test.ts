import { describe, expect, it } from 'bun:test';
import { ApiRoot } from '../src/resources/api.js';
import { LeagueResource } from '../src/resources/league.js';
import { TeamResource } from '../src/resources/team.js';
import { TransactionResource } from '../src/resources/transaction.js';
import { UsersCollection } from '../src/resources/user.js';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

const yfs = new ApiRoot(transport);

type RouteCase = {
   route: string;
   build: () => string;
};

function canonicalizePath(path: string): string {
   return path
      .replace(/^\//, '')
      .split('/')
      .map((segment) => {
         const [base, ...params] = segment.split(';');

         if (params.length === 0) {
            return base;
         }

         return [base, ...params.sort()].join(';');
      })
      .join('/');
}

function _categorizeRoute(route: string): string {
   // this '/users;use_login=1/games;game_keys=nfl/leagues/players;search=mahomes;count=5'
   // to 'users-games-leagues-players'
   return route
      .replace(/^\//, '')
      .split('/')
      .map((segment) => segment.split(';')[0])
      .join('-');
}

const validApiRoutes: RouteCase[] = [
   {
      route: '/users;use_login=1',
      build: () => yfs.users().toPath(),
   },
   {
      route: '/users;use_login=1/games',
      build: () => yfs.users().games().toPath(),
   },
   {
      route: '/users;use_login=1/games;game_keys=nfl',
      build: () => yfs.users().games('nfl').toPath(),
   },
   {
      route: '/users;use_login=1/games;game_keys=nfl/leagues',
      build: () => yfs.users().games('nfl').leagues([]).toPath(),
   },
   {
      route: '/users;use_login=1/games;game_keys=nfl,nhl/leagues/teams',
      build: () =>
         yfs.users().games('nfl', 'nhl').leagues([]).teams().toPath(),
   },
   {
      route: '/users;use_login=1/games;game_keys=nfl/leagues/players;search=mahomes;count=5',
      build: () =>
         yfs
            .users()
            .games('nfl')
            .leagues([])
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/game/423',
      build: () => yfs.game('423').toPath(),
   },
   {
      route: '/game/nfl',
      build: () => yfs.game('nfl').toPath(),
   },
   {
      route: '/game/nfl/leagues;league_keys=nfl.l.999',
      build: () => yfs.game('nfl').leagues(['nfl.l.999']).toPath(),
   },
   {
      route: '/game/nfl/players;search=mahomes;count=5',
      build: () =>
         yfs.game('nfl').players().search('mahomes').count(5).toPath(),
   },
   {
      route: '/game/nfl;out=game_weeks',
      build: () => yfs.game('nfl').include('game_weeks').toPath(),
   },
   {
      route: '/games;is_available=1',
      build: () => yfs.games().params({ is_available: '1' }).toPath(),
   },
   {
      route: '/games;game_keys=nfl/players;search=mahomes;count=5',
      build: () =>
         yfs.games(['nfl']).players().search('mahomes').count(5).toPath(),
   },
   {
      route: '/game/nfl/leagues;league_keys=nfl.l.999/teams',
      build: () => yfs.game('nfl').leagues(['nfl.l.999']).teams().toPath(),
   },
   {
      route: '/game/nfl/leagues;league_keys=nfl.l.999/players;search=mahomes;count=5',
      build: () =>
         yfs
            .game('nfl')
            .leagues(['nfl.l.999'])
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/game/nfl/leagues;league_keys=nfl.l.999/transactions;count=5',
      build: () =>
         yfs
            .game('nfl')
            .leagues(['nfl.l.999'])
            .transactions()
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.999',
      build: () => yfs.league('nfl.l.999').toPath(),
   },
   {
      route: '/league/nfl.l.999/teams',
      build: () => yfs.league('nfl.l.999').teams().toPath(),
   },
   {
      route: '/league/nfl.l.999/players;search=mahomes;count=5',
      build: () =>
         yfs
            .league('nfl.l.999')
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.999/transactions;count=5',
      build: () => yfs.league('nfl.l.999').transactions().count(5).toPath(),
   },
   {
      route: '/league/nfl.l.123',
      build: () => yfs.league('nfl.l.123').toPath(),
   },
   {
      route: '/league/nfl.l.123/teams',
      build: () => yfs.league('nfl.l.123').teams().toPath(),
   },
   {
      route: '/league/nfl.l.123/players;status=FA;position=QB;count=5',
      build: () =>
         yfs
            .league('nfl.l.123')
            .players()
            .status('FA')
            .position('QB')
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/players;search=mahomes;count=5',
      build: () =>
         yfs
            .league('nfl.l.123')
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/transactions;count=5',
      build: () => yfs.league('nfl.l.123').transactions().count(5).toPath(),
   },
   {
      route: '/league/nfl.l.123/transactions;type=waiver;team_key=nfl.l.123.t.1;count=5',
      build: () =>
         yfs
            .league('nfl.l.123')
            .transactions()
            .types('waiver')
            .teamKey('nfl.l.123.t.1')
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/transactions;types=add,trade;count=5',
      build: () =>
         yfs
            .league('nfl.l.123')
            .transactions()
            .types(['add', 'trade'])
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123;out=settings,standings,scoreboard',
      build: () =>
         yfs
            .league('nfl.l.123')
            .include('settings', 'standings', 'scoreboard')
            .toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456',
      build: () => yfs.leagues(['nfl.l.123', 'nfl.l.456']).toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456/teams',
      build: () => yfs.leagues(['nfl.l.123', 'nfl.l.456']).teams().toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456/players;search=mahomes;count=5',
      build: () =>
         yfs
            .leagues(['nfl.l.123', 'nfl.l.456'])
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456/transactions;count=5',
      build: () =>
         yfs
            .leagues(['nfl.l.123', 'nfl.l.456'])
            .transactions()
            .count(5)
            .toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456;out=settings,standings',
      build: () =>
         yfs
            .leagues(['nfl.l.123', 'nfl.l.456'])
            .include('settings', 'standings')
            .toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456/teams/roster;week=10',
      build: () =>
         yfs
            .leagues(['nfl.l.123', 'nfl.l.456'])
            .teams()
            .roster()
            .week(10)
            .toPath(),
   },
   {
      route: '/leagues;league_keys=nfl.l.123,nfl.l.456/teams/roster;week=10/players',
      build: () =>
         yfs
            .leagues(['nfl.l.123', 'nfl.l.456'])
            .teams()
            .roster()
            .week(10)
            .players()
            .toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1',
      build: () => yfs.team('nfl.l.123.t.1').toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1/roster',
      build: () => yfs.team('nfl.l.123.t.1').roster().toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1/roster;week=10/players',
      build: () =>
         yfs.team('nfl.l.123.t.1').roster().week(10).players().toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1/roster;date=2025-09-01/players',
      build: () =>
         yfs
            .team('nfl.l.123.t.1')
            .roster()
            .date('2025-09-01')
            .players()
            .toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1/matchups;weeks=10,5',
      build: () =>
         yfs.team('nfl.l.123.t.1').matchups().weeks([10, 5]).toPath(),
   },
   {
      route: '/team/nfl.l.123.t.1;out=roster,stats,matchups',
      build: () =>
         yfs
            .team('nfl.l.123.t.1')
            .include('roster', 'stats', 'matchups')
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2',
      build: () => yfs.teams(['nfl.l.123.t.1', 'nfl.l.123.t.2']).toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;week=10',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .roster()
            .week(10)
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;week=10/players',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .roster()
            .week(10)
            .players()
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/matchups;weeks=10,5',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .matchups()
            .weeks([10, 5])
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2;out=roster,stats',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .include('roster', 'stats')
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;date=2025-09-01/players',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .roster()
            .date('2025-09-01')
            .players()
            .toPath(),
   },
   {
      route: '/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/stats;type=date;date=2025-09-01',
      build: () =>
         yfs
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .stats()
            .date('2025-09-01')
            .toPath(),
   },
   {
      route: '/player/nfl.p.1',
      build: () => yfs.player('nfl.p.1').toPath(),
   },
   {
      route: '/player/nfl.p.1/stats;type=season',
      build: () => yfs.player('nfl.p.1').stats().type('season').toPath(),
   },
   {
      route: '/player/nfl.p.1;out=stats,ownership',
      build: () =>
         yfs.player('nfl.p.1').include('stats', 'ownership').toPath(),
   },
   {
      route: '/players;player_keys=nfl.p.1,nfl.p.2',
      build: () => yfs.players(['nfl.p.1', 'nfl.p.2']).toPath(),
   },
   {
      route: '/players;player_keys=nfl.p.1,nfl.p.2/stats',
      build: () => yfs.players(['nfl.p.1', 'nfl.p.2']).stats().toPath(),
   },
   {
      route: '/league/nfl.l.123/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;week=10',
      build: () =>
         yfs
            .league('nfl.l.123')
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .roster()
            .week(10)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;week=10/players',
      build: () =>
         yfs
            .league('nfl.l.123')
            .teams(['nfl.l.123.t.1', 'nfl.l.123.t.2'])
            .roster()
            .week(10)
            .players()
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/players;player_keys=nfl.p.1,nfl.p.2/stats',
      build: () =>
         yfs
            .league('nfl.l.123')
            .players(['nfl.p.1', 'nfl.p.2'])
            .stats()
            .toPath(),
   },
];

const invalidApiRoute: RouteCase[] = [
   {
      route: '/game/nfl/leagues',
      build: () => yfs.game('nfl').leagues([]).toPath(),
   },
   {
      route: '/games;game_keys=nfl;out=leagues',
      // @ts-expect-error out=leagues is not supported on games collection
      build: () => yfs.games(['nfl']).include('leagues').toPath(),
   },
   {
      route: '/games;game_keys=nfl;out=leagues,players',
      build: () =>
         // @ts-expect-error out=leagues,players is not supported on games collection
         yfs.games(['nfl']).include('leagues', 'players').toPath(),
   },
   {
      route: '/game/nfl/leagues/teams',
      build: () => yfs.game('nfl').leagues([]).teams().toPath(),
   },
   {
      route: '/game/nfl/leagues/players;search=mahomes;count=5',
      build: () =>
         yfs
            .game('nfl')
            .leagues([])
            .players()
            .search('mahomes')
            .count(5)
            .toPath(),
   },
   {
      route: '/game/nfl/leagues/transactions;count=5',
      build: () =>
         yfs.game('nfl').leagues([]).transactions().count(5).toPath(),
   },
   {
      route: '/league/nfl.l.123/players;status=FA;position=QB;sort=PTS;sort_type=season;sort_season=2025;start=0;count=5',
      build: () =>
         yfs
            .league('nfl.l.123')
            .players()
            .status('FA')
            .position('QB')
            .sort('PTS')
            .sortType('season')
            .sortSeason(2025)
            .start(0)
            .count(5)
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/transactions;transaction_keys=nfl.l.123.tr.9,nfl.l.123.tr.10',
      build: () =>
         yfs
            .league('nfl.l.123')
            .transactions(['nfl.l.123.tr.9', 'nfl.l.123.tr.10'])
            .toPath(),
   },
   {
      route: '/league/nfl.l.123/transactions;transaction_keys=nfl.l.123.tr.9,nfl.l.123.tr.10;out=players',
      build: () =>
         yfs
            .league('nfl.l.123')
            .transactions(['nfl.l.123.tr.9', 'nfl.l.123.tr.10'])
            .players()
            .toPath(),
   },
   {
      route: '/transaction/nfl.l.123.tr.9',
      build: () => yfs.transaction('nfl.l.123.tr.9').toPath(),
   },
];

const allRouteIds = [
   ...validApiRoutes.map((v) => v.route),
   ...invalidApiRoute.map((v) => v.route),
];

describe('API path coverage', () => {
   it('normalizes leading slashes and semicolon param order', () => {
      expect(
         canonicalizePath(
            '/league/nfl.l.123/transactions;type=waiver;team_key=nfl.l.123.t.1;count=5',
         ),
      ).toBe(
         canonicalizePath(
            'league/nfl.l.123/transactions;count=5;team_key=nfl.l.123.t.1;type=waiver',
         ),
      );
   });

   it('keeps the local route list unique', () => {
      expect(new Set(allRouteIds).size).toBe(allRouteIds.length);
   });

   for (const route of validApiRoutes) {
      it(`builds supported route ${route.route}`, () => {
         expect(canonicalizePath(route.build())).toBe(
            canonicalizePath(route.route),
         );
      });
   }

   for (const route of invalidApiRoute) {
      it(`builds known-invalid api probe ${route.route}`, () => {
         expect(canonicalizePath(route.build())).toBe(
            canonicalizePath(route.route),
         );
      });
   }

   it('throws for direct user chains that are intentionally not implemented', () => {
      const users = UsersCollection.create(transport, emptyState);

      expect(() => users.leagues()).toThrow('Not implemented');
      expect(() => users.teams()).toThrow('Not implemented');
   });
});

function assertTypeCoverage(): void {
   const users = UsersCollection.create(transport, emptyState);

   // @ts-expect-error users collection cannot out-expand leagues
   users.include('leagues');

   // // @ts-expect-error games collection does not expose teams directly
   // users.games(['nfl']).teams();

   // @ts-expect-error league settings does not have a dedicated child builder yet
   LeagueResource.create(transport, emptyState, 'nfl.l.123').settings();

   // @ts-expect-error league scoreboard does not have a dedicated child builder yet
   LeagueResource.create(transport, emptyState, 'nfl.l.123').scoreboard();

   TransactionResource.create(transport, emptyState, 'nfl.l.123.tr.9')
      .players()
      // @ts-expect-error transaction resource does not expose players as a child builder path
      .stats();

   TeamResource.create(transport, emptyState, 'nfl.l.123.t.1')
      .matchups()
      // @ts-expect-error matchup builders only accept weeks filters
      .date('2025-09-01');
}

void assertTypeCoverage;
