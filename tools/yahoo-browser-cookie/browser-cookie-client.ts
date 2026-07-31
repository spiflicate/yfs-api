/**
 * Read-only Yahoo frontend API client for an intentionally supplied browser
 * session. This module is repository tooling and is not part of the public
 * SDK contract.
 */

import { readFile } from 'node:fs/promises';

export const YAHOO_READ_ONLY_ORIGINS = [
   'https://pub-api-ro.fantasysports.yahoo.com',
   'https://pub-api.fantasysports.yahoo.com',
] as const;

const READ_ONLY_ROUTE_PATTERNS = [
   /^\/fantasy\/v2\/(?:game|league|player|team|user)(?:[/?;]|$)/,
   /^\/fantasy\/v3\/(?:getCrumb|suggested_players|user\/subscriptions)(?:[/?]|$)/,
];

export interface BrowserCookie {
   name: string;
   value: string;
   domain: string;
   path?: string;
   expires?: number;
   secure?: boolean;
}

export interface BrowserStorageState {
   cookies: readonly BrowserCookie[];
}

export type CookieJar =
   | readonly BrowserCookie[]
   | BrowserStorageState
   | { cookieHeader: string };

type FetchLike = (input: URL, init?: RequestInit) => Promise<Response>;

export type SessionFailureReason =
   | 'session-expired'
   | 'session-required'
   | 'invalid-cookie';

export type RequestFailureKind =
   | 'session-failure'
   | 'route-failure'
   | 'network-failure';

export class BrowserCookieError extends Error {
   readonly kind: RequestFailureKind;
   readonly status?: number;
   readonly sessionReason?: SessionFailureReason;
   readonly route: string;

   constructor(
      kind: RequestFailureKind,
      message: string,
      route: string,
      status?: number,
      sessionReason?: SessionFailureReason,
   ) {
      super(message);
      this.name = 'BrowserCookieError';
      this.kind = kind;
      this.status = status;
      this.sessionReason = sessionReason;
      this.route = route;
   }
}

export interface BrowserCookieClientOptions {
   cookies: CookieJar;
   origin?: string;
   timeoutMs?: number;
   fetch?: FetchLike;
}

export interface BrowserRequestOptions {
   origin?: string;
   signal?: AbortSignal;
}

function cookiesFromJar(
   jar: CookieJar,
): readonly BrowserCookie[] | undefined {
   if (Array.isArray(jar)) return jar;
   if ('cookies' in jar) return jar.cookies;
   return undefined;
}

function domainMatches(cookie: BrowserCookie, hostname: string): boolean {
   const domain = cookie.domain.toLowerCase().replace(/^\./, '');
   return hostname === domain || hostname.endsWith(`.${domain}`);
}

function pathMatches(cookiePath: string, requestPath: string): boolean {
   if (cookiePath === '/') return true;
   if (requestPath === cookiePath) return true;
   const prefix = cookiePath.endsWith('/') ? cookiePath : `${cookiePath}/`;
   return requestPath.startsWith(prefix);
}

function cookieIsUsable(
   cookie: BrowserCookie,
   url: URL,
   now: number,
): boolean {
   if (
      !cookie.name ||
      cookie.name.includes('=') ||
      /[;\s]/.test(cookie.name) ||
      /[\r\n]/.test(cookie.value)
   ) {
      return false;
   }
   if (!domainMatches(cookie, url.hostname)) return false;
   if (!pathMatches(cookie.path ?? '/', url.pathname)) return false;
   if (cookie.secure && url.protocol !== 'https:') return false;
   if (cookie.expires !== undefined && cookie.expires > 0) {
      if (cookie.expires * 1000 <= now) return false;
   }
   return true;
}

export function cookieHeaderForUrl(
   jar: CookieJar,
   url: URL,
   now = Date.now(),
): string | undefined {
   if ('cookieHeader' in jar) {
      if (!jar.cookieHeader.trim()) return undefined;
      if (/[\r\n]/.test(jar.cookieHeader)) {
         throw new Error('Cookie header contains invalid line breaks');
      }
      return jar.cookieHeader;
   }

   const cookies = cookiesFromJar(jar) ?? [];
   const values = cookies
      .filter((cookie) => cookieIsUsable(cookie, url, now))
      .map((cookie) => `${cookie.name}=${cookie.value}`);
   return values.length > 0 ? values.join('; ') : undefined;
}

