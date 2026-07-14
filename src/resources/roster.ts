import type { HttpClient as Transport } from '../client/http';
import {
   type DateString,
   RosterMoveBuilder,
} from './builders/roster-move-builder';
import { PlayersCollection } from './player';
import {
   type RequestState,
   Resource,
   type SubResourceParams,
} from './resource';
import type { PlayerKeyLike } from './types';

type RosterFilters = {
   week?: `${number}`;
   date?: DateString;
};

type RosterParams = SubResourceParams<'roster'> & RosterFilters;

export class RosterResource extends Resource<RosterParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): RosterResource {
      return new RosterResource(transport, state, {
         kind: 'subResource',
         name: 'roster',
      });
   }

   week(week: number | `${number}`): this {
      return this.clone({
         ...this._params,
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): this {
      return this.clone({
         ...this._params,
         date,
         week: undefined,
      });
   }

   players(keys?: PlayerKeyLike[]): PlayersCollection {
      const state = this.createChildState();
      return PlayersCollection.create(this._transport, state, keys);
   }

   update(moves: RosterMoveBuilder): Promise<unknown> {
      return this.put(moves);
   }

   setLineup(moves: RosterMoveBuilder): Promise<unknown> {
      return this.put(moves);
   }

   override async put(
      body?: RosterMoveBuilder | Record<string, unknown> | string,
   ): Promise<unknown> {
      return super.put(
         body instanceof RosterMoveBuilder
            ? body.toXml({
                 week: this._params.week,
                 date: this._params.date,
              })
            : body,
      );
   }
}
