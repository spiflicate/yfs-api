import { XMLBuilder } from 'fast-xml-parser';
import type { PlayerKeyLike, TeamKeyLike } from '../types';

type TransactionType = 'add' | 'drop' | 'add/drop' | 'pending_trade';

type TransactionMode = 'addDrop' | 'trade' | 'undetermined';

type AddTransactionPlayer = {
   player_key: PlayerKeyLike;
   transaction_data: {
      type: 'add';
      destination_team_key: TeamKeyLike;
   };
};

type DropTransactionPlayer = {
   player_key: PlayerKeyLike;
   transaction_data: {
      type: 'drop';
      source_team_key: TeamKeyLike;
   };
};

type PendingTradePlayer = {
   player_key: PlayerKeyLike;
   transaction_data:
      | {
           type: 'pending_trade';
           source_team_key: TeamKeyLike;
           destination_team_key: TeamKeyLike;
        }
      | {
           type: 'pending_trade';
           source_team_key: TeamKeyLike;
        };
};

export type AddDropTransactionPayload = {
   transaction: {
      type: 'add/drop';
      faab_bid?: `${number}`;
      players: {
         player: [AddTransactionPlayer, DropTransactionPlayer];
      };
   };
};

export type AddTransactionPayload = {
   transaction: {
      type: 'add';
      faab_bid?: `${number}`;
      player: AddTransactionPlayer;
   };
};

export type DropTransactionPayload = {
   transaction: {
      type: 'drop';
      player: DropTransactionPlayer;
   };
};

export type PendingTradeTransactionPayload = {
   transaction: {
      type: 'pending_trade';
      trader_team_key: TeamKeyLike;
      tradee_team_key: TeamKeyLike;
      trade_note?: string;
      players: {
         player: PendingTradePlayer[];
      };
   };
};

export type TransactionPayload =
   | AddDropTransactionPayload
   | AddTransactionPayload
   | DropTransactionPayload
   | PendingTradeTransactionPayload;

type TradeOnlyMethods =
   | 'fromTeam'
   | 'toTeam'
   | 'sendPlayers'
   | 'receivePlayers'
   | 'dropPlayers'
   | 'note';
type AddDropOnlyMethods = 'forTeam' | 'addPlayer' | 'dropPlayer' | 'bid';
type AlwaysAvailableMethods = 'toXml' | 'toPayload';

/**
 * Fluent builder for Yahoo transaction request payloads.
 */
export class TransactionBuilder {
   private forTeamKey?: TeamKeyLike;
   private fromTeamKey?: TeamKeyLike;
   private toTeamKeyValue?: TeamKeyLike;
   private addPlayerKey?: PlayerKeyLike;
   private dropPlayerKey?: PlayerKeyLike;
   private sentPlayers: PlayerKeyLike[] = [];
   private receivedPlayers: PlayerKeyLike[] = [];
   private droppedPlayers: PlayerKeyLike[] = [];
   private faabBid?: number;
   private tradeNote?: string;
   #type?: TransactionType;

   forTeam(teamKey: TeamKeyLike): Omit<this, 'forTeam' | TradeOnlyMethods> {
      this.#setType('add/drop');
      this.forTeamKey = teamKey;
      return this;
   }

   fromTeam(
      teamKey: TeamKeyLike,
   ): Omit<this, 'fromTeam' | AddDropOnlyMethods> {
      this.#setType('pending_trade');
      this.fromTeamKey = teamKey;
      return this;
   }

   toTeam(teamKey: TeamKeyLike): Omit<this, 'toTeam' | AddDropOnlyMethods> {
      this.#setType('pending_trade');
      this.toTeamKeyValue = teamKey;
      return this;
   }

