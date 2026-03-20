/**
 * Query Context Types
 *
 * Stage-based context metadata for request typing.
 *
 * @module
 */

import type { CollectionName } from './graph.js';
import type { QueryParams } from './params.js';
import type { InferResponseType } from './response-routes.js';
import type {
   FilterKeyForStage,
   NavigationMethodNamesForStage,
   OutValueForStage,
   RouteStage,
} from './schema.js';

type StageLastSegment<TStage extends RouteStage> = TStage extends 'root'
   ? 'none'
   : TStage extends 'game' | 'league' | 'team' | 'player' | 'transaction'
     ? 'resource'
     : TStage extends
            | 'games'
            | 'users'
            | 'game.leagues'
            | 'game.players'
            | 'league.teams'
            | 'league.players'
            | 'league.transactions'
            | 'team.roster.players'
            | 'users.games'
            | 'users.leagues'
            | 'users.teams'
            | 'users.games.leagues'
            | 'users.games.teams'
       ? 'collection'
       : 'subResource';

export interface BaseQueryContext<
   TStage extends RouteStage = RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> {
   stage: TStage;
   selectedOut: TSelectedOut[];
   pathSegments: string[];
   filters: QueryParams;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export type RootQueryContext = BaseQueryContext<'root'> & {
   hasResource: false;
   lastSegment: 'none';
};

export type StageQueryContext<
   TStage extends Exclude<RouteStage, 'root'> = Exclude<RouteStage, 'root'>,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = BaseQueryContext<TStage, TSelectedOut> & {
   hasResource: true;
   lastSegment: StageLastSegment<TStage>;
};

export type QueryContext<
   TStage extends RouteStage = RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = TStage extends 'root'
   ? RootQueryContext
   : StageQueryContext<Exclude<TStage, 'root'>, TSelectedOut>;

export type FilterKeysForContext<T extends QueryContext> =
   FilterKeyForStage<T['stage']>;

type SelectedOutForContext<T extends QueryContext> =
   T extends QueryContext<infer TStage, infer TSelectedOut>
      ? Extract<TSelectedOut, OutValueForStage<TStage>>
      : never;

export type ResponseTypeForContext<T extends QueryContext> =
   InferResponseType<T['stage'], SelectedOutForContext<T>>;

export type CanAddCollection<T extends QueryContext> =
   Extract<
      NavigationMethodNamesForStage<T['stage']>,
      CollectionName
   > extends never
      ? false
      : true;

export type CanAddSubResource<T extends QueryContext> =
   OutValueForStage<T['stage']> extends never ? false : true;

export type CanExecute<T extends QueryContext> = T['stage'] extends 'root'
   ? false
   : true;

export type LastSegmentType<T extends QueryContext> = T['lastSegment'];
