/**
 * Response Type Mappings
 *
 * Maps query paths to their corresponding response types.
 * This enables type inference based on the query path.
 *
 * @module
 */

import type {
   GameResponse,
   GamesResponse,
   LeagueResponse,
   LeaguesResponse,
   PlayerResponse,
   PlayersResponse,
   TeamResponse,
   TeamsResponse,
   TransactionResponse,
   TransactionsResponse,
   UserResponse,
   UsersResponse,
} from '../responses/wrappers.js';

/**
 * Base response type for fantasy content wrapper
 */
export interface FantasyContentResponse<T> {
   [key: string]: T;
}

/**
 * Response for game resource
 */
export type GameResourceResponse = GameResponse;

/**
 * Response for games collection
 */
export type GamesCollectionResponse = GamesResponse;

/**
 * Response for game/leagues sub-resource
 */
export type GameLeaguesResponse = LeaguesResponse;

/**
 * Response for game/players sub-resource
 */
export type GamePlayersResponse = PlayersResponse;

/**
 * Response for game/stat_categories sub-resource
 */
export interface GameStatCategoriesResponse {
   game: {
      game_key: string;
      stat_categories: {
         stats: Array<{
            stat_id: number;
            name: string;
            display_name: string;
         }>;
      };
   };
}

/**
 * Response for game/position_types sub-resource
 */
export interface GamePositionTypesResponse {
   game: {
      game_key: string;
      position_types: {
         position_type: Array<{
            type: string;
            display_name: string;
         }>;
      };
   };
}

/**
 * Response for game/game_weeks sub-resource
 */
export interface GameGameWeeksResponse {
   game: {
      game_key: string;
      game_weeks: {
         game_week: Array<{
            week: number;
            start_date: string;
            end_date: string;
         }>;
      };
   };
}

/**
 * Response for league resource
 */
export type LeagueResourceResponse = LeagueResponse;

/**
 * Response for leagues collection
 */
export type LeaguesCollectionResponse = LeaguesResponse;

/**
 * Response for league/settings sub-resource
 */
export type LeagueSettingsResponse = LeagueResponse;

/**
 * Response for league/standings sub-resource
 */
export type LeagueStandingsResponse = LeagueResponse;

/**
 * Response for league/scoreboard sub-resource
 */
export type LeagueScoreboardResponse = LeagueResponse;

/**
 * Response for league/teams sub-resource
 */
export type LeagueTeamsResponse = LeagueResponse;

/**
 * Response for league/players sub-resource
 */
export type LeaguePlayersResponse = LeagueResponse;

/**
 * Response for league/transactions sub-resource
 */
export type LeagueTransactionsResponse = LeagueResponse;

/**
 * Response for league/drafts sub-resource
 */
export interface LeagueDraftsResponse {
   league: {
      league_key: string;
      drafts: {
         draft: Array<{
            draft_key: string;
            draft_id: number;
            status: string;
            draft_type: string;
            start_time: number;
            end_time: number;
         }>;
      };
   };
}

/**
 * Response for team resource
 */
export type TeamResourceResponse = TeamResponse;

/**
 * Response for teams collection
 */
export type TeamsCollectionResponse = TeamsResponse;

/**
 * Response for team/roster sub-resource
 */
export type TeamRosterResponse = TeamResponse;

/**
 * Response for team/roster/players sub-resource
 */
export type TeamRosterPlayersResponse = TeamResponse;

/**
 * Response for team/matchups sub-resource
 */
export type TeamMatchupsResponse = TeamResponse;

/**
 * Response for team/stats sub-resource
 */
export type TeamStatsResponse = TeamResponse;

/**
 * Response for player resource
 */
export type PlayerResourceResponse = PlayerResponse;

/**
 * Response for players collection
 */
export type PlayersCollectionResponse = PlayersResponse;

/**
 * Response for player/stats sub-resource
 */
export interface PlayerStatsResponse {
   player: {
      player_key: string;
      player_id: number;
      stats: {
         coverage_type: string;
         season: number;
         stats: Array<{
            stat_id: number;
            value: string | number;
         }>;
      };
   };
}

/**
 * Response for player/ownership sub-resource
 */
