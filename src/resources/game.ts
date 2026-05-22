import type { HttpClient as Transport } from '../client/http';
import { LeaguesCollection } from './league';
import { PlayersCollection } from './player';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';
import { TeamsCollection } from './team';
import type {
   GameKeyLike,
   LeagueKeyLike,
   PlayerKeyLike,
   TeamKeyLike,
} from './types';

// note: leagues and players here are not the same as full resource level leagues and players. These are sub-resources that can be included in the output of a game query, but they do not have the same structure or available endpoints as the full resource collections.
const gameSubResources = [
   'dates',
   'game_weeks',
   'metadata',
   'position_types',
   'roster_positions',
   'stat_categories',
] as const;

type GameSubResource = (typeof gameSubResources)[number];

const gameTypes = [
   'full',
   'pickem-group',
   'pickem-team-list',
   'pickem-team',
] as const;

type GameTypes = (typeof gameTypes)[number];

type GameFilters = {
   /** Seasons (indicated by starting year) to filter by, e.g. ['2021', '2022'] */
   seasons?: `${number}`[];
   /** Filter to only games that are in-season */
   is_available?: '1';
   /** Types of games to filter by */
   game_types?: GameTypes[];
};

type GameResourceParams = ResourceParams<GameSubResource, GameKeyLike>;

type GamesCollectionParams = CollectionParams<
   GameSubResource,
   GameKeyLike,
   'games'
> &
   GameFilters;

abstract class GameBase<
   TParams extends GameResourceParams | GamesCollectionParams,
> extends Resource<TParams, GameSubResource> {
   leagues(...keys: LeagueKeyLike[]): LeaguesCollection;
   leagues(keys: LeagueKeyLike[]): LeaguesCollection;
   leagues(
      ...keys: LeagueKeyLike[] | LeagueKeyLike[][]
   ): LeaguesCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return LeaguesCollection.create(this._transport, state, keys.flat());
   }

   players(...keys: PlayerKeyLike[]): PlayersCollection;
   players(keys: PlayerKeyLike[]): PlayersCollection;
   players(
      ...keys: PlayerKeyLike[] | PlayerKeyLike[][]
   ): PlayersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return PlayersCollection.create(this._transport, state, keys.flat());
   }
   gameWeeks(): this {
      return this.include('game_weeks');
   }

   dates(): this {
      return this.include('dates');
   }

   positionTypes(): this {
      return this.include('position_types');
   }

   rosterPositions(): this {
      return this.include('roster_positions');
   }

   statCategories(): this {
      return this.include('stat_categories');
   }
}

export class GameResource extends GameBase<GameResourceParams> {
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
      return new GameResource(this._transport, this._state, params) as this;
   }
}

export class GamesCollection extends GameBase<GamesCollectionParams> {
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

   teams(...keys: TeamKeyLike[]): TeamsCollection;
   teams(keys: TeamKeyLike[]): TeamsCollection;
   teams(...keys: TeamKeyLike[] | TeamKeyLike[][]): TeamsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return TeamsCollection.create(this._transport, state, keys.flat());
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
