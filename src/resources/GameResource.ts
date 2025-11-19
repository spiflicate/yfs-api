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
import type { League } from '../types/resources/league.js';
import type {
   Player,
   PlayerCollectionResponse,
} from '../types/resources/player.js';
import { ensureArray, getBoolean, getInteger } from '../utils/xmlParser.js';

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
   async get(gameKey: string, params?: GetGameParams): Promise<Game> {
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

      return this.parseGame(response.game);
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
   async getGames(params?: GetGamesParams): Promise<Game[]> {
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
         games: { game: unknown };
      }>(path);

      const gamesArray = ensureArray(response.games.game);
      return gamesArray.map((game) => this.parseGame(game));
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
   async getLeagues(gameKey: string): Promise<League[]> {
      const response = await this.http.get<{
         game: { leagues?: { league: unknown } };
      }>(`/game/${gameKey}/leagues`);

      if (!response.game.leagues?.league) {
         return [];
      }

      const leaguesArray = ensureArray(response.game.leagues.league);
      return leaguesArray.map((league) => this.parseLeague(league));
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
   ): Promise<PlayerCollectionResponse> {
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
         game: { players?: { count?: string; player: unknown } };
      }>(path);

      if (!response.game.players?.player) {
         return { count: 0, players: [] };
      }

      const count = response.game.players.count
         ? getInteger(response.game.players.count)
         : 0;

      const playersArray = ensureArray(response.game.players.player);
      const players = playersArray.map((player) =>
         this.parsePlayer(player),
      );

      return { count, players };
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
   async getGameWeeks(gameKey: string): Promise<GameWeek[]> {
      const response = await this.http.get<{
         game: { game_weeks?: { game_week: unknown } };
      }>(`/game/${gameKey}/game_weeks`);

      if (!response.game.game_weeks?.game_week) {
         return [];
      }

      const weeksArray = ensureArray(response.game.game_weeks.game_week);
      return weeksArray.map((weekData: unknown) => {
         const data = weekData as Record<string, unknown>;
         return {
            week: getInteger(data.week),
            start: data.start as string | undefined,
            end: data.end as string | undefined,
            displayName: data.display_name as string | undefined,
         };
      });
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
   async getStatCategories(gameKey: string): Promise<GameStatCategory[]> {
      const response = await this.http.get<{
         game: { stat_categories?: { stats?: { stat: unknown } } };
      }>(`/game/${gameKey}/stat_categories`);

      if (!response.game.stat_categories?.stats?.stat) {
         return [];
      }

      const statsArray = ensureArray(
         response.game.stat_categories.stats.stat,
      );
      return statsArray.map((statData: unknown) => {
         const data = statData as Record<string, unknown>;
         return {
            statId: getInteger(data.stat_id),
            enabled: getBoolean(data.enabled),
            name: data.name as string,
            displayName: data.display_name as string | undefined,
            sortOrder: data.sort_order
               ? getInteger(data.sort_order)
               : undefined,
            positionType: data.position_type as string | undefined,
         };
      });
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
   async getPositionTypes(gameKey: string): Promise<GamePositionType[]> {
      const response = await this.http.get<{
         game: { position_types?: { position_type: unknown } };
      }>(`/game/${gameKey}/position_types`);

      if (!response.game.position_types?.position_type) {
         return [];
      }

      const posTypesArray = ensureArray(
         response.game.position_types.position_type,
      );
      return posTypesArray.map((posData: unknown) => {
         const data = posData as Record<string, unknown>;
         return {
            type: data.type as string,
            displayName: data.display_name as string,
         };
      });
   }

   /**
    * Parse game data from API response
    *
    * @private
    */
   private parseGame(gameData: unknown): Game {
      // XML structure is direct - no array flattening needed
      const data = gameData as Record<string, unknown>;

      const game: Game = {
         gameKey: data.game_key as string,
         gameId: data.game_id as string,
         name: data.name as string,
         code: data.code as GameCode,
         type: data.type as
            | 'full'
            | 'pickem-team'
            | 'pickem-group'
            | 'pickem-team-list',
         season: getInteger(data.season),
         url: data.url as string,
      };

      if (data.is_available !== undefined) {
         game.isAvailable = getBoolean(data.is_available);
      }

      if (data.is_game_over !== undefined) {
         game.isGameOver = getBoolean(data.is_game_over);
      }

      if (data.is_registration_over !== undefined) {
         game.isRegistrationOver = getBoolean(data.is_registration_over);
      }

      if (data.is_live_draft_lobby_active !== undefined) {
         game.isLiveDraftLobbyActive = getBoolean(
            data.is_live_draft_lobby_active,
         );
      }

      return game;
   }

   /**
    * Parse league data from API response
    *
    * @private
    */
   private parseLeague(leagueData: unknown): League {
      // XML structure is direct - no array flattening needed
      const data = leagueData as Record<string, unknown>;

      return {
         leagueKey: data.league_key as string,
         leagueId: data.league_id as string,
         name: data.name as string,
         gameKey: data.game_key as string,
         gameCode: data.game_code as GameCode,
         season: getInteger(data.season),
         scoringType: data.scoring_type as 'head' | 'roto' | 'point',
         leagueType: data.league_type as 'private' | 'public',
         numberOfTeams: getInteger(data.num_teams),
         currentWeek: getInteger(data.current_week),
         draftStatus: data.draft_status as
            | 'predraft'
            | 'drafting'
            | 'postdraft',
         isFinished: getBoolean(data.is_finished),
         url: data.url as string,
         startWeek: data.start_week
            ? getInteger(data.start_week)
            : undefined,
         endWeek: data.end_week ? getInteger(data.end_week) : undefined,
         startDate: data.start_date as string | undefined,
         endDate: data.end_date as string | undefined,
         logoUrl: data.logo_url as string | undefined,
         password: data.password as string | undefined,
         renewUrl: data.renew as string | undefined,
         shortInvitationUrl: data.short_invitation_url as
            | string
            | undefined,
         isProLeague: data.is_pro_league
            ? getBoolean(data.is_pro_league)
            : undefined,
         isCashLeague: data.is_cash_league
            ? getBoolean(data.is_cash_league)
            : undefined,
      };
   }

   /**
    * Parse player data from API response
    *
    * @private
    */
   private parsePlayer(playerData: unknown): Player {
      // XML structure is direct - no array flattening needed
      const data = playerData as Record<string, unknown>;
      const nameData = (data.name as Record<string, unknown>) || {};

      return {
         playerKey: data.player_key as string,
         playerId: data.player_id as string,
         name: {
            full: (nameData.full as string) || '',
            first: (nameData.first as string) || '',
            last: (nameData.last as string) || '',
            ascii: nameData.ascii as string | undefined,
         },
         editorialPlayerKey: data.editorial_player_key as
            | string
            | undefined,
         editorialTeamKey: data.editorial_team_key as string | undefined,
         editorialTeamFullName: data.editorial_team_full_name as
            | string
            | undefined,
         editorialTeamAbbr: data.editorial_team_abbr as string | undefined,
         byeWeek: data.bye_week ? getInteger(data.bye_week) : undefined,
         uniformNumber: data.uniform_number as string | undefined,
         displayPosition: data.display_position as string,
         headshotUrl: data.headshot_url as string | undefined,
         imageUrl: data.image_url as string | undefined,
         isUndroppable: data.is_undroppable
            ? getBoolean(data.is_undroppable)
            : undefined,
         positionType: data.position_type as string | undefined,
         primaryPosition: data.primary_position as string | undefined,
         hasPlayerNotes: data.has_player_notes
            ? getBoolean(data.has_player_notes)
            : undefined,
         hasRecentPlayerNotes: data.has_recent_player_notes
            ? getBoolean(data.has_recent_player_notes)
            : undefined,
         injuryNote: data.injury_note as string | undefined,
         url: data.url as string,
      };
   }
}
