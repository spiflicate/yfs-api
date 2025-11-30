/**
 * Unit tests for LeagueResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { LeagueResource } from '../../../src/resources/LeagueResource.js';
import league from '../../fixtures/data/league-465-l-30702.json';
import leagueScoreboard from '../../fixtures/data/league-465-l-30702-scoreboard.json';
import leagueSettings from '../../fixtures/data/league-465-l-30702-settings.json';
import leagueStandings from '../../fixtures/data/league-465-l-30702-standings.json';
import leagueTeams from '../../fixtures/data/league-465-l-30702-teams.json';

describe('LeagueResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('get()', () => {
      test('should fetch basic league metadata', async () => {
         const mockResponse = { league };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const result = await leagueResource.get('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith('/league/465.l.30702');
         expect(result).toEqual(mockResponse);
      });

      test('should include multiple sub-resources', async () => {
         const mockResponse = { league };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.get('465.l.30702', {
            includeSettings: true,
            includeStandings: true,
            includeScoreboard: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702;out=settings,standings,scoreboard',
         );
      });
   });

   describe('getSettings()', () => {
      test('should fetch league settings', async () => {
         const mockResponse = { league: leagueSettings };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const result = await leagueResource.getSettings('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/settings',
         );
         // expect(result).toEqual(leagueSettings);
      });
   });

   describe('getStandings()', () => {
      test('should fetch league standings', async () => {
         const mockResponse = { league: leagueStandings };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const result = await leagueResource.getStandings('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/standings',
         );
         // expect(result).toEqual(leagueStandings);
      });

      test('should fetch standings for specific week', async () => {
         const mockResponse = { league: leagueStandings };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getStandings('465.l.30702', { week: 7 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/standings;week=7',
         );
      });
   });

   describe('getScoreboard()', () => {
      test('should fetch league scoreboard', async () => {
         const mockResponse = { league: leagueScoreboard };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const result = await leagueResource.getScoreboard('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/scoreboard',
         );
         // expect(result).toEqual(leagueScoreboard);
      });

      test('should fetch scoreboard for specific week', async () => {
         const mockResponse = { league: leagueScoreboard };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getScoreboard('465.l.30702', { week: 7 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/scoreboard;week=7',
         );
      });
   });

   describe('getTeams()', () => {
      test('should fetch teams in league', async () => {
         const mockResponse = { league: leagueTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const result = await leagueResource.getTeams('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/teams',
         );
         // expect(result).toEqual(leagueTeams);
      });

      test('should fetch teams with pagination', async () => {
         const mockResponse = { league: leagueTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getTeams('465.l.30702', {
            start: 0,
            count: 5,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/teams;start=0;count=5',
         );
      });

      test('should include sub-resources', async () => {
         const mockResponse = { league: leagueTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getTeams('465.l.30702', {
            includeStats: true,
            includeStandings: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/teams;out=stats,standings',
         );
      });
   });
});
