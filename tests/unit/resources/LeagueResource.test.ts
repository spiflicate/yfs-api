/**
 * Unit tests for LeagueResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { LeagueResource } from '../../../src/resources/LeagueResource.js';

describe('LeagueResource', () => {
   // Mock HTTP client
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
         const mockResponse = {
            fantasy_content: {
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
                     start_week: '1',
                     end_week: '26',
                     start_date: '2024-10-01',
                     end_date: '2025-04-15',
                     draft_status: 'postdraft',
                     is_finished: '0',
                     url: 'https://hockey.fantasysports.yahoo.com/league/12345',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const league = await leagueResource.get('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith('/league/423.l.12345');
         expect(league.leagueKey).toBe('423.l.12345');
         expect(league.leagueId).toBe('12345');
         expect(league.name).toBe('Test League');
         expect(league.gameCode).toBe('nhl');
         expect(league.season).toBe(2024);
         expect(league.scoringType).toBe('head');
         expect(league.numberOfTeams).toBe(12);
         expect(league.currentWeek).toBe(10);
         expect(league.isFinished).toBe(false);
      });

      test('should include multiple sub-resources', async () => {
         const mockResponse = {
            fantasy_content: {
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
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.get('423.l.12345', {
            includeSettings: true,
            includeStandings: true,
            includeScoreboard: true,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345;out=settings,standings,scoreboard',
         );
      });
   });

   describe('getSettings()', () => {
      test('should fetch league settings', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     settings: [
                        {
                           draft_type: 'live',
                           is_auction_draft: '0',
                           scoring_type: 'head',
                           uses_playoff: '1',
                           playoff_start_week: '22',
                           num_playoff_teams: '6',
                           max_teams: '12',
                           waiver_type: 'FR',
                           uses_faab: '0',
                           max_weekly_adds: '4',
                           roster_positions: {
                              0: {
                                 roster_position: {
                                    position: 'C',
                                    position_type: 'P',
                                    count: '2',
                                    display_name: 'Center',
                                    abbreviation: 'C',
                                 },
                              },
                              count: 1,
                           },
                           stat_categories: {
                              stats: {
                                 0: {
                                    stat: {
                                       stat_id: '1',
                                       enabled: '1',
                                       name: 'G',
                                    },
                                 },
                                 count: 1,
                              },
                           },
                        },
                     ],
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const settings = await leagueResource.getSettings('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/settings',
         );
         expect(settings.draftType).toBe('live');
         expect(settings.scoringType).toBe('head');
         expect(settings.maxTeams).toBe(12);
      });

      test('should throw error when settings not found', async () => {
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

         const leagueResource = new LeagueResource(httpClient);

         await expect(
            leagueResource.getSettings('423.l.12345'),
         ).rejects.toThrow('Settings not found in response');
      });
   });

   describe('getStandings()', () => {
      test('should fetch league standings', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     standings: [
                        {
                           teams: {
                              0: {
                                 team: [
                                    {
                                       team_key: '423.l.12345.t.1',
                                       team_id: '1',
                                       name: 'Team Alpha',
                                       url: 'https://hockey.fantasysports.yahoo.com/team/1',
                                    },
                                    {
                                       team_standings: {
                                          rank: '1',
                                          outcome_totals: {
                                             wins: '25',
                                             losses: '10',
                                             ties: '5',
                                             percentage: '0.688',
                                          },
                                       },
                                    },
                                 ],
                              },
                              count: 1,
                           },
                        },
                     ],
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const standings = await leagueResource.getStandings('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/standings',
         );
         expect(standings.teams.length).toBeGreaterThan(0);
      });

      test('should fetch standings for specific week', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     standings: [
                        {
                           teams: {
                              count: 0,
                           },
                        },
                     ],
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getStandings('423.l.12345', { week: 10 });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/standings;week=10',
         );
      });
   });

   describe('getScoreboard()', () => {
      test('should fetch league scoreboard', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     scoreboard: [
                        {
                           week: '10',
                           matchups: {
                              0: {
                                 matchup: {
                                    week: '10',
                                    teams: {
                                       0: {
                                          team: [
                                             {
                                                team_key: '423.l.12345.t.1',
                                                team_id: '1',
                                                name: 'Team Alpha',
                                                url: 'https://example.com',
                                             },
                                          ],
                                       },
                                       count: 1,
                                    },
                                 },
                              },
                              count: 1,
                           },
                        },
                     ],
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const leagueResource = new LeagueResource(httpClient);
         const scoreboard =
            await leagueResource.getScoreboard('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/scoreboard',
         );
         expect(scoreboard.matchups.length).toBeGreaterThan(0);
      });
   });

   describe('getTeams()', () => {
      test('should fetch teams in league', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     teams: {
                        0: {
                           team: [
                              {
                                 team_key: '423.l.12345.t.1',
                                 team_id: '1',
                                 name: 'Team Alpha',
                                 url: 'https://hockey.fantasysports.yahoo.com/team/1',
                                 league: {
                                    league_key: '423.l.12345',
                                    league_id: '12345',
                                    name: 'Test League',
                                    url: 'https://hockey.fantasysports.yahoo.com/league/12345',
                                 },
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

         const leagueResource = new LeagueResource(httpClient);
         const teams = await leagueResource.getTeams('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/teams',
         );
         expect(teams.length).toBeGreaterThan(0);
      });

      test('should fetch teams with pagination', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     teams: {
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

         const leagueResource = new LeagueResource(httpClient);
         await leagueResource.getTeams('423.l.12345', {
            start: 0,
            count: 5,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/teams;start=0;count=5',
         );
      });

      test('should return empty array when no teams found', async () => {
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

         const leagueResource = new LeagueResource(httpClient);
         const teams = await leagueResource.getTeams('423.l.12345');

         expect(teams).toEqual([]);
      });
   });
});
