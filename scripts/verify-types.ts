/**
 * Script to verify our types match actual Yahoo API responses
 */
import { YahooFantasyClient } from '../src/index.js';
import * as fs from 'node:fs/promises';

const tokens = JSON.parse(await Bun.file('.oauth2-tokens.json').text());

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID!,
   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
   redirectUri: 'oob',
   accessToken: tokens.accessToken,
   refreshToken: tokens.refreshToken,
   expiresAt: tokens.expiresAt,
});

const leagueKey = process.env.TEST_LEAGUE_KEY!;
const teamKey = process.env.TEST_TEAM_KEY!;

console.log('🔍 Fetching comprehensive data samples...\n');

const samples: Record<string, any> = {};

try {
   // League data
   console.log('📊 League resource...');
   samples.league = await client.league.get(leagueKey, {
      includeSettings: true,
   });

   samples.leagueStandings = await client.league.getStandings(leagueKey);
   samples.leagueScoreboard = await client.league.getScoreboard(leagueKey);
   samples.leagueTeams = await client.league.getTeams(leagueKey);

   // Team data
   console.log('👥 Team resource...');
   samples.team = await client.team.get(teamKey);
   samples.teamRoster = await client.team.getRoster(teamKey);
   samples.teamMatchups = await client.team.getMatchups(teamKey);

   // User data
   console.log('👤 User resource...');
   samples.user = await client.user.getCurrentUser();
   samples.userGames = await client.user.getGames({ includeTeams: true });
   samples.userTeams = await client.user.getTeams({ gameCode: 'nhl' });

   // Game data (public)
   console.log('🎮 Game resource...');
   const publicClient = new YahooFantasyClient({
      clientId: process.env.YAHOO_CLIENT_ID!,
      clientSecret: process.env.YAHOO_CLIENT_SECRET!,
      publicMode: true,
   });
   samples.games = await publicClient.game.getGames({ isAvailable: true });
   samples.players = await publicClient.game.searchPlayers('nhl', {
      search: 'mcdavid',
      count: 5,
   });

   // Player data
   console.log('⭐ Player resource...');
   samples.playerSearch = await client.player.search(leagueKey, {
      search: 'matthews',
      count: 3,
   });

   console.log('\n✅ All samples collected');

   // Save samples
   await fs.writeFile(
      'api-response-samples.json',
      JSON.stringify(samples, null, 2),
   );
   console.log('💾 Saved to api-response-samples.json\n');

   // Analyze what fields are actually populated
   console.log('📋 Sample Data Summary:\n');

   console.log('League:');
   console.log(`  - Keys: ${Object.keys(samples.league).length}`);
   console.log(`  - Has settings: ${!!samples.league.settings}`);
   console.log(`  - Has standings: ${!!samples.league.standings}`);

   console.log('\nTeam:');
   console.log(`  - Keys: ${Object.keys(samples.team).length}`);
   console.log(`  - Has roster: ${!!samples.team.roster}`);
   console.log(`  - Has standings: ${!!samples.team.standings}`);
   console.log(`  - Has managers: ${!!samples.team.managers}`);

   console.log('\nTeam Roster:');
   if (samples.teamRoster?.players?.length > 0) {
      const player = samples.teamRoster.players[0];
      console.log(`  - Player count: ${samples.teamRoster.players.length}`);
      console.log(
         `  - Sample player keys: ${Object.keys(player).join(', ')}`,
      );
   }

   console.log('\nUser Teams:');
   console.log(`  - Team count: ${samples.userTeams.length}`);
   if (samples.userTeams.length > 0) {
      console.log(
         `  - Sample team keys: ${Object.keys(samples.userTeams[0]).join(', ')}`,
      );
   }

   console.log('\nGames:');
   console.log(`  - Game count: ${samples.games.length}`);
   if (samples.games.length > 0) {
      console.log(
         `  - Sample game keys: ${Object.keys(samples.games[0]).join(', ')}`,
      );
   }

   console.log('\nPlayers:');
   console.log(`  - Player count: ${samples.players.length}`);
   if (samples.players.length > 0) {
      console.log(
         `  - Sample player keys: ${Object.keys(samples.players[0]).join(', ')}`,
      );
   }

   console.log('\nScoreboard Matchups:');
   console.log(
      `  - Matchup count: ${samples.leagueScoreboard.matchups?.length || 0}`,
   );
} catch (error) {
   console.error('❌ Error:', error);
   if (error instanceof Error) {
      console.error(error.stack);
   }
   process.exit(1);
}
