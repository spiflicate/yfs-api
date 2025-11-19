/**
 * User resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { GameCode } from '../types/common.js';
import type {
   GetUserGamesParams,
   GetUserTeamsParams,
   User,
   UserGame,
   UserTeam,
} from '../types/resources/user.js';
import { ensureArray, getInteger } from '../utils/xmlParser.js';

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
         users: { user: unknown };
      }>('/users;use_login=1');

      // In XML, user is directly accessible (no numeric keys)
      const users = ensureArray(response.users.user);
      return this.parseUser(users[0]);
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
         users: { user: unknown };
      }>(path);

      // In XML, user is directly accessible
      const users = ensureArray(response.users.user);
      const userData = users[0] as Record<string, unknown>;

      if (!userData?.games) {
         return [];
      }

      const gamesData = userData.games as Record<string, unknown>;
      if (!gamesData.game) {
         return [];
      }

      // Games are in a simple array structure in XML
      const gamesArray = ensureArray(gamesData.game);
      return gamesArray.map((game) =>
         this.parseGame(game, params?.includeTeams),
      );
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
         users: { user: unknown };
      }>(path);

      // In XML, user is directly accessible
      const users = ensureArray(response.users.user);
      const userData = users[0] as Record<string, unknown>;

      if (!userData?.games) {
         return [];
      }

      const gamesData = userData.games as Record<string, unknown>;
      if (!gamesData.game) {
         return [];
      }

      const allTeams: UserTeam[] = [];
      const gamesArray = ensureArray(gamesData.game);

      for (const game of gamesArray) {
         const parsedGame = this.parseGame(game, true);
         if (parsedGame.teams) {
            allTeams.push(...parsedGame.teams);
         }
      }

      return allTeams;
   }

   /**
    * Parse user data from API response
    *
    * @private
    */
   private parseUser(userData: unknown): User {
      // XML structure is direct - no array flattening needed
      const data = userData as Record<string, unknown>;
      return {
         guid: data.guid as string,
         url: data.url as string,
      };
   }

   /**
    * Parse game data from API response
    *
    * @private
    */
   private parseGame(gameData: unknown, includeTeams?: boolean): UserGame {
      // XML structure is direct - no array flattening needed
      const data = gameData as Record<string, unknown>;
      const game: UserGame = {
         gameKey: data.game_key as string,
         gameId: data.game_id as string,
         gameCode: data.code as GameCode,
         season: getInteger(data.season),
      };

      // Parse teams if included
      if (includeTeams && data.teams) {
         const teamsData = data.teams as Record<string, unknown>;
         if (teamsData.team) {
            const teamsArray = ensureArray(teamsData.team);
            game.teams = teamsArray.map((team) => this.parseTeam(team));
         }
      }

      return game;
   }

   /**
    * Parse team data from API response
    *
    * @private
    */
   private parseTeam(teamData: unknown): UserTeam {
      // XML structure is direct - no array flattening or double-nesting
      const data = teamData as Record<string, unknown>;
      const team: UserTeam = {
         teamKey: data.team_key as string,
         teamId: data.team_id as string,
         name: data.name as string,
         teamLogoUrl: this.extractTeamLogoUrl(data),
         waiverPriority: data.waiver_priority
            ? getInteger(data.waiver_priority)
            : undefined,
         faabBalance: data.faab_balance
            ? getInteger(data.faab_balance)
            : undefined,
         numberOfMoves: data.number_of_moves
            ? getInteger(data.number_of_moves)
            : undefined,
         numberOfTrades: data.number_of_trades
            ? getInteger(data.number_of_trades)
            : undefined,
         league: this.extractLeagueInfo(data),
         url: data.url as string,
      };

      return team;
   }

   /**
    * Extract team logo URL from team_logos
    *
    * @private
    */
   private extractTeamLogoUrl(
      teamData: Record<string, unknown>,
   ): string | undefined {
      // In XML, team_logos.team_logo might be single object or array
      const teamLogos = teamData.team_logos as
         | Record<string, unknown>
         | undefined;
      if (!teamLogos || !teamLogos.team_logo) {
         return undefined;
      }

      const logos = ensureArray(teamLogos.team_logo);
      const firstLogo = logos[0] as Record<string, unknown> | undefined;
      return firstLogo?.url as string | undefined;
   }

   /**
    * Extract league info from team data
    * The Yahoo API doesn't always include full league details in team objects,
    * so we extract what we can from the team_key and any available league object
    *
    * @private
    */
   private extractLeagueInfo(teamData: Record<string, unknown>): {
      leagueKey: string;
      leagueId: string;
      name: string;
      url: string;
   } {
      // Extract league key from team key (e.g., "419.l.5634.t.2" -> "419.l.5634")
      const teamKey = teamData.team_key as string;
      const leagueKey = teamKey ? teamKey.split('.t.')[0] : '';

      // Extract league ID from league key (e.g., "419.l.5634" -> "5634")
      const leagueIdParts = leagueKey ? leagueKey.split('.l.') : [];
      const leagueId = leagueIdParts.length > 1 ? leagueIdParts[1] : '';

      // Try to get league info from embedded league object if present
      const leagueObj = teamData.league as
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
