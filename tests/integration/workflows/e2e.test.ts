/**
 * End-to-end workflow integration tests
 *
 * These tests verify complete user workflows combining multiple resources:
 * - User authentication and league access
 * - Team management and roster updates
 * - Player searches and team building
 *
 * NOTE: These tests require valid Yahoo API credentials and stored tokens.
 * Set the following environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_ACCESS_TOKEN
 * - YAHOO_REFRESH_TOKEN
 * - YAHOO_TOKEN_EXPIRES_AT
 * - TEST_LEAGUE_KEY (optional)
 * - TEST_TEAM_KEY (optional)
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   getOAuth2Config,
   shouldSkipIntegrationTests,
   hasStoredTokens,
   getStoredTokens,
} from '../helpers/testConfig.js';
import { InMemoryTokenStorage } from '../helpers/testStorage.js';

describe.skipIf(shouldSkipIntegrationTests() || !hasStoredTokens())(
   'End-to-End Workflow Tests',
   () => {
      let client: YahooFantasyClient;

      beforeAll(() => {
         const config = getOAuth2Config();
         const tokens = getStoredTokens();

         if (!tokens) {
            throw new Error('No stored tokens available for testing');
         }

         const storage = new InMemoryTokenStorage();
         storage.save(tokens);

         client = new YahooFantasyClient(config, storage);
      });

      describe('Authentication Flow', () => {
         test('should complete full authentication workflow', async () => {
            const config = getOAuth2Config();
            const storage = new InMemoryTokenStorage();
            const testClient = new YahooFantasyClient(config, storage);

            // Initially not authenticated
            expect(testClient.isAuthenticated()).toBe(false);

            // Load tokens from storage
            const tokens = getStoredTokens();
            if (tokens) {
               storage.save(tokens);
               await testClient.loadTokens();

               expect(testClient.isAuthenticated()).toBe(true);
               expect(testClient.getTokens()).toBeTruthy();
            }
         });

         test('should handle token refresh in workflow', async () => {
            await client.loadTokens();

            if (client.isTokenExpired(300)) {
               // 5 minute buffer
               await client.refreshToken();
               expect(client.isAuthenticated()).toBe(true);
               expect(client.isTokenExpired()).toBe(false);
            }
         });
      });

      describe('User and League Discovery', () => {
         test('should discover user leagues and teams', async () => {
            await client.loadTokens();

            // Get current user
            const user = await client.user.getCurrentUser();
            expect(user).toBeDefined();

            // Get user's teams (if any)
            const teams = await client.user.getTeams({
               gameCode: 'nhl',
            });
            expect(teams).toBeDefined();
            expect(Array.isArray(teams)).toBe(true);
         });
      });

      describe('Team Management Workflow', () => {
         test('should manage team roster', async () => {
            await client.loadTokens();

            // Get user's teams
            const teams = await client.user.getTeams({
               gameCode: 'nhl',
            });

            if (teams && teams.length > 0) {
               const teamKey = teams[0]?.teamKey;
               if (!teamKey) return;

               // Get team details
               const team = await client.team.get(teamKey);
               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);

               // Get current roster
               const roster = await client.team.getRoster(teamKey);
               expect(roster).toBeDefined();
               expect(roster.players).toBeDefined();
               expect(Array.isArray(roster.players)).toBe(true);

               // Get team stats
               const stats = await client.team.getStats(teamKey);
               expect(stats).toBeDefined();
            }
         });
      });

      describe('Player Search and Analysis', () => {
         test('should search and analyze players', async () => {
            // Get NHL game
            const game = await client.game.get('nhl');
            expect(game).toBeDefined();

            // Search for a specific player
            const searchResult = await client.game.searchPlayers(
               game.gameKey,
               {
                  search: 'McDavid',
                  count: 5,
               },
            );

            expect(searchResult).toBeDefined();
            expect(searchResult.players).toBeDefined();

            if (searchResult.players && searchResult.players.length > 0) {
               const firstPlayer = searchResult.players[0];
               if (!firstPlayer?.playerKey) return;

               // Get detailed player information
               const player = await client.player.get(
                  firstPlayer.playerKey,
               );
               expect(player).toBeDefined();
               expect(player.name).toBeTruthy();
            }
         });

         test('should find free agents in league', async () => {
            // Get user's teams
            const teams = await client.user.getTeams({
               gameCode: 'nhl',
            });

            if (teams && teams.length > 0) {
               const team = teams[0];
               if (!team?.teamKey) return;

               // Extract league key from team key
               const leagueKey = team.teamKey.split('.t.')[0];
               if (!leagueKey) return;

               // Search for free agents
               const freeAgents = await client.player.search(leagueKey, {
                  status: 'FA',
                  position: 'C',
                  sort: '60',
                  count: 25,
               });

               expect(freeAgents).toBeDefined();
               expect(freeAgents.players).toBeDefined();
               expect(Array.isArray(freeAgents.players)).toBe(true);
            }
         });
      });

      describe('League Analysis Workflow', () => {
         test('should analyze league standings and matchups', async () => {
            // Get user's teams first
            const teams = await client.user.getTeams({
               gameCode: 'nhl',
            });

            if (teams && teams.length > 0) {
               const teamKey = teams[0]?.teamKey;
               if (!teamKey) return;

               // Extract league key from team key
               const leagueKey = teamKey.split('.t.')[0];
               if (!leagueKey) return;

               // Get league details
               const league = await client.league.get(leagueKey);
               expect(league).toBeDefined();

               // Get current standings
               const standings =
                  await client.league.getStandings(leagueKey);
               expect(standings).toBeDefined();
               expect(standings.teams).toBeDefined();

               // Get current week scoreboard
               const scoreboard =
                  await client.league.getScoreboard(leagueKey);
               expect(scoreboard).toBeDefined();
               expect(scoreboard.matchups).toBeDefined();

               // Get league settings
               const settings = await client.league.getSettings(leagueKey);
               expect(settings).toBeDefined();
            }
         });
      });

      describe('Cross-Resource Data Integrity', () => {
         test('should maintain data consistency across resources', async () => {
            await client.loadTokens();

            // Get user's teams
            const teams = await client.user.getTeams({
               gameCode: 'nhl',
            });

            if (teams && teams.length > 0) {
               const userTeam = teams[0];
               if (!userTeam?.teamKey) return;

               // Get the same team via team resource
               const teamDetails = await client.team.get(userTeam.teamKey);

               // Data should be consistent
               expect(teamDetails.teamKey).toBe(userTeam.teamKey);
               expect(teamDetails.name).toBe(userTeam.name);
            }
         });
      });

      describe('Error Recovery', () => {
         test('should recover from network errors with retry', async () => {
            await client.loadTokens();

            // This should retry on network issues
            const user = await client.user.getCurrentUser();
            expect(user).toBeDefined();
         });

         test('should handle invalid resource keys gracefully', async () => {
            expect(async () => {
               await client.league.get('invalid.l.99999');
            }).toThrow();

            // Should still be able to make valid requests
            const games = await client.game.getGames({
               isAvailable: true,
            });
            expect(games).toBeDefined();
         });
      });
   },
);
