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
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import { createRequest } from '../../../src/request/index.js';
import type { Config } from '../../../src/types/index.js';
import type { InferResponseType } from '../../../src/types/request/context.js';
import type {
   GamesCollectionResponse,
   LeagueSettingsResponse,
   TeamRosterPlayersResponse,
   UserGameLeaguesResponse,
   UserTeamsResponse,
} from '../../../src/types/request/responses.js';

type Assert<T extends true> = T;
type IsEqual<A, B> =
   (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
      ? true
      : false;
type ExtractPath<TBuilder> = TBuilder extends {
   __pathType: infer TPath extends string[];
}
   ? TPath
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

// @ts-expect-error league() requires a Yahoo league key shape
createRequest(typeOnlyHttpClient).league('nhl');

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

// @ts-expect-error game_keys is not valid on users() stage
createRequest(typeOnlyHttpClient).users().param('game_keys', 'nhl');

// @ts-expect-error use_login is not valid on games() stage
createRequest(typeOnlyHttpClient).games().param('use_login', '1');

createRequest(typeOnlyHttpClient)
   .league('423.l.12345')
   .players()
   // @ts-expect-error team_keys is not valid on league players() stage
   .param('team_keys', '423.l.12345.t.1');

createRequest(typeOnlyHttpClient).league('423.l.12345').players().params({
   status: 'FA',
   count: 10,
});

createRequest(typeOnlyHttpClient)
   .team('423.l.12345.t.1')
   .roster({ week: 1 })
   // @ts-expect-error standings() is not a valid next chain after team roster()
   .standings();

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

      expect(path).toBe('/team/423.l.12345.t.1/roster;week=10/players');
   });
});
