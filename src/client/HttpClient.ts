/**
 * HTTP client for Yahoo Fantasy Sports API
 * @module
 */

import type { OAuth2Client, OAuth2Tokens } from './OAuth2Client.js';
import {
   YahooApiError,
   NetworkError,
   RateLimitError,
   NotFoundError,
   AuthenticationError,
} from '../types/errors.js';
import {
   API_BASE_URL,
   HTTP_STATUS,
   RETRYABLE_STATUS_CODES,
   DEFAULT_TIMEOUT,
   DEFAULT_MAX_RETRIES,
   DEFAULT_RETRY_DELAY,
   MAX_RETRY_DELAY,
} from '../utils/constants.js';

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

/**
 * Rate limiter to prevent hitting API limits
 */
class RateLimiter {
   private requests: number[] = [];
   private readonly maxRequests: number;
   private readonly windowMs: number;

   constructor(maxRequests = 20, windowMs = 1000) {
      this.maxRequests = maxRequests;
      this.windowMs = windowMs;
   }

   /**
    * Wait if necessary to comply with rate limits
    */
   async wait(): Promise<void> {
      const now = Date.now();

      // Remove requests outside the current window
      this.requests = this.requests.filter(
         (time) => now - time < this.windowMs,
      );

      if (this.requests.length >= this.maxRequests) {
         // Wait until the oldest request expires
         const oldestRequest = this.requests[0];
         if (oldestRequest) {
            const waitTime = this.windowMs - (now - oldestRequest);
            if (waitTime > 0) {
               await new Promise((resolve) =>
                  setTimeout(resolve, waitTime),
               );
            }
         }
      }

      this.requests.push(Date.now());
   }
}

/**
 * Callback for refreshing expired tokens
 */
export type TokenRefreshCallback = () => Promise<OAuth2Tokens>;

/**
 * HTTP client for making API requests with retry logic and rate limiting
 *
 * @example
 * ```typescript
 * const http = new HttpClient(oauth2Client, tokens, refreshCallback);
 *
 * const data = await http.get('/users;use_login=1/games');
 * ```
 */
export class HttpClient {
   private oauth2Client: OAuth2Client;
   private tokens?: OAuth2Tokens;
   private tokenRefreshCallback?: TokenRefreshCallback;
   private rateLimiter: RateLimiter;
   private timeout: number;
   private maxRetries: number;
   private debug: boolean;

   /**
    * Creates a new HTTP client
    *
    * @param oauth2Client - OAuth 2.0 client for token management
    * @param tokens - OAuth 2.0 tokens (optional, can be set later)
    * @param tokenRefreshCallback - Callback to refresh tokens when expired
    * @param options - Additional options
    */
   constructor(
      oauth2Client: OAuth2Client,
      tokens?: OAuth2Tokens,
      tokenRefreshCallback?: TokenRefreshCallback,
      options?: {
         timeout?: number;
         maxRetries?: number;
         debug?: boolean;
      },
   ) {
      this.oauth2Client = oauth2Client;
      this.tokens = tokens;
      this.tokenRefreshCallback = tokenRefreshCallback;
      this.rateLimiter = new RateLimiter();
      this.timeout = options?.timeout ?? DEFAULT_TIMEOUT;
      this.maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
      this.debug = options?.debug ?? false;
   }

   /**
    * Sets the OAuth 2.0 tokens
    *
    * @param tokens - OAuth 2.0 tokens
    */
   setTokens(tokens: OAuth2Tokens): void {
      this.tokens = tokens;
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
      return this.request<T>(path, { ...options, method: 'GET' });
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
      body?: Record<string, unknown>,
      options?: RequestOptions,
   ): Promise<T> {
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
      body?: Record<string, unknown>,
      options?: RequestOptions,
   ): Promise<T> {
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
   ): Promise<T> {
      return this.request<T>(path, { ...options, method: 'DELETE' });
   }

   /**
    * Makes an HTTP request with retry logic
    */
   private async request<T>(
      path: string,
      options: RequestOptions = {},
   ): Promise<T> {
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

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
         try {
            // Wait for rate limiter
            await this.rateLimiter.wait();

            // Build URL with query params
            const url = this.buildUrl(path, params);

            // Build headers
            const requestHeaders: Record<string, string> = {
               'Content-Type': 'application/json',
               ...headers,
            };

            // Add OAuth 2.0 Bearer authorization if not skipped
            if (!skipAuth) {
               // Check if tokens need refresh
               if (
                  this.tokens &&
                  this.oauth2Client.isTokenExpired(this.tokens)
               ) {
                  if (this.tokenRefreshCallback) {
                     if (this.debug) {
                        console.log(
                           '[HttpClient] Token expired, refreshing...',
                        );
                     }
                     this.tokens = await this.tokenRefreshCallback();
                  } else {
                     throw new AuthenticationError(
                        'Access token expired and no refresh callback available.',
                     );
                  }
               }

               if (!this.tokens?.accessToken) {
                  throw new AuthenticationError(
                     'No access token available. Please authenticate first.',
                  );
               }

               requestHeaders.Authorization = `Bearer ${this.tokens.accessToken}`;
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
               const retrySeconds = retryAfter
                  ? Number.parseInt(retryAfter, 10)
                  : 60;

               if (attempt < maxRetries) {
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
                  attempt < maxRetries
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

            // Parse response
            const data = (await response.json()) as T;

            if (this.debug) {
               console.log(`[HttpClient] Response:`, data);
            }

            return data;
         } catch (error) {
            if (error instanceof YahooApiError) {
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
            if (attempt < maxRetries) {
               const delay = this.getRetryDelay(attempt);
               if (this.debug) {
                  console.log(
                     `[HttpClient] Network error, retrying in ${delay}ms`,
                  );
               }
               await this.sleep(delay);
               continue;
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
      // Add format=json to all requests
      const allParams = {
         ...params,
         format: 'json',
      };

      // Remove undefined/null values
      const cleanParams = Object.entries(allParams)
         .filter(([_, value]) => value !== undefined && value !== null)
         .reduce(
            (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
            {},
         );

      const queryString = new URLSearchParams(cleanParams).toString();
      const fullPath = path.startsWith('/') ? path : `/${path}`;
      const baseUrl = API_BASE_URL + fullPath;

      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
   }

   /**
    * Calculates retry delay with exponential backoff
    */
   private getRetryDelay(attempt: number): number {
      const delay = DEFAULT_RETRY_DELAY * Math.pow(2, attempt);
      return Math.min(delay, MAX_RETRY_DELAY);
   }

   /**
    * Sleep helper
    */
   private sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }
}
