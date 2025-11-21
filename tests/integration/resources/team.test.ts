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

import { beforeAll, describe, expect, test } from 'bun:test';
import type { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   canAuthenticate,
   getAuthenticatedClient,
} from '../helpers/authFlow.js';
import {
   getTestTeamKey,
   shouldSkipIntegrationTests,
} from '../helpers/testConfig.js';

// Load test keys at module level so skipIf can evaluate them
let TEST_TEAM_KEY: string | null = null;
try {
   TEST_TEAM_KEY = getTestTeamKey();
} catch {
   // TEST_TEAM_KEY not configured
}

describe.skipIf(shouldSkipIntegrationTests() || !canAuthenticate())(
   'Team Resource Integration Tests',
   () => {
      let client: YahooFantasyClient;
      let teamKey: string;

      beforeAll(async () => {
         client = await getAuthenticatedClient();
         teamKey = TEST_TEAM_KEY || '';
         if (teamKey) {
            console.log('✓ Using test team key:', teamKey);
         } else {
            console.warn('✗ TEST_TEAM_KEY not set, tests will be skipped');
         }
      });

      describe('Team Metadata', () => {
         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch basic team information',
            async () => {
               const team = await client.team.get(teamKey);

               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);
               expect(team.name).toBeTruthy();
               expect(team.teamId).toBeTruthy();
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch team with roster',
            async () => {
               const team = await client.team.get(teamKey, {
                  includeRoster: true,
               });

               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch team with stats',
            async () => {
               const team = await client.team.get(teamKey, {
                  includeStats: true,
               });

               expect(team).toBeDefined();
               expect(team.teamKey).toBe(teamKey);
            },
         );
      });

      describe('Team Roster', () => {
         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch team roster',
            async () => {
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
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch roster for specific week',
            async () => {
               const roster = await client.team.getRoster(teamKey, {
                  week: 1,
               });

               expect(roster).toBeDefined();
               expect(roster.players).toBeDefined();
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
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
         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch team stats',
            async () => {
               const stats = await client.team.getStats(teamKey);

               expect(stats).toBeDefined();
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
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
         test.skipIf(!TEST_TEAM_KEY)(
            'should fetch team matchups',
            async () => {
               const matchups = await client.team.getMatchups(teamKey);

               expect(matchups).toBeDefined();
               expect(Array.isArray(matchups)).toBe(true);
            },
         );

         test.skipIf(!TEST_TEAM_KEY)(
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
