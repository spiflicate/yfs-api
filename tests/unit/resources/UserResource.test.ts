/**
 * Unit tests for UserResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { UserResource } from '../../../src/resources/UserResource.js';

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
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  url: 'https://sports.yahoo.com/user/ABC123XYZ',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const user = await userResource.getCurrentUser();

         expect(httpClient.get).toHaveBeenCalledWith('/users;use_login=1');
         expect(user.guid).toBe('ABC123XYZ');
         expect(user.url).toBe('https://sports.yahoo.com/user/ABC123XYZ');
      });
   });

   describe('getGames()', () => {
      test('should fetch all user games', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     game: [
                        {
                           game_key: '423',
                           game_id: '423',
                           code: 'nhl',
                           season: '2024',
                        },
                        {
                           game_key: '414',
                           game_id: '414',
                           code: 'nfl',
                           season: '2024',
                        },
                     ],
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const games = await userResource.getGames();

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games',
         );
         expect(games.length).toBe(2);
         expect(games[0]?.gameCode).toBe('nhl');
         expect(games[0]?.season).toBe(2024);
         expect(games[1]?.gameCode).toBe('nfl');
      });

      test('should filter games by game codes', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     game: {
                        game_key: '423',
                        game_id: '423',
                        code: 'nhl',
                        season: '2024',
                     },
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getGames({ gameCodes: ['nhl'] });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;game_codes=nhl',
         );
      });

      test('should filter games by seasons', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     count: 0,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getGames({ seasons: [2024, 2023] });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;seasons=2024,2023',
         );
      });

      test('should include teams when requested', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     game: {
                        game_key: '423',
                        game_id: '423',
                        code: 'nhl',
                        season: '2024',
                        teams: {
                           team: {
                              team_key: '423.l.12345.t.1',
                              team_id: '1',
                              name: 'My Team',
                              url: 'https://hockey.fantasysports.yahoo.com/team/1',
                              league: {
                                 league_key: '423.l.12345',
                                 league_id: '12345',
                                 name: 'Test League',
                                 url: 'https://hockey.fantasysports.yahoo.com/league/12345',
                              },
                           },
                        },
                     },
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const games = await userResource.getGames({ includeTeams: true });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games/teams',
         );
         expect(games[0]?.teams).toBeDefined();
         expect(games[0]?.teams?.length).toBe(1);
      });

      test('should return empty array when no games found', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const games = await userResource.getGames();

         expect(games).toEqual([]);
      });
   });

   describe('getTeams()', () => {
      test('should fetch all user teams', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     game: {
                        game_key: '423',
                        game_id: '423',
                        code: 'nhl',
                        season: '2024',
                        teams: {
                           team: [
                              {
                                 team_key: '423.l.12345.t.1',
                                 team_id: '1',
                                 name: 'Team Alpha',
                                 url: 'https://hockey.fantasysports.yahoo.com/team/1',
                                 league: {
                                    league_key: '423.l.12345',
                                    league_id: '12345',
                                    name: 'League One',
                                    url: 'https://hockey.fantasysports.yahoo.com/league/12345',
                                 },
                              },
                              {
                                 team_key: '423.l.67890.t.2',
                                 team_id: '2',
                                 name: 'Team Beta',
                                 url: 'https://hockey.fantasysports.yahoo.com/team/2',
                                 league: {
                                    league_key: '423.l.67890',
                                    league_id: '67890',
                                    name: 'League Two',
                                    url: 'https://hockey.fantasysports.yahoo.com/league/67890',
                                 },
                              },
                           ],
                        },
                     },
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const teams = await userResource.getTeams();

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games/teams',
         );
         expect(teams.length).toBe(2);
         expect(teams[0]?.teamKey).toBe('423.l.12345.t.1');
         expect(teams[0]?.name).toBe('Team Alpha');
         expect(teams[1]?.teamKey).toBe('423.l.67890.t.2');
         expect(teams[1]?.name).toBe('Team Beta');
      });

      test('should filter teams by game code', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     count: 0,
                  },
               },
            },
         };

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

      test('should filter teams by season', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
                  games: {
                     count: 0,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         await userResource.getTeams({ gameCode: 'nhl', season: 2024 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/users;use_login=1/games;game_codes=nhl;seasons=2024/teams',
         );
      });

      test('should return empty array when no teams found', async () => {
         const mockResponse = {
            users: {
               user: {
                  guid: 'ABC123XYZ',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const userResource = new UserResource(httpClient);
         const teams = await userResource.getTeams();

         expect(teams).toEqual([]);
      });
   });
});
