import { describe, expect, it } from 'bun:test';
import { TransactionBuilder } from './transaction-builder.js';

describe('TransactionBuilder', () => {
   describe('add/drop transactions', () => {
      it('builds an add/drop payload with FAAB bid', () => {
         const payload = new TransactionBuilder()
            .forTeam('423.l.12345.t.1')
            .addPlayer('423.p.3333')
            .dropPlayer('423.p.4444')
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
            .forTeam('423.l.12345.t.1')
            .addPlayer('423.p.3333')
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
            .forTeam('423.l.12345.t.1')
            .dropPlayer('423.p.4444')
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

      it('serializes add/drop transactions to XML with correct structure', () => {
         const builder = new TransactionBuilder()
            .forTeam('423.l.12345.t.1')
            .addPlayer('423.p.3333')
            .dropPlayer('423.p.4444')
            .bid(24);

         const xml = builder.toXml();

         expect(xml).toContain('<transaction>');
         expect(xml).toContain('<type>add/drop</type>');
         expect(xml).toContain('<faab_bid>24</faab_bid>');
         expect(xml).toContain('<players>');
         expect(xml).toContain('<player_key>423.p.3333</player_key>');
         expect(xml).toContain('<player_key>423.p.4444</player_key>');
      });

      it('throws if add/drop is missing forTeam()', () => {
         expect(() =>
            new TransactionBuilder().addPlayer('423.p.3333').toPayload(),
         ).toThrow(
            'forTeam(teamKey) is required for add/drop transactions.',
         );
      });

      it('throws if add/drop has no add or drop player', () => {
         expect(() =>
            new TransactionBuilder().forTeam('423.l.12345.t.1').toPayload(),
         ).toThrow(
            'At least one of addPlayer(playerKey) or dropPlayer(playerKey) is required.',
         );
      });
   });

   describe('trade transactions', () => {
      it('builds a pending trade payload for sent, received, and dropped players', () => {
         const payload = new TransactionBuilder()
            .fromTeam('423.l.12345.t.1')
            .toTeam('423.l.12345.t.2')
            .sendPlayers(['423.p.1111'])
            .receivePlayers(['423.p.2222'])
            .dropPlayers(['423.p.3333'])
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
                           type: 'pending_trade',
                           source_team_key: '423.l.12345.t.1',
                        },
                     },
                  ],
               },
            },
         });
      });

      it('omits destination_team_key for dropped players in pending trades', () => {
         const payload = new TransactionBuilder()
            .fromTeam('423.l.12345.t.1')
            .toTeam('423.l.12345.t.2')
            .sendPlayers(['423.p.1111'])
            .dropPlayers(['423.p.3333'])
            .toPayload() as {
            transaction: {
               players: {
                  player: Array<{
                     player_key: string;
                     transaction_data: Record<string, unknown>;
                  }>;
               };
            };
         };

         const dropped = payload.transaction.players.player.find(
            (p) => p.player_key === '423.p.3333',
         );

         expect(dropped?.transaction_data.type).toBe('pending_trade');
         expect(dropped?.transaction_data.source_team_key).toBe(
            '423.l.12345.t.1',
         );
         expect(
            Object.hasOwn(
               dropped?.transaction_data ?? {},
               'destination_team_key',
            ),
         ).toBe(false);
      });

      it('includes trade_note for pending trade payloads when provided', () => {
         const payload = new TransactionBuilder()
            .fromTeam('423.l.12345.t.1')
            .toTeam('423.l.12345.t.2')
            .sendPlayers(['423.p.1111'])
            .note('Fair offer')
            .toPayload();

         expect(payload).toEqual({
            transaction: {
               type: 'pending_trade',
               trader_team_key: '423.l.12345.t.1',
               tradee_team_key: '423.l.12345.t.2',
               trade_note: 'Fair offer',
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
                  ],
               },
            },
         });
      });

      it('copies player arrays passed into trade methods', () => {
         const sent = ['423.p.1111'];
         const received = ['423.p.2222'];
         const dropped = ['423.p.3333'];

         const builder = new TransactionBuilder()
            .fromTeam('423.l.12345.t.1')
            .toTeam('423.l.12345.t.2')
            .sendPlayers(sent)
            .receivePlayers(received)
            .dropPlayers(dropped);

         sent.push('423.p.9999');
         received.push('423.p.8888');
         dropped.push('423.p.7777');

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

      it('serializes trade transactions to XML with correct structure', () => {
         const builder = new TransactionBuilder()
            .fromTeam('423.l.12345.t.1')
            .toTeam('423.l.12345.t.2')
            .sendPlayers(['423.p.1111'])
            .receivePlayers(['423.p.2222'])
            .dropPlayers(['423.p.3333'])
            .note('Fair offer');

         const xml = builder.toXml();

         expect(xml).toContain('<transaction>');
         expect(xml).toContain('<type>pending_trade</type>');
         expect(xml).toContain(
            '<trader_team_key>423.l.12345.t.1</trader_team_key>',
         );
         expect(xml).toContain(
            '<tradee_team_key>423.l.12345.t.2</tradee_team_key>',
         );
         expect(xml).toContain('<trade_note>Fair offer</trade_note>');
         expect(xml).toContain('<players>');
         expect(xml).toContain('<player_key>423.p.1111</player_key>');
         expect(xml).toContain('<player_key>423.p.2222</player_key>');
         expect(xml).toContain('<player_key>423.p.3333</player_key>');
      });

      it('throws if trade is missing fromTeam() or toTeam()', () => {
         expect(() =>
            new TransactionBuilder()
               .fromTeam('423.l.12345.t.1')
               .sendPlayers(['423.p.1111'])
               .toPayload(),
         ).toThrow(
            'fromTeam(teamKey) and toTeam(teamKey) are required for trades.',
         );
      });

      it('throws if trade has no players to send or receive', () => {
         expect(() =>
            new TransactionBuilder()
               .fromTeam('423.l.12345.t.1')
               .toTeam('423.l.12345.t.2')
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
               .forTeam('423.l.12345.t.1')
               // @ts-expect-error testing invalid combination of add/drop and trade fields
               .fromTeam('423.l.12345.t.2')
               .addPlayer('423.p.3333')
               .toPayload(),
         ).toThrow(
            'Cannot mix add/drop and trade fields in the same transaction.',
         );
      });

      it('throws when add/drop fields are mixed with trade note', () => {
         expect(() =>
            new TransactionBuilder()
               .forTeam('423.l.12345.t.1')
               .addPlayer('423.p.3333')
               // @ts-expect-error testing invalid combination of add/drop fields with trade note
               .note('Please accept')
               .toPayload(),
         ).toThrow(
            'Cannot mix add/drop and trade fields in the same transaction.',
         );
      });
   });
});
