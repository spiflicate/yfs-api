/**
 * Example: Team Roster Editing via Request Builder
 *
 * Demonstrates how to update selected roster positions with PUT requests using
 * the request builder's roster().updateLineup(...) helper.
 *
 * Important:
 *   - Roster editing always requires user authentication.
 *   - Public mode does not support roster writes.
 *   - Live requests only work for a team the authenticated user can manage.
 *   - Use a week-based payload for NFL style leagues and a date-based payload
 *     for MLB, NBA, and NHL daily lineup leagues.
 *
 * To run in path-only mode (no API calls, no tokens required):
 *   bun run examples/request-builder/03-roster-editing.ts --path-only
 *
 * To run against the live API (requires valid user tokens in .test-tokens.json):
 *   ROSTER_COVERAGE_TYPE=week bun run examples/request-builder/03-roster-editing.ts
 *   ROSTER_COVERAGE_TYPE=date bun run examples/request-builder/03-roster-editing.ts
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { OAuth2Tokens, TokenStorage } from '../../src/index.js';
import { YahooFantasyClient } from '../../src/index.js';

const TEAM_KEY = process.env.TEAM_KEY ?? '423.l.12345.t.1';

const WEEK_NUMBER = Number(process.env.ROSTER_WEEK ?? '13');
const ROSTER_DATE = process.env.ROSTER_DATE ?? '2026-03-15';
const ROSTER_COVERAGE_TYPE =
   process.env.ROSTER_COVERAGE_TYPE === 'date' ? 'date' : 'week';

const WEEKLY_PLAYERS = [
   {
      playerKey: process.env.ROSTER_WEEK_PLAYER_ONE ?? '423.p.8332',
      position: 'WR',
   },
   {
      playerKey: process.env.ROSTER_WEEK_PLAYER_TWO ?? '423.p.1423',
      position: 'BN',
   },
];

const DAILY_PLAYERS = [
   {
      playerKey: process.env.ROSTER_DATE_PLAYER_ONE ?? '423.p.9988',
      position: '1B',
   },
   {
      playerKey: process.env.ROSTER_DATE_PLAYER_TWO ?? '423.p.1423',
      position: 'BN',
   },
];

const pathOnly = process.argv.includes('--path-only');
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

type CoverageType = 'week' | 'date';

function buildRosterPreview(coverageType: CoverageType): string {
   if (coverageType === 'week') {
      return `<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>week</coverage_type>
    <week>${WEEK_NUMBER}</week>
    <players>
      <player>
        <player_key>${WEEKLY_PLAYERS[0]?.playerKey}</player_key>
        <position>${WEEKLY_PLAYERS[0]?.position}</position>
      </player>
      <player>
        <player_key>${WEEKLY_PLAYERS[1]?.playerKey}</player_key>
        <position>${WEEKLY_PLAYERS[1]?.position}</position>
      </player>
    </players>
  </roster>
</fantasy_content>`;
   }

   return `<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>${ROSTER_DATE}</date>
    <players>
      <player>
        <player_key>${DAILY_PLAYERS[0]?.playerKey}</player_key>
        <position>${DAILY_PLAYERS[0]?.position}</position>
      </player>
      <player>
        <player_key>${DAILY_PLAYERS[1]?.playerKey}</player_key>
        <position>${DAILY_PLAYERS[1]?.position}</position>
      </player>
    </players>
  </roster>
</fantasy_content>`;
}

async function main() {
   console.log('='.repeat(68));
   console.log('Roster Editing Request Builder Example');
   console.log('Roster editing requires authenticated user access.');
   if (pathOnly) console.log('(path-only mode - no API calls made)');
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
            '\nX No tokens found. Authenticate first and save user tokens to .test-tokens.json',
         );
         console.error('  This example cannot run in public mode.');
         process.exit(1);
      }

      if (client.isTokenExpired()) {
         await client.refreshToken();
      }
   }

   const request = () => client.request();

   console.log('\n=== 1. Weekly lineup update helper ===');
   {
      const q = request()
         .team(TEAM_KEY)
         .roster({ week: WEEK_NUMBER })
         .updateLineup({
            coverageType: 'week',
            week: WEEK_NUMBER,
            players: WEEKLY_PLAYERS,
         });

      console.log(
         'Path:',
         request().team(TEAM_KEY).roster({ week: WEEK_NUMBER }).buildPath(),
      );
      console.log('Preview body:\n', buildRosterPreview('week'));

      if (!pathOnly && ROSTER_COVERAGE_TYPE === 'week') {
         console.log('Executing weekly lineup update...');
         console.log('Result:', await q.execute());
      }
   }

   console.log('\n=== 2. Daily lineup update helper ===');
   {
      const q = request()
         .team(TEAM_KEY)
         .roster({ date: ROSTER_DATE })
         .updateLineup({
            coverageType: 'date',
            date: ROSTER_DATE,
            players: DAILY_PLAYERS,
         });

      console.log(
         'Path:',
         request().team(TEAM_KEY).roster({ date: ROSTER_DATE }).buildPath(),
      );
      console.log('Preview body:\n', buildRosterPreview('date'));

      if (!pathOnly && ROSTER_COVERAGE_TYPE === 'date') {
         console.log('Executing daily lineup update...');
         console.log('Result:', await q.execute());
      }
   }

   console.log('\n=== 3. Raw roster PUT fallback ===');
   {
      const rawPayload = {
         roster: {
            coverage_type: 'week',
            week: WEEK_NUMBER,
            players: {
               player: WEEKLY_PLAYERS.map((player) => ({
                  player_key: player.playerKey,
                  position: player.position,
               })),
            },
         },
      };

      const q = request().team(TEAM_KEY).roster({ week: WEEK_NUMBER });
      console.log('Path:', q.buildPath());
      console.log('Payload:', JSON.stringify(rawPayload, null, 2));

      if (!pathOnly && ROSTER_COVERAGE_TYPE === 'week') {
         console.log('Executing raw weekly roster PUT...');
         console.log('Result:', await q.put(rawPayload));
      }
   }

   if (!pathOnly) {
      console.log(
         '\nFinished. Verify the lineup change in Yahoo before issuing another write.',
      );
   }
}

main().catch((error) => {
   console.error('\nExample failed:', error);
   process.exit(1);
});
