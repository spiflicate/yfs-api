/**
 * Request Context Types
 *
 * Stage-based context metadata for request typing.
 *
 * @module
 */

import type { RequestFilters } from './filters.js';
import type { CollectionName } from './graph.js';
import type { InferResponseType } from './response-routes.js';
import type {
   FilterKeyForStage,
   NavigationMethodNamesForStage,
   OutValueForStage,
   RouteStage,
} from './schema.js';

type ResourceStage = Extract<
   RouteStage,
   'game' | 'league' | 'team' | 'player' | 'transaction'
>;

type StageTerminalSegment<TStage extends RouteStage> =
   TStage extends `${string}.${infer TLast}` ? TLast : TStage;

type StageLastSegment<TStage extends RouteStage> = TStage extends 'root'
   ? 'none'
   : TStage extends ResourceStage
     ? 'resource'
     : StageTerminalSegment<TStage> extends CollectionName
       ? 'collection'
       : 'subResource';

export interface BaseRequestContext<
   TStage extends RouteStage = RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> {
   stage: TStage;
   selectedOut: TSelectedOut[];
   pathSegments: string[];
   filters: RequestFilters;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export type RootRequestContext = BaseRequestContext<'root'> & {
   hasResource: false;
   lastSegment: 'none';
};

export type StageRequestContext<
   TStage extends Exclude<RouteStage, 'root'> = Exclude<RouteStage, 'root'>,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = BaseRequestContext<TStage, TSelectedOut> & {
   hasResource: true;
   lastSegment: StageLastSegment<TStage>;
};

export type RequestContext<
   TStage extends RouteStage = RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = TStage extends 'root'
   ? RootRequestContext
   : StageRequestContext<Exclude<TStage, 'root'>, TSelectedOut>;

export type FilterKeysForContext<T extends RequestContext> =
   FilterKeyForStage<T['stage']>;

type SelectedOutForContext<T extends RequestContext> =
   T extends RequestContext<infer TStage, infer TSelectedOut>
      ? Extract<TSelectedOut, OutValueForStage<TStage>>
      : never;

export type ResponseTypeForContext<T extends RequestContext> =
   InferResponseType<T['stage'], SelectedOutForContext<T>>;

export type CanAddCollection<T extends RequestContext> =
   Extract<
      NavigationMethodNamesForStage<T['stage']>,
      CollectionName
   > extends never
      ? false
      : true;

export type CanAddSubResource<T extends RequestContext> =
   OutValueForStage<T['stage']> extends never ? false : true;

export type CanExecute<T extends RequestContext> = T['stage'] extends 'root'
   ? false
   : true;

export type LastSegmentType<T extends RequestContext> = T['lastSegment'];
