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

export { OAuth2Client, type OAuth2Tokens } from './auth/oauth2.js';
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
} from './client/errors.js';
export type { Config, TokenStorage } from './client/yahoo.js';
// Export client
export { YahooFantasySportsClient as YahooFantasyClient } from './client/yahoo.js';
// Export all types
// Resource types
// NHL-specific types
export type {
   BaseMetadata,
   CoverageType,
   DateRangeParams,
   DraftStatus,
   GameCode,
   NHLPositionType,
   PaginationParams,
   PlayerStatus,
   PositionType,
   ResourceKey,
   ScoringType,
   SortParams,
   StatValue,
   TransactionStatus,
   TransactionType,
} from './domain/index';
export type * from './domain/normalized.js';
export {
   type RosterMove,
   RosterMoveBuilder,
   type RosterMovePayload,
} from './resources/builders/roster-move-builder.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