export interface PlayerOwnershipResponse {
   player: {
      player_key: string;
      ownership: {
         ownership_type: string;
         owner_team_key: string;
         owner_team_name: string;
         wa_period: number;
         faab_balance: number;
      };
   };
}

/**
 * Response for player/percent_owned sub-resource
 */
export interface PlayerPercentOwnedResponse {
   player: {
      player_key: string;
      percent_owned: {
         coverage_type: string;
         week: number;
         percent_owned: number;
         percent_started: number;
         percent_recommended: number;
      };
   };
}

/**
 * Response for player/draft_analysis sub-resource
 */
export interface PlayerDraftAnalysisResponse {
   player: {
      player_key: string;
      draft_analysis: {
         average_pick: number;
         average_round: number;
         average_cost: number;
         cost: number;
         percentage_owned: number;
         percentage_started: number;
      };
   };
}

/**
 * Response for users resource
 */
export type UsersResourceResponse = UserResponse;

/**
 * Response for users collection
 */
export type UsersCollectionResponse = UsersResponse;

/**
 * Response for users/games sub-resource
 */
export interface UserGamesResponse {
   users: Array<{
      user: UserResponse['user'] & {
         games: {
            game: Array<{
               game_key: string;
               game_id: number;
               name: string;
               code: string;
               type: string;
            }>;
         };
      };
   }>;
}

/**
 * Response for users/leagues sub-resource
 */
export interface UserLeaguesResponse {
   users: Array<{
      user: UserResponse['user'] & {
         leagues: {
            league: Array<{
               league_key: string;
               name: string;
            }>;
         };
      };
   }>;
}

/**
 * Response for users/teams sub-resource
 */
export interface UserTeamsResponse {
   users: Array<{
      user: UserResponse['user'] & {
         teams: {
            team: Array<{
               team_key: string;
               name: string;
            }>;
         };
      };
   }>;
}

/**
 * Response for transaction resource
 */
export type TransactionResourceResponse = TransactionResponse;

/**
 * Response for transactions collection
 */
export type TransactionsCollectionResponse = TransactionsResponse;

/**
 * Response for league/transactions sub-resource
 */
export type LeagueTransactionsCollectionResponse = TransactionsResponse;

/**
 * Map of resource to its response type
 */
export interface ResourceResponseMap {
   game: GameResourceResponse;
   games: GamesCollectionResponse;
   league: LeagueResourceResponse;
   leagues: LeaguesCollectionResponse;
   team: TeamResourceResponse;
   teams: TeamsCollectionResponse;
   player: PlayerResourceResponse;
   players: PlayersCollectionResponse;
   user: UsersResourceResponse;
   users: UsersCollectionResponse;
   transaction: TransactionResourceResponse;
   transactions: TransactionsCollectionResponse;
}

/**
 * All response types for type inference
 * Use this to get the response type for any query path
 */
export type AllResponseTypes =
   | GameResourceResponse
   | GamesCollectionResponse
   | GameLeaguesResponse
   | GamePlayersResponse
   | GameStatCategoriesResponse
   | GamePositionTypesResponse
   | GameGameWeeksResponse
   | LeagueResourceResponse
   | LeaguesCollectionResponse
   | LeagueSettingsResponse
   | LeagueStandingsResponse
   | LeagueScoreboardResponse
   | LeagueTeamsResponse
   | LeaguePlayersResponse
   | LeagueTransactionsResponse
   | LeagueDraftsResponse
   | TeamResourceResponse
   | TeamsCollectionResponse
   | TeamRosterResponse
   | TeamRosterPlayersResponse
   | TeamMatchupsResponse
   | TeamStatsResponse
   | PlayerResourceResponse
   | PlayersCollectionResponse
   | PlayerStatsResponse
   | PlayerOwnershipResponse
   | PlayerPercentOwnedResponse
   | PlayerDraftAnalysisResponse
   | UsersResourceResponse
   | UsersCollectionResponse
   | UserGamesResponse
   | UserLeaguesResponse
   | UserTeamsResponse
   | TransactionResourceResponse
   | TransactionsCollectionResponse
   | LeagueTransactionsCollectionResponse;
