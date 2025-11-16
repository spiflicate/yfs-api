/**
 * Example: Accessing Public Endpoints with OAuth 1.0 (2-legged)
 *
 * This example demonstrates how to use the Yahoo Fantasy Sports API wrapper
 * in public mode, which uses OAuth 1.0 2-legged authentication.
 *
 * Public mode allows you to access public endpoints without requiring user
 * authorization. This is useful for accessing:
 * - Game metadata (game info, stat categories, position types)
 * - Public league information
 * - Game-level player searches
 *
 * Requirements:
 * - Yahoo Developer App credentials (Client ID and Client Secret)
 * - NO redirect URI needed
 * - NO user authorization flow needed
 *
 * Usage:
 *   YAHOO_CLIENT_ID=<your-client-id> \
 *   YAHOO_CLIENT_SECRET=<your-client-secret> \
 *   bun run examples/public-api/01-public-endpoints.ts
 */

import { YahooFantasyClient } from '../../src/index.js';

// Get credentials from environment
const clientId = process.env.YAHOO_CLIENT_ID;
const clientSecret = process.env.YAHOO_CLIENT_SECRET;

if (!clientId || !clientSecret) {
   console.error('Error: Missing required environment variables');
   console.error('Please set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET');
   process.exit(1);
}

console.log('='.repeat(70));
console.log('Yahoo Fantasy Sports API - Public Endpoints Example');
console.log('='.repeat(70));
console.log();

console.log('Configuration:');
console.log(`  Client ID: ${clientId.substring(0, 20)}...`);
console.log(`  Client Secret: ${clientSecret.substring(0, 10)}...`);
console.log(`  Mode: Public API (OAuth 1.0 2-legged)`);
console.log();

// Create client in public mode
const client = new YahooFantasyClient({
   clientId,
   clientSecret,
   publicMode: true,
   debug: false,
});

console.log('Client initialized in public mode');
console.log('No authentication flow required!');
console.log();

try {
   // Example 1: Get game metadata
   console.log('-'.repeat(70));
   console.log('Example 1: Get NHL game metadata');
   console.log('-'.repeat(70));

   const nhlGame = await client.game.get('nhl');
   console.log(`Game: ${nhlGame.name} (${nhlGame.code})`);
   console.log(`Season: ${nhlGame.season}`);
   console.log(`Game Key: ${nhlGame.gameKey}`);
   console.log(`Is Available: ${nhlGame.isAvailable}`);
   console.log();

   // Example 2: Get all available games
   console.log('-'.repeat(70));
   console.log('Example 2: Get all available games');
   console.log('-'.repeat(70));

   const games = await client.game.getGames({ isAvailable: true });
   console.log(`Found ${games.length} available game(s):\n`);

   for (const game of games) {
      console.log(`  - ${game.name} (${game.code})`);
      console.log(`    Game Key: ${game.gameKey}`);
      console.log(`    Season: ${game.season}`);
      console.log();
   }

   // Example 3: Get multiple games by code
   console.log('-'.repeat(70));
   console.log('Example 3: Get multiple games by code');
   console.log('-'.repeat(70));

   const multipleGames = await client.game.getGames({
      gameCodes: ['nhl', 'nfl'],
      seasons: [2024],
   });

   console.log(`Found ${multipleGames.length} game(s):\n`);
   for (const game of multipleGames) {
      console.log(`  - ${game.name} (${game.code})`);
      console.log(`    Season: ${game.season}`);
   }
   console.log();

   // Example 4: Search for players (game-level)
   console.log('-'.repeat(70));
   console.log('Example 4: Search for players');
   console.log('-'.repeat(70));

   const playerResults = await client.game.searchPlayers('nhl', {
      search: 'McDavid',
      count: 5,
   });

   const players = playerResults.players || [];
   console.log(`Found ${players.length} player(s) matching "McDavid":\n`);
   for (const player of players) {
      console.log(`  - ${player.name}`);
      console.log(`    Player Key: ${player.playerKey}`);
      console.log(`    Team: ${player.editorialTeamAbbr || 'N/A'}`);
      console.log(`    Position: ${player.displayPosition || 'N/A'}`);
      console.log();
   }

   console.log('='.repeat(70));
   console.log('Public API access successful!');
   console.log('='.repeat(70));
   console.log();
   console.log('Note: Public mode only works with public endpoints.');
   console.log('For user-specific data (leagues, teams, transactions),');
   console.log('you need to use user authentication mode.');
   console.log();
} catch (error) {
   console.error('Error accessing public endpoints:');
   console.error(error);
   process.exit(1);
}
