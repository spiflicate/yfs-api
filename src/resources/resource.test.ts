import { describe, expect, it } from 'bun:test';
import type { HttpClient as Transport } from '../client/http.js';
import {
   type RequestState,
   Resource,
   type ResourceParams,
} from './resource.js';

type TestParams = ResourceParams<'metadata' | 'players'> & {
   name: 'league';
   lang?: string;
   flags?: readonly boolean[];
   empty?: null;
};

type TestResponse = {
   root?: {
      parents: Array<{ key: string; players?: Array<{ key: string }> }>;
   };
   confirmation?: { status: string };
};

const responses = {
   get: {
      root: {
         parents: [
            { key: 'first', players: [{ key: 'first-player' }] },
            { key: 'second', players: [{ key: 'second-player' }] },
         ],
      },
   },
   post: { confirmation: { status: 'posted' } },
   put: { confirmation: { status: 'updated' } },
   delete: { confirmation: { status: 'deleted' } },
} satisfies Record<string, TestResponse>;

const requests: Array<{ method: string; path: string; body?: unknown }> =
   [];
const transport = {
   get(path: string) {
      requests.push({ method: 'get', path });
      return Promise.resolve(responses.get);
   },
   post(path: string, body?: unknown) {
      requests.push({ method: 'post', path, body });
      return Promise.resolve(responses.post);
   },
   put(path: string, body?: unknown) {
      requests.push({ method: 'put', path, body });
      return Promise.resolve(responses.put);
   },
   delete(path: string) {
      requests.push({ method: 'delete', path });
      return Promise.resolve(responses.delete);
   },
} as unknown as Transport;

const state: RequestState = { segments: ['fantasy', 'v2'] };

class TestQuery extends Resource<TestParams, TestResponse, TestResponse> {
   static create(params?: Partial<TestParams>): TestQuery {
      return new TestQuery(transport, state, {
         kind: 'resource',
         name: 'league',
         key: 'nhl.l.123',
         out: [],
         ...params,
      });
   }

   sendPost(
      body: Record<string, unknown>,
   ): Promise<TestResponse | undefined> {
      return this.post(body);
   }

   sendPut(
      body: Record<string, unknown>,
   ): Promise<TestResponse | undefined> {
      return this.put(body);
   }

   sendDelete(): Promise<TestResponse | undefined> {
      return this.delete();
   }
}

describe('Resource', () => {
   it('preserves path serialization, duplicate removal, and cloning', () => {
      const original = TestQuery.create({
         out: ['metadata', 'players', 'players'],
         lang: 'en us',
         flags: [true, true, false],
         empty: null,
      });
      const updated = original.params({ lang: 'fr ca' });

      expect(original.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players;lang=en%20us;flags=true,false',
      );
      expect(updated.toPath()).toBe(
         'fantasy/v2/league/nhl.l.123;out=metadata,players;lang=fr%20ca;flags=true,false',
      );
      expect(updated).not.toBe(original);
   });

   it('returns the exact transport object with duplicate keys and all parents', async () => {
      requests.length = 0;
      const result = await TestQuery.create().get();

      expect(result).toBe(responses.get);
      expect(result.root?.parents).toHaveLength(2);
      expect(result.root?.parents[1]?.players?.[0]?.key).toBe(
         'second-player',
      );
      expect(requests).toEqual([
         {
            method: 'get',
            path: 'fantasy/v2/league/nhl.l.123',
         },
      ]);
   });

   it('returns transport identity for POST, PUT, and DELETE', async () => {
      const query = TestQuery.create();
      const body = { hello: 'world' };

      expect(await query.sendPost(body)).toBe(responses.post);
      expect(await query.sendPut(body)).toBe(responses.put);
      expect(await query.sendDelete()).toBe(responses.delete);
   });

   it('does not search for or synthesize a fallback field', async () => {
      const result = await TestQuery.create({ out: ['players'] }).get();

      expect(result).toBe(responses.get);
      expect(result).not.toHaveProperty('players');
   });
});
