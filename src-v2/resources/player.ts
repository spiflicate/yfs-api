import type { HttpClient as Transport } from '../client/http';
import {
   Collection,
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './base-resource';
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

const serializeParam = (key: string, value?: string): string => {
   if (!value) {
      return '';
   }

   return `;${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

abstract class BasePlayerStatsQuery<TParams extends PlayerStatsParams> {
   protected constructor(
      protected readonly _transport: Transport,
      protected readonly _state: RequestState,
      protected readonly _params: TParams,
   ) {}

   protected abstract clone(params: TParams): this;

   toPath(): string {
      return [this._state.segments.join('/'), this.serialize()]
         .filter(Boolean)
         .join('/');
   }

   async get(): Promise<unknown> {
      return this._transport.get(this.toPath());
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

   protected serialize(): string {
      return [
         'stats',
         serializeParam('type', this._params.type),
         serializeParam('week', this._params.week),
         serializeParam('date', this._params.date),
      ].join('');
   }
}

export class PlayerStatsResource extends BasePlayerStatsQuery<PlayerStatsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): PlayerStatsResource {
      return new PlayerStatsResource(transport, state, {});
   }

   clone(params: PlayerStatsParams): this {
      return new PlayerStatsResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class PlayerStatsCollection extends BasePlayerStatsQuery<PlayerStatsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): PlayerStatsCollection {
      return new PlayerStatsCollection(transport, state, {});
   }

   clone(params: PlayerStatsParams): this {
      return new PlayerStatsCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class PlayerResource extends Resource<
   PlayerResourceParams,
   PlayerSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      key: PlayerKeyLike,
   ): PlayerResource {
      return new PlayerResource(transport, state, {
         type: 'resource',
         name: 'player',
         key,
         out: [],
      });
   }

   stats(): PlayerStatsResource {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

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

   clone(params: PlayerResourceParams): this {
      return new PlayerResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class PlayersCollection extends Collection<
   PlayersCollectionParams,
   PlayerSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: PlayerKeyLike[],
   ): PlayersCollection {
      return new PlayersCollection(transport, state, {
         type: 'collection',
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

   stats(): PlayerStatsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

      return PlayerStatsCollection.create(this._transport, state);
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

   clone(params: PlayersCollectionParams): this {
      return new PlayersCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
