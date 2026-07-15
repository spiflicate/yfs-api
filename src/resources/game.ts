import type { HttpClient as Transport } from '../client/http.js';
import type {
   YahooGameResponseDto,
   YahooGamesResponseDto,
} from '../domain/normalized.js';
import { LeaguesCollection } from './league.js';
import { PlayersCollection } from './player.js';
import {
   type CollectionParams,
   copyKeys,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource.js';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract.js';
import { TeamsCollection } from './team.js';
import type {
   GameKeyLike,
   LeagueKeyLike,
   PlayerKeyLike,
   TeamKeyLike,
} from './types.js';

const gameSubResources = [
   'game_weeks',
   'metadata',
   'position_types',
   'stat_categories',
] as const;

type GameSubResource = (typeof gameSubResources)[number];
type GameExpansionField<TSubResource extends GameSubResource> =
   TSubResource extends 'game_weeks'
      ? 'gameWeeks'
      : TSubResource extends 'position_types'
        ? 'positionTypes'
        : TSubResource extends 'stat_categories'
          ? 'statCategories'
          : never;
type GameExpansionPath<
   TPath extends ResponsePath,
   TSubResource extends GameSubResource,
> = TSubResource extends TSubResource
   ? GameExpansionField<TSubResource> extends infer TField extends string
      ? AppendResponsePath<TPath, TField>
      : never
   : never;

type GameTypes =
   | 'full'
   | 'pickem-group'
   | 'pickem-team-list'
   | 'pickem-team';

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
type GamesCollectionContext = 'root' | 'user';
type GamesLeagueKeys<TContext extends GamesCollectionContext> =
   TContext extends 'root'
      ? readonly [LeagueKeyLike, ...LeagueKeyLike[]]
      : readonly LeagueKeyLike[];

abstract class GameBase<
   TParams extends GameResourceParams | GamesCollectionParams,
   TRoot,
   TPath extends ResponsePath,
   TRequiredPath extends ResponsePath,
> extends Resource<TParams, RequireResponsePath<TRoot, TRequiredPath>> {
   players(
      keys: readonly PlayerKeyLike[],
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>> {
      return PlayersCollection.create(
         this._transport,
         this.createChildState(),
         copyKeys(keys),
      );
   }
}

export class GameResource<
   TRoot = YahooGameResponseDto,
   TPath extends ResponsePath = readonly ['game'],
   TRequiredPath extends ResponsePath = TPath,
> extends GameBase<GameResourceParams, TRoot, TPath, TRequiredPath> {
   static create(
      transport: Transport,
      state: RequestState,
      key: GameKeyLike,
   ): GameResource {
      return new GameResource(transport, state, {
         kind: 'resource',
         name: 'game',
         key,
         out: [],
      });
   }

   leagues(
      keys: readonly [LeagueKeyLike, ...LeagueKeyLike[]],
   ): LeaguesCollection<TRoot, AppendResponsePath<TPath, 'leagues'>> {
      if (keys === undefined || keys.length === 0) {
         throw new TypeError('At least one league key is required.');
      }
      const leagueKeys = copyKeys(keys);

      return LeaguesCollection.create(
         this._transport,
         this.createChildState(),
         leagueKeys,
      );
   }

   include<const TSubResources extends readonly GameSubResource[]>(
      ...subResources: TSubResources
   ): GameResource<
      TRoot,
      TPath,
      TRequiredPath | GameExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as GameResource<
         TRoot,
         TPath,
         TRequiredPath | GameExpansionPath<TPath, TSubResources[number]>
      >;
   }

   gameWeeks() {
      return this.include('game_weeks');
   }

   positionTypes() {
      return this.include('position_types');
   }

   statCategories() {
      return this.include('stat_categories');
   }
}

export class GamesCollection<
   TRoot = YahooGamesResponseDto,
   TPath extends ResponsePath = readonly ['games'],
   TRequiredPath extends ResponsePath = TPath,
   TContext extends GamesCollectionContext = 'root',
> extends GameBase<GamesCollectionParams, TRoot, TPath, TRequiredPath> {
   static create<
      TRoot = YahooGamesResponseDto,
      TPath extends ResponsePath = readonly ['games'],
   >(
      transport: Transport,
      state: RequestState,
      keys?: GameKeyLike[],
   ): GamesCollection<TRoot, TPath, TPath, 'root'> {
      return new GamesCollection(transport, state, {
         kind: 'collection',
         name: 'games',
         out: [],
         ...(keys ? { game_keys: keys } : {}),
      });
   }

   static createForUser<TRoot, TPath extends ResponsePath>(
      transport: Transport,
      state: RequestState,
      keys?: GameKeyLike[],
   ): GamesCollection<TRoot, TPath, TPath, 'user'> {
      return new GamesCollection(transport, state, {
         kind: 'collection',
         name: 'games',
         out: [],
         ...(keys ? { game_keys: keys } : {}),
      });
   }

   leagues(
      keys: GamesLeagueKeys<TContext>,
   ): LeaguesCollection<TRoot, AppendResponsePath<TPath, 'leagues'>> {
      return LeaguesCollection.create(
         this._transport,
         this.createChildState(),
         copyKeys(keys),
      );
   }

   teams(
      this: GamesCollection<TRoot, TPath, TRequiredPath, 'user'>,
      keys: readonly TeamKeyLike[],
   ): TeamsCollection<TRoot, AppendResponsePath<TPath, 'teams'>> {
      return TeamsCollection.create(
         this._transport,
         this.createChildState(),
         copyKeys(keys),
      );
   }

   include<const TSubResources extends readonly GameSubResource[]>(
      ...subResources: TSubResources
   ): GamesCollection<
      TRoot,
      TPath,
      TRequiredPath | GameExpansionPath<TPath, TSubResources[number]>,
      TContext
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as GamesCollection<
         TRoot,
         TPath,
         TRequiredPath | GameExpansionPath<TPath, TSubResources[number]>,
         TContext
      >;
   }

   gameWeeks() {
      return this.include('game_weeks');
   }

   positionTypes() {
      return this.include('position_types');
   }

   statCategories() {
      return this.include('stat_categories');
   }
}
