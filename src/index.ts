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
   AcceptTradeParams,
   AddDropPlayerParams,
   AllowTradeParams,
   ApiResponse,
   BaseMetadata,
   CancelTradeParams,
   Config,
   CoverageType,
   DateRangeParams,
   DisallowTradeParams,
   DraftStatus,
   EditWaiverClaimParams,
   GameCode,
   GamePositionType,
   GameStatCategory,
   GameWeek,
   GetGameParams,
   GetGamesParams,
   GetLeagueParams,
   GetPlayerParams,
   GetTeamParams,
   GetTeamRosterParams,
   GetTransactionsParams,
   GetUserGamesParams,
   GetUserTeamsParams,
   InferResponseType,
   League,
   LeagueSettings,
   NHLPositionType,
   PaginationParams,
   Player,
   PlayerStats,
   PlayerStatus,
   PositionType,
   ProposeTradeParams,
   RejectTradeParams,
   ResourceKey,
   RosterPlayer,
   RouteStage,
   ScoringType,
   SearchGamePlayersParams,
   SearchPlayersParams,
   SortParams,
   StatValue,
   Team,
   TeamRoster,
   Transaction,
   TransactionPlayer,
   TransactionResponse,
   TransactionStatus,
   TransactionType,
   User,
   UserGame,
   UserTeam,
   VoteAgainstTradeParams,
   WaiverClaimParams,
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
export type {
   CoverageTypeParam,
   GameSubResource,
   LeagueSubResource,
   PlayerStatusParam,
   PlayerSubResource,
   SortParam,
   TeamSubResource,
   TransactionTypeParam,
} from './types/request/params.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
