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
 *   clientId: process.env.YAHOO_CLIENT_ID!,
 *   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
 *   redirectUri: 'https://example.com/callback',
 * });
 *
 * // Get authorization URL
 * const authUrl = client.getAuthUrl();
 * console.log('Visit:', authUrl);
 *
 * // After user authorizes, exchange code for tokens
 * await client.authenticate(code);
 *
 * // Query your NHL teams
 * const teams = await client.api().league('423.l.12345').teams().get();
 *
 * // Query a roster
 * const roster = await client.api().team('423.l.12345.t.1').roster().get();
 *
 * // Query league settings
 * const settings = await client.api().league('423.l.12345').include('settings').get();
 * ```
 */

// Export all types
// Resource types
// NHL-specific types
export type {
   ApiResponse,
   BaseMetadata,
   Config,
   CoverageType,
   DateRangeParams,
   DraftStatus,
   GameCode,
   InferResponseType,
   NHLPositionType,
   PaginationParams,
   PlayerStatus,
   PositionType,
   ResourceKey,
   RosterChangeRequest,
   RouteStage,
   ScoringType,
   SortParams,
   StatValue,
   TransactionStatus,
   TransactionType,
} from '../src/types/index.js';
// Export error types and guards
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
} from '../src/types/index.js';
export {
   CoverageTypeFilter,
   GameSubResource,
   LeagueSubResource,
   PlayerStatusFilter,
   PlayerSubResource,
   SortFilter,
   TeamSubResource,
   TransactionTypeFilter,
} from '../src/types/request/filters.js';
export { OAuth2Client, type OAuth2Tokens } from './auth/oauth2.js';
export type { TokenStorage } from './client/yahoo.js';
// Export client
export { YahooFantasyClient } from './client/yahoo.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
