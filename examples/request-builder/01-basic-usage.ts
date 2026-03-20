/**
 * Composable Request Builder Examples
 *
 * Demonstrates the new type-safe, chainable request builder API.
 */

import { YahooFantasyClient } from '../../src/client/YahooFantasyClient.js';

const pathOnly = process.argv.includes('--path-only');

const TEST_LEAGUE_KEY = '465.l.121384';
const TEST_TEAM_KEY = '465.l.121384.t.2';
const TEST_PLAYER_KEY = '465.p.4961';
const TEST_PLAYER_KEYS = ['465.p.4961', '465.p.5993', '465.p.7161'];

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

   // Assume authentication has already happened
   // client.authenticate(code);
   if (pathOnly) {
      console.warn(
         'Running in path-only mode. No API calls will be made, only the built paths will be printed.',
      );
   }

   console.log('\n=== Example 1: League with Settings ===');
   const leagueQuery = client.request().league(TEST_LEAGUE_KEY).settings();
   const league = pathOnly
      ? leagueQuery.buildPath()
      : await leagueQuery.execute();
   console.log(`League${pathOnly ? ' (path only)' : ''}:`, league);

   console.log('\n=== Example 2: League with Multiple Sub-resources ===');
   const leagueFullQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .out(['settings', 'standings', 'scoreboard']);
   const leagueFull = pathOnly
      ? leagueFullQuery.buildPath()
      : await leagueFullQuery.execute();
   console.log(`League full${pathOnly ? ' (path only)' : ''}:`, leagueFull);

   console.log('\n=== Example 3: Available Players (Free Agents) ===');
   const freeAgentsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .position('C')
      .status('FA')
      .sort('AR')
      .count(25);
   const freeAgents = pathOnly
      ? freeAgentsQuery.buildPath()
      : await freeAgentsQuery.execute();
   console.log(
      `Free agent centers${pathOnly ? ' (path only)' : ''}:`,
      freeAgents,
   );

   console.log('\n=== Example 4: Team Roster ===');
   const rosterQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .roster({ week: '10' });
   const roster = pathOnly
      ? rosterQuery.buildPath()
      : await rosterQuery.execute();
   console.log(`Roster${pathOnly ? ' (path only)' : ''}:`, roster);

   console.log('\n=== Example 5: Team Stats ===');
   const statsQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .stats({ type: 'season' });
   const stats = pathOnly
      ? statsQuery.buildPath()
      : await statsQuery.execute();
   console.log(`Team stats${pathOnly ? ' (path only)' : ''}:`, stats);

   console.log('\n=== Example 6: Player Stats ===');
   const playerStatsQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .stats({ type: 'week', week: '10' });
   const playerStats = pathOnly
      ? playerStatsQuery.buildPath()
      : await playerStatsQuery.execute();
   console.log(
      `Player stats${pathOnly ? ' (path only)' : ''}:`,
      playerStats,
   );

   console.log('\n=== Example 7: Player Ownership ===');
   const ownershipQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .ownership();
   const ownership = pathOnly
      ? ownershipQuery.buildPath()
      : await ownershipQuery.execute();
   console.log(`Ownership${pathOnly ? ' (path only)' : ''}:`, ownership);

   console.log('\n=== Example 8: Game Info ===');
   const gameQuery = client
      .request()
      .game('nhl')
      .out(['stat_categories', 'position_types']);
   const game = pathOnly
      ? gameQuery.buildPath()
      : await gameQuery.execute();
   console.log(`Game${pathOnly ? ' (path only)' : ''}:`, game);

   console.log('\n=== Example 9: User Games ===');
   const userGamesQuery = client.request().users().useLogin().games();
   const userGames = pathOnly
      ? userGamesQuery.buildPath()
      : await userGamesQuery.execute();
   console.log(`User games${pathOnly ? ' (path only)' : ''}:`, userGames);

   console.log('\n=== Example 10: User Teams ===');
   const userTeamsQuery = client
      .request()
      .users()
      .useLogin()
      .games()
      .gameKeys('nhl')
      .teams();
   const userTeams = pathOnly
      ? userTeamsQuery.buildPath()
      : await userTeamsQuery.execute();
   console.log(`User teams${pathOnly ? ' (path only)' : ''}:`, userTeams);

   console.log('\n=== Example 11: League Teams ===');
   const teamsQuery = client.request().league(TEST_LEAGUE_KEY).teams();
   const teams = pathOnly
      ? teamsQuery.buildPath()
      : await teamsQuery.execute();
   console.log(`League teams${pathOnly ? ' (path only)' : ''}:`, teams);

   console.log('\n=== Example 12: League Transactions ===');
   const transactionsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .transactions()
      .filters({ type: 'trade' })
      .count(10);
   const transactions = pathOnly
      ? transactionsQuery.buildPath()
      : await transactionsQuery.execute();
   console.log(
      `Transactions${pathOnly ? ' (path only)' : ''}:`,
      transactions,
   );

   console.log('\n=== Example 13: Scoreboard ===');
   const scoreboardQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .scoreboard()
      .week(10);
   const scoreboard = pathOnly
      ? scoreboardQuery.buildPath()
      : await scoreboardQuery.execute();
   console.log(`Scoreboard${pathOnly ? ' (path only)' : ''}:`, scoreboard);

   console.log('\n=== Example 14: Build Path Only ===');
   const path = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .position('C')
      .status('FA')
      .count(25)
      .buildPath();
   console.log(`Built path${pathOnly ? ' (path only)' : ''}:`, path);
   // Output: /league/423.l.12345/players;position=C;status=FA;count=25

   console.log('\n=== Example 15: Multiple Player Keys ===');
   const playersQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .playerKeys(TEST_PLAYER_KEYS);
   const players = pathOnly
      ? playersQuery.buildPath()
      : await playersQuery.execute();
   console.log(
      `Specific players${pathOnly ? ' (path only)' : ''}:`,
      players,
   );

   console.log('\n=== Example 16: Team Matchups ===');
   const matchupsQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .matchups({ weeks: '1,5,10' });
   const matchups = pathOnly
      ? matchupsQuery.buildPath()
      : await matchupsQuery.execute();
   console.log(`Matchups${pathOnly ? ' (path only)' : ''}:`, matchups);

   console.log('\n=== Example 17: League Standings ===');
   const standingsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .standings();
   const standings = pathOnly
      ? standingsQuery.buildPath()
      : await standingsQuery.execute();
   console.log(`Standings${pathOnly ? ' (path only)' : ''}:`, standings);

   console.log('\n=== Example 18: Game Weeks ===');
   const weeksQuery = client.request().game('nhl').gameWeeks();
   const weeks = pathOnly
      ? weeksQuery.buildPath()
      : await weeksQuery.execute();
   console.log(`Game weeks${pathOnly ? ' (path only)' : ''}:`, weeks);

   console.log('\n=== Example 19: Draft Analysis ===');
   const analysisQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .draftAnalysis();
   const analysis = pathOnly
      ? analysisQuery.buildPath()
      : await analysisQuery.execute();
   console.log(
      `Draft analysis${pathOnly ? ' (path only)' : ''}:`,
      analysis,
   );

   console.log('\n=== Example 20: Percent Owned ===');
   const percentOwnedQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .percentOwned();
   const percentOwned = pathOnly
      ? percentOwnedQuery.buildPath()
      : await percentOwnedQuery.execute();
   console.log(
      `Percent owned${pathOnly ? ' (path only)' : ''}:`,
      percentOwned,
   );
}

if (import.meta.url === `file://${process.argv[1]}`) {
   runExamples().catch(console.error);
}
