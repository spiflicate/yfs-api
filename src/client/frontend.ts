/**
 * Experimental adapter for the Yahoo Fantasy web frontend API.
 *
 * This is intentionally separate from the documented OAuth/XML API client.
 * The frontend API is an observed browser surface, not an OAuth compatibility
 * layer.
 */

import { type ApiRoot, createApi } from '../resources/api.js';
import { parseYahooXML } from '../utils/xmlParser.js';
import type { HttpTransport } from './http.js';

export const FRONTEND_API_ORIGINS = {
   readOnly: 'https://pub-api-ro.fantasysports.yahoo.com',
   readWrite: 'https://pub-api-rw.fantasysports.yahoo.com',
   neutral: 'https://pub-api.fantasysports.yahoo.com',
} as const;

export type FrontendApiHost = keyof typeof FRONTEND_API_ORIGINS;
export type FrontendAuthentication = 'public' | 'browser-session';
export type FrontendHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Parsed v2 XML response, normalized by the existing Yahoo XML parser. */
export type FrontendV2Response<T = unknown> = T;

export interface FrontendV3Response<T = unknown> {
   service: T;
}

export interface BrowserSession {
   /** A user-managed Cookie request header. Never derive this from OAuth tokens. */
   cookieHeader: string;
}

export interface FrontendApiClientOptions {
   authentication?: FrontendAuthentication;
   session?: BrowserSession;
   timeoutMs?: number;
   fetch?: FetchLike;
}

export interface FrontendRequestOptions {
   access?: 'public' | 'private';
   params?: Record<string, string | number | boolean | undefined>;
   headers?: Record<string, string>;
   body?: Record<string, unknown> | string;
   signal?: AbortSignal;
}

export interface FrontendResourceApiOptions {
   /** Explicitly select the visibility scope used by resource reads. */
   access?: 'public' | 'private';
}

export interface ResolvedFrontendRoute {
   host: FrontendApiHost;
   origin: string;
   method: FrontendHttpMethod;
   path: string;
}

type FetchLike = (input: URL, init?: RequestInit) => Promise<Response>;

const V2_ROUTE =
   /^\/fantasy\/v2\/(?:game|league|player|team|user)\/[^/?;]+(?:[?;]|$)/;
const V2_NESTED_READ_ROUTE =
   /^\/fantasy\/v2\/(?:league\/[^/?;]+\/(?:settings|standings|scoreboard|teams|players|transactions)|team\/[^/?;]+\/(?:roster|matchups|stats))(?:[?;]|$)/;
const V3_ROUTE =
   /^\/fantasy\/v3\/(?:getCrumb|suggested_players|user\/subscriptions)(?:[?]|$)/;
const V2_READ_WRITE_ROUTE =
   /^\/fantasy\/v2\/league\/[^/?;]+\/teams(?:[?;]|$)/;
const V2_ROSTER_WRITE_ROUTE =
   /^\/fantasy\/v2\/team\/[^/?;]+\/roster(?:[?;]|$)/;

export class FrontendApiError extends Error {
   readonly status?: number;
   readonly route: string;

   constructor(message: string, route: string, status?: number) {
      super(message);
      this.name = 'FrontendApiError';
      this.route = route;
      this.status = status;
   }
}

function normalizePath(route: string): string {
   const url = new URL(route, FRONTEND_API_ORIGINS.readOnly);
   if (url.origin !== FRONTEND_API_ORIGINS.readOnly) {
      throw new FrontendApiError(
         'Frontend routes must be relative paths',
         route,
      );
   }
   return `${url.pathname}${url.search}`;
}

function routeHost(
   method: FrontendHttpMethod,
   pathname: string,
): FrontendApiHost {
   if (V3_ROUTE.test(pathname)) return 'neutral';
   if (method === 'GET' && V2_READ_WRITE_ROUTE.test(pathname)) {
      return 'readWrite';
   }
   if (method === 'GET' && V2_ROUTE.test(pathname)) {
      return 'readOnly';
   }
   if (method === 'GET' && V2_NESTED_READ_ROUTE.test(pathname)) {
      return 'readOnly';
   }
   if (method === 'PUT' && V2_ROSTER_WRITE_ROUTE.test(pathname)) {
      return 'readWrite';
   }
   throw new FrontendApiError(
      'Route is not in the observed Yahoo frontend API allowlist',
      pathname,
   );
}

export function resolveFrontendRoute(
   method: FrontendHttpMethod,
   route: string,
): ResolvedFrontendRoute {
   const path = normalizePath(route);
   const url = new URL(path, FRONTEND_API_ORIGINS.readOnly);
   const host = routeHost(method, url.pathname);

   if (method !== 'GET' && V3_ROUTE.test(url.pathname)) {
      throw new FrontendApiError(
         'The observed v3 frontend routes are read-only',
         path,
      );
   }

   return {
      host,
      origin: FRONTEND_API_ORIGINS[host],
      method,
      path,
   };
}

