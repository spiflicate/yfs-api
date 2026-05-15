import {
   type BaseParams,
   BaseResource,
   type RequestState,
} from '../core/base-resource';
import type { Transport } from '../core/transport';

type TypeLike<T extends string> = T | (string & {});

type GameCode = 'nhl' | 'nfl' | 'mlb' | 'nba';
type GameKey = `${number}`;
type GameKeyLike = TypeLike<GameKey | GameCode>;

// note: leagues and players here are not the same as full resource level leagues and players. These are sub-resources that can be included in the output of a game query, but they do not have the same structure or available endpoints as the full resource collections.
type GameSubResource = 'metadata' | 'leagues' | 'players' | 'game_weeks';

type GameTypes =
   | 'full'
   | 'pickem-team'
   | 'pickem-group'
   | 'pickem-team-list';

type GameFilters = {
   game_keys?: GameKeyLike[];
   seasons?: `${number}`[];
   is_available?: '1';
   game_types?: GameTypes[];
};

type GameResourceParams = BaseParams<
   'resource',
   GameSubResource,
   GameKeyLike
>;

type GamesCollectionParams = BaseParams<'collection', GameSubResource> &
   GameFilters;

export class GameResource extends BaseResource<
   GameResourceParams,
   GameSubResource,
   'resource'
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

   clone(params: GameResourceParams): this {
      return new GameResource(this.transport, this.state, params) as this;
   }
}

export class GamesCollection extends BaseResource<
   GamesCollectionParams,
   GameSubResource,
   'collection'
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: GameKeyLike[],
   ): GamesCollection {
      return new GamesCollection(transport, state, {
         type: 'collection',
         name: 'games',
         game_keys: keys ? [...keys] : undefined,
         out: [],
      });
   }

   clone(params: GamesCollectionParams): this {
      // Safe as long as GamesCollection is not subclassed without overriding clone().
      return new GamesCollection(
         this.transport,
         this.state,
         params,
      ) as this;
   }

   filters(filters: Partial<GameFilters>): GamesCollection {
      const params: GamesCollectionParams = {
         ...this.params,
         ...(filters.seasons && { seasons: filters.seasons }),
         ...(filters.is_available && {
            is_available: filters.is_available,
         }),
         ...(filters.game_types && { game_types: filters.game_types }),
      };

      return new GamesCollection(this.transport, this.state, params);
   }

   async get(): Promise<unknown> {
      const raw = await this.transport.get(this.toPath());
      return raw;
   }
}
