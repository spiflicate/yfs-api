import type { HttpClient as Transport } from '../client/http';
import { GamesCollection } from './game';
import {
   Collection,
   type CollectionParams,
   // type BaseParams,
   type RequestState,
} from './resource';
import type { GameKeyLike } from './types';

type UsersCollectionParams = CollectionParams<never, never, 'users'>;

export class UsersCollection extends Collection<
   UsersCollectionParams,
   never
> {
   static create(
      transport: Transport,
      state: RequestState,
   ): UsersCollection {
      return new UsersCollection(transport, state, {
         type: 'collection',
         name: 'users',
         out: [],
         use_login: '1',
      });
   }

   games(keys: GameKeyLike[]): GamesCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return GamesCollection.create(this._transport, state, keys);
   }

   teams(): never {
      throw new Error('Not implemented');
   }

   leagues(): never {
      throw new Error('Not implemented');
   }

   players(): never {
      throw new Error('Not implemented');
   }

   clone(params: UsersCollectionParams): this {
      // Safe as long as UsersCollection is not subclassed without overriding clone().
      return new UsersCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
