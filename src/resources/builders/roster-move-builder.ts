import { XMLBuilder } from 'fast-xml-parser';
import type { PlayerKeyLike } from '../types';

export type DateString = `${number}-${number}-${number}`;

export type RosterMove = {
   playerKey: PlayerKeyLike;
   position: string;
};

export type RosterMovePayload = {
   roster:
      | {
           coverage_type: 'week';
           week: `${number}`;
           players: {
              player: Array<{
                 player_key: PlayerKeyLike;
                 position: string;
              }>;
           };
        }
      | {
           coverage_type: 'date';
           date: DateString;
           players: {
              player: Array<{
                 player_key: PlayerKeyLike;
                 position: string;
              }>;
           };
        };
};

type CoverageDefaults = {
   week?: number | `${number}`;
   date?: DateString;
};

/**
 * Fluent builder for Yahoo roster move payloads.
 */
export class RosterMoveBuilder {
   private weekValue?: `${number}`;
   private dateValue?: DateString;
   private rosterMoves: RosterMove[] = [];

   week(week: number | `${number}`): this {
      this.weekValue = String(week) as `${number}`;
      this.dateValue = undefined;
      return this;
   }

   date(date: DateString): this {
      this.dateValue = date;
      this.weekValue = undefined;
      return this;
   }

   movePlayer(playerKey: PlayerKeyLike, position: string): this {
      this.rosterMoves.push({ playerKey, position });
      return this;
   }

   players(players: readonly RosterMove[]): this {
      this.rosterMoves = players.map((player) => ({ ...player }));
      return this;
   }

   toXml(defaults?: CoverageDefaults): string {
      const xmlBuilder = new XMLBuilder({
         ignoreAttributes: false,
         format: false,
      });

      return `<?xml version="1.0" encoding="UTF-8"?>${xmlBuilder.build({ fantasy_content: this.toPayload(defaults) })}`;
   }

   toPayload(defaults?: CoverageDefaults): RosterMovePayload {
      if (this.rosterMoves.length === 0) {
         throw new Error(
            'At least one roster move is required. Use movePlayer() or players().',
         );
      }

      const players = {
         player: this.rosterMoves.map((player) => ({
            player_key: player.playerKey,
            position: player.position,
         })),
      };

      if (this.weekValue) {
         this.validateCoverageDefaults(defaults, 'week');
         return {
            roster: {
               coverage_type: 'week',
               week: this.weekValue,
               players,
            },
         };
      }

      if (this.dateValue) {
         this.validateCoverageDefaults(defaults, 'date');
         return {
            roster: {
               coverage_type: 'date',
               date: this.dateValue,
               players,
            },
         };
      }

      if (defaults?.week !== undefined) {
         if (defaults.date !== undefined) {
            throw new Error(
               'Roster coverage defaults cannot include both week and date.',
            );
         }

         return {
            roster: {
               coverage_type: 'week',
               week: String(defaults.week) as `${number}`,
               players,
            },
         };
      }

      if (defaults?.date !== undefined) {
         return {
            roster: {
               coverage_type: 'date',
               date: defaults.date,
               players,
            },
         };
      }

      throw new Error('Roster coverage is required. Use week() or date().');
   }

   private validateCoverageDefaults(
      defaults: CoverageDefaults | undefined,
      explicitCoverageType: 'week' | 'date',
   ): void {
      if (!defaults) {
         return;
      }

      if (explicitCoverageType === 'week' && defaults.date !== undefined) {
         throw new Error(
            'Roster coverage conflict: builder uses week() but defaults specify date.',
         );
      }

      if (explicitCoverageType === 'date' && defaults.week !== undefined) {
         throw new Error(
            'Roster coverage conflict: builder uses date() but defaults specify week.',
         );
      }
   }
}
