import type { HttpClient as Transport } from '../client/http';
import type { UsersResponse } from '../domain/responses';
import { GamesCollection } from './game';
import {
   type CollectionParams,
   // type BaseParams,
   type RequestState,
   Resource,
} from './resource';
import { TeamsCollection } from './team';
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
      const state = this.createChildState();
      return GamesCollection.create(this._transport, state, keys.flat());
   }

   teams(): TeamsCollection {
      const state = this.createChildState();
      return TeamsCollection.create(this._transport, state, []);
   }

   leagues(): never {
      throw new Error('Not implemented');
   }

   players(): never {
      throw new Error('Not implemented');
   }

   override async get() {
      return this.request<UsersResponse>('get');
   }
}
