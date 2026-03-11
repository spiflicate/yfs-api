/**
 * Composable Query Builder Examples
 *
 * Demonstrates the new type-safe, chainable query builder API.
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

   console.log('\n=== Example 1: League with Settings ===');
   const league = await client
      .q()
      .league('423.l.12345')
      .settings()
      .execute();
   console.log('League:', league);

   console.log('\n=== Example 2: League with Multiple Sub-resources ===');
   const leagueFull = await client
      .q()
      .league('423.l.12345')
      .out(['settings', 'standings', 'scoreboard'])
      .execute();
   console.log('League full:', leagueFull);

   console.log('\n=== Example 3: Available Players (Free Agents) ===');
   const freeAgents = await client
      .q()
      .league('423.l.12345')
      .players()
      .position('C')
      .status('FA')
      .sort('AR')
      .count(25)
      .execute();
   console.log('Free agent centers:', freeAgents);

   console.log('\n=== Example 4: Team Roster ===');
   const roster = await client
      .q()
      .team('423.l.12345.t.1')
      .roster({ week: '10' })
      .execute();
   console.log('Roster:', roster);

   console.log('\n=== Example 5: Team Stats ===');
   const stats = await client
      .q()
      .team('423.l.12345.t.1')
      .stats({ type: 'season' })
      .execute();
   console.log('Team stats:', stats);

   console.log('\n=== Example 6: Player Stats ===');
   const playerStats = await client
      .q()
      .player('423.p.8261')
      .stats({ type: 'week', week: '10' })
      .execute();
   console.log('Player stats:', playerStats);

   console.log('\n=== Example 7: Player Ownership ===');
   const ownership = await client
      .q()
      .player('423.p.8261')
      .ownership()
      .execute();
   console.log('Ownership:', ownership);

   console.log('\n=== Example 8: Game Info ===');
   const game = await client
      .q()
      .game('nhl')
      .out(['stat_categories', 'position_types'])
      .execute();
   console.log('Game:', game);

   console.log('\n=== Example 9: User Games ===');
   const userGames = await client.q().users().useLogin().games().execute();
   console.log('User games:', userGames);

   console.log('\n=== Example 10: User Teams ===');
   const userTeams = await client
      .q()
      .users()
      .useLogin()
      .games()
      .gameKeys('nhl')
      .teams()
      .execute();
   console.log('User teams:', userTeams);

   console.log('\n=== Example 11: League Teams ===');
   const teams = await client.q().league('423.l.12345').teams().execute();
   console.log('League teams:', teams);

   console.log('\n=== Example 12: League Transactions ===');
   const transactions = await client
      .q()
      .league('423.l.12345')
      .transactions()
      .param('type', 'trade')
      .count(10)
      .execute();
   console.log('Transactions:', transactions);

   console.log('\n=== Example 13: Scoreboard ===');
   const scoreboard = await client
      .q()
      .league('423.l.12345')
      .scoreboard()
      .week(10)
      .execute();
   console.log('Scoreboard:', scoreboard);

   console.log('\n=== Example 14: Build Path Only ===');
   const path = client
      .q()
      .league('423.l.12345')
      .players()
      .position('C')
      .status('FA')
      .count(25)
      .buildPath();
   console.log('Built path:', path);
   // Output: /league/423.l.12345/players;position=C;status=FA;count=25

   console.log('\n=== Example 15: Multiple Player Keys ===');
   const players = await client
      .q()
      .league('423.l.12345')
      .players()
      .playerKeys(['423.p.8261', '423.p.1234', '423.p.5678'])
      .execute();
   console.log('Specific players:', players);

   console.log('\n=== Example 16: Team Matchups ===');
   const matchups = await client
      .q()
      .team('423.l.12345.t.1')
      .matchups({ weeks: '1,5,10' })
      .execute();
   console.log('Matchups:', matchups);

   console.log('\n=== Example 17: League Standings ===');
   const standings = await client
      .q()
      .league('423.l.12345')
      .standings()
      .execute();
   console.log('Standings:', standings);

   console.log('\n=== Example 18: Game Weeks ===');
   const weeks = await client.q().game('nhl').gameWeeks().execute();
   console.log('Game weeks:', weeks);

   console.log('\n=== Example 19: Draft Analysis ===');
   const analysis = await client
      .q()
      .player('423.p.8261')
      .draftAnalysis()
      .execute();
   console.log('Draft analysis:', analysis);

   console.log('\n=== Example 20: Percent Owned ===');
   const percentOwned = await client
      .q()
      .player('423.p.8261')
      .percentOwned()
      .execute();
   console.log('Percent owned:', percentOwned);
}

if (import.meta.url === `file://${process.argv[1]}`) {
   runExamples().catch(console.error);
}
