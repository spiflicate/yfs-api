/**
 * Response Type Mappings
 *
 * Maps query paths to their corresponding response types.
 * This enables type inference based on the query path.
 *
 * @module
 */

import type { Game } from '../responses/game.js';
import type { League } from '../responses/league.js';
import type { Player } from '../responses/player.js';
import type { Team } from '../responses/team.js';
import type { Transaction } from '../responses/transaction.js';
import type { User, UserGame } from '../responses/user.js';
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

type Simplify<T> = {
   [K in keyof T]: T[K];
} & {};

type RequiredProps<T, K extends keyof T> = Simplify<
   Omit<T, K> & {
      [P in K]-?: NonNullable<T[P]>;
   }
>;

interface ResourcePayloadMap {
   game: Game;
   league: League;
   team: Team;
   player: Player;
   transaction: Transaction;
   user: User;
}

export type ResourceWrapperResponse<
   TResource extends keyof ResourcePayloadMap,
   TFragment = unknown,
> = {
   [K in TResource]: Simplify<ResourcePayloadMap[K] & TFragment>;
};

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
export type GameStatCategoriesResponse = ResourceWrapperResponse<
   'game',
   RequiredProps<Game, 'statCategories'>
>;

/**
 * Response for game/position_types sub-resource
 */
export type GamePositionTypesResponse = ResourceWrapperResponse<
   'game',
   RequiredProps<Game, 'positionTypes'>
>;

/**
 * Response for game/game_weeks sub-resource
 */
export type GameGameWeeksResponse = ResourceWrapperResponse<
   'game',
   RequiredProps<Game, 'gameWeeks'>
>;

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
export type LeagueSettingsResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'settings'>
>;

/**
 * Response for league/standings sub-resource
 */
export type LeagueStandingsResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'standings'>
>;

/**
 * Response for league/scoreboard sub-resource
 */
export type LeagueScoreboardResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'scoreboard'>
>;

/**
 * Response for league/teams sub-resource
 */
export type LeagueTeamsResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'teams'>
>;

/**
 * Response for league/players sub-resource
 */
export type LeaguePlayersResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'players'>
>;

/**
 * Response for league/transactions sub-resource
 */
export type LeagueTransactionsResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'transactions'>
>;

/**
 * Response for league/drafts sub-resource
 */
export type LeagueDraftsResponse = ResourceWrapperResponse<
   'league',
   RequiredProps<League, 'drafts'>
>;

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
export type TeamRosterResponse = ResourceWrapperResponse<
   'team',
   RequiredProps<Team, 'roster'>
>;

/**
 * Response for team/roster/players sub-resource
 */
export type TeamRosterPlayersResponse = TeamRosterResponse;

/**
 * Response for team/matchups sub-resource
 */
export type TeamMatchupsResponse = ResourceWrapperResponse<
   'team',
   RequiredProps<Team, 'matchups'>
>;

/**
 * Response for team/standings sub-resource
 */
export type TeamStandingsResponse = ResourceWrapperResponse<
   'team',
   RequiredProps<Team, 'teamStandings'>
>;

/**
 * Response for team/stats sub-resource
 */
export type TeamStatsResponse = ResourceWrapperResponse<
   'team',
   RequiredProps<Team, 'teamStats'>
>;

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
export type PlayerStatsResponse = ResourceWrapperResponse<
   'player',
   RequiredProps<Player, 'playerStats'>
>;

/**
 * Response for player/ownership sub-resource
 */
export type PlayerOwnershipResponse = ResourceWrapperResponse<
   'player',
   RequiredProps<Player, 'ownership'>
>;

/**
 * Response for player/percent_owned sub-resource
 */
export type PlayerPercentOwnedResponse = ResourceWrapperResponse<
   'player',
   RequiredProps<Player, 'percentOwned'>
>;

/**
 * Response for player/draft_analysis sub-resource
 */
export type PlayerDraftAnalysisResponse = ResourceWrapperResponse<
   'player',
   RequiredProps<Player, 'draftAnalysis'>
>;

/**
 * Response for users resource
 */
export type UsersResourceResponse = UserResponse;
export type UserResourceResponse = UserResponse;

/**
 * Response for users collection
 */
export type UsersCollectionResponse = UsersResponse;

type UsersWrapperResponse<TUserFragment = unknown> = {
   users: Array<Simplify<User & TUserFragment>>;
};

type UserGamesWrapperResponse<TGameFragment = unknown> =
   UsersWrapperResponse<{
      games: Array<Simplify<UserGame & TGameFragment>>;
   }>;

/**
 * Response for users/games sub-resource
 */
export type UserGamesResponse = UsersWrapperResponse<
   RequiredProps<User, 'games'>
>;

/**
 * Response for users/games/leagues sub-resource
 */
export type UserGameLeaguesResponse = UserGamesWrapperResponse<
   RequiredProps<UserGame, 'leagues'>
>;

/**
 * Response for users/leagues sub-resource
 */
export type UserLeaguesResponse = UsersWrapperResponse<
   RequiredProps<User, 'leagues'>
>;

/**
 * Response for users/teams sub-resource
 */
export type UserTeamsResponse = UserGamesWrapperResponse<
   RequiredProps<UserGame, 'teams'>
>;

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
   user: UserResourceResponse;
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
   | TeamStandingsResponse
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
   | UserGameLeaguesResponse
   | UserLeaguesResponse
   | UserTeamsResponse
   | TransactionResourceResponse
   | TransactionsCollectionResponse
   | LeagueTransactionsCollectionResponse;
