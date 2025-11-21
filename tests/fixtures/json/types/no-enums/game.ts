/**
 * Represents a single game and its metadata as returned by the API fixtures.
 */
export interface GameElement {
   /** Unique numeric key for the game */
   gameKey: number;
   /** Numeric game identifier */
   gameId: number;
   /** Human readable name for the game */
   name: string;
   /** Short code for the game (e.g. nfl) */
   code: string;
   /** Type of the game */
   type: string;
   /** URL for the game */
   url: string;
   /** Season year */
   season: number;
   /** Whether registration is closed */
   isRegistrationOver: boolean;
   /** Whether the game is finished */
   isGameOver: boolean;
   /** Whether the game is in offseason */
   isOffseason: boolean;
   /** Draft lobby activity flag (optional) */
   isLiveDraftLobbyActive?: boolean;
   /** Optional alternate start deadline in ISO format */
   alternateStartDeadline?: string;
   /** Optional list of supported position types */
   positionTypes?: PositionType[];
   /** Optional stat category grouping */
   statCategories?: StatCategories;
   /** Optional collection of game weeks */
   gameWeeks?: GameWeeks;
}

/** Collection of game weeks */
export interface GameWeeks {
   gameWeek: GameWeek[];
}

/** Represents a single week within a game's season */
export interface GameWeek {
   /** Week number */
   week: number;
   /** Display name or label for the week */
   displayName: number;
   /** ISO start date/time */
   start: string;
   /** ISO end date/time */
   end: string;
   /** Indicator (string) if this is the current week */
   current: string;
}

/** Position type information (eg. QB, RB) */
export interface PositionType {
   type: string;
   displayName: string;
}

/** Groups stat definitions */
export interface StatCategories {
   stats: Stat[];
}

/** Definition of a single statistic */
export interface Stat {
   /** Numeric stat identifier */
   statId: number;
   /** Machine name for the stat */
   name: string;
   /** Human readable stat name */
   displayName: string;
   /** Controls sort ordering for display */
   sortOrder: boolean;
   /** Applicable position types for this stat */
   positionTypes: string[] | PositionTypesClass;
   /** True when the stat is composed of other stats */
   isCompositeStat?: boolean;
   /** When composite, the underlying base stats */
   baseStats?: BaseStats;
}

/** Container for base stat references */
export interface BaseStats {
   baseStat: BaseStat[];
}

/** Reference to a base stat by id */
export interface BaseStat {
   statId: number;
}

/** Wrapper type used when positionTypes are returned as an object */
export interface PositionTypesClass {
   positionType: string;
}