export function parseStorageState(value: unknown): BrowserStorageState {
   if (!value || typeof value !== 'object' || !('cookies' in value)) {
      throw new Error('Storage state must contain a cookies array');
   }
   const cookies = (value as { cookies: unknown }).cookies;
   if (!Array.isArray(cookies)) {
      throw new Error('Storage state cookies must be an array');
   }
   for (const cookie of cookies) {
      if (
         !cookie ||
         typeof cookie !== 'object' ||
         typeof (cookie as BrowserCookie).name !== 'string' ||
         typeof (cookie as BrowserCookie).value !== 'string' ||
         typeof (cookie as BrowserCookie).domain !== 'string'
      ) {
         throw new Error('Storage state contains an invalid cookie');
      }
   }
   return { cookies: cookies as BrowserCookie[] };
}

export async function loadStorageState(
   path: string,
): Promise<BrowserStorageState> {
   const contents = await readFile(path, 'utf8');
   try {
      return parseStorageState(JSON.parse(contents));
   } catch (error) {
      if (error instanceof SyntaxError) {
         throw new Error('Storage state is not valid JSON');
      }
      throw error;
   }
}

function isAllowedOrigin(origin: string): boolean {
   return YAHOO_READ_ONLY_ORIGINS.includes(
      origin as (typeof YAHOO_READ_ONLY_ORIGINS)[number],
   );
}

function isAllowedRoute(pathname: string): boolean {
   return READ_ONLY_ROUTE_PATTERNS.some((pattern) =>
      pattern.test(pathname),
   );
}

function safeRoute(url: URL): string {
   const version = url.pathname.match(/^\/fantasy\/(v[23])/i)?.[1];
   return `${url.origin}/fantasy/${version ?? '{redacted}'}/{redacted}`;
}

function sessionReason(status: number): SessionFailureReason {
   return status === 403 ? 'invalid-cookie' : 'session-required';
}

export class BrowserCookieClient {
   private readonly cookies: CookieJar;
   private readonly defaultOrigin: string;
   private readonly timeoutMs: number;
   private readonly fetcher: FetchLike;

   constructor(options: BrowserCookieClientOptions) {
      this.cookies = options.cookies;
      this.defaultOrigin = options.origin ?? YAHOO_READ_ONLY_ORIGINS[0];
      this.timeoutMs = options.timeoutMs ?? 20_000;
      this.fetcher = options.fetch ?? globalThis.fetch;
      if (!isAllowedOrigin(this.defaultOrigin)) {
         throw new Error(
            'Origin is not an approved Yahoo read-only origin',
         );
      }
   }

   async get<T = unknown>(
      route: string,
      options: BrowserRequestOptions = {},
   ): Promise<T> {
      const url = new URL(route, options.origin ?? this.defaultOrigin);
      const routeForError = safeRoute(url);
      if (!isAllowedOrigin(url.origin) || !isAllowedRoute(url.pathname)) {
         throw new BrowserCookieError(
            'route-failure',
            'Request route is not in the read-only allowlist',
            routeForError,
         );
      }

      const headers: Record<string, string> = {
         Accept: 'application/json',
      };
      const cookieHeader = cookieHeaderForUrl(this.cookies, url);
      if (cookieHeader) headers.Cookie = cookieHeader;

      try {
         const response = await this.fetcher(url, {
            method: 'GET',
            headers,
            signal: options.signal ?? AbortSignal.timeout(this.timeoutMs),
         });
         if (response.status === 401 || response.status === 403) {
            throw new BrowserCookieError(
               'session-failure',
               'Yahoo browser session is unavailable or expired',
               routeForError,
               response.status,
               sessionReason(response.status),
            );
         }
         if (!response.ok) {
            throw new BrowserCookieError(
               'route-failure',
               `Yahoo read-only route failed with HTTP ${response.status}`,
               routeForError,
               response.status,
            );
         }
         try {
            return (await response.json()) as T;
         } catch {
            throw new BrowserCookieError(
               'route-failure',
               'Yahoo response body was not valid JSON',
               routeForError,
               response.status,
            );
         }
      } catch (error) {
         if (error instanceof BrowserCookieError) throw error;
         throw new BrowserCookieError(
            'network-failure',
            'Yahoo read-only request failed before a response was received',
            routeForError,
         );
      }
   }
}