function normalizeCookieHeader(cookieHeader: string): string {
   const normalized = cookieHeader.replace(/^\s*cookie\s*:\s*/i, '').trim();
   if (!normalized || /[\r\n]/.test(normalized)) {
      throw new Error('Browser session cookie header is invalid');
   }
   return normalized;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
   return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

export class YahooFrontendApiClient {
   private readonly authentication: FrontendAuthentication;
   private readonly session?: BrowserSession;
   private readonly timeoutMs: number;
   private readonly fetcher: FetchLike;

   constructor(options: FrontendApiClientOptions = {}) {
      this.authentication = options.authentication ?? 'public';
      this.session = options.session;
      this.timeoutMs = options.timeoutMs ?? 20_000;
      this.fetcher = options.fetch ?? globalThis.fetch;

      if (this.authentication === 'browser-session') {
         if (!this.session) {
            throw new Error(
               'A browser session is required for browser-session authentication',
            );
         }
         this.session = {
            ...this.session,
            cookieHeader: normalizeCookieHeader(this.session.cookieHeader),
         };
      } else if (this.session) {
         throw new Error(
            'A browser session requires browser-session authentication',
         );
      }
   }

   get<T = unknown>(
      route: string,
      options?: Omit<FrontendRequestOptions, 'body'>,
   ): Promise<T> {
      return this.request<T>('GET', route, options) as Promise<T>;
   }

   post<T = unknown>(
      route: string,
      body?: Record<string, unknown> | string,
      options?: Omit<FrontendRequestOptions, 'body'>,
   ): Promise<T | undefined> {
      return this.request<T>('POST', route, { ...options, body });
   }

   put<T = unknown>(
      route: string,
      body?: Record<string, unknown> | string,
      options?: Omit<FrontendRequestOptions, 'body'>,
   ): Promise<T | undefined> {
      return this.request<T>('PUT', route, { ...options, body });
   }

   delete<T = unknown>(
      route: string,
      options?: Omit<FrontendRequestOptions, 'body'>,
   ): Promise<T | undefined> {
      return this.request<T>('DELETE', route, options);
   }

   private async request<T>(
      method: FrontendHttpMethod,
      route: string,
      options: FrontendRequestOptions = {},
   ): Promise<T | undefined> {
      if (this.authentication === 'public' && method !== 'GET') {
         throw new FrontendApiError(
            'Public frontend authentication is read-only',
            route,
         );
      }
      if (
         this.authentication === 'public' &&
         options.access === 'private'
      ) {
         throw new FrontendApiError(
            'Private frontend reads require browser-session authentication',
            route,
         );
      }

      const resolved = resolveFrontendRoute(method, route);
      const url = new URL(resolved.path, resolved.origin);
      for (const [key, value] of Object.entries(options.params ?? {})) {
         if (value !== undefined) url.searchParams.set(key, String(value));
      }

      const headers: Record<string, string> = {
         Accept:
            resolved.host === 'neutral'
               ? 'application/json'
               : 'application/xml',
         ...options.headers,
      };
      if (hasHeader(headers, 'authorization')) {
         throw new FrontendApiError(
            'OAuth bearer tokens are not supported by the frontend adapter',
            resolved.path,
         );
      }
      if (
         this.authentication === 'public' &&
         hasHeader(headers, 'cookie')
      ) {
         throw new FrontendApiError(
            'Public frontend requests cannot include browser cookies',
            resolved.path,
         );
      }
      if (this.session) headers.Cookie = this.session.cookieHeader;
      if (
         options.body !== undefined &&
         !hasHeader(headers, 'content-type')
      ) {
         headers['Content-Type'] =
            typeof options.body === 'string'
               ? 'application/xml'
               : 'application/json';
      }

      const init: RequestInit = {
         method,
         headers,
         signal: options.signal ?? AbortSignal.timeout(this.timeoutMs),
      };
      if (options.body !== undefined) {
         init.body =
            typeof options.body === 'string'
               ? options.body
               : JSON.stringify(options.body);
      }

      let response: Response;
      try {
         response = await this.fetcher(url, init);
      } catch (error) {
         throw new FrontendApiError(
            `Frontend API request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
            resolved.path,
         );
      }

      if (!response.ok) {
         throw new FrontendApiError(
            `Frontend API request failed with HTTP ${response.status}`,
            resolved.path,
            response.status,
         );
      }
      if (response.status === 204) return undefined;

      try {
         const contentType = response.headers.get('content-type') ?? '';
         if (contentType.includes('xml')) {
            return parseYahooXML<T>(await response.text());
         }
         return (await response.json()) as T;
      } catch (error) {
         throw new FrontendApiError(
            `Frontend API returned invalid JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
            resolved.path,
            response.status,
         );
      }
   }
}

class FrontendResourceTransport implements HttpTransport {
   constructor(
      private readonly client: YahooFrontendApiClient,
      private readonly access: 'public' | 'private',
   ) {}

   get<T = unknown>(path: string): Promise<T> {
      return this.client.get<T>(frontendResourcePath(path), {
         access: this.access,
      });
   }

   post<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
   ): Promise<T | undefined> {
      const route = frontendResourcePath(path);
      this.assertPrivateAccess(route);
      return this.client.post<T>(route, body, {
         access: this.access,
      });
   }

   put<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
   ): Promise<T | undefined> {
      const route = frontendResourcePath(path);
      this.assertPrivateAccess(route);
      return this.client.put<T>(route, body, {
         access: this.access,
      });
   }

   delete<T = unknown>(path: string): Promise<T | undefined> {
      const route = frontendResourcePath(path);
      this.assertPrivateAccess(route);
      return this.client.delete<T>(route, {
         access: this.access,
      });
   }

   private assertPrivateAccess(route: string): void {
      if (this.access === 'public') {
         throw new FrontendApiError(
            'Public frontend resource API access is read-only',
            route,
         );
      }
   }
}

function frontendResourcePath(path: string): string {
   return `/fantasy/v2/${path.replace(/^\/+/, '')}`;
}

/**
 * Creates the canonical fluent resource API over the observed frontend v2
 * adapter. Only routes accepted by the frontend adapter's allowlist execute.
 */
export function createFrontendApi(
   client: YahooFrontendApiClient,
   options: FrontendResourceApiOptions = {},
): ApiRoot {
   return createApi(
      new FrontendResourceTransport(client, options.access ?? 'public'),
   );
}
