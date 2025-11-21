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
   Sport,
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
export type {
   Game,
   GamePositionType,
   GameStatCategory,
   GameWeek,
   GetGameParams,
   GetGamesParams,
   SearchGamePlayersParams,
} from './resources/game.js';

export type {
   GetLeagueParams,
   GetLeagueScoreboardParams,
   GetLeagueStandingsParams,
   GetLeagueTeamsParams,
   League,
   LeagueScoreboard,
   LeagueSettings,
   LeagueStandings,
   Matchup,
   MatchupStat,
   MatchupTeam,
   RosterPosition,
   StandingsTeam,
   StatCategory,
   StatModifier,
} from './resources/league-old.js';
export type {
   GetPlayerParams,
   GetPlayerStatsParams,
   Player,
   PlayerCollectionResponse,
   PlayerOwnership,
   PlayerPercentOwned,
   PlayerStats,
   SearchPlayersParams,
} from './resources/player.js';
export type {
   GetTeamMatchupsParams,
   GetTeamParams,
   GetTeamRosterParams,
   GetTeamStatsParams,
   RosterChangeRequest,
   RosterChangeResponse,
   RosterPlayer,
   Team,
   TeamManager,
   TeamRoster,
   TeamStandings,
   TeamStats,
} from './resources/team.js';

export type {
   AcceptTradeParams,
   AddDropPlayerParams,
   AllowTradeParams,
   CancelTradeParams,
   DisallowTradeParams,
   EditWaiverClaimParams,
   GetTransactionsParams,
   ProposeTradeParams,
   RejectTradeParams,
   TradeDetails,
   Transaction,
   TransactionPlayer,
   TransactionResponse,
   VoteAgainstTradeParams,
   WaiverClaimParams,
   WaiverDetails,
} from './resources/transaction.js';
// Resource types
export type {
   GetUserGamesParams,
   GetUserTeamsParams,
   User,
   UserGame,
   UserTeam,
} from './resources/user.js';

// Sport-specific types
export type {
   NHLGame,
   NHLGoalieStat,
   NHLInjuryStatus,
   NHLLeagueSettings,
   NHLPlayer,
   NHLPlayerStats,
   NHLPosition,
   NHLPositionType,
   NHLRosterEntry,
   NHLRosterSlot,
   NHLScoringCategory,
   NHLSkaterStat,
   NHLStat,
} from './sports/nhl.js';
