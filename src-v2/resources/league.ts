import type { HttpClient as Transport } from '../client/http';
import {
   Collection,
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './base-resource';
import type { LeagueKeyLike } from './types';

// note: leagues and players here are not the same as full resource level leagues and players. These are sub-resources that can be included in the output of a game query, but they do not have the same structure or available endpoints as the full resource collections.
type LeagueSubResource =
   | 'settings'
   | 'standings'
   | 'scoreboard'
   | 'draft_results' //needs to be confirmed
   | 'draftresults'; // alternate spelling for collections
// are these just normal collections chained on?
// | 'teams'
// | 'players'
// | 'transactions';

type LeagueResourceParams = ResourceParams<
   Exclude<LeagueSubResource, 'draftresults'>,
   LeagueKeyLike
>;

type LeaguesCollectionParams = CollectionParams<
   Exclude<LeagueSubResource, 'draft_results'>,
   LeagueKeyLike,
   'leagues'
>;

export class LeagueResource extends Resource<
   LeagueResourceParams,
   Exclude<LeagueSubResource, 'draftresults'>
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

   teams(): never {
      throw new Error('Not implemented');
   }

   players(): never {
      throw new Error('Not implemented');
   }

   transactions(): never {
      throw new Error('Not implemented');
   }

   clone(params: LeagueResourceParams): this {
      return new LeagueResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class LeaguesCollection extends Collection<
   LeaguesCollectionParams,
   Exclude<LeagueSubResource, 'draft_results'>
> {
   static create(
      transport: Transport,
      state: RequestState,
      keys?: LeagueKeyLike[],
   ): LeaguesCollection {
      return new LeaguesCollection(transport, state, {
         type: 'collection',
         name: 'leagues',
         out: [],
         ...(keys ? { league_keys: keys } : {}),
      });
   }

   teams(): never {
      throw new Error('Not implemented');
   }

   players(): never {
      throw new Error('Not implemented');
   }

   transactions(): never {
      throw new Error('Not implemented');
   }

   clone(params: LeaguesCollectionParams): this {
      // Safe as long as LeaguesCollection is not subclassed without overriding clone().
      return new LeaguesCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
