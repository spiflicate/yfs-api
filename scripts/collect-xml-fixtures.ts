/**
 * Script to collect comprehensive XML fixtures from Yahoo Fantasy API
 *
 * This script fetches real XML responses for all major endpoint types
 * and saves them as fixtures for testing and development.
 *
 * Usage:
 *   bun run scripts/collect-xml-fixtures.ts
 *
 * Requires environment variables:
 *   - YAHOO_CLIENT_ID
 *   - YAHOO_CLIENT_SECRET
 */

import { OAuth1Client } from '../src/client/OAuth1Client.js';

const API_BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2';

async function fetchXML(
   oauth1: OAuth1Client,
   path: string,
): Promise<string> {
   const url = `${API_BASE_URL}${path}?format=xml`;
   const signedUrl = oauth1.signRequest('GET', url);

   console.log(`Fetching: ${path}`);
   const response = await fetch(signedUrl);

   if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
         `API request failed with status ${response.status}: ${errorBody}`,
      );
   }

   return response.text();
}

async function main() {
   console.log('Yahoo Fantasy Sports API - XML Fixture Collection\n');

   const consumerKey =
      process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
   const consumerSecret =
      process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;

   if (!consumerKey || !consumerSecret) {
      console.error('Error: Missing OAuth credentials');
      console.error('Set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET');
      process.exit(1);
   }

   const oauth1 = new OAuth1Client(consumerKey, consumerSecret);

   // NHL league key for testing
   const leagueKey = '465.l.121384';
   const teamKey = '465.l.121384.t.1';

   try {
      // 1. Game endpoints
      console.log('\n=== Game Endpoints ===');

      const gameNHL = await fetchXML(oauth1, '/game/nhl');
      await Bun.write('tests/fixtures/xml/game-nhl.xml', gameNHL);
      console.log('✓ Saved: game-nhl.xml');

      const games = await fetchXML(oauth1, '/games;game_keys=nhl,nba,mlb');
      await Bun.write('tests/fixtures/xml/games-multiple.xml', games);
      console.log('✓ Saved: games-multiple.xml');

      const gameWeeks = await fetchXML(oauth1, '/game/nhl/game_weeks');
      await Bun.write('tests/fixtures/xml/game-weeks.xml', gameWeeks);
      console.log('✓ Saved: game-weeks.xml');

      const gameStatCategories = await fetchXML(
         oauth1,
         '/game/nhl/stat_categories',
      );
      await Bun.write(
         'tests/fixtures/xml/game-stat-categories.xml',
         gameStatCategories,
      );
      console.log('✓ Saved: game-stat-categories.xml');

      const gamePositionTypes = await fetchXML(
         oauth1,
         '/game/nhl/position_types',
      );
      await Bun.write(
         'tests/fixtures/xml/game-position-types.xml',
         gamePositionTypes,
      );
      console.log('✓ Saved: game-position-types.xml');

      // 2. League endpoints
      console.log('\n=== League Endpoints ===');

      const league = await fetchXML(oauth1, `/league/${leagueKey}`);
      await Bun.write('tests/fixtures/xml/league.xml', league);
      console.log('✓ Saved: league.xml');

      const leagueSettings = await fetchXML(
         oauth1,
         `/league/${leagueKey}/settings`,
      );
      await Bun.write(
         'tests/fixtures/xml/league-settings.xml',
         leagueSettings,
      );
      console.log('✓ Saved: league-settings.xml');

      const leagueStandings = await fetchXML(
         oauth1,
         `/league/${leagueKey}/standings`,
      );
      await Bun.write(
         'tests/fixtures/xml/league-standings.xml',
         leagueStandings,
      );
      console.log('✓ Saved: league-standings.xml');

      const leagueScoreboard = await fetchXML(
         oauth1,
         `/league/${leagueKey}/scoreboard`,
      );
      await Bun.write(
         'tests/fixtures/xml/league-scoreboard.xml',
         leagueScoreboard,
      );
      console.log('✓ Saved: league-scoreboard.xml');

      const leagueTeams = await fetchXML(
         oauth1,
         `/league/${leagueKey}/teams`,
      );
      await Bun.write('tests/fixtures/xml/league-teams.xml', leagueTeams);
      console.log('✓ Saved: league-teams.xml');

      // 3. Team endpoints
      console.log('\n=== Team Endpoints ===');

      const team = await fetchXML(oauth1, `/team/${teamKey}`);
      await Bun.write('tests/fixtures/xml/team.xml', team);
      console.log('✓ Saved: team.xml');

      const teamRoster = await fetchXML(oauth1, `/team/${teamKey}/roster`);
      await Bun.write('tests/fixtures/xml/team-roster.xml', teamRoster);
      console.log('✓ Saved: team-roster.xml');

      const teamStats = await fetchXML(oauth1, `/team/${teamKey}/stats`);
      await Bun.write('tests/fixtures/xml/team-stats.xml', teamStats);
      console.log('✓ Saved: team-stats.xml');

      const teamStandings = await fetchXML(
         oauth1,
         `/team/${teamKey}/standings`,
      );
      await Bun.write(
         'tests/fixtures/xml/team-standings.xml',
         teamStandings,
      );
      console.log('✓ Saved: team-standings.xml');

      const teamMatchups = await fetchXML(
         oauth1,
         `/team/${teamKey}/matchups`,
      );
      await Bun.write('tests/fixtures/xml/team-matchups.xml', teamMatchups);
      console.log('✓ Saved: team-matchups.xml');

      // 4. Player endpoints
      console.log('\n=== Player Endpoints ===');

      // Connor McDavid
      const player = await fetchXML(oauth1, '/player/465.p.6743');
      await Bun.write('tests/fixtures/xml/player.xml', player);
      console.log('✓ Saved: player.xml');

      const playerStats = await fetchXML(
         oauth1,
         '/player/465.p.6743/stats',
      );
      await Bun.write('tests/fixtures/xml/player-stats.xml', playerStats);
      console.log('✓ Saved: player-stats.xml');

      // Player search
      const playerSearch = await fetchXML(
         oauth1,
         '/league/465.l.121384/players;search=mcdavid',
      );
      await Bun.write('tests/fixtures/xml/player-search.xml', playerSearch);
      console.log('✓ Saved: player-search.xml');

      // Multiple players
      const players = await fetchXML(
         oauth1,
         '/league/465.l.121384/players;player_keys=465.p.6743',
      );
      await Bun.write('tests/fixtures/xml/players-multiple.xml', players);
      console.log('✓ Saved: players-multiple.xml');

      // 5. Transaction endpoints (if available in public mode)
      console.log('\n=== Transaction Endpoints ===');
      try {
         const transactions = await fetchXML(
            oauth1,
            `/league/${leagueKey}/transactions`,
         );
         await Bun.write(
            'tests/fixtures/xml/transactions.xml',
            transactions,
         );
         console.log('✓ Saved: transactions.xml');
      } catch {
         console.log(
            '⚠ Transactions endpoint not available in public mode (expected)',
         );
      }

      console.log('\n✅ XML fixture collection complete!');
      console.log(`\nFixtures saved to: tests/fixtures/xml/`);
      console.log(
         `Total files: ${(await (await Bun.file('tests/fixtures/xml').arrayBuffer()).byteLength) > 0 ? 'multiple' : 'check directory'}`,
      );
   } catch (error) {
      console.error('\n❌ Error collecting fixtures:', error);
      process.exit(1);
   }
}

await main();
