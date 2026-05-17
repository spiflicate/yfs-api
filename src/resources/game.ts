import type { HttpClient as Transport } from '../client/http';
import { LeaguesCollection } from './league';
import { PlayersCollection } from './player';
import {
   Collection,
   type CollectionParams,
   // type BaseParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';
import type { GameKeyLike, LeagueKeyLike, PlayerKeyLike } from './types';

// note: leagues and players here are not the same as full resource level leagues and players. These are sub-resources that can be included in the output of a game query, but they do not have the same structure or available endpoints as the full resource collections.
type GameSubResource = 'metadata' | 'game_weeks' | 'leagues' | 'players';

type GameTypes =
   | 'full'
   | 'pickem-team'
   | 'pickem-group'
   | 'pickem-team-list';

type GameFilters = {
   seasons?: `${number}`[];
   is_available?: '1';
   game_types?: GameTypes[];
};

type GameResourceParams = ResourceParams<GameSubResource, GameKeyLike>;

type GamesCollectionParams = CollectionParams<
   GameSubResource,
   GameKeyLike,
   'games'
> &
   GameFilters;

export class GameResource extends Resource<
   GameResourceParams,
   GameSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      key: GameKeyLike,
   ): GameResource {
      return new GameResource(transport, state, {
         type: 'resource',
         name: 'game',
         key,
         out: [],
      });
   }

   leagues(keys: LeagueKeyLike[]): LeaguesCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return LeaguesCollection.create(this._transport, state, keys);
   }

   players(keys?: PlayerKeyLike[]): PlayersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return PlayersCollection.create(this._transport, state, keys);
   }

   gameWeeks(): this {
      return this.include('game_weeks');
   }

   clone(params: GameResourceParams): this {
      return new GameResource(this._transport, this._state, params) as this;
   }
}

export class GamesCollection extends Collection<
   GamesCollectionParams,
   GameSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: GameKeyLike[],
   ): GamesCollection {
      return new GamesCollection(transport, state, {
         type: 'collection',
         name: 'games',
         out: [],
         ...(keys ? { game_keys: keys } : {}),
      });
   }

   leagues(keys: LeagueKeyLike[]): LeaguesCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return LeaguesCollection.create(this._transport, state, keys);
   }

   players(keys?: PlayerKeyLike[]): PlayersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return PlayersCollection.create(this._transport, state, keys);
   }

   clone(params: GamesCollectionParams): this {
      // Safe as long as GamesCollection is not subclassed without overriding clone().
      return new GamesCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
