/**
 * Yahoo Fantasy Sports API Wrapper
 *
 * A fully typed TypeScript wrapper for the Yahoo Fantasy Sports API
 * with excellent developer experience.
 *
 * @module yfs-api
 *
 * @example
 * ```typescript
 * import { YahooFantasyClient } from 'yfs-api';
 *
 * const client = new YahooFantasyClient({
 *   clientId: process.env.YAHOO_CLIENT_ID!,
 *   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
 *   redirectUri: 'https://example.com/callback',
 * });
 *
 * const authorization = client.createAuthorizationRequest();
 * // Save authorization.state in the user's server-side session, then
 * // redirect the user to authorization.url.
 *
 * client.validateAuthorizationState(authorization.state, callbackState);
 * await client.authenticate(code);
 *
 * // Nested responses preserve users -> games -> teams.
 * const response = await client.api().users().games(['nhl']).teams([]).get();
 * for (const user of response.users) {
 *   for (const game of user.games ?? []) console.log(game.teams ?? []);
 * }
 *
 * const league = await client
 *   .api()
 *   .league('423.l.12345')
 *   .include('settings')
 *   .get();
 * ```
 */

export {
   OAuth1Client,
   type OAuth1Params,
   type OAuth1SignatureMethod,
} from './auth/oauth1.js';
export {
   type OAuth2AuthorizationRequest,
   OAuth2Client,
   type OAuth2Tokens,
} from './auth/oauth2.js';
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
export type { RequestOptions } from './client/http.js';
export type { Config, TokenStorage } from './client/yahoo.js';
// Export client
export { YahooFantasySportsClient as YahooFantasyClient } from './client/yahoo.js';
export type * from './domain/common.js';
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
} from './domain/index.js';
export type * from './domain/normalized.js';
export {
   type DateString,
   type RosterCoverageOptions,
   type RosterMove,
   RosterMoveBuilder,
   type RosterMovePayload,
} from './resources/builders/roster-move-builder.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
