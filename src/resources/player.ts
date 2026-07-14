import type { HttpClient as Transport } from '../client/http';
import type {
   YahooPlayerResponseDto,
   YahooPlayersResponseDto,
} from '../domain/normalized';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
   type SubResourceParams,
} from './resource';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract';
import type { PlayerKeyLike } from './types';

type DateString = `${number}-${number}-${number}`;
type PlayerStatus = 'A' | 'FA' | 'W' | 'T' | 'K';
type PlayerSort = `${number}` | 'NAME' | 'OR' | 'AR' | 'PTS';
type StatsCoverageType =
   | 'season'
   | 'date'
   | 'week'
   | 'lastweek'
   | 'lastmonth';
type PlayerSortType = StatsCoverageType;
type PlayerSubResource =
   | 'metadata'
   | 'stats'
   | 'ownership'
   | 'percent_owned';
type PlayerExpansionField<T extends PlayerSubResource> = T extends 'stats'
   ? 'playerStats'
   : T extends 'percent_owned'
     ? 'percentOwned'
     : T extends 'ownership'
       ? 'ownership'
       : never;
type PlayerExpansionPath<
   TPath extends ResponsePath,
   TSubResource extends PlayerSubResource,
> = TSubResource extends TSubResource
   ? PlayerExpansionField<TSubResource> extends infer TField extends string
      ? AppendResponsePath<TPath, TField>
      : never
   : never;

type PlayerFilters = { week?: `${number}`; date?: DateString };
type PlayersCollectionFilters = PlayerFilters & {
   position?: string;
   status?: PlayerStatus;
   search?: string;
   sort?: PlayerSort;
   sort_type?: PlayerSortType;
   sort_season?: `${number}`;
   sort_week?: `${number}`;
   sort_date?: DateString;
   start?: number;
   count?: number;
};
type PlayerResourceParams = ResourceParams<
   PlayerSubResource,
   PlayerKeyLike
> &
   PlayerFilters;
type PlayersCollectionParams = CollectionParams<
   PlayerSubResource,
   PlayerKeyLike,
   'players'
> &
   PlayersCollectionFilters;
type PlayerStatsResourceParams = SubResourceParams<'stats'> & {
   type?: StatsCoverageType;
   week?: `${number}`;
   date?: DateString;
};

abstract class PlayerBase<
   TParams extends PlayerResourceParams | PlayersCollectionParams,
   TRoot,
   TPath extends ResponsePath,
   TRequiredPath extends ResponsePath,
> extends Resource<TParams, RequireResponsePath<TRoot, TRequiredPath>> {
   stats(): PlayerStatsResource<
      TRoot,
      AppendResponsePath<TPath, 'playerStats'>
   > {
      return PlayerStatsResource.create(
         this._transport,
         this.createChildState(),
      );
   }
}

export class PlayerResource<
   TRoot = YahooPlayerResponseDto,
   TPath extends ResponsePath = readonly ['player'],
   TRequiredPath extends ResponsePath = TPath,
> extends PlayerBase<PlayerResourceParams, TRoot, TPath, TRequiredPath> {
   static create(
      transport: Transport,
      state: RequestState,
      key: PlayerKeyLike,
   ): PlayerResource {
      return new PlayerResource(transport, state, {
         kind: 'resource',
         name: 'player',
         key,
         out: [],
      });
   }

   include<const TSubResources extends readonly PlayerSubResource[]>(
      ...subResources: TSubResources
   ): PlayerResource<
      TRoot,
      TPath,
      TRequiredPath | PlayerExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as PlayerResource<
         TRoot,
         TPath,
         TRequiredPath | PlayerExpansionPath<TPath, TSubResources[number]>
      >;
   }

   ownership() {
      return this.include('ownership');
   }

   percentOwned() {
      return this.include('percent_owned');
   }
}

export class PlayersCollection<
   TRoot = YahooPlayersResponseDto,
   TPath extends ResponsePath = readonly ['players'],
   TRequiredPath extends ResponsePath = TPath,
> extends PlayerBase<PlayersCollectionParams, TRoot, TPath, TRequiredPath> {
   static create<
      TRoot = YahooPlayersResponseDto,
      TPath extends ResponsePath = readonly ['players'],
   >(
      transport: Transport,
      state: RequestState,
      keys?: PlayerKeyLike[],
   ): PlayersCollection<TRoot, TPath> {
      return new PlayersCollection(transport, state, {
         kind: 'collection',
         name: 'players',
         out: [],
         ...(keys ? { player_keys: keys } : {}),
      });
   }

   include<const TSubResources extends readonly PlayerSubResource[]>(
      ...subResources: TSubResources
   ): PlayersCollection<
      TRoot,
      TPath,
      TRequiredPath | PlayerExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as PlayersCollection<
         TRoot,
         TPath,
         TRequiredPath | PlayerExpansionPath<TPath, TSubResources[number]>
      >;
   }

   ownership() {
      return this.include('ownership');
   }

   percentOwned() {
      return this.include('percent_owned');
   }

   position(position: string): this {
      return this.cloneWith({ position });
   }

   status(status: PlayerStatus): this {
      return this.cloneWith({ status });
   }

   search(search: string): this {
      return this.cloneWith({ search });
   }

   sort(sort: PlayerSort): this {
      return this.cloneWith({ sort });
   }

   sortType(sort_type: PlayerSortType): this {
      return this.cloneWith({ sort_type });
   }

   sortSeason(season: number | `${number}`): this {
      return this.cloneWith({ sort_season: String(season) as `${number}` });
   }

   sortWeek(week: number | `${number}`): this {
      return this.cloneWith({ sort_week: String(week) as `${number}` });
   }

   sortDate(sort_date: DateString): this {
      return this.cloneWith({ sort_date });
   }

   week(week: number | `${number}`): this {
      return this.cloneWith({
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): this {
      return this.cloneWith({ date, week: undefined });
   }

   start(start: number): this {
      return this.cloneWith({ start });
   }

   count(count: number): this {
      return this.cloneWith({ count });
   }
}

export class PlayerStatsResource<
   TRoot = YahooPlayerResponseDto,
   TPath extends ResponsePath = readonly ['player', 'playerStats'],
> extends Resource<
   PlayerStatsResourceParams,
   RequireResponsePath<TRoot, TPath>
> {
   static create<TRoot, TPath extends ResponsePath>(
      transport: Transport,
      state: RequestState,
   ): PlayerStatsResource<TRoot, TPath> {
      return new PlayerStatsResource(transport, state, {
         kind: 'subResource',
         name: 'stats',
      });
   }

   type(coverageType: StatsCoverageType): this {
      return this.cloneWith({ type: coverageType });
   }

   week(week: number | `${number}`): this {
      return this.cloneWith({
         type: this._params.type ?? 'week',
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): this {
      return this.cloneWith({
         type: this._params.type ?? 'date',
         date,
         week: undefined,
      });
   }
}
