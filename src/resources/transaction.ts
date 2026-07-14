import { ValidationError } from '../client/errors';
import type { HttpClient as Transport } from '../client/http';
import type { TransactionBuilder } from './builders/transaction-builder';
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

   override async get() {
      return super.get();
   }
   override async put(): Promise<void> {
      throw new Error('PUT is not yet implemented for transactions.');
   }
   override async delete(): Promise<void> {
      throw new Error('DELETE is not yet implemented for transactions.');
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

   protected override serialize(): string {
      this.validateSpecialTypeFilters();
      return super.serialize();
   }

   types(...types: TransactionType[]): this;
   types(types: TransactionType[]): this;
   types(...types: TransactionType[] | TransactionType[][]): this {
      return this.cloneWith({ types: types.flat() });
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

   createTransaction(transaction: TransactionBuilder): Promise<unknown> {
      return this.post(transaction.toXml());
   }

   override async get() {
      this.validateSpecialTypeFilters();
      return super.get();
   }
   // override async post(): Promise<void> {
   //    throw new Error(
   //       'POST is not yet implemented for transactions collection.',
   //    );
   // }

   private validateSpecialTypeFilters(): void {
      if (this._params.team_key) {
         return;
      }

      const requestedTypes = [
         this._params.type,
         ...(this._params.types ?? []),
      ].filter((value): value is TransactionType => value !== undefined);

      if (
         requestedTypes.includes('waiver') ||
         requestedTypes.includes('pending_trade')
      ) {
         throw new ValidationError(
            'teamKey(team_key) is required when filtering transactions by waiver or pending_trade.',
            'team_key',
            'team_key must be set when type/types includes waiver or pending_trade',
            requestedTypes,
         );
      }
   }
}
