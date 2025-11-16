/**
 * Discover Test Leagues and Teams
 *
 * This script helps identify league and team keys from your Yahoo Fantasy account
 * that can be used for integration testing.
 */

import { YahooFantasyClient } from '../src/index.js';
import type { OAuth2Tokens } from '../src/index.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Read tokens from .oauth2-tokens.json
const tokenFile = path.join(process.cwd(), '.oauth2-tokens.json');

async function loadTokens(): Promise<OAuth2Tokens | null> {
   try {
      const data = await fs.readFile(tokenFile, 'utf-8');
      return JSON.parse(data);
   } catch {
      console.error('❌ Could not load tokens from .oauth2-tokens.json');
      return null;
   }
}

async function main() {
   console.log('🔍 Yahoo Fantasy League & Team Discovery');
   console.log('='.repeat(60));
   console.log();

   // Get credentials from environment
   const clientId =
      process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
   const clientSecret =
      process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;

   if (!clientId || !clientSecret) {
      console.error(
         '❌ Missing credentials. Set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET',
      );
      process.exit(1);
   }

   // Load tokens
   const tokens = await loadTokens();
   if (!tokens) {
      console.error('❌ No tokens found. Please authenticate first.');
      process.exit(1);
   }

   // Create client
   const client = new YahooFantasyClient({
      clientId,
      clientSecret,
      redirectUri: 'oob',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
   });

   console.log('✅ Client initialized');
   console.log();

   try {
      // Get current user
      console.log('📋 Fetching user information...');
      const user = await client.user.getCurrentUser();
      console.log(`   User: ${user.guid}`);
      console.log();

      // Get user's teams for different sports
      const sports = ['nhl', 'nfl', 'mlb', 'nba'];
      const allTeams: Array<{ sport: string; teams: any[] }> = [];

      for (const sport of sports) {
         console.log(`🏒 Fetching ${sport.toUpperCase()} teams...`);
         try {
            const teams = await client.user.getTeams({
               gameCode: sport as any,
            });
            if (teams && teams.length > 0) {
               console.log(`   ✅ Found ${teams.length} team(s)`);
               allTeams.push({ sport, teams });
            } else {
               console.log(`   ⚠️  No teams found`);
            }
         } catch (error) {
            console.log(`   ⚠️  Error fetching teams`);
         }
      }
      console.log();

      if (allTeams.length === 0) {
         console.log(
            '❌ No teams found in any sport. You need to join a league first.',
         );
         console.log();
         console.log('To set up test leagues:');
         console.log('1. Go to Yahoo Fantasy Sports');
         console.log('2. Join or create a league');
         console.log('3. Run this script again');
         process.exit(0);
      }

      // Display all leagues and teams
      console.log('📊 Available Leagues and Teams:');
      console.log('='.repeat(60));
      console.log();

      for (const { sport, teams } of allTeams) {
         console.log(`${sport.toUpperCase()}:`);
         console.log('-'.repeat(60));

         for (const team of teams) {
            if (!team?.teamKey) continue;

            const leagueKey = team.teamKey.split('.t.')[0];

            console.log();
            console.log(`  Team: ${team.name || 'Unknown'}`);
            console.log(`  Team Key: ${team.teamKey}`);
            console.log(`  League Key: ${leagueKey}`);

            // Try to get league info
            try {
               const league = await client.league.get(leagueKey);
               console.log(`  League: ${league.name}`);
               console.log(`  Season: ${league.season}`);
               console.log(`  Teams: ${league.numberOfTeams}`);
               console.log(`  Type: ${league.leagueType}`);
            } catch (error) {
               console.log(`  League: (could not fetch details)`);
            }
         }
         console.log();
      }

      // Generate .env.test content
      console.log('='.repeat(60));
      console.log('📝 Suggested .env.test configuration:');
      console.log('='.repeat(60));
      console.log();

      // Use the first valid team found
      let firstTeam = null;
      for (const { teams } of allTeams) {
         const validTeam = teams.find((t) => t?.teamKey);
         if (validTeam) {
            firstTeam = validTeam;
            break;
         }
      }

      if (firstTeam) {
         const leagueKey = firstTeam.teamKey.split('.t.')[0];
         const teamKey = firstTeam.teamKey;

         console.log('# Yahoo API Credentials');
         console.log(`YAHOO_CLIENT_ID=${clientId}`);
         console.log(`YAHOO_CLIENT_SECRET=${clientSecret}`);
         console.log();
         console.log('# OAuth Tokens (from .oauth2-tokens.json)');
         console.log(`YAHOO_ACCESS_TOKEN=${tokens.accessToken}`);
         console.log(`YAHOO_REFRESH_TOKEN=${tokens.refreshToken}`);
         console.log(`YAHOO_TOKEN_EXPIRES_AT=${tokens.expiresAt}`);
         console.log();
         console.log('# Test League and Team Keys');
         console.log(`TEST_LEAGUE_KEY=${leagueKey}`);
         console.log(`TEST_TEAM_KEY=${teamKey}`);
         console.log();
         console.log('# Optional');
         console.log('DEBUG=false');
         console.log('SKIP_INTEGRATION_TESTS=false');
         console.log();

         // Save to file
         const envTestPath = path.join(process.cwd(), '.env.test');
         const envContent = `# Yahoo API Credentials
YAHOO_CLIENT_ID=${clientId}
YAHOO_CLIENT_SECRET=${clientSecret}

# OAuth Tokens (from .oauth2-tokens.json)
YAHOO_ACCESS_TOKEN=${tokens.accessToken}
YAHOO_REFRESH_TOKEN=${tokens.refreshToken}
YAHOO_TOKEN_EXPIRES_AT=${tokens.expiresAt}

# Test League and Team Keys
TEST_LEAGUE_KEY=${leagueKey}
TEST_TEAM_KEY=${teamKey}

# Optional
DEBUG=false
SKIP_INTEGRATION_TESTS=false
`;

         await fs.writeFile(envTestPath, envContent);
         console.log(`✅ Saved to .env.test`);
         console.log();
         console.log('To use these in your integration tests:');
         console.log('  source .env.test');
         console.log('  bun test tests/integration');
      }

      // Show all available options
      if (
         allTeams.length > 1 ||
         (allTeams[0]?.teams.filter((t) => t?.teamKey).length || 0) > 1
      ) {
         console.log();
         console.log('💡 Other available options:');
         console.log('-'.repeat(60));
         for (const { sport, teams } of allTeams) {
            for (const team of teams) {
               if (!team?.teamKey) continue;
               const leagueKey = team.teamKey.split('.t.')[0];
               console.log(
                  `${sport.toUpperCase()}: League=${leagueKey}, Team=${team.teamKey}`,
               );
            }
         }
      }
   } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
   }
}

main().catch(console.error);
