import { describe, expect, it } from 'bun:test';
import { TransactionBuilder } from '../../src/request/transaction.js';
import type { PlayerKey, TeamKey } from '../../src/types/request/graph.js';

const team = (value: string): TeamKey => value as TeamKey;
const player = (value: string): PlayerKey => value as PlayerKey;

describe('TransactionBuilder', () => {
   describe('add/drop transactions', () => {
      it('builds an add/drop payload with FAAB bid', () => {
         const payload = new TransactionBuilder()
            .forTeam(team('423.l.12345.t.1'))
            .addPlayer(player('423.p.3333'))
            .dropPlayer(player('423.p.4444'))
            .bid(24)
            .toPayload();

         expect(payload).toEqual({
            transaction: {
               type: 'add/drop',
               faab_bid: '24',
               players: {
                  player: [
                     {
                        player_key: '423.p.3333',
                        transaction_data: {
                           type: 'add',
                           destination_team_key: '423.l.12345.t.1',
                        },
                     },
                     {
                        player_key: '423.p.4444',
                        transaction_data: {
                           type: 'drop',
                           source_team_key: '423.l.12345.t.1',
                        },
                     },
                  ],
               },
            },
         });
      });

      it('builds an add-only payload', () => {
         const payload = new TransactionBuilder()
            .forTeam(team('423.l.12345.t.1'))
            .addPlayer(player('423.p.3333'))
            .toPayload();

         expect(payload).toEqual({
            transaction: {
               type: 'add',
               player: {
                  player_key: '423.p.3333',
                  transaction_data: {
                     type: 'add',
                     destination_team_key: '423.l.12345.t.1',
                  },
               },
            },
         });
      });

      it('builds a drop-only payload', () => {
         const payload = new TransactionBuilder()
            .forTeam(team('423.l.12345.t.1'))
            .dropPlayer(player('423.p.4444'))
            .toPayload();

         expect(payload).toEqual({
            transaction: {
               type: 'drop',
               player: {
                  player_key: '423.p.4444',
                  transaction_data: {
                     type: 'drop',
                     source_team_key: '423.l.12345.t.1',
                  },
               },
            },
         });
      });

      it('throws if add/drop is missing forTeam()', () => {
         expect(() =>
            new TransactionBuilder()
               .addPlayer(player('423.p.3333'))
               .toPayload(),
         ).toThrow(
            'forTeam(teamKey) is required for add/drop transactions.',
         );
      });

      it('throws if add/drop has no add or drop player', () => {
         expect(() =>
            new TransactionBuilder()
               .forTeam(team('423.l.12345.t.1'))
               .toPayload(),
         ).toThrow(
            'At least one of addPlayer(playerKey) or dropPlayer(playerKey) is required.',
         );
      });
   });

   describe('trade transactions', () => {
      it('builds a pending trade payload for sent, received, and dropped players', () => {
         const payload = new TransactionBuilder()
            .fromTeam(team('423.l.12345.t.1'))
            .toTeam(team('423.l.12345.t.2'))
            .sendPlayers([player('423.p.1111')])
            .receivePlayers([player('423.p.2222')])
            .dropPlayers([player('423.p.3333')])
            .toPayload();

         expect(payload).toEqual({
            transaction: {
               type: 'pending_trade',
               trader_team_key: '423.l.12345.t.1',
               tradee_team_key: '423.l.12345.t.2',
               players: {
                  player: [
                     {
                        player_key: '423.p.1111',
                        transaction_data: {
                           type: 'pending_trade',
                           source_team_key: '423.l.12345.t.1',
                           destination_team_key: '423.l.12345.t.2',
                        },
                     },
                     {
                        player_key: '423.p.2222',
                        transaction_data: {
                           type: 'pending_trade',
                           source_team_key: '423.l.12345.t.2',
                           destination_team_key: '423.l.12345.t.1',
                        },
                     },
                     {
                        player_key: '423.p.3333',
                        transaction_data: {
                           type: 'drop',
                           source_team_key: '423.l.12345.t.1',
                        },
                     },
                  ],
               },
            },
         });
      });

      it('copies player arrays passed into trade methods', () => {
         const sent = [player('423.p.1111')];
         const received = [player('423.p.2222')];
         const dropped = [player('423.p.3333')];

         const builder = new TransactionBuilder()
            .fromTeam(team('423.l.12345.t.1'))
            .toTeam(team('423.l.12345.t.2'))
            .sendPlayers(sent)
            .receivePlayers(received)
            .dropPlayers(dropped);

         sent.push(player('423.p.9999'));
         received.push(player('423.p.8888'));
         dropped.push(player('423.p.7777'));

         const payload = builder.toPayload() as {
            transaction: {
               players: { player: Array<{ player_key: string }> };
            };
         };

         expect(payload.transaction.players.player).toHaveLength(3);
         expect(
            payload.transaction.players.player.map((p) => p.player_key),
         ).toEqual(['423.p.1111', '423.p.2222', '423.p.3333']);
      });

      it('throws if trade is missing fromTeam() or toTeam()', () => {
         expect(() =>
            new TransactionBuilder()
               .fromTeam(team('423.l.12345.t.1'))
               .sendPlayers([player('423.p.1111')])
               .toPayload(),
         ).toThrow(
            'fromTeam(teamKey) and toTeam(teamKey) are required for trades.',
         );
      });

      it('throws if trade has no players to send or receive', () => {
         expect(() =>
            new TransactionBuilder()
               .fromTeam(team('423.l.12345.t.1'))
               .toTeam(team('423.l.12345.t.2'))
               .toPayload(),
         ).toThrow(
            'At least one of sendPlayers() or receivePlayers() is required for trades.',
         );
      });
   });

   describe('mode inference', () => {
      it('throws when no transaction details are provided', () => {
         expect(() => new TransactionBuilder().toPayload()).toThrow(
            'Cannot infer transaction type. Provide add/drop details or trade details.',
         );
      });

      it('throws when add/drop and trade fields are mixed', () => {
         expect(() =>
            new TransactionBuilder()
               .forTeam(team('423.l.12345.t.1'))
               .fromTeam(team('423.l.12345.t.2'))
               .addPlayer(player('423.p.3333'))
               .toPayload(),
         ).toThrow(
            'Cannot mix add/drop and trade fields in the same transaction.',
         );
      });
   });
});
