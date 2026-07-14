/**
 * Unit tests for HttpClient
 */

// biome-ignore-all lint/suspicious/noExplicitAny: This file contains unit tests with explicit any types for mocking purposes

import {
   afterEach,
   beforeEach,
   describe,
   expect,
   mock,
   test,
} from 'bun:test';
import { OAuth2Client, type OAuth2Tokens } from '../auth/oauth2.js';
import { API_BASE_URL, HTTP_STATUS } from '../utils/constants.js';
import {
   AuthenticationError,
   NetworkError,
   NotFoundError,
   ParseError,
   RateLimitError,
   YahooApiError,
} from './errors.js';
import { HttpClient } from './http.js';

function createTokenProvider(tokens?: OAuth2Tokens) {
   return () => tokens;
}

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
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
         expect(client).toBeInstanceOf(HttpClient);
      });

      test('should create HttpClient without tokens', () => {
         const client = new HttpClient(oauth2Client);
         expect(client).toBeInstanceOf(HttpClient);
      });

      test('should accept custom options', () => {
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               timeout: 60000,
               maxRetries: 5,
               debug: true,
            },
         );
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('setTokenProvider', () => {
      test('should set token provider', async () => {
         const client = new HttpClient(oauth2Client);
         client.setTokenProvider(createTokenProvider(tokens));

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

         await client.get('/test/path');
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('setTokenRefreshCallback', () => {
      test('should set token refresh callback', () => {
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
         const callback = async () => tokens;
         client.setTokenRefreshCallback(callback);
         expect(client).toBeInstanceOf(HttpClient);
      });
   });

   describe('get', () => {
      test('should expose raw XML through a separately typed request path', async () => {
         const xmlResponse =
            '<?xml version="1.0"?><fantasy_content><data>raw</data></fantasy_content>';
         global.fetch = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(xmlResponse),
            }),
         ) as any;
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

         const result: string = await client.requestRawXml('/test/path');

         expect(result).toBe(xmlResponse);
      });

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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
         expect(options.headers['Content-Type']).toBe('application/json');
      });

      test('should default string POST bodies to XML content type', async () => {
         const xmlBody =
            '<?xml version="1.0"?><fantasy_content><transaction /></fantasy_content>';
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
            createTokenProvider(tokens),
         );
         await client.post('/test/path', xmlBody);

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.body).toBe(xmlBody);
         expect(options.headers['Content-Type']).toBe('application/xml');
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
         const result = await client.delete('/test/path');

         expect(result).toHaveProperty('success');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.method).toBe('DELETE');
         expect(options.headers['Content-Type']).toBeUndefined();
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 0, // Don't retry to speed up test
            },
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 0,
            },
         );

         await expect(client.get('/test/path')).rejects.toThrow(
            NetworkError,
         );
      });

      test('should throw NetworkError on network error', async () => {
         const fetchMock = mock(() =>
            Promise.reject(new Error('Network failure')),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 0,
            },
         );

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

         let currentTokens = expiredTokens;
         let refreshCalled = false;
         const refreshCallback = async () => {
            refreshCalled = true;
            currentTokens = newTokens;
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
            () => currentTokens,
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(expiredTokens),
         ); // No callback

         await expect(client.get('/test/path')).rejects.toThrow(
            AuthenticationError,
         );
      });

      test('should refresh and retry once on 401 even when maxRetries is zero', async () => {
         const newTokens: OAuth2Tokens = {
            ...tokens,
            accessToken: 'new-access-token',
            expiresAt: Date.now() + 3600 * 1000,
         };

         let currentTokens = tokens;
         let refreshCalled = false;
         const refreshCallback = async () => {
            refreshCalled = true;
            currentTokens = newTokens;
            return newTokens;
         };

         let attempts = 0;
         const fetchMock = mock(() => {
            attempts++;
            if (attempts === 1) {
               return Promise.resolve({
                  ok: false,
                  status: HTTP_STATUS.UNAUTHORIZED,
                  text: () =>
                     Promise.resolve(
                        '<?xml version="1.0"?><error><description>Invalid cookie, please log in again.</description></error>',
                     ),
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

         const client = new HttpClient(
            oauth2Client,
            () => currentTokens,
            refreshCallback,
            {
               maxRetries: 0,
            },
         );

         const result = await client.get('/test/path');

         expect(result).toHaveProperty('success');
         expect(refreshCalled).toBe(true);
         expect(fetchMock).toHaveBeenCalledTimes(2);

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length < 2) {
            throw new Error('Expected fetch to be called twice');
         }

         const [, firstOptions] = calls[0] as any[];
         const [, secondOptions] = calls[1] as any[];
         expect(firstOptions.headers.Authorization).toBe(
            `Bearer ${tokens.accessToken}`,
         );
         expect(secondOptions.headers.Authorization).toBe(
            `Bearer ${newTokens.accessToken}`,
         );
      });

      test('should only refresh once when 401 persists after retry', async () => {
         const newTokens: OAuth2Tokens = {
            ...tokens,
            accessToken: 'new-access-token',
            expiresAt: Date.now() + 3600 * 1000,
         };

         let currentTokens = tokens;
         let refreshCalls = 0;
         const refreshCallback = async () => {
            refreshCalls++;
            currentTokens = newTokens;
            return newTokens;
         };

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               status: HTTP_STATUS.UNAUTHORIZED,
               text: () =>
                  Promise.resolve(
                     '<?xml version="1.0"?><error><description>Invalid cookie, please log in again.</description></error>',
                  ),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new HttpClient(
            oauth2Client,
            () => currentTokens,
            refreshCallback,
            {
               maxRetries: 0,
            },
         );

         await expect(client.get('/test/path')).rejects.toThrow(
            AuthenticationError,
         );
         expect(refreshCalls).toBe(1);
         expect(fetchMock).toHaveBeenCalledTimes(2);
      });

      test('shares one refresh across concurrent expired requests', async () => {
         const expired = { ...tokens, expiresAt: 0 };
         const renewed = {
            ...tokens,
            accessToken: 'renewed',
            expiresAt: Date.now() + 3_600_000,
         };
         let current = expired;
         let release!: () => void;
         const gate = new Promise<void>((resolve) => {
            release = resolve;
         });
         const refresh = mock(async () => {
            await gate;
            current = renewed;
            return renewed;
         });
         global.fetch = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         ) as any;
         const client = new HttpClient(
            oauth2Client,
            () => current,
            refresh,
         );

         const requests = [client.get('/one'), client.get('/two')];
         await Promise.resolve();
         release();
         await Promise.all(requests);
         expect(refresh).toHaveBeenCalledTimes(1);
      });

      test('shares same-token 401 refresh and bypasses refresh for a stale 401', async () => {
         const renewed = {
            ...tokens,
            accessToken: 'renewed',
            expiresAt: Date.now() + 3_600_000,
         };
         let current = tokens;
         let firstResponse!: (value: unknown) => void;
         let dispatched!: () => void;
         const didDispatch = new Promise<void>((resolve) => {
            dispatched = resolve;
         });
         const first = new Promise((resolve) => {
            firstResponse = resolve;
         });
         let calls = 0;
         global.fetch = mock(() => {
            calls++;
            if (calls === 1) {
               dispatched();
               return first;
            }
            return Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<fantasy_content><result>ok</result></fantasy_content>',
                  ),
            });
         }) as any;
         const refresh = mock(async () => renewed);
         const client = new HttpClient(
            oauth2Client,
            () => current,
            refresh,
            {
               maxRetries: 0,
            },
         );

         const request = client.get('/stale');
         await didDispatch;
         current = renewed;
         firstResponse({
            ok: false,
            status: HTTP_STATUS.UNAUTHORIZED,
            text: () => Promise.resolve('expired'),
         });
         await request;
         expect(refresh).not.toHaveBeenCalled();
         expect(calls).toBe(2);
      });

      test('joins one refresh for concurrent same-token GET 401 responses', async () => {
         const renewed = {
            ...tokens,
            accessToken: 'renewed',
            expiresAt: Date.now() + 3_600_000,
         };
         let current = tokens;
         let releaseResponses!: () => void;
         const responseGate = new Promise<void>((resolve) => {
            releaseResponses = resolve;
         });
         let initialRequests = 0;
         let bothDispatched!: () => void;
         const dispatched = new Promise<void>((resolve) => {
            bothDispatched = resolve;
         });
         global.fetch = mock(async (_url: string, options: RequestInit) => {
            const authorization = (
               options.headers as Record<string, string>
            ).Authorization;
            if (authorization?.includes(tokens.accessToken)) {
               initialRequests++;
               if (initialRequests === 2) bothDispatched();
               await responseGate;
               return {
                  ok: false,
                  status: HTTP_STATUS.UNAUTHORIZED,
                  text: () => Promise.resolve('expired'),
               };
            }
            return {
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<fantasy_content><result>ok</result></fantasy_content>',
                  ),
            };
         }) as any;
         let releaseRefresh!: () => void;
         const refreshGate = new Promise<void>((resolve) => {
            releaseRefresh = resolve;
         });
         const refresh = mock(async () => {
            await refreshGate;
            current = renewed;
            return renewed;
         });
         const client = new HttpClient(
            oauth2Client,
            () => current,
            refresh,
            {
               maxRetries: 0,
            },
         );

         const requests = [client.get('/one'), client.get('/two')];
         await dispatched;
         releaseResponses();
         await Promise.resolve();
         releaseRefresh();
         await Promise.all(requests);
         expect(refresh).toHaveBeenCalledTimes(1);
      });

      test('clears a rejected refresh so a later request can recover', async () => {
         const expired = { ...tokens, expiresAt: 0 };
         const renewed = { ...tokens, expiresAt: Date.now() + 3_600_000 };
         let current = expired;
         let refreshCalls = 0;
         const refresh = async () => {
            refreshCalls++;
            if (refreshCalls === 1) throw new Error('refresh failed');
            current = renewed;
            return renewed;
         };
         global.fetch = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<fantasy_content><result>ok</result></fantasy_content>',
                  ),
            }),
         ) as any;
         const client = new HttpClient(
            oauth2Client,
            () => current,
            refresh,
            {
               maxRetries: 0,
            },
         );

         await expect(client.get('/first')).rejects.toBeInstanceOf(
            NetworkError,
         );
         await expect(client.get('/second')).resolves.toHaveProperty(
            'result',
         );
         expect(refreshCalls).toBe(2);
      });
   });

   describe('retry logic', () => {
      for (const method of ['post', 'put', 'delete'] as const) {
         for (const failure of [
            'network',
            'status',
            'unauthorized',
         ] as const) {
            test(`${method.toUpperCase()} is not replayed after ${failure}`, async () => {
               const fetchMock = mock(() => {
                  if (failure === 'network') {
                     return Promise.reject(new Error('disconnected'));
                  }
                  return Promise.resolve({
                     ok: false,
                     status:
                        failure === 'status'
                           ? HTTP_STATUS.INTERNAL_SERVER_ERROR
                           : HTTP_STATUS.UNAUTHORIZED,
                     statusText: 'failed',
                     text: () => Promise.resolve('failed'),
                  });
               });
               global.fetch = fetchMock as any;
               const refresh = mock(async () => tokens);
               const client = new HttpClient(
                  oauth2Client,
                  createTokenProvider(tokens),
                  refresh,
                  { maxRetries: 2, sleep: async () => {} },
               );

               const request =
                  method === 'delete'
                     ? client.delete('/test/path')
                     : client[method]('/test/path', {});
               await expect(request).rejects.toBeInstanceOf(Error);
               expect(fetchMock).toHaveBeenCalledTimes(1);
               expect(refresh).not.toHaveBeenCalled();
            });
         }
      }

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 1,
               sleep: async () => {},
            },
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 1,
               sleep: async () => {},
            },
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 2,
               sleep: async () => {},
            },
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               maxRetries: 1,
               sleep: async () => {},
            },
         );

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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );
         await client.post('/test/path', 'raw-string-body');

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(typeof options.body).toBe('string');
         expect(options.headers['Content-Type']).toBe('application/xml');
      });

      test('should respect explicit content type for string bodies', async () => {
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
            createTokenProvider(tokens),
         );
         await client.post('/test/path', '<xml />', {
            headers: { 'Content-Type': 'text/plain' },
         });

         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.headers['Content-Type']).toBe('text/plain');
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

         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

         // Make multiple rapid requests
         await Promise.all([
            client.get('/test/path1'),
            client.get('/test/path2'),
            client.get('/test/path3'),
         ]);

         expect(fetchMock.mock.calls?.length).toBe(3);
      });

      test('serializes more than 40 concurrent admissions within the configured window', async () => {
         let now = 0;
         const admittedAt: number[] = [];
         global.fetch = mock(() => {
            admittedAt.push(now);
            return Promise.resolve({
               ok: true,
               status: 200,
               text: () =>
                  Promise.resolve(
                     '<fantasy_content><result>ok</result></fantasy_content>',
                  ),
            });
         }) as any;
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
            undefined,
            {
               now: () => now,
               sleep: async (ms) => {
                  now += ms;
               },
            },
         );

         await Promise.all(
            Array.from({ length: 45 }, (_, index) =>
               client.get(`/test/path${index}`),
            ),
         );

         for (const admitted of admittedAt) {
            expect(
               admittedAt.filter(
                  (timestamp) =>
                     timestamp <= admitted && timestamp > admitted - 1000,
               ).length,
            ).toBeLessThanOrEqual(20);
         }
      });
   });

   describe('response semantics', () => {
      test('wraps malformed typed XML in ParseError without refetching', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve('<not-yahoo />'),
            }),
         );
         global.fetch = fetchMock as any;
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

         await expect(client.get('/test/path')).rejects.toBeInstanceOf(
            ParseError,
         );
         expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      test('returns malformed and empty raw XML unchanged', async () => {
         const bodies = ['<not-yahoo />', ''];
         global.fetch = mock(() =>
            Promise.resolve({
               ok: true,
               status: 200,
               text: () => Promise.resolve(bodies.shift()),
            }),
         ) as any;
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

         expect(await client.requestRawXml('/malformed')).toBe(
            '<not-yahoo />',
         );
         expect(await client.requestRawXml('/empty')).toBe('');
      });

      test('returns undefined for empty write successes and rejects empty typed GET', async () => {
         const responses = [
            { status: 204, body: '' },
            { status: 200, body: '  \n ' },
            { status: 200, body: '' },
         ];
         global.fetch = mock(() => {
            const response = responses.shift();
            if (!response) throw new Error('Unexpected fetch');
            return Promise.resolve({
               ok: true,
               status: response.status,
               text: () => Promise.resolve(response.body),
            });
         }) as any;
         const client = new HttpClient(
            oauth2Client,
            createTokenProvider(tokens),
         );

         expect(await client.post('/post')).toBeUndefined();
         expect(await client.put('/put')).toBeUndefined();
         await expect(client.get('/get')).rejects.toBeInstanceOf(
            ParseError,
         );
      });
   });

   describe('Retry-After', () => {
      for (const [label, header, expected] of [
         ['future date', 'Thu, 01 Jan 1970 00:00:02 GMT', 2],
         ['past date', 'Wed, 31 Dec 1969 23:59:59 GMT', 0],
         ['invalid value', 'eventually', 60],
         ['missing value', null, 60],
      ] as const) {
         test(`normalizes ${label}`, async () => {
            global.fetch = mock(() =>
               Promise.resolve({
                  ok: false,
                  status: HTTP_STATUS.TOO_MANY_REQUESTS,
                  headers: { get: () => header },
                  text: () => Promise.resolve('limited'),
               }),
            ) as any;
            const client = new HttpClient(
               oauth2Client,
               createTokenProvider(tokens),
               undefined,
               { maxRetries: 0, now: () => 0 },
            );

            try {
               await client.get('/limited');
               throw new Error('expected rate limit');
            } catch (error) {
               expect(error).toBeInstanceOf(RateLimitError);
               expect((error as RateLimitError).retryAfter).toBe(expected);
               expect(
                  Number.isFinite((error as RateLimitError).retryAfter),
               ).toBe(true);
            }
         });
      }
   });
});
