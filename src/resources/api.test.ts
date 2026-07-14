import { describe, expect, it } from 'bun:test';
import type { HttpClient } from '../client/http.js';
import type {
   YahooGameResponseDto,
   YahooLeagueResponseDto,
   YahooLoggedInUsersResponseDto,
   YahooPlayerResponseDto,
   YahooPlayersResponseDto,
} from '../domain/normalized.js';
import { ApiRoot, createApi } from './api.js';
import type { RequireResponsePath } from './response-contract.js';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;

type Assert<TValue extends true> = TValue;
type Equal<TLeft, TRight> = [TLeft] extends [TRight]
   ? [TRight] extends [TLeft]
      ? true
      : false
   : false;

describe('ApiRoot', () => {
   it('creates a root api instance', () => {
      expect(createApi(transport)).toBeInstanceOf(ApiRoot);
   });

   it('starts top-level resource paths from the root', () => {
      const api = createApi(transport);

      expect(api.users().toPath()).toBe('users;use_login=1');
      expect(api.game('nfl').toPath()).toBe('game/nfl');
      expect(api.games(['nfl']).toPath()).toBe('games;game_keys=nfl');
      expect(api.league('nfl.l.123').toPath()).toBe('league/nfl.l.123');
      expect(api.team('nfl.l.123.t.1').toPath()).toBe('team/nfl.l.123.t.1');
      expect(api.player('nfl.p.1').toPath()).toBe('player/nfl.p.1');
   });

   it('rejects empty top-level collection roots at runtime', () => {
      const api = createApi(transport);

      for (const method of [
         api.games,
         api.leagues,
         api.teams,
         api.players,
      ]) {
         expect(() => Reflect.apply(method, api, [])).toThrow(
            'At least one',
         );
         expect(() => Reflect.apply(method, api, [[]])).toThrow(
            'At least one',
         );
      }
   });

   it('carries exact root response types through validated chains', () => {
      const api = createApi(transport as HttpClient);
      const gameIncludes = api
         .game('465')
         .include('game_weeks', 'stat_categories', 'position_types');
      const leagueTeams = api.game('465').leagues('465.l.1').teams();
      const directUserTeams = api.users().teams();
      const nestedUserTeams = api
         .users()
         .games()
         .teams()
         .roster()
         .players();
      const userGameLeagues = api.users().games().leagues();
      const leagueRoster = api.leagues('465.l.1').teams().roster();
      const playerIncludes = api
         .player('465.p.1')
         .include('stats', 'ownership');
      const playerPercentOwned = api.player('465.p.1').percentOwned();
      const playersOwnership = api.players('465.p.1').ownership();
      const leaguePlayerPercentOwned = api
         .league('465.l.1')
         .players('465.p.1')
         .percentOwned();
      const teamStats = api.teams('465.l.1.t.1').stats();
      const playerStats = api.players('465.p.1').stats();

      type GameActual = Awaited<ReturnType<typeof gameIncludes.get>>;
      type GameExpected = RequireResponsePath<
         YahooGameResponseDto,
         | readonly ['game']
         | readonly ['game', 'gameWeeks']
         | readonly ['game', 'statCategories']
         | readonly ['game', 'positionTypes']
      >;
      type _GameEqual = Assert<Equal<GameActual, GameExpected>>;

      type LeagueTeamsActual = Awaited<ReturnType<typeof leagueTeams.get>>;
      type LeagueTeamsExpected = RequireResponsePath<
         YahooGameResponseDto,
         readonly ['game', 'leagues', 'teams']
      >;
      type _LeagueTeamsEqual = Assert<
         Equal<LeagueTeamsActual, LeagueTeamsExpected>
      >;

      type DirectUserTeamsActual = Awaited<
         ReturnType<typeof directUserTeams.get>
      >;
      type DirectUserTeamsExpected = RequireResponsePath<
         YahooLoggedInUsersResponseDto,
         readonly ['users', 'teams']
      >;
      type _DirectUserTeamsEqual = Assert<
         Equal<DirectUserTeamsActual, DirectUserTeamsExpected>
      >;

      type NestedUserTeamsActual = Awaited<
         ReturnType<typeof nestedUserTeams.get>
      >;
      type NestedUserTeamsExpected = RequireResponsePath<
         YahooLoggedInUsersResponseDto,
         readonly ['users', 'games', 'teams', 'roster', 'players']
      >;
      type _NestedUserTeamsEqual = Assert<
         Equal<NestedUserTeamsActual, NestedUserTeamsExpected>
      >;

      type UserGameLeaguesActual = Awaited<
         ReturnType<typeof userGameLeagues.get>
      >;
      type UserGameLeaguesExpected = RequireResponsePath<
         YahooLoggedInUsersResponseDto,
         readonly ['users', 'games', 'leagues']
      >;
      type _UserGameLeaguesEqual = Assert<
         Equal<UserGameLeaguesActual, UserGameLeaguesExpected>
      >;

      type LeagueRosterActual = Awaited<
         ReturnType<typeof leagueRoster.get>
      >;
      type LeagueRosterExpected = RequireResponsePath<
         import('../domain/normalized.js').YahooLeaguesResponseDto,
         readonly ['leagues', 'teams', 'roster']
      >;
      type _LeagueRosterEqual = Assert<
         Equal<LeagueRosterActual, LeagueRosterExpected>
      >;

      type PlayerActual = Awaited<ReturnType<typeof playerIncludes.get>>;
      type PlayerExpected = RequireResponsePath<
         YahooPlayerResponseDto,
         | readonly ['player']
         | readonly ['player', 'playerStats']
         | readonly ['player', 'ownership']
      >;
      type _PlayerEqual = Assert<Equal<PlayerActual, PlayerExpected>>;

      type PlayerPercentOwnedActual = Awaited<
         ReturnType<typeof playerPercentOwned.get>
      >;
      type PlayerPercentOwnedExpected = RequireResponsePath<
         YahooPlayerResponseDto,
         readonly ['player', 'percentOwned']
      >;
      type _PlayerPercentOwnedEqual = Assert<
         Equal<PlayerPercentOwnedActual, PlayerPercentOwnedExpected>
      >;

      type PlayersOwnershipActual = Awaited<
         ReturnType<typeof playersOwnership.get>
      >;
      type PlayersOwnershipExpected = RequireResponsePath<
         YahooPlayersResponseDto,
         readonly ['players', 'ownership']
      >;
      type _PlayersOwnershipEqual = Assert<
         Equal<PlayersOwnershipActual, PlayersOwnershipExpected>
      >;

      type LeaguePlayerPercentOwnedActual = Awaited<
         ReturnType<typeof leaguePlayerPercentOwned.get>
      >;
      type LeaguePlayerPercentOwnedExpected = RequireResponsePath<
         YahooLeagueResponseDto,
         readonly ['league', 'players', 'percentOwned']
      >;
      type _LeaguePlayerPercentOwnedEqual = Assert<
         Equal<
            LeaguePlayerPercentOwnedActual,
            LeaguePlayerPercentOwnedExpected
         >
      >;

      type TeamStatsActual = Awaited<ReturnType<typeof teamStats.get>>;
      type TeamStatsExpected = RequireResponsePath<
         import('../domain/normalized.js').YahooTeamsResponseDto,
         readonly ['teams', 'teamStats']
      >;
      type _TeamStatsEqual = Assert<
         Equal<TeamStatsActual, TeamStatsExpected>
      >;

      type PlayerStatsActual = Awaited<ReturnType<typeof playerStats.get>>;
      type PlayerStatsExpected = RequireResponsePath<
         import('../domain/normalized.js').YahooPlayersResponseDto,
         readonly ['players', 'playerStats']
      >;
      type _PlayerStatsEqual = Assert<
         Equal<PlayerStatsActual, PlayerStatsExpected>
      >;

      type LeagueRoot = Awaited<
         ReturnType<ReturnType<typeof api.league>['get']>
      >;
      type _LeagueRootEqual = Assert<
         Equal<
            LeagueRoot,
            RequireResponsePath<YahooLeagueResponseDto, readonly ['league']>
         >
      >;

      expect(gameIncludes.toPath()).toContain(
         'game_weeks,stat_categories,position_types',
      );
   });

   it('enforces collection keys and game traversal capabilities at compile time', () => {
      const api = createApi(transport as HttpClient);
      const rootGames = api.games('465');
      const userGames = api.users().games();

      userGames.teams();
      userGames.leagues();
      rootGames.leagues('465.l.1');

      const compileInvalidRoutes = () => {
         // @ts-expect-error top-level game collections require keys
         api.games();
         // @ts-expect-error top-level game collections reject empty arrays
         api.games([]);
         // @ts-expect-error top-level league collections require keys
         api.leagues();
         // @ts-expect-error top-level league collections reject empty arrays
         api.leagues([]);
         // @ts-expect-error top-level team collections require keys
         api.teams();
         // @ts-expect-error top-level team collections reject empty arrays
         api.teams([]);
         // @ts-expect-error top-level player collections require keys
         api.players();
         // @ts-expect-error top-level player collections reject empty arrays
         api.players([]);
         // @ts-expect-error root game collections cannot traverse teams
         rootGames.teams();
         // @ts-expect-error root game-to-league traversal requires keys
         rootGames.leagues();
         // @ts-expect-error root game-to-league traversal rejects empty arrays
         rootGames.leagues([]);
         // @ts-expect-error singular game-to-league traversal rejects empty arrays
         api.game('465').leagues([]);
         // @ts-expect-error percent-owned is a child route, not an expansion
         api.player('465.p.1').include('percent_owned');
      };

      expect(compileInvalidRoutes).toBeFunction();
      expect(userGames.toPath()).toBe('users;use_login=1/games');
   });
});
