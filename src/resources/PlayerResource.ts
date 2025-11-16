/**
 * Player resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   Player,
   PlayerStats,
   PlayerOwnership,
   PlayerPercentOwned,
   SearchPlayersParams,
   GetPlayerParams,
   GetPlayerStatsParams,
   PlayerCollectionResponse,
} from '../types/resources/player.js';
import type { ResourceKey, PlayerStatus } from '../types/common.js';

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
   ): Promise<Player> {
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
         fantasy_content: { player: Array<unknown> };
      }>(path);

      return this.parsePlayer(response.fantasy_content.player);
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
   ): Promise<PlayerCollectionResponse> {
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
         fantasy_content: { league: Array<unknown> };
      }>(path);

      const leagueData = response.fantasy_content.league;
      const playersObj = leagueData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'players' in item,
      );

      if (!playersObj || !('players' in playersObj)) {
         return { count: 0, players: [] };
      }

      const playersData = playersObj.players as Record<string, unknown>;
      const count = playersData.count
         ? Number.parseInt(playersData.count as string)
         : 0;
      const players: Player[] = [];

      for (const key in playersData) {
         if (key === 'count') continue;
         const playerEntry = playersData[key];
         if (
            playerEntry &&
            typeof playerEntry === 'object' &&
            'player' in playerEntry
         ) {
            const player = this.parsePlayer(
               (playerEntry as { player: Array<unknown> }).player,
            );
            players.push(player);
         }
      }

      return { count, players };
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
   ): Promise<PlayerStats> {
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
         fantasy_content: { player: Array<unknown> };
      }>(path);

      const playerData = response.fantasy_content.player;
      const statsObj = playerData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'player_stats' in item,
      );

      if (!statsObj || !('player_stats' in statsObj)) {
         throw new Error('Stats not found in response');
      }

      return this.parseStats(
         statsObj.player_stats as Record<string, unknown>,
      );
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
   async getOwnership(playerKey: ResourceKey): Promise<PlayerOwnership> {
      const response = await this.http.get<{
         fantasy_content: { player: Array<unknown> };
      }>(`/player/${playerKey}/ownership`);

      const playerData = response.fantasy_content.player;
      const ownershipObj = playerData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'ownership' in item,
      );

      if (!ownershipObj || !('ownership' in ownershipObj)) {
         throw new Error('Ownership not found in response');
      }

      return this.parseOwnership(
         ownershipObj.ownership as Record<string, unknown>,
      );
   }

   /**
    * Parse player data from API response
    *
    * @private
    */
   private parsePlayer(playerData: Array<unknown>): Player {
      const playerObj: Record<string, unknown> = {};

      for (const item of playerData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(playerObj, item);
         }
      }

      const player: Player = {
         playerKey: playerObj.player_key as ResourceKey,
         playerId: playerObj.player_id as string,
         name: {
            full: (playerObj.name as Record<string, unknown>)
               .full as string,
            first: (playerObj.name as Record<string, unknown>)
               .first as string,
            last: (playerObj.name as Record<string, unknown>)
               .last as string,
            ascii: (playerObj.name as Record<string, unknown>).ascii as
               | string
               | undefined,
         },
         editorialPlayerKey: playerObj.editorial_player_key as
            | string
            | undefined,
         editorialTeamKey: playerObj.editorial_team_key as
            | string
            | undefined,
         editorialTeamFullName: playerObj.editorial_team_full_name as
            | string
            | undefined,
         editorialTeamAbbr: playerObj.editorial_team_abbr as
            | string
            | undefined,
         byeWeek: playerObj.bye_week
            ? Number.parseInt(playerObj.bye_week as string)
            : undefined,
         uniformNumber: playerObj.uniform_number as string | undefined,
         displayPosition: playerObj.display_position as string,
         headshotUrl: playerObj.headshot_url as string | undefined,
         imageUrl: playerObj.image_url as string | undefined,
         isUndroppable: playerObj.is_undroppable
            ? Boolean(Number(playerObj.is_undroppable))
            : undefined,
         positionType: playerObj.position_type as string | undefined,
         primaryPosition: playerObj.primary_position as string | undefined,
         hasPlayerNotes: playerObj.has_player_notes
            ? Boolean(Number(playerObj.has_player_notes))
            : undefined,
         hasRecentPlayerNotes: playerObj.has_recent_player_notes
            ? Boolean(Number(playerObj.has_recent_player_notes))
            : undefined,
         injuryNote: playerObj.injury_note as string | undefined,
         url: playerObj.url as string,
      };

      // Parse eligible positions
      if (playerObj.eligible_positions) {
         const positions: string[] = [];
         const positionsData = playerObj.eligible_positions as Record<
            string,
            unknown
         >;
         for (const key in positionsData) {
            if (key === 'count') continue;
            const posEntry = positionsData[key];
            if (
               posEntry &&
               typeof posEntry === 'object' &&
               'position' in posEntry
            ) {
               positions.push((posEntry as { position: string }).position);
            }
         }
         player.eligiblePositions = positions;
      }

      // Parse player status (in league context)
      if (playerObj.status) {
         player.status = playerObj.status as PlayerStatus;
      }

      // Parse stats if included
      if (playerObj.player_stats) {
         player.stats = this.parseStats(
            playerObj.player_stats as Record<string, unknown>,
         );
      }

      // Parse ownership if included
      if (playerObj.ownership) {
         player.ownership = this.parseOwnership(
            playerObj.ownership as Record<string, unknown>,
         );
      }

      // Parse percent owned if included
      if (playerObj.percent_owned) {
         player.percentOwned = this.parsePercentOwned(
            playerObj.percent_owned as Record<string, unknown>,
         );
      }

      return player;
   }

   /**
    * Parse player stats from API response
    *
    * @private
    */
   private parseStats(statsData: Record<string, unknown>): PlayerStats {
      const stats: PlayerStats = {
         coverageType: statsData.coverage_type as
            | 'season'
            | 'week'
            | 'date'
            | 'lastweek'
            | 'lastmonth',
         stats: {},
      };

      if (statsData.season) {
         stats.season = Number.parseInt(statsData.season as string);
      }

      if (statsData.week) {
         stats.week = Number.parseInt(statsData.week as string);
      }

      if (statsData.date) {
         stats.date = statsData.date as string;
      }

      // Parse stats array
      if (statsData.stats) {
         const statsArray = statsData.stats as Record<string, unknown>;
         for (const key in statsArray) {
            if (key === 'count') continue;
            const statEntry = statsArray[key];
            if (
               statEntry &&
               typeof statEntry === 'object' &&
               'stat' in statEntry
            ) {
               const statData = (
                  statEntry as { stat: Record<string, unknown> }
               ).stat;
               const statId = Number.parseInt(statData.stat_id as string);
               stats.stats[statId] = statData.value as string | number;
            }
         }
      }

      return stats;
   }

   /**
    * Parse player ownership from API response
    *
    * @private
    */
   private parseOwnership(
      ownershipData: Record<string, unknown>,
   ): PlayerOwnership {
      const ownership: PlayerOwnership = {
         ownershipType: ownershipData.ownership_type as
            | 'team'
            | 'waivers'
            | 'freeagents',
      };

      if (ownershipData.owner_team_key) {
         ownership.ownerTeamKey =
            ownershipData.owner_team_key as ResourceKey;
      }

      if (ownershipData.owner_team_name) {
         ownership.ownerTeamName = ownershipData.owner_team_name as string;
      }

      if (ownershipData.percent_owned) {
         const percentOwnedData = ownershipData.percent_owned as Record<
            string,
            unknown
         >;
         ownership.percentOwned = Number.parseFloat(
            percentOwnedData.value as string,
         );
      }

      return ownership;
   }

   /**
    * Parse player percent owned from API response
    *
    * @private
    */
   private parsePercentOwned(
      percentOwnedData: Record<string, unknown>,
   ): PlayerPercentOwned {
      return {
         coverageType: 'date',
         date: percentOwnedData.date as string,
         percentOwned: Number.parseFloat(percentOwnedData.value as string),
         delta: percentOwnedData.delta
            ? Number.parseFloat(percentOwnedData.delta as string)
            : undefined,
      };
   }
}
