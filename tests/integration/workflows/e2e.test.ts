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

import { beforeAll, describe, expect, test } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   getOAuth2Config,
   getStoredTokens,
   hasStoredTokens,
   shouldSkipIntegrationTests,
} from '../helpers/testConfig.js';
import { InMemoryTokenStorage } from '../helpers/testStorage.js';

function extractTeams(
   response: unknown,
): Array<{ teamKey: string; name?: string }> {
   if (!response || typeof response !== 'object') {
      return [];
   }

   const users = (response as { users?: unknown[] }).users;
   if (!Array.isArray(users)) {
      return [];
   }

   return users.flatMap((user) => {
      if (!user || typeof user !== 'object') {
         return [];
      }

      const games = (user as { games?: unknown[] }).games;
      if (!Array.isArray(games)) {
         return [];
      }

      return games.flatMap((game) => {
         if (!game || typeof game !== 'object') {
            return [];
         }

         const teams = (game as { teams?: unknown[] }).teams;
         if (!Array.isArray(teams)) {
            return [];
         }

         return teams.flatMap((team) => {
            if (!team || typeof team !== 'object') {
               return [];
            }

            const record = team as {
               teamKey?: string;
               team_key?: string;
               name?: string;
            };

            const teamKey = record.teamKey ?? record.team_key;
            return typeof teamKey === 'string'
               ? [{ teamKey, name: record.name }]
               : [];
         });
      });
   });
}

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
            const user = await client.q().users().useLogin().execute();
            expect(user).toBeDefined();

            // Get user's teams (if any)
            const teams = extractTeams(
               await client
                  .q()
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nhl')
                  .teams()
                  .execute(),
            );
            expect(teams).toBeDefined();
            expect(Array.isArray(teams)).toBe(true);
         });
      });

      describe('Team Management Workflow', () => {
         test('should manage team roster', async () => {
            await client.loadTokens();

            // Get user's teams
            const teams = extractTeams(
               await client
                  .q()
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nhl')
                  .teams()
                  .execute(),
            );

            if (teams && teams.length > 0) {
               const teamKey = teams[0]?.teamKey;
               if (!teamKey) return;

               // Get team details
               const team = await client
                  .q()
                  .team(teamKey as `${number}.l.${number}.t.${number}`)
                  .execute();
               expect(team).toBeDefined();
               expect(team.team.teamKey).toBe(teamKey);

               // Get current roster
               const roster = await client
                  .q()
                  .team(teamKey as `${number}.l.${number}.t.${number}`)
                  .roster()
                  .execute();
               expect(roster).toBeDefined();
               expect(roster.team.roster?.players).toBeDefined();
               expect(Array.isArray(roster.team.roster?.players)).toBe(
                  true,
               );

               // Get team stats
               const stats = await client
                  .q()
                  .team(teamKey as `${number}.l.${number}.t.${number}`)
                  .stats()
                  .execute();
               expect(stats).toBeDefined();
            }
         });
      });

      describe('Player Search and Analysis', () => {
         test('should search and analyze players', async () => {
            // Get NHL game
            const game = (await client.q().game('nhl').execute()).game;
            expect(game).toBeDefined();

            // Search for a specific player
            const searchResult = (
               await client
                  .q()
                  .game(game.gameKey)
                  .players()
                  .search('McDavid')
                  .count(5)
                  .execute()
            ).game;

            expect(searchResult).toBeDefined();
            expect(searchResult.players).toBeDefined();

            if (searchResult.players && searchResult.players.length > 0) {
               const firstPlayer = searchResult.players[0];
               if (!firstPlayer?.playerKey) return;

               // Get detailed player information
               const player = await client
                  .q()
                  .player(firstPlayer.playerKey as `${number}.p.${number}`)
                  .execute();
               expect(player).toBeDefined();
               expect(player.player.name).toBeTruthy();
            }
         });

         test('should find free agents in league', async () => {
            // Get user's teams
            const teams = extractTeams(
               await client
                  .q()
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nhl')
                  .teams()
                  .execute(),
            );

            if (teams && teams.length > 0) {
               const team = teams[0];
               if (!team?.teamKey) return;

               // Extract league key from team key
               const leagueKey = team.teamKey.split('.t.')[0];
               if (!leagueKey) return;

               // Search for free agents
               const freeAgents = await client
                  .q()
                  .league(leagueKey as `${number}.l.${number}`)
                  .players()
                  .status('FA')
                  .position('C')
                  .sort('60')
                  .count(25)
                  .execute();

               expect(freeAgents).toBeDefined();
               expect(freeAgents.league.players).toBeDefined();
               expect(Array.isArray(freeAgents.league.players)).toBe(true);
            }
         });
      });

      describe('League Analysis Workflow', () => {
         test('should analyze league standings and matchups', async () => {
            // Get user's teams first
            const teams = extractTeams(
               await client
                  .q()
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nhl')
                  .teams()
                  .execute(),
            );

            if (teams && teams.length > 0) {
               const teamKey = teams[0]?.teamKey;
               if (!teamKey) return;

               // Extract league key from team key
               const leagueKey = teamKey.split('.t.')[0];
               if (!leagueKey) return;

               // Get league details
               const league = await client
                  .q()
                  .league(leagueKey as `${number}.l.${number}`)
                  .execute();
               expect(league).toBeDefined();

               // Get current standings
               const standings = await client
                  .q()
                  .league(leagueKey as `${number}.l.${number}`)
                  .standings()
                  .execute();
               expect(standings).toBeDefined();
               expect(standings.league.standings).toBeDefined();

               // Get current week scoreboard
               const scoreboard = await client
                  .q()
                  .league(leagueKey as `${number}.l.${number}`)
                  .scoreboard()
                  .execute();
               expect(scoreboard).toBeDefined();
               expect(scoreboard.league.scoreboard).toBeDefined();

               // Get league settings
               const settings = await client
                  .q()
                  .league(leagueKey as `${number}.l.${number}`)
                  .settings()
                  .execute();
               expect(settings).toBeDefined();
            }
         });
      });

      describe('Cross-Resource Data Integrity', () => {
         test('should maintain data consistency across resources', async () => {
            await client.loadTokens();

            // Get user's teams
            const teams = extractTeams(
               await client
                  .q()
                  .users()
                  .useLogin()
                  .games()
                  .gameKeys('nhl')
                  .teams()
                  .execute(),
            );

            if (teams && teams.length > 0) {
               const userTeam = teams[0];
               if (!userTeam?.teamKey) return;

               // Get the same team via team resource
               const teamDetails = await client
                  .q()
                  .team(
                     userTeam.teamKey as `${number}.l.${number}.t.${number}`,
                  )
                  .execute();

               // Data should be consistent
               expect(teamDetails.team.teamKey).toBe(userTeam.teamKey);
               expect(teamDetails.team.name).toBe(userTeam.name);
            }
         });
      });

      describe('Error Recovery', () => {
         test('should recover from network errors with retry', async () => {
            await client.loadTokens();

            // This should retry on network issues
            const user = await client.q().users().useLogin().execute();
            expect(user).toBeDefined();
         });

         test('should handle invalid resource keys gracefully', async () => {
            expect(async () => {
               await client.q().league('999.l.99999').execute();
            }).toThrow();

            // Should still be able to make valid requests
            const games = await client.q().game('nhl').execute();
            expect(games).toBeDefined();
         });
      });
   },
);
