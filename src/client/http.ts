/**
 * HTTP client for Yahoo Fantasy Sports API
 * @module
 */

import type { OAuth1Client } from '../auth/oauth1.js';
import type { OAuth2Client, OAuth2Tokens } from '../auth/oauth2.js';
import {
   API_BASE_URL,
   DEFAULT_MAX_RETRIES,
   DEFAULT_RETRY_DELAY,
   DEFAULT_TIMEOUT,
   HTTP_STATUS,
   MAX_REQUESTS_PER_WINDOW,
   MAX_RETRY_DELAY,
   RATE_LIMIT_WINDOW,
   RETRYABLE_STATUS_CODES,
} from '../utils/constants.js';
import { parseYahooXML } from '../utils/xmlParser.js';
import {
   AuthenticationError,
   NetworkError,
   NotFoundError,
   ParseError,
   RateLimitError,
   YahooApiError,
   YahooFantasyError,
} from './errors.js';

/**
 * HTTP request options
 */
export interface RequestOptions {
   /**
    * HTTP method
    */
   method?: 'GET' | 'POST' | 'PUT' | 'DELETE';

   /**
    * Request body (for POST/PUT)
    */
   body?: Record<string, unknown> | string;

   /**
    * Additional headers
    */
   headers?: Record<string, string>;

   /**
    * Query parameters
    */
   params?: Record<string, string | number | boolean | undefined>;

   /**
    * Request timeout in milliseconds
    */
   timeout?: number;

   /**
    * Maximum retry attempts
    */
   maxRetries?: number;

   /**
    * Skip OAuth authentication for this request
    */
   skipAuth?: boolean;
}

/** The transport surface required by the fluent resource builders. */
export interface HttpTransport {
   get<T = unknown>(path: string): Promise<T>;
   post<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
   ): Promise<T | undefined>;
   put<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
   ): Promise<T | undefined>;
   delete<T = unknown>(path: string): Promise<T | undefined>;
}

/**
 * Rate limiter to prevent hitting API limits
 */
class RateLimiter {
   private requests: number[] = [];
   private readonly maxRequests: number;
   private readonly windowMs: number;

   private admission = Promise.resolve();

   constructor(
      maxRequests = MAX_REQUESTS_PER_WINDOW,
      windowMs = RATE_LIMIT_WINDOW,
      private readonly now: () => number = Date.now,
      private readonly sleep: (ms: number) => Promise<void> = (ms) =>
         new Promise((resolve) => setTimeout(resolve, ms)),
   ) {
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
   }

   /**
    * Wait if necessary to comply with rate limits
    */
   async wait(): Promise<void> {
      const previous = this.admission;
      let release!: () => void;
      this.admission = new Promise<void>((resolve) => {
         release = resolve;
      });

      await previous;
      try {
         while (true) {
            const now = this.now();
            this.requests = this.requests.filter(
               (time) => now - time < this.windowMs,
            );

            if (this.requests.length < this.maxRequests) {
               this.requests.push(now);
               return;
            }

            const oldestRequest = this.requests[0];
            await this.sleep(
               Math.max(0, this.windowMs - (now - (oldestRequest ?? now))),
            );
         }
      } finally {
         release();
      }
   }
}

/**
 * Callback for reading the current OAuth 2.0 tokens
 */
export type TokenProvider = () => OAuth2Tokens | null | undefined;

/**
 * Callback for refreshing expired tokens
 */
export type TokenRefreshCallback = () => Promise<OAuth2Tokens>;

/**
 * HTTP client for making API requests with retry logic and rate limiting
 *
 * @example
 * ```typescript
 * const http = new HttpClient(
 *   oauth2Client,
 *   () => tokens,
 *   refreshCallback,
 * );
 * const data = await http.get('/users;use_login=1/games');
 * ```
 */
export class HttpClient {
   private oauth2Client?: OAuth2Client;
   private oauth1Client?: OAuth1Client;
   private tokenProvider?: TokenProvider;
   private tokenRefreshCallback?: TokenRefreshCallback;
   private rateLimiter: RateLimiter;
   private timeout: number;
   private maxRetries: number;
   private debug: boolean;
   private refreshInFlight?: Promise<OAuth2Tokens>;
   private readonly now: () => number;
   private readonly sleepCallback: (ms: number) => Promise<void>;

