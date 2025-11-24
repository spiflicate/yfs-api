/**
 * Team resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { ResourceKey } from '../types/common.js';
import type {
   GetTeamMatchupsParams,
   GetTeamParams,
   GetTeamRosterParams,
   GetTeamStatsParams,
   RosterChangeRequest,
   TeamResourceResponse,
} from '../types/resources/team.js';

/**
 * Team resource client
 *
 * Provides methods to interact with Yahoo Fantasy team data
 *
 * @example
 * ```typescript
 * const teamClient = new TeamResource(httpClient);
 *
 * // Get team metadata
 * const team = await teamClient.get('423.l.12345.t.1');
 *
 * // Get team roster
 * const roster = await teamClient.getRoster('423.l.12345.t.1');
 *
 * // Update roster positions
 * await teamClient.updateRoster('423.l.12345.t.1', {
 *   coverageType: 'date',
 *   date: '2024-11-20',
 *   players: [
 *     { playerKey: '423.p.8888', position: 'C' },
 *     { playerKey: '423.p.7777', position: 'LW' },
 *   ],
 * });
 * ```
 */
export class TeamResource {
   private http: HttpClient;

   /**
    * Creates a new Team resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get team metadata and optionally stats, standings, or roster
    *
    * @param teamKey - Team key (e.g., "423.l.12345.t.1")
    * @param params - Optional parameters
    * @returns Team information
    *
    * @example
    * ```typescript
    * // Get basic team info
    * const team = await teamClient.get('423.l.12345.t.1');
    *
    * // Get team with roster
    * const teamWithRoster = await teamClient.get('423.l.12345.t.1', {
    *   includeRoster: true,
    * });
    *
    * // Get team with stats and standings
    * const fullTeam = await teamClient.get('423.l.12345.t.1', {
    *   includeStats: true,
    *   includeStandings: true,
    * });
    * ```
    */
   async get(
      teamKey: ResourceKey,
      params?: GetTeamParams,
   ): Promise<unknown> {
      let path = `/team/${teamKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }
      if (params?.includeRoster) {
         subResources.push('roster');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<TeamResourceResponse>(path);
      return response.team;
   }

   /**
    * Get team roster for a specific date or week
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Team roster
    *
    * @example
    * ```typescript
    * // Get current roster
    * const roster = await teamClient.getRoster('423.l.12345.t.1');
    *
    * // Get roster for specific date (NHL)
    * const dateRoster = await teamClient.getRoster('423.l.12345.t.1', {
    *   date: '2024-11-20',
    * });
    *
    * // Get roster for specific week (NFL)
    * const weekRoster = await teamClient.getRoster('423.l.12345.t.1', {
    *   week: 10,
    * });
    *
    * // Get roster with player stats
    * const rosterWithStats = await teamClient.getRoster('423.l.12345.t.1', {
    *   includeStats: true,
    * });
    * ```
    */
   async getRoster(
      teamKey: ResourceKey,
      params?: GetTeamRosterParams,
   ): Promise<unknown> {
      let path = `/team/${teamKey}/roster`;

      // Add date or week if specified
      if (params?.date) {
         path += `;date=${params.date}`;
      } else if (params?.week) {
         path += `;week=${params.week}`;
      }

      // Include player stats if requested
      if (params?.includeStats) {
         path += ';out=stats';
      }

      const response = await this.http.get<TeamResourceResponse>(path);
      return response.team;
   }

   /**
    * Get team stats
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Team stats
    *
    * @example
    * ```typescript
    * // Get season stats
    * const stats = await teamClient.getStats('423.l.12345.t.1');
    *
    * // Get stats for specific date
    * const dateStats = await teamClient.getStats('423.l.12345.t.1', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    * });
    *
    * // Get stats for specific week
    * const weekStats = await teamClient.getStats('423.l.12345.t.1', {
    *   coverageType: 'week',
    *   week: 10,
    * });
    * ```
    */
   async getStats(
      teamKey: ResourceKey,
      params?: GetTeamStatsParams,
   ): Promise<unknown> {
      let path = `/team/${teamKey}/stats`;

      if (params?.coverageType) {
         path += `;type=${params.coverageType}`;
      }

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      if (params?.date) {
         path += `;date=${params.date}`;
      }

      const response = await this.http.get<TeamResourceResponse>(path);
      return response.team;
   }

   /**
    * Get team matchups
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Array of matchups
    *
    * @example
    * ```typescript
    * // Get all matchups
    * const matchups = await teamClient.getMatchups('423.l.12345.t.1');
    *
    * // Get specific week matchup
    * const weekMatchup = await teamClient.getMatchups('423.l.12345.t.1', {
    *   weeks: 10,
    * });
    *
    * // Get multiple weeks
    * const multiWeek = await teamClient.getMatchups('423.l.12345.t.1', {
    *   weeks: [10, 11, 12],
    * });
    * ```
    */
   async getMatchups(
      teamKey: ResourceKey,
      params?: GetTeamMatchupsParams,
   ): Promise<unknown> {
      let path = `/team/${teamKey}/matchups`;

      if (params?.weeks) {
         const weeks = Array.isArray(params.weeks)
            ? params.weeks.join(',')
            : params.weeks;
         path += `;weeks=${weeks}`;
      }

      const response = await this.http.get<TeamResourceResponse>(path);
      return response.team;
   }

   /**
    * Update team roster positions
    *
    * @param teamKey - Team key
    * @param request - Roster change request
    * @returns Roster change response
    *
    * @example
    * ```typescript
    * // Update roster for today (NHL)
    * await teamClient.updateRoster('423.l.12345.t.1', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    *   players: [
    *     { playerKey: '423.p.8888', position: 'C' },
    *     { playerKey: '423.p.7777', position: 'LW' },
    *     { playerKey: '423.p.6666', position: 'BN' },
    *   ],
    * });
    *
    * // Update roster for a week (NFL)
    * await teamClient.updateRoster('423.l.12345.t.1', {
    *   coverageType: 'week',
    *   week: 10,
    *   players: [
    *     { playerKey: '423.p.5555', position: 'QB' },
    *     { playerKey: '423.p.4444', position: 'RB' },
    *   ],
    * });
    * ```
    */
   async updateRoster(
      teamKey: ResourceKey,
      request: RosterChangeRequest,
   ): Promise<unknown> {
      let path = `/team/${teamKey}/roster`;

      // Add coverage type
      if (request.date) {
         path += `;date=${request.date}`;
      } else if (request.week) {
         path += `;week=${request.week}`;
      }

      // Build XML payload for roster changes
      const playersXml = request.players
         .map(
            (p) => `
			<player>
				<player_key>${p.playerKey}</player_key>
				<position>${p.position}</position>
			</player>`,
         )
         .join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<roster>
		<coverage_type>${request.coverageType}</coverage_type>
		${request.date ? `<date>${request.date}</date>` : ''}
		${request.week ? `<week>${request.week}</week>` : ''}
		<players>
			${playersXml}
		</players>
	</roster>
</fantasy_content>`;

      try {
         const response = await this.http.put<{
            team: { roster?: unknown };
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const roster = response.team.roster
            ? response.team.roster
            : undefined;

         return {
            success: true,
            teamKey,
            roster,
         };
      } catch (error) {
         return {
            success: false,
            teamKey,
            error: error instanceof Error ? error.message : 'Unknown error',
         };
      }
   }
}
