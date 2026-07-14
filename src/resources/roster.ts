import type { HttpClient as Transport } from '../client/http';
import type {
   YahooRosterUpdateConfirmationDto,
   YahooTeamResponseDto,
} from '../domain/normalized';
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
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract';
import type { PlayerKeyLike } from './types';

type RosterParams = SubResourceParams<'roster'> & {
   week?: `${number}`;
   date?: DateString;
};

export class RosterResource<
   TRoot = YahooTeamResponseDto,
   TPath extends ResponsePath = readonly ['team', 'roster'],
> extends Resource<
   RosterParams,
   RequireResponsePath<TRoot, TPath>,
   YahooRosterUpdateConfirmationDto
> {
   static create<TRoot, TPath extends ResponsePath>(
      transport: Transport,
      state: RequestState,
   ): RosterResource<TRoot, TPath> {
      return new RosterResource(transport, state, {
         kind: 'subResource',
         name: 'roster',
      });
   }

   week(week: number | `${number}`): this {
      return this.cloneWith({
         week: String(week) as `${number}`,
         date: undefined,
      });
   }

   date(date: DateString): this {
      return this.cloneWith({ date, week: undefined });
   }

   players(
      keys?: PlayerKeyLike[],
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>> {
      return PlayersCollection.create(
         this._transport,
         this.createChildState(),
         keys,
      );
   }

   update(
      moves: RosterMoveBuilder,
   ): Promise<YahooRosterUpdateConfirmationDto | undefined> {
      return this.put(moves);
   }

   setLineup(
      moves: RosterMoveBuilder,
   ): Promise<YahooRosterUpdateConfirmationDto | undefined> {
      return this.put(moves);
   }

   override async put(
      body?: RosterMoveBuilder | Record<string, unknown> | string,
   ): Promise<YahooRosterUpdateConfirmationDto | undefined> {
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