   /**
    * Creates a new HTTP client
    *
    * @param oauth2Client - OAuth 2.0 client for token management (optional in public mode)
    * @param tokenProvider - Callback that returns the current OAuth 2.0 tokens
    * @param tokenRefreshCallback - Callback to refresh tokens when expired
    * @param options - Additional options
    */
   constructor(
      oauth2Client?: OAuth2Client,
      tokenProvider?: TokenProvider,
      tokenRefreshCallback?: TokenRefreshCallback,
      options?: {
         timeout?: number;
         maxRetries?: number;
         debug?: boolean;
         oauth1Client?: OAuth1Client;
         now?: () => number;
         sleep?: (ms: number) => Promise<void>;
      },
   ) {
      this.oauth2Client = oauth2Client;
      this.oauth1Client = options?.oauth1Client;
      this.tokenProvider = tokenProvider;
      this.tokenRefreshCallback = tokenRefreshCallback;
      this.now = options?.now ?? Date.now;
      this.sleepCallback =
         options?.sleep ??
         ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
      this.rateLimiter = new RateLimiter(
         MAX_REQUESTS_PER_WINDOW,
         RATE_LIMIT_WINDOW,
         this.now,
         this.sleepCallback,
      );
      this.timeout = options?.timeout ?? DEFAULT_TIMEOUT;
      this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
      this.debug = options?.debug ?? false;
   }

   /**
    * Sets the OAuth 2.0 token provider
    *
    * @param provider - Callback returning the latest OAuth 2.0 tokens
    */
   setTokenProvider(provider: TokenProvider): void {
      this.tokenProvider = provider;
   }

   /**
    * Sets the token refresh callback
    *
    * @param callback - Callback to refresh tokens
    */
   setTokenRefreshCallback(callback: TokenRefreshCallback): void {
      this.tokenRefreshCallback = callback;
   }

   /**
    * Makes a GET request
    *
    * @param path - API path (relative to base URL)
    * @param options - Request options
    * @returns Response data
    *
    * @example
    * ```typescript
    * const leagues = await http.get('/users;use_login=1/games/leagues');
    * ```
    */
   async get<T = unknown>(
      path: string,
      options?: RequestOptions,
   ): Promise<T> {
      return this.request<T>(path, {
         ...options,
         method: 'GET',
      }) as Promise<T>;
   }

