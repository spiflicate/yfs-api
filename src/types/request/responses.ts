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
import type {
   LeagueReference,
   User,
   UserGame,
   UserTeam,
} from '../responses/user.js';

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

interface CollectionEntityMap {
   games: 'game';
   leagues: 'league';
   teams: 'team';
   players: 'player';
   transactions: 'transaction';
   users: 'user';
}

interface EntityOutPropertyMap {
   game: {
      stat_categories: 'statCategories';
      position_types: 'positionTypes';
      game_weeks: 'gameWeeks';
   };
   league: {
      settings: 'settings';
      standings: 'standings';
      scoreboard: 'scoreboard';
      drafts: 'drafts';
   };
   team: {
      roster: 'roster';
      matchups: 'matchups';
      stats: 'teamStats';
      standings: 'teamStandings';
   };
   player: {
      stats: 'playerStats';
      ownership: 'ownership';
      percent_owned: 'percentOwned';
      draft_analysis: 'draftAnalysis';
   };
}

type ExpandableEntityName = keyof EntityOutPropertyMap;

type OutValueForEntity<TEntity extends ExpandableEntityName> =
   keyof EntityOutPropertyMap[TEntity];

type OutPropsForEntity<
   TEntity extends ExpandableEntityName,
   TOut extends string,
> = Extract<
   EntityOutPropertyMap[TEntity][Extract<TOut, OutValueForEntity<TEntity>>],
   keyof ResourcePayloadMap[TEntity]
>;

type ExpandedEntity<
   TResource extends keyof ResourcePayloadMap,
   TOut extends string = never,
> = TResource extends ExpandableEntityName
   ? [OutPropsForEntity<TResource, TOut>] extends [never]
      ? ResourcePayloadMap[TResource]
      : RequiredProps<
           ResourcePayloadMap[TResource],
           OutPropsForEntity<TResource, TOut>
        >
   : ResourcePayloadMap[TResource];

type OutFragment<
   TEntity extends ExpandableEntityName,
   TOut extends string,
> = [OutPropsForEntity<TEntity, TOut>] extends [never]
   ? Record<never, never>
   : Pick<
        RequiredProps<
           ResourcePayloadMap[TEntity],
           OutPropsForEntity<TEntity, TOut>
        >,
        OutPropsForEntity<TEntity, TOut>
     >;

type ExpandedBaseWithOuts<
   TBase,
   TEntity extends ExpandableEntityName,
   TOut extends string = never,
> = Simplify<TBase & OutFragment<TEntity, TOut>>;

type RequiredArrayProp<T, TKey extends keyof T, TItem> = Simplify<
   Omit<T, TKey> & {
      [P in TKey]-?: TItem[];
   }
>;

export type ResourceResponse<
   TResource extends keyof ResourcePayloadMap,
   TOut extends string = never,
> = {
   [K in TResource]: Simplify<ExpandedEntity<TResource, TOut>>;
};

export type CollectionResponse<
   TCollection extends keyof CollectionEntityMap,
   TOut extends string = never,
> = {
   [K in TCollection]: Array<
      Simplify<ExpandedEntity<CollectionEntityMap[TCollection], TOut>>
   >;
};

export type NestedResourceCollectionResponse<
   TParent extends keyof ResourcePayloadMap,
   TCollectionKey extends Extract<
      keyof ResourcePayloadMap[TParent],
      string
   >,
   TItemResource extends keyof ResourcePayloadMap,
   TOut extends string = never,
> = {
   [K in TParent]: RequiredArrayProp<
      ResourcePayloadMap[TParent],
      TCollectionKey,
      Simplify<ExpandedEntity<TItemResource, TOut>>
   >;
};

type UsersGamesWrapperResponse = {
   users: Array<Simplify<RequiredArrayProp<User, 'games', UserGame>>>;
};

type UsersGameCollectionWrapperResponse<
   TProperty extends 'teams' | 'leagues',
   TItemResource extends 'team' | 'league',
   TOut extends string = never,
> = {
   users: Array<
      Simplify<
         RequiredArrayProp<
            User,
            'games',
            Simplify<
               RequiredArrayProp<
                  UserGame,
                  TProperty,
                  TItemResource extends 'team'
                     ? ExpandedBaseWithOuts<UserTeam, 'team', TOut>
                     : ExpandedBaseWithOuts<LeagueReference, 'league', TOut>
               >
            >
         >
      >
   >;
};

