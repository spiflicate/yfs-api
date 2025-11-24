import type { PositionType } from '../common';

/**
 * API response wrapper for game data.
 *
 * @description Wraps the Game object returned from API endpoints.
 * @example
 * ```typescript
 * const response: GameResponse = {
 *   game: {
 *     gameKey: "423",
 *     gameId: 423,
 *     name: "Hockey",
 *     code: "nhl",
 *     // ... other properties
 *   }
 * };
 * ```
 */
export interface GameResponse {
   /** The game data */
   game: Game;
}

/**
 * Represents a game (sport) in the Yahoo Fantasy Sports system.
 *
 * @description Contains comprehensive information about a fantasy sports game,
 * including its identifier, season details, registration status, and available
 * position types and statistics.
 */
export interface Game {
   /** Game key - unique identifier that can be numeric (e.g., "423") or code-based (e.g., "nhl") */
   gameKey: string;

   /** Numeric game identifier */
   gameId: number;

   /** Name of the sport (e.g., "Hockey", "Football", "Baseball") */
   name: string;

   /** Sport code used by Yahoo (e.g., "nhl", "nfl", "mlb", "nba") */
   code: string;

   /** Type of fantasy sports game (e.g., "full", "pickem") */
   type: string;

   /** URL to access the game on Yahoo Fantasy Sports website */
   url: string;

   /** The season year as a four-digit number (e.g., 2024, 2025) */
   season: number;
   /** Whether new league registration for this game is closed */
   isRegistrationOver: boolean;

   /** Whether the game season has finished */
   isGameOver: boolean;

   /** Whether the game is currently in its offseason */
   isOffseason: boolean;

   /** Whether a live draft lobby is currently active */
   isLiveDraftLobbyActive?: boolean;

   /** Alternate start deadline timestamp for registration in ISO 8601 format */
   alternateStartDeadline?: string;

   /** Array of position types available in this game */
   positionTypes?: PositionTypeObject[];

   /** Statistical categories tracked for this game */
   statCategories?: StatCategories;

   /** Array of game weeks/periods in the season */
   gameWeeks?: GameWeek[];
}

/**
 * Represents a single week/period within a game season.
 *
 * @description Contains temporal boundaries and metadata for a week of play,
 * including start/end dates and whether it's the current active week.
 */
export interface GameWeek {
   /** Week number in the season (1-indexed) */
   week: number;

   /** Display number for the week (may differ from week number) */
   displayName: number;

   /** Start date/timestamp of the week in ISO 8601 format */
   start: string;

   /** End date/timestamp of the week in ISO 8601 format */
   end: string;

   /** Indicator for whether this is the current active week */
   current: string;
}

/**
 * Represents a position type available in a game.
 *
 * @description Defines a player position category with its code and display name.
 * Examples include offensive, defensive, and special teams positions.
 */
export interface PositionTypeObject {
   /** Position type code (e.g., "O" for offense, "D" for defense) */
   type: PositionType;

   /** Human-readable display name for the position type (e.g., "Offense", "Defense") */
   displayName: string;
}

/**
 * Container for stat categories in a game.
 *
 * @description Contains a collection of stat category definitions available for a game,
 * including both basic statistics and composite stats derived from base stats.
 */
export interface StatCategories {
   /** Array of stat category definitions */
   stats: Stat[];
}

/**
 * Represents a single stat category available in a game.
 *
 * @description Defines a statistical metric that can be tracked for players,
 * including whether it's composite and its applicable position types.
 * Composite stats are calculated from multiple base stats.
 */
export interface Stat {
   /** Unique identifier for the stat */
   statId: number;

   /** Machine-readable name for the stat (e.g., "GP", "G", "A") */
   name: string;

   /** Human-readable display name for the stat (e.g., "Games Played", "Goals", "Assists") */
   displayName: string;

   /** Sort order for displaying this stat - true for ascending (lower is better), false for descending (higher is better) */
   sortOrder: boolean;

   /** Position types for which this stat is applicable */
   positionTypes: PositionType[];

   /** Whether this stat is computed from other base stats rather than being tracked directly */
   isCompositeStat?: boolean;

   /** Base stats used to compute this stat if it's composite */
   baseStats?: BaseStat[];
}

/**
 * Reference to a base stat used in composite stat calculations.
 *
 * @description Links to a base stat that contributes to a composite stat's value.
 * For example, a points per game stat might reference games played and total points.
 */
export interface BaseStat {
   /** Unique identifier for the base stat */
   statId: number;
}
