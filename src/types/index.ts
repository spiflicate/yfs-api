/**
 * Type exports for Yahoo Fantasy Sports API wrapper
 * @module
 */

// Common types
export type {
   ApiResponse,
   BaseMetadata,
   Config,
   CoverageType,
   DateRangeParams,
   DraftStatus,
   GameCode,
   PaginationParams,
   PlayerStatus,
   PositionType,
   ResourceKey,
   ScoringType,
   SortParams,
   StatValue,
   TransactionStatus,
   TransactionType,
} from './common.js';

// Error types
export {
   AuthenticationError,
   ConfigError,
   isAuthenticationError,
   isRateLimitError,
   isValidationError,
   isYahooApiError,
   isYahooFantasyError,
   NetworkError,
   NotFoundError,
   ParseError,
   RateLimitError,
   ValidationError,
   YahooApiError,
   YahooFantasyError,
} from './errors.js';
export type { RosterChangeRequest } from './request/filters.js';
export type { InferResponseType } from './request/response-routes.js';
export type { RouteStage } from './request/schema.js';

// Sport-specific types

export type {
   PlayerPosition as MLBPlayerPosition,
   PositionType as MLBPositionType,
   RosterPosition as MLBRosterPosition,
   StatEnum as MLBStatEnum,
} from './sports/mlb.js';

export type {
   PlayerPosition as NBAPlayerPosition,
   PositionType as NBAPositionType,
   RosterPosition as NBARosterPosition,
   StatEnum as NBAStatEnum,
} from './sports/nba.js';

export type {
   PlayerPosition as NFLPlayerPosition,
   PositionType as NFLPositionType,
   RosterPosition as NFLRosterPosition,
   StatEnum as NFLStatEnum,
} from './sports/nfl.js';

export type {
   GoalieStatEnum as NHLGoalieStatEnum,
   PlayerPosition as NHLPlayerPosition,
   PositionType as NHLPositionType,
   RosterPosition as NHLRosterPosition,
   SkaterStatEnum as NHLSkaterStatEnum,
} from './sports/nhl.js';
