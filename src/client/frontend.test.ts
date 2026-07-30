import { describe, expect, test } from 'bun:test';
import {
   FrontendApiError,
   resolveFrontendRoute,
   YahooFrontendApiClient,
} from './frontend.js';

describe('Yahoo frontend API adapter', () => {
   test('maps observed routes to their required subdomains', () => {
      expect(
         resolveFrontendRoute('GET', '/fantasy/v2/league/223.l.1'),
      ).toMatchObject({
         host: 'readOnly',
         origin: 'https://pub-api-ro.fantasysports.yahoo.com',
      });
      expect(
         resolveFrontendRoute('PUT', '/fantasy/v2/team/223.l.1.t.1/roster'),
      ).toMatchObject({
         host: 'readWrite',
         origin: 'https://pub-api-rw.fantasysports.yahoo.com',
      });
      expect(
         resolveFrontendRoute('GET', '/fantasy/v3/getCrumb'),
      ).toMatchObject({
         host: 'neutral',
         origin: 'https://pub-api.fantasysports.yahoo.com',
      });
   });

   test('allows unauthenticated public reads without OAuth headers', async () => {
      let requestUrl: URL | undefined;
      let requestHeaders: HeadersInit | undefined;
      const client = new YahooFrontendApiClient({
         fetch: async (url, init) => {
            requestUrl = url;
            requestHeaders = init?.headers;
            return Response.json({ fantasy_content: { ok: true } });
         },
      });

      await expect(
         client.get('/fantasy/v2/game/nhl', { params: { format: 'json' } }),
      ).resolves.toEqual({ fantasy_content: { ok: true } });
      expect(requestUrl?.origin).toBe(
         'https://pub-api-ro.fantasysports.yahoo.com',
      );
      expect(requestUrl?.search).toBe('?format=json');
      expect(requestHeaders).toEqual({ Accept: 'application/json' });
   });

   test('requires a browser session for writes and sends it only to the request', async () => {
      let requestUrl: URL | undefined;
      let requestHeaders: HeadersInit | undefined;
      const client = new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader: 'session=secret' },
         fetch: async (url, init) => {
            requestUrl = url;
            requestHeaders = init?.headers;
            return Response.json({
               fantasy_content: { confirmation: 'ok' },
            });
         },
      });

      await expect(
         client.put('/fantasy/v2/team/223.l.1.t.1/roster', '<roster />'),
      ).resolves.toEqual({ fantasy_content: { confirmation: 'ok' } });
      expect(requestUrl?.origin).toBe(
         'https://pub-api-rw.fantasysports.yahoo.com',
      );
      expect(requestHeaders).toMatchObject({
         Accept: 'application/json',
         Cookie: 'session=secret',
         'Content-Type': 'application/xml',
      });
   });

   test('rejects public writes and unknown routes before fetch', async () => {
      let called = false;
      const client = new YahooFrontendApiClient({
         fetch: async () => {
            called = true;
            return Response.json({});
         },
      });

      await expect(
         client.post('/fantasy/v2/league/223.l.1'),
      ).rejects.toBeInstanceOf(FrontendApiError);
      await expect(
         client.get('/fantasy/v3/unknown'),
      ).rejects.toBeInstanceOf(FrontendApiError);
      expect(called).toBe(false);
   });
});
