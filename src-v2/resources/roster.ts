import type { HttpClient as Transport } from '../client/http';
import type { RequestState } from './base-resource';
import { PlayersCollection } from './player';
import type { PlayerKeyLike } from './types';

type DateString = `${number}-${number}-${number}`;

type RosterParams = {
   week?: `${number}`;
   date?: DateString;
};

abstract class BaseRosterQuery<TParams extends RosterParams> {
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
      const state = {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
      };
      return PlayersCollection.create(this._transport, state, keys);
   }

   protected serialize(): string {
      const params = [
         this._params.week
            ? `;week=${encodeURIComponent(this._params.week)}`
            : '',
         this._params.date
            ? `;date=${encodeURIComponent(this._params.date)}`
            : '',
      ].join('');

      return `roster${params}`;
   }
}

export class RosterResource extends BaseRosterQuery<RosterParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): RosterResource {
      return new RosterResource(transport, state, {});
   }

   clone(params: RosterParams): this {
      return new RosterResource(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}

export class RostersCollection extends BaseRosterQuery<RosterParams> {
   static create(
      transport: Transport,
      state: RequestState,
   ): RostersCollection {
      return new RostersCollection(transport, state, {});
   }

   clone(params: RosterParams): this {
      return new RostersCollection(
         this._transport,
         this._state,
         params,
      ) as this;
   }
}
