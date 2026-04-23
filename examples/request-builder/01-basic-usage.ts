/**
 * Composable Request Builder Examples
 *
 * Demonstrates the new type-safe, chainable request builder API.
 */

import { YahooFantasyClient } from '../../src/client/YahooFantasyClient.js';

const writeJsonFile = async (filename: string, data: unknown) => {
   await Bun.write(filename, JSON.stringify(data, null, 2));
   console.log(`Response written to ${filename}`);
};

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

   if (!pathOnly) {
      // Attempt to load existing tokens from storage
      const tokensLoaded = await client.loadTokens();
      if (tokensLoaded) {
         console.log('Existing tokens loaded from storage.');
      } else {
         console.log('No existing tokens found. Please authenticate.');
      }
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
   } else {
      console.warn(
         'Running in path-only mode. No API calls will be made, only the built paths will be printed.',
      );
   }

   console.log('\n=== Example 1: League with Settings ===');
   const leagueQuery = client.request().league(TEST_LEAGUE_KEY).settings();
   const league = leagueQuery.buildPath();
   console.log('Built path:', league);
   if (!pathOnly) {
      const data = await leagueQuery.execute();
      await writeJsonFile('league-settings.json', data);
   }

   console.log('\n=== Example 2: League with Multiple Sub-resources ===');
   const leagueFullQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .out(['settings', 'standings', 'scoreboard']);
   const leagueFull = leagueFullQuery.buildPath();
   console.log('Built path:', leagueFull);
   if (!pathOnly) {
      const data = await leagueFullQuery.execute();
      await writeJsonFile('league-full.json', data);
   }

   console.log('\n=== Example 3: Available Players (Free Agents) ===');
   const freeAgentsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .position('C')
      .status('FA')
      .sort('AR')
      .count(25);
   const freeAgents = freeAgentsQuery.buildPath();
   console.log('Built path:', freeAgents);
   if (!pathOnly) {
      const data = await freeAgentsQuery.execute();
      await writeJsonFile('free-agents.json', data);
   }

   console.log('\n=== Example 4: Team Roster ===');
   const rosterQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .roster({ week: '10' });
   const roster = rosterQuery.buildPath();
   console.log('Built path:', roster);
   if (!pathOnly) {
      const data = await rosterQuery.execute();
      await writeJsonFile('team-roster.json', data);
   }

   console.log('\n=== Example 5: Team Stats ===');
   const statsQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .stats({ type: 'season' });
   const stats = statsQuery.buildPath();
   console.log('Built path:', stats);
   if (!pathOnly) {
      const data = await statsQuery.execute();
      await writeJsonFile('team-stats.json', data);
   }

   console.log('\n=== Example 6: Player Stats ===');
   const playerStatsQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .stats({ type: 'week', week: '10' });
   const playerStats = playerStatsQuery.buildPath();
   console.log('Built path:', playerStats);
   if (!pathOnly) {
      const data = await playerStatsQuery.execute();
      await writeJsonFile('player-stats.json', data);
   }

   console.log('\n=== Example 7: Player Ownership ===');
   const ownershipQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .ownership();
   const ownership = ownershipQuery.buildPath();
   console.log('Built path:', ownership);
   if (!pathOnly) {
      const data = await ownershipQuery.execute();
      await writeJsonFile('player-ownership.json', data);
   }

   console.log('\n=== Example 8: Game Info ===');
   const gameQuery = client
      .request()
      .game('nhl')
      .out(['stat_categories', 'position_types']);
   const game = gameQuery.buildPath();
   console.log('Built path:', game);
   if (!pathOnly) {
      const data = await gameQuery.execute();
      await writeJsonFile('game-info.json', data);
   }

   console.log('\n=== Example 9: User Games ===');
   const userGamesQuery = client.request().users().useLogin().games();
   const userGames = userGamesQuery.buildPath();
   console.log('Built path:', userGames);
   if (!pathOnly) {
      const data = await userGamesQuery.execute();
      await writeJsonFile('user-games.json', data);
   }

   console.log('\n=== Example 10: User Teams ===');
   const userTeamsQuery = client
      .request()
      .users()
      .useLogin()
      .games()
      .gameKeys('nhl')
      .teams();
   const userTeams = userTeamsQuery.buildPath();
   console.log('Built path:', userTeams);
   if (!pathOnly) {
      const data = await userTeamsQuery.execute();
      await writeJsonFile('user-teams.json', data);
   }

   console.log('\n=== Example 11: League Teams ===');
   const teamsQuery = client.request().league(TEST_LEAGUE_KEY).teams();
   const teams = teamsQuery.buildPath();
   console.log('Built path:', teams);
   if (!pathOnly) {
      const data = await teamsQuery.execute();
      await writeJsonFile('league-teams.json', data);
   }

   console.log('\n=== Example 12: League Transactions ===');
   const transactionsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .transactions()
      .filters({ type: 'trade' })
      .count(10);
   const transactions = transactionsQuery.buildPath();
   console.log('Built path:', transactions);
   if (!pathOnly) {
      const data = await transactionsQuery.execute();
      await writeJsonFile('league-transactions.json', data);
   }

   console.log('\n=== Example 13: Scoreboard ===');
   const scoreboardQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .scoreboard()
      .week(10);
   const scoreboard = scoreboardQuery.buildPath();
   console.log('Built path:', scoreboard);
   if (!pathOnly) {
      const data = await scoreboardQuery.execute();
      await writeJsonFile('league-scoreboard.json', data);
   }

   console.log('\n=== Example 14: Build Path Only ===');
   const pathQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .position('C')
      .status('FA')
      .count(25);
   const path = pathQuery.buildPath();
   console.log('Built path:', path);
   // Output: /league/423.l.12345/players;position=C;status=FA;count=25

   console.log('\n=== Example 15: Multiple Player Keys ===');
   const playersQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .players()
      .playerKeys(TEST_PLAYER_KEYS);
   const players = playersQuery.buildPath();
   console.log('Built path:', players);
   if (!pathOnly) {
      const data = await playersQuery.execute();
      await writeJsonFile('multiple-players.json', data);
   }

   console.log('\n=== Example 16: Team Matchups ===');
   const matchupsQuery = client
      .request()
      .team(TEST_TEAM_KEY)
      .matchups({ weeks: '1,5,10' });
   const matchups = matchupsQuery.buildPath();
   console.log('Built path:', matchups);
   if (!pathOnly) {
      const data = await matchupsQuery.execute();
      await writeJsonFile('team-matchups.json', data);
   }

   console.log('\n=== Example 17: League Standings ===');
   const standingsQuery = client
      .request()
      .league(TEST_LEAGUE_KEY)
      .standings();
   const standings = standingsQuery.buildPath();
   console.log('Built path:', standings);
   if (!pathOnly) {
      const data = await standingsQuery.execute();
      await writeJsonFile('league-standings.json', data);
   }

   console.log('\n=== Example 18: Game Weeks ===');
   const weeksQuery = client.request().game('nhl').gameWeeks();
   const weeks = weeksQuery.buildPath();
   console.log('Built path:', weeks);
   if (!pathOnly) {
      const data = await weeksQuery.execute();
      await writeJsonFile('game-weeks.json', data);
   }

   console.log('\n=== Example 19: Draft Analysis ===');
   const analysisQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .draftAnalysis();
   const analysis = analysisQuery.buildPath();
   console.log('Built path:', analysis);
   if (!pathOnly) {
      const data = await analysisQuery.execute();
      await writeJsonFile('draft-analysis.json', data);
   }

   console.log('\n=== Example 20: Percent Owned ===');
   const percentOwnedQuery = client
      .request()
      .player(TEST_PLAYER_KEY)
      .percentOwned();
   const percentOwned = percentOwnedQuery.buildPath();
   console.log('Built path:', percentOwned);
   if (!pathOnly) {
      const data = await percentOwnedQuery.execute();
      await writeJsonFile('percent-owned.json', data);
   }
}

if (import.meta.url === `file://${process.argv[1]}`) {
   runExamples().catch(console.error);
}
