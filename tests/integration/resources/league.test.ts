/**
 * Integration tests for League Resource
 *
 * These tests verify league-related operations:
 * - Fetching league metadata
 * - League settings
 * - Standings
 * - Scoreboard
 * - Teams in league
 *
 * NOTE: These tests require valid Yahoo API credentials and stored tokens.
 * Set the following environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_ACCESS_TOKEN
 * - YAHOO_REFRESH_TOKEN
 * - YAHOO_TOKEN_EXPIRES_AT
 * - TEST_LEAGUE_KEY (e.g., "423.l.12345")
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   getOAuth2Config,
   shouldSkipIntegrationTests,
   hasStoredTokens,
   getStoredTokens,
   getTestLeagueKey,
} from '../helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !hasStoredTokens())(
   'League Resource Integration Tests',
   () => {
      let client: YahooFantasyClient;
      let leagueKey: string;

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
            leagueKey = getTestLeagueKey();
         } catch (error) {
            console.warn(
               'TEST_LEAGUE_KEY not set, some tests may be skipped',
            );
            leagueKey = '';
         }
      });

      describe('League Metadata', () => {
         test.skipIf(!leagueKey)(
            'should fetch basic league information',
            async () => {
               const league = await client.league.get(leagueKey);

               expect(league).toBeDefined();
               expect(league.leagueKey).toBe(leagueKey);
               expect(league.name).toBeTruthy();
               expect(league.season).toBeGreaterThan(2000);
               expect(league.gameCode).toBeTruthy();
               expect(league.numberOfTeams).toBeGreaterThan(0);
            },
         );

         test.skipIf(!leagueKey)(
            'should fetch league with settings',
            async () => {
               const league = await client.league.get(leagueKey, {
                  includeSettings: true,
               });

               expect(league).toBeDefined();
               expect(league.leagueKey).toBe(leagueKey);
            },
         );

         test.skipIf(!leagueKey)(
            'should fetch league with standings',
            async () => {
               const league = await client.league.get(leagueKey, {
                  includeStandings: true,
               });

               expect(league).toBeDefined();
               expect(league.leagueKey).toBe(leagueKey);
            },
         );

         test.skipIf(!leagueKey)(
            'should fetch league with scoreboard',
            async () => {
               const league = await client.league.get(leagueKey, {
                  includeScoreboard: true,
               });

               expect(league).toBeDefined();
               expect(league.leagueKey).toBe(leagueKey);
            },
         );
      });

      describe('League Settings', () => {
         test.skipIf(!leagueKey)(
            'should fetch league settings',
            async () => {
               const settings = await client.league.getSettings(leagueKey);

               expect(settings).toBeDefined();
               expect(settings.draftType).toBeTruthy();
               expect(settings.scoringType).toBeTruthy();
            },
         );
      });

      describe('League Standings', () => {
         test.skipIf(!leagueKey)(
            'should fetch league standings',
            async () => {
               const standings =
                  await client.league.getStandings(leagueKey);

               expect(standings).toBeDefined();
               expect(standings.teams).toBeDefined();
               expect(Array.isArray(standings.teams)).toBe(true);
               expect(standings.teams.length).toBeGreaterThan(0);

               // Verify team structure
               const firstTeam = standings.teams[0];
               expect(firstTeam?.teamKey).toBeTruthy();
               expect(firstTeam?.name).toBeTruthy();
               expect((firstTeam as any).standings).toBeDefined();
            },
         );

         test.skipIf(!leagueKey)(
            'should fetch standings for specific week',
            async () => {
               const standings = await client.league.getStandings(
                  leagueKey,
                  {
                     week: 1,
                  },
               );

               expect(standings).toBeDefined();
               expect(standings.teams).toBeDefined();
            },
         );
      });

      describe('League Scoreboard', () => {
         test.skipIf(!leagueKey)(
            'should fetch league scoreboard',
            async () => {
               const scoreboard =
                  await client.league.getScoreboard(leagueKey);

               expect(scoreboard).toBeDefined();
               expect(scoreboard.matchups).toBeDefined();
               expect(Array.isArray(scoreboard.matchups)).toBe(true);
            },
         );

         test.skipIf(!leagueKey)(
            'should fetch scoreboard for specific week',
            async () => {
               const scoreboard = await client.league.getScoreboard(
                  leagueKey,
                  {
                     week: 1,
                  },
               );

               expect(scoreboard).toBeDefined();
               expect(scoreboard.matchups).toBeDefined();
            },
         );
      });

      describe('League Teams', () => {
         test.skipIf(!leagueKey)(
            'should fetch teams in league',
            async () => {
               const teams = await client.league.getTeams(leagueKey);

               expect(teams).toBeDefined();
               expect(Array.isArray(teams)).toBe(true);
               expect(teams.length).toBeGreaterThan(0);

               // Verify team structure
               const firstTeam = teams[0];
               expect(firstTeam?.teamKey).toBeTruthy();
               expect(firstTeam?.name).toBeTruthy();
               expect(firstTeam?.teamKey).toContain(leagueKey);
            },
         );

         test.skipIf(!leagueKey)(
            'should handle team pagination',
            async () => {
               const firstPage = await client.league.getTeams(leagueKey, {
                  start: 0,
                  count: 5,
               });

               expect(firstPage).toBeDefined();
               expect(Array.isArray(firstPage)).toBe(true);
               expect(firstPage.length).toBeLessThanOrEqual(5);
            },
         );
      });

      describe('Error Handling', () => {
         test('should handle invalid league key', async () => {
            expect(async () => {
               await client.league.get('invalid.l.12345');
            }).toThrow();
         });
      });
   },
);
