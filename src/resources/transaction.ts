import { ValidationError } from '../client/errors';
import type { HttpClient as Transport } from '../client/http';
import type { YahooTransactionsResponseDto } from '../domain/normalized';
import {
   type CollectionParams,
   type RequestState,
   Resource,
} from './resource';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract';
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
type TransactionsCollectionParams = CollectionParams<
   TransactionSubResource,
   TransactionKeyLike,
   'transactions'
> & {
   type?: TransactionType;
   types?: TransactionType[];
   team_key?: TeamKeyLike;
   start?: number;
   count?: number;
};

export class TransactionsCollection<
   TRoot = YahooTransactionsResponseDto,
   TPath extends ResponsePath = readonly ['transactions'],
   TRequiredPath extends ResponsePath = TPath,
> extends Resource<
   TransactionsCollectionParams,
   RequireResponsePath<TRoot, TRequiredPath>
> {
   static create<
      TRoot = YahooTransactionsResponseDto,
      TPath extends ResponsePath = readonly ['transactions'],
   >(
      transport: Transport,
      state: RequestState,
      keys?: TransactionKeyLike[],
   ): TransactionsCollection<TRoot, TPath> {
      return new TransactionsCollection(transport, state, {
         kind: 'collection',
         name: 'transactions',
         out: [],
         ...(keys ? { transaction_keys: keys } : {}),
      });
   }

   players(): TransactionsCollection<
      TRoot,
      TPath,
      TRequiredPath | AppendResponsePath<TPath, 'players'>
   > {
      return this.include('players');
   }

   include<const TSubResources extends readonly TransactionSubResource[]>(
      ...subResources: TSubResources
   ): TransactionsCollection<
      TRoot,
      TPath,
      | TRequiredPath
      | (TSubResources[number] extends 'players'
           ? AppendResponsePath<TPath, 'players'>
           : never)
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as TransactionsCollection<
         TRoot,
         TPath,
         | TRequiredPath
         | (TSubResources[number] extends 'players'
              ? AppendResponsePath<TPath, 'players'>
              : never)
      >;
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

   override async get(): Promise<
      RequireResponsePath<TRoot, TRequiredPath>
   > {
      this.validateSpecialTypeFilters();
      return super.get();
   }

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
