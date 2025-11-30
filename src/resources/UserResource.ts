/**
 * User resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
// import type { GameCode } from '../types/common.js';
import type {
   GetUserGamesParams,
   GetUserTeamsParams,
} from '../types/resources/user.js';
import type { UsersResponse } from '../types/responses/wrappers.js';
/**
 * User resource client
 *
 * Provides methods to interact with Yahoo Fantasy user data
 *
 * @example
 * ```typescript
 * const userClient = new UserResource(httpClient);
 *
 * // Get current user
 * const user = await userClient.getCurrentUser();
 *
 * // Get user's teams
 * const teams = await userClient.getTeams({ gameCode: 'nhl' });
 * ```
 */
export class UserResource {
   private http: HttpClient;

   /**
    * Creates a new User resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get the current user's profile
    *
    * @returns User profile
    *
    * @example
    * ```typescript
    * const user = await userClient.getCurrentUser();
    * console.log(user.guid);
    * ```
    */
   async getCurrentUser(): Promise<unknown> {
      const path = '/users;use_login=1';
      const response = await this.http.get<UsersResponse>(path);
      return response;
   }

   /**
    * Get the current user's games
    *
    * @param params - Filter parameters
    * @returns Array of user's games
    *
    * @example
    * ```typescript
    * // Get all games
    * const games = await userClient.getGames();
    *
    * // Get only NHL games
    * const nhlGames = await userClient.getGames({ gameCodes: ['nhl'] });
    *
    * // Get games for specific seasons
    * const games2024 = await userClient.getGames({ seasons: [2024] });
    * ```
    */
   async getGames(params?: GetUserGamesParams): Promise<unknown> {
      let path = '/users;use_login=1/games';

      // Add filters
      if (params?.gameCodes && params.gameCodes.length > 0) {
         const gameCodes = params.gameCodes.join(',');
         path += `;game_codes=${gameCodes}`;
      }

      if (params?.seasons && params.seasons.length > 0) {
         const seasons = params.seasons.join(',');
         path += `;seasons=${seasons}`;
      }

      // Include teams if requested
      if (params?.includeTeams) {
         path += '/teams';
      }

      const response = await this.http.get<UsersResponse>(path);

      return response;
   }

   /**
    * Get the current user's teams
    *
    * @param params - Filter parameters
    * @returns Array of user's teams
    *
    * @example
    * ```typescript
    * // Get all teams
    * const teams = await userClient.getTeams();
    *
    * // Get only NHL teams
    * const nhlTeams = await userClient.getTeams({ gameCode: 'nhl' });
    *
    * // Get teams for specific season
    * const teams2024 = await userClient.getTeams({ gameCode: 'nhl', season: 2024 });
    * ```
    */
   async getTeams(params?: GetUserTeamsParams): Promise<UsersResponse> {
      let path = '/users;use_login=1/games';

      if (params?.gameCode) {
         path += `;game_codes=${params.gameCode}`;
      }

      if (params?.season) {
         path += `;seasons=${params.season}`;
      }

      path += '/teams';

      const response = await this.http.get<UsersResponse>(path);

      return response;
   }
}
