/**
 * Player resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { PlayerStatus, ResourceKey } from '../types/common.js';
import type {
   GetPlayerParams,
   GetPlayerStatsParams,
   Player,
   PlayerCollectionResponse,
   PlayerOwnership,
   PlayerPercentOwned,
   PlayerStats,
   SearchPlayersParams,
} from '../types/resources/player.js';

/**
 * Player resource client
 *
 * Provides methods to interact with Yahoo Fantasy player data
 *
 * @example
 * ```typescript
 * const playerClient = new PlayerResource(httpClient);
 *
 * // Get player details
 * const player = await playerClient.get('423.p.8888');
 *
 * // Search for players
 * const results = await playerClient.search('423.l.12345', {
 *   search: 'McDavid',
 *   position: 'C',
 * });
 *
 * // Get available free agents
 * const freeAgents = await playerClient.search('423.l.12345', {
 *   status: 'FA',
 *   position: 'C',
 *   sort: '60',  // Sort by Fantasy Points
 *   count: 25,
 * });
 * ```
 */
export class PlayerResource {
   private http: HttpClient;

   /**
    * Creates a new Player resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get player details
    *
    * @param playerKey - Player key (e.g., "423.p.8888")
    * @param params - Optional parameters
    * @returns Player information
    *
    * @example
    * ```typescript
    * // Get basic player info
    * const player = await playerClient.get('423.p.8888');
    *
    * // Get player with stats
    * const playerWithStats = await playerClient.get('423.p.8888', {
    *   includeStats: true,
    *   statsCoverageType: 'season',
    * });
    *
    * // Get player with ownership info
    * const playerWithOwnership = await playerClient.get('423.p.8888', {
    *   includeOwnership: true,
    * });
    * ```
    */
   async get(
      playerKey: ResourceKey,
      params?: GetPlayerParams,
   ): Promise<unknown> {
      let path = `/player/${playerKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeOwnership) {
         subResources.push('ownership');
      }
      if (params?.includePercentOwned) {
         subResources.push('percent_owned');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         player: unknown;
      }>(path);

      return response;
   }

   /**
    * Search for players in a league
    *
    * @param leagueKey - League key (e.g., "423.l.12345")
    * @param params - Search parameters
    * @returns Player collection response
    *
    * @example
    * ```typescript
    * // Search by name
    * const results = await playerClient.search('423.l.12345', {
    *   search: 'McDavid',
    * });
    *
    * // Get free agents at center position
    * const centers = await playerClient.search('423.l.12345', {
    *   status: 'FA',
    *   position: 'C',
    *   sort: '60',  // Sort by Fantasy Points
    *   sortOrder: 'desc',
    *   count: 25,
    * });
    *
    * // Get all available players (FA + waivers)
    * const available = await playerClient.search('423.l.12345', {
    *   status: ['FA', 'W'],
    *   includeStats: true,
    * });
    *
    * // Paginate through results
    * const page2 = await playerClient.search('423.l.12345', {
    *   status: 'FA',
    *   start: 25,
    *   count: 25,
    * });
    * ```
    */
   async search(
      leagueKey: ResourceKey,
      params?: SearchPlayersParams,
   ): Promise<unknown> {
      let path = `/league/${leagueKey}/players`;

      // Build query parameters
      const queryParams: string[] = [];

      if (params?.search) {
         queryParams.push(`search=${encodeURIComponent(params.search)}`);
      }

      if (params?.position) {
         queryParams.push(`position=${params.position}`);
      }

      if (params?.status) {
         const statuses = Array.isArray(params.status)
            ? params.status.join(',')
            : params.status;
         queryParams.push(`status=${statuses}`);
      }

      if (params?.start !== undefined) {
         queryParams.push(`start=${params.start}`);
      }

      if (params?.count !== undefined) {
         queryParams.push(`count=${params.count}`);
      }

      if (params?.sort !== undefined) {
         queryParams.push(`sort=${params.sort}`);
      }

      if (params?.sortOrder) {
         queryParams.push(`sort_type=${params.sortOrder}`);
      }

      if (params?.sortType) {
         queryParams.push(`sort_season=${params.sortType}`);
      }

      if (queryParams.length > 0) {
         path += `;${queryParams.join(';')}`;
      }

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeOwnership) {
         subResources.push('ownership');
      }
      if (params?.includePercentOwned) {
         subResources.push('percent_owned');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         league: { players?: unknown[] };
      }>(path);

      if (!response.league.players) {
         return { count: 0, players: [] };
      }

      const players = response.league.players;

      return response; //{ count: players.length, players };
   }

   /**
    * Get player statistics
    *
    * @param playerKey - Player key
    * @param params - Stats parameters
    * @returns Player stats
    *
    * @example
    * ```typescript
    * // Get season stats
    * const stats = await playerClient.getStats('423.p.8888', {
    *   coverageType: 'season',
    * });
    *
    * // Get stats for specific date
    * const dateStats = await playerClient.getStats('423.p.8888', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    * });
    *
    * // Get stats for specific week (NFL)
    * const weekStats = await playerClient.getStats('423.p.8888', {
    *   coverageType: 'week',
    *   week: 10,
    * });
    * ```
    */
   async getStats(
      playerKey: ResourceKey,
      params: GetPlayerStatsParams,
   ): Promise<unknown> {
      let path = `/player/${playerKey}/stats`;

      if (params.coverageType) {
         path += `;type=${params.coverageType}`;
      }

      if (params.week) {
         path += `;week=${params.week}`;
      }

      if (params.date) {
         path += `;date=${params.date}`;
      }

      if (params.season) {
         path += `;season=${params.season}`;
      }

      const response = await this.http.get<{
         player: { player_stats?: unknown };
      }>(path);

      if (!response.player.player_stats) {
         throw new Error('Stats not found in response');
      }

      return response;
   }

   /**
    * Get player ownership information
    *
    * @param playerKey - Player key
    * @returns Player ownership info
    *
    * @example
    * ```typescript
    * const ownership = await playerClient.getOwnership('423.p.8888');
    * console.log(ownership.ownershipType);  // 'team', 'waivers', 'freeagents'
    * console.log(ownership.percentOwned);   // 87.5
    * ```
    */
   async getOwnership(playerKey: ResourceKey): Promise<unknown> {
      const response = await this.http.get<{
         player: { ownership?: unknown };
      }>(`/player/${playerKey}/ownership`);

      if (!response.player.ownership) {
         throw new Error('Ownership not found in response');
      }

      return response;
   }
}
