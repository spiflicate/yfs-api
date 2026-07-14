import { describe, expect, it } from 'bun:test';
import type { HttpClient } from '../client/http';
import type {
   YahooGameResponseDto,
   YahooLeagueResponseDto,
   YahooLoggedInUsersResponseDto,
   YahooPlayerResponseDto,
} from '../domain/normalized';
import { ApiRoot, createApi } from './api';
import type { RequireResponsePath } from './response-contract';

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

   it('carries exact root response types through validated chains', () => {
      const api = createApi(transport as HttpClient);
      const gameIncludes = api
         .game('465')
         .include('game_weeks', 'stat_categories', 'position_types');
      const leagueTeams = api.game('465').leagues('465.l.1').teams();
      const userTeams = api.users().games().teams().roster().players();
      const leagueRoster = api.leagues('465.l.1').teams().roster();
      const playerIncludes = api
         .player('465.p.1')
         .include('ownership', 'percent_owned');
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

      type UserTeamsActual = Awaited<ReturnType<typeof userTeams.get>>;
      type UserTeamsExpected = RequireResponsePath<
         YahooLoggedInUsersResponseDto,
         readonly ['users', 'games', 'teams', 'roster', 'players']
      >;
      type _UserTeamsEqual = Assert<
         Equal<UserTeamsActual, UserTeamsExpected>
      >;

      type LeagueRosterActual = Awaited<
         ReturnType<typeof leagueRoster.get>
      >;
      type LeagueRosterExpected = RequireResponsePath<
         import('../domain/normalized').YahooLeaguesResponseDto,
         readonly ['leagues', 'teams', 'roster']
      >;
      type _LeagueRosterEqual = Assert<
         Equal<LeagueRosterActual, LeagueRosterExpected>
      >;

      type PlayerActual = Awaited<ReturnType<typeof playerIncludes.get>>;
      type PlayerExpected = RequireResponsePath<
         YahooPlayerResponseDto,
         | readonly ['player']
         | readonly ['player', 'ownership']
         | readonly ['player', 'percentOwned']
      >;
      type _PlayerEqual = Assert<Equal<PlayerActual, PlayerExpected>>;

      type TeamStatsActual = Awaited<ReturnType<typeof teamStats.get>>;
      type TeamStatsExpected = RequireResponsePath<
         import('../domain/normalized').YahooTeamsResponseDto,
         readonly ['teams', 'teamStats']
      >;
      type _TeamStatsEqual = Assert<
         Equal<TeamStatsActual, TeamStatsExpected>
      >;

      type PlayerStatsActual = Awaited<ReturnType<typeof playerStats.get>>;
      type PlayerStatsExpected = RequireResponsePath<
         import('../domain/normalized').YahooPlayersResponseDto,
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
});
