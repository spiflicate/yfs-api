/**
 * Example: Transaction Fluent API
 *
 * Demonstrates how to use the request builder for transaction read and write
 * flows introduced in v2.0.0-beta.2:
 *
 *   - Reading the league transactions collection with typed filters
 *   - Fetching a single transaction resource (completed, waiver, pending trade)
 *   - Creating transactions via POST (add, drop, add/drop, propose trade)
 *   - Editing pending transactions via PUT (waiver priority, FAAB bid, trade actions)
 *   - Cancelling pending transactions via DELETE
 *
 * Prerequisites:
 *   - A Yahoo Developer Application configured for OAuth 2.0
 *   - Environment variables set:
 *       YAHOO_CLIENT_ID=your-client-id
 *       YAHOO_CLIENT_SECRET=your-client-secret
 *       YAHOO_REDIRECT_URI=your-redirect-uri
 *
 * To run (path-only mode — no real API calls, just shows the paths/payloads):
 *   bun run examples/request-builder/02-transactions.ts --path-only
 *
 * To run against the live API (requires valid tokens saved in .test-tokens.json):
 *   bun run examples/request-builder/02-transactions.ts
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { OAuth2Tokens, TokenStorage } from '../../src/index.js';
import { YahooFantasyClient } from '../../src/index.js';

// ---------------------------------------------------------------------------
// Configuration — replace these with real keys when using against the live API
// ---------------------------------------------------------------------------
const LEAGUE_KEY = process.env.LEAGUE_KEY ?? '423.l.12345';
const TEAM_KEY = process.env.TEAM_KEY ?? '423.l.12345.t.1';

// Typical completed-transaction key: {game}.l.{league}.tr.{id}
const COMPLETED_TRANSACTION_KEY = '423.l.12345.tr.26';
// Waiver claim key: {game}.l.{league}.w.c.{id}
const WAIVER_TRANSACTION_KEY = '423.l.12345.w.c.2_6390';
// Pending trade key: {game}.l.{league}.pt.{id}
const PENDING_TRADE_KEY = '423.l.12345.pt.1';

const ADD_PLAYER_KEY = '423.p.8888';
const DROP_PLAYER_KEY = '423.p.9999';
const TRADE_PLAYER_GIVE = '423.p.4130';
const TRADE_PLAYER_RECEIVE = '423.p.2415';
const TRADEE_TEAM_KEY = '423.l.12345.t.4';

const pathOnly = process.argv.includes('--path-only');

// ---------------------------------------------------------------------------
// Token storage (file-based — same pattern as other examples)
// ---------------------------------------------------------------------------
const tokenFile = path.join(process.cwd(), '.test-tokens.json');
const storage: TokenStorage = {
   async save(tokens: OAuth2Tokens) {
      await fs.writeFile(tokenFile, JSON.stringify(tokens, null, 2));
   },
   async load(): Promise<OAuth2Tokens | null> {
      try {
         const data = await fs.readFile(tokenFile, 'utf-8');
         return JSON.parse(data);
      } catch {
         return null;
      }
   },
   async clear() {
      try {
         await fs.unlink(tokenFile);
      } catch {
         // no-op
      }
   },
};

// ---------------------------------------------------------------------------
// XML helpers — build the request bodies expected by the Yahoo API
// ---------------------------------------------------------------------------

/** Add a player from free agents to your team */
function buildAddBody(
   playerKey: string,
   destinationTeamKey: string,
): string {
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>${playerKey}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>${destinationTeamKey}</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>`;
}

/** Drop a player from your team to waivers */
function buildDropBody(playerKey: string, sourceTeamKey: string): string {
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>${playerKey}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>${sourceTeamKey}</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>`;
}

/** Atomic add/drop — add one player, drop another in one transaction.
 *  Optionally include a FAAB bid for leagues using FAAB waiver rules. */
function buildAddDropBody(
   addPlayerKey: string,
   dropPlayerKey: string,
   teamKey: string,
   faabBid?: number,
): string {
   const faabLine =
      faabBid !== undefined ? `\n    <faab_bid>${faabBid}</faab_bid>` : '';
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>${faabLine}
    <players>
      <player>
        <player_key>${addPlayerKey}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>${teamKey}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>${dropPlayerKey}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>${teamKey}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>`;
}

/** Propose a trade between two teams */
function buildProposeTradeBody(
   traderTeamKey: string,
   tradeeTeamKey: string,
   givePlayerKey: string,
   receivePlayerKey: string,
   note?: string,
): string {
   const noteLine = note ? `\n    <trade_note>${note}</trade_note>` : '';
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <type>pending_trade</type>
    <trader_team_key>${traderTeamKey}</trader_team_key>
    <tradee_team_key>${tradeeTeamKey}</tradee_team_key>${noteLine}
    <players>
      <player>
        <player_key>${givePlayerKey}</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>${traderTeamKey}</source_team_key>
          <destination_team_key>${tradeeTeamKey}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>${receivePlayerKey}</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>${tradeeTeamKey}</source_team_key>
          <destination_team_key>${traderTeamKey}</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>`;
}

