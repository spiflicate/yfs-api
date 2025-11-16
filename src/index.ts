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
export { OAuth2Client, type OAuth2Tokens } from './client/OAuth2Client.js';

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

// Resource types
export type {
   User,
   UserGame,
   UserTeam,
   GetUserGamesParams,
   GetUserTeamsParams,
   League,
   LeagueSettings,
   GetLeagueParams,
   Team,
   TeamRoster,
   RosterPlayer,
   GetTeamParams,
   GetTeamRosterParams,
   Player,
   PlayerStats,
   SearchPlayersParams,
   GetPlayerParams,
   Transaction,
   TransactionPlayer,
   GetTransactionsParams,
   AddDropPlayerParams,
   WaiverClaimParams,
   ProposeTradeParams,
   AcceptTradeParams,
   RejectTradeParams,
   CancelTradeParams,
   AllowTradeParams,
   DisallowTradeParams,
   VoteAgainstTradeParams,
   EditWaiverClaimParams,
   TransactionResponse,
   Game,
   GetGameParams,
   GetGamesParams,
   SearchGamePlayersParams,
   GameWeek,
   GameStatCategory,
   GamePositionType,
} from './types/index.js';

// NHL-specific types
export type {
   NHLPosition,
   NHLPositionType,
   NHLInjuryStatus,
   NHLSkaterStat,
   NHLGoalieStat,
   NHLStat,
   NHLPlayer,
   NHLPlayerStats,
   NHLGame,
   NHLLeagueSettings,
} from './types/index.js';
