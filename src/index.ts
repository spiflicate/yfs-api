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
 * const teams = await client.request().users().useLogin().games().teams().execute();
 *
 * // Query a roster
 * const roster = await client.request().team('423.l.12345.t.1').roster().execute();
 *
 * // Query league settings
 * const settings = await client.request().league('423.l.12345').settings().execute();
 * ```
 */

export {
   createRequest,
   RequestBuilder,
   type RootRequestBuilder,
} from './builders/index.js';
export { TransactionBuilder } from './builders/transaction.js';
export { OAuth2Client, type OAuth2Tokens } from './client/OAuth2Client.js';
export type { TokenStorage } from './client/YahooFantasyClient.js';
// Export client
export { YahooFantasyClient } from './client/YahooFantasyClient.js';
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
} from './types/index.js';
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
} from './types/index.js';
export {
   CoverageTypeFilter,
   CoverageTypeParam,
   GameSubResource,
   LeagueSubResource,
   PlayerStatusFilter,
   PlayerStatusParam,
   PlayerSubResource,
   SortFilter,
   SortParam,
   TeamSubResource,
   TransactionTypeFilter,
   TransactionTypeParam,
} from './types/request/filters.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
