/**
 * Type exports for Yahoo Fantasy Sports API wrapper
 * @module
 */

// Common types
export type {
   Sport,
   GameCode,
   ResourceKey,
   ScoringType,
   DraftStatus,
   PlayerStatus,
   TransactionType,
   TransactionStatus,
   CoverageType,
   PositionType,
   StatValue,
   BaseMetadata,
   PaginationParams,
   DateRangeParams,
   SortParams,
   ApiResponse,
   Config,
} from './common.js';

// Error types
export {
   YahooFantasyError,
   YahooApiError,
   AuthenticationError,
   RateLimitError,
   NotFoundError,
   ValidationError,
   NetworkError,
   ParseError,
   ConfigError,
   isYahooFantasyError,
   isYahooApiError,
   isAuthenticationError,
   isRateLimitError,
   isValidationError,
} from './errors.js';

// Resource types (to be added as we implement them)
// export type { Game } from './resources/game.js';
// export type { League } from './resources/league.js';
// export type { Team } from './resources/team.js';
// export type { Player } from './resources/player.js';
// export type { Transaction } from './resources/transaction.js';
// export type { User } from './resources/user.js';
// export type { Roster } from './resources/roster.js';

// Sport-specific types (to be added)
// export type { NHLPlayer, NHLStats, NHLPosition } from './sports/nhl.js';
