import type { HttpClient as Transport } from '../client/http.js';
import type {
   YahooRosterUpdateConfirmationDto,
   YahooTeamResponseDto,
} from '../domain/normalized.js';
import {
   type DateString,
   RosterMoveBuilder,
} from './builders/roster-move-builder.js';
import { PlayersCollection } from './player.js';
import {
   copyKeys,
   type RequestState,
   Resource,
   type SubResourceParams,
} from './resource.js';
import type {
   AppendResponsePath,
   RequireResponsePath,
   ResponsePath,
} from './response-contract.js';
import type { PlayerKeyLike } from './types.js';

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
      keys: readonly PlayerKeyLike[],
   ): PlayersCollection<TRoot, AppendResponsePath<TPath, 'players'>> {
      return PlayersCollection.create(
         this._transport,
         this.createChildState(),
         copyKeys(keys),
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
