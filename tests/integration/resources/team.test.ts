/**
 * Integration tests for Team Resource
 *
 * These tests verify team-related operations:
 * - Fetching team metadata
 * - Team roster
 * - Team stats
 * - Team matchups
 *
 * NOTE: These tests require valid Yahoo API credentials and stored tokens.
 * Set the following environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_ACCESS_TOKEN
 * - YAHOO_REFRESH_TOKEN
 * - YAHOO_TOKEN_EXPIRES_AT
 * - TEST_TEAM_KEY (e.g., "423.l.12345.t.1")
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   getOAuth2Config,
   shouldSkipIntegrationTests,
   hasStoredTokens,
   getStoredTokens,
   getTestTeamKey,
} from '../helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !hasStoredTokens())(
   'Team Resource Integration Tests',
   () => {
      let client: YahooFantasyClient;
      let teamKey: string;

      beforeAll(() => {
         const config = getOAuth2Config();
         const tokens = getStoredTokens();

         if (!tokens) {
            throw new Error('No stored tokens available for testing');
         }

         client = new YahooFantasyClient({
            ...config,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
         });

         try {
            teamKey = getTestTeamKey();
         } catch (error) {
            console.warn(
               'TEST_TEAM_KEY not set, some tests may be skipped',
            );
            teamKey = '';
         }
      });

      describe('Team Metadata', () => {
         test.skipIf(!teamKey)(
            'should fetch basic team information',
            async () => {
               const team = await client.team.get(teamKey);

               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);
               expect(team.name).toBeTruthy();
               expect(team.teamId).toBeTruthy();
            },
         );

         test.skipIf(!teamKey)(
            'should fetch team with roster',
            async () => {
               const team = await client.team.get(teamKey, {
                  includeRoster: true,
               });

               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);
            },
         );

         test.skipIf(!teamKey)('should fetch team with stats', async () => {
            const team = await client.team.get(teamKey, {
               includeStats: true,
            });

            expect(team).toBeDefined();
            expect(team.teamKey).toBe(teamKey);
         });
      });

      describe('Team Roster', () => {
         test.skipIf(!teamKey)('should fetch team roster', async () => {
            const roster = await client.team.getRoster(teamKey);

            expect(roster).toBeDefined();
            expect(roster.players).toBeDefined();
            expect(Array.isArray(roster.players)).toBe(true);
            expect(roster.players.length).toBeGreaterThan(0);

            // Verify player structure
            const firstPlayer = roster.players[0];
            expect(firstPlayer?.playerKey).toBeTruthy();
            expect(firstPlayer?.name).toBeTruthy();
            expect(firstPlayer?.selectedPosition).toBeDefined();
         });

         test.skipIf(!teamKey)(
            'should fetch roster for specific week',
            async () => {
               const roster = await client.team.getRoster(teamKey, {
                  week: 1,
               });

               expect(roster).toBeDefined();
               expect(roster.players).toBeDefined();
            },
         );

         test.skipIf(!teamKey)(
            'should fetch roster for specific date',
            async () => {
               const today = new Date().toISOString().split('T')[0];
               const roster = await client.team.getRoster(teamKey, {
                  date: today,
               });

               expect(roster).toBeDefined();
               expect(roster.players).toBeDefined();
            },
         );
      });

      describe('Team Stats', () => {
         test.skipIf(!teamKey)('should fetch team stats', async () => {
            const stats = await client.team.getStats(teamKey);

            expect(stats).toBeDefined();
         });

         test.skipIf(!teamKey)(
            'should fetch stats for specific week',
            async () => {
               const stats = await client.team.getStats(teamKey, {
                  week: 1,
               });

               expect(stats).toBeDefined();
            },
         );
      });

      describe('Team Matchups', () => {
         test.skipIf(!teamKey)('should fetch team matchups', async () => {
            const matchups = await client.team.getMatchups(teamKey);

            expect(matchups).toBeDefined();
            expect(Array.isArray(matchups)).toBe(true);
         });

         test.skipIf(!teamKey)(
            'should fetch matchups for specific weeks',
            async () => {
               const matchups = await client.team.getMatchups(teamKey, {
                  weeks: [1, 2, 3],
               });

               expect(matchups).toBeDefined();
               expect(Array.isArray(matchups)).toBe(true);
            },
         );
      });

      describe('Error Handling', () => {
         test('should handle invalid team key', async () => {
            expect(async () => {
               await client.team.get('invalid.l.12345.t.1');
            }).toThrow();
         });
      });
   },
);
