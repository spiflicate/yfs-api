/**
 * Composable Query Builder Examples
 *
 * Demonstrates the new type-safe, chainable query builder API.
 */

import { YahooFantasyClient } from '../../src/client/YahooFantasyClient.js';

const TEST_TEAM_KEY = '465.l.121384.t.2';

async function runExamples() {
   const clientId = process.env.YAHOO_CLIENT_ID ?? '';
   const clientSecret = process.env.YAHOO_CLIENT_SECRET ?? '';
   const redirectUri = process.env.YAHOO_REDIRECT_URI ?? 'oob';

   if (!clientId || !clientSecret) {
      console.error(
         'Error: Missing required environment variables. Please set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET.',
      );
      process.exit(1);
   }

   const client = new YahooFantasyClient({
      clientId,
      clientSecret,
      redirectUri,
   });

   const authUrl = client.getAuthUrl();
   console.log('Authorization URL:', authUrl);
   console.log(
      'Please authenticate with the above URL and set the obtained tokens in the client before running the examples.',
   );

   // User navigates to the url and copies the code.
   // User enters the code here
   const code = prompt('Enter the authorization code: ');
   if (!code) {
      console.error(
         'Error: Authorization code is required to authenticate.',
      );
      process.exit(1);
   }
   await client.authenticate(code);
   console.log('Authentication successful! Access token obtained.');

   console.log('\n=== Make request and verify against return type ===');
   const rosterPlayersQuery = client
      .q()
      .team(TEST_TEAM_KEY)
      .roster({ week: 1 })
      .players();
   const rosterPlayers = await rosterPlayersQuery.execute();
   const outputPath = `${import.meta.dir}/roster-players-response.json`;
   console.log('Roster Players Response written to ', outputPath);
   Bun.write(outputPath, JSON.stringify(rosterPlayers, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
   runExamples().catch(console.error);
}
