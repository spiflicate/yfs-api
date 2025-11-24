/**
 * NHL-specific types for fantasy hockey
 * @module
 */

/**
 * NHL roster positions
 */
export type NHLPosition =
   | 'C' // Center
   | 'LW' // Left Wing
   | 'RW' // Right Wing
   | 'D' // Defense
   | 'UTIL' // Utility
   | 'G' // Goalie
   | 'BN' // Bench
   | 'IR' // Injured Reserve
   | 'IR+'; // Injured Reserve Plus

/**
 * NHL position categories for roster requirements
 */
export type NHLPositionType = 'C' | 'W' | 'D' | 'G' | 'UTIL';

/**
 * NHL player injury status
 */
export type NHLInjuryStatus =
   | 'IR' // Injured Reserve
   | 'DTD' // Day to Day
   | 'O' // Out
   | 'Suspension'
   | 'NA'
   | '';

/**
 * NHL skater stat IDs used by Yahoo
 */
export type NHLSkaterStat = keyof typeof NHLSkaterStatEnum;

export const NHLSkaterStatEnum = {
   GamesPlayed: 0,
   GP: 0,
   Goals: 1,
   G: 1,
   Assists: 2,
   A: 2,
   Points: 3,
   P: 3,
   PlusMinus: 4,
   '+/-': 4,
   PenaltyMinutes: 5,
   PIM: 5,
   PowerPlayGoals: 6,
   PPG: 6,
   PowerPlayAssists: 7,
   PPA: 7,
   PowerPlayPoints: 8,
   PPP: 8,
   ShorthandedGoals: 9,
   SHG: 9,
   ShorthandedAssists: 10,
   SHA: 10,
   ShorthandedPoints: 11,
   SHP: 11,
   GameWinningGoals: 12,
   GWG: 12,
   Shots: 13,
   SOG: 13,
   ShootingPercentage: 14,
   'SH%': 14,
   FaceoffsWon: 15,
   FOW: 15,
   FaceoffsLost: 16,
   FOL: 16,
   Hits: 17,
   HIT: 17,
   Blocks: 18,
   BLK: 18,
} as const;

export const NHLSkaterStatIdMap = {
   0: { name: 'GamesPlayed', abbrev: 'GP' },
   1: { name: 'Goals', abbrev: 'G' },
   2: { name: 'Assists', abbrev: 'A' },
   3: { name: 'Points', abbrev: 'P' },
   4: { name: 'PlusMinus', abbrev: '+/-' },
   5: { name: 'PenaltyMinutes', abbrev: 'PIM' },
   6: { name: 'PowerPlayGoals', abbrev: 'PPG' },
   7: { name: 'PowerPlayAssists', abbrev: 'PPA' },
   8: { name: 'PowerPlayPoints', abbrev: 'PPP' },
   9: { name: 'ShorthandedGoals', abbrev: 'SHG' },
   10: { name: 'ShorthandedAssists', abbrev: 'SHA' },
   11: { name: 'ShorthandedPoints', abbrev: 'SHP' },
   12: { name: 'GameWinningGoals', abbrev: 'GWG' },
   13: { name: 'Shots', abbrev: 'SOG' },
   14: { name: 'ShootingPercentage', abbrev: 'SH%' },
   15: { name: 'FaceoffsWon', abbrev: 'FOW' },
   16: { name: 'FaceoffsLost', abbrev: 'FOL' },
   17: { name: 'Hits', abbrev: 'HIT' },
   18: { name: 'Blocks', abbrev: 'BLK' },
} as const;

/**
 * NHL goalie stat IDs used by Yahoo
 */
export type NHLGoalieStat = keyof typeof NHLGoalieStatEnum;

export const NHLGoalieStatEnum = {
   GamesPlayed: 0,
   GP: 0,
   GamesStarted: 19,
   GS: 19,
   Wins: 20,
   W: 20,
   Losses: 21,
   L: 21,
   OvertimeLosses: 22,
   OTL: 22,
   Shutouts: 23,
   SHO: 23,
   GoalsAgainst: 24,
   GA: 24,
   GoalsAgainstAverage: 25,
   GAA: 25,
   Saves: 26,
   SV: 26,
   SavePercentage: 27,
   'SV%': 27,
   ShotsAgainst: 28,
   SA: 28,
} as const;

