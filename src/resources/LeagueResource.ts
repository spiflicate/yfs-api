/**
 * League resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   // DraftStatus,
   // GameCode,
   ResourceKey,
   // ScoringType,
} from '../types/common.js';
import type {
   GetLeagueParams,
   GetLeagueScoreboardParams,
   GetLeagueStandingsParams,
   GetLeagueTeamsParams,
} from '../types/resources/league.js';
import type {
   LeagueResponse,
   // LeaguesResponse,
} from '../types/responses/wrappers.js';

/**
 * League resource client
 *
 * Provides methods to interact with Yahoo Fantasy league data
 *
 * @example
 * ```typescript
 * const leagueClient = new LeagueResource(httpClient);
 *
 * // Get league metadata
 * const league = await leagueClient.get('423.l.12345');
 *
 * // Get league standings
 * const standings = await leagueClient.getStandings('423.l.12345');
 *
 * // Get league scoreboard
 * const scoreboard = await leagueClient.getScoreboard('423.l.12345');
 * ```
 */
export class LeagueResource {
   private http: HttpClient;

   /**
    * Creates a new League resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get league metadata and optionally settings, standings, or scoreboard
    *
    * @param leagueKey - League key (e.g., "423.l.12345")
    * @param params - Optional parameters
    * @returns League information
    *
    * @example
    * ```typescript
    * // Get basic league info
    * const league = await leagueClient.get('423.l.12345');
    *
    * // Get league with settings
    * const leagueWithSettings = await leagueClient.get('423.l.12345', {
    *   includeSettings: true,
    * });
    *
    * // Get league with standings and scoreboard
    * const fullLeague = await leagueClient.get('423.l.12345', {
    *   includeSettings: true,
    *   includeStandings: true,
    *   includeScoreboard: true,
    * });
    * ```
    */
   async get(
      leagueKey: ResourceKey,
      params?: GetLeagueParams,
   ): Promise<LeagueResponse> {
      let path = `/league/${leagueKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeSettings) {
         subResources.push('settings');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }
      if (params?.includeScoreboard) {
         subResources.push('scoreboard');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      return this.http.get<LeagueResponse>(path);
   }

   /**
    * Get league settings
    *
    * @param leagueKey - League key
    * @returns League settings
    *
    * @example
    * ```typescript
    * const settings = await leagueClient.getSettings('423.l.12345');
    * console.log(settings.rosterPositions);
    * console.log(settings.statCategories);
    * ```
    */
   async getSettings(leagueKey: ResourceKey): Promise<LeagueResponse> {
      const path = `/league/${leagueKey}/settings`;
      const response = await this.http.get<LeagueResponse>(path);
      return response;
   }
   /**
    * Get league standings
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns League standings
    *
    * @example
    * ```typescript
    * const standings = await leagueClient.getStandings('423.l.12345');
    * for (const team of standings.teams) {
    *   console.log(`${team.rank}. ${team.name} - ${team.outcomeTotals?.wins}W ${team.outcomeTotals?.losses}L`);
    * }
    * ```
    */
   async getStandings(
      leagueKey: ResourceKey,
      params?: GetLeagueStandingsParams,
   ): Promise<LeagueResponse> {
      let path = `/league/${leagueKey}/standings`;

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      const response = await this.http.get<LeagueResponse>(path);

      return response;
   }

   /**
    * Get league scoreboard
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns League scoreboard with matchups
    *
    * @example
    * ```typescript
    * const scoreboard = await leagueClient.getScoreboard('423.l.12345');
    * for (const matchup of scoreboard.matchups) {
    *   const team1 = matchup.teams[0];
    *   const team2 = matchup.teams[1];
    *   console.log(`${team1.name} (${team1.points}) vs ${team2.name} (${team2.points})`);
    * }
    * ```
    */
   async getScoreboard(
      leagueKey: ResourceKey,
      params?: GetLeagueScoreboardParams,
   ): Promise<LeagueResponse> {
      let path = `/league/${leagueKey}/scoreboard`;

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      const response = await this.http.get<LeagueResponse>(path);

      return response;
   }

   /**
    * Get teams in the league
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns Array of teams
    *
    * @example
    * ```typescript
    * // Get all teams
    * const teams = await leagueClient.getTeams('423.l.12345');
    *
    * // Get teams with pagination
    * const firstFive = await leagueClient.getTeams('423.l.12345', {
    *   start: 0,
    *   count: 5,
    * });
    * ```
    */
   async getTeams(
      leagueKey: ResourceKey,
      params?: GetLeagueTeamsParams,
   ): Promise<LeagueResponse> {
      let path = `/league/${leagueKey}/teams`;

      const queryParams: string[] = [];
      if (params?.start !== undefined) {
         queryParams.push(`start=${params.start}`);
      }
      if (params?.count !== undefined) {
         queryParams.push(`count=${params.count}`);
      }

      if (queryParams.length > 0) {
         path += `;${queryParams.join(';')}`;
      }

      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<LeagueResponse>(path);

      return response;
   }
}
