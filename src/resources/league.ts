import type { HttpClient as Transport } from '../client/http';
import { PlayersCollection } from './player';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';
import { TeamsCollection } from './team';
import { TransactionsCollection } from './transaction';
import type {
   LeagueKeyLike,
   PlayerKeyLike,
   TeamKeyLike,
   TransactionKeyLike,
} from './types';

const leagueSubResourceValues = [
   'settings',
   'standings',
   'scoreboard',
   'draftresults',
] as const;

type LeagueSubResource = (typeof leagueSubResourceValues)[number];

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
> extends Resource<TParams> {
   teams(...keys: TeamKeyLike[]): TeamsCollection;
   teams(keys: TeamKeyLike[]): TeamsCollection;
   teams(...keys: TeamKeyLike[] | TeamKeyLike[][]): TeamsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return TeamsCollection.create(this._transport, state, keys.flat());
   }

   players(...keys: PlayerKeyLike[]): PlayersCollection;
   players(keys: PlayerKeyLike[]): PlayersCollection;
   players(
      ...keys: PlayerKeyLike[] | PlayerKeyLike[][]
   ): PlayersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return PlayersCollection.create(this._transport, state, keys.flat());
   }

   transactions(...keys: TransactionKeyLike[]): TransactionsCollection;
   transactions(keys: TransactionKeyLike[]): TransactionsCollection;
   transactions(
      ...keys: TransactionKeyLike[] | TransactionKeyLike[][]
   ): TransactionsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return TransactionsCollection.create(
         this._transport,
         state,
         keys.flat(),
      );
   }

   include(...subResources: LeagueSubResource[]): this {
      return this.clone({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }
}

export class LeagueResource extends LeagueBase<LeagueResourceParams> {
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
}

export class LeaguesCollection extends LeagueBase<LeaguesCollectionParams> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: LeagueKeyLike[],
   ): LeaguesCollection {
      return new LeaguesCollection(transport, state, {
         kind: 'collection',
         name: 'leagues',
         out: [],
         ...(keys ? { league_keys: keys } : {}),
      });
   }
}