/** Accept, reject, allow, disallow, or vote_against a pending trade */
function buildTradeActionBody(
   transactionKey: string,
   action: 'accept' | 'reject' | 'allow' | 'disallow' | 'vote_against',
   voterTeamKey?: string,
   note?: string,
): string {
   const noteLine = note ? `\n    <trade_note>${note}</trade_note>` : '';
   const voterLine = voterTeamKey
      ? `\n    <voter_team_key>${voterTeamKey}</voter_team_key>`
      : '';
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <transaction_key>${transactionKey}</transaction_key>
    <type>pending_trade</type>
    <action>${action}</action>${noteLine}${voterLine}
  </transaction>
</fantasy_content>`;
}

/** Update waiver priority and/or FAAB bid on an existing waiver claim */
function buildEditWaiverBody(
   transactionKey: string,
   waiverPriority?: number,
   faabBid?: number,
): string {
   const priorityLine =
      waiverPriority !== undefined
         ? `\n    <waiver_priority>${waiverPriority}</waiver_priority>`
         : '';
   const faabLine =
      faabBid !== undefined ? `\n    <faab_bid>${faabBid}</faab_bid>` : '';
   return `<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <transaction_key>${transactionKey}</transaction_key>
    <type>waiver</type>${priorityLine}${faabLine}
  </transaction>
</fantasy_content>`;
}

const XML_HEADERS = { 'Content-Type': 'application/xml' };

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
   console.log('='.repeat(68));
   console.log('Transaction Fluent API Examples');
   if (pathOnly) console.log('(path-only mode — no API calls made)');
   console.log('='.repeat(68));

   const client = new YahooFantasyClient(
      {
         clientId: process.env.YAHOO_CLIENT_ID ?? '',
         clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
         redirectUri: process.env.YAHOO_REDIRECT_URI ?? 'oob',
      },
      storage,
   );

   if (!pathOnly) {
      const hasTokens = await client.loadTokens();
      if (!hasTokens) {
         console.error(
            '\n✗ No tokens found. Authenticate first and save tokens to .test-tokens.json',
         );
         process.exit(1);
      }
      if (client.isTokenExpired()) {
         await client.refreshToken();
      }
   }

   const req = () => client.request();

   // -------------------------------------------------------------------------
   // 1. List all recent transactions in the league
   // -------------------------------------------------------------------------
   console.log('\n=== 1. League Transactions (all recent) ===');
   {
      const q = req().league(LEAGUE_KEY).transactions().count(10);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 2. Filter to a specific transaction type
   // -------------------------------------------------------------------------
   console.log('\n=== 2. League Transactions filtered by type (add) ===');
   {
      const q = req()
         .league(LEAGUE_KEY)
         .transactions()
         .type('add')
         .count(5);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 3. Filter to waiver claims for a specific team
   //    (type=waiver requires team_key per the API spec)
   // -------------------------------------------------------------------------
   console.log('\n=== 3. Waiver Claims for My Team ===');
   {
      const q = req()
         .league(LEAGUE_KEY)
         .transactions()
         .teamKey(TEAM_KEY)
         .type('waiver');
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 4. Filter by multiple types at once
   // -------------------------------------------------------------------------
   console.log('\n=== 4. Multiple Types Filter (add + trade) ===');
   {
      const q = req()
         .league(LEAGUE_KEY)
         .transactions()
         .types(['add', 'trade'])
         .count(10);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 5. Fetch a single completed transaction
   // -------------------------------------------------------------------------
   console.log('\n=== 5. Fetch a Completed Transaction ===');
   {
      const q = req().transaction(COMPLETED_TRANSACTION_KEY);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 6. Fetch a waiver claim transaction
   // -------------------------------------------------------------------------
   console.log('\n=== 6. Fetch a Waiver Claim Transaction ===');
   {
      const q = req().transaction(WAIVER_TRANSACTION_KEY);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 7. Fetch a pending trade transaction
   // -------------------------------------------------------------------------
   console.log('\n=== 7. Fetch a Pending Trade Transaction ===');
   {
      const q = req().transaction(PENDING_TRADE_KEY);
      console.log('Path:', q.buildPath());
      if (!pathOnly) console.log('Result:', await q.execute());
   }

   // -------------------------------------------------------------------------
   // 8. Add a player from free agents
   // -------------------------------------------------------------------------
   console.log('\n=== 8. POST — Add a Player ===');
   {
      const body = buildAddBody(ADD_PLAYER_KEY, TEAM_KEY);
      console.log(
         'Path:',
         req().league(LEAGUE_KEY).transactions().buildPath(),
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .league(LEAGUE_KEY)
            .transactions()
            .post(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 9. Drop a player to waivers
   // -------------------------------------------------------------------------
   console.log('\n=== 9. POST — Drop a Player ===');
   {
      const body = buildDropBody(DROP_PLAYER_KEY, TEAM_KEY);
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .league(LEAGUE_KEY)
            .transactions()
            .post(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 10. Add/drop (one in, one out) — standard free agency
   // -------------------------------------------------------------------------
   console.log('\n=== 10. POST — Add/Drop ===');
   {
      const body = buildAddDropBody(
         ADD_PLAYER_KEY,
         DROP_PLAYER_KEY,
         TEAM_KEY,
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .league(LEAGUE_KEY)
            .transactions()
            .post(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 11. Add/drop with FAAB bid (FAAB league waiver scenario)
   // -------------------------------------------------------------------------
   console.log('\n=== 11. POST — Add/Drop with FAAB Bid ===');
   {
      const body = buildAddDropBody(
         ADD_PLAYER_KEY,
         DROP_PLAYER_KEY,
         TEAM_KEY,
         25, // FAAB bid amount
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .league(LEAGUE_KEY)
            .transactions()
            .post(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 12. Propose a trade
   // -------------------------------------------------------------------------
   console.log('\n=== 12. POST — Propose a Trade ===');
   {
      const body = buildProposeTradeBody(
         TEAM_KEY,
         TRADEE_TEAM_KEY,
         TRADE_PLAYER_GIVE,
         TRADE_PLAYER_RECEIVE,
         'Fair trade, let me know!',
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .league(LEAGUE_KEY)
            .transactions()
            .post(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 13. Accept a pending trade
   // -------------------------------------------------------------------------
   console.log('\n=== 13. PUT — Accept a Pending Trade ===');
   {
      const body = buildTradeActionBody(
         PENDING_TRADE_KEY,
         'accept',
         undefined,
         'Sounds good!',
      );
      console.log(
         'Path:',
         req().transaction(PENDING_TRADE_KEY).buildPath(),
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .transaction(PENDING_TRADE_KEY)
            .put(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 14. Reject a pending trade
   // -------------------------------------------------------------------------
   console.log('\n=== 14. PUT — Reject a Pending Trade ===');
   {
      const body = buildTradeActionBody(
         PENDING_TRADE_KEY,
         'reject',
         undefined,
         'Not for me.',
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .transaction(PENDING_TRADE_KEY)
            .put(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 15. Commissioner allows / disallows a trade
   // -------------------------------------------------------------------------
   console.log('\n=== 15. PUT — Commissioner: Allow a Trade ===');
   {
      const body = buildTradeActionBody(PENDING_TRADE_KEY, 'allow');
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .transaction(PENDING_TRADE_KEY)
            .put(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 16. Edit waiver priority and FAAB bid on an existing waiver claim
   // -------------------------------------------------------------------------
   console.log('\n=== 16. PUT — Edit Waiver Priority / FAAB Bid ===');
   {
      const body = buildEditWaiverBody(
         WAIVER_TRANSACTION_KEY,
         1, // move to top of waiver priority
         30, // raise FAAB bid to $30
      );
      console.log(
         'Path:',
         req().transaction(WAIVER_TRANSACTION_KEY).buildPath(),
      );
      console.log('Body:\n', body);
      if (!pathOnly) {
         const result = await req()
            .transaction(WAIVER_TRANSACTION_KEY)
            .put(body, { headers: XML_HEADERS });
         console.log('Result:', result);
      }
   }

   // -------------------------------------------------------------------------
   // 17. Cancel a pending waiver claim
   // -------------------------------------------------------------------------
   console.log('\n=== 17. DELETE — Cancel a Waiver Claim ===');
   console.log(
      'Path:',
      req().transaction(WAIVER_TRANSACTION_KEY).buildPath(),
   );
   if (!pathOnly) {
      const result = await req()
         .transaction(WAIVER_TRANSACTION_KEY)
         .delete();
      console.log('Result:', result);
   }

   // -------------------------------------------------------------------------
   // 18. Cancel a pending trade (before it is accepted)
   // -------------------------------------------------------------------------
   console.log('\n=== 18. DELETE — Cancel a Pending Trade ===');
   console.log('Path:', req().transaction(PENDING_TRADE_KEY).buildPath());
   if (!pathOnly) {
      const result = await req().transaction(PENDING_TRADE_KEY).delete();
      console.log('Result:', result);
   }

   console.log('\n' + '='.repeat(68));
   console.log('Done.');
}

main().catch((err) => {
   console.error('Error:', err);
   process.exit(1);
});
