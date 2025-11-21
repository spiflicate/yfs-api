/**
 * League resource types
 * @module
 */

import type {
   BaseMetadata,
   DraftStatus,
   GameCode,
   PaginationParams,
   ResourceKey,
   ScoringType,
} from '../common';

/**
 * League information
 */
export interface League extends BaseMetadata {
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
    * Game key this league belongs to
    */
   gameKey: string;

   /**
    * Game code (sport)
    */
   gameCode: GameCode;

   /**
    * Season year
    */
   season: number;

   /**
    * Scoring type
    */
   scoringType: ScoringType;

   /**
    * League type
    */
   leagueType: 'private' | 'public';

   /**
    * Number of teams
    */
   numberOfTeams: number;

   /**
    * Current week (1 for non-weekly sports like NHL)
    */
   currentWeek: number;

   /**
    * Start week
    */
   startWeek?: number;

   /**
    * End week
    */
   endWeek?: number;

   /**
    * Start date (YYYY-MM-DD)
    */
   startDate?: string;

   /**
    * End date (YYYY-MM-DD)
    */
   endDate?: string;

   /**
    * Draft status
    */
   draftStatus: DraftStatus;

   /**
    * Is finished
    */
   isFinished: boolean;

   /**
    * Logo URL
    */
   logoUrl?: string;

   /**
    * Password (if public league with password)
    */
   password?: string;

   /**
    * Renew URL
    */
   renewUrl?: string;

   /**
    * Short invitation URL
    */
   shortInvitationUrl?: string;

   /**
    * Is pro league
    */
   isProLeague?: boolean;

   /**
    * Is cash league
    */
   isCashLeague?: boolean;

   /**
    * League settings (detailed configuration)
    */
   settings?: LeagueSettings;

   /**
    * League standings
    */
   standings?: LeagueStandings;

   /**
    * Scoreboard data
    */
   scoreboard?: LeagueScoreboard;
}

/**
 * League settings
 */
export interface LeagueSettings {
   /**
    * Draft type
    */
   draftType: 'live' | 'offline' | 'autopick';

   /**
    * Is auction draft
    */
   isAuctionDraft: boolean;

   /**
    * Scoring type
    */
   scoringType: ScoringType;

   /**
    * Uses playoff
    */
   usesPlayoff: boolean;

   /**
    * Uses playoff reseeding
    */
   usesPlayoffReseeding?: boolean;

   /**
    * Uses lock eliminated teams
    */
   usesLockEliminatedTeams?: boolean;

   /**
    * Playoff start week/date
    */
   playoffStartWeek?: number;

   /**
    * Number of playoff teams
    */
   numberOfPlayoffTeams?: number;

   /**
    * Has playoff consolation games
    */
   hasPlayoffConsolationGames?: boolean;

   /**
    * Max teams
    */
   maxTeams: number;

   /**
    * Waiver type
    */
   waiverType: 'FR' | 'FCFS' | 'continual' | 'gametime';

   /**
    * Waiver rule
    */
   waiverRule?: 'all' | 'gametime';

   /**
    * Uses FAAB
    */
   usesFaab: boolean;

   /**
    * Draft time (Unix timestamp)
    */
   draftTime?: number;

   /**
    * Post draft players
    */
   postDraftPlayers?: 'W' | 'FA';

   /**
    * Max weekly adds
    */
   maxWeeklyAdds?: number;

   /**
    * Max season adds
    */
   maxSeasonAdds?: number;

   /**
    * Trade end date
    */
   tradeEndDate?: string;

   /**
    * Trade ratify type
    */
   tradeRatifyType?: 'commish' | 'vote' | 'no_review';

   /**
    * Trade reject time (in days)
    */
   tradeRejectTime?: number;

   /**
    * Player pool
    */
   playerPool?: 'ALL' | 'nhl';

   /**
    * Can't cut list
    */
   cantCutList?: 'yahoo' | 'none';

   /**
    * Roster positions
    */
   rosterPositions?: RosterPosition[];

   /**
    * Stat categories
    */
   statCategories?: StatCategory[];

   /**
    * Stat modifiers (for points leagues)
    */
   statModifiers?: StatModifier[];
}

