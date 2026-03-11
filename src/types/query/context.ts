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
import type { AllResponseTypes } from './responses.js';

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
export type InferResponseType<TPath extends string[]> = TPath extends [
   'game',
   string,
]
   ? import('./responses.js').GameResourceResponse
   : TPath extends ['game', string, 'leagues']
     ? import('./responses.js').GameLeaguesResponse
     : TPath extends ['game', string, 'players']
       ? import('./responses.js').GamePlayersResponse
       : TPath extends ['game', string, 'stat_categories']
         ? import('./responses.js').GameStatCategoriesResponse
         : TPath extends ['game', string, 'position_types']
           ? import('./responses.js').GamePositionTypesResponse
           : TPath extends ['game', string, 'game_weeks']
             ? import('./responses.js').GameGameWeeksResponse
             : TPath extends ['games']
               ? import('./responses.js').GamesCollectionResponse
               : TPath extends ['league', string]
                 ? import('./responses.js').LeagueResourceResponse
                 : TPath extends ['league', string, 'settings']
                   ? import('./responses.js').LeagueSettingsResponse
                   : TPath extends ['league', string, 'standings']
                     ? import('./responses.js').LeagueStandingsResponse
                     : TPath extends ['league', string, 'scoreboard']
                       ? import('./responses.js').LeagueScoreboardResponse
                       : TPath extends ['league', string, 'teams']
                         ? import('./responses.js').LeagueTeamsResponse
                         : TPath extends ['league', string, 'players']
                           ? import('./responses.js').LeaguePlayersResponse
                           : TPath extends [
                                  'league',
                                  string,
                                  'transactions',
                               ]
                             ? import('./responses.js').LeagueTransactionsResponse
                             : TPath extends ['league', string, 'drafts']
                               ? import('./responses.js').LeagueDraftsResponse
                               : TPath extends ['team', string]
                                 ? import('./responses.js').TeamResourceResponse
                                 : TPath extends ['team', string, 'roster']
                                   ? import('./responses.js').TeamRosterResponse
                                   : TPath extends [
                                          'team',
                                          string,
                                          'roster',
                                          'players',
                                       ]
                                     ? import('./responses.js').TeamRosterPlayersResponse
                                     : TPath extends [
                                            'team',
                                            string,
                                            'matchups',
                                         ]
                                       ? import('./responses.js').TeamMatchupsResponse
                                       : TPath extends [
                                              'team',
                                              string,
                                              'stats',
                                           ]
                                         ? import('./responses.js').TeamStatsResponse
                                         : TPath extends ['player', string]
                                           ? import('./responses.js').PlayerResourceResponse
                                           : TPath extends [
                                                  'player',
                                                  string,
                                                  'stats',
                                               ]
                                             ? import('./responses.js').PlayerStatsResponse
                                             : TPath extends [
                                                    'player',
                                                    string,
                                                    'ownership',
                                                 ]
                                               ? import('./responses.js').PlayerOwnershipResponse
                                               : TPath extends [
                                                      'player',
                                                      string,
                                                      'percent_owned',
                                                   ]
                                                 ? import('./responses.js').PlayerPercentOwnedResponse
                                                 : TPath extends [
                                                        'player',
                                                        string,
                                                        'draft_analysis',
                                                     ]
                                                   ? import('./responses.js').PlayerDraftAnalysisResponse
                                                   : TPath extends ['users']
                                                     ? import('./responses.js').UsersCollectionResponse
                                                     : TPath extends [
                                                            'users',
                                                            string,
                                                            'games',
                                                         ]
                                                       ? import('./responses.js').UserGamesResponse
                                                       : TPath extends [
                                                              'users',
                                                              string,
                                                              'leagues',
                                                           ]
                                                         ? import('./responses.js').UserLeaguesResponse
                                                         : TPath extends [
                                                                'users',
                                                                string,
                                                                'teams',
                                                             ]
                                                           ? import('./responses.js').UserTeamsResponse
                                                           : TPath extends [
                                                                  'transaction',
                                                                  string,
                                                               ]
                                                             ? import('./responses.js').TransactionResourceResponse
                                                             : AllResponseTypes;

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
