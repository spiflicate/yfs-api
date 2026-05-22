import type { HttpClient as Transport } from '../client/http';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';
import type { TeamKeyLike, TransactionKeyLike } from './types';

export const transactionCollectionParams = [
   'transaction_keys',
   'type',
   'types',
   'team_key',
   'count',
   'start',
   'out',
] as const;

export const transactionTraversalParams = [
   'transaction_keys',
   'type',
   'types',
   'team_key',
   'count',
   'start',
] as const;

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
   type?: TransactionType;
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

abstract class TransactionBase<
   TParams extends TransactionResourceParams | TransactionsCollectionParams,
> extends Resource<TParams> {
   players(): this {
      return this.include('players');
   }

   include(...subResources: TransactionSubResource[]): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }
}

export class TransactionResource extends TransactionBase<TransactionResourceParams> {
   static create(
      transport: Transport,
      state: RequestState,
      key: TransactionKeyLike,
   ): TransactionResource {
      return new TransactionResource(transport, state, {
         kind: 'resource',
         name: 'transaction',
         key,
         out: [],
      });
   }
}

export class TransactionsCollection extends TransactionBase<TransactionsCollectionParams> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: TransactionKeyLike[],
   ): TransactionsCollection {
      return new TransactionsCollection(transport, state, {
         kind: 'collection',
         name: 'transactions',
         out: [],
         ...(keys ? { transaction_keys: keys } : {}),
      });
   }

   type(type: TransactionType): this {
      return this.cloneWith({ type });
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
}
