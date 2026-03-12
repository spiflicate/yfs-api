/**
 * Resource Graph Type Definitions
 *
 * This module defines the type-level graph of the Yahoo Fantasy API.
 * Each resource type defines:
 * - What key format it uses
 * - What collections are available from it
 * - What sub-resources are available
 * - What parameters are valid
 *
 * @module
 */

import type {
   GameResponse,
   LeagueResponse,
   PlayerResponse,
   TeamResponse,
   TransactionResponse,
   UsersResponse,
} from '../responses/wrappers.js';

/**
 * Base resource key types
 */
export type GameKey = string;
export type LeagueKey = `${number}.l.${number}` | (string & {});
export type TeamKey = `${number}.l.${number}.t.${number}` | (string & {});
export type PlayerKey = `${number}.p.${number}` | (string & {});
export type TransactionKey =
   | `${number}.l.${number}.tr.${number}`
   | (string & {});
export type WaiverClaimKey =
   | `${number}.l.${number}.w.c.${number}`
   | (string & {});
export type PendingTradeKey =
   | `${number}.l.${number}.pt.${number}`
   | (string & {});

/**
 * Resource name literals
 */
export type ResourceName =
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'users'
   | 'transaction';

/**
 * Collection name literals
 */
export type CollectionName =
   | 'games'
   | 'leagues'
   | 'teams'
   | 'players'
   | 'stats'
   | 'transactions'
   | 'drafts'
   | 'matchups'
   | 'roster'
   | 'ownership'
   | 'percent_owned'
   | 'draft_analysis'
   | 'draftresults'
   | 'game_weeks'
   | 'stat_categories'
   | 'position_types';

/**
 * Sub-resource name literals
 */
export type SubResourceName =
   | 'metadata'
   | 'settings'
   | 'standings'
   | 'scoreboard'
   | 'teams'
   | 'players'
   | 'transactions'
   | 'drafts'
   | 'roster'
   | 'matchups'
   | 'stats'
   | 'ownership'
   | 'percent_owned'
   | 'draft_analysis'
   | 'draftresults'
   | 'game_weeks'
   | 'stat_categories'
   | 'position_types';

/**
 * Defines what can be accessed from a resource
 */
export interface ResourceDefinition<
   TKey extends string,
   TCollections extends CollectionName,
   TSubResources extends SubResourceName,
   TParams extends string,
   TResponse,
> {
   /** The resource name */
   resource: TKey;
   /** Collections accessible from this resource */
   collections: TCollections[];
   /** Sub-resources accessible from this resource */
   subResources: TSubResources[];
   /** Valid parameters for this resource */
   params: TParams[];
   /** Response type for this resource */
   responseType: TResponse;
}

/**
 * Game resource definition
 */
export interface GameResourceDef {
   key: GameKey;
   collections: ['leagues', 'players'];
   subResources: [
      'metadata',
      'stat_categories',
      'position_types',
      'game_weeks',
   ];
   params: ['game_keys', 'is_available', 'season'];
   responseType: GameResponse;
}

/**
 * League resource definition
 */
export interface LeagueResourceDef {
   key: LeagueKey;
   collections: ['teams', 'players', 'transactions', 'drafts'];
   subResources: ['metadata', 'settings', 'standings', 'scoreboard'];
   params: ['league_keys', 'out'];
   responseType: LeagueResponse;
}

/**
 * Team resource definition
 */
export interface TeamResourceDef {
   key: TeamKey;
   collections: [];
   subResources: ['metadata', 'roster', 'matchups', 'stats', 'standings'];
   params: ['team_keys', 'out'];
   responseType: TeamResponse;
}

/**
 * Player resource definition
 */
export interface PlayerResourceDef {
   key: PlayerKey;
   collections: [];
   subResources: [
      'metadata',
      'stats',
      'ownership',
      'percent_owned',
      'draft_analysis',
   ];
   params: [
      'player_keys',
      'position',
      'status',
      'sort',
      'count',
      'start',
      'search',
   ];
   responseType: PlayerResponse;
}

/**
 * User resource definition
 */
export interface UserResourceDef {
   key: never;
   collections: ['games', 'leagues', 'teams'];
   subResources: [];
   params: ['use_login'];
   responseType: UsersResponse;
}

/**
 * Transaction resource definition
 */
export interface TransactionResourceDef {
   key: TransactionKey;
   collections: [];
   subResources: [];
   params: ['types', 'team_key', 'count', 'start'];
   responseType: TransactionResponse;
}

/**
 * Map of all resource definitions
 */
export interface ResourceGraph {
   game: GameResourceDef;
   league: LeagueResourceDef;
   team: TeamResourceDef;
   player: PlayerResourceDef;
   users: UserResourceDef;
   transaction: TransactionResourceDef;
}

/**
 * Type to get a resource definition by name
 */
export type GetResourceDef<T extends ResourceName> = ResourceGraph[T];

/**
 * Type to get valid collections from a resource
 */
export type GetCollections<T extends ResourceName> =
   ResourceGraph[T]['collections'];

/**
 * Type to get valid sub-resources from a resource
 */
export type GetSubResources<T extends ResourceName> =
   ResourceGraph[T]['subResources'];

/**
 * Type to get valid params from a resource
 */
export type GetParams<T extends ResourceName> = ResourceGraph[T]['params'];

/**
 * Type to get response type from a resource
 */
export type GetResponseType<T extends ResourceName> =
   ResourceGraph[T]['responseType'];
