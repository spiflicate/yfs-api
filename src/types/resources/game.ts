/**
 * Game resource types
 * @module
 */

import type { GameCode } from '../common.js';

/**
 * Game metadata
 */
export interface Game {
   /**
    * Game key (e.g., "423" or "nhl")
    */
   gameKey: string;

   /**
    * Numeric game ID
    */
   gameId: string;

   /**
    * Game name (e.g., "Hockey")
    */
   name: string;

   /**
    * Game code (e.g., "nhl", "nfl", "mlb", "nba")
    */
   code: GameCode;

   /**
    * Game type
    */
   type: 'full' | 'pickem-team' | 'pickem-group' | 'pickem-team-list';

   /**
    * Season year
    */
   season: number;

   /**
    * Whether the game is available for new leagues
    */
   isAvailable?: boolean;

   /**
    * Game URL
    */
   url: string;

   /**
    * Whether the game has started
    */
   isGameOver?: boolean;

   /**
    * Registration status
    */
   isRegistrationOver?: boolean;

   /**
    * Whether live draft lobby is active
    */
   isLiveDraftLobbyActive?: boolean;
}

/**
 * Parameters for getting a game
 */
export interface GetGameParams {
   /**
    * Include leagues sub-resource
    */
   includeLeagues?: boolean;

   /**
    * Include players sub-resource
    */
   includePlayers?: boolean;

   /**
    * Include game weeks sub-resource
    */
   includeGameWeeks?: boolean;

   /**
    * Include stat categories sub-resource
    */
   includeStatCategories?: boolean;

   /**
    * Include position types sub-resource
    */
   includePositionTypes?: boolean;
}

/**
 * Parameters for getting multiple games
 */
export interface GetGamesParams {
   /**
    * Game keys to retrieve
    */
   gameKeys?: string[];

   /**
    * Filter to only available games
    */
   isAvailable?: boolean;

   /**
    * Filter by game types
    */
   gameTypes?: (
      | 'full'
      | 'pickem-team'
      | 'pickem-group'
      | 'pickem-team-list'
   )[];

   /**
    * Filter by game codes
    */
   gameCodes?: GameCode[];

   /**
    * Filter by seasons
    */
   seasons?: number[];
}

/**
 * Parameters for searching players in a game
 */
export interface SearchGamePlayersParams {
   /**
    * Player name search string
    */
   search?: string;

   /**
    * Filter by position
    */
   position?: string;

   /**
    * Sort by stat ID, NAME, OR (overall rank), AR (actual rank), or PTS
    */
   sort?: string | number;

   /**
    * Sort type (season, date, week, etc.)
    */
   sortType?: 'season' | 'date' | 'week' | 'lastweek' | 'lastmonth';

   /**
    * Sort season (year)
    */
   sortSeason?: number;

   /**
    * Sort date (YYYY-MM-DD)
    */
   sortDate?: string;

   /**
    * Sort week (for NFL)
    */
   sortWeek?: number;

   /**
    * Pagination start index
    */
   start?: number;

   /**
    * Number of results to return
    */
   count?: number;

   /**
    * Include player stats
    */
   includeStats?: boolean;

   /**
    * Include player ownership
    */
   includeOwnership?: boolean;

   /**
    * Include percent owned
    */
   includePercentOwned?: boolean;
}

/**
 * Game week information
 */
export interface GameWeek {
   /**
    * Week number
    */
   week: number;

   /**
    * Start date
    */
   start?: string;

   /**
    * End date
    */
   end?: string;

   /**
    * Display name
    */
   displayName?: string;
}

/**
 * Stat category in a game
 */
export interface GameStatCategory {
   /**
    * Stat ID
    */
   statId: number;

   /**
    * Whether stat is enabled
    */
   enabled: boolean;

   /**
    * Stat name
    */
   name: string;

   /**
    * Display name
    */
   displayName?: string;

   /**
    * Sort order (1 = ascending, 0 = descending)
    */
   sortOrder?: number;

   /**
    * Position type (B = batter, P = pitcher, O = offense, DT = defense/team, etc.)
    */
   positionType?: string;
}

/**
 * Position type in a game
 */
export interface GamePositionType {
   /**
    * Position type code
    */
   type: string;

   /**
    * Display name
    */
   displayName: string;
}
