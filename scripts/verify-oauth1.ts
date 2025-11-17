/**
 * Quick verification that OAuth 1.0 public mode is working
 */

import { YahooFantasyClient } from '../src/index.js';

const clientId = process.env.YAHOO_CLIENT_ID;
const clientSecret = process.env.YAHOO_CLIENT_SECRET;

if (!clientId || !clientSecret) {
   console.error('Error: Missing YAHOO_CLIENT_ID or YAHOO_CLIENT_SECRET');
   process.exit(1);
}

console.log('='.repeat(70));
console.log('OAuth 1.0 Public Mode Verification');
console.log('='.repeat(70));
console.log();

// Create client in public mode
const client = new YahooFantasyClient({
   clientId,
   clientSecret,
   publicMode: true,
   debug: false,
});

console.log('✓ Client created in public mode (OAuth 1.0)');
console.log('✓ No user authentication required');
console.log('✓ All requests will be signed with HMAC-SHA1');
console.log();

try {
   console.log('Testing API request...');

   // Make a simple API call
   const httpClient = (client as any).httpClient;
   const response = await httpClient.get('/game/nhl');

   console.log('✓ API request successful!');
   console.log('✓ OAuth 1.0 signature accepted by Yahoo API');
   console.log();

   // Extract some data to verify we got real content
   const game = response?.fantasy_content?.game;
   if (game && Array.isArray(game)) {
      const gameData = game[0];
      console.log('Response data received:');
      console.log(`  Game: ${gameData.name || 'N/A'}`);
      console.log(`  Code: ${gameData.code || 'N/A'}`);
      console.log(`  Season: ${gameData.season || 'N/A'}`);
   }

   console.log();
   console.log('='.repeat(70));
   console.log('SUCCESS: OAuth 1.0 authentication is working correctly!');
   console.log('='.repeat(70));
} catch (error: any) {
   console.error();
   console.error('✗ API request failed');
   console.error(`Error: ${error.message}`);

   if (error.message.includes('401') || error.message.includes('403')) {
      console.error();
      console.error('This appears to be an authentication error.');
      console.error('The OAuth 1.0 signature may be incorrect.');
   }

   process.exit(1);
}
