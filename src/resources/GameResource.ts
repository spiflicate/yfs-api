/**
 * Game resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   Game,
   GetGameParams,
   GetGamesParams,
   SearchGamePlayersParams,
   GameWeek,
   GameStatCategory,
   GamePositionType,
} from '../types/resources/game.js';
import type { League } from '../types/resources/league.js';
import type {
   Player,
   PlayerCollectionResponse,
} from '../types/resources/player.js';
import type { GameCode } from '../types/common.js';

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
         fantasy_content: { game: Array<unknown> };
      }>(path);

      return this.parseGame(response.fantasy_content.game);
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
         fantasy_content: { games: Record<string, unknown> };
      }>(path);

      const gamesData = response.fantasy_content.games;
      const games: Game[] = [];

      for (const key in gamesData) {
         if (key === 'count') continue;
         const gameEntry = gamesData[key];
         if (
            gameEntry &&
            typeof gameEntry === 'object' &&
            'game' in gameEntry
         ) {
            const game = this.parseGame(
               (gameEntry as { game: Array<unknown> }).game,
            );
            games.push(game);
         }
      }

      return games;
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
         fantasy_content: { game: Array<unknown> };
      }>(`/game/${gameKey}/leagues`);

      const gameData = response.fantasy_content.game;
      const leaguesObj = gameData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'leagues' in item,
      );

      if (!leaguesObj || !('leagues' in leaguesObj)) {
         return [];
      }

      const leagues: League[] = [];
      const leaguesData = leaguesObj.leagues as Record<string, unknown>;

      for (const key in leaguesData) {
         if (key === 'count') continue;
         const leagueEntry = leaguesData[key];
         if (
            leagueEntry &&
            typeof leagueEntry === 'object' &&
            'league' in leagueEntry
         ) {
            const league = this.parseLeague(
               (leagueEntry as { league: Array<unknown> }).league,
            );
            leagues.push(league);
         }
      }

      return leagues;
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
         fantasy_content: { game: Array<unknown> };
      }>(path);

      const gameData = response.fantasy_content.game;
      const playersObj = gameData.find(
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
         fantasy_content: { game: Array<unknown> };
      }>(`/game/${gameKey}/game_weeks`);

      const gameData = response.fantasy_content.game;
      const weeksObj = gameData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'game_weeks' in item,
      );

      if (!weeksObj || !('game_weeks' in weeksObj)) {
         return [];
      }

      const weeks: GameWeek[] = [];
      const weeksData = weeksObj.game_weeks as Record<string, unknown>;

      for (const key in weeksData) {
         if (key === 'count') continue;
         const weekEntry = weeksData[key];
         if (
            weekEntry &&
            typeof weekEntry === 'object' &&
            'game_week' in weekEntry
         ) {
            const weekData = (
               weekEntry as { game_week: Record<string, unknown> }
            ).game_week;
            weeks.push({
               week: Number.parseInt(weekData.week as string),
               start: weekData.start as string | undefined,
               end: weekData.end as string | undefined,
               displayName: weekData.display_name as string | undefined,
            });
         }
      }

      return weeks;
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
         fantasy_content: { game: Array<unknown> };
      }>(`/game/${gameKey}/stat_categories`);

      const gameData = response.fantasy_content.game;
      const statsObj = gameData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'stat_categories' in item,
      );

      if (!statsObj || !('stat_categories' in statsObj)) {
         return [];
      }

      const stats: GameStatCategory[] = [];
      const statsData = (
         statsObj.stat_categories as Record<string, unknown>
      ).stats as Record<string, unknown>;

      for (const key in statsData) {
         if (key === 'count') continue;
         const statEntry = statsData[key];
         if (
            statEntry &&
            typeof statEntry === 'object' &&
            'stat' in statEntry
         ) {
            const statData = (
               statEntry as { stat: Record<string, unknown> }
            ).stat;
            stats.push({
               statId: Number.parseInt(statData.stat_id as string),
               enabled: Boolean(Number(statData.enabled)),
               name: statData.name as string,
               displayName: statData.display_name as string | undefined,
               sortOrder: statData.sort_order
                  ? Number.parseInt(statData.sort_order as string)
                  : undefined,
               positionType: statData.position_type as string | undefined,
            });
         }
      }

      return stats;
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
         fantasy_content: { game: Array<unknown> };
      }>(`/game/${gameKey}/position_types`);

      const gameData = response.fantasy_content.game;
      const posTypesObj = gameData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'position_types' in item,
      );

      if (!posTypesObj || !('position_types' in posTypesObj)) {
         return [];
      }

      const posTypes: GamePositionType[] = [];
      const posTypesData = posTypesObj.position_types as Record<
         string,
         unknown
      >;

      for (const key in posTypesData) {
         if (key === 'count') continue;
         const posEntry = posTypesData[key];
         if (
            posEntry &&
            typeof posEntry === 'object' &&
            'position_type' in posEntry
         ) {
            const posData = (
               posEntry as { position_type: Record<string, unknown> }
            ).position_type;
            posTypes.push({
               type: posData.type as string,
               displayName: posData.display_name as string,
            });
         }
      }

      return posTypes;
   }

   /**
    * Parse game data from API response
    *
    * @private
    */
   private parseGame(gameData: Array<unknown>): Game {
      const gameObj: Record<string, unknown> = {};

      for (const item of gameData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(gameObj, item);
         }
      }

      const game: Game = {
         gameKey: gameObj.game_key as string,
         gameId: gameObj.game_id as string,
         name: gameObj.name as string,
         code: gameObj.code as GameCode,
         type: gameObj.type as
            | 'full'
            | 'pickem-team'
            | 'pickem-group'
            | 'pickem-team-list',
         season: Number.parseInt(gameObj.season as string),
         url: gameObj.url as string,
      };

      if (gameObj.is_available !== undefined) {
         game.isAvailable = Boolean(Number(gameObj.is_available));
      }

      if (gameObj.is_game_over !== undefined) {
         game.isGameOver = Boolean(Number(gameObj.is_game_over));
      }

      if (gameObj.is_registration_over !== undefined) {
         game.isRegistrationOver = Boolean(
            Number(gameObj.is_registration_over),
         );
      }

      if (gameObj.is_live_draft_lobby_active !== undefined) {
         game.isLiveDraftLobbyActive = Boolean(
            Number(gameObj.is_live_draft_lobby_active),
         );
      }

      return game;
   }

   /**
    * Parse league data from API response
    *
    * @private
    */
   private parseLeague(leagueData: Array<unknown>): League {
      const leagueObj: Record<string, unknown> = {};

      for (const item of leagueData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(leagueObj, item);
         }
      }

      return {
         leagueKey: leagueObj.league_key as string,
         leagueId: leagueObj.league_id as string,
         name: leagueObj.name as string,
         gameKey: leagueObj.game_key as string,
         gameCode: leagueObj.game_code as GameCode,
         season: Number.parseInt(leagueObj.season as string),
         scoringType: leagueObj.scoring_type as 'head' | 'roto' | 'point',
         leagueType: leagueObj.league_type as 'private' | 'public',
         numberOfTeams: Number.parseInt(leagueObj.num_teams as string),
         currentWeek: Number.parseInt(leagueObj.current_week as string),
         draftStatus: leagueObj.draft_status as
            | 'predraft'
            | 'drafting'
            | 'postdraft',
         isFinished: Boolean(Number(leagueObj.is_finished)),
         url: leagueObj.url as string,
         startWeek: leagueObj.start_week
            ? Number.parseInt(leagueObj.start_week as string)
            : undefined,
         endWeek: leagueObj.end_week
            ? Number.parseInt(leagueObj.end_week as string)
            : undefined,
         startDate: leagueObj.start_date as string | undefined,
         endDate: leagueObj.end_date as string | undefined,
         logoUrl: leagueObj.logo_url as string | undefined,
         password: leagueObj.password as string | undefined,
         renewUrl: leagueObj.renew as string | undefined,
         shortInvitationUrl: leagueObj.short_invitation_url as
            | string
            | undefined,
         isProLeague: leagueObj.is_pro_league
            ? Boolean(Number(leagueObj.is_pro_league))
            : undefined,
         isCashLeague: leagueObj.is_cash_league
            ? Boolean(Number(leagueObj.is_cash_league))
            : undefined,
      };
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

      return {
         playerKey: playerObj.player_key as string,
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
   }
}
