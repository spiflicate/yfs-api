/**
 * Unit tests for OAuth2Client
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
   OAuth2Client,
   OAUTH2_ENDPOINTS,
   type OAuth2Tokens,
} from '../../../src/client/OAuth2Client.js';
import {
   ConfigError,
   AuthenticationError,
} from '../../../src/types/errors.js';

describe('OAuth2Client', () => {
   const clientId = 'test-client-id';
   const clientSecret = 'test-client-secret';
   const redirectUri = 'https://example.com/callback';

   describe('constructor', () => {
      test('should create client with valid credentials', () => {
         const client = new OAuth2Client(
            clientId,
            clientSecret,
            redirectUri,
         );
         expect(client).toBeInstanceOf(OAuth2Client);
      });

      test('should throw ConfigError if clientId is missing', () => {
         expect(() => {
            new OAuth2Client('', clientSecret, redirectUri);
         }).toThrow(ConfigError);
      });

      test('should throw ConfigError if clientSecret is missing', () => {
         expect(() => {
            new OAuth2Client(clientId, '', redirectUri);
         }).toThrow(ConfigError);
      });

      test('should allow creating client without redirectUri', () => {
         const client = new OAuth2Client(clientId, clientSecret);
         expect(client).toBeInstanceOf(OAuth2Client);
      });

      test('should throw ConfigError when calling getAuthorizationUrl without redirectUri', () => {
         const client = new OAuth2Client(clientId, clientSecret);
         expect(() => {
            client.getAuthorizationUrl();
         }).toThrow(ConfigError);
      });
   });

   describe('getAuthorizationUrl', () => {
      let client: OAuth2Client;

      beforeEach(() => {
         client = new OAuth2Client(clientId, clientSecret, redirectUri);
      });

      test('should generate authorization URL with default language', () => {
         const url = client.getAuthorizationUrl();

         expect(url).toContain(OAUTH2_ENDPOINTS.AUTHORIZE);
         expect(url).toContain(`client_id=${clientId}`);
         expect(url).toContain(
            `redirect_uri=${encodeURIComponent(redirectUri)}`,
         );
         expect(url).toContain('response_type=code');
         expect(url).toContain('language=en-us');
      });

      test('should include state parameter when provided', () => {
         const state = 'random-state-string';
         const url = client.getAuthorizationUrl(state);

         expect(url).toContain(`state=${state}`);
      });

      test('should support custom language', () => {
         const url = client.getAuthorizationUrl(undefined, 'es-es');

         expect(url).toContain('language=es-es');
      });

      test('should not include state when not provided', () => {
         const url = client.getAuthorizationUrl();

         expect(url).not.toContain('state=');
      });
   });

   describe('exchangeCodeForToken', () => {
      let client: OAuth2Client;

      beforeEach(() => {
         client = new OAuth2Client(clientId, clientSecret, redirectUri);
      });

      test('should throw ConfigError if code is empty', async () => {
         await expect(client.exchangeCodeForToken('')).rejects.toThrow(
            ConfigError,
         );
      });

      test('should exchange code for tokens successfully', async () => {
         const mockResponse = {
            access_token: 'test-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'test-refresh-token',
            xoauth_yahoo_guid: 'test-guid',
         };

         // Mock fetch
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () => Promise.resolve(mockResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const tokens = await client.exchangeCodeForToken('test-code');

         expect(tokens.accessToken).toBe('test-access-token');
         expect(tokens.tokenType).toBe('bearer');
         expect(tokens.expiresIn).toBe(3600);
         expect(tokens.refreshToken).toBe('test-refresh-token');
         expect(tokens.yahooGuid).toBe('test-guid');
         expect(tokens.expiresAt).toBeGreaterThan(Date.now());

         // Verify fetch was called correctly
         expect(fetchMock).toHaveBeenCalledTimes(1);
         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [url, options] = callArgs;
         expect(url).toBe(OAUTH2_ENDPOINTS.TOKEN);
         expect(options.method).toBe('POST');
         expect(options.headers['Content-Type']).toBe(
            'application/x-www-form-urlencoded',
         );
         expect(options.headers['Authorization']).toContain('Basic ');
      });

      test('should throw AuthenticationError on failed request', async () => {
         const mockErrorResponse = {
            error: 'invalid_grant',
            error_description: 'Authorization code is invalid',
         };

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               text: () =>
                  Promise.resolve(JSON.stringify(mockErrorResponse)),
            }),
         );
         global.fetch = fetchMock as any;

         await expect(
            client.exchangeCodeForToken('invalid-code'),
         ).rejects.toThrow(AuthenticationError);
      });

      test('should handle non-JSON error responses', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               text: () => Promise.resolve('Server error'),
            }),
         );
         global.fetch = fetchMock as any;

         await expect(
            client.exchangeCodeForToken('test-code'),
         ).rejects.toThrow(AuthenticationError);
      });

      test('should handle network errors', async () => {
         const fetchMock = mock(() =>
            Promise.reject(new Error('Network error')),
         );
         global.fetch = fetchMock as any;

         await expect(
            client.exchangeCodeForToken('test-code'),
         ).rejects.toThrow(AuthenticationError);
      });
   });

   describe('refreshAccessToken', () => {
      let client: OAuth2Client;

      beforeEach(() => {
         client = new OAuth2Client(clientId, clientSecret, redirectUri);
      });

      test('should throw ConfigError if refresh token is empty', async () => {
         await expect(client.refreshAccessToken('')).rejects.toThrow(
            ConfigError,
         );
      });

      test('should refresh access token successfully', async () => {
         const mockResponse = {
            access_token: 'new-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'new-refresh-token',
         };

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () => Promise.resolve(mockResponse),
            }),
         );
         global.fetch = fetchMock as any;

         const tokens =
            await client.refreshAccessToken('old-refresh-token');

         expect(tokens.accessToken).toBe('new-access-token');
         expect(tokens.refreshToken).toBe('new-refresh-token');
         expect(tokens.expiresAt).toBeGreaterThan(Date.now());

         // Verify the request body contains grant_type=refresh_token
         const calls = fetchMock.mock.calls;
         if (!calls || calls.length === 0) {
            throw new Error('Expected fetch to be called');
         }
         const callArgs = calls[0] as any[];
         const [, options] = callArgs;
         expect(options.body).toContain('grant_type=refresh_token');
         expect(options.body).toContain('refresh_token=old-refresh-token');
      });

      test('should throw AuthenticationError on failed refresh', async () => {
         const mockErrorResponse = {
            error: 'invalid_grant',
            error_description: 'Refresh token is invalid or expired',
         };

         const fetchMock = mock(() =>
            Promise.resolve({
               ok: false,
               text: () =>
                  Promise.resolve(JSON.stringify(mockErrorResponse)),
            }),
         );
         global.fetch = fetchMock as any;

         await expect(
            client.refreshAccessToken('invalid-refresh-token'),
         ).rejects.toThrow(AuthenticationError);
      });
   });

   describe('isTokenExpired', () => {
      let client: OAuth2Client;

      beforeEach(() => {
         client = new OAuth2Client(clientId, clientSecret, redirectUri);
      });

      test('should return false for valid token', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
         };

         expect(client.isTokenExpired(tokens)).toBe(false);
      });

      test('should return true for expired token', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() - 1000, // 1 second ago
         };

         expect(client.isTokenExpired(tokens)).toBe(true);
      });

      test('should return true for token expiring within buffer', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 30 * 1000, // 30 seconds from now
         };

         // Default buffer is 60 seconds
         expect(client.isTokenExpired(tokens)).toBe(true);
      });

      test('should respect custom buffer time', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 30 * 1000, // 30 seconds from now
         };

         // With 10 second buffer, should not be expired
         expect(client.isTokenExpired(tokens, 10)).toBe(false);

         // With 60 second buffer, should be expired
         expect(client.isTokenExpired(tokens, 60)).toBe(true);
      });
   });

   describe('getTimeUntilExpiration', () => {
      let client: OAuth2Client;

      beforeEach(() => {
         client = new OAuth2Client(clientId, clientSecret, redirectUri);
      });

      test('should return positive seconds for valid token', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
         };

         const timeRemaining = client.getTimeUntilExpiration(tokens);
         expect(timeRemaining).toBeGreaterThan(3590); // Allow for some processing time
         expect(timeRemaining).toBeLessThanOrEqual(3600);
      });

      test('should return negative seconds for expired token', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now() - 60 * 1000, // 60 seconds ago
         };

         const timeRemaining = client.getTimeUntilExpiration(tokens);
         expect(timeRemaining).toBeLessThan(0);
         expect(timeRemaining).toBeGreaterThanOrEqual(-61);
         expect(timeRemaining).toBeLessThanOrEqual(-59);
      });

      test('should return 0 for token expiring now', () => {
         const tokens: OAuth2Tokens = {
            accessToken: 'test-token',
            tokenType: 'bearer',
            expiresIn: 3600,
            refreshToken: 'test-refresh',
            expiresAt: Date.now(),
         };

         const timeRemaining = client.getTimeUntilExpiration(tokens);
         expect(timeRemaining).toBeGreaterThanOrEqual(-1);
         expect(timeRemaining).toBeLessThanOrEqual(1);
      });
   });

   describe('OAUTH2_ENDPOINTS', () => {
      test('should have correct endpoint URLs', () => {
         expect(OAUTH2_ENDPOINTS.AUTHORIZE).toBe(
            'https://api.login.yahoo.com/oauth2/request_auth',
         );
         expect(OAUTH2_ENDPOINTS.TOKEN).toBe(
            'https://api.login.yahoo.com/oauth2/get_token',
         );
      });
   });
});
