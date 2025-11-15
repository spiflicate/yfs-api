/**
 * Yahoo Fantasy Sports API Wrapper
 *
 * A fully typed TypeScript wrapper for the Yahoo Fantasy Sports API
 * with excellent developer experience.
 *
 * @module yahoo-fantasy-sports
 *
 * @example
 * ```typescript
 * import { YahooFantasyClient } from 'yahoo-fantasy-sports';
 *
 * const client = new YahooFantasyClient({
 *   consumerKey: process.env.YAHOO_CONSUMER_KEY!,
 *   consumerSecret: process.env.YAHOO_CONSUMER_SECRET!,
 * });
 *
 * await client.authenticate();
 *
 * // Get your NHL teams
 * const teams = await client.user.getTeams({ gameCode: 'nhl' });
 *
 * // Manage your roster
 * const roster = await client.team.getRoster(teams[0].teamKey);
 * await client.roster.setLineup({
 *   teamKey: teams[0].teamKey,
 *   date: '2024-11-20',
 *   positions: {
 *     '423.p.8888': 'C',
 *     '423.p.7777': 'LW',
 *   },
 * });
 * ```
 */

// Export main client and related types
export {
   YahooFantasyClient,
   type TokenStorage,
} from './client/YahooFantasyClient.js';
export type { OAuthTokens } from './client/OAuthClient.js';

// Export all types
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
} from './types/index.js';

// Export error types and guards
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
} from './types/index.js';

// Resource types will be exported as they're implemented
// export type { Game } from './types/index.js';
// export type { League } from './types/index.js';
// export type { Team } from './types/index.js';
// export type { Player } from './types/index.js';
// export type { Transaction } from './types/index.js';
// export type { User } from './types/index.js';
// export type { Roster } from './types/index.js';
