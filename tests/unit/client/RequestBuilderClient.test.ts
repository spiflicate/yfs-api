/**
 * Unit tests for YahooFantasyClient request builder
 * Tests focus on:
 * - Correct path construction for various query chains
 * - Proper execution through the client's HTTP client
 * - Type safety of query responses (compile-time checks)
 *
 * Note: These tests use a mock HTTP client and do not make real API calls.
 * The type safety assertions are done using TypeScript's type system and will
 * cause compile errors if the inferred types do not match the expected response types.
 */

// biome-ignore-all lint/suspicious/noExplicitAny: This file contains unit tests with explicit any types for mocking purposes

import { describe, expect, mock, test } from 'bun:test';
import { createRequest } from '../../../src/builders/index.js';
import { TransactionBuilder } from '../../../src/builders/transaction.js';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import type { Config } from '../../../src/types/index.js';
import type { InferResponseType } from '../../../src/types/request/response-routes.js';
import type {
   GamesCollectionResponse,
   LeagueSettingsResponse,
   ResourceResponse,
   TeamRosterPlayersResponse,
   UserGameLeaguesResponse,
   UserTeamsResponse,
} from '../../../src/types/request/responses.js';
import type { RouteStage } from '../../../src/types/request/schema.js';

type Assert<T extends true> = T;
type IsEqual<A, B> =
   (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
      ? true
      : false;
type ExtractPath<TBuilder> = TBuilder extends {
   __pathType: infer TPath extends RouteStage;
}
   ? TPath
   : never;
type ExtractOut<TBuilder> = TBuilder extends {
   __outType: infer TOut;
}
   ? Extract<TOut, string>
   : never;

const typeOnlyHttpClient = null as unknown as HttpClient;

const leagueSettingsQuery = createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .settings();
type LeagueSettingsExecute = InferResponseType<
   ExtractPath<typeof leagueSettingsQuery>
>;
type LeagueSettingsExecuteAssertion = Assert<
   IsEqual<LeagueSettingsExecute, LeagueSettingsResponse>
>;
const leagueSettingsExecuteAssertion: LeagueSettingsExecuteAssertion = true;
void leagueSettingsExecuteAssertion;

const rootGamesQuery = createRequest(typeOnlyHttpClient).games();
type RootGamesExecute = InferResponseType<
   ExtractPath<typeof rootGamesQuery>
>;
type RootGamesExecuteAssertion = Assert<
   IsEqual<RootGamesExecute, GamesCollectionResponse>
>;
const rootGamesExecuteAssertion: RootGamesExecuteAssertion = true;
void rootGamesExecuteAssertion;

const userTeamsQuery = createRequest(typeOnlyHttpClient)
   .users()
   .useLogin()
   .games()
   .teams();
type UserTeamsExecute = InferResponseType<
   ExtractPath<typeof userTeamsQuery>
>;
type UserTeamsExecuteAssertion = Assert<
   IsEqual<UserTeamsExecute, UserTeamsResponse>
>;
const userTeamsExecuteAssertion: UserTeamsExecuteAssertion = true;
void userTeamsExecuteAssertion;

const userGameLeaguesQuery = createRequest(typeOnlyHttpClient)
   .users()
   .useLogin()
   .games()
   .leagues();
type UserGameLeaguesExecute = InferResponseType<
   ExtractPath<typeof userGameLeaguesQuery>
>;
type UserGameLeaguesExecuteAssertion = Assert<
   IsEqual<UserGameLeaguesExecute, UserGameLeaguesResponse>
>;
const userGameLeaguesExecuteAssertion: UserGameLeaguesExecuteAssertion = true;
void userGameLeaguesExecuteAssertion;

const rosterPlayersQuery = createRequest(typeOnlyHttpClient)
   .team('423.l.12345.t.1')
   .roster({ week: 1 })
   .players();
type RosterPlayersExecute = InferResponseType<
   ExtractPath<typeof rosterPlayersQuery>
>;
type RosterPlayersExecuteAssertion = Assert<
   IsEqual<RosterPlayersExecute, TeamRosterPlayersResponse>
>;
const rosterPlayersExecuteAssertion: RosterPlayersExecuteAssertion = true;
void rosterPlayersExecuteAssertion;

const expandedLeagueQuery = createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .out(['settings', 'standings']);
type ExpandedLeagueExecute = InferResponseType<
   ExtractPath<typeof expandedLeagueQuery>,
   ExtractOut<typeof expandedLeagueQuery>
>;
type ExpandedLeagueExecuteAssertion = Assert<
   IsEqual<
      ExpandedLeagueExecute,
      ResourceResponse<'league', 'settings' | 'standings'>
   >
>;
const expandedLeagueExecuteAssertion: ExpandedLeagueExecuteAssertion = true;
void expandedLeagueExecuteAssertion;

function assertCompileTimeRequestBuilderErrors(): void {
   // @ts-expect-error collection names are not valid out values on game()
   createRequest(typeOnlyHttpClient).game('nfl').out('leagues');

   createRequest(typeOnlyHttpClient)
      .users()
      .useLogin()
      .games()
      // @ts-expect-error collection names are not valid out values on users().games()
      .out('teams');

   // @ts-expect-error league() requires a Yahoo league key shape
   createRequest(typeOnlyHttpClient).league(12345);

   // @ts-expect-error players() is not a valid next chain after users().games()
   createRequest(typeOnlyHttpClient).users().games().players();

   // @ts-expect-error teams() is not a valid next chain after root games()
   createRequest(typeOnlyHttpClient).games().teams();

   // @ts-expect-error useLogin() is only valid on users() stage
   createRequest(typeOnlyHttpClient).games().useLogin();

   // @ts-expect-error gameKeys() is not valid on users() stage before games()
   createRequest(typeOnlyHttpClient).users().gameKeys('nhl');

   // @ts-expect-error out() is not valid on users() stage
   createRequest(typeOnlyHttpClient).users().out('settings');

   createRequest(typeOnlyHttpClient)
      .league('423.l.12345')
      // @ts-expect-error filters() only accepts a single filter object, never key/value pairs
      .filters('out', ['settings', 'standings']);

   createRequest(typeOnlyHttpClient)
      .league('423.l.12345')
      // @ts-expect-error out must be set with out(), not filters()
      .filters({ out: ['settings', 'standings'] });

   // @ts-expect-error game_keys is not valid on users() stage
   createRequest(typeOnlyHttpClient).users().filters({ game_keys: 'nhl' });

   // @ts-expect-error use_login is not valid on games() stage
   createRequest(typeOnlyHttpClient).games().filters({ use_login: '1' });

   createRequest(typeOnlyHttpClient)
      .league('423.l.12345')
      .players()
      // @ts-expect-error team_keys is not valid on league players() stage
      .filters({ team_keys: '423.l.12345.t.1' });

   createRequest(typeOnlyHttpClient)
      .team('423.l.12345.t.1')
      .roster({ week: 1 })
      // @ts-expect-error standings() is not a valid next chain after team roster()
      .standings();

   createRequest(typeOnlyHttpClient)
      .team('423.l.12345.t.1')
      // @ts-expect-error updateLineup() is only valid on the team roster() stage
      .updateLineup({
         coverageType: 'week',
         week: 1,
         players: [
            {
               playerKey: '423.p.1111',
               position: 'WR',
            },
         ],
      });
}

void assertCompileTimeRequestBuilderErrors;

createRequest(typeOnlyHttpClient).league('423.l.12345').players().filters({
   status: 'FA',
   count: 10,
});

createRequest(typeOnlyHttpClient)
   .team('423.l.12345.t.1')
   .roster({ week: 1 })
   .updateLineup({
      coverageType: 'week',
      week: 1,
      players: [
         {
            playerKey: '423.p.1111',
            position: 'WR',
         },
      ],
   });

createRequest(typeOnlyHttpClient)
   .games()
   .isAvailable()
   .gameTypes(['full', 'pickem-team'])
   .gameCodes(['nfl', 'mlb'])
   .seasons([2011, 2012]);

createRequest(typeOnlyHttpClient).games().filters({ game_types: 'full' });
createRequest(typeOnlyHttpClient).games().filters({ game_codes: 'nfl' });
createRequest(typeOnlyHttpClient).games().filters({ seasons: '2011' });

createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .transactions()
   .create(
      new TransactionBuilder()
         .forTeam('423.l.12345.t.1')
         .addPlayer('423.p.1111')
         .dropPlayer('423.p.2222'),
   );

createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .transactions()
   .create(
      new TransactionBuilder()
         .forTeam('423.l.12345.t.1')
         .dropPlayer('423.p.1111'),
   );

createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .transactions()
   .edit('423.l.12345.w.c.2_11', {
      transaction: {
         transaction_key: '423.l.12345.w.c.2_11',
         type: 'waiver',
         waiver_priority: 1,
      },
   });

createRequest(typeOnlyHttpClient)
   .transaction('423.l.12345.pt.7')
   .edit({
      transaction: {
         transaction_key: '423.l.12345.pt.7',
         type: 'pending_trade',
         action: 'accept',
      },
   });

createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .transactions()
   .cancel('423.l.12345.w.c.2_11');

createRequest(typeOnlyHttpClient)
   .transaction('423.l.12345.w.c.2_11')
   .cancel();

describe('client.request()', () => {
   const config: Config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
   };

   test('builds nested user collection paths', () => {
      const client = new YahooFantasyClient(config);

      const path = client
         .request()
         .users()
         .useLogin()
         .games()
         .gameKeys('nhl')
         .teams()
         .buildPath();

      expect(path).toBe('/users;use_login=1/games;game_keys=nhl/teams');
   });

   test('builds root games collection paths', () => {
      const client = new YahooFantasyClient(config);

      const path = client.request().games().gameKeys('nhl').buildPath();

      expect(path).toBe('/games;game_keys=nhl');
   });

   test('builds root games collection filter paths', () => {
      const client = new YahooFantasyClient(config);

      const path = client
         .request()
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

   test('executes through the client http client', async () => {
      const client = new YahooFantasyClient(config);
      const get = mock(async (_path: string) => ({ users: [] }));
      const httpClient = {
         get,
         post: mock(async () => ({})),
         put: mock(async () => ({})),
         delete: mock(async () => ({})),
      } as unknown as HttpClient;

      (client as unknown as { httpClient: HttpClient }).httpClient =
         httpClient;

      const result = await client
         .request()
         .users()
         .useLogin()
         .games()
         .teams()
         .execute();

      expect(get).toHaveBeenCalledWith('/users;use_login=1/games/teams');
      expect(result).toEqual({ users: [] });
   });

   test('builds roster player paths from team queries', () => {
      const client = new YahooFantasyClient(config);

      const path = client
         .request()
         .team('423.l.12345.t.1')
         .roster({ week: 10 })
         .players()
         .buildPath();

      expect(path).toBe('/team/423.l.12345.t.1;out=roster;week=10/players');
   });

   test('throws when create() is called outside transactions() stage', () => {
      expect(() =>
         createRequest(typeOnlyHttpClient)
            .team('423.l.12345.t.1')
            // @ts-expect-error create() is not valid on team transactions() stage
            .create(
               new TransactionBuilder()
                  .forTeam('423.l.12345.t.1')
                  .addPlayer('423.p.1111'),
            ),
      ).toThrow(
         'create can only be used on a league transactions collection request.',
      );
   });

   test('throws when edit() is called outside transaction write stages', () => {
      expect(() =>
         createRequest(typeOnlyHttpClient)
            .team('423.l.12345.t.1')
            // @ts-expect-error edit() is not valid on team stage
            .edit({ transaction: { type: 'waiver' } }),
      ).toThrow(
         'edit can only be used on a transaction resource or league transactions collection request.',
      );
   });

   test('throws when cancel() is called outside transaction write stages', () => {
      expect(() =>
         createRequest(typeOnlyHttpClient)
            .team('423.l.12345.t.1')
            // @ts-expect-error cancel() is not valid on team stage
            .cancel(),
      ).toThrow(
         'cancel can only be used on a transaction resource or league transactions collection request.',
      );
   });

   test('throws when updateLineup() is called outside the team roster stage', () => {
      expect(() =>
         createRequest(typeOnlyHttpClient)
            .team('423.l.12345.t.1')
            // @ts-expect-error updateLineup() is not valid on team stage
            .updateLineup({
               coverageType: 'week',
               week: 1,
               players: [
                  {
                     playerKey: '423.p.1111',
                     position: 'WR',
                  },
               ],
            }),
      ).toThrow('updateLineup can only be used on a team roster request.');
   });
});
