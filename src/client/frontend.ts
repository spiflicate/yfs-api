/**
 * Experimental adapter for the Yahoo Fantasy web frontend API.
 *
 * This is intentionally separate from the documented OAuth/XML API client.
 * The frontend API is an observed browser surface, not an OAuth compatibility
 * layer.
 */

export const FRONTEND_API_ORIGINS = {
   readOnly: 'https://pub-api-ro.fantasysports.yahoo.com',
   readWrite: 'https://pub-api-rw.fantasysports.yahoo.com',
   neutral: 'https://pub-api.fantasysports.yahoo.com',
} as const;

export type FrontendApiHost = keyof typeof FRONTEND_API_ORIGINS;
export type FrontendAuthentication = 'public' | 'browser-session';
export type FrontendHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface FrontendV2Response<T = unknown> {
   fantasy_content: T;
}

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
   params?: Record<string, string | number | boolean | undefined>;
   headers?: Record<string, string>;
   body?: Record<string, unknown> | string;
   signal?: AbortSignal;
}

export interface ResolvedFrontendRoute {
   host: FrontendApiHost;
   origin: string;
   method: FrontendHttpMethod;
   path: string;
}

type FetchLike = (input: URL, init?: RequestInit) => Promise<Response>;

const V2_ROUTE =
   /^\/fantasy\/v2\/(?:game|league|player|team|user)(?:[/?;]|$)/;
const V3_ROUTE =
   /^\/fantasy\/v3\/(?:getCrumb|suggested_players|user\/subscriptions)(?:[/?]|$)/;

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
   if (V2_ROUTE.test(pathname)) {
      return method === 'GET' ? 'readOnly' : 'readWrite';
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

function validateCookieHeader(cookieHeader: string): void {
   if (!cookieHeader.trim() || /[\r\n]/.test(cookieHeader)) {
      throw new Error('Browser session cookie header is invalid');
   }
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
         validateCookieHeader(this.session.cookieHeader);
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

      const resolved = resolveFrontendRoute(method, route);
      const url = new URL(resolved.path, resolved.origin);
      for (const [key, value] of Object.entries(options.params ?? {})) {
         if (value !== undefined) url.searchParams.set(key, String(value));
      }

      const headers: Record<string, string> = {
         Accept: 'application/json',
         ...options.headers,
      };
      if (this.session) headers.Cookie = this.session.cookieHeader;
      if (options.body !== undefined && !headers['Content-Type']) {
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