type UsersCollectionWrapperResponse<
   TProperty extends 'leagues',
   TOut extends string = never,
> = {
   users: Array<
      Simplify<
         RequiredArrayProp<
            User,
            TProperty,
            ExpandedBaseWithOuts<LeagueReference, 'league', TOut>
         >
      >
   >;
};

/**
 * Response for game resource
 */
export type GameResourceResponse = ResourceResponse<'game'>;

/**
 * Response for games collection
 */
export type GamesCollectionResponse = CollectionResponse<'games'>;

/**
 * Response for game/leagues sub-resource
 */
export type GameLeaguesResponse = CollectionResponse<'leagues'>;

/**
 * Response for game/players sub-resource
 */
export type GamePlayersResponse = CollectionResponse<'players'>;

/**
 * Response for game/stat_categories sub-resource
 */
export type GameStatCategoriesResponse = ResourceResponse<
   'game',
   'stat_categories'
>;

/**
 * Response for game/position_types sub-resource
 */
export type GamePositionTypesResponse = ResourceResponse<
   'game',
   'position_types'
>;

/**
 * Response for game/game_weeks sub-resource
 */
export type GameGameWeeksResponse = ResourceResponse<'game', 'game_weeks'>;

/**
 * Response for league resource
 */
export type LeagueResourceResponse = ResourceResponse<'league'>;

/**
 * Response for leagues collection
 */
export type LeaguesCollectionResponse = CollectionResponse<'leagues'>;

/**
 * Response for league/settings sub-resource
 */
export type LeagueSettingsResponse = ResourceResponse<'league', 'settings'>;

/**
 * Response for league/standings sub-resource
 */
export type LeagueStandingsResponse = ResourceResponse<
   'league',
   'standings'
>;

/**
 * Response for league/scoreboard sub-resource
 */
export type LeagueScoreboardResponse = ResourceResponse<
   'league',
   'scoreboard'
>;

/**
 * Response for league/teams sub-resource
 */
export type LeagueTeamsResponse = NestedResourceCollectionResponse<
   'league',
   'teams',
   'team'
>;

/**
 * Response for league/players sub-resource
 */
export type LeaguePlayersResponse = NestedResourceCollectionResponse<
   'league',
   'players',
   'player'
>;

/**
 * Response for league/transactions sub-resource
 */
export type LeagueTransactionsResponse = NestedResourceCollectionResponse<
   'league',
   'transactions',
   'transaction'
>;

/**
 * Response for league/drafts sub-resource
 */
export type LeagueDraftsResponse = ResourceResponse<'league', 'drafts'>;

/**
 * Response for team resource
 */
export type TeamResourceResponse = ResourceResponse<'team'>;

/**
 * Response for teams collection
 */
export type TeamsCollectionResponse = CollectionResponse<'teams'>;

/**
 * Response for team/roster sub-resource
 */
export type TeamRosterResponse = ResourceResponse<'team', 'roster'>;

/**
 * Response for team/roster/players sub-resource
 */
export type TeamRosterPlayersResponse = TeamRosterResponse;

/**
 * Response for team/matchups sub-resource
 */
export type TeamMatchupsResponse = ResourceResponse<'team', 'matchups'>;

/**
 * Response for team/standings sub-resource
 */
export type TeamStandingsResponse = ResourceResponse<'team', 'standings'>;

/**
 * Response for team/stats sub-resource
 */
export type TeamStatsResponse = ResourceResponse<'team', 'stats'>;

/**
 * Response for player resource
 */
export type PlayerResourceResponse = ResourceResponse<'player'>;

/**
 * Response for players collection
 */
export type PlayersCollectionResponse = CollectionResponse<'players'>;

/**
 * Response for player/stats sub-resource
 */
export type PlayerStatsResponse = ResourceResponse<'player', 'stats'>;

/**
 * Response for player/ownership sub-resource
 */
export type PlayerOwnershipResponse = ResourceResponse<
   'player',
   'ownership'
>;

/**
 * Response for player/percent_owned sub-resource
 */
export type PlayerPercentOwnedResponse = ResourceResponse<
   'player',
   'percent_owned'
>;

/**
 * Response for player/draft_analysis sub-resource
 */
export type PlayerDraftAnalysisResponse = ResourceResponse<
   'player',
   'draft_analysis'
>;

/**
 * Response for users collection
 */
export type UsersCollectionResponse = CollectionResponse<'users'>;

/**
 * Response for users/games sub-resource
 */
