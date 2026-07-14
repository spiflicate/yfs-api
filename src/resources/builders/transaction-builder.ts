import { XMLBuilder } from 'fast-xml-parser';
import type { PlayerKeyLike, TeamKeyLike } from '../types';

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

export abstract class TransactionBuilder<
   TPayload extends TransactionPayload = TransactionPayload,
> {
   static newAddDrop(): AddDropTransactionBuilder {
      return new AddDropTransactionBuilder();
   }

   static newTrade(): TradeTransactionBuilder {
      return new TradeTransactionBuilder();
   }
   toXml(): string {
      const payload = this.toPayload();
      const xmlBuilder = new XMLBuilder({
         ignoreAttributes: false,
         format: false,
      });

      return `<?xml version="1.0" encoding="UTF-8"?>${xmlBuilder.build({ fantasy_content: payload })}`;
   }

   abstract toPayload(): TPayload;
}

/**
 * Fluent builder for Yahoo add/drop transaction request payloads.
 */
export class AddDropTransactionBuilder extends TransactionBuilder<
   | AddDropTransactionPayload
   | AddTransactionPayload
   | DropTransactionPayload
> {
   private forTeamKey?: TeamKeyLike;
   private addPlayerKey?: PlayerKeyLike;
   private dropPlayerKey?: PlayerKeyLike;
   private faabBid?: number;

   forTeam(teamKey: TeamKeyLike): this {
      this.forTeamKey = teamKey;
      return this;
   }

   addPlayer(playerKey: PlayerKeyLike): this {
      this.addPlayerKey = playerKey;
      return this;
   }

   dropPlayer(playerKey: PlayerKeyLike): this {
      this.dropPlayerKey = playerKey;
      return this;
   }

   bid(amount: number): this {
      this.faabBid = amount;
      return this;
   }

   toPayload():
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
         return {
            transaction: {
               type: 'add/drop',
               ...this.formatFaabBid(),
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
         return {
            transaction: {
               type: 'add',
               ...this.formatFaabBid(),
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

   private formatFaabBid(): Partial<
      Pick<AddDropTransactionPayload['transaction'], 'faab_bid'>
   > {
      if (this.faabBid === undefined) {
         return {};
      }

      return { faab_bid: String(this.faabBid) as `${number}` };
   }
}

/**
 * Fluent builder for Yahoo trade transaction request payloads.
 */
export class TradeTransactionBuilder extends TransactionBuilder<PendingTradeTransactionPayload> {
   private fromTeamKey?: TeamKeyLike;
   private toTeamKeyValue?: TeamKeyLike;
   private sentPlayers: PlayerKeyLike[] = [];
   private receivedPlayers: PlayerKeyLike[] = [];
   private droppedPlayers: PlayerKeyLike[] = [];
   private tradeNote?: string;

   fromTeam(teamKey: TeamKeyLike): this {
      this.fromTeamKey = teamKey;
      return this;
   }

   toTeam(teamKey: TeamKeyLike): this {
      this.toTeamKeyValue = teamKey;
      return this;
   }

   sendPlayers(playerKeys: PlayerKeyLike[]): this {
      this.sentPlayers = [...playerKeys];
      return this;
   }

   receivePlayers(playerKeys: PlayerKeyLike[]): this {
      this.receivedPlayers = [...playerKeys];
      return this;
   }

   dropPlayers(playerKeys: PlayerKeyLike[]): this {
      this.droppedPlayers = [...playerKeys];
      return this;
   }

   note(text: string): this {
      this.tradeNote = text;
      return this;
   }

   toPayload(): PendingTradeTransactionPayload {
      return { transaction: this.buildTradeTransaction() };
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
