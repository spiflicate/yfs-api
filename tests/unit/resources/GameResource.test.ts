/**
 * Unit tests for GameResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { GameResource } from '../../../src/resources/GameResource.js';
import gameNhl from '../../fixtures/data/game-nhl.json';
import gameNhlPlayers from '../../fixtures/data/game-nhl-players.json';
import gameNhlStatCategories from '../../fixtures/data/game-nhl-stat-categories.json';

describe('GameResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('get()', () => {
      test('should fetch basic game metadata', async () => {
         const mockResponse = { game: gameNhl };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const game = await gameResource.get('465');

         expect(httpClient.get).toHaveBeenCalledWith('/game/465');
         expect(game).toEqual(mockResponse);
      });

      test('should include stat categories sub-resource when requested', async () => {
         const mockResponse = { game: gameNhlStatCategories };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.get('465', {
            includeStatCategories: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/465;out=stat_categories',
         );
      });

      test('should include multiple sub-resources', async () => {
         const mockResponse = { game: gameNhlStatCategories };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.get('465', {
            includeStatCategories: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/465;out=stat_categories',
         );
      });
   });

   describe('getGames()', () => {
      test('should fetch multiple games without filters', async () => {
         const mockResponse = { games: [gameNhl] };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const response = await gameResource.getGames();

         expect(httpClient.get).toHaveBeenCalledWith('/games');
         expect(Array.isArray(response.games)).toBe(true);
      });

      test('should filter games by availability', async () => {
         const mockResponse = { games: [gameNhl] };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.getGames({ isAvailable: true });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/games;is_available=1',
         );
      });

      test('should filter games by multiple criteria', async () => {
         const mockResponse = { games: [] };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.getGames({
            gameCodes: ['nhl', 'nfl'],
            seasons: [2025, 2024],
            gameTypes: ['full'],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/games;game_types=full;game_codes=nhl,nfl;seasons=2025,2024',
         );
      });
   });

   describe('searchPlayers()', () => {
      test('should search for players with fixture data', async () => {
         const mockResponse = { players: gameNhlPlayers };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.searchPlayers('465');

         expect(httpClient.get).toHaveBeenCalledWith('/game/465/players');
      });

      test('should search with filters', async () => {
         const mockResponse = { players: gameNhlPlayers };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.searchPlayers('465', {
            position: 'C',
            sort: '60',
            sortType: 'season',
            count: 25,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/465/players;position=C;sort=60;sort_type=season;count=25',
         );
      });

      test('should include stats when requested', async () => {
         const mockResponse = { players: gameNhlPlayers };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.searchPlayers('465', {
            search: 'McDavid',
            includeStats: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/465/players;search=McDavid;out=stats',
         );
      });
   });
});
