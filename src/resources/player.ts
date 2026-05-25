import type { HttpClient as Transport } from '../client/http';
import type { PlayerResponse, PlayersResponse } from '../domain/responses';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
   type SubResourceParams,
} from './resource';
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
type PlayerSortType = 'season' | 'date' | 'week' | 'lastweek' | 'lastmonth';
type PlayerSubResource =
   | 'metadata'
   | 'stats'
   | 'ownership'
   | 'percent_owned'
   | 'draft_analysis';

type PlayerFilters = {
   week?: `${number}`;
   date?: DateString;
};

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

type PlayerStatsParams = {
   type?: StatsCoverageType;
   week?: `${number}`;
   date?: DateString;
};

type PlayerStatsResourceParams = SubResourceParams<'stats'> &
   PlayerStatsParams;

abstract class PlayerBase<
   TParams extends PlayerResourceParams | PlayersCollectionParams,
> extends Resource<TParams> {
   include(...subResources: PlayerSubResource[]): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }

   stats(): PlayerStatsResource {
      const state = this.createChildState();

      return PlayerStatsResource.create(this._transport, state);
   }

   ownership(): this {
      return this.include('ownership');
   }

   percentOwned(): this {
      return this.include('percent_owned');
   }

   draftAnalysis(): this {
      return this.include('draft_analysis');
   }
}

export class PlayerResource extends PlayerBase<PlayerResourceParams> {
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

   override async get() {
      return this.request<PlayerResponse>('get');
   }
}

export class PlayersCollection extends PlayerBase<PlayersCollectionParams> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: PlayerKeyLike[],
   ): PlayersCollection {
      return new PlayersCollection(transport, state, {
         kind: 'collection',
         name: 'players',
         out: [],
         ...(keys ? { player_keys: keys } : {}),
      });
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
      return this.cloneWith({
         sort_season: String(season) as `${number}`,
      });
   }

   sortWeek(week: number | `${number}`): this {
      return this.cloneWith({
         sort_week: String(week) as `${number}`,
      });
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
      return this.cloneWith({
         date,
         week: undefined,
      });
   }

   start(start: number): this {
      return this.cloneWith({ start });
   }

   count(count: number): this {
      return this.cloneWith({ count });
   }

   override async get() {
      return this.request<PlayersResponse>('get');
   }
}

export class PlayerStatsResource extends Resource<PlayerStatsResourceParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): PlayerStatsResource {
      return new PlayerStatsResource(transport, state, {
         kind: 'subResource',
         name: 'stats',
      });
   }

   type(coverageType: StatsCoverageType): this {
      return this.clone({
         ...this._params,
         type: coverageType,
      });
   }

   week(week: number | `${number}`): this {
      return this.clone({
         ...this._params,
         type: this._params.type ?? 'week',
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): this {
      return this.clone({
         ...this._params,
         type: this._params.type ?? 'date',
         date,
         week: undefined,
      });
   }

   override async get() {
      return super.get();
   }
}
