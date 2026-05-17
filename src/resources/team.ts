import type { HttpClient as Transport } from '../client/http';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';
import { RosterResource, RostersCollection } from './roster';
import type { TeamKeyLike } from './types';

type DateString = `${number}-${number}-${number}`;
type StatsCoverageType =
   | 'season'
   | 'date'
   | 'week'
   | 'lastweek'
   | 'lastmonth';
type TeamSubResource =
   | 'metadata'
   | 'roster'
   | 'matchups'
   | 'stats'
   | 'standings';

type MatchupParams = {
   weeks?: `${number}`[];
};

type TeamStatsParams = {
   week?: `${number}`;
   date?: DateString;
   type?: StatsCoverageType;
};

type TeamResourceParams = ResourceParams<TeamSubResource, TeamKeyLike>;

type TeamsCollectionParams = CollectionParams<
   TeamSubResource,
   TeamKeyLike,
   'teams'
>;

const serializeParam = (key: string, value?: string): string => {
   if (!value) {
      return '';
   }

   return `;${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};

abstract class BaseTeamMatchupsQuery<TParams extends MatchupParams> {
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

   weeks(weeks: readonly (number | `${number}`)[]): this {
      return this.clone({
         ...this._params,
         weeks: weeks.map((week) => String(week) as `${number}`),
      });
   }

   protected serialize(): string {
      if (!this._params.weeks || this._params.weeks.length === 0) {
         return 'matchups';
      }

      return `matchups;weeks=${this._params.weeks
         .map((week) => encodeURIComponent(week))
         .join(',')}`;
   }
}

abstract class BaseTeamStatsQuery<TParams extends TeamStatsParams> {
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

export class TeamMatchupsResource extends BaseTeamMatchupsQuery<MatchupParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamMatchupsResource {
      return new TeamMatchupsResource(transport, state, {});
   }

   clone(params: MatchupParams): this {
      return new TeamMatchupsResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class TeamMatchupsCollection extends BaseTeamMatchupsQuery<MatchupParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamMatchupsCollection {
      return new TeamMatchupsCollection(transport, state, {});
   }

   clone(params: MatchupParams): this {
      return new TeamMatchupsCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class TeamStatsResource extends BaseTeamStatsQuery<TeamStatsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamStatsResource {
      return new TeamStatsResource(transport, state, {});
   }

   clone(params: TeamStatsParams): this {
      return new TeamStatsResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class TeamStatsCollection extends BaseTeamStatsQuery<TeamStatsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamStatsCollection {
      return new TeamStatsCollection(transport, state, {});
   }

   clone(params: TeamStatsParams): this {
      return new TeamStatsCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class TeamResource extends Resource<
   TeamResourceParams,
   TeamSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      key: TeamKeyLike,
   ): TeamResource {
      return new TeamResource(transport, state, {
         type: 'resource',
         name: 'team',
         key,
         out: [],
      });
   }

   roster(): RosterResource {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return RosterResource.create(this._transport, state);
   }

   matchups(): TeamMatchupsResource {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

      return TeamMatchupsResource.create(this._transport, state);
   }

   stats(): TeamStatsResource {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

      return TeamStatsResource.create(this._transport, state);
   }

   standings(): this {
      return this.include('standings');
   }

   clone(params: TeamResourceParams): this {
      return new TeamResource(this._transport, this._state, params) as this;
   }
}

export class TeamsCollection extends Resource<
   TeamsCollectionParams,
   TeamSubResource
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: TeamKeyLike[],
   ): TeamsCollection {
      return new TeamsCollection(transport, state, {
         type: 'collection',
         name: 'teams',
         out: [],
         ...(keys ? { team_keys: keys } : {}),
      });
   }

   roster(): RostersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return RostersCollection.create(this._transport, state);
   }

   matchups(): TeamMatchupsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

      return TeamMatchupsCollection.create(this._transport, state);
   }

   stats(): TeamStatsCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };

      return TeamStatsCollection.create(this._transport, state);
   }

   standings(): this {
      return this.include('standings');
   }

   clone(params: TeamsCollectionParams): this {
      return new TeamsCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
