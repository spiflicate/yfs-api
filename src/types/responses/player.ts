/**
 * API response wrapper for player data.
 *
 * @interface PlayerResponse
 * @description Wraps the Player object returned from API endpoints.
 */
export interface PlayerResponse {
   /** The player data */
   player: Player;
}

/**
 * Represents a player in the Yahoo Fantasy Sports system.
 *
 * @interface Player
 * @description Contains player information including name, position, team affiliation,
 * keeper status, and headshot image.
 */
export interface Player {
   /** Unique identifier for the player in format "gameId.p.playerId" */
   playerKey: string;
   /** Numeric player identifier */
   playerId: number;
   /** Player's full name and components */
   name: Name;
   /** URL to the player on Yahoo Fantasy Sports */
   url: string;
   /** Editorial player key from Yahoo */
   editorialPlayerKey: string;
   /** Editorial team key the player belongs to */
   editorialTeamKey: string;
   /** Full name of the real-world team */
   editorialTeamFullName: string;
   /** Abbreviation of the real-world team */
   editorialTeamAbbr: string;
   /** URL to the real-world team */
   editorialTeamUrl: string;
   /** Keeper status and information */
   isKeeper: IsKeeper;
   /** Uniform number for the player */
   uniformNumber: number;
   /** Display position (e.g., "C", "LW", "RW", "D", "G") */
   displayPosition: string;
   /** Player headshot image */
   headshot: Headshot;
   /** URL to player image */
   imageUrl: string;
   /** Whether this player cannot be dropped */
   isUndroppable: boolean;
   /** Position type (P for player positions, G for goalie) */
   positionType: string;
   /** Positions this player is eligible for */
   eligiblePositions: EligiblePositions;
   /** Positions this player can be added to */
   eligiblePositionsToAdd: string;
   /** Whether this player has notes */
   hasPlayerNotes: boolean;
   /** Whether this player has recent notes (optional) */
   hasRecentPlayerNotes: boolean;
   /** Unix timestamp of the last player note */
   playerNotesLastTimestamp: number;
   /** Player statistics (if requested) */
   playerStats?: PlayerStats;
   /** Player advanced statistics (if requested) */
   playerAdvancedStats?: PlayerAdvancedStats;
}

/**
 * Container for eligible positions.
 *
 * @interface EligiblePositions
 * @description Wraps an array of position codes.
 */
export interface EligiblePositions {
   /** Array of position codes */
   position: string;
}

/**
 * Represents an image (headshot or logo).
 *
 * @interface Headshot
 * @description Contains URL and size information for an image.
 */
export interface Headshot {
   /** URL to the image */
   url: string;
   /** Size of the image */
   size: string;
}

/**
 * Represents keeper status information for a player.
 *
 * @interface IsKeeper
 * @description Contains keeper eligibility, cost, and historical keeper data.
 */
export interface IsKeeper {
   /** Keeper status (e.g., "eligible", "ineligible") */
   status: string;
   /** Cost to keep the player */
   cost: string;
}

/**
 * Represents a player's name in various formats.
 *
 * @interface Name
 * @description Contains full name and component parts in ASCII and full character formats.
 */
export interface Name {
   /** Full name of the player */
   full: string;
   /** First name */
   first: string;
   /** Last name */
   last: string;
   /** ASCII version of first name */
   asciiFirst: string;
   /** ASCII version of last name */
   asciiLast: string;
}

/**
 * Represents player advanced statistics.
 *
 * @interface PlayerAdvancedStats
 * @description Contains individual advanced stat values for a player in a coverage period.
 */
export interface PlayerAdvancedStats {
   /** Coverage period type */
   coverageType: string;
   /** Season year */
   season: number;
   /** Array of individual advanced stat values */
   stats: PlayerAdvancedStatsStat[];
}

/**
 * Represents a single advanced stat value for a player.
 *
 * @interface PlayerAdvancedStatsStat
 * @description A key-value pair for a specific advanced stat category.
 */
export interface PlayerAdvancedStatsStat {
   /** Stat category ID */
   statId: number;
   /** Value for this stat */
   value: number;
}

/**
 * Represents player statistics.
 *
 * @interface PlayerStats
 * @description Contains individual stat values for a player in a coverage period.
 */
export interface PlayerStats {
   /** Coverage period type */
   coverageType: string;
   /** Season year */
   season: number;
   /** Array of individual stat values */
   stats: PlayerStatsStat[];
}

/**
 * Represents a single stat value for a player.
 *
 * @interface PlayerStatsStat
 * @description A key-value pair for a specific stat category.
 */
export interface PlayerStatsStat {
   /** Stat category ID */
   statId: number;
   /** Value for this stat (number or string) */
   value: number | string;
}
