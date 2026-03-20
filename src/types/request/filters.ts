/**
 * Filter and Out Types
 *
 * Defines typed filters and out selections for Yahoo Fantasy API requests.
 * Provides const-object value sets for autocomplete while allowing string fallback for ease of use.
 *
 * @module
 */

import type { ResourceKey } from '../common.js';
import type {
   FilterKeyForStage,
   GameOutValue,
   LeagueOutValue,
   ParamKeyForStage,
   PlayerOutValue,
   RouteStage,
   TeamOutValue,
} from './schema.js';

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

export type CoverageTypeParam = FilterValue<CoverageTypeFilter>;

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

export type SortParam = FilterValue<SortFilter>;

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

export type TransactionTypeParam = FilterValue<TransactionTypeFilter>;

/**
 * League sub-resources that can be requested via 'out' parameter
 */
export const LeagueSubResource = {
   Settings: 'settings',
   Standings: 'standings',
   Scoreboard: 'scoreboard',
   Drafts: 'drafts',
} as const satisfies Record<string, LeagueOutValue>;

export type LeagueSubResource = LeagueOutValue;

/**
 * Team sub-resources that can be requested via 'out' parameter
 */
export const TeamSubResource = {
   Roster: 'roster',
   Matchups: 'matchups',
   Stats: 'stats',
   Standings: 'standings',
} as const satisfies Record<string, TeamOutValue>;

export type TeamSubResource = TeamOutValue;

/**
 * Game sub-resources that can be requested via 'out' parameter
 */
export const GameSubResource = {
   StatCategories: 'stat_categories',
   PositionTypes: 'position_types',
   GameWeeks: 'game_weeks',
} as const satisfies Record<string, GameOutValue>;

export type GameSubResource = GameOutValue;

/**
 * Player sub-resources that can be requested via 'out' parameter
 */
export const PlayerSubResource = {
   Stats: 'stats',
   Ownership: 'ownership',
   PercentOwned: 'percent_owned',
   DraftAnalysis: 'draft_analysis',
} as const satisfies Record<string, PlayerOutValue>;

export type PlayerSubResource = PlayerOutValue;

/**
 * Filter value that can be either an enum value or a raw string
 * Provides autocomplete from enum while allowing arbitrary strings
 */
export type FilterValue<T extends string = string> = T | string;

export type PlayerStatusParam = FilterValue<PlayerStatusFilter>;

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
   FilterKeyForStage<RouteStage>;

export type CommonParamKey = ParamKeyForStage<RouteStage>;

/**
 * Game-specific filter keys
 */
export type GameFilterKey = FilterKeyForStage<'games'>;

export type GameParamKey = ParamKeyForStage<'games'>;

/**
 * League-specific filter keys
 */
export type LeagueFilterKey = FilterKeyForStage<'league'>;

export type LeagueParamKey = ParamKeyForStage<'league'>;

/**
 * Team-specific filter keys
 */
export type TeamFilterKey = FilterKeyForStage<'team'>;

export type TeamParamKey = ParamKeyForStage<'team'>;

/**
 * Player-specific filter keys
 */
export type PlayerFilterKey = FilterKeyForStage<'player'>;

export type PlayerParamKey = ParamKeyForStage<'player'>;

/**
 * Transaction-specific filter keys
 */
export type TransactionFilterKey = FilterKeyForStage<'league.transactions'>;

export type TransactionParamKey = ParamKeyForStage<'league.transactions'>;

/**
 * All valid filter keys
 */
export type AllFilterKey = FilterKeyForStage<RouteStage>;

export type AllParamKey = ParamKeyForStage<RouteStage>;

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
