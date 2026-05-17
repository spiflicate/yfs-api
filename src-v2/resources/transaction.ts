import type { HttpClient as Transport } from '../client/http';
import {
   Collection,
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './base-resource';
import type { TeamKeyLike, TransactionKeyLike } from './types';

type TransactionType =
   | 'add'
   | 'drop'
   | 'add/drop'
   | 'trade'
   | 'pending_trade'
   | 'waiver'
   | 'commish';

type TransactionSubResource = 'metadata' | 'players';

type TransactionCollectionFilters = {
   transaction_type?: TransactionType;
   types?: TransactionType[];
   team_key?: TeamKeyLike;
   start?: number;
   count?: number;
};

type TransactionResourceParams = ResourceParams<
   TransactionSubResource,
   TransactionKeyLike
>;

type TransactionsCollectionParams = CollectionParams<
   TransactionSubResource,
   TransactionKeyLike,
   'transactions'
> &
   TransactionCollectionFilters;

export class TransactionResource extends Resource<
   TransactionResourceParams,
   TransactionSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      key: TransactionKeyLike,
   ): TransactionResource {
      return new TransactionResource(transport, state, {
         type: 'resource',
         name: 'transaction',
         key,
         out: [],
      });
   }

   players(): this {
      return this.include('players');
   }

   clone(params: TransactionResourceParams): this {
      return new TransactionResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class TransactionsCollection extends Collection<
   TransactionsCollectionParams,
   TransactionSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: TransactionKeyLike[],
   ): TransactionsCollection {
      return new TransactionsCollection(transport, state, {
         type: 'collection',
         name: 'transactions',
         out: [],
         ...(keys ? { transaction_keys: keys } : {}),
      });
   }

   type(transaction_type: TransactionType): this {
      return this.cloneWith({ transaction_type });
   }

   types(types: TransactionType[]): this {
      return this.cloneWith({ types });
   }

   teamKey(team_key: TeamKeyLike): this {
      return this.cloneWith({ team_key });
   }

   start(start: number): this {
      return this.cloneWith({ start });
   }

   count(count: number): this {
      return this.cloneWith({ count });
   }

   players(): this {
      return this.include('players');
   }

   clone(params: TransactionsCollectionParams): this {
      return new TransactionsCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }

   protected override serialize(): string {
      const { transaction_type, ...params } = this._params;
      const resourcePart = 'transactions';
      const paramPart =
         this.serializeParams(params) +
         (transaction_type
            ? this.serializeParam('type', transaction_type)
            : '');

      return resourcePart + paramPart;
   }
}
