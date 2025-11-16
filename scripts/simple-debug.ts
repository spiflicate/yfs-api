/**
 * Simple script to save raw API response to file for debugging
 */

import { YahooFantasyClient } from '../src/index.js';
import * as fs from 'node:fs/promises';

const tokens = JSON.parse(await Bun.file('.oauth2-tokens.json').text());

// Create client
const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID!,
   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
   redirectUri: 'oob',
   accessToken: tokens.accessToken,
   refreshToken: tokens.refreshToken,
   expiresAt: tokens.expiresAt,
});

console.log('Fetching teams via API call...');

try {
   const teams = await client.user.getTeams({ gameCode: 'nhl' });

   console.log('\nParsed result:');
   console.log('Number of teams:', teams.length);

   if (teams.length > 0) {
      console.log('\nFirst team:');
      console.log(JSON.stringify(teams[0], null, 2));

      console.log('\nChecking fields:');
      const firstTeam = teams[0];
      console.log('teamKey:', firstTeam?.teamKey);
      console.log('teamId:', firstTeam?.teamId);
      console.log('name:', firstTeam?.name);
      console.log('league.leagueKey:', firstTeam?.league?.leagueKey);
      console.log('league.name:', firstTeam?.league?.name);
   } else {
      console.log('\n⚠️  No teams returned');
   }

   // Save to file for inspection
   await fs.writeFile(
      'debug-teams-response.json',
      JSON.stringify(teams, null, 2),
   );
   console.log('\n✅ Saved response to debug-teams-response.json');
} catch (error) {
   console.error('\n❌ Error:', error);
   if (error instanceof Error) {
      console.error('Stack:', error.stack);
   }
}