/**
 * Roster position configuration
 */
export interface RosterPosition {
   /**
    * Position code
    */
   position: string;

   /**
    * Position type
    */
   positionType: string;

   /**
    * Number of slots
    */
   count: number;

   /**
    * Display name
    */
   displayName?: string;

   /**
    * Abbreviation
    */
   abbreviation?: string;
}

/**
 * Stat category configuration
 */
export interface StatCategory {
   /**
    * Stat ID
    */
   statId: number;

   /**
    * Enabled for the league
    */
   enabled: boolean;

   /**
    * Display name
    */
   name: string;

   /**
    * Display order/position
    */
   displayOrder?: number;

   /**
    * Sort order (for roto)
    */
   sortOrder?: number;

   /**
    * Position type this applies to
    */
   positionType?: string;
}

/**
 * Stat modifier (for points leagues)
 */
export interface StatModifier {
   /**
    * Stat ID
    */
   statId: number;

   /**
    * Points per unit
    */
   points: number;
}

/**
 * League standings
 */
export interface LeagueStandings {
   /**
    * Teams in order of standings
    */
   teams: StandingsTeam[];
}

/**
 * Team in standings
 */
export interface StandingsTeam {
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
    * Team logo URL
    */
   teamLogoUrl?: string;

   /**
    * Rank
    */
   rank: number;

   /**
    * Playoff seed (if in playoffs)
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
    * Team points (for roto leagues)
    */
   teamPoints?: {
      total: number;
   };

   /**
    * Streak (current winning/losing streak)
    */
   streak?: {
      type: 'win' | 'loss' | 'tie';
      value: number;
   };

   /**
    * Manager info
    */
   managers?: {
      guid: string;
      nickname: string;
   }[];

   /**
    * URL to team page
    */
   url: string;
}

/**
 * League scoreboard
 */
export interface LeagueScoreboard {
   /**
    * Week number (for weekly sports)
    */
   week?: number;

   /**
    * Matchups
    */
   matchups: Matchup[];
}

/**
 * Matchup between two teams
 */
export interface Matchup {
   /**
    * Week number
    */
   week?: number;

   /**
    * Matchup grade (for playoffs)
    */
   matchupGrade?: string;

   /**
    * Winner team key
    */
   winnerTeamKey?: ResourceKey;

   /**
    * Is tied
    */
   isTied?: boolean;

   /**
    * Is playoffs
    */
   isPlayoffs?: boolean;

   /**
    * Is consolation
    */
   isConsolation?: boolean;

   /**
    * Teams in the matchup (usually 2)
    */
   teams: MatchupTeam[];
}

/**
 * Team in a matchup
 */
export interface MatchupTeam {
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
    * Team logo URL
    */
   teamLogoUrl?: string;

   /**
    * Points scored
    */
   points?: number;

   /**
    * Projected points
    */
   projectedPoints?: number;

   /**
    * Team stats for this matchup
    */
   stats?: MatchupStat[];

   /**
    * URL to team page
    */
   url: string;
}

/**
 * Stat in a matchup
 */
export interface MatchupStat {
   /**
    * Stat ID
    */
   statId: number;

   /**
    * Value
    */
   value: string | number;
}

/**
 * Parameters for getting league metadata
 */
export interface GetLeagueParams {
   /**
    * Include settings
    */
   includeSettings?: boolean;

   /**
    * Include standings
    */
   includeStandings?: boolean;

   /**
    * Include scoreboard
    */
   includeScoreboard?: boolean;
}

/**
 * Parameters for getting league standings
 */
export interface GetLeagueStandingsParams {
   /**
    * Week number (for weekly sports)
    */
   week?: number;
}

/**
 * Parameters for getting league scoreboard
 */
export interface GetLeagueScoreboardParams {
   /**
    * Week number (for weekly sports)
    */
   week?: number;
}

/**
 * Parameters for getting league teams
 */
export interface GetLeagueTeamsParams extends PaginationParams {
   /**
    * Include team stats
    */
   includeStats?: boolean;

   /**
    * Include team standings
    */
   includeStandings?: boolean;
}
