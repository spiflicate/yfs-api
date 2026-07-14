/** Shared scalar and request types for Yahoo Fantasy Sports. */

export type GameCode = 'nfl' | 'nhl' | 'mlb' | 'nba';
export type GameType =
   | 'full'
   | 'pickem-team'
   | 'pickem-group'
   | 'pickem-team-list';

export type GameKey = GameCode | `${number}`;
export type LeagueKey = `${GameKey}.l.${number}`;
export type TeamKey = `${GameKey}.l.${number}.t.${number}`;
export type PlayerKey = `${GameKey}.p.${number}`;
export type TransactionKey = `${GameKey}.l.${number}.tr.${number}`;
export type WaiverClaimKey = `${GameKey}.l.${number}.w.c.${number}`;
export type PendingTradeKey = `${GameKey}.l.${number}.pt.${number}`;

export type ResourceKey =
   | GameKey
   | LeagueKey
   | TeamKey
   | PlayerKey
   | TransactionKey
   | WaiverClaimKey
   | PendingTradeKey;

export type ScoringType = 'head' | 'point' | 'roto';
export type DraftStatus = 'predraft' | 'drafting' | 'postdraft';
export type PlayerStatus = 'A' | 'FA' | 'W' | 'T' | 'K';
export type TransactionType =
   | 'add'
   | 'drop'
   | 'add/drop'
   | 'trade'
   | 'pending_trade'
   | 'waiver'
   | 'commish';
export type TransactionStatus =
   | 'successful'
   | 'failed'
   | 'pending'
   | 'proposed'
   | 'accepted'
   | 'rejected'
   | 'cancelled';
export type CoverageType =
   | 'season'
   | 'week'
   | 'date'
   | 'lastweek'
   | 'lastmonth';
export type FeloTier =
   | 'platinum'
   | 'diamond'
   | 'gold'
   | 'silver'
   | 'bronze';

/** Yahoo position codes vary by sport and league configuration. */
export type PositionType = string;
export type StatValue = string | number;

export interface ImageSource {
   url: string;
   size: string;
}

export interface BaseMetadata {
   url: string;
   lastUpdatedTimestamp?: number;
}

export interface PaginationParams {
   start?: number;
   count?: number;
}

export interface DateRangeParams {
   startDate?: string;
   endDate?: string;
}

export interface SortParams {
   sort?: string | number;
   sortOrder?: 'asc' | 'desc';
   sortType?: CoverageType;
}
