/**
 * User resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   User,
   UserGame,
   UserTeam,
   GetUserGamesParams,
   GetUserTeamsParams,
} from '../types/resources/user.js';
import type { GameCode } from '../types/common.js';

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
   async getCurrentUser(): Promise<User> {
      const response = await this.http.get<{
         fantasy_content: { users: { 0: { user: Array<unknown> } } };
      }>('/users;use_login=1');

      return this.parseUser(response.fantasy_content.users[0].user);
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
   async getGames(params?: GetUserGamesParams): Promise<UserGame[]> {
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

      const response = await this.http.get<{
         fantasy_content: {
            users: {
               0: {
                  user: Array<{ games: { 0: { game: Array<unknown> } } }>;
               };
            };
         };
      }>(path);

      const userData = response.fantasy_content.users[0].user;
      const gamesData = userData.find(
         (item) =>
            item !== null && typeof item === 'object' && 'games' in item,
      ) as Record<string, unknown> | undefined;

      if (!gamesData || !('games' in gamesData)) {
         return [];
      }

      const games = gamesData.games as unknown as Record<string, unknown>;
      const gamesList: UserGame[] = [];

      // Parse games (numbered keys)
      for (const key in games) {
         if (key === 'count') continue;
         const gameEntry = games[key];
         if (
            gameEntry &&
            typeof gameEntry === 'object' &&
            'game' in gameEntry
         ) {
            const game = this.parseGame(
               (gameEntry as { game: Array<unknown> }).game,
               params?.includeTeams,
            );
            gamesList.push(game);
         }
      }

      return gamesList;
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
   async getTeams(params?: GetUserTeamsParams): Promise<UserTeam[]> {
      let path = '/users;use_login=1/games';

      if (params?.gameCode) {
         path += `;game_codes=${params.gameCode}`;
      }

      if (params?.season) {
         path += `;seasons=${params.season}`;
      }

      path += '/teams';

      const response = await this.http.get<{
         fantasy_content: {
            users: { 0: { user: Array<unknown> } };
         };
      }>(path);

      const userData = response.fantasy_content.users[0].user;
      const gamesData = userData.find(
         (item) =>
            item !== null && typeof item === 'object' && 'games' in item,
      ) as Record<string, unknown> | undefined;

      if (!gamesData || !('games' in gamesData)) {
         return [];
      }

      const games = gamesData.games as unknown as Record<string, unknown>;
      const allTeams: UserTeam[] = [];

      // Parse games (numbered keys)
      for (const key in games) {
         if (key === 'count') continue;
         const gameEntry = games[key];
         if (
            gameEntry &&
            typeof gameEntry === 'object' &&
            'game' in gameEntry
         ) {
            const game = this.parseGame(
               (gameEntry as { game: Array<unknown> }).game,
               true,
            );
            if (game.teams) {
               allTeams.push(...game.teams);
            }
         }
      }

      return allTeams;
   }

   /**
    * Parse user data from API response
    *
    * @private
    */
   private parseUser(userData: Array<unknown>): User {
      const userObj: Record<string, unknown> = {};

      for (const item of userData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(userObj, item);
         }
      }

      return {
         guid: userObj.guid as string,
         url: userObj.url as string,
      };
   }

   /**
    * Parse game data from API response
    *
    * @private
    */
   private parseGame(
      gameData: Array<unknown>,
      includeTeams?: boolean,
   ): UserGame {
      const gameObj: Record<string, unknown> = {};

      for (const item of gameData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(gameObj, item);
         }
      }

      const game: UserGame = {
         gameKey: gameObj.game_key as string,
         gameId: gameObj.game_id as string,
         gameCode: gameObj.code as GameCode,
         season: Number.parseInt(gameObj.season as string),
      };

      // Parse teams if included
      if (includeTeams && gameObj.teams) {
         const teamsData = gameObj.teams as Record<string, unknown>;
         game.teams = [];

         for (const key in teamsData) {
            if (key === 'count') continue;
            const teamEntry = teamsData[key];
            if (
               teamEntry &&
               typeof teamEntry === 'object' &&
               'team' in teamEntry
            ) {
               const team = this.parseTeam(
                  (teamEntry as { team: Array<unknown> }).team,
               );
               game.teams.push(team);
            }
         }
      }

      return game;
   }

   /**
    * Parse team data from API response
    *
    * @private
    */
   private parseTeam(teamData: Array<unknown>): UserTeam {
      const teamObj: Record<string, unknown> = {};

      for (const item of teamData) {
         if (Array.isArray(item)) {
            // Yahoo API wraps team data in a nested array
            for (const nestedItem of item) {
               if (nestedItem !== null && typeof nestedItem === 'object') {
                  Object.assign(teamObj, nestedItem);
               }
            }
         } else if (item !== null && typeof item === 'object') {
            Object.assign(teamObj, item);
         }
      }

      const team: UserTeam = {
         teamKey: teamObj.team_key as string,
         teamId: teamObj.team_id as string,
         name: teamObj.name as string,
         teamLogoUrl: this.extractTeamLogoUrl(teamObj),
         waiverPriority: teamObj.waiver_priority
            ? Number.parseInt(teamObj.waiver_priority as string)
            : undefined,
         faabBalance: teamObj.faab_balance
            ? Number.parseInt(teamObj.faab_balance as string)
            : undefined,
         numberOfMoves: teamObj.number_of_moves
            ? Number.parseInt(teamObj.number_of_moves as string)
            : undefined,
         numberOfTrades: teamObj.number_of_trades
            ? Number.parseInt(teamObj.number_of_trades as string)
            : undefined,
         league: this.extractLeagueInfo(teamObj),
         url: teamObj.url as string,
      };

      return team;
   }

   /**
    * Extract team logo URL from team_logos array
    *
    * @private
    */
   private extractTeamLogoUrl(
      teamObj: Record<string, unknown>,
   ): string | undefined {
      const teamLogos = teamObj.team_logos as Array<unknown> | undefined;
      if (
         !teamLogos ||
         !Array.isArray(teamLogos) ||
         teamLogos.length === 0
      ) {
         return undefined;
      }

      const firstLogo = teamLogos[0];
      if (!firstLogo || typeof firstLogo !== 'object') {
         return undefined;
      }

      const logoData = (firstLogo as Record<string, unknown>).team_logo as
         | Record<string, unknown>
         | undefined;
      return logoData?.url as string | undefined;
   }

   /**
    * Extract league info from team data
    * The Yahoo API doesn't always include full league details in team objects,
    * so we extract what we can from the team_key and any available league object
    *
    * @private
    */
   private extractLeagueInfo(teamObj: Record<string, unknown>): {
      leagueKey: string;
      leagueId: string;
      name: string;
      url: string;
   } {
      // Extract league key from team key (e.g., "419.l.5634.t.2" -> "419.l.5634")
      const teamKey = teamObj.team_key as string;
      const leagueKey = teamKey ? teamKey.split('.t.')[0] : '';

      // Extract league ID from league key (e.g., "419.l.5634" -> "5634")
      const leagueIdParts = leagueKey ? leagueKey.split('.l.') : [];
      const leagueId = leagueIdParts.length > 1 ? leagueIdParts[1] : '';

      // Try to get league info from embedded league object if present
      const leagueObj = teamObj.league as
         | Record<string, unknown>
         | undefined;

      return {
         leagueKey: (leagueObj?.league_key as string) || leagueKey || '',
         leagueId: (leagueObj?.league_id as string) || leagueId || '',
         name: (leagueObj?.name as string) || '',
         url: (leagueObj?.url as string) || '',
      };
   }
}
