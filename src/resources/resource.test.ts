import { describe, expect, it } from 'bun:test';
import type { HttpClient as Transport } from '../client/http';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';

const requests: string[] = [];

type TestSubResource = 'metadata' | 'players';

type TestResourceParams = ResourceParams<TestSubResource> & {
   name: 'league';
   key: string;
   lang?: string;
   flags?: readonly boolean[];
   empty?: null;
};

type TestCollectionParams = CollectionParams<
   TestSubResource,
   string,
   'leagues'
> & {
   name: 'leagues';
   page?: number;
};

class TestResourceQuery extends Resource<TestResourceParams> {
   static create(params: TestResourceParams): TestResourceQuery {
      return new TestResourceQuery(transport, state, params);
   }
   getParams(): TestResourceParams {
      return this._params;
   }
}

class TestCollectionQuery extends Resource<TestCollectionParams> {
   static create(params: TestCollectionParams): TestCollectionQuery {
      return new TestCollectionQuery(transport, state, params);
   }
   getParams(): TestCollectionParams {
      return this._params;
   }
}

const transport = {
   get(path: string) {
      requests.push(path);
      return Promise.resolve({ path });
   },
} as Transport;

const state: RequestState = {
   segments: ['fantasy', 'v2'],
};

describe('Resource', () => {
   it('builds a resource path and serializes non-reserved params', () => {
      const query = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: ['metadata', 'players'],
         lang: 'en us',
         flags: [true, false],
         empty: null,
      });

      expect(query.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players;lang=en%20us;flags=true,false',
      );
   });

   it('returns a cloned query when including sub-resources', () => {
      const original = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: ['metadata'],
      });

      const updated = original.params({
         out: [...original.getParams().out, 'players'],
      });

      expect(original.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata',
      );
      expect(updated.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players',
      );
      expect(updated).not.toBe(original);
   });

   it('delegates get requests to the transport with the serialized path', async () => {
      requests.length = 0;

      const query = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: ['metadata'],
      });

      await expect(query.get()).resolves.toEqual({
         path: 'fantasy/v2/league/nhl.l.123;out=metadata',
      });
      expect(requests).toEqual([
         'fantasy/v2/league/nhl.l.123;out=metadata',
      ]);
   });
});

describe('Resource collections', () => {
   it('builds a collection path without resource keys', () => {
      const query = TestCollectionQuery.create({
         kind: 'collection',
         name: 'leagues',
         out: ['players'],
         page: 2,
      });

      expect(query.toPath()).toBe('fantasy/v2/leagues;out=players;page=2');
   });

   it('returns a cloned query when including sub-resources', () => {
      const original = TestCollectionQuery.create({
         kind: 'collection',
         name: 'leagues',
         out: ['metadata'],
      });

      const updated = original.params({
         ...original.getParams(),
         out: [...original.getParams().out, 'players'],
      });

      expect(original.toPath()).toBe('fantasy/v2/leagues;out=metadata');
      expect(updated.toPath()).toBe(
         'fantasy/v2/leagues;out=metadata,players',
      );
      expect(updated).not.toBe(original);
   });

   it('returns a cloned query when patching params', () => {
      const original = TestCollectionQuery.create({
         kind: 'collection',
         name: 'leagues',
         out: ['players'],
         page: 2,
      });

      const updated = original.params({ page: 3 });

      expect(original.toPath()).toBe(
         'fantasy/v2/leagues;out=players;page=2',
      );
      expect(updated.toPath()).toBe(
         'fantasy/v2/leagues;out=players;page=3',
      );
      expect(updated).not.toBe(original);
   });
});
