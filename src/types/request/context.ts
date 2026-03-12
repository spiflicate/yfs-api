/**
 * Query Context Types
 *
 * Defines the context state at each step of query building.
 * Enables type inference to provide autocomplete and type-safe responses.
 *
 * @module
 */

import type {
   CollectionName,
   ResourceName,
   SubResourceName,
} from './graph.js';
import type { QueryParams } from './params.js';
import type { InferResponseType } from './response-routes.ts';

/**
 * Base interface for all query contexts
 */
export interface BaseQueryContext {
   /** Current path segments as array */
   pathSegments: string[];
   /** Parameters accumulated so far */
   params: QueryParams;
   /** HTTP method (defaults to GET) */
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Root context - starting point for building a query
 * No resources added yet
 */
export interface RootQueryContext extends BaseQueryContext {
   pathSegments: [];
   hasResource: false;
}

/**
 * Context after a resource has been added
 */
export interface ResourceQueryContext<
   TResource extends ResourceName,
   TKey extends string,
> extends BaseQueryContext {
   pathSegments: [TResource, TKey];
   hasResource: true;
   resource: TResource;
   key: TKey;
   lastSegment: 'resource';
}

/**
 * Context after a collection has been added
 */
export interface CollectionQueryContext<
   TResource extends ResourceName,
   TKey extends string,
   TCollection extends CollectionName,
> extends BaseQueryContext {
   pathSegments: [TResource, TKey, TCollection];
   hasResource: true;
   resource: TResource;
   key: TKey;
   collection: TCollection;
   lastSegment: 'collection';
}

/**
 * Context after a sub-resource has been added
 */
export interface SubResourceQueryContext<
   TResource extends ResourceName,
   TKey extends string,
   TSubResource extends SubResourceName,
> extends BaseQueryContext {
   pathSegments: [TResource, TKey, TSubResource];
   hasResource: true;
   resource: TResource;
   key: TKey;
   subResource: TSubResource;
   lastSegment: 'subResource';
}

/**
 * Context after nested collection (e.g., team/roster/players)
 */
export interface NestedCollectionQueryContext<
   TResource extends ResourceName,
   TKey extends string,
   TSubResource extends SubResourceName,
   TCollection extends CollectionName,
> extends BaseQueryContext {
   pathSegments: [TResource, TKey, TSubResource, TCollection];
   hasResource: true;
   resource: TResource;
   key: TKey;
   subResource: TSubResource;
   collection: TCollection;
   lastSegment: 'nestedCollection';
}

/**
 * Union of all possible query contexts
 */
export type QueryContext =
   | RootQueryContext
   | ResourceQueryContext<ResourceName, string>
   | CollectionQueryContext<ResourceName, string, CollectionName>
   | SubResourceQueryContext<ResourceName, string, SubResourceName>
   | NestedCollectionQueryContext<
        ResourceName,
        string,
        SubResourceName,
        CollectionName
     >;

/**
 * Type to build the response type from path segments
 * This is the key type for inferring return types
 */
export type { InferResponseType };

/**
 * Helper type to check if we're at a valid point to add a collection
 */
export type CanAddCollection<T extends QueryContext> =
   T extends ResourceQueryContext<ResourceName, string>
      ? true
      : T extends SubResourceQueryContext<
             ResourceName,
             string,
             'roster' | 'matchups' | 'stats'
          >
        ? true
        : false;

/**
 * Helper type to check if we're at a valid point to add a sub-resource
 */
export type CanAddSubResource<T extends QueryContext> =
   T extends ResourceQueryContext<ResourceName, string> ? true : false;

/**
 * Helper type to check if we can execute (have a valid path)
 */
export type CanExecute<T extends QueryContext> = T extends {
   hasResource: true;
}
   ? true
   : false;

/**
 * Type to extract the last segment type
 */
export type LastSegmentType<T extends QueryContext> = T extends {
   lastSegment: 'resource';
}
   ? 'resource'
   : T extends { lastSegment: 'collection' }
     ? 'collection'
     : T extends { lastSegment: 'subResource' }
       ? 'subResource'
       : T extends { lastSegment: 'nestedCollection' }
         ? 'nestedCollection'
         : 'none';
