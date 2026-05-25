import { describe, expect, it } from 'bun:test';
import type { HttpClient as Transport } from '../client/http';
import {
   type CollectionParams,
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource';

const requests: Array<{ method: string; path: string; body?: unknown }> =
   [];

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

type TestPlayersCollectionParams = CollectionParams<
   never,
   string,
   'players'
> & {
   name: 'players';
};

class TestResourceQuery extends Resource<TestResourceParams> {
   static create(params: TestResourceParams): TestResourceQuery {
      return new TestResourceQuery(transport, state, params);
   }

   players(): TestPlayersCollectionQuery {
      return TestPlayersCollectionQuery.create(this.createChildState());
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

class TestPlayersCollectionQuery extends Resource<TestPlayersCollectionParams> {
   static create(state: RequestState): TestPlayersCollectionQuery {
      return new TestPlayersCollectionQuery(transport, state, {
         kind: 'collection',
         name: 'players',
         out: [],
      });
   }
}

const transport = {
   get(path: string) {
      requests.push({ method: 'get', path });

      if (path.endsWith('/players')) {
         return Promise.resolve({
            league: {
               players: [{ player_key: '1.p.1' }],
            },
         });
      }

      return Promise.resolve({
         league: {
            path,
         },
      });
   },
   post(path: string, body?: unknown) {
      requests.push({ method: 'post', path, body });
      return Promise.resolve({
         league: {
            players: [{ player_key: '1.p.2' }],
         },
      });
   },
   put(path: string, body?: unknown) {
      requests.push({ method: 'put', path, body });
      return Promise.resolve({
         league: {
            players: [{ player_key: '1.p.3' }],
         },
      });
   },
   delete(path: string) {
      requests.push({ method: 'delete', path });
      return Promise.resolve({ success: true });
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
         league: {
            path: 'fantasy/v2/league/nhl.l.123;out=metadata',
         },
      });
      expect(requests).toEqual([
         {
            method: 'get',
            path: 'fantasy/v2/league/nhl.l.123;out=metadata',
         },
      ]);
   });

   it('resolves nested response scope to the terminal response wrapper', async () => {
      requests.length = 0;

      const query = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: [],
      });

      await expect(query.players().get()).resolves.toEqual({
         players: [{ player_key: '1.p.1' }],
      });
      expect(requests).toEqual([
         {
            method: 'get',
            path: 'fantasy/v2/league/nhl.l.123/players',
         },
      ]);
   });

   it('applies response scope resolution to post and put', async () => {
      requests.length = 0;

      const query = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: [],
      }).players();

      await expect(query.post({ hello: 'world' })).resolves.toEqual({
         players: [{ player_key: '1.p.2' }],
      });
      await expect(query.put({ hello: 'again' })).resolves.toEqual({
         players: [{ player_key: '1.p.3' }],
      });
   });

   it('falls back to the raw response when the scoped wrapper is absent', async () => {
      requests.length = 0;

      const query = TestResourceQuery.create({
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: [],
      }).players();

      await expect(query.delete()).resolves.toEqual({ success: true });
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
