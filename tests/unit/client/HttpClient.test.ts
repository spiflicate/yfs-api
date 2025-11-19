/**
 * Unit tests for HttpClient
 */

import {
   afterEach,
   beforeEach,
   describe,
   expect,
   mock,
   test,
} from 'bun:test';
import { HttpClient } from '../../../src/client/HttpClient.js';
import {
   OAuth2Client,
   type OAuth2Tokens,
} from '../../../src/client/OAuth2Client.js';
import {
   AuthenticationError,
   NetworkError,
   NotFoundError,
   RateLimitError,
   YahooApiError,
} from '../../../src/types/errors.js';
import { API_BASE_URL, HTTP_STATUS } from '../../../src/utils/constants.js';

describe('HttpClient', () => {
   let oauth2Client: OAuth2Client;
   let tokens: OAuth2Tokens;
   let originalFetch: typeof global.fetch;

   beforeEach(() => {
      // Save original fetch
      originalFetch = global.fetch;

      // Create OAuth2 client
      oauth2Client = new OAuth2Client(
         'test-client-id',
         'test-client-secret',
         'https://example.com/callback',
      );

      // Create mock tokens
      tokens = {
         accessToken: 'test-access-token',
         tokenType: 'bearer',
         expiresIn: 3600,
         refreshToken: 'test-refresh-token',
         expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
      };
   });

   afterEach(() => {
      // Restore original fetch
      global.fetch = originalFetch;
   });

   describe('constructor', () => {
      test('should create HttpClient with tokens', () => {
         const client = new HttpClient(oauth2Client, tokens);
         expect(client).toBeInstanceOf(HttpClient);
      });

      test('should create HttpClient without tokens', () => {
         const client = new HttpClient(oauth2Client);
         expect(client).toBeInstanceOf(HttpClient);
      });

      test('should accept custom options', () => {
         const client = new HttpClient(oauth2Client, tokens, undefined, {
            timeout: 60000,
            maxRetries: 5,
            debug: true,
         });
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('setTokens', () => {
      test('should set tokens', () => {
         const client = new HttpClient(oauth2Client);
         client.setTokens(tokens);
         // Token is set internally, verify by making a request
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('setTokenRefreshCallback', () => {
      test('should set token refresh callback', () => {
         const client = new HttpClient(oauth2Client, tokens);
         const callback = async () => tokens;
         client.setTokenRefreshCallback(callback);
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('get', () => {
      test('should make successful GET request', async () => {
         const xmlResponse =
            '<?xml version="1.0"?><fantasy_content><data>test-data</data></fantasy_content>';
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(xmlResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         const result = await client.get('/test/path');

         expect(result).toHaveProperty('data');
         expect(fetchMock).toHaveBeenCalledTimes(1);

         // Verify URL construction
         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [url] = callArgs;
         expect(url).toContain(API_BASE_URL);
         expect(url).toContain('/test/path');
         expect(url).toContain('format=xml');
      });

      test('should include authorization header', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.get('/test/path');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.headers.Authorization).toBe(
            `Bearer ${tokens.accessToken}`,
         );
      });

      test('should include query parameters', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.get('/test/path', {
            params: { status: 'A', count: 25, active: true },
         });

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [url] = callArgs;
         expect(url).toContain('status=A');
         expect(url).toContain('count=25');
         expect(url).toContain('active=true');
      });

      test('should filter out undefined params', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.get('/test/path', {
            params: { status: 'A', count: undefined },
         });

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [url] = callArgs;
         expect(url).toContain('status=A');
         expect(url).not.toContain('count');
      });

      test('should skip auth when skipAuth is true', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.get('/test/path', { skipAuth: true });

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.headers.Authorization).toBeUndefined();
      });
   });

   describe('post', () => {
      test('should make successful POST request with body', async () => {
         const requestBody = { key: 'value' };
         const xmlResponse =
            '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>';

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(xmlResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         const result = await client.post('/test/path', requestBody);

         expect(result).toHaveProperty('success');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.method).toBe('POST');
         expect(options.body).toBe(JSON.stringify(requestBody));
      });
   });

   describe('put', () => {
      test('should make successful PUT request with body', async () => {
         const requestBody = { key: 'value' };
         const xmlResponse =
            '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>';

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(xmlResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         const result = await client.put('/test/path', requestBody);

         expect(result).toHaveProperty('success');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.method).toBe('PUT');
      });
   });

   describe('delete', () => {
      test('should make successful DELETE request', async () => {
         const xmlResponse =
            '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>';

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(xmlResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         const result = await client.delete('/test/path');

         expect(result).toHaveProperty('success');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.method).toBe('DELETE');
      });
   });

   describe('error handling', () => {
      test('should throw AuthenticationError on 401', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: HTTP_STATUS.UNAUTHORIZED,
               text: () => Promise.resolve('Unauthorized'),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);

         await expect(client.get('/test/path')).rejects.toThrow(
            AuthenticationError,
         );
      });

      test('should throw NotFoundError on 404', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: HTTP_STATUS.NOT_FOUND,
               text: () => Promise.resolve('Not found'),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);

         await expect(client.get('/test/path')).rejects.toThrow(
            NotFoundError,
         );
      });

      test('should throw RateLimitError on 429 after retries', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: HTTP_STATUS.TOO_MANY_REQUESTS,
               headers: {
                  get: (name: string) =>
                     name === 'Retry-After' ? '60' : null,
               },
               text: () => Promise.resolve('Rate limited'),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 0, // Don't retry to speed up test
         });

         await expect(client.get('/test/path')).rejects.toThrow(
            RateLimitError,
         );
      });

      test('should throw YahooApiError on other error status', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: 400,
               statusText: 'Bad Request',
               text: () => Promise.resolve('Bad request body'),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);

         await expect(client.get('/test/path')).rejects.toThrow(
            YahooApiError,
         );
      });

      test('should throw AuthenticationError when no tokens available', async () => {
         const client = new HttpClient(oauth2Client); // No tokens

         await expect(client.get('/test/path')).rejects.toThrow(
            AuthenticationError,
         );
      });

      test('should throw NetworkError on timeout', async () => {
         const fetchMock = mock(() =>
            Promise.reject(
               Object.assign(new Error('Timeout'), { name: 'AbortError' }),
            ),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 0,
         });

         await expect(client.get('/test/path')).rejects.toThrow(
            NetworkError,
         );
      });

      test('should throw NetworkError on network error', async () => {
         const fetchMock = mock(() =>
            Promise.reject(new Error('Network failure')),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 0,
         });

         await expect(client.get('/test/path')).rejects.toThrow(
            NetworkError,
         );
      });
   });

   describe('token refresh', () => {
      test('should refresh expired token before request', async () => {
         const expiredTokens: OAuth2Tokens = {
            ...tokens,
            expiresAt: Date.now() - 1000, // Expired 1 second ago
         };

         const newTokens: OAuth2Tokens = {
            ...tokens,
            accessToken: 'new-access-token',
            expiresAt: Date.now() + 3600 * 1000,
         };

         let refreshCalled = false;
         const refreshCallback = async () => {
            refreshCalled = true;
            return newTokens;
         };

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(
            oauth2Client,
            expiredTokens,
            refreshCallback,
         );
         await client.get('/test/path');

         expect(refreshCalled).toBe(true);

         // Verify new token was used
         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.headers.Authorization).toBe(
            `Bearer ${newTokens.accessToken}`,
         );
      });

      test('should throw error if token expired and no refresh callback', async () => {
         const expiredTokens: OAuth2Tokens = {
            ...tokens,
            expiresAt: Date.now() - 1000,
         };

         const client = new HttpClient(oauth2Client, expiredTokens); // No callback

         await expect(client.get('/test/path')).rejects.toThrow(
            AuthenticationError,
         );
      });
   });

   describe('retry logic', () => {
      test('should retry on retryable status codes', async () => {
         let attempts = 0;
         const fetchMock = mock(() => {
            attempts++;
            if (attempts === 1) {
               return Promise.resolve({
                  ok: false,
                  status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
                  text: () => Promise.resolve('Server error'),
               });
            }
            return Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>',
                  ),
            });
         });
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 1,
         });

         const result = await client.get('/test/path');
         expect(result).toHaveProperty('success');
         expect(attempts).toBe(2);
      });

      test('should retry on 429 with Retry-After header', async () => {
         let attempts = 0;
         const fetchMock = mock(() => {
            attempts++;
            if (attempts === 1) {
               return Promise.resolve({
                  ok: false,
                  status: HTTP_STATUS.TOO_MANY_REQUESTS,
                  headers: {
                     get: (name: string) =>
                        name === 'Retry-After' ? '1' : null,
                  },
                  text: () => Promise.resolve('Rate limited'),
               });
            }
            return Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>',
                  ),
            });
         });
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 1,
         });

         const result = await client.get('/test/path');
         expect(result).toHaveProperty('success');
         expect(attempts).toBe(2);
      });

      test('should exhaust retries and throw error', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
               text: () => Promise.resolve('Server error'),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 2,
         });

         await expect(client.get('/test/path')).rejects.toThrow(
            YahooApiError,
         );
         expect(fetchMock.mock.calls?.length).toBe(3); // Initial + 2 retries
      });

      test('should retry on network errors', async () => {
         let attempts = 0;
         const fetchMock = mock(() => {
            attempts++;
            if (attempts === 1) {
               return Promise.reject(new Error('Network failure'));
            }
            return Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><success>true</success></fantasy_content>',
                  ),
            });
         });
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens, undefined, {
            maxRetries: 1,
         });

         const result = await client.get('/test/path');
         expect(result).toHaveProperty('success');
         expect(attempts).toBe(2);
      });
   });

   describe('custom options', () => {
      test('should use custom headers', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.get('/test/path', {
            headers: { 'X-Custom-Header': 'custom-value' },
         });

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.headers['X-Custom-Header']).toBe('custom-value');
      });

      test('should accept string body for POST', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);
         await client.post('/test/path', {
            body: 'raw-string-body',
         } as any);

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(typeof options.body).toBe('string');
      });
   });

   describe('rate limiting', () => {
      test('should wait for rate limiter', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(oauth2Client, tokens);

         // Make multiple rapid requests
         await Promise.all([
            client.get('/test/path1'),
            client.get('/test/path2'),
            client.get('/test/path3'),
         ]);

         expect(fetchMock.mock.calls?.length).toBe(3);
      });
   });
});
