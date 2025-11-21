export interface GameResponse {
   game: Game;
}

/**
 * Represents a game (sport) in the Yahoo Fantasy Sports system.
 *
 * @interface Game
 * @description Contains game metadata including name, code, season, and current
 * state information. A game represents a specific sport like NHL, NFL, etc.
 *
 * @example
 * ```typescript
 * const game: Game = {
 *   gameKey: "394",
 *   gameId: 394,
 *   name: "NHL",
 *   code: "nhl",
 *   season: 2024,
 *   isGameOver: false,
 *   isOffseason: false,
 * };
 * ```
 */
export interface Game {
   /** Unique identifier for the game in format "gameId" */
   gameKey: string;
   /** Numeric game identifier */
   gameId: number;
   /** Display name of the game (e.g., "NHL", "NFL") */
   name: string;
   /** Short code identifier for the game (e.g., "nhl", "nfl") */
   code: string;
   /** Type of game */
   type: string;
   /** URL to access the game on Yahoo Fantasy Sports */
   url: string;
   /** The season/year of the game */
   season: number;
   /** Whether new league registration for this game is closed */
   isRegistrationOver: boolean;
   /** Whether the game season has finished */
   isGameOver: boolean;
   /** Whether the game is currently in its offseason */
   isOffseason: boolean;
   /** Whether a live draft lobby is currently active (optional) */
   isLiveDraftLobbyActive?: boolean;
   /** Alternate start deadline timestamp for registration (optional) */
   alternateStartDeadline?: string;
}

/**
 * Container for position types available in a game.
 *
 * @interface GamePositionTypes
 * @description Wraps a collection of position type definitions for a game.
 */
export interface GamePositionTypes {
   /** Array of position types available in this game */
   positionTypes: PositionTypeObject[];
}

/**
 * Container for stat categories available in a game.
 *
 * @interface GameStatCategories
 * @description Wraps the available stat categories for a game.
 */
export interface GameStatCategories {
   /** Stat categories for this game (optional) */
   statCategories?: StatCategories;
}

/**
 * Container for game weeks/schedule.
 *
 * @interface GameGameWeeks
 * @description Wraps the schedule information with game weeks for a game season.
 */
export interface GameGameWeeks {
   /** Array of game weeks in the season (optional) */
   gameWeeks?: GameWeek[];
}

/**
 * Represents a single week/period within a game season.
 *
 * @interface GameWeek
 * @description Contains temporal boundaries and metadata for a week of play.
 */
export interface GameWeek {
   /** Week number in the season */
   week: number;
   /** Display name for the week */
   displayName: number;
   /** Start date/timestamp of the week */
   start: string;
   /** End date/timestamp of the week */
   end: string;
   /** Indicator for whether this is the current week */
   current: string;
}

/**
 * Represents a position type available in a game.
 *
 * @interface PositionTypeObject
 * @description Defines a single position type with its metadata.
 */
export interface PositionTypeObject {
   /** Position type code (P for players, G for goalies) */
   type: PositionType;
   /** Human-readable display name for the position type */
   displayName: string;
}

/**
 * Position types for sports.
 * P represents player positions, G represents goalie positions.
 *
 * @type {PositionType}
 * @enum {string}
 */
export type PositionType = 'P' | 'G';

/**
 * Container for stat categories in a game.
 *
 * @interface StatCategories
 * @description Contains a collection of stat category definitions available for a game.
 */
export interface StatCategories {
   /** Array of stat category definitions */
   stats: Stat[];
}

/**
 * Represents a single stat category available in a game.
 *
 * @interface Stat
 * @description Defines a statistical metric that can be tracked for players,
 * including whether it's composite and its applicable position types.
 */
export interface Stat {
   /** Unique identifier for the stat */
   statId: number;
   /** Machine-readable name for the stat */
   name: string;
   /** Human-readable display name for the stat */
   displayName: string;
   /** Sort order for displaying this stat */
   sortOrder: boolean;
   /** Position types for which this stat is applicable */
   positionTypes: PositionType[];
   /** Whether this stat is computed from base stats (optional) */
   isCompositeStat?: boolean;
   /** Base stats used to compute this stat if it's composite (optional) */
   baseStats?: BaseStat[];
}

/**
 * Reference to a base stat used in composite stat calculations.
 *
 * @interface BaseStat
 * @description Links to a base stat that contributes to a composite stat's value.
 */
export interface BaseStat {
   /** Unique identifier for the base stat */
   statId: number;
}
