import type { ImageSource, PositionType } from '../common.js';

/**
 * API response wrapper for player data.
 * Wraps the Player object returned from API endpoints.
 */
export interface PlayerResponse {
   /** The player data */
   player: Player;
}

export interface BasePlayer {
   /** Unique identifier for the player in format "gameId.p.playerId" */
   playerKey: string;

   /** Numeric player identifier */
   playerId: number;

   /** Player's full name and components */
   name: PlayerName;

   /** Abbreviation of the real-world team */
   editorialTeamAbbr: string;

   /** Display position (e.g., "C", "LW", "RW", "D", "G") */
   displayPosition: string;

   /** Position type (P for player positions, G for goalie) */
   positionType: PositionType;
}

/**
 * Represents a player in the Yahoo Fantasy Sports system.
 * Contains player information including name, position, team affiliation,
 * keeper status, and headshot image.
 */
export interface Player extends BasePlayer {
   /** URL to the player on Yahoo Fantasy Sports */
   url: string;

   /** Editorial player key from Yahoo */
   editorialPlayerKey: string;

   /** Editorial team key the player belongs to */
   editorialTeamKey: string;

   /** Full name of the real-world team */
   editorialTeamFullName: string;

   /** URL to the real-world team */
   editorialTeamUrl: string;

   /** Keeper status and information */
   isKeeper: IsKeeper;

   /** Uniform number for the player */
   uniformNumber: number;

   /** Player headshot image */
   headshot: ImageSource;

   /** URL to player image */
   imageUrl: string;

   /** Whether this player cannot be dropped */
   isUndroppable: boolean;

   /** Primary position of the player */
   primaryPosition?: PrimaryPositionElement;

   /** Positions this player is eligible for */
   eligiblePositions: EligiblePositions;

   /** Positions this player can be added to */
   eligiblePositionsToAdd: string;

   /** Whether this player has notes */
   hasPlayerNotes?: boolean;

   /** Selected position for this player in roster */
   selectedPosition?: SelectedPosition;

   /** Whether this player has recent notes (optional) */
   hasRecentPlayerNotes?: boolean;

   /** Unix timestamp of the last player note */
   playerNotesLastTimestamp?: number;

   /** Player statistics (if requested) */
   playerStats?: PlayerStats;

   /** Player advanced statistics (if requested) */
   playerAdvancedStats?: PlayerAdvancedStats;

   /** Starting status for current period */
   startingStatus?: StartingStatus;

   /** Player status (e.g., injury status) */
   status?: string;

   /** Full status description */
   statusFull?: string;

   /** Injury note or other status information */
   injuryNote?: string;

   /** Whether player is on disabled list */
   onDisabledList?: boolean;
}

/**
 * Represents starting status for a player.
 * Indicates if a player is in the starting lineup.
 */
export interface StartingStatus {
   /** Coverage period type */
   coverageType: string;

   /** Date of the roster period */
   date: string;

   /** Whether player is in starting lineup */
   isStarting: boolean;
}

/**
 * Represents a player's selected position in roster.
 * Contains the position assigned to a player for a specific period.
 */
export interface SelectedPosition {
   /** Coverage period type */
   coverageType: string;

   /** Date of the roster period */
   date: string;

   /** Position code for this roster period */
   position: PrimaryPositionElement;

   /** Whether position is a flex position */
   isFlex: boolean;
}

/**
 * Position element types for hockey.
 */
export type PrimaryPositionElement =
   | 'C'
   | 'LW'
   | 'RW'
   | 'D'
   | 'Util'
   | 'G'
   | 'BN'
   | 'IR+';

/**
 * Container for eligible positions.
 * Wraps an array of position codes.
 */
export interface EligiblePositions {
   /** Array of position codes */
   position: PrimaryPositionElement[];
}

/**
 * Represents keeper status information for a player.
 * Contains keeper eligibility, cost, and historical keeper data.
 */
export interface IsKeeper {
   /** Keeper status (e.g., "eligible", "ineligible") */
   status: string;

   /** Cost to keep the player */
   cost: string;

   /** Whether player was kept */
   kept?: string;
}

/**
 * Represents a player's name in various formats.
 * Contains full name and component parts in ASCII and full character formats.
 */
export interface PlayerName {
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
 * Contains individual advanced stat values for a player in a coverage period.
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
 * A key-value pair for a specific advanced stat category.
 */
export interface PlayerAdvancedStatsStat {
   /** Stat category ID */
   statId: number;

   /** Value for this stat */
   value: number;
}

/**
 * Represents player statistics.
 * Contains individual stat values for a player in a coverage period.
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
 * A key-value pair for a specific stat category.
 */
export interface PlayerStatsStat {
   /** Stat category ID */
   statId: number;

   /** Value for this stat (number or string) */
   value: number | string;
}
