/**
 * Request Graph Type Definitions
 *
 * Shared request graph names and key-like types.
 * Request metadata is derived from the central RouteSchema.
 *
 * @module
 */

import type {
   GameKey,
   LeagueKey,
   PendingTradeKey,
   PlayerKey,
   ResourceKey,
   TeamKey,
   TransactionKey,
   WaiverClaimKey,
} from '../common.js';
import type { InferResponseType } from './response-routes.js';
import type {
   FilterKeyForStage,
   NavigationMethodNamesForStage,
   OutValueForStage,
   RouteStage,
} from './schema.js';

export type {
   GameKey,
   LeagueKey,
   PendingTradeKey,
   PlayerKey,
   ResourceKey,
   TeamKey,
   TransactionKey,
   WaiverClaimKey,
} from '../common.js';

type WithString<T> = T | (string & {});

export type GameKeyLike = WithString<GameKey>;
export type LeagueKeyLike = WithString<LeagueKey>;
export type TeamKeyLike = WithString<TeamKey>;
export type PlayerKeyLike = WithString<PlayerKey>;
export type TransactionKeyLike = WithString<TransactionKey>;
export type WaiverClaimKeyLike = WithString<WaiverClaimKey>;
export type PendingTradeKeyLike = WithString<PendingTradeKey>;
export type ResourceKeyLike = WithString<ResourceKey>;

export type ResourceName =
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'user'
   | 'transaction';

export type CollectionName =
   | 'games'
   | 'leagues'
   | 'teams'
   | 'players'
   | 'users'
   | 'transactions';

export type SubResourceName =
   | 'draft_analysis'
   | 'draftresults'
   | 'drafts'
   | 'game_weeks'
   | 'leagues'
   | 'matchups'
   | 'metadata'
   | 'ownership'
   | 'percent_owned'
   | 'players'
   | 'position_types'
   | 'roster'
   | 'scoreboard'
   | 'settings'
   | 'standings'
   | 'stat_categories'
   | 'stats'
   | 'teams'
   | 'transactions';

type ResourceStageMap = {
   game: 'game';
   league: 'league';
   team: 'team';
   player: 'player';
   user: 'users';
   transaction: 'transaction';
};

type ResourceStage<T extends ResourceName> = ResourceStageMap[T];

export interface ResourceDefinition<
   TKey extends string,
   TCollections extends CollectionName,
   TSubResources extends SubResourceName,
   TFilters extends string,
   TResponse,
> {
   resource: TKey;
   collections: TCollections[];
   subResources: TSubResources[];
   filters: TFilters[];
   responseType: TResponse;
}

type ResourceCollections<TStage extends RouteStage> = Extract<
   NavigationMethodNamesForStage<TStage>,
   CollectionName
>;

type DerivedResourceDefinition<
   TName extends ResourceName,
   TStage extends RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = ResourceDefinition<
   TName,
   ResourceCollections<TStage>,
   OutValueForStage<TStage>,
   FilterKeyForStage<TStage>,
   InferResponseType<TStage, TSelectedOut>
>;

export type GetResourceDef<
   T extends ResourceName,
   TSelectedOut extends GetSubResources<T> = never,
> = DerivedResourceDefinition<T, ResourceStage<T>, TSelectedOut>;

export type GetCollections<T extends ResourceName> =
   GetResourceDef<T>['collections'][number];

export type GetSubResources<T extends ResourceName> =
   GetResourceDef<T>['subResources'][number];

export type GetFilters<T extends ResourceName> =
   GetResourceDef<T>['filters'][number];

export type GetResponseType<
   T extends ResourceName,
   TSelectedOut extends GetSubResources<T> = never,
> = GetResourceDef<T, TSelectedOut>['responseType'];
