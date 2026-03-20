import { describe, expect, it, mock } from 'bun:test';
import { createRequest, RequestBuilder } from '../../src/builders/index.js';
import { TransactionBuilder } from '../../src/builders/transaction.js';
import type { HttpClient } from '../../src/client/HttpClient.js';
import { ValidationError } from '../../src/types/errors.js';
import type { InferResponseType } from '../../src/types/request/response-routes.js';
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

type LeaguePlayersResult = InferResponseType<'league.players'>;
type TeamStandingsResult = InferResponseType<'team.standings'>;
type PlayerStatsResult = InferResponseType<'player.stats'>;
type GameWeeksResult = InferResponseType<'game.game_weeks'>;
type GamesCollectionResult = InferResponseType<'games'>;
type UserGamesResult = InferResponseType<'users.games'>;
type UserTeamsResult = InferResponseType<'users.games.teams'>;
type UserLeaguesResult = InferResponseType<'users.leagues'>;
type UserGameLeaguesResult = InferResponseType<'users.games.leagues'>;

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

      it('builds a transaction resource path', () => {
         const path = createRequest(createMockHttpClient())
            .transaction('257.l.193.pt.1')
            .buildPath();

         expect(path).toBe('/transaction/257.l.193.pt.1');
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

         expect(path).toBe(
            '/team/423.l.12345.t.1;out=roster;week=10/players',
         );
      });

      it('builds league settings via sub-resource method', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .settings()
            .buildPath();

         expect(path).toBe('/league/423.l.12345;out=settings');
      });

      it('builds league drafts via sub-resource method', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .drafts()
            .buildPath();

         expect(path).toBe('/league/423.l.12345;out=drafts');
      });

      it('rejects invalid runtime stage transitions without mutating the builder', () => {
         const builder = createRequest(createMockHttpClient()).league(
            '423.l.12345',
         ) as RequestBuilder<'league'> & {
            games(): unknown;
         };

         expect(() => builder.games()).toThrow(
            'games is not valid for the current request stage league.',
         );
         expect(builder.buildPath()).toBe('/league/423.l.12345');
      });
   });

   describe('documented path examples', () => {
      const cases = [
         {
            name: 'builds the current user games path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .users()
                  .useLogin()
                  .games()
                  .buildPath(),
            expected: '/users;use_login=1/games',
         },
         {
            name: 'builds the current user game leagues path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nfl')
                  .leagues()
                  .buildPath(),
            expected: '/users;use_login=1/games;game_keys=nfl/leagues',
         },
         {
            name: 'builds the current user filtered teams path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nfl')
                  .teams()
                  .buildPath(),
            expected: '/users;use_login=1/games;game_keys=nfl/teams',
         },
         {
            name: 'builds a games collection filtered by codes and seasons',
            actual: () =>
               createRequest(createMockHttpClient())
                  .games()
                  .gameCodes(['nfl', 'mlb'])
                  .seasons(2011)
                  .buildPath(),
            expected: '/games;game_codes=nfl,mlb;seasons=2011',
         },
         {
            name: 'builds a game leagues collection path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .game('nfl')
                  .leagues()
                  .buildPath(),
            expected: '/game/nfl/leagues',
         },
         {
            name: 'builds a game stat categories expansion path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .game('nfl')
                  .out(['stat_categories', 'position_types'])
                  .buildPath(),
            expected: '/game/nfl;out=stat_categories,position_types',
         },
         {
            name: 'builds a game players collection path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .game('257')
                  .players()
                  .buildPath(),
            expected: '/game/257/players',
         },
         {
            name: 'builds a game stat categories path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .game('257')
                  .statCategories()
                  .buildPath(),
            expected: '/game/257;out=stat_categories',
         },
         {
            name: 'builds a league players path filtered by player keys',
            actual: () =>
               createRequest(createMockHttpClient())
                  .league('223.l.431')
                  .players()
                  .playerKeys('223.p.5479')
                  .buildPath(),
            expected: '/league/223.l.431/players;player_keys=223.p.5479',
         },
         {
            name: 'builds a league players path with availability filters',
            actual: () =>
               createRequest(createMockHttpClient())
                  .league('223.l.431')
                  .players()
                  .status('A')
                  .position('QB')
                  .sort('PTS')
                  .count(25)
                  .buildPath(),
            expected:
               '/league/223.l.431/players;status=A;position=QB;sort=PTS;count=25',
         },
         {
            name: 'builds a league transactions path filtered by team and type',
            actual: () =>
               createRequest(createMockHttpClient())
                  .league('223.l.431')
                  .transactions()
                  .teamKey('257.l.193.t.1')
                  .type('waiver')
                  .buildPath(),
            expected:
               '/league/223.l.431/transactions;team_key=257.l.193.t.1;type=waiver',
         },
         {
            name: 'builds a team path with roster and stats expansions',
            actual: () =>
               createRequest(createMockHttpClient())
                  .team('223.l.431.t.1')
                  .out(['roster', 'stats'])
                  .buildPath(),
            expected: '/team/223.l.431.t.1;out=roster,stats',
         },
         {
            name: 'builds a team matchups path for multiple weeks',
            actual: () =>
               createRequest(createMockHttpClient())
                  .team('223.l.431.t.1')
                  .matchups({ weeks: '1,5' })
                  .buildPath(),
            expected: '/team/223.l.431.t.1;out=matchups;weeks=1,5',
         },
         {
            name: 'builds a team stats path for season coverage',
            actual: () =>
               createRequest(createMockHttpClient())
                  .team('223.l.431.t.1')
                  .stats({ type: 'season' })
                  .buildPath(),
            expected: '/team/223.l.431.t.1;out=stats;type=season',
         },
         {
            name: 'builds a team stats path for date coverage',
            actual: () =>
               createRequest(createMockHttpClient())
                  .team('253.l.102614.t.10')
                  .stats({ type: 'date', date: '2011-07-06' })
                  .buildPath(),
            expected:
               '/team/253.l.102614.t.10;out=stats;type=date;date=2011-07-06',
         },
         {
            name: 'builds a player ownership path',
            actual: () =>
               createRequest(createMockHttpClient())
                  .player('223.p.5479')
                  .ownership()
                  .buildPath(),
            expected: '/player/223.p.5479;out=ownership',
         },
      ];

      for (const testCase of cases) {
         it(testCase.name, () => {
            expect(testCase.actual()).toBe(testCase.expected);
         });
      }
   });

   describe('filters and out selections', () => {
      it('supports games collection filter helpers', () => {
         const path = createRequest(createMockHttpClient())
            .games()
            .isAvailable()
            .gameTypes(['full', 'pickem-team'])
            .gameCodes(['nfl', 'mlb'])
            .seasons([2011, 2012])
            .buildPath();

         expect(path).toBe(
            '/games;is_available=1;game_types=full,pickem-team;game_codes=nfl,mlb;seasons=2011,2012',
         );
      });

      it('supports games collection filters through filters()', () => {
         const path = createRequest(createMockHttpClient())
            .games()
            .filters({
               is_available: '1',
               game_types: 'full,pickem-team',
               game_codes: 'nfl,mlb',
               seasons: '2011,2012',
            })
            .buildPath();

         expect(path).toBe(
            '/games;is_available=1;game_types=full,pickem-team;game_codes=nfl,mlb;seasons=2011,2012',
         );
      });

      it('adds filters to the current segment', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .players()
            .filters({
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

      it('adds out selections to a league resource', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .out(['settings', 'standings', 'scoreboard'])
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345;out=settings,standings,scoreboard',
         );
      });

      it('rejects out passed through filters() at runtime', () => {
         const builder = createRequest(createMockHttpClient()).league(
            '423.l.12345',
         ) as RequestBuilder<'league'> & {
            filters(
               filters: Record<string, string | string[] | number>,
            ): unknown;
         };

         expect(() =>
            builder.filters({ out: ['settings', 'standings'] }),
         ).toThrow('out must be set with out(), not filters().');
         expect(builder.buildPath()).toBe('/league/423.l.12345');
      });

      it('supports convenience filter helpers', () => {
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

      it('normalizes Date values passed to date()', () => {
         const path = createRequest(createMockHttpClient())
            .team('423.l.12345.t.1')
            .roster()
            .date(new Date(2024, 10, 15))
            .buildPath();

         expect(path).toBe(
            '/team/423.l.12345.t.1;out=roster;date=2024-11-15',
         );
      });

      it('validates date() string format', () => {
         expect(() =>
            createRequest(createMockHttpClient())
               .team('423.l.12345.t.1')
               .roster()
               .date('Sun Mar 15 2026')
               .buildPath(),
         ).toThrow(ValidationError);
      });

      it('normalizes Date values passed via roster sub-resource filters', () => {
         const path = createRequest(createMockHttpClient())
            .team('423.l.12345.t.1')
            .roster({ date: new Date(2024, 10, 15) })
            .buildPath();

         expect(path).toBe(
            '/team/423.l.12345.t.1;out=roster;date=2024-11-15',
         );
      });

      it('supports array values for key filters', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .teams()
            .teamKeys(['423.l.12345.t.1', '423.l.12345.t.2'])
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2',
         );
      });

      it('supports transaction collection filter helpers', () => {
         const path = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .transactions()
            .teamKey('423.l.12345.t.1')
            .type('waiver')
            .types(['add', 'trade'])
            .count(5)
            .start(10)
            .buildPath();

         expect(path).toBe(
            '/league/423.l.12345/transactions;team_key=423.l.12345.t.1;type=waiver;types=add,trade;count=5;start=10',
         );
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

         expect(httpClient.post).toHaveBeenCalledTimes(1);
         const [path, body, options] = (
            httpClient.post as ReturnType<typeof mock>
         ).mock.calls[0] as [string, string, unknown];

         expect(path).toBe('/league/423.l.12345/transactions');
         expect(typeof body).toBe('string');
         expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
         expect(body).toContain('<fantasy_content>');
         expect(body).toContain(
            '<transaction><type>add</type></transaction>',
         );
         expect(options).toBeUndefined();
      });

      it('executes POST requests with XML body and options', async () => {
         const httpClient = createMockHttpClient();
         const payload =
            "<?xml version='1.0'?><fantasy_content><transaction><type>pending_trade</type></transaction></fantasy_content>";
         const options = {
            headers: { 'Content-Type': 'application/xml' },
         };

         await createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .post(payload, options);

         expect(httpClient.post).toHaveBeenCalledWith(
            '/league/423.l.12345/transactions',
            payload,
            options,
         );
      });

      it('executes PUT requests against a transaction resource', async () => {
         const httpClient = createMockHttpClient();
         const payload = { transaction: { action: 'accept' } };

         await createRequest(httpClient)
            .transaction('257.l.193.pt.1')
            .put(payload);

         expect(httpClient.put).toHaveBeenCalledTimes(1);
         const [path, body, options] = (
            httpClient.put as ReturnType<typeof mock>
         ).mock.calls[0] as [string, string, unknown];

         expect(path).toBe('/transaction/257.l.193.pt.1');
         expect(typeof body).toBe('string');
         expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
         expect(body).toContain('<fantasy_content>');
         expect(body).toContain(
            '<transaction><action>accept</action></transaction>',
         );
         expect(options).toBeUndefined();
      });

      it('executes PUT requests against a team roster resource with Yahoo roster XML payloads', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .team('423.l.12345.t.1')
            .roster({ week: 13 })
            .put({
               roster: {
                  coverage_type: 'week',
                  week: 13,
                  players: {
                     player: [
                        {
                           player_key: '423.p.8332',
                           position: 'WR',
                        },
                        {
                           player_key: '423.p.1423',
                           position: 'BN',
                        },
                     ],
                  },
               },
            });

         expect(httpClient.put).toHaveBeenCalledTimes(1);
         const [path, body, options] = (
            httpClient.put as ReturnType<typeof mock>
         ).mock.calls[0] as [string, string, unknown];

         expect(path).toBe('/team/423.l.12345.t.1;out=roster;week=13');
         expect(typeof body).toBe('string');
         expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
         expect(body).toContain('<fantasy_content>');
         expect(body).toContain(
            '<roster><coverage_type>week</coverage_type><week>13</week>',
         );
         expect(body).toContain(
            '<player_key>423.p.8332</player_key><position>WR</position>',
         );
         expect(body).toContain(
            '<player_key>423.p.1423</player_key><position>BN</position>',
         );
         expect(options).toBeUndefined();
      });

      it('supports roster().updateLineup(...).execute() helper for weekly lineups', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .team('423.l.12345.t.1')
            .roster()
            .updateLineup({
               coverageType: 'week',
               week: 13,
               players: [
                  {
                     playerKey: '423.p.8332',
                     position: 'WR',
                  },
                  {
                     playerKey: '423.p.1423',
                     position: 'BN',
                  },
               ],
            })
            .execute();

         expect(httpClient.put).toHaveBeenCalledTimes(1);
         expect(httpClient.put).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1;out=roster',
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><roster><coverage_type>week</coverage_type><players><player><player_key>423.p.8332</player_key><position>WR</position></player><player><player_key>423.p.1423</player_key><position>BN</position></player></players><week>13</week></roster></fantasy_content>',
            undefined,
         );
      });

      it('supports roster().updateLineup(...).execute() helper for daily lineups', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .team('423.l.12345.t.1')
            .roster()
            .updateLineup({
               coverageType: 'date',
               date: '2026-03-15',
               players: [
                  {
                     playerKey: '423.p.9988',
                     position: '1B',
                  },
               ],
            })
            .execute();

         expect(httpClient.put).toHaveBeenCalledTimes(1);
         expect(httpClient.put).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1;out=roster',
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><roster><coverage_type>date</coverage_type><players><player><player_key>423.p.9988</player_key><position>1B</position></player></players><date>2026-03-15</date></roster></fantasy_content>',
            undefined,
         );
      });

      it('supports transactions create(transactionBuilder).execute() flow', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .dropPlayer('423.p.4444')
                  .addPlayer('423.p.3333')
                  .bid(24),
            )
            .execute();

         expect(httpClient.post).toHaveBeenCalledTimes(1);
         const [path, body] = (httpClient.post as ReturnType<typeof mock>)
            .mock.calls[0] as [string, string];

         expect(path).toBe('/league/423.l.12345/transactions');
         expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
         expect(body).toContain('<type>add/drop</type>');
         expect(body).toContain('<faab_bid>24</faab_bid>');
         expect(body).toContain('<player_key>423.p.3333</player_key>');
         expect(body).toContain('<player_key>423.p.4444</player_key>');
      });

      it('throws when execute() is called again after a staged write request is consumed', async () => {
         const httpClient = createMockHttpClient();
         const txBuilder = createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .dropPlayer('423.p.4444'),
            );

         await txBuilder.execute();

         await expect(txBuilder.execute()).rejects.toThrow(
            'Cannot call execute() again after a staged write request has already been sent.',
         );

         expect(httpClient.post).toHaveBeenCalledTimes(1);
         expect(httpClient.get).toHaveBeenCalledTimes(0);
      });

      it('allows execute() after staging a new write request', async () => {
         const httpClient = createMockHttpClient();
         const txBuilder = createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .dropPlayer('423.p.4444'),
            );

         await txBuilder.execute();

         txBuilder.create(
            new TransactionBuilder()
               .forTeam('423.l.12345.t.1')
               .dropPlayer('423.p.5555'),
         );

         await txBuilder.execute();

         expect(httpClient.post).toHaveBeenCalledTimes(2);
      });

      it('allows retrying a staged POST request after execute() failure', async () => {
         const httpClient = createMockHttpClient();
         const postMock = httpClient.post as ReturnType<typeof mock>;
         postMock
            .mockImplementationOnce(async () => {
               throw new Error('transient post error');
            })
            .mockImplementationOnce(async () => ({ ok: true }));

         const txBuilder = createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .dropPlayer('423.p.4444'),
            );

         await expect(txBuilder.execute()).rejects.toThrow(
            'transient post error',
         );

         await expect(txBuilder.execute()).resolves.toBeDefined();
         expect(httpClient.post).toHaveBeenCalledTimes(2);
      });

      it('allows retrying a staged PUT request after execute() failure', async () => {
         const httpClient = createMockHttpClient();
         const putMock = httpClient.put as ReturnType<typeof mock>;
         putMock
            .mockImplementationOnce(async () => {
               throw new Error('transient put error');
            })
            .mockImplementationOnce(async () => ({ ok: true }));

         const txBuilder = createRequest(httpClient)
            .transaction('257.l.193.pt.1')
            .edit({ transaction: { action: 'accept' } });

         await expect(txBuilder.execute()).rejects.toThrow(
            'transient put error',
         );

         await expect(txBuilder.execute()).resolves.toBeDefined();
         expect(httpClient.put).toHaveBeenCalledTimes(2);
      });

      it('allows retrying a staged DELETE request after execute() failure', async () => {
         const httpClient = createMockHttpClient();
         const deleteMock = httpClient.delete as ReturnType<typeof mock>;
         deleteMock
            .mockImplementationOnce(async () => {
               throw new Error('transient delete error');
            })
            .mockImplementationOnce(async () => ({ ok: true }));

         const txBuilder = createRequest(httpClient)
            .transaction('257.l.193.pt.1')
            .cancel();

         await expect(txBuilder.execute()).rejects.toThrow(
            'transient delete error',
         );

         await expect(txBuilder.execute()).resolves.toBeDefined();
         expect(httpClient.delete).toHaveBeenCalledTimes(2);
      });

      it('serializes add/drop transaction create() payload to expected Yahoo XML', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('238.l.627060')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('238.l.627060.t.6')
                  .addPlayer('238.p.5484')
                  .dropPlayer('238.p.6327')
                  .bid(25),
            )
            .execute();

         const [, body] = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0] as [string, string];

         expect(body).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><transaction><type>add/drop</type><faab_bid>25</faab_bid><players><player><player_key>238.p.5484</player_key><transaction_data><type>add</type><destination_team_key>238.l.627060.t.6</destination_team_key></transaction_data></player><player><player_key>238.p.6327</player_key><transaction_data><type>drop</type><source_team_key>238.l.627060.t.6</source_team_key></transaction_data></player></players></transaction></fantasy_content>',
         );
      });

      it('serializes pending trade POST payload to expected Yahoo XML', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('248.l.55438')
            .transactions()
            .post({
               transaction: {
                  type: 'pending_trade',
                  trader_team_key: '248.l.55438.t.11',
                  tradee_team_key: '248.l.55438.t.4',
                  trade_note: 'Yo yo yo yo yo!!!',
                  players: {
                     player: [
                        {
                           player_key: '248.p.4130',
                           transaction_data: {
                              type: 'pending_trade',
                              source_team_key: '248.l.55438.t.11',
                              destination_team_key: '248.l.55438.t.4',
                           },
                        },
                        {
                           player_key: '248.p.2415',
                           transaction_data: {
                              type: 'pending_trade',
                              source_team_key: '248.l.55438.t.4',
                              destination_team_key: '248.l.55438.t.11',
                           },
                        },
                     ],
                  },
               },
            });

         const [, body] = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0] as [string, string];

         expect(body).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><transaction><type>pending_trade</type><trader_team_key>248.l.55438.t.11</trader_team_key><tradee_team_key>248.l.55438.t.4</tradee_team_key><trade_note>Yo yo yo yo yo!!!</trade_note><players><player><player_key>248.p.4130</player_key><transaction_data><type>pending_trade</type><source_team_key>248.l.55438.t.11</source_team_key><destination_team_key>248.l.55438.t.4</destination_team_key></transaction_data></player><player><player_key>248.p.2415</player_key><transaction_data><type>pending_trade</type><source_team_key>248.l.55438.t.4</source_team_key><destination_team_key>248.l.55438.t.11</destination_team_key></transaction_data></player></players></transaction></fantasy_content>',
         );
      });

      it('serializes pending trade PUT action payload to expected Yahoo XML', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .transaction('248.l.55438.pt.11')
            .put({
               transaction: {
                  transaction_key: '248.l.55438.pt.11',
                  type: 'pending_trade',
                  action: 'accept',
                  trade_note: 'Dude, that is a totally fair trade.',
               },
            });

         const [, body] = (httpClient.put as ReturnType<typeof mock>).mock
            .calls[0] as [string, string];

         expect(body).toBe(
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><transaction><transaction_key>248.l.55438.pt.11</transaction_key><type>pending_trade</type><action>accept</action><trade_note>Dude, that is a totally fair trade.</trade_note></transaction></fantasy_content>',
         );
      });

      it('supports transactions create() for drop-only flow', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('423.l.12345')
            .transactions()
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .dropPlayer('423.p.4444'),
            )
            .execute();

         expect(httpClient.post).toHaveBeenCalledTimes(1);
         const [, body] = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0] as [string, string];

         expect(body).toContain('<type>drop</type>');
         expect(body).toContain(
            '<source_team_key>423.l.12345.t.1</source_team_key>',
         );
      });

      it('supports transactions().edit(...).execute() dispatch to transaction resource path', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('248.l.55438')
            .transactions()
            .edit('248.l.55438.w.c.2_6093', {
               transaction: {
                  transaction_key: '248.l.55438.w.c.2_6093',
                  type: 'waiver',
                  waiver_priority: 1,
                  faab_bid: 20,
               },
            })
            .execute();

         expect(httpClient.put).toHaveBeenCalledTimes(1);
         const [path, body] = (httpClient.put as ReturnType<typeof mock>)
            .mock.calls[0] as [string, string];

         expect(path).toBe('/transaction/248.l.55438.w.c.2_6093');
         expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
         expect(body).toContain('<type>waiver</type>');
         expect(body).toContain('<waiver_priority>1</waiver_priority>');
         expect(body).toContain('<faab_bid>20</faab_bid>');
      });

      it('supports transaction().edit(...).execute() helper dispatch', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .transaction('248.l.55438.pt.11')
            .edit({
               transaction: {
                  transaction_key: '248.l.55438.pt.11',
                  type: 'pending_trade',
                  action: 'accept',
               },
            })
            .execute();

         expect(httpClient.put).toHaveBeenCalledWith(
            '/transaction/248.l.55438.pt.11',
            '<?xml version="1.0" encoding="UTF-8"?><fantasy_content><transaction><transaction_key>248.l.55438.pt.11</transaction_key><type>pending_trade</type><action>accept</action></transaction></fantasy_content>',
            undefined,
         );
      });

      it('throws when updateLineup() is used without the required coverage value', () => {
         expect(() =>
            createRequest(createMockHttpClient())
               .team('423.l.12345.t.1')
               .roster()
               .updateLineup({
                  coverageType: 'week',
                  players: [
                     {
                        playerKey: '423.p.8332',
                        position: 'WR',
                     },
                  ],
               }),
         ).toThrow('updateLineup requires week when coverageType is week.');
      });

      it('supports transactions().cancel(...).execute() dispatch to transaction resource path', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .league('257.l.193')
            .transactions()
            .cancel('257.l.193.w.c.2_6390')
            .execute();

         expect(httpClient.delete).toHaveBeenCalledWith(
            '/transaction/257.l.193.w.c.2_6390',
            undefined,
         );
      });

      it('supports transaction().cancel().execute() helper dispatch', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .transaction('257.l.193.w.c.2_6390')
            .cancel()
            .execute();

         expect(httpClient.delete).toHaveBeenCalledWith(
            '/transaction/257.l.193.w.c.2_6390',
            undefined,
         );
      });

      it('executes DELETE requests against a transaction resource', async () => {
         const httpClient = createMockHttpClient();

         await createRequest(httpClient)
            .transaction('257.l.193.w.c.2_6390')
            .delete();

         expect(httpClient.delete).toHaveBeenCalledWith(
            '/transaction/257.l.193.w.c.2_6390',
            undefined,
         );
      });
   });

   describe('stringification and errors', () => {
      it('returns the built path from toString()', () => {
         const builder = createRequest(createMockHttpClient())
            .league('423.l.12345')
            .scoreboard();

         expect(builder.toString()).toBe(
            '/league/423.l.12345;out=scoreboard',
         );
      });

      it('returns a placeholder for an incomplete request', () => {
         const builder = new RequestBuilder(createMockHttpClient());

         expect(builder.toString()).toBe('<incomplete request>');
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
