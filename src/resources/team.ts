import type { HttpClient as Transport } from '../client/http';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
   type SubResourceParams,
} from './resource';
import { RosterResource, RostersCollection } from './roster';
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

   include(...subResources: TeamResourceParams['out']): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }

   // clone(params: TeamResourceParams): this {
   //    return new TeamResource(this._transport, this._state, params) as this;
   // }
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

   roster(): RostersCollection {
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return RostersCollection.create(this._transport, state);
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

   include(...subResources: TeamsCollectionParams['out']): this {
      return this.cloneWith({
         ...this._params,
         out: [...this._params.out, ...subResources],
      });
   }

   // clone(params: TeamsCollectionParams): this {
   //    return new TeamsCollection(
   //       this._transport,
   //       this._state,
   //       params,
   //    ) as this;
   // }
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

   // clone(params: TeamMatchupsParams): this {
   //    return new TeamMatchupsResource(
   //       this._transport,
   //       this._state,
   //       params,
   //    ) as this;
   // }

   weeks(weeks: readonly (number | `${number}`)[]): this {
      return this.clone({
         ...this._params,
         weeks: weeks.map((week) => String(week) as `${number}`),
      });
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

   // clone(params: TeamStatsParams): this {
   //    return new TeamStatsResource(
   //       this._transport,
   //       this._state,
   //       params,
   //    ) as this;
   // }

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
}
