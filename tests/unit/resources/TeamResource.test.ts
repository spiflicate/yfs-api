/**
 * Unit tests for TeamResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { TeamResource } from '../../../src/resources/TeamResource.js';

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
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               team_id: '1',
               name: 'My Team',
               is_owned_by_current_login: '1',
               waiver_priority: '3',
               number_of_moves: '15',
               number_of_trades: '2',
               faab_balance: '50',
               url: 'https://hockey.fantasysports.yahoo.com/team/1',
               league: {
                  league_key: '423.l.12345',
                  league_id: '12345',
                  name: 'Test League',
                  url: 'https://hockey.fantasysports.yahoo.com/league/12345',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const team = await teamResource.get('423.l.12345.t.1');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1',
         );
         expect(team.teamKey).toBe('423.l.12345.t.1');
         expect(team.teamId).toBe('1');
         expect(team.name).toBe('My Team');
         expect(team.isOwnedByCurrentLogin).toBe(true);
         expect(team.waiverPriority).toBe(3);
         expect(team.numberOfMoves).toBe(15);
         expect(team.faabBalance).toBe(50);
      });

      test('should include sub-resources when requested', async () => {
         const mockResponse = {
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
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.get('423.l.12345.t.1', {
            includeStats: true,
            includeStandings: true,
            includeRoster: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1;out=stats,standings,roster',
         );
      });
   });

   describe('getRoster()', () => {
      test('should fetch team roster', async () => {
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               roster: {
                  coverage_type: 'date',
                  date: '2024-11-15',
                  is_editable: '1',
                  players: {
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
                           eligible_positions: {
                              position: 'C',
                           },
                           selected_position: {
                              position: 'C',
                              coverage_type: 'date',
                              date: '2024-11-15',
                           },
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

         const teamResource = new TeamResource(httpClient);
         const roster = await teamResource.getRoster('423.l.12345.t.1');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/roster',
         );
         expect(roster.coverageType).toBe('date');
         expect(roster.date).toBe('2024-11-15');
         expect(roster.isEditable).toBe(true);
         expect(roster.players.length).toBeGreaterThan(0);
      });

      test('should fetch roster for specific date', async () => {
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               roster: {
                  coverage_type: 'date',
                  date: '2024-11-20',
                  players: {
                     count: 0,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getRoster('423.l.12345.t.1', {
            date: '2024-11-20',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/roster;date=2024-11-20',
         );
      });

      test('should fetch roster for specific week', async () => {
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               roster: {
                  coverage_type: 'week',
                  week: '10',
                  players: {
                     count: 0,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getRoster('423.l.12345.t.1', { week: 10 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/roster;week=10',
         );
      });
   });

   describe('getStats()', () => {
      test('should fetch team stats', async () => {
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               team_stats: {
                  coverage_type: 'season',
                  season: '2024',
                  stats: {
                     0: {
                        stat: {
                           stat_id: '1',
                           value: '100',
                        },
                     },
                     count: 1,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const stats = await teamResource.getStats('423.l.12345.t.1');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/stats',
         );
         expect(stats.coverageType).toBe('season');
         expect(stats.season).toBe(2024);
      });

      test('should fetch stats for specific week', async () => {
         const mockResponse = {
            team: {
               team_key: '423.l.12345.t.1',
               team_stats: {
                  coverage_type: 'week',
                  week: '10',
                  stats: {
                     count: 0,
                  },
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getStats('423.l.12345.t.1', {
            coverageType: 'week',
            week: 10,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/stats;type=week;week=10',
         );
      });
   });

   describe('getMatchups()', () => {
      test('should fetch team matchups', async () => {
         const mockResponse = {
            team: [
               {
                  team_key: '423.l.12345.t.1',
               },
               {
                  matchups: [],
               },
            ],
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const matchups = await teamResource.getMatchups('423.l.12345.t.1');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/matchups',
         );
         expect(Array.isArray(matchups)).toBe(true);
      });

      test('should fetch matchups for specific weeks', async () => {
         const mockResponse = {
            team: [
               {
                  team_key: '423.l.12345.t.1',
               },
               {
                  matchups: [],
               },
            ],
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         await teamResource.getMatchups('423.l.12345.t.1', {
            weeks: [10, 11, 12],
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/team/423.l.12345.t.1/matchups;weeks=10,11,12',
         );
      });
   });

   describe('updateRoster()', () => {
      test('should update roster successfully', async () => {
         const mockResponse = {
            team: [
               {
                  team_key: '423.l.12345.t.1',
               },
               {
                  roster: [
                     {
                        coverage_type: 'date',
                        date: '2024-11-20',
                        players: {
                           count: 0,
                        },
                     },
                  ],
               },
            ],
         };

         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.updateRoster('423.l.12345.t.1', {
            coverageType: 'date',
            date: '2024-11-20',
            players: [
               { playerKey: '423.p.8888', position: 'C' },
               { playerKey: '423.p.7777', position: 'LW' },
            ],
         });

         expect(result.success).toBe(true);
         expect(result.teamKey).toBe('423.l.12345.t.1');
      });

      test('should handle roster update failure', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockRejectedValue(
            new Error('API Error'),
         );

         const teamResource = new TeamResource(httpClient);
         const result = await teamResource.updateRoster('423.l.12345.t.1', {
            coverageType: 'date',
            date: '2024-11-20',
            players: [{ playerKey: '423.p.8888', position: 'C' }],
         });

         expect(result.success).toBe(false);
         expect(result.error).toBe('API Error');
      });
   });
});
