import type { HttpTransport as Transport } from '../client/http.js';
import type { YahooLoggedInUsersResponseDto } from '../domain/normalized.js';
import { GamesCollection } from './game.js';
import {
   type CollectionParams,
   copyKeys,
   type RequestState,
   Resource,
} from './resource.js';
import type {
   AppendResponsePath,
   RequireResponsePath,
} from './response-contract.js';
import { TeamsCollection } from './team.js';
import type { GameKeyLike } from './types.js';

type UsersPath = readonly ['users'];
type UsersCollectionParams = CollectionParams<never, never, 'users'>;

export class UsersCollection extends Resource<
   UsersCollectionParams,
   RequireResponsePath<YahooLoggedInUsersResponseDto, UsersPath>
> {
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

   games(
      keys: readonly GameKeyLike[],
   ): GamesCollection<
      YahooLoggedInUsersResponseDto,
      AppendResponsePath<UsersPath, 'games'>,
      AppendResponsePath<UsersPath, 'games'>,
      'user'
   > {
      return GamesCollection.createForUser(
         this._transport,
         this.createChildState(),
         copyKeys(keys),
      );
   }

   teams(): TeamsCollection<
      YahooLoggedInUsersResponseDto,
      readonly ['users', 'teams']
   > {
      return TeamsCollection.create(
         this._transport,
         this.createChildState(),
         [],
      );
   }
}
