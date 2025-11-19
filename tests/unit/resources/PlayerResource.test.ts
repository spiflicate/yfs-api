/**
 * Unit tests for PlayerResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { PlayerResource } from '../../../src/resources/PlayerResource.js';

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
      test('should fetch player details', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                     player_id: '8888',
                     name: {
                        full: 'Connor McDavid',
                        first: 'Connor',
                        last: 'McDavid',
                        ascii: 'Connor McDavid',
                     },
                     editorial_team_abbr: 'Edm',
                     editorial_team_full_name: 'Edmonton Oilers',
                     display_position: 'C',
                     position_type: 'P',
                     primary_position: 'C',
                     uniform_number: '97',
                     is_undroppable: '0',
                     has_player_notes: '1',
                     url: 'https://hockey.fantasysports.yahoo.com/player/8888',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const player = await playerResource.get('423.p.8888');

         expect(httpClient.get).toHaveBeenCalledWith('/player/423.p.8888');
         expect(player.playerKey).toBe('423.p.8888');
         expect(player.playerId).toBe('8888');
         expect(player.name.full).toBe('Connor McDavid');
         expect(player.editorialTeamAbbr).toBe('Edm');
         expect(player.displayPosition).toBe('C');
         expect(player.uniformNumber).toBe('97');
      });

      test('should include sub-resources when requested', async () => {
         const mockResponse = {
            fantasy_content: {
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
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         await playerResource.get('423.p.8888', {
            includeStats: true,
            includeOwnership: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/423.p.8888;out=stats,ownership',
         );
      });
   });

   describe('search()', () => {
      test('should search for players in a league', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
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

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.search('423.l.12345', {
            search: 'McDavid',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/players;search=McDavid',
         );
         expect(result.count).toBe(1);
         expect(result.players.length).toBe(1);
         expect(result.players[0]?.name.full).toBe('Connor McDavid');
      });

      test('should search with multiple filters', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
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

         const playerResource = new PlayerResource(httpClient);
         await playerResource.search('423.l.12345', {
            status: 'FA',
            position: 'C',
            sort: '60',
            sortOrder: 'desc',
            count: 25,
            includeStats: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/players;position=C;status=FA;count=25;sort=60;sort_type=desc;out=stats',
         );
      });

      test('should handle multiple statuses', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
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

         const playerResource = new PlayerResource(httpClient);
         await playerResource.search('423.l.12345', {
            status: ['FA', 'W'],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/players;status=FA,W',
         );
      });

      test('should return empty result when no players found', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);
         const result = await playerResource.search('423.l.12345');

         expect(result.count).toBe(0);
         expect(result.players).toEqual([]);
      });
   });

   describe('getStats()', () => {
      test('should fetch player stats', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
                  {
                     player_stats: {
                        coverage_type: 'season',
                        season: '2024',
                        stats: {
                           0: {
                              stat: {
                                 stat_id: '1',
                                 value: '50',
                              },
                           },
                           1: {
                              stat: {
                                 stat_id: '2',
                                 value: '75',
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

         const playerResource = new PlayerResource(httpClient);
         const stats = await playerResource.getStats('423.p.8888', {
            coverageType: 'season',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/423.p.8888/stats;type=season',
         );
         expect(stats.coverageType).toBe('season');
         expect(stats.season).toBe(2024);
         expect(stats.stats[1]).toBe('50');
         expect(stats.stats[2]).toBe('75');
      });

      test('should fetch stats for specific date', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
                  {
                     player_stats: {
                        coverage_type: 'date',
                        date: '2024-11-20',
                        stats: {
                           count: 0,
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

         const playerResource = new PlayerResource(httpClient);
         await playerResource.getStats('423.p.8888', {
            coverageType: 'date',
            date: '2024-11-20',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/423.p.8888/stats;type=date;date=2024-11-20',
         );
      });

      test('should fetch stats for specific week', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
                  {
                     player_stats: {
                        coverage_type: 'week',
                        week: '10',
                        stats: {
                           count: 0,
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

         const playerResource = new PlayerResource(httpClient);
         await playerResource.getStats('423.p.8888', {
            coverageType: 'week',
            week: 10,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/423.p.8888/stats;type=week;week=10',
         );
      });

      test('should throw error when stats not found', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);

         await expect(
            playerResource.getStats('423.p.8888', {
               coverageType: 'season',
            }),
         ).rejects.toThrow('Stats not found in response');
      });
   });

   describe('getOwnership()', () => {
      test('should fetch player ownership', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
                  {
                     ownership: {
                        ownership_type: 'team',
                        owner_team_key: '423.l.12345.t.1',
                        owner_team_name: 'My Team',
                        percent_owned: {
                           value: '87.5',
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

         const playerResource = new PlayerResource(httpClient);
         const ownership = await playerResource.getOwnership('423.p.8888');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/player/423.p.8888/ownership',
         );
         expect(ownership.ownershipType).toBe('team');
         expect(ownership.ownerTeamKey).toBe('423.l.12345.t.1');
         expect(ownership.ownerTeamName).toBe('My Team');
         expect(ownership.percentOwned).toBe(87.5);
      });

      test('should handle free agent ownership', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
                  {
                     ownership: {
                        ownership_type: 'freeagents',
                        percent_owned: {
                           value: '15.3',
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

         const playerResource = new PlayerResource(httpClient);
         const ownership = await playerResource.getOwnership('423.p.8888');

         expect(ownership.ownershipType).toBe('freeagents');
         expect(ownership.percentOwned).toBe(15.3);
      });

      test('should throw error when ownership not found', async () => {
         const mockResponse = {
            fantasy_content: {
               player: [
                  {
                     player_key: '423.p.8888',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const playerResource = new PlayerResource(httpClient);

         await expect(
            playerResource.getOwnership('423.p.8888'),
         ).rejects.toThrow('Ownership not found in response');
      });
   });
});
