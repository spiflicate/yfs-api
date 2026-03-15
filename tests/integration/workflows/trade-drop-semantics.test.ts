/**
 * Integration scaffold: verifies whether Yahoo accepts dropped players in
 * pending_trade transactions when serialized by TransactionBuilder.
 *
 * This test is opt-in because it performs a write operation that creates a
 * live pending trade proposal in your league.
 *
 * Required env vars (in addition to OAuth2 token env vars):
 * - RUN_TRADE_DROP_SEMANTICS_TESTS=true
 * - TEST_LEAGUE_KEY=423.l.12345
 * - TEST_TRADER_TEAM_KEY=423.l.12345.t.1
 * - TEST_TRADEE_TEAM_KEY=423.l.12345.t.2
 * - TEST_SENT_PLAYER_KEY=423.p.1111
 * - TEST_DROPPED_PLAYER_KEY=423.p.2222
 */

import { beforeAll, describe, expect, test } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import { TransactionBuilder } from '../../../src/request/transaction.js';
import type {
   PlayerKey,
   TeamKey,
} from '../../../src/types/request/graph.js';
import {
   getOAuth2Config,
   getStoredTokens,
   hasStoredTokens,
   shouldSkipIntegrationTests,
} from '../helpers/testConfig.js';
import { InMemoryTokenStorage } from '../helpers/testStorage.js';

function hasTradeDropSemanticsConfig(): boolean {
   return (
      process.env.RUN_TRADE_DROP_SEMANTICS_TESTS === 'true' &&
      !!process.env.TEST_LEAGUE_KEY &&
      !!process.env.TEST_TRADER_TEAM_KEY &&
      !!process.env.TEST_TRADEE_TEAM_KEY &&
      !!process.env.TEST_SENT_PLAYER_KEY &&
      !!process.env.TEST_DROPPED_PLAYER_KEY
   );
}

function required(name: string): string {
   const value = process.env[name];
   if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
   }
   return value;
}

describe.skipIf(
   shouldSkipIntegrationTests() ||
      !hasStoredTokens() ||
      !hasTradeDropSemanticsConfig(),
)('Trade Drop Semantics Integration', () => {
   let client: YahooFantasyClient;

   beforeAll(async () => {
      const config = getOAuth2Config();
      const tokens = getStoredTokens();

      if (!tokens) {
         throw new Error('No stored tokens available for testing');
      }

      const storage = new InMemoryTokenStorage();
      storage.save(tokens);

      client = new YahooFantasyClient(config, storage);
      await client.loadTokens();
   });

   test('submits pending trade with dropPlayers payload', async () => {
      const leagueKey = required(
         'TEST_LEAGUE_KEY',
      ) as `${number}.l.${number}`;
      const traderTeamKey = required('TEST_TRADER_TEAM_KEY') as TeamKey;
      const tradeeTeamKey = required('TEST_TRADEE_TEAM_KEY') as TeamKey;
      const sentPlayerKey = required('TEST_SENT_PLAYER_KEY') as PlayerKey;
      const droppedPlayerKey = required(
         'TEST_DROPPED_PLAYER_KEY',
      ) as PlayerKey;

      const payload = new TransactionBuilder()
         .fromTeam(traderTeamKey)
         .toTeam(tradeeTeamKey)
         .sendPlayers([sentPlayerKey])
         .dropPlayers([droppedPlayerKey])
         .note('Integration semantics probe: pending_trade + dropPlayers')
         .toPayload();

      // This assertion locks current client behavior for the live probe.
      expect(payload).toEqual({
         transaction: {
            type: 'pending_trade',
            trader_team_key: traderTeamKey,
            tradee_team_key: tradeeTeamKey,
            trade_note:
               'Integration semantics probe: pending_trade + dropPlayers',
            players: {
               player: [
                  {
                     player_key: sentPlayerKey,
                     transaction_data: {
                        type: 'pending_trade',
                        source_team_key: traderTeamKey,
                        destination_team_key: tradeeTeamKey,
                     },
                  },
                  {
                     player_key: droppedPlayerKey,
                     transaction_data: {
                        type: 'pending_trade',
                        source_team_key: traderTeamKey,
                     },
                  },
               ],
            },
         },
      });

      // If Yahoo rejects this request, semantics may require type: 'drop'
      // for dropped trade players instead of type: 'pending_trade'.
      const response = await client
         .request()
         .league(leagueKey)
         .transactions()
         .create(
            new TransactionBuilder()
               .fromTeam(traderTeamKey)
               .toTeam(tradeeTeamKey)
               .sendPlayers([sentPlayerKey])
               .dropPlayers([droppedPlayerKey])
               .note(
                  'Integration semantics probe: pending_trade + dropPlayers',
               ),
         )
         .execute<Record<string, unknown>>();

      expect(response).toBeDefined();
   });
});
