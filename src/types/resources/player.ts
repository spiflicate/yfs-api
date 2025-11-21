/**
 * Player resource types
 * @module
 */

import type {
   BaseMetadata,
   CoverageType,
   PaginationParams,
   PlayerStatus,
   ResourceKey,
   SortParams,
} from '../common';

/**
 * Player information
 */
export interface Player extends BaseMetadata {
   /**
    * Player key
    */
   playerKey: ResourceKey;

   /**
    * Player ID
    */
   playerId: string;

   /**
    * Player name
    */
   name: {
      full: string;
      first: string;
      last: string;
      ascii?: string;
   };

   /**
    * Editorial player key (for news/content)
    */
   editorialPlayerKey?: string;

   /**
    * Editorial team key
    */
   editorialTeamKey?: string;

   /**
    * Editorial team full name
    */
   editorialTeamFullName?: string;

   /**
    * Editorial team abbreviation
    */
   editorialTeamAbbr?: string;

   /**
    * Bye week (for NFL)
    */
   byeWeek?: number;

   /**
    * Uniform number
    */
   uniformNumber?: string;

   /**
    * Display position
    */
   displayPosition: string;

   /**
    * Headshot URL
    */
   headshotUrl?: string;

   /**
    * Image URL
    */
   imageUrl?: string;

   /**
    * Is undroppable
    */
   isUndroppable?: boolean;

   /**
    * Position type
    */
   positionType?: string;

   /**
    * Primary position
    */
   primaryPosition?: string;

   /**
    * Eligible positions
    */
   eligiblePositions?: string[];

   /**
    * Has player notes
    */
   hasPlayerNotes?: boolean;

   /**
    * Has recent player notes
    */
   hasRecentPlayerNotes?: boolean;

   /**
    * Injury status
    */
   injuryNote?: string;

   /**
    * Player stats (if requested)
    */
   stats?: PlayerStats;

   /**
    * Ownership info (if requested)
    */
   ownership?: PlayerOwnership;

   /**
    * Percent owned (league-specific, if requested)
    */
   percentOwned?: PlayerPercentOwned;

   /**
    * Player status in league context
    */
   status?: PlayerStatus;
}

/**
 * Player statistics
 */
export interface PlayerStats {
   /**
    * Coverage type
    */
   coverageType: CoverageType;

   /**
    * Season year
    */
   season?: number;

   /**
    * Week number (for weekly sports)
    */
   week?: number;

   /**
    * Date (YYYY-MM-DD) (for date-based)
    */
   date?: string;

   /**
    * Stats as key-value pairs (stat ID -> value)
    */
   stats: Record<number, string | number>;
}

/**
 * Player ownership information
 */
export interface PlayerOwnership {
   /**
    * Ownership type
    */
   ownershipType: 'team' | 'waivers' | 'freeagents';

   /**
    * Owner team key (if owned)
    */
   ownerTeamKey?: ResourceKey;

   /**
    * Owner team name (if owned)
    */
   ownerTeamName?: string;

   /**
    * Percent owned across all leagues
    */
   percentOwned?: number;
}

/**
 * Player percent owned in league
 */
export interface PlayerPercentOwned {
   /**
    * Coverage type
    */
   coverageType: 'date';

   /**
    * Date (YYYY-MM-DD)
    */
   date: string;

   /**
    * Percent owned
    */
   percentOwned: number;

   /**
    * Delta (change from previous)
    */
   delta?: number;
}

/**
 * Parameters for searching players
 */
export interface SearchPlayersParams extends PaginationParams, SortParams {
   /**
    * Search query (player name)
    */
   search?: string;

   /**
    * Filter by position
    */
   position?: string;

   /**
    * Filter by player status
    */
   status?: PlayerStatus | PlayerStatus[];

   /**
    * Include player stats
    */
   includeStats?: boolean;

   /**
    * Include ownership info
    */
   includeOwnership?: boolean;

   /**
    * Include percent owned
    */
   includePercentOwned?: boolean;

   /**
    * Stats coverage type (if includeStats is true)
    */
   statsCoverageType?: CoverageType;

   /**
    * Stats week (if statsCoverageType is 'week')
    */
   statsWeek?: number;

   /**
    * Stats date (if statsCoverageType is 'date')
    */
   statsDate?: string;
}

/**
 * Parameters for getting player details
 */
export interface GetPlayerParams {
   /**
    * Include player stats
    */
   includeStats?: boolean;

   /**
    * Include ownership info
    */
   includeOwnership?: boolean;

   /**
    * Include percent owned
    */
   includePercentOwned?: boolean;

   /**
    * Stats coverage type
    */
   statsCoverageType?: CoverageType;

   /**
    * Stats week
    */
   statsWeek?: number;

   /**
    * Stats date
    */
   statsDate?: string;
}

/**
 * Parameters for getting player stats
 */
export interface GetPlayerStatsParams {
   /**
    * Coverage type
    */
   coverageType: CoverageType;

   /**
    * Week number (for week coverage)
    */
   week?: number;

   /**
    * Date (YYYY-MM-DD) (for date coverage)
    */
   date?: string;

   /**
    * Season year
    */
   season?: number;
}

/**
 * Player collection response
 */
export interface PlayerCollectionResponse {
   /**
    * Total count of matching players
    */
   count: number;

   /**
    * Players
    */
   players: Player[];
}
