import { describe, expect, it } from 'bun:test';
import type { HttpClient as Transport } from '../client/http';
import { type RequestState, Resource } from './resource';

type TestSubResource = 'metadata' | 'players';

type TestParams =
   | {
        type: 'resource';
        name: 'league';
        key: string;
        out: TestSubResource[];
        lang?: string;
        flags?: readonly boolean[];
        empty?: null;
     }
   | {
        type: 'collection';
        name: 'leagues';
        out: TestSubResource[];
        page?: number;
     };

class TestQuery extends Resource<TestParams, TestSubResource> {
   static resource(
      params: Extract<TestParams, { type: 'resource' }>,
   ): TestQuery {
      return new TestQuery(transport, state, params);
   }

   static collection(
      params: Extract<TestParams, { type: 'collection' }>,
   ): TestQuery {
      return new TestQuery(transport, state, params);
   }

   protected override clone(params: TestParams): this {
      return new TestQuery(this._transport, this._state, params) as this;
   }

   protected override serialize(): string {
      return this.serialize();
   }
}
// biome-ignore lint/suspicious/noExplicitAny: intentional for testing abstract class
const transport = {} as any satisfies Transport;

const state: RequestState = {
   segments: ['fantasy', 'v2'],
};

describe('BaseQuery', () => {
   it('builds a resource path and serializes non-reserved params', () => {
      const query = TestQuery.resource({
         type: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: ['metadata', 'players'],
         lang: 'en us',
         flags: [true, false],
         empty: null,
      });

      expect(query.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players;lang=en%20us;flags=true,false;empty=',
      );
   });

   it('builds a collection path without resource keys', () => {
      const query = TestQuery.collection({
         type: 'collection',
         name: 'leagues',
         out: ['players'],
         page: 2,
      });

      expect(query.toPath()).toBe('fantasy/v2/leagues;out=players;page=2');
   });

   it('returns a cloned query when including sub-resources', () => {
      const original = TestQuery.resource({
         type: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: ['metadata'],
      });

      const updated = original.include('players');

      expect(original.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata',
      );
      expect(updated.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players',
      );
      expect(updated).not.toBe(original);
   });
});
