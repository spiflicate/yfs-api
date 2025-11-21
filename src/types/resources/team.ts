/**
 * Team resource types
 * @module
 */

import type { BaseMetadata, ResourceKey } from '../common';

/**
 * Team information
 */
export interface Team extends BaseMetadata {
   /**
    * Team key
    */
   teamKey: ResourceKey;

   /**
    * Team ID
    */
   teamId: string;

   /**
    * Team name
    */
   name: string;

   /**
    * Is owned by current user
    */
   isOwnedByCurrentLogin?: boolean;

   /**
    * League the team belongs to
    */
   league: {
      /**
       * League key
       */
      leagueKey: ResourceKey;

      /**
       * League ID
       */
      leagueId: string;

      /**
       * League name
       */
      name: string;

      /**
       * URL to league page
       */
      url: string;
   };

   /**
    * Waiver priority
    */
   waiverPriority?: number;

   /**
    * Number of moves made
    */
   numberOfMoves?: number;

   /**
    * Number of trades made
    */
   numberOfTrades?: number;

   /**
    * FAAB balance
    */
   faabBalance?: number;

   /**
    * Clinched playoffs
    */
   clinchedPlayoffs?: boolean;

   /**
    * Team logo URL
    */
   teamLogoUrl?: string;

   /**
    * Team managers
    */
   managers?: TeamManager[];

   /**
    * Team stats (if requested)
    */
   stats?: TeamStats;

   /**
    * Team standings (if requested)
    */
   standings?: TeamStandings;

   /**
    * Team roster (if requested)
    */
   roster?: TeamRoster;
}

/**
 * Team manager information
 */
export interface TeamManager {
   /**
    * Manager GUID
    */
   guid: string;

   /**
    * Nickname
    */
   nickname: string;

   /**
    * Email (if available)
    */
   email?: string;

   /**
    * Image URL
    */
   imageUrl?: string;

   /**
    * Is commissioner
    */
   isCommissioner?: boolean;

   /**
    * Is current login
    */
   isCurrentLogin?: boolean;
}

/**
 * Team statistics
 */
export interface TeamStats {
   /**
    * Coverage type
    */
   coverageType: 'season' | 'week' | 'date' | 'lastweek' | 'lastmonth';

   /**
    * Season year
    */
   season?: number;

   /**
    * Week number (for weekly sports)
    */
   week?: number;

   /**
    * Date (YYYY-MM-DD) (for date-based sports)
    */
   date?: string;

   /**
    * Stats as key-value pairs (stat ID -> value)
    */
   stats: Record<number, string | number>;
}

/**
 * Team standings information
 */
export interface TeamStandings {
   /**
    * Rank
    */
   rank: number;

   /**
    * Playoff seed
    */
   playoffSeed?: number;

   /**
    * Outcome totals (for head-to-head)
    */
   outcomeTotals?: {
      wins: number;
      losses: number;
      ties: number;
      percentage: number;
   };

   /**
    * Points (for points leagues)
    */
   points?: number;

   /**
    * Points change (compared to previous period)
    */
   pointsChange?: number;

   /**
    * Team points (for roto)
    */
   teamPoints?: {
      total: number;
   };

   /**
    * Streak
    */
   streak?: {
      type: 'win' | 'loss' | 'tie';
      value: number;
   };
}

/**
 * Team roster
 */
export interface TeamRoster {
   /**
    * Coverage type
    */
   coverageType?: 'date' | 'week' | 'season';

   /**
    * Date (YYYY-MM-DD) for date-based rosters
    */
   date?: string;

   /**
    * Week number for week-based rosters
    */
   week?: number;

   /**
    * Is editable
    */
   isEditable?: boolean;

   /**
    * Roster entries (players)
    */
   players: RosterPlayer[];
}

/**
 * Player on a team's roster
 */
export interface RosterPlayer {
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
    * Editorial player key (for news)
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
    * Selected position in roster
    */
   selectedPosition: {
      /**
       * Position code
       */
      position: string;

      /**
       * Coverage type
       */
      coverageType?: string;

      /**
       * Date (for date-based)
       */
      date?: string;

      /**
       * Week (for week-based)
       */
      week?: number;
   };

   /**
    * Player stats (if requested)
    */
   stats?: {
      coverageType: string;
      season?: number;
      week?: number;
      date?: string;
      stats: Record<number, string | number>;
   };

   /**
    * Player URL
    */
   url: string;
}

/**
 * Parameters for getting team
 */
export interface GetTeamParams {
   /**
    * Include team stats
    */
   includeStats?: boolean;

   /**
    * Include team standings
    */
   includeStandings?: boolean;

   /**
    * Include team roster
    */
   includeRoster?: boolean;
}

/**
 * Parameters for getting team roster
 */
export interface GetTeamRosterParams {
   /**
    * Date (YYYY-MM-DD) for date-based rosters
    */
   date?: string;

   /**
    * Week number for week-based rosters
    */
   week?: number;

   /**
    * Include player stats
    */
   includeStats?: boolean;
}

/**
 * Parameters for getting team stats
 */
export interface GetTeamStatsParams {
   /**
    * Coverage type
    */
   coverageType?: 'season' | 'week' | 'date' | 'lastweek' | 'lastmonth';

   /**
    * Week number
    */
   week?: number;

   /**
    * Date (YYYY-MM-DD)
    */
   date?: string;
}

/**
 * Parameters for getting team matchups
 */
export interface GetTeamMatchupsParams {
   /**
    * Week number(s)
    */
   weeks?: number | number[];
}

/**
 * Roster change request
 */
export interface RosterChangeRequest {
   /**
    * Coverage type
    */
   coverageType: 'date' | 'week';

   /**
    * Date (YYYY-MM-DD) for date-based
    */
   date?: string;

   /**
    * Week number for week-based
    */
   week?: number;

   /**
    * Player position changes
    */
   players: Array<{
      /**
       * Player key
       */
      playerKey: ResourceKey;

      /**
       * New position
       */
      position: string;
   }>;
}

/**
 * Roster change response
 */
export interface RosterChangeResponse {
   /**
    * Success status
    */
   success: boolean;

   /**
    * Team key
    */
   teamKey: ResourceKey;

   /**
    * Updated roster
    */
   roster?: TeamRoster;

   /**
    * Error message (if failed)
    */
   error?: string;
}
