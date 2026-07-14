import type { HttpClient as Transport } from '../client/http';
import type { YahooLoggedInUsersResponseDto } from '../domain/normalized';
import { GamesCollection } from './game';
import {
   type CollectionParams,
   type RequestState,
   Resource,
} from './resource';
import type {
   AppendResponsePath,
   RequireResponsePath,
} from './response-contract';
import { TeamsCollection } from './team';
import type { GameKeyLike } from './types';

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
      ...keys: GameKeyLike[]
   ): GamesCollection<
      YahooLoggedInUsersResponseDto,
      AppendResponsePath<UsersPath, 'games'>
   >;
   games(
      keys: GameKeyLike[],
   ): GamesCollection<
      YahooLoggedInUsersResponseDto,
      AppendResponsePath<UsersPath, 'games'>
   >;
   games(
      ...keys: GameKeyLike[] | GameKeyLike[][]
   ): GamesCollection<
      YahooLoggedInUsersResponseDto,
      AppendResponsePath<UsersPath, 'games'>
   > {
      return GamesCollection.create(
         this._transport,
         this.createChildState(),
         keys.flat(),
      );
   }

   teams(): TeamsCollection<
      YahooLoggedInUsersResponseDto,
      readonly ['users', 'games', 'teams']
   > {
      return TeamsCollection.create(
         this._transport,
         this.createChildState(),
         [],
      );
   }
}
