import type { HttpClient as Transport } from '../client/http.js';
import type {
   YahooTeamResponseDto,
   YahooTeamsResponseDto,
} from '../domain/normalized.js';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
   type SubResourceParams,
} from './resource.js';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract.js';
import { RosterResource } from './roster.js';
import type { TeamKeyLike } from './types.js';

export const teamSubResources = [
   'metadata',
   'roster',
   'matchups',
   'stats',
] as const;

type DateString = `${number}-${number}-${number}`;
type StatsCoverageType = 'season' | 'date' | 'week';
type TeamSubResource = (typeof teamSubResources)[number];
type TeamExpansionField<T extends TeamSubResource> = T extends 'stats'
   ? 'teamStats'
   : T extends 'roster' | 'matchups'
     ? T
     : never;
type TeamExpansionPath<
   TPath extends ResponsePath,
   TSubResource extends TeamSubResource,
> = TSubResource extends TSubResource
   ? TeamExpansionField<TSubResource> extends infer TField extends string
      ? AppendResponsePath<TPath, TField>
      : never
   : never;

type TeamMatchupsFilters = { weeks?: `${number}`[] };
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
type TeamStatsParams = SubResourceParams<'stats'> & TeamStatsFilters;
type TeamMatchupsParams = SubResourceParams<'matchups'> &
   TeamMatchupsFilters;

export class TeamResource<
   TRoot = YahooTeamResponseDto,
   TPath extends ResponsePath = readonly ['team'],
   TRequiredPath extends ResponsePath = TPath,
> extends Resource<
   TeamResourceParams,
   RequireResponsePath<TRoot, TRequiredPath>
> {
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

   roster(): RosterResource<TRoot, AppendResponsePath<TPath, 'roster'>> {
      return RosterResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   matchups(): TeamMatchupsResource<
      TRoot,
      AppendResponsePath<TPath, 'matchups'>
   > {
      return TeamMatchupsResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   stats(): TeamStatsResource<
      TRoot,
      AppendResponsePath<TPath, 'teamStats'>
   > {
      return TeamStatsResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   include<const TSubResources extends readonly TeamSubResource[]>(
      ...subResources: TSubResources
   ): TeamResource<
      TRoot,
      TPath,
      TRequiredPath | TeamExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as TeamResource<
         TRoot,
         TPath,
         TRequiredPath | TeamExpansionPath<TPath, TSubResources[number]>
      >;
   }
}

export class TeamsCollection<
   TRoot = YahooTeamsResponseDto,
   TPath extends ResponsePath = readonly ['teams'],
   TRequiredPath extends ResponsePath = TPath,
> extends Resource<
   TeamsCollectionParams,
   RequireResponsePath<TRoot, TRequiredPath>
> {
   static create<
      TRoot = YahooTeamsResponseDto,
      TPath extends ResponsePath = readonly ['teams'],
   >(
      transport: Transport,
      state: RequestState,
      keys?: TeamKeyLike[],
   ): TeamsCollection<TRoot, TPath> {
      return new TeamsCollection(transport, state, {
         kind: 'collection',
         name: 'teams',
         out: [],
         ...(keys ? { team_keys: keys } : {}),
      });
   }

   roster(): RosterResource<TRoot, AppendResponsePath<TPath, 'roster'>> {
      return RosterResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   matchups(): TeamMatchupsResource<
      TRoot,
      AppendResponsePath<TPath, 'matchups'>
   > {
      return TeamMatchupsResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   stats(): TeamStatsResource<
      TRoot,
      AppendResponsePath<TPath, 'teamStats'>
   > {
      return TeamStatsResource.create(
         this._transport,
         this.createChildState(),
      );
   }

   include<const TSubResources extends readonly TeamSubResource[]>(
      ...subResources: TSubResources
   ): TeamsCollection<
      TRoot,
      TPath,
      TRequiredPath | TeamExpansionPath<TPath, TSubResources[number]>
   > {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      }) as TeamsCollection<
         TRoot,
         TPath,
         TRequiredPath | TeamExpansionPath<TPath, TSubResources[number]>
      >;
   }
}

export class TeamMatchupsResource<
   TRoot = YahooTeamResponseDto,
   TPath extends ResponsePath = readonly ['team', 'matchups'],
> extends Resource<TeamMatchupsParams, RequireResponsePath<TRoot, TPath>> {
   static create<TRoot, TPath extends ResponsePath>(
      transport: Transport,
      state: RequestState,
   ): TeamMatchupsResource<TRoot, TPath> {
      return new TeamMatchupsResource(transport, state, {
         kind: 'subResource',
         name: 'matchups',
      });
   }

   weeks(weeks: readonly (number | `${number}`)[]): this {
      return this.cloneWith({
         weeks: weeks.map((week) => String(week) as `${number}`),
      });
   }
}

export class TeamStatsResource<
   TRoot = YahooTeamResponseDto,
   TPath extends ResponsePath = readonly ['team', 'teamStats'],
> extends Resource<TeamStatsParams, RequireResponsePath<TRoot, TPath>> {
   static create<TRoot, TPath extends ResponsePath>(
      transport: Transport,
      state: RequestState,
   ): TeamStatsResource<TRoot, TPath> {
      return new TeamStatsResource(transport, state, {
         kind: 'subResource',
         name: 'stats',
      });
   }

   week(week: number | `${number}`): Omit<this, 'date'> {
      return this.cloneWith({
         type: 'week',
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): Omit<this, 'week'> {
      return this.cloneWith({
         type: 'date',
         date,
         week: undefined,
      });
   }
}
