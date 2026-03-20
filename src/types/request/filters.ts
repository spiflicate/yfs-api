/**
 * Filter and Out Types
 *
 * Defines typed filters and out selections for Yahoo Fantasy API requests.
 * Provides const-object value sets for autocomplete while allowing string fallback for ease of use.
 *
 * @module
 */

import type { ResourceKey } from '../common.js';

/**
 * Player status in league context
 */
export const PlayerStatusFilter = {
   Available: 'A',
   FreeAgent: 'FA',
   Waivers: 'W',
   Taken: 'T',
   Keep: 'K',
} as const;

export type PlayerStatusFilter =
   (typeof PlayerStatusFilter)[keyof typeof PlayerStatusFilter];

/**
 * Coverage type for stats
 */
export const CoverageTypeFilter = {
   Season: 'season',
   Week: 'week',
   Date: 'date',
   LastWeek: 'lastweek',
   LastMonth: 'lastmonth',
} as const;

export type CoverageTypeFilter =
   (typeof CoverageTypeFilter)[keyof typeof CoverageTypeFilter];

/**
 * Sort options for player queries
 * Common stat IDs and special values
 */
export const SortFilter = {
   ActualRank: 'AR',
   ProjectedRank: 'PR',
   Points: 'PTS',
   PercentOwned: 'PO',
   PercentStarted: 'PS',
   PlusMinus: '3',
   Goals: '4',
   Assists: '5',
   PenaltyMinutes: '7',
   PowerPlayPoints: '18',
   ShotsOnGoal: '2',
   FaceoffWins: '74',
   Hits: '12',
   Blocks: '16',
   PassingYards: '4',
   PassingTDs: '5',
   RushYards: '8',
   RushTDs: '9',
   Receptions: '11',
   ReceivingYards: '12',
   ReceivingTDs: '13',
   QBR: '65',
   FantasyPoints: '60',
} as const;

export type SortFilter = (typeof SortFilter)[keyof typeof SortFilter];

/**
 * Transaction type filter
 */
export const TransactionTypeFilter = {
   Add: 'add',
   Drop: 'drop',
   AddDrop: 'add/drop',
   Trade: 'trade',
   PendingTrade: 'pending_trade',
   Waiver: 'waiver',
   Commish: 'commish',
} as const;

export type TransactionTypeFilter =
   (typeof TransactionTypeFilter)[keyof typeof TransactionTypeFilter];

/**
 * League sub-resources that can be requested via 'out' parameter
 */
export const LeagueSubResource = {
   Settings: 'settings',
   Standings: 'standings',
   Scoreboard: 'scoreboard',
   Teams: 'teams',
   Players: 'players',
   Transactions: 'transactions',
   Drafts: 'drafts',
} as const;

export type LeagueSubResource =
   (typeof LeagueSubResource)[keyof typeof LeagueSubResource];

/**
 * Team sub-resources that can be requested via 'out' parameter
 */
export const TeamSubResource = {
   Roster: 'roster',
   Matchups: 'matchups',
   Stats: 'stats',
   Standings: 'standings',
} as const;

export type TeamSubResource =
   (typeof TeamSubResource)[keyof typeof TeamSubResource];

/**
 * Game sub-resources that can be requested via 'out' parameter
 */
export const GameSubResource = {
   Leagues: 'leagues',
   Players: 'players',
   StatCategories: 'stat_categories',
   PositionTypes: 'position_types',
   GameWeeks: 'game_weeks',
} as const;

export type GameSubResource =
   (typeof GameSubResource)[keyof typeof GameSubResource];

/**
 * Player sub-resources that can be requested via 'out' parameter
 */
export const PlayerSubResource = {
   Stats: 'stats',
   Ownership: 'ownership',
   PercentOwned: 'percent_owned',
   DraftAnalysis: 'draft_analysis',
} as const;

export type PlayerSubResource =
   (typeof PlayerSubResource)[keyof typeof PlayerSubResource];

/**
 * Filter value that can be either an enum value or a raw string
 * Provides autocomplete from enum while allowing arbitrary strings
 */
export type FilterValue<T extends string = string> = T | string;

/**
 * Record of filters for a request.
 * Keys are filter names, values can be strings or arrays.
 */
export interface RequestFilters {
   [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * The explicit out key used for sub-resource selection.
 */
export type OutKey = 'out';

/**
 * Common request filter keys
 */
export type CommonFilterKey =
   | 'sort'
   | 'sort_type'
   | 'sort_season'
   | 'sort_date'
   | 'sort_week'
   | 'league_keys'
   | 'game_keys'
   | 'game_types'
   | 'game_codes'
   | 'team_keys'
   | 'player_keys'
   | 'search'
   | 'start'
   | 'count'
   | 'status'
   | 'position'
   | 'type'
   | 'week'
   | 'date'
   | 'is_available'
   | 'seasons'
   | 'use_login'
   | 'types'
   | 'team_key';

export type CommonParamKey = CommonFilterKey | OutKey;

/**
 * Game-specific filter keys
 */
export type GameFilterKey =
   | 'game_keys'
   | 'is_available'
   | 'game_types'
   | 'game_codes'
   | 'seasons';

export type GameParamKey = GameFilterKey | OutKey;

/**
 * League-specific filter keys
 */
export type LeagueFilterKey = 'league_keys';

export type LeagueParamKey = LeagueFilterKey | OutKey;

/**
 * Team-specific filter keys
 */
export type TeamFilterKey = 'team_keys';

export type TeamParamKey = TeamFilterKey | OutKey;

/**
 * Player-specific filter keys
 */
export type PlayerFilterKey =
   | 'player_keys'
   | 'position'
   | 'status'
   | 'sort'
   | 'count'
   | 'start'
   | 'search'
   | 'week'
   | 'date';

export type PlayerParamKey = PlayerFilterKey;

/**
 * Transaction-specific filter keys
 */
export type TransactionFilterKey =
   | 'type'
   | 'types'
   | 'team_key'
   | 'count'
   | 'start';

export type TransactionParamKey = TransactionFilterKey;

/**
 * All valid filter keys
 */
export type AllFilterKey =
   | CommonFilterKey
   | GameFilterKey
   | LeagueFilterKey
   | TeamFilterKey
   | PlayerFilterKey
   | TransactionFilterKey;

export type AllParamKey = AllFilterKey | OutKey;

/**
 * Request payload for updating a team roster/lineup.
 */
export interface RosterChangeRequest {
   /** Coverage type */
   coverageType: 'date' | 'week';
   /** Date (YYYY-MM-DD) for date-based */
   date?: string;
   /** Week number for week-based */
   week?: number;
   /** Player position changes */
   players: Array<{
      /** Player key */
      playerKey: ResourceKey;
      /** New position */
      position: string;
   }>;
}
