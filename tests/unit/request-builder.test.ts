import { describe, expect, it, mock } from 'bun:test';
import type { HttpClient } from '../../src/client/HttpClient.js';
import { createRequest, RequestBuilder } from '../../src/request/index.js';
import type { InferResponseType } from '../../src/types/query/context.js';
import type { Game } from '../../src/types/responses/game.js';
import type { League } from '../../src/types/responses/league.js';
import type { Player } from '../../src/types/responses/player.js';
import type { Team } from '../../src/types/responses/team.js';
import type { User, UserGame } from '../../src/types/responses/user.js';

type Equal<TLeft, TRight> =
   (<T>() => T extends TLeft ? 1 : 2) extends <T>() => T extends TRight
      ? 1
      : 2
      ? true
      : false;

type Expect<T extends true> = T;

type LeaguePlayersResult = InferResponseType<['league', string, 'players']>;
type TeamStandingsResult = InferResponseType<['team', string, 'standings']>;
type PlayerStatsResult = InferResponseType<['player', string, 'stats']>;
type GameWeeksResult = InferResponseType<['game', string, 'game_weeks']>;
type GamesCollectionResult = InferResponseType<['games']>;
type UserGamesResult = InferResponseType<['users', 'games']>;
type UserTeamsResult = InferResponseType<['users', 'games', 'teams']>;
type UserLeaguesResult = InferResponseType<['users', 'leagues']>;
type UserGameLeaguesResult = InferResponseType<
   ['users', 'games', 'leagues']
>;

type _LeaguePlayersIncludesPlayers = Expect<
   Equal<
      LeaguePlayersResult['league']['players'],
      NonNullable<League['players']>
   >
>;

type _TeamStandingsIncludesStandings = Expect<
   Equal<
      TeamStandingsResult['team']['teamStandings'],
      NonNullable<Team['teamStandings']>
   >
>;

type _PlayerStatsIncludesPlayerStats = Expect<
   Equal<
      PlayerStatsResult['player']['playerStats'],
      NonNullable<Player['playerStats']>
   >
>;

type _GameWeeksIncludesGameWeeks = Expect<
   Equal<
      GameWeeksResult['game']['gameWeeks'],
      NonNullable<Game['gameWeeks']>
   >
>;

type _GamesCollectionIncludesGames = Expect<
   Equal<GamesCollectionResult['games'][number], Game>
>;

type _UserGamesIncludesGames = Expect<
   Equal<
      UserGamesResult['users'][number]['games'],
      NonNullable<User['games']>
   >
>;

type _UserTeamsIncludesNestedTeams = Expect<
   Equal<
      UserTeamsResult['users'][number]['games'][number]['teams'],
      NonNullable<UserGame['teams']>
   >
>;

type _UserLeaguesIncludesDirectLeagues = Expect<
   Equal<
      UserLeaguesResult['users'][number]['leagues'],
      NonNullable<User['leagues']>
   >
>;

type _UserGameLeaguesIncludesNestedLeagues = Expect<
   Equal<
      UserGameLeaguesResult['users'][number]['games'][number]['leagues'],
      NonNullable<UserGame['leagues']>
   >
>;

const createMockHttpClient = (): HttpClient =>
   ({
      get: mock(async () => ({})),
      post: mock(async () => ({})),
      put: mock(async () => ({})),
      delete: mock(async () => ({})),
   }) as unknown as HttpClient;

describe('RequestBuilder', () => {
   describe('root resources', () => {
      it('builds a game resource path', () => {
         const path = createRequest(createMockHttpClient())
            .game('nfl')
            .buildPath();

         expect(path).toBe('/game/nfl');
      });

      it('builds a users resource path', () => {
         const path = createRequest(createMockHttpClient())
            .users()
            .buildPath();

         expect(path).toBe('/users');
      });

      it('builds a root games collection path', () => {
         const path = createRequest(createMockHttpClient())
            .games()
            .gameKeys(['nhl', 'nfl'])
            .buildPath();

         expect(path).toBe('/games;game_keys=nhl,nfl');
      });
   });

   describe('collections and sub-resources', () => {
      it('builds a league teams collection path', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .teams()
            .buildPath();

         expect(path).toBe('/league/423.l.12345/teams');
      });

      it('builds a user games leagues chain', () => {
         const path = createRequest(createMockHttpClient())
            .users()
            .useLogin()
            .games()
            .gameKeys('nfl')
            .leagues()
            .buildPath();

         expect(path).toBe(
            '/users;use_login=1/games;game_keys=nfl/leagues',
         );
      });

      it('builds a team roster players chain', () => {
         const path = createRequest(createMockHttpClient())
            .team('423.l.12345.t.1')
            .roster({ week: 10 })
            .players()
            .buildPath();

         expect(path).toBe('/team/423.l.12345.t.1/roster;week=10/players');
      });

      it('builds league settings via sub-resource method', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .settings()
            .buildPath();

         expect(path).toBe('/league/423.l.12345/settings');
      });
   });

   describe('parameters', () => {
      it('adds generic params to the current segment', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .players()
            .params({
               position: 'QB',
               status: 'A',
               sort: 'AR',
               count: 25,
            })
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345/players;position=QB;status=A;sort=AR;count=25',
         );
      });

      it('adds out params to a league resource', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .out(['settings', 'standings', 'scoreboard'])
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345;out=settings,standings,scoreboard',
         );
      });

      it('supports convenience parameter helpers', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .players()
            .position('QB')
            .status('A')
            .sort('AR')
            .count(25)
            .start(50)
            .search('Mahomes')
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345/players;position=QB;status=A;sort=AR;count=25;start=50;search=Mahomes',
         );
      });

      it('supports array values for key filters', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .teams()
            .teamKeys(['t.1', 't.2'])
            .buildPath();

         expect(path).toBe('/league/423.l.12345/teams;team_keys=t.1,t.2');
      });
   });

   describe('execution helpers', () => {
      it('executes GET requests with the built path', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue({
            users: [],
         });

         const result = await createRequest(httpClient)
            .users()
            .useLogin()
            .games()
            .teams()
            .execute();

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games/teams',
         );
         expect(result).toEqual({ users: [] });
      });

      it('executes POST requests with the built path and body', async () => {
         const httpClient = createMockHttpClient();
         const payload = { transaction: { type: 'add' } };

         await createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .post(payload);

         expect(httpClient.post).toHaveBeenCalledWith(
            '/league/423.l.12345/transactions',
            payload,
         );
      });
   });

   describe('stringification and errors', () => {
      it('returns the built path from toString()', () => {
         const builder = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .scoreboard();

         expect(builder.toString()).toBe('/league/423.l.12345/scoreboard');
      });

      it('returns a placeholder for an incomplete query', () => {
         const builder = new RequestBuilder(createMockHttpClient());

         expect(builder.toString()).toBe('<incomplete query>');
      });

      it('throws when building without segments', () => {
         const builder = new RequestBuilder(createMockHttpClient());

         expect(() => builder.buildPath()).toThrow(
            'Cannot build empty request',
         );
      });
   });

   describe('createRequest()', () => {
      it('creates a RequestBuilder instance', () => {
         const builder = createRequest(createMockHttpClient());

         expect(builder).toBeInstanceOf(RequestBuilder);
      });
   });
});
