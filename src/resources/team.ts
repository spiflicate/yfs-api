import type { HttpClient as Transport } from '../client/http';
import type { TeamResponse, TeamsResponse } from '../domain/responses';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
   type SubResourceParams,
} from './resource';
import { RosterResource } from './roster';
import type { TeamKeyLike } from './types';

export const teamSubResources = [
   'metadata',
   'roster',
   'matchups',
   'stats',
   'standings',
   'draftresults', // need to confirm this
] as const;

type DateString = `${number}-${number}-${number}`;
type StatsCoverageType = 'season' | 'date' | 'week';
// `'lastmonth' | 'lastweek'` are not valid for team resources, only for players.
type TeamSubResource = (typeof teamSubResources)[number];

type TeamMatchupsFilters = {
   weeks?: `${number}`[];
};

type TeamStatsFilters = {
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

type TeamStatsParams = SubResourceParams<
   Extract<TeamSubResource, 'stats'>
> &
   TeamStatsFilters;

type TeamMatchupsParams = SubResourceParams<
   Extract<TeamSubResource, 'matchups'>
> &
   TeamMatchupsFilters;

export class TeamResource extends Resource<TeamResourceParams> {
   static create(
      transport: Transport,
      state: RequestState,
      key: TeamKeyLike,
   ): TeamResource {
      return new TeamResource(transport, state, {
         kind: 'resource',
         name: 'team',
         key,
         out: [],
      });
   }

   roster(): RosterResource {
      const state = this.createChildState();
      return RosterResource.create(this._transport, state);
   }

   matchups(): TeamMatchupsResource {
      const state = this.createChildState();

      return TeamMatchupsResource.create(this._transport, state);
   }

   stats(): TeamStatsResource {
      const state = this.createChildState();

      return TeamStatsResource.create(this._transport, state);
   }

   standings(): this {
      return this.include('standings');
   }

   include(...subResources: TeamResourceParams['out']): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }

   override async get() {
      return this.request<TeamResponse>('get');
   }
}

export class TeamsCollection extends Resource<TeamsCollectionParams> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: TeamKeyLike[],
   ): TeamsCollection {
      return new TeamsCollection(transport, state, {
         kind: 'collection',
         name: 'teams',
         out: [],
         ...(keys ? { team_keys: keys } : {}),
      });
   }

   roster(): RosterResource {
      const state = this.createChildState();
      return RosterResource.create(this._transport, state);
   }

   matchups(): TeamMatchupsResource {
      const state = this.createChildState();

      return TeamMatchupsResource.create(this._transport, state);
   }

   stats(): TeamStatsResource {
      const state = this.createChildState();

      return TeamStatsResource.create(this._transport, state);
   }

   standings(): this {
      return this.include('standings');
   }

   include(...subResources: TeamsCollectionParams['out']): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }

   override async get() {
      return this.request<TeamsResponse>('get');
   }
}

export class TeamMatchupsResource extends Resource<TeamMatchupsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamMatchupsResource {
      return new TeamMatchupsResource(transport, state, {
         kind: 'subResource',
         name: 'matchups',
      });
   }

   weeks(weeks: readonly (number | `${number}`)[]): this {
      return this.clone({
         ...this._params,
         weeks: weeks.map((week) => String(week) as `${number}`),
      });
   }
   // FIXME: need to create a proper response type for this
   override async get() {
      return this.request<TeamsResponse>('get');
   }
}

export class TeamStatsResource extends Resource<TeamStatsParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): TeamStatsResource {
      return new TeamStatsResource(transport, state, {
         kind: 'subResource',
         name: 'stats',
      });
   }

   week(week: number | `${number}`): Omit<TeamStatsResource, 'date'> {
      return this.clone({
         ...this._params,
         type: 'week',
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): Omit<TeamStatsResource, 'week'> {
      return this.clone({
         ...this._params,
         type: 'date',
         date,
         week: undefined,
      });
   }
   // FIXME: need to create a proper response type for this
   override async get() {
      return this.request<TeamsResponse>('get');
   }
}
