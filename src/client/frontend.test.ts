import { describe, expect, test } from 'bun:test';
import {
   FrontendApiError,
   resolveFrontendRoute,
   YahooFrontendApiClient,
} from './frontend.js';

const V2_GAME_FIXTURE = { fantasy_content: { game: { game_key: 'nhl' } } };
const V3_CRUMB_FIXTURE = { service: { crumb: null } };

describe('Yahoo frontend API adapter', () => {
   test('maps observed routes to their required subdomains', () => {
      expect(
         resolveFrontendRoute('GET', '/fantasy/v2/league/223.l.1'),
      ).toMatchObject({
         host: 'readOnly',
         origin: 'https://pub-api-ro.fantasysports.yahoo.com',
      });
      expect(
         resolveFrontendRoute('GET', '/fantasy/v2/league/223.l.1/teams'),
      ).toMatchObject({ host: 'readWrite' });
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
            return Response.json(V2_GAME_FIXTURE);
         },
      });

      await expect(
         client.get('/fantasy/v2/game/nhl', { params: { format: 'json' } }),
      ).resolves.toEqual(V2_GAME_FIXTURE);
      expect(requestUrl?.origin).toBe(
         'https://pub-api-ro.fantasysports.yahoo.com',
      );
      expect(requestUrl?.search).toBe('?format=json');
      expect(requestHeaders).toEqual({ Accept: 'application/json' });
   });

   test('keeps the v3 service envelope on the neutral host', async () => {
      const client = new YahooFrontendApiClient({
         fetch: async () => Response.json(V3_CRUMB_FIXTURE),
      });

      await expect(client.get('/fantasy/v3/getCrumb')).resolves.toEqual(
         V3_CRUMB_FIXTURE,
      );
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
      await expect(
         client.get('/fantasy/v2/league/223.l.1', { access: 'private' }),
      ).rejects.toMatchObject({
         message:
            'Private frontend reads require browser-session authentication',
      });
      await expect(
         client.get('/fantasy/v2/game/nhl', {
            headers: { Authorization: 'Bearer token' },
         }),
      ).rejects.toMatchObject({
         message:
            'OAuth bearer tokens are not supported by the frontend adapter',
      });
      expect(called).toBe(false);
   });

   test('reports authentication-required responses without exposing the body', async () => {
      const client = new YahooFrontendApiClient({
         fetch: async () =>
            new Response('private response', { status: 401 }),
      });

      await expect(
         client.get('/fantasy/v3/user/subscriptions'),
      ).rejects.toMatchObject({
         status: 401,
         route: '/fantasy/v3/user/subscriptions',
      });
   });
});
