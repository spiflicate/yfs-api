/**
 * Unit tests for PlayerResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { PlayerResource } from '../../../src/resources/PlayerResource.js';
import player from '../../fixtures/data/player-465-p-32763.json';
import playerOwnership from '../../fixtures/data/player-465-p-32763-ownership.json';
import playerStats from '../../fixtures/data/player-465-p-32763-stats.json';

describe('PlayerResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('get()', () => {
      test('should fetch basic player metadata', async () => {
         const mockResponse = { player };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.get('465.p.32763');

         expect(httpClient.get).toHaveBeenCalledWith('/player/465.p.32763');
         // expect(result).toEqual(player);
      });

      test('should include sub-resources', async () => {
         const mockResponse = { player };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.get('465.p.32763', {
            includeStats: true,
            includeOwnership: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/465.p.32763;out=stats,ownership',
         );
      });
   });

   describe('search()', () => {
      test('should search for players in a league', async () => {
         const mockResponse = { league: { players: [player] } };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.search('465.l.30702', {
            search: 'Celebrini',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/players;search=Celebrini',
         );
         // expect(result).toEqual([player]);
      });

      test('should search with multiple filters', async () => {
         const mockResponse = { league: { players: [] } };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.search('465.l.30702', {
            position: 'C',
            status: 'FA',
            sort: '60',
            sortType: 'season',
            count: 25,
            includeStats: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/players;position=C;status=FA;count=25;sort=60;sort_type=season;out=stats',
         );
      });

      test('should handle array of statuses', async () => {
         const mockResponse = { league: { players: [] } };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.search('465.l.30702', {
            status: ['FA', 'W'],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/players;status=FA,W',
         );
      });
   });

   describe('getStats()', () => {
      test('should fetch player stats', async () => {
         const mockResponse = { player: playerStats };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.getStats('465.p.32763', {
            coverageType: 'season',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/465.p.32763/stats;type=season',
         );
         // expect(result).toEqual(playerStats);
      });

      test('should fetch stats for specific date', async () => {
         const mockResponse = { player: playerStats };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.getStats('465.p.32763', {
            coverageType: 'date',
            date: '2025-11-20',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/465.p.32763/stats;type=date;date=2025-11-20',
         );
      });

      test('should fetch stats for specific week', async () => {
         const mockResponse = { player: playerStats };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.getStats('465.p.32763', {
            coverageType: 'week',
            week: 7,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/465.p.32763/stats;type=week;week=7',
         );
      });
   });

   describe('getOwnership()', () => {
      test('should fetch player ownership', async () => {
         const mockResponse = { league: { player: playerOwnership } };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.getOwnership('465.p.32763');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/465.p.32763/ownership',
         );
         // expect(result).toEqual(playerOwnership);
      });
   });
});
