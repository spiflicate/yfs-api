import type { HttpClient as Transport } from '../client/http.js';
import type {
   YahooLeagueResponseDto,
   YahooLeaguesResponseDto,
} from '../domain/normalized.js';
import { PlayersCollection } from './player.js';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource.js';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract.js';
import { TeamsCollection } from './team.js';
import { TransactionsCollection } from './transaction.js';
import type {
   LeagueKeyLike,
   PlayerKeyLike,
   TeamKeyLike,
   TransactionKeyLike,
} from './types.js';

const leagueSubResources = ['settings', 'standings', 'scoreboard'] as const;
type LeagueSubResource = (typeof leagueSubResources)[number];
type LeagueExpansionField<T extends LeagueSubResource> = T extends
   | 'settings'
   | 'standings'
   | 'scoreboard'
   ? T
   : never;
type LeagueExpansionPath<
   TPath extends ResponsePath,
   TSubResource extends LeagueSubResource,
> = TSubResource extends TSubResource
   ? LeagueExpansionField<TSubResource> extends infer TField extends string
      ? AppendResponsePath<TPath, TField>
      : never
   : never;

type LeagueResourceParams = ResourceParams<
   LeagueSubResource,
   LeagueKeyLike
>;
type LeaguesCollectionParams = CollectionParams<
   LeagueSubResource,
   LeagueKeyLike,
   'leagues'
>;

abstract class LeagueBase<
   TParams extends LeagueResourceParams | LeaguesCollectionParams,
   TRoot,
   TPath extends ResponsePath,
   TRequiredPath extends ResponsePath,
> extends Resource<TParams, RequireResponsePath<TRoot, TRequiredPath>> {
   teams(
      ...keys: TeamKeyLike[]
   ): TeamsCollection<TRoot, AppendResponsePath<TPath, 'teams'>>;
   teams(
      keys: TeamKeyLike[],
   ): TeamsCollection<TRoot, AppendResponsePath<TPath, 'teams'>>;
   teams(
      ...keys: TeamKeyLike[] | TeamKeyLike[][]
   ): TeamsCollection<TRoot, AppendResponsePath<TPath, 'teams'>> {
      return TeamsCollection.create(
         this._transport,
         this.createChildState(),
         keys.flat(),
      );
   }

   players(
      ...keys: PlayerKeyLike[]
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>>;
   players(
      keys: PlayerKeyLike[],
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>>;
   players(
      ...keys: PlayerKeyLike[] | PlayerKeyLike[][]
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>> {
      return PlayersCollection.create(
         this._transport,
         this.createChildState(),
         keys.flat(),
      );
   }

   transactions(
      ...keys: TransactionKeyLike[]
   ): TransactionsCollection<
      TRoot,
      AppendResponsePath<TPath, 'transactions'>
   >;
   transactions(
      keys: TransactionKeyLike[],
   ): TransactionsCollection<
      TRoot,
      AppendResponsePath<TPath, 'transactions'>
   >;
   transactions(
      ...keys: TransactionKeyLike[] | TransactionKeyLike[][]
   ): TransactionsCollection<
      TRoot,
      AppendResponsePath<TPath, 'transactions'>
   > {
      return TransactionsCollection.create(
         this._transport,
         this.createChildState(),
         keys.flat(),
      );
   }
}

export class LeagueResource<
   TRoot = YahooLeagueResponseDto,
   TPath extends ResponsePath = readonly ['league'],
   TRequiredPath extends ResponsePath = TPath,
> extends LeagueBase<LeagueResourceParams, TRoot, TPath, TRequiredPath> {
   static create(
      transport: Transport,
      state: RequestState,
      key: LeagueKeyLike,
   ): LeagueResource {
      return new LeagueResource(transport, state, {
         kind: 'resource',
         name: 'league',
         key,
         out: [],
      });
   }

   include<const TSubResources extends readonly LeagueSubResource[]>(
      ...subResources: TSubResources
   ): LeagueResource<
      TRoot,
      TPath,
      TRequiredPath | LeagueExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as LeagueResource<
         TRoot,
         TPath,
         TRequiredPath | LeagueExpansionPath<TPath, TSubResources[number]>
      >;
   }
}

export class LeaguesCollection<
   TRoot = YahooLeaguesResponseDto,
   TPath extends ResponsePath = readonly ['leagues'],
   TRequiredPath extends ResponsePath = TPath,
> extends LeagueBase<LeaguesCollectionParams, TRoot, TPath, TRequiredPath> {
   static create<
      TRoot = YahooLeaguesResponseDto,
      TPath extends ResponsePath = readonly ['leagues'],
   >(
      transport: Transport,
      state: RequestState,
      keys?: LeagueKeyLike[],
   ): LeaguesCollection<TRoot, TPath> {
      return new LeaguesCollection(transport, state, {
         kind: 'collection',
         name: 'leagues',
         out: [],
         ...(keys ? { league_keys: keys } : {}),
      });
   }

   include<const TSubResources extends readonly LeagueSubResource[]>(
      ...subResources: TSubResources
   ): LeaguesCollection<
      TRoot,
      TPath,
      TRequiredPath | LeagueExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as LeaguesCollection<
         TRoot,
         TPath,
         TRequiredPath | LeagueExpansionPath<TPath, TSubResources[number]>
      >;
   }
}
