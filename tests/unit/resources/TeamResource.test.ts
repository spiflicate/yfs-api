/**
 * Unit tests for TeamResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { TeamResource } from '../../../src/resources/TeamResource.js';
import team from '../../fixtures/data/team-465-l-30702-t-9.json';
import teamMatchups from '../../fixtures/data/team-465-l-30702-t-9-matchups.json';
import teamRoster from '../../fixtures/data/team-465-l-30702-t-9-roster.json';
import teamStats from '../../fixtures/data/team-465-l-30702-t-9-stats.json';

describe('TeamResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('get()', () => {
      test('should fetch basic team metadata', async () => {
         const mockResponse = { team };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.get('465.l.30702.t.9');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9',
         );
         // expect(result).toEqual(team);
      });

      test('should include sub-resources', async () => {
         const mockResponse = { team };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.get('465.l.30702.t.9', {
            includeStats: true,
            includeStandings: true,
            includeRoster: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9;out=stats,standings,roster',
         );
      });
   });

   describe('getRoster()', () => {
      test('should fetch team roster', async () => {
         const mockResponse = { team: teamRoster };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.getRoster('465.l.30702.t.9');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/roster',
         );
         // expect(result).toEqual(teamRoster);
      });

      test('should fetch roster for specific date', async () => {
         const mockResponse = { team: teamRoster };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getRoster('465.l.30702.t.9', {
            date: '2025-11-20',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/roster;date=2025-11-20',
         );
      });

      test('should fetch roster for specific week', async () => {
         const mockResponse = { team: teamRoster };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getRoster('465.l.30702.t.9', {
            week: 7,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/roster;week=7',
         );
      });

      test('should include stats when requested', async () => {
         const mockResponse = { team: teamRoster };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getRoster('465.l.30702.t.9', {
            includeStats: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/roster;out=stats',
         );
      });
   });

   describe('getStats()', () => {
      test('should fetch team stats', async () => {
         const mockResponse = { team: teamStats };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.getStats('465.l.30702.t.9');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/stats',
         );
         // expect(result).toEqual(teamStats);
      });

      test('should fetch stats for specific coverage type', async () => {
         const mockResponse = { team: teamStats };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getStats('465.l.30702.t.9', {
            coverageType: 'week',
            week: 7,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/stats;type=week;week=7',
         );
      });
   });

   describe('getMatchups()', () => {
      test('should fetch team matchups', async () => {
         const mockResponse = { team: teamMatchups };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.getMatchups('465.l.30702.t.9');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/matchups',
         );
         // expect(result).toEqual(teamMatchups);
      });

      test('should fetch matchups for specific weeks', async () => {
         const mockResponse = { team: teamMatchups };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getMatchups('465.l.30702.t.9', {
            weeks: [1, 2, 3],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/465.l.30702.t.9/matchups;weeks=1,2,3',
         );
      });
   });

   describe('updateRoster()', () => {
      test('should update roster positions', async () => {
         const mockResponse = { team: {} };

         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.updateRoster('465.l.30702.t.9', {
            coverageType: 'date',
            date: '2025-11-20',
            players: [
               { playerKey: '465.p.32763', position: 'C' },
               { playerKey: '465.p.6055', position: 'BN' },
            ],
         });

         expect(httpClient.put).toHaveBeenCalled();
         const call = (httpClient.put as ReturnType<typeof mock>).mock
            .calls[0];
         expect(call?.[0]).toBe(
            '/team/465.l.30702.t.9/roster;date=2025-11-20',
         );
      });
   });
});
