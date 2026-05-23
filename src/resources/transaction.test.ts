import { describe, expect, it } from 'bun:test';
import { ValidationError } from '../client/errors';
import { TransactionResource, TransactionsCollection } from './transaction';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

describe('TransactionResource', () => {
   it('creates a transaction resource and includes players', () => {
      const resource = TransactionResource.create(
         transport,
         emptyState,
         'nfl.l.123.tr.9',
      );

      expect(resource.toPath()).toBe('transaction/nfl.l.123.tr.9');
      expect(resource.players().toPath()).toBe(
         'transaction/nfl.l.123.tr.9;out=players',
      );
   });
});

describe('TransactionsCollection', () => {
   it('serializes transaction collection filters', () => {
      const collection = TransactionsCollection.create(
         transport,
         emptyState,
         ['nfl.l.123.tr.9'],
      )
         .types(['waiver', 'trade'])
         .teamKey('nfl.l.123.t.1')
         .start(25)
         .count(25)
         .players();

      expect(collection.toPath()).toBe(
         'transactions;out=players;transaction_keys=nfl.l.123.tr.9;types=waiver,trade;team_key=nfl.l.123.t.1;start=25;count=25',
      );
   });

   it('rejects waiver filters without a team key', () => {
      const collection = TransactionsCollection.create(
         transport,
         emptyState,
      )
         .types('waiver', 'trade')
         .count(25);

      expect(() => collection.toPath()).toThrow(ValidationError);
      expect(() => collection.toPath()).toThrow(
         'teamKey(team_key) is required when filtering transactions by waiver or pending_trade.',
      );
   });

   it('rejects pending_trade filters from params() without a team key', () => {
      const collection = TransactionsCollection.create(
         transport,
         emptyState,
      )
         .params({ type: 'pending_trade' })
         .count(25);

      expect(() => collection.toPath()).toThrow(ValidationError);
   });

   it('allows waiver filters when a team key is provided', () => {
      const collection = TransactionsCollection.create(
         transport,
         emptyState,
      )
         .types('waiver')
         .teamKey('nfl.l.123.t.1')
         .count(25);

      expect(collection.toPath()).toBe(
         'transactions;types=waiver;team_key=nfl.l.123.t.1;count=25',
      );
   });
});