export const NHLGoalieStatIdMap = {
   0: { name: 'GamesPlayed', abbrev: 'GP' },
   19: { name: 'GamesStarted', abbrev: 'GS' },
   20: { name: 'Wins', abbrev: 'W' },
   21: { name: 'Losses', abbrev: 'L' },
   22: { name: 'OvertimeLosses', abbrev: 'OTL' },
   23: { name: 'Shutouts', abbrev: 'SHO' },
   24: { name: 'GoalsAgainst', abbrev: 'GA' },
   25: { name: 'GoalsAgainstAverage', abbrev: 'GAA' },
   26: { name: 'Saves', abbrev: 'SV' },
   27: { name: 'SavePercentage', abbrev: 'SV%' },
   28: { name: 'ShotsAgainst', abbrev: 'SA' },
} as const;

/**
 * All NHL stats (union of skater and goalie stats)
 */
export type NHLStat = NHLSkaterStat | NHLGoalieStat;

/**
 * NHL scoring category configuration
 */
export interface NHLScoringCategory {
   /** Stat ID */
   statId: number;

   /** Display name */
   displayName: string;

   /** Points per unit (for points leagues) */
   points?: number;

   /** Sort order (for roto leagues) */
   sortOrder?: number;

   /** Position type this stat applies to */
   positionType: 'skater' | 'goalie' | 'both';
}

/**
 * NHL roster slot configuration
 */
export interface NHLRosterSlot {
   /** Position code */
   position: NHLPosition;

   /** Number of slots for this position */
   count: number;

   /** Display name */
   displayName: string;
}

/**
 * NHL player information
 */
export interface NHLPlayer {
   /** Player key */
   playerKey: string;

   /** Player ID */
   playerId: string;

   /** Player name (full) */
   name: string;

   /** First name */
   firstName: string;

   /** Last name */
   lastName: string;

   /** Jersey number */
   uniformNumber?: string;

   /** Display position */
   displayPosition: string;

   /** Eligible positions */
   eligiblePositions: NHLPosition[];

   /** NHL team abbreviation (e.g., "TOR", "BOS") */
   team: string;

   /** Injury status */
   injuryStatus?: NHLInjuryStatus;

   /** Injury note */
   injuryNote?: string;

   /** Headshot URL */
   headshotUrl?: string;

   /** Player page URL */
   url: string;
}

/**
 * NHL team roster entry
 */
export interface NHLRosterEntry {
   /** Player information */
   player: NHLPlayer;

   /** Selected position in roster */
   selectedPosition: NHLPosition;

   /** Date this position assignment is for (YYYY-MM-DD) */
   date?: string;
}

/**
 * NHL stats for a player
 */
export interface NHLPlayerStats {
   /** Coverage type (season, week, date, etc.) */
   coverageType: 'season' | 'date' | 'week' | 'lastweek' | 'lastmonth';

   /** Season year */
   season?: number;

   /** Date (YYYY-MM-DD) if date-based */
   date?: string;

   /** Week number if week-based */
   week?: number;

   /** Stats as key-value pairs (stat ID -> value) */
   stats: Record<number, string | number>;
}

/**
 * NHL game information
 */
export interface NHLGame {
   /** Game key */
   gameKey: string;

   /** Game ID */
   gameId: string;

   /** Season year */
   season: number;

   /** Game code */
   gameCode: 'nhl';

   /** League type */
   type: 'full' | 'pickem-team';

   /** Display name */
   name: string;

   /** Current week (always 1 for NHL) */
   currentWeek: 1;

   /** Is the game available for new leagues */
   isAvailable: boolean;

   /** Season start date */
   seasonStartDate: string;

   /** Season end date */
   seasonEndDate: string;

   /** URL to game page */
   url: string;
}

/**
 * NHL league settings specific to hockey
 */
export interface NHLLeagueSettings {
   /** Roster positions configuration */
   rosterPositions: NHLRosterSlot[];

   /** Scoring categories */
   scoringCategories: NHLScoringCategory[];

   /** Trade deadline date (YYYY-MM-DD) */
   tradeDeadline?: string;

   /** Waiver time (in days) */
   waiverTime?: number;

   /** Waiver type */
   waiverType?: 'FR' | 'FCFS' | 'continual' | 'gametime';

   /** Can't cut list enabled */
   cantCutList?: boolean;

   /** Uses playoff bracket */
   usesPlayoffBracket?: boolean;

   /** Playoff start week */
   playoffStartWeek?: number;

   /** Number of playoff teams */
   numberOfPlayoffTeams?: number;
}
