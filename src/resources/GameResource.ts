/**
 * Game resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { GameCode } from '../types/common.js';
import type {
   Game,
   GamePositionType,
   GameStatCategory,
   GameWeek,
   GetGameParams,
   GetGamesParams,
   SearchGamePlayersParams,
} from '../types/resources/game.js';
import type { League } from '../types/resources/league-old.js';
import type {
   Player,
   PlayerCollectionResponse,
} from '../types/resources/player.js';

/**
 * Game resource client
 *
 * Provides methods to interact with Yahoo Fantasy game data
 *
 * @example
 * ```typescript
 * const gameClient = new GameResource(httpClient);
 *
 * // Get game metadata
 * const game = await gameClient.get('nhl');
 *
 * // Get all available games
 * const games = await gameClient.getGames({ isAvailable: true });
 *
 * // Search players across a game
 * const players = await gameClient.searchPlayers('423', {
 *   position: 'C',
 *   sort: '60',
 *   count: 25,
 * });
 * ```
 */
export class GameResource {
   private http: HttpClient;

   /**
    * Creates a new Game resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get game metadata
    *
    * @param gameKey - Game key (e.g., "423" or "nhl")
    * @param params - Optional parameters
    * @returns Game information
    *
    * @example
    * ```typescript
    * // Get current NHL game
    * const game = await gameClient.get('nhl');
    *
    * // Get specific game by ID with stat categories
    * const game423 = await gameClient.get('423', {
    *   includeStatCategories: true,
    * });
    * ```
    */
   async get(gameKey: string, params?: GetGameParams): Promise<unknown> {
      let path = `/game/${gameKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeLeagues) {
         subResources.push('leagues');
      }
      if (params?.includePlayers) {
         subResources.push('players');
      }
      if (params?.includeGameWeeks) {
         subResources.push('game_weeks');
      }
      if (params?.includeStatCategories) {
         subResources.push('stat_categories');
      }
      if (params?.includePositionTypes) {
         subResources.push('position_types');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         game: unknown;
      }>(path);

      return response;
   }

   /**
    * Get multiple games
    *
    * @param params - Optional filter parameters
    * @returns Array of games
    *
    * @example
    * ```typescript
    * // Get all available games
    * const available = await gameClient.getGames({ isAvailable: true });
    *
    * // Get NFL and NHL games
    * const games = await gameClient.getGames({
    *   gameCodes: ['nfl', 'nhl'],
    * });
    *
    * // Get all full games for 2024 season
    * const games2024 = await gameClient.getGames({
    *   gameTypes: ['full'],
    *   seasons: [2024],
    * });
    * ```
    */
   async getGames(params?: GetGamesParams): Promise<unknown> {
      let path = '/games';

      const queryParams: string[] = [];

      if (params?.gameKeys && params.gameKeys.length > 0) {
         queryParams.push(`game_keys=${params.gameKeys.join(',')}`);
      }

      if (params?.isAvailable !== undefined) {
         queryParams.push(`is_available=${params.isAvailable ? '1' : '0'}`);
      }

      if (params?.gameTypes && params.gameTypes.length > 0) {
         queryParams.push(`game_types=${params.gameTypes.join(',')}`);
      }

      if (params?.gameCodes && params.gameCodes.length > 0) {
         queryParams.push(`game_codes=${params.gameCodes.join(',')}`);
      }

      if (params?.seasons && params.seasons.length > 0) {
         queryParams.push(`seasons=${params.seasons.join(',')}`);
      }

      if (queryParams.length > 0) {
         path += `;${queryParams.join(';')}`;
      }

      const response = await this.http.get<{
         games: unknown[];
      }>(path);

      return response;
   }

   /**
    * Get leagues in a game
    *
    * @param gameKey - Game key
    * @returns Array of leagues
    *
    * @example
    * ```typescript
    * const leagues = await gameClient.getLeagues('423');
    * ```
    */
   async getLeagues(gameKey: string): Promise<unknown> {
      const response = await this.http.get<{
         game: { leagues?: unknown[] };
      }>(`/game/${gameKey}/leagues`);

      if (!response.game.leagues) {
         return [];
      }

      return response;
   }

   /**
    * Search for players in a game
    *
    * @param gameKey - Game key
    * @param params - Search parameters
    * @returns Player collection response
    *
    * @example
    * ```typescript
    * // Search by name
    * const results = await gameClient.searchPlayers('423', {
    *   search: 'McDavid',
    * });
    *
    * // Get top centers by fantasy points
    * const centers = await gameClient.searchPlayers('423', {
    *   position: 'C',
    *   sort: '60',
    *   sortType: 'season',
    *   count: 25,
    * });
    * ```
    */
   async searchPlayers(
      gameKey: string,
      params?: SearchGamePlayersParams,
   ): Promise<unknown> {
      let path = `/game/${gameKey}/players`;

      const queryParams: string[] = [];

      if (params?.search) {
         queryParams.push(`search=${encodeURIComponent(params.search)}`);
      }

      if (params?.position) {
         queryParams.push(`position=${params.position}`);
      }

      if (params?.sort !== undefined) {
         queryParams.push(`sort=${params.sort}`);
      }

      if (params?.sortType) {
         queryParams.push(`sort_type=${params.sortType}`);
      }

      if (params?.sortSeason) {
         queryParams.push(`sort_season=${params.sortSeason}`);
      }

      if (params?.sortDate) {
         queryParams.push(`sort_date=${params.sortDate}`);
      }

      if (params?.sortWeek) {
         queryParams.push(`sort_week=${params.sortWeek}`);
      }

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
         game: { players?: unknown[] };
      }>(path);

      if (!response.game.players) {
         return { count: 0, players: [] };
      }

      const players = response.game.players;

      return response; //{ count: players.length, players };
   }

   /**
    * Get game weeks for a game
    *
    * @param gameKey - Game key
    * @returns Array of game weeks
    *
    * @example
    * ```typescript
    * const weeks = await gameClient.getGameWeeks('nfl');
    * ```
    */
   async getGameWeeks(gameKey: string): Promise<unknown> {
      const response = await this.http.get<{
         game: { game_weeks?: unknown[] };
      }>(`/game/${gameKey}/game_weeks`);

      if (!response.game.game_weeks) {
         return [];
      }

      return response;
   }

   /**
    * Get stat categories for a game
    *
    * @param gameKey - Game key
    * @returns Array of stat categories
    *
    * @example
    * ```typescript
    * const stats = await gameClient.getStatCategories('nhl');
    * ```
    */
   async getStatCategories(gameKey: string): Promise<unknown> {
      const response = await this.http.get<{
         game: { stat_categories?: { stats?: unknown[] } };
      }>(`/game/${gameKey}/stat_categories`);

      if (!response.game.stat_categories?.stats) {
         return [];
      }

      return response;
   }

   /**
    * Get position types for a game
    *
    * @param gameKey - Game key
    * @returns Array of position types
    *
    * @example
    * ```typescript
    * const positions = await gameClient.getPositionTypes('nhl');
    * ```
    */
   async getPositionTypes(gameKey: string): Promise<unknown> {
      const response = await this.http.get<{
         game: { position_types?: unknown[] };
      }>(`/game/${gameKey}/position_types`);

      if (!response.game.position_types) {
         return [];
      }

      return response;
   }
}
