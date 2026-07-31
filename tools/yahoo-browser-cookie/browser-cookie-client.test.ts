import { describe, expect, test } from 'bun:test';
import {
   BrowserCookieClient,
   BrowserCookieError,
   cookieHeaderForUrl,
   parseStorageState,
} from './browser-cookie-client.js';

describe('browser cookie tooling', () => {
   test('builds a storage-state cookie header using URL matching', () => {
      const header = cookieHeaderForUrl(
         parseStorageState({
            cookies: [
               {
                  name: 'session',
                  value: 'secret',
                  domain: '.yahoo.com',
                  path: '/',
               },
               {
                  name: 'expired',
                  value: 'nope',
                  domain: '.yahoo.com',
                  path: '/',
                  expires: 1,
               },
               {
                  name: 'other-path',
                  value: 'nope',
                  domain: '.yahoo.com',
                  path: '/other',
               },
            ],
         }),
         new URL(
            'https://pub-api-ro.fantasysports.yahoo.com/fantasy/v2/game',
         ),
         2_000,
      );
      expect(header).toBe('session=secret');
   });

   test('matches cookie paths with trailing slashes at directory boundaries', () => {
      const jar = parseStorageState({
         cookies: [
            {
               name: 'session',
               value: 'secret',
               domain: '.yahoo.com',
               path: '/fantasy/',
            },
         ],
      });

      expect(
         cookieHeaderForUrl(
            jar,
            new URL(
               'https://pub-api-ro.fantasysports.yahoo.com/fantasy/v2/game',
            ),
         ),
      ).toBe('session=secret');
   });

   test('rejects malformed storage state', () => {
      expect(() =>
         parseStorageState({ cookies: [{ name: 'missing' }] }),
      ).toThrow('invalid cookie');
   });

   test('allows read-only routes and never logs or returns cookies', async () => {
      let requestHeaders: HeadersInit | undefined;
      const client = new BrowserCookieClient({
         cookies: {
            cookieHeader: 'session=secret',
         },
         fetch: async (_input, init) => {
            requestHeaders = init?.headers;
            return new Response(JSON.stringify({ ok: true }), {
               status: 200,
               headers: { 'content-type': 'application/json' },
            });
         },
      });

      await expect(client.get('/fantasy/v2/game/nhl')).resolves.toEqual({
         ok: true,
      });
      expect(requestHeaders).toEqual({
         Accept: 'application/json',
         Cookie: 'session=secret',
      });
   });

   test('classifies authentication failures separately from route failures', async () => {
      const client = new BrowserCookieClient({
         cookies: { cookieHeader: 'session=secret' },
         fetch: async () =>
            new Response('private response', { status: 401 }),
      });

      try {
         await client.get('/fantasy/v2/league/223.l.1');
         throw new Error('expected request to fail');
      } catch (error) {
         expect(error).toBeInstanceOf(BrowserCookieError);
         expect(error).toMatchObject({
            kind: 'session-failure',
            status: 401,
            sessionReason: 'session-required',
         });
         expect((error as Error).message).not.toContain('private response');
      }
   });

   test('classifies invalid JSON separately from network failures', async () => {
      const client = new BrowserCookieClient({
         cookies: { cookieHeader: 'session=secret' },
         fetch: async () => new Response('<xml />', { status: 200 }),
      });

      await expect(
         client.get('/fantasy/v2/game/nhl'),
      ).rejects.toMatchObject({
         kind: 'route-failure',
         status: 200,
         message: 'Yahoo response body was not valid JSON',
      });
   });

   test('rejects writes and unapproved hosts before fetch', async () => {
      let called = false;
      const client = new BrowserCookieClient({
         cookies: { cookieHeader: 'session=secret' },
         fetch: async () => {
            called = true;
            return new Response('{}');
         },
      });

      await expect(
         client.get(
            'https://pub-api-rw.fantasysports.yahoo.com/fantasy/v2/league',
         ),
      ).rejects.toMatchObject({ kind: 'route-failure' });
      await expect(
         client.get('/fantasy/v2/league', {
            origin: 'https://example.com',
         }),
      ).rejects.toMatchObject({
         kind: 'route-failure',
      });
      expect(called).toBe(false);
   });
});
