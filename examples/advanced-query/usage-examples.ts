/**
 * Advanced Query Examples
 *
 * This file demonstrates how to use the advanced query builder
 * for complex Yahoo Fantasy API requests.
 */

import { YahooFantasyClient } from '../../src/client/YahooFantasyClient.js';

async function runExamples() {
   const clientId = process.env.YAHOO_CLIENT_ID ?? '';
   const clientSecret = process.env.YAHOO_CLIENT_SECRET ?? '';

   const client = new YahooFantasyClient({
      clientId,
      clientSecret,
      redirectUri: 'https://example.com/callback',
   });

   // Assume authentication has already happened
   // await client.authenticate(code);

   // Example 1: Simple resource access
   console.log('\n=== Example 1: Simple Resource ===');
   const league = await client
      .advanced()
      .resource('league', '423.l.12345')
      .execute();
   console.log('League:', league);

   // Example 2: Resource with sub-resources using 'out'
   console.log('\n=== Example 2: League with Settings ===');
   const leagueWithSettings = await client
      .advanced()
      .resource('league', '423.l.12345')
      .out(['settings', 'standings'])
      .execute();
   console.log('League with settings:', leagueWithSettings);

   // Example 3: User's leagues across games
   console.log('\n=== Example 3: User Games and Leagues ===');
   const userLeagues = await client
      .advanced()
      .resource('users')
      .param('use_login', '1')
      .collection('games')
      .param('game_keys', 'nfl')
      .collection('leagues')
      .execute();
   console.log('User leagues:', userLeagues);

   // Example 4: Team roster for specific week
   console.log('\n=== Example 4: Team Roster (Week 10) ===');
   const roster = await client
      .advanced()
      .resource('team', '423.l.12345.t.1')
      .collection('roster')
      .param('week', '10')
      .collection('players')
      .execute();
   console.log('Roster:', roster);

   // Example 5: Available players with filters
   console.log('\n=== Example 5: Available QBs ===');
   const availableQBs = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('players')
      .params({
         position: 'QB',
         status: 'A', // Available
         sort: 'AR', // Actual rank
         count: '25',
      })
      .execute();
   console.log('Available QBs:', availableQBs);

   // Example 6: Player ownership info
   console.log('\n=== Example 6: Player Ownership ===');
   const playerOwnership = await client
      .advanced()
      .resource('player', '423.p.8261')
      .collection('ownership')
      .execute();
   console.log('Player ownership:', playerOwnership);

   // Example 7: League transactions with filters
   console.log('\n=== Example 7: League Trades ===');
   const trades = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('transactions')
      .param('type', 'trade')
      .execute();
   console.log('Trades:', trades);

   // Example 8: Team matchups for specific weeks
   console.log('\n=== Example 8: Team Matchups ===');
   const matchups = await client
      .advanced()
      .resource('team', '423.l.12345.t.1')
      .collection('matchups')
      .param('weeks', '1,5,10')
      .execute();
   console.log('Matchups:', matchups);

   // Example 9: Player stats for specific week
   console.log('\n=== Example 9: Player Stats ===');
   const playerStats = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('players')
      .param('player_keys', '423.p.8261')
      .collection('stats')
      .params({
         type: 'week',
         week: '10',
      })
      .execute();
   console.log('Player stats:', playerStats);

   // Example 10: Multiple teams with filters
   console.log('\n=== Example 10: Specific Teams ===');
   const teams = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('teams')
      .param('team_keys', '423.l.12345.t.1,423.l.12345.t.2')
      .execute();
   console.log('Teams:', teams);

   // Example 11: Just build the path (for debugging)
   console.log('\n=== Example 11: Path Building ===');
   const path = client
      .advanced()
      .resource('users')
      .param('use_login', '1')
      .collection('games')
      .collection('leagues')
      .buildPath();
   console.log('Built path:', path);
   // Output: /users;use_login=1/games/leagues

   // Example 12: POST request (e.g., adding a player)
   console.log('\n=== Example 12: POST Request ===');
   const addPlayerResult = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('transactions')
      .post({
         transaction: {
            type: 'add',
            player: {
               player_key: '423.p.8888',
               transaction_data: {
                  type: 'add',
                  destination_team_key: '423.l.12345.t.1',
               },
            },
         },
      });
   console.log('Add player result:', addPlayerResult);

   // Example 13: Complex chain - User's teams in all games
   console.log('\n=== Example 13: All User Teams ===');
   const allTeams = await client
      .advanced()
      .resource('users')
      .param('use_login', '1')
      .collection('games')
      .collection('teams')
      .execute();
   console.log('All teams:', allTeams);

   // Example 14: League scoreboard
   console.log('\n=== Example 14: League Scoreboard ===');
   const scoreboard = await client
      .advanced()
      .resource('league', '423.l.12345')
      .collection('scoreboard')
      .param('week', '10')
      .execute();
   console.log('Scoreboard:', scoreboard);

   // Example 15: Game with multiple sub-resources
   console.log('\n=== Example 15: Game Info ===');
   const gameInfo = await client
      .advanced()
      .resource('game', 'nfl')
      .out(['stat_categories', 'position_types'])
      .execute();
   console.log('Game info:', gameInfo);
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
   runExamples().catch(console.error);
}
