import type { HttpClient as Transport } from '../client/http';
import { GamesCollection } from './game';
import {
   type CollectionParams,
   // type BaseParams,
   type RequestState,
   Resource,
} from './resource';
import type { GameKeyLike } from './types';

type UsersCollectionParams = CollectionParams<never, never, 'users'>;

export class UsersCollection extends Resource<UsersCollectionParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): UsersCollection {
      return new UsersCollection(transport, state, {
         kind: 'collection',
         name: 'users',
         out: [],
         use_login: '1',
      });
   }

   games(...keys: GameKeyLike[]): GamesCollection;
   games(keys: GameKeyLike[]): GamesCollection;
   games(...keys: GameKeyLike[] | [GameKeyLike[]]): GamesCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return GamesCollection.create(this._transport, state, keys.flat());
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
}