   /**
    * Makes a POST request
    *
    * @param path - API path (relative to base URL)
    * @param body - Request body
    * @param options - Request options
    * @returns Response data
    *
    * @example
    * ```typescript
    * const result = await http.post('/league/423.l.12345/transactions', {
    *   transaction: { type: 'add', player_key: '423.p.8888' }
    * });
    * ```
    */
   async post<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
      options?: RequestOptions,
   ): Promise<T | undefined> {
      return this.request<T>(path, { ...options, method: 'POST', body });
   }

   /**
    * Makes a PUT request
    *
    * @param path - API path (relative to base URL)
    * @param body - Request body
    * @param options - Request options
    * @returns Response data
    *
    * @example
    * ```typescript
    * const result = await http.put('/team/423.l.12345.t.1/roster', {
    *   roster: { coverage_type: 'date', date: '2024-11-15', players: [...] }
    * });
    * ```
    */
   async put<T = unknown>(
      path: string,
      body?: Record<string, unknown> | string,
      options?: RequestOptions,
   ): Promise<T | undefined> {
      return this.request<T>(path, { ...options, method: 'PUT', body });
   }

   /**
    * Makes a DELETE request
    *
    * @param path - API path (relative to base URL)
    * @param options - Request options
    * @returns Response data
    *
    * @example
    * ```typescript
    * await http.delete('/league/423.l.12345/transactions/123');
    * ```
    */
   async delete<T = unknown>(
      path: string,
      options?: RequestOptions,
   ): Promise<T | undefined> {
      return this.request<T>(path, { ...options, method: 'DELETE' });
   }

   /**
    * Makes a request through the normal auth, rate-limit, retry, and error
    * handling pipeline, but returns the successful response body unparsed.
    */
   async requestRawXml(
      path: string,
      options: RequestOptions = {},
   ): Promise<string> {
      return this.request(path, options, true);
   }

   /**
    * Makes an HTTP request with retry logic
    */
   private request<T>(
      path: string,
      options?: RequestOptions,
      rawXml?: false,
   ): Promise<T | undefined>;
   private request(
      path: string,
      options: RequestOptions,
      rawXml: true,
   ): Promise<string>;
   private async request<T>(
      path: string,
      options: RequestOptions = {},
      rawXml = false,
   ): Promise<T | string | undefined> {
      const {
         method = 'GET',
         body,
         headers = {},
         params,
         timeout = this.timeout,
         maxRetries = this.maxRetries,
         skipAuth = false,
      } = options;

      let lastError: Error | undefined;
      let unauthorizedRefreshAttempted = false;
      const retries = method === 'GET' ? maxRetries : 0;

      for (let attempt = 0; attempt <= retries; attempt++) {
         try {
            // Wait for rate limiter
            await this.rateLimiter.wait();

            // Build URL with query params
            let url = this.buildUrl(path, params);

            // Build headers
            const requestHeaders: Record<string, string> = {
               ...headers,
            };
            let dispatchedAccessToken: string | undefined;

            const hasExplicitContentType = Object.keys(headers).some(
               (key) => key.toLowerCase() === 'content-type',
            );

            if (
               body !== undefined &&
               body !== null &&
               (method === 'POST' || method === 'PUT') &&
               !hasExplicitContentType
            ) {
               // String bodies are assumed to be XML (Yahoo Fantasy API write operations
               // use XML payloads). Pass an explicit Content-Type header to override.
               requestHeaders['Content-Type'] =
                  typeof body === 'string'
                     ? 'application/xml'
                     : 'application/json';
            }

            // Add OAuth authorization if not skipped
            if (!skipAuth) {
               // OAuth 1.0 (public mode)
               if (this.oauth1Client) {
                  // Sign the URL with OAuth 1.0
                  url = this.oauth1Client.signRequest(method, url);
                  if (this.debug) {
                     console.log('[HttpClient] Using OAuth 1.0 signing');
                  }
               }
               // OAuth 2.0 (user auth mode)
               else if (this.oauth2Client) {
                  let currentTokens = this.tokenProvider?.() ?? undefined;

                  // Check if tokens need refresh
                  if (
                     currentTokens &&
                     this.oauth2Client.isTokenExpired(currentTokens)
                  ) {
                     if (this.tokenRefreshCallback) {
                        if (this.debug) {
                           console.log(
                              '[HttpClient] Token expired, refreshing...',
                           );
                        }
                        currentTokens = await this.refreshTokens();
                     } else {
                        throw new AuthenticationError(
                           'Access token expired and no refresh callback available.',
                        );
                     }
                  }

                  if (!currentTokens?.accessToken) {
                     throw new AuthenticationError(
                        'No access token available. Please authenticate first.',
                     );
                  }

                  requestHeaders.Authorization = `Bearer ${currentTokens.accessToken}`;
                  dispatchedAccessToken = currentTokens.accessToken;
               }
               // No auth client configured
               else {
                  throw new AuthenticationError(
                     'No OAuth client configured. Please provide either OAuth 1.0 or OAuth 2.0 client.',
                  );
               }
            }

            // Build request
            const requestInit: RequestInit = {
               method,
               headers: requestHeaders,
               signal: AbortSignal.timeout(timeout),
            };

            if (body && (method === 'POST' || method === 'PUT')) {
               requestInit.body =
                  typeof body === 'string' ? body : JSON.stringify(body);
            }

            if (this.debug) {
               console.log(`[HttpClient] ${method} ${url}`);
            }

            // Make request
            const response = await fetch(url, requestInit);

            // Handle rate limiting
            if (response.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
               const retryAfter = response.headers.get('Retry-After');
               const retrySeconds = this.parseRetryAfter(retryAfter);

               if (attempt < retries) {
                  if (this.debug) {
                     console.log(
                        `[HttpClient] Rate limited, retrying after ${retrySeconds}s`,
                     );
                  }
                  await this.sleep(retrySeconds * 1000);
                  continue;
               }

               throw new RateLimitError(
                  'Rate limit exceeded',
                  retrySeconds,
                  await response.text(),
               );
            }

            // Handle authentication errors
            if (response.status === HTTP_STATUS.UNAUTHORIZED) {
               if (
                  !skipAuth &&
                  this.oauth2Client &&
                  this.tokenRefreshCallback &&
                  method === 'GET' &&
                  !unauthorizedRefreshAttempted
               ) {
                  unauthorizedRefreshAttempted = true;

                  if (this.debug) {
                     console.log(
                        '[HttpClient] Request returned 401, refreshing token and retrying once...',
                     );
                  }

                  const latestAccessToken =
                     this.tokenProvider?.()?.accessToken ?? undefined;
                  if (latestAccessToken === dispatchedAccessToken) {
                     await this.refreshTokens();
                  }
                  attempt--;
                  continue;
               }

               throw new AuthenticationError(
                  'Authentication failed. Token may be expired.',
                  await response.text(),
               );
            }

            // Handle not found
            if (response.status === HTTP_STATUS.NOT_FOUND) {
               throw new NotFoundError(
                  `Resource not found: ${path}`,
                  await response.text(),
               );
            }

            // Handle other errors with retry
            if (!response.ok) {
               const errorBody = await response.text();

               // Retry on retryable errors
               if (
                  RETRYABLE_STATUS_CODES.includes(
                     response.status as (typeof RETRYABLE_STATUS_CODES)[number],
                  ) &&
                  attempt < retries
               ) {
                  const delay = this.getRetryDelay(attempt);
                  if (this.debug) {
                     console.log(
                        `[HttpClient] Request failed (${response.status}), retrying in ${delay}ms`,
                     );
                  }
                  await this.sleep(delay);
                  continue;
               }

               throw new YahooApiError(
                  `API request failed: ${response.statusText}`,
                  response.status,
                  errorBody,
               );
            }

            if (
               response.status === HTTP_STATUS.NO_CONTENT &&
               method !== 'GET' &&
               !rawXml
            ) {
               return undefined;
            }

            // Parse response
            const rawResponse = await response.text();

            if (rawXml) {
               if (this.debug) {
                  console.log(
                     `[HttpClient] Raw XML Response (first 500 chars):`,
                     rawResponse.substring(0, 500),
                  );
               }
               return rawResponse;
            }

            if (!rawResponse.trim()) {
               if (method !== 'GET') {
                  return undefined;
               }
               throw new ParseError(
                  'Yahoo API returned an empty response',
                  rawResponse,
               );
            }

            // Parse XML to object
            let data: T;
            try {
               data = parseYahooXML<T>(rawResponse);
            } catch (error) {
               throw new ParseError(
                  `Failed to parse Yahoo API response: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  rawResponse,
               );
            }

            if (this.debug) {
               console.log(`[HttpClient] Parsed Response:`, data);
            }

            return data;
         } catch (error) {
            if (error instanceof YahooFantasyError) {
               // Don't retry on non-retryable errors
               throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
               lastError = new NetworkError('Request timed out', error);
            } else if (error instanceof Error) {
               lastError = new NetworkError(error.message, error);
            } else {
               lastError = new NetworkError('Unknown error occurred');
            }

            // Retry on network errors
            if (attempt < retries) {
               const delay = this.getRetryDelay(attempt);
               if (this.debug) {
                  console.log(
                     `[HttpClient] Network error, retrying in ${delay}ms`,
                  );
               }
               await this.sleep(delay);
            }
         }
      }

      // If we get here, all retries failed
      throw (
         lastError ?? new NetworkError('Request failed after all retries')
      );
   }

   /**
    * Builds a full URL from path and parameters
    */
   private buildUrl(
      path: string,
      params?: Record<string, string | number | boolean | undefined>,
   ): string {
      // Add format=xml to all requests (cleaner structure than JSON)
      const allParams = {
         ...params,
         format: 'xml',
      };

      // Remove undefined/null values
      const cleanParams: Record<string, string> = {};
      for (const [key, value] of Object.entries(allParams)) {
         if (value !== undefined && value !== null) {
            cleanParams[key] = String(value);
         }
      }

      const queryString = new URLSearchParams(cleanParams).toString();
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      const baseUrl = API_BASE_URL + fullPath;

      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
   }

   /**
    * Calculates retry delay with exponential backoff
    */
   private getRetryDelay(attempt: number): number {
      const delay = DEFAULT_RETRY_DELAY * 2 ** attempt;
      return Math.min(delay, MAX_RETRY_DELAY);
   }

   /**
    * Sleep helper
    */
   private sleep(ms: number): Promise<void> {
      return this.sleepCallback(ms);
   }

   private refreshTokens(): Promise<OAuth2Tokens> {
      const refresh = this.tokenRefreshCallback;
      if (!refresh) {
         return Promise.reject(
            new AuthenticationError('No token refresh callback available.'),
         );
      }
      if (!this.refreshInFlight) {
         this.refreshInFlight = (async () => {
            try {
               return await refresh();
            } finally {
               this.refreshInFlight = undefined;
            }
         })();
      }
      return this.refreshInFlight;
   }

   private parseRetryAfter(value: string | null): number {
      if (value && /^\d+$/.test(value.trim())) {
         const seconds = Number.parseInt(value, 10);
         return Number.isFinite(seconds) ? seconds : 60;
      }
      if (value) {
         const timestamp = Date.parse(value);
         if (Number.isFinite(timestamp)) {
            return Math.max(0, Math.ceil((timestamp - this.now()) / 1000));
         }
      }
      return 60;
   }
}
