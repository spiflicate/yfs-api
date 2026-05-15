import {
   type BaseParams,
   BaseResource,
   type RequestState,
} from '../core/base-resource';
import type { Transport } from '../core/transport';

type TypeLike<T extends string> = T | (string & {});
type GameCode = 'nfl' | 'nba' | 'mlb' | 'nhl';
type LeagueKey = `${number | GameCode}.l.${number}`;
type LeagueKeyLike = TypeLike<LeagueKey>;

// note: leagues and players here are not the same as full resource level leagues and players. These are sub-resources that can be included in the output of a game query, but they do not have the same structure or available endpoints as the full resource collections.
type LeagueSubResource =
   | 'settings'
   | 'standings'
   | 'scoreboard'
   // are these just normal collections chained on?
   | 'teams'
   | 'players'
   | 'transactions';

type LeagueFilters = {
   league_keys?: LeagueKeyLike[];
};

type LeagueResourceParams = BaseParams<
   'resource',
   LeagueSubResource,
   LeagueKeyLike
>;

type LeaguesCollectionParams = BaseParams<'collection', LeagueSubResource> &
   LeagueFilters;

export class LeagueResource extends BaseResource<
   LeagueResourceParams,
   LeagueSubResource,
   'resource'
> {
   static create(
      transport: Transport,
      state: RequestState,
      key: LeagueKeyLike,
   ): LeagueResource {
      return new LeagueResource(transport, state, {
         type: 'resource',
         name: 'league',
         key,
         out: [],
      });
   }

   clone(params: LeagueResourceParams): this {
      return new LeagueResource(this.transport, this.state, params) as this;
   }
}

export class LeaguesCollection extends BaseResource<
   LeaguesCollectionParams,
   LeagueSubResource,
   'collection'
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: LeagueKeyLike[],
   ): LeaguesCollection {
      return new LeaguesCollection(transport, state, {
         type: 'collection',
         name: 'leagues',
         league_keys: keys ? [...keys] : undefined,
         out: [],
      });
   }

   clone(params: LeaguesCollectionParams): this {
      // Safe as long as LeaguesCollection is not subclassed without overriding clone().
      return new LeaguesCollection(
         this.transport,
         this.state,
         params,
      ) as this;
   }

   filters(filters: Partial<LeagueFilters>): LeaguesCollection {
      const params: LeaguesCollectionParams = {
         ...this.params,
      };

      return new LeaguesCollection(this.transport, this.state, params);
   }

   async get(): Promise<unknown> {
      const raw = await this.transport.get(this.toPath());
      return raw;
   }
}
