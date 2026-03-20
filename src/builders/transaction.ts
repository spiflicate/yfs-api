import type { PlayerKey, TeamKey } from '../types/request/graph.js';

type TransactionMode = 'undetermined' | 'addDrop' | 'trade';

/**
 * Fluent builder for Yahoo transaction request payloads.
 */
export class TransactionBuilder {
   private forTeamKey?: TeamKey;
   private fromTeamKey?: TeamKey;
   private toTeamKeyValue?: TeamKey;
   private addPlayerKey?: PlayerKey;
   private dropPlayerKey?: PlayerKey;
   private sentPlayers: PlayerKey[] = [];
   private receivedPlayers: PlayerKey[] = [];
   private droppedPlayers: PlayerKey[] = [];
   private faabBid?: number;
   private tradeNote?: string;

   forTeam(teamKey: TeamKey): this {
      this.forTeamKey = teamKey;
      return this;
   }

   fromTeam(teamKey: TeamKey): this {
      this.fromTeamKey = teamKey;
      return this;
   }

   toTeam(teamKey: TeamKey): this {
      this.toTeamKeyValue = teamKey;
      return this;
   }

   addPlayer(playerKey: PlayerKey): this {
      this.addPlayerKey = playerKey;
      return this;
   }

   dropPlayer(playerKey: PlayerKey): this {
      this.dropPlayerKey = playerKey;
      return this;
   }

   sendPlayers(playerKeys: PlayerKey[]): this {
      this.sentPlayers = [...playerKeys];
      return this;
   }

   receivePlayers(playerKeys: PlayerKey[]): this {
      this.receivedPlayers = [...playerKeys];
      return this;
   }

   dropPlayers(playerKeys: PlayerKey[]): this {
      this.droppedPlayers = [...playerKeys];
      return this;
   }

   bid(amount: number): this {
      this.faabBid = amount;
      return this;
   }

   note(text: string): this {
      this.tradeNote = text;
      return this;
   }

   toPayload(): Record<string, unknown> {
      const mode = this.getMode();
      if (mode === 'addDrop') {
         return { transaction: this.buildAddDropTransaction() };
      }
      if (mode === 'trade') {
         return { transaction: this.buildTradeTransaction() };
      }

      throw new Error(
         'Cannot infer transaction type. Provide add/drop details or trade details.',
      );
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

   private buildAddDropTransaction(): Record<string, unknown> {
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
            type: 'add/drop',
            ...(this.faabBid !== undefined
               ? { faab_bid: String(this.faabBid) }
               : {}),
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
         };
      }

      if (this.addPlayerKey) {
         return {
            type: 'add',
            ...(this.faabBid !== undefined
               ? { faab_bid: String(this.faabBid) }
               : {}),
            player: {
               player_key: this.addPlayerKey,
               transaction_data: {
                  type: 'add',
                  destination_team_key: this.forTeamKey,
               },
            },
         };
      }

      return {
         type: 'drop',
         player: {
            player_key: this.dropPlayerKey,
            transaction_data: {
               type: 'drop',
               source_team_key: this.forTeamKey,
            },
         },
      };
   }

   private buildTradeTransaction(): Record<string, unknown> {
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

      const players: Array<Record<string, unknown>> = [];

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
