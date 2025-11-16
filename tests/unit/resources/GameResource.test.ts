/**
 * Unit tests for GameResource
 */

import { describe, test, expect, mock } from 'bun:test';
import { GameResource } from '../../../src/resources/GameResource.js';
import type { HttpClient } from '../../../src/client/HttpClient.js';

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
      test('should fetch game metadata', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                     game_id: '423',
                     name: 'Hockey',
                     code: 'nhl',
                     type: 'full',
                     season: '2024',
                     is_available: '1',
                     is_game_over: '0',
                     url: 'https://hockey.fantasysports.yahoo.com',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const game = await gameResource.get('423');

         expect(httpClient.get).toHaveBeenCalledWith('/game/423');
         expect(game.gameKey).toBe('423');
         expect(game.gameId).toBe('423');
         expect(game.name).toBe('Hockey');
         expect(game.code).toBe('nhl');
         expect(game.season).toBe(2024);
         expect(game.isAvailable).toBe(true);
         expect(game.isGameOver).toBe(false);
      });

      test('should include sub-resources when requested', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                     game_id: '423',
                     name: 'Hockey',
                     code: 'nhl',
                     type: 'full',
                     season: '2024',
                     url: 'https://hockey.fantasysports.yahoo.com',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.get('423', {
            includeStatCategories: true,
            includePositionTypes: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/423;out=stat_categories,position_types',
         );
      });
   });

   describe('getGames()', () => {
      test('should fetch multiple games', async () => {
         const mockResponse = {
            fantasy_content: {
               games: {
                  0: {
                     game: [
                        {
                           game_key: '423',
                           game_id: '423',
                           name: 'Hockey',
                           code: 'nhl',
                           type: 'full',
                           season: '2024',
                           url: 'https://hockey.fantasysports.yahoo.com',
                        },
                     ],
                  },
                  1: {
                     game: [
                        {
                           game_key: '414',
                           game_id: '414',
                           name: 'Football',
                           code: 'nfl',
                           type: 'full',
                           season: '2024',
                           url: 'https://football.fantasysports.yahoo.com',
                        },
                     ],
                  },
                  count: 2,
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const games = await gameResource.getGames();

         expect(httpClient.get).toHaveBeenCalledWith('/games');
         expect(games.length).toBe(2);
         expect(games[0]?.code).toBe('nhl');
         expect(games[1]?.code).toBe('nfl');
      });

      test('should filter games by availability', async () => {
         const mockResponse = {
            fantasy_content: {
               games: {
                  count: 0,
               },
            },
         };

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
         const mockResponse = {
            fantasy_content: {
               games: {
                  count: 0,
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.getGames({
            gameCodes: ['nhl', 'nfl'],
            seasons: [2024, 2023],
            gameTypes: ['full'],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/games;game_types=full;game_codes=nhl,nfl;seasons=2024,2023',
         );
      });
   });

   describe('getLeagues()', () => {
      test('should fetch leagues for a game', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
                  {
                     leagues: {
                        0: {
                           league: [
                              {
                                 league_key: '423.l.12345',
                                 league_id: '12345',
                                 name: 'Test League',
                                 game_key: '423',
                                 game_code: 'nhl',
                                 season: '2024',
                                 scoring_type: 'head',
                                 league_type: 'private',
                                 num_teams: '12',
                                 current_week: '10',
                                 draft_status: 'postdraft',
                                 is_finished: '0',
                                 url: 'https://hockey.fantasysports.yahoo.com/league/12345',
                              },
                           ],
                        },
                        count: 1,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const leagues = await gameResource.getLeagues('423');

         expect(httpClient.get).toHaveBeenCalledWith('/game/423/leagues');
         expect(leagues.length).toBe(1);
         expect(leagues[0]?.leagueKey).toBe('423.l.12345');
         expect(leagues[0]?.name).toBe('Test League');
      });

      test('should return empty array when no leagues found', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const leagues = await gameResource.getLeagues('423');

         expect(leagues).toEqual([]);
      });
   });

   describe('searchPlayers()', () => {
      test('should search for players', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
                  {
                     players: {
                        0: {
                           player: [
                              {
                                 player_key: '423.p.8888',
                                 player_id: '8888',
                                 name: {
                                    full: 'Connor McDavid',
                                    first: 'Connor',
                                    last: 'McDavid',
                                 },
                                 display_position: 'C',
                                 url: 'https://hockey.fantasysports.yahoo.com/player/8888',
                              },
                           ],
                        },
                        count: 1,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const result = await gameResource.searchPlayers('423', {
            search: 'McDavid',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/423/players;search=McDavid',
         );
         expect(result.count).toBe(1);
         expect(result.players.length).toBe(1);
         expect(result.players[0]?.name.full).toBe('Connor McDavid');
      });

      test('should search with multiple filters', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
                  {
                     players: {
                        count: 0,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         await gameResource.searchPlayers('423', {
            position: 'C',
            sort: '60',
            sortType: 'season',
            count: 25,
            includeStats: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/423/players;position=C;sort=60;sort_type=season;count=25;out=stats',
         );
      });

      test('should return empty result when no players found', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const result = await gameResource.searchPlayers('423');

         expect(result.count).toBe(0);
         expect(result.players).toEqual([]);
      });
   });

   describe('getGameWeeks()', () => {
      test('should fetch game weeks', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '414',
                  },
                  {
                     game_weeks: {
                        0: {
                           game_week: {
                              week: '1',
                              start: '2024-09-05',
                              end: '2024-09-11',
                              display_name: 'Week 1',
                           },
                        },
                        1: {
                           game_week: {
                              week: '2',
                              start: '2024-09-12',
                              end: '2024-09-18',
                              display_name: 'Week 2',
                           },
                        },
                        count: 2,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const weeks = await gameResource.getGameWeeks('414');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/414/game_weeks',
         );
         expect(weeks.length).toBe(2);
         expect(weeks[0]?.week).toBe(1);
         expect(weeks[0]?.start).toBe('2024-09-05');
         expect(weeks[1]?.week).toBe(2);
      });

      test('should return empty array when no weeks found', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '414',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const weeks = await gameResource.getGameWeeks('414');

         expect(weeks).toEqual([]);
      });
   });

   describe('getStatCategories()', () => {
      test('should fetch stat categories', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
                  {
                     stat_categories: {
                        stats: {
                           0: {
                              stat: {
                                 stat_id: '1',
                                 enabled: '1',
                                 name: 'G',
                                 display_name: 'Goals',
                                 sort_order: '1',
                                 position_type: 'P',
                              },
                           },
                           1: {
                              stat: {
                                 stat_id: '2',
                                 enabled: '1',
                                 name: 'A',
                                 display_name: 'Assists',
                              },
                           },
                           count: 2,
                        },
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const stats = await gameResource.getStatCategories('423');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/423/stat_categories',
         );
         expect(stats.length).toBe(2);
         expect(stats[0]?.statId).toBe(1);
         expect(stats[0]?.name).toBe('G');
         expect(stats[0]?.enabled).toBe(true);
         expect(stats[1]?.statId).toBe(2);
      });
   });

   describe('getPositionTypes()', () => {
      test('should fetch position types', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
                  {
                     position_types: {
                        0: {
                           position_type: {
                              type: 'P',
                              display_name: 'Players',
                           },
                        },
                        1: {
                           position_type: {
                              type: 'G',
                              display_name: 'Goalies',
                           },
                        },
                        count: 2,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const positions = await gameResource.getPositionTypes('423');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/game/423/position_types',
         );
         expect(positions.length).toBe(2);
         expect(positions[0]?.type).toBe('P');
         expect(positions[0]?.displayName).toBe('Players');
      });

      test('should return empty array when no positions found', async () => {
         const mockResponse = {
            fantasy_content: {
               game: [
                  {
                     game_key: '423',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const gameResource = new GameResource(httpClient);
         const positions = await gameResource.getPositionTypes('423');

         expect(positions).toEqual([]);
      });
   });
});
