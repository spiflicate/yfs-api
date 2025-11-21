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
 * // Get your NHL teams
 * const teams = await client.user.getTeams({ gameCode: 'nhl' });
 *
 * // Manage your roster
 * const roster = await client.team.getRoster(teams[0].teamKey);
 *
 * // Update roster positions
 * await client.team.updateRoster(teams[0].teamKey, {
 *   coverageType: 'date',
 *   date: '2024-11-20',
 *   players: [
 *     { playerKey: '423.p.8888', position: 'C' },
 *     { playerKey: '423.p.7777', position: 'LW' },
 *   ],
 * });
 *
 * // Make transactions
 * await client.transaction.addDropPlayer({
 *   teamKey: teams[0].teamKey,
 *   addPlayerKey: '423.p.9999',
 *   dropPlayerKey: '423.p.7777',
 *   faabBid: 15,
 * });
 * ```
 */

export { OAuth2Client, type OAuth2Tokens } from './client/OAuth2Client.js';
// Export main client and related types
export {
   type TokenStorage,
   YahooFantasyClient,
} from './client/YahooFantasyClient.js';
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
   Game,
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
   League,
   LeagueSettings,
   NHLGame,
   NHLGoalieStat,
   NHLInjuryStatus,
   NHLLeagueSettings,
   NHLPlayer,
   NHLPlayerStats,
   NHLPosition,
   NHLPositionType,
   NHLSkaterStat,
   NHLStat,
   PaginationParams,
   Player,
   PlayerStats,
   PlayerStatus,
   PositionType,
   ProposeTradeParams,
   RejectTradeParams,
   ResourceKey,
   RosterPlayer,
   ScoringType,
   SearchGamePlayersParams,
   SearchPlayersParams,
   SortParams,
   Sport,
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
// Export OAuth utilities
export {
   type LocalOAuthServerOptions,
   type OAuthCallbackError,
   type OAuthCallbackResult,
   openBrowser,
   startLocalOAuthServer,
} from './utils/localOAuthServer.js';
// Export XML parsing utilities (only the still-useful ones)
export { parseYahooXML } from './utils/xmlParser.js';
