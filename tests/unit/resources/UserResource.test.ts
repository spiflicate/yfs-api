/**
 * Unit tests for UserResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { UserResource } from '../../../src/resources/UserResource.js';
import userCurrent from '../../fixtures/data/user-current.json';
import userGames from '../../fixtures/data/user-games.json';
import userTeams from '../../fixtures/data/user-teams.json';

describe('UserResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('getCurrentUser()', () => {
      test('should fetch current user profile', async () => {
         const mockResponse = { users: userCurrent };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const result = await userResource.getCurrentUser();

         expect(httpClient.get).toHaveBeenCalledWith('/users;use_login=1');
         expect(result).toEqual(mockResponse);
      });
   });

   describe('getGames()', () => {
      test('should fetch user games', async () => {
         const mockResponse = { users: userGames };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const result = await userResource.getGames();

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games',
         );
         expect(result).toEqual(mockResponse);
      });

      test('should filter by game codes', async () => {
         const mockResponse = { users: userGames };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getGames({ gameCodes: ['nhl', 'nfl'] });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;game_codes=nhl,nfl',
         );
      });

      test('should filter by seasons', async () => {
         const mockResponse = { users: userGames };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getGames({ seasons: [2025, 2024] });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;seasons=2025,2024',
         );
      });

      test('should include teams when requested', async () => {
         const mockResponse = { users: userGames };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getGames({ includeTeams: true });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games/teams',
         );
      });
   });

   describe('getTeams()', () => {
      test('should fetch user teams', async () => {
         const mockResponse = { users: userTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const result = await userResource.getTeams();

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games/teams',
         );
         // expect(result).toEqual(userTeams);
      });

      test('should filter by game code', async () => {
         const mockResponse = { users: userTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getTeams({ gameCode: 'nhl' });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;game_codes=nhl/teams',
         );
      });

      test('should filter by game code and season', async () => {
         const mockResponse = { users: userTeams };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getTeams({ gameCode: 'nhl', season: 2025 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;game_codes=nhl;seasons=2025/teams',
         );
      });
   });
});