export type UserGamesResponse = UsersGamesWrapperResponse;

/**
 * Response for users/games/leagues sub-resource
 */
export type UserGameLeaguesResponse<TLeagueOut extends string = never> =
   UsersGameCollectionWrapperResponse<'leagues', 'league', TLeagueOut>;

/**
 * Response for users/leagues sub-resource
 */
export type UserLeaguesResponse<TLeagueOut extends string = never> =
   UsersCollectionWrapperResponse<'leagues', TLeagueOut>;

/**
 * Response for users/teams sub-resource
 */
export type UserTeamsResponse<TTeamOut extends string = never> =
   UsersGameCollectionWrapperResponse<'teams', 'team', TTeamOut>;

/**
 * Response for transaction resource
 */
export type TransactionResourceResponse = ResourceResponse<'transaction'>;

/**
 * Response for transactions collection
 */
export type TransactionsCollectionResponse =
   CollectionResponse<'transactions'>;

export type ExpandedStageResponse<
   TStage extends string,
   TOut extends string = never,
> = TStage extends 'game'
   ? ResourceResponse<'game', TOut>
   : TStage extends 'league'
     ? ResourceResponse<'league', TOut>
     : TStage extends 'team'
       ? ResourceResponse<'team', TOut>
       : TStage extends 'player'
         ? ResourceResponse<'player', TOut>
         : TStage extends 'transaction'
           ? TransactionResourceResponse
           : TStage extends 'users'
             ? UsersCollectionResponse
             : TStage extends 'games'
               ? CollectionResponse<'games', TOut>
               : TStage extends 'game.leagues'
                 ? CollectionResponse<'leagues', TOut>
                 : TStage extends 'game.players'
                   ? CollectionResponse<'players'>
                   : TStage extends 'game.stat_categories'
                     ? GameStatCategoriesResponse
                     : TStage extends 'game.position_types'
                       ? GamePositionTypesResponse
                       : TStage extends 'game.game_weeks'
                         ? GameGameWeeksResponse
                         : TStage extends 'league.settings'
                           ? LeagueSettingsResponse
                           : TStage extends 'league.standings'
                             ? LeagueStandingsResponse
                             : TStage extends 'league.scoreboard'
                               ? LeagueScoreboardResponse
                               : TStage extends 'league.teams'
                                 ? NestedResourceCollectionResponse<
                                      'league',
                                      'teams',
                                      'team',
                                      TOut
                                   >
                                 : TStage extends 'league.players'
                                   ? NestedResourceCollectionResponse<
                                        'league',
                                        'players',
                                        'player'
                                     >
                                   : TStage extends 'league.transactions'
                                     ? NestedResourceCollectionResponse<
                                          'league',
                                          'transactions',
                                          'transaction'
                                       >
                                     : TStage extends 'league.drafts'
                                       ? LeagueDraftsResponse
                                       : TStage extends 'team.roster'
                                         ? TeamRosterResponse
                                         : TStage extends 'team.roster.players'
                                           ? TeamRosterPlayersResponse
                                           : TStage extends 'team.matchups'
                                             ? TeamMatchupsResponse
                                             : TStage extends 'team.stats'
                                               ? TeamStatsResponse
                                               : TStage extends 'team.standings'
                                                 ? TeamStandingsResponse
                                                 : TStage extends 'player.stats'
                                                   ? PlayerStatsResponse
                                                   : TStage extends 'player.ownership'
                                                     ? PlayerOwnershipResponse
                                                     : TStage extends 'player.percent_owned'
                                                       ? PlayerPercentOwnedResponse
                                                       : TStage extends 'player.draft_analysis'
                                                         ? PlayerDraftAnalysisResponse
                                                         : TStage extends 'users.games'
                                                           ? UserGamesResponse
                                                           : TStage extends 'users.leagues'
                                                             ? UserLeaguesResponse<TOut>
                                                             : TStage extends 'users.teams'
                                                               ? UserTeamsResponse<TOut>
                                                               : TStage extends 'users.games.leagues'
                                                                 ? UserGameLeaguesResponse<TOut>
                                                                 : TStage extends 'users.games.teams'
                                                                   ? UserTeamsResponse<TOut>
                                                                   : never;

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
   | UsersCollectionResponse
   | UserGamesResponse
   | UserGameLeaguesResponse
   | UserLeaguesResponse
   | UserTeamsResponse
   | TransactionResourceResponse
   | TransactionsCollectionResponse;