   addPlayer(
      playerKey: PlayerKeyLike,
   ): Pick<this, AddDropOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('add/drop');
      this.addPlayerKey = playerKey;
      return this;
   }

   dropPlayer(
      playerKey: PlayerKeyLike,
   ): Pick<this, AddDropOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('add/drop');
      this.dropPlayerKey = playerKey;
      return this;
   }

   sendPlayers(
      playerKeys: PlayerKeyLike[],
   ): Pick<this, TradeOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('pending_trade');
      this.sentPlayers = [...playerKeys];
      return this;
   }

   receivePlayers(
      playerKeys: PlayerKeyLike[],
   ): Pick<this, TradeOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('pending_trade');
      this.receivedPlayers = [...playerKeys];
      return this;
   }

   dropPlayers(
      playerKeys: PlayerKeyLike[],
   ): Pick<this, TradeOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('pending_trade');
      this.droppedPlayers = [...playerKeys];
      return this;
   }

   bid(
      amount: number,
   ): Pick<this, AddDropOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('add/drop');
      this.faabBid = amount;
      return this;
   }

   note(
      text: string,
   ): Pick<this, TradeOnlyMethods | AlwaysAvailableMethods> {
      this.#setType('pending_trade');
      this.tradeNote = text;
      return this;
   }

   toXml(): string {
      const payload = this.toPayload();
      const xmlBuilder = new XMLBuilder({
         ignoreAttributes: false,
         format: false,
      });

      return `<?xml version="1.0" encoding="UTF-8"?>${xmlBuilder.build({ fantasy_content: payload })}`;
   }

   // fromJson(json: Record<string, unknown>): this {
   //    // Consider implementing this if needed for testing or other purposes
   //    throw new Error('fromJson is not implemented.');
   // }

   toPayload(): TransactionPayload {
      const mode = this.getMode();
      if (mode === 'addDrop') {
         return this.buildAddDropTransactionPayload();
      }
      if (mode === 'trade') {
         return { transaction: this.buildTradeTransaction() };
      }

      throw new Error(
         'Cannot infer transaction type. Provide add/drop details or trade details.',
      );
   }

   #setType(type: TransactionType): void {
      // Only set type once, based on the first method called that provides a clear indication of transaction type.
      if (this.#type === undefined) {
         this.#type = type;
      }
   }

   private getMode(): TransactionMode {
      const hasTradeShape =
         !!this.fromTeamKey ||
         !!this.toTeamKeyValue ||
         this.sentPlayers.length > 0 ||
         this.receivedPlayers.length > 0 ||
         this.droppedPlayers.length > 0 ||
         this.tradeNote !== undefined;
      const hasAddDropShape =
         !!this.forTeamKey ||
         !!this.addPlayerKey ||
         !!this.dropPlayerKey ||
         this.faabBid !== undefined;

      if (hasTradeShape && hasAddDropShape) {
         throw new Error(
            'Cannot mix add/drop and trade fields in the same transaction.',
         );
      }

      if (hasAddDropShape) return 'addDrop';
      if (hasTradeShape) return 'trade';
      return 'undetermined';
   }

   private buildAddDropTransactionPayload():
      | AddDropTransactionPayload
      | AddTransactionPayload
      | DropTransactionPayload {
      if (!this.forTeamKey) {
         throw new Error(
            'forTeam(teamKey) is required for add/drop transactions.',
         );
      }
      if (!this.addPlayerKey && !this.dropPlayerKey) {
         throw new Error(
            'At least one of addPlayer(playerKey) or dropPlayer(playerKey) is required.',
         );
      }

      if (this.addPlayerKey && this.dropPlayerKey) {
         const faabBid =
            this.faabBid !== undefined
               ? ({
                    faab_bid: String(this.faabBid) as `${number}`,
                 } as const)
               : {};

         return {
            transaction: {
               type: 'add/drop',
               ...faabBid,
               players: {
                  player: [
                     {
                        player_key: this.addPlayerKey,
                        transaction_data: {
                           type: 'add',
                           destination_team_key: this.forTeamKey,
                        },
                     },
                     {
                        player_key: this.dropPlayerKey,
                        transaction_data: {
                           type: 'drop',
                           source_team_key: this.forTeamKey,
                        },
                     },
                  ],
               },
            },
         };
      }

      if (this.addPlayerKey) {
         const faabBid =
            this.faabBid !== undefined
               ? ({
                    faab_bid: String(this.faabBid) as `${number}`,
                 } as const)
               : {};

         return {
            transaction: {
               type: 'add',
               ...faabBid,
               player: {
                  player_key: this.addPlayerKey,
                  transaction_data: {
                     type: 'add',
                     destination_team_key: this.forTeamKey,
                  },
               },
            },
         };
      }

      const dropPlayerKey = this.dropPlayerKey;
      if (!dropPlayerKey) {
         throw new Error(
            'At least one of addPlayer(playerKey) or dropPlayer(playerKey) is required.',
         );
      }

      return {
         transaction: {
            type: 'drop',
            player: {
               player_key: dropPlayerKey,
               transaction_data: {
                  type: 'drop',
                  source_team_key: this.forTeamKey,
               },
            },
         },
      };
   }

   private buildTradeTransaction(): PendingTradeTransactionPayload['transaction'] {
      if (!this.fromTeamKey || !this.toTeamKeyValue) {
         throw new Error(
            'fromTeam(teamKey) and toTeam(teamKey) are required for trades.',
         );
      }
      if (
         this.sentPlayers.length === 0 &&
         this.receivedPlayers.length === 0
      ) {
         throw new Error(
            'At least one of sendPlayers() or receivePlayers() is required for trades.',
         );
      }

      const players: PendingTradePlayer[] = [];

      for (const playerKey of this.sentPlayers) {
         players.push({
            player_key: playerKey,
            transaction_data: {
               type: 'pending_trade',
               source_team_key: this.fromTeamKey,
               destination_team_key: this.toTeamKeyValue,
            },
         });
      }

      for (const playerKey of this.receivedPlayers) {
         players.push({
            player_key: playerKey,
            transaction_data: {
               type: 'pending_trade',
               source_team_key: this.toTeamKeyValue,
               destination_team_key: this.fromTeamKey,
            },
         });
      }

      for (const playerKey of this.droppedPlayers) {
         players.push({
            player_key: playerKey,
            transaction_data: {
               // Yahoo docs/examples are ambiguous for trade-related drops.
               // We currently send pending_trade (without destination_team_key)
               // but this may need to be type: 'drop' for some leagues.
               type: 'pending_trade',
               source_team_key: this.fromTeamKey,
            },
         });
      }

      return {
         type: 'pending_trade',
         trader_team_key: this.fromTeamKey,
         tradee_team_key: this.toTeamKeyValue,
         ...(this.tradeNote ? { trade_note: this.tradeNote } : {}),
         players: {
            player: players,
         },
      };
   }
}
