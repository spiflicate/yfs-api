import { describe, expect, test } from 'bun:test';
import { RosterMoveBuilder } from '../resources/builders/roster-move-builder.js';
import {
   createFrontendApi,
   FrontendApiError,
   resolveFrontendRoute,
   YahooFrontendApiClient,
} from './frontend.js';

const V2_GAME_FIXTURE =
   '<fantasy_content><game><game_key>nhl</game_key></game></fantasy_content>';
const V3_CRUMB_FIXTURE = { service: { crumb: null } };

describe('Yahoo frontend API adapter', () => {
   test('selects the frontend host from the method and API version', () => {
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

   test('keeps the observed league-to-teams read on the read-write host', () => {
      for (const path of [
         '/fantasy/v2/league/223.l.1/teams',
         '/fantasy/v2/league/223.l.1/teams;out=standings',
      ]) {
         expect(resolveFrontendRoute('GET', path)).toMatchObject({
            host: 'readWrite',
         });
      }
      for (const path of [
         '/fantasy/v2/league/223.l.1/teams/roster',
         '/fantasy/v2/league/223.l.1;out=teams',
         '/fantasy/v2/leagues;league_keys=223.l.1/teams',
      ]) {
         expect(resolveFrontendRoute('GET', path)).toMatchObject({
            host: 'readOnly',
         });
      }
   });

   test('does not gate reads on a route allowlist', () => {
      for (const path of [
         '/fantasy/v2/users;use_login=1/games;game_keys=nhl/leagues',
         '/fantasy/v2/players;player_keys=nhl.p.1/stats',
         '/fantasy/v2/game/nhl/leagues;league_keys=nhl.l.1/teams',
         '/fantasy/v2/team/223.l.1.t.1/roster/players',
         '/fantasy/v2/league/223.l.1/unknown',
         '/fantasy/v3/suggested_players?context=add-drop',
      ]) {
         expect(() => resolveFrontendRoute('GET', path)).not.toThrow();
      }
   });

   test('rejects routes outside the frontend API namespaces', () => {
      for (const route of [
         '/fantasy/v1/game/nhl',
         '/fantasy/v2',
         '/fantasy/v2/',
         '/fantasy/v3/',
         '/other/v2/game/nhl',
         '/fantasy/v2/game/nhl/../../../other',
         'https://example.com/fantasy/v2/game/nhl',
      ]) {
         expect(() => resolveFrontendRoute('GET', route)).toThrow(
            FrontendApiError,
         );
      }
   });

   test('keeps v3 routes read-only', () => {
      expect(() =>
         resolveFrontendRoute('PUT', '/fantasy/v3/getCrumb'),
      ).toThrow('Frontend v3 routes are read-only');
   });

   test('allows unauthenticated public reads without OAuth headers', async () => {
      let requestUrl: URL | undefined;
      let requestHeaders: HeadersInit | undefined;
      const client = new YahooFrontendApiClient({
         fetch: async (url, init) => {
            requestUrl = url;
            requestHeaders = init?.headers;
            return new Response(V2_GAME_FIXTURE, {
               headers: { 'content-type': 'application/xml' },
            });
         },
      });

      await expect(client.get('/fantasy/v2/game/nhl')).resolves.toEqual({
         game: { gameKey: 'nhl' },
      });
      expect(requestUrl?.origin).toBe(
         'https://pub-api-ro.fantasysports.yahoo.com',
      );
      expect(requestUrl?.search).toBe('');
      expect(requestHeaders).toEqual({ Accept: 'application/xml' });
   });

   test('keeps the v3 service envelope on the neutral host', async () => {
      const client = new YahooFrontendApiClient({
         fetch: async () => Response.json(V3_CRUMB_FIXTURE),
      });

      await expect(client.get('/fantasy/v3/getCrumb')).resolves.toEqual(
         V3_CRUMB_FIXTURE,
      );
   });

   test('sends typed resource writes with the browser session to the read-write host', async () => {
      let requestUrl: URL | undefined;
      let requestInit: RequestInit | undefined;
      const client = new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader: 'session=secret' },
         fetch: async (url, init) => {
            requestUrl = url;
            requestInit = init;
            return new Response(
               '<fantasy_content><confirmation><status>success</status></confirmation></fantasy_content>',
               { headers: { 'content-type': 'application/xml' } },
            );
         },
      });

      await createFrontendApi(client, { access: 'private' })
         .team('223.l.1.t.1')
         .roster()
         .date('2026-09-23')
         .update(new RosterMoveBuilder().movePlayer('223.p.1', 'BN'));
      expect(requestInit?.method).toBe('PUT');
      expect(requestUrl?.toString()).toBe(
         'https://pub-api-rw.fantasysports.yahoo.com/fantasy/v2/team/223.l.1.t.1/roster;date=2026-09-23',
      );
      expect(requestInit?.headers).toMatchObject({
         Accept: 'application/xml',
         Cookie: 'session=secret',
         'Content-Type': 'application/xml',
      });
   });

   test('exposes no raw write methods on the client', () => {
      const client = new YahooFrontendApiClient() as unknown as Record<
         string,
         unknown
      >;
      expect(client.post).toBeUndefined();
      expect(client.put).toBeUndefined();
      expect(client.delete).toBeUndefined();
   });

   test('rejects typed writes through public resource access before fetch', async () => {
      let called = false;
      const client = new YahooFrontendApiClient({
         fetch: async () => {
            called = true;
            return Response.json({});
         },
      });

      await expect(
         createFrontendApi(client)
            .team('223.l.1.t.1')
            .roster()
            .date('2026-09-23')
            .update(new RosterMoveBuilder().movePlayer('223.p.1', 'BN')),
      ).rejects.toMatchObject({
         message: 'Public frontend resource API access is read-only',
      });
      expect(called).toBe(false);
   });

   test('accepts a Cookie header copied from browser developer tools', async () => {
      let requestHeaders: HeadersInit | undefined;
      const client = new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader: 'Cookie: session=secret; crumb=value' },
         fetch: async (_url, init) => {
            requestHeaders = init?.headers;
            return new Response(
               '<fantasy_content><game><game_key>nhl</game_key></game></fantasy_content>',
               { headers: { 'content-type': 'application/xml' } },
            );
         },
      });

      await client.get('/fantasy/v2/game/nhl');
      expect(requestHeaders).toMatchObject({
         Cookie: 'session=secret; crumb=value',
      });
   });

   test('rejects invalid requests before fetch', async () => {
      let called = false;
      const client = new YahooFrontendApiClient({
         fetch: async () => {
            called = true;
            return Response.json({});
         },
      });

      await expect(
         client.get('/fantasy/v1/game/nhl'),
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

   test("surfaces Yahoo's error description for unsupported routes", async () => {
      const client = new YahooFrontendApiClient({
         fetch: async () =>
            new Response(
               '<?xml version="1.0"?><error xmlns="http://www.yahooapis.com/v1/base.rng"><description>subresource not-a-real-child not supported</description></error>',
               {
                  status: 400,
                  headers: { 'content-type': 'application/xml' },
               },
            ),
      });

      await expect(
         client.get('/fantasy/v2/team/223.l.1.t.1/not-a-real-child'),
      ).rejects.toMatchObject({
         status: 400,
         message:
            'Frontend API request failed with HTTP 400: subresource not-a-real-child not supported',
      });
   });

   test('runs the fluent resource API through the observed v2 adapter', async () => {
      let requestUrl: URL | undefined;
      const client = new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader: 'session=secret' },
         fetch: async (url, init) => {
            requestUrl = url;
            expect(init?.headers).toMatchObject({
               Cookie: 'session=secret',
            });
            return new Response(
               '<fantasy_content><league><league_key>223.l.1</league_key><teams><team><team_key>223.l.1.t.1</team_key></team></teams></league></fantasy_content>',
               { headers: { 'content-type': 'application/xml' } },
            );
         },
      });

      const response = await createFrontendApi(client, {
         access: 'private',
      })
         .league('223.l.1')
         .teams([])
         .get();
      expect(response.league?.leagueKey).toBe('223.l.1');
      expect(response.league?.teams?.[0]?.teamKey).toBe('223.l.1.t.1');
      expect(requestUrl?.toString()).toBe(
         'https://pub-api-rw.fantasysports.yahoo.com/fantasy/v2/league/223.l.1/teams',
      );
   });

   test('resolves date-scoped player stats through the fluent resource API', async () => {
      let requestUrl: URL | undefined;
      const client = new YahooFrontendApiClient({
         fetch: async (url) => {
            requestUrl = url;
            return new Response(
               '<fantasy_content><player><player_key>386.p.6381</player_key><player_stats><coverage_type>date</coverage_type><date>2018-11-01</date></player_stats></player></fantasy_content>',
               { headers: { 'content-type': 'application/xml' } },
            );
         },
      });

      const response = await createFrontendApi(client)
         .player('386.p.6381')
         .stats()
         .date('2018-11-01')
         .get();
      expect(response.player?.playerStats?.coverageType).toBe('date');
      expect(requestUrl?.toString()).toBe(
         'https://pub-api-ro.fantasysports.yahoo.com/fantasy/v2/player/386.p.6381/stats;type=date;date=2018-11-01',
      );
   });

   test('keeps private fluent access explicit', async () => {
      let called = false;
      const client = new YahooFrontendApiClient({
         fetch: async () => {
            called = true;
            return Response.json({});
         },
      });

      await expect(
         createFrontendApi(client, { access: 'private' })
            .league('223.l.1')
            .teams([])
            .get(),
      ).rejects.toMatchObject({
         message:
            'Private frontend reads require browser-session authentication',
      });
      expect(called).toBe(false);
   });
});
