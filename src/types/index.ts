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

// Resource types
export type {
   User,
   UserGame,
   UserTeam,
   GetUserGamesParams,
   GetUserTeamsParams,
} from './resources/user.js';

export type {
   League,
   LeagueSettings,
   RosterPosition,
   StatCategory,
   StatModifier,
   LeagueStandings,
   StandingsTeam,
   LeagueScoreboard,
   Matchup,
   MatchupTeam,
   MatchupStat,
   GetLeagueParams,
   GetLeagueStandingsParams,
   GetLeagueScoreboardParams,
   GetLeagueTeamsParams,
} from './resources/league.js';

export type {
   Team,
   TeamManager,
   TeamStats,
   TeamStandings,
   TeamRoster,
   RosterPlayer,
   GetTeamParams,
   GetTeamRosterParams,
   GetTeamStatsParams,
   GetTeamMatchupsParams,
   RosterChangeRequest,
   RosterChangeResponse,
} from './resources/team.js';

export type {
   Player,
   PlayerStats,
   PlayerOwnership,
   PlayerPercentOwned,
   SearchPlayersParams,
   GetPlayerParams,
   GetPlayerStatsParams,
   PlayerCollectionResponse,
} from './resources/player.js';

export type {
   Transaction,
   TransactionPlayer,
   WaiverDetails,
   TradeDetails,
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
} from './resources/transaction.js';

export type {
   Game,
   GetGameParams,
   GetGamesParams,
   SearchGamePlayersParams,
   GameWeek,
   GameStatCategory,
   GamePositionType,
} from './resources/game.js';

// Sport-specific types
export type {
   NHLPosition,
   NHLPositionType,
   NHLInjuryStatus,
   NHLSkaterStat,
   NHLGoalieStat,
   NHLStat,
   NHLScoringCategory,
   NHLRosterSlot,
   NHLPlayer,
   NHLRosterEntry,
   NHLPlayerStats,
   NHLGame,
   NHLLeagueSettings,
} from './sports/nhl.js';
