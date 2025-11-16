/**
 * Integration tests for OAuth 2.0 authentication flow
 *
 * These tests verify the OAuth 2.0 user authentication mode:
 * - Authorization URL generation
 * - Token exchange
 * - Token refresh
 * - Token storage
 *
 * NOTE: These tests require valid Yahoo API credentials and stored tokens.
 * Set the following environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 * - YAHOO_REDIRECT_URI (optional, defaults to 'oob')
 * - YAHOO_ACCESS_TOKEN (for testing with existing tokens)
 * - YAHOO_REFRESH_TOKEN (for testing token refresh)
 * - YAHOO_TOKEN_EXPIRES_AT (timestamp)
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import {
   getOAuth2Config,
   shouldSkipIntegrationTests,
   hasValidCredentials,
   hasStoredTokens,
   getStoredTokens,
} from '../helpers/testConfig.js';
import {
   InMemoryTokenStorage,
   createMockTokenStorage,
} from '../helpers/testStorage.js';

describe.skipIf(shouldSkipIntegrationTests() || !hasValidCredentials())(
   'OAuth 2.0 Integration Tests',
   () => {
      let config: ReturnType<typeof getOAuth2Config>;

      beforeAll(() => {
         config = getOAuth2Config();
      });

      describe('Client Configuration', () => {
         test('should create client with valid config', () => {
            const client = new YahooFantasyClient(config);
            expect(client).toBeInstanceOf(YahooFantasyClient);
         });

         test('should initialize all resource clients', () => {
            const client = new YahooFantasyClient(config);
            expect(client.user).toBeDefined();
            expect(client.league).toBeDefined();
            expect(client.team).toBeDefined();
            expect(client.player).toBeDefined();
            expect(client.transaction).toBeDefined();
            expect(client.game).toBeDefined();
         });

         test('should not be authenticated without tokens', () => {
            const client = new YahooFantasyClient(config);
            expect(client.isAuthenticated()).toBe(false);
         });
      });

      describe('Authorization URL', () => {
         test('should generate valid authorization URL', () => {
            const client = new YahooFantasyClient(config);
            const authUrl = client.getAuthUrl();

            expect(authUrl).toBeTruthy();
            expect(authUrl).toContain(
               'https://api.login.yahoo.com/oauth2/request_auth',
            );
            expect(authUrl).toContain(`client_id=${config.clientId}`);
         });

         test('should include state parameter', () => {
            const client = new YahooFantasyClient(config);
            const state = 'test-state-123';
            const authUrl = client.getAuthUrl(state);

            expect(authUrl).toContain(`state=${state}`);
         });

         test('should support custom language', () => {
            const client = new YahooFantasyClient(config);
            const authUrl = client.getAuthUrl(undefined, 'es-es');

            expect(authUrl).toContain('language=es-es');
         });
      });

      describe.skipIf(!hasStoredTokens())('Token Management', () => {
         test('should work with pre-configured tokens', () => {
            const tokens = getStoredTokens();
            if (!tokens) {
               console.warn('Skipping: No stored tokens available');
               return;
            }

            const clientWithTokens = new YahooFantasyClient({
               ...config,
               accessToken: tokens.accessToken,
               refreshToken: tokens.refreshToken,
               expiresAt: tokens.expiresAt,
            });

            expect(clientWithTokens.isAuthenticated()).toBe(true);
            expect(clientWithTokens.getTokens()).toBeTruthy();
         });

         test('should detect token expiration', () => {
            const expiredTokens = {
               accessToken: 'expired-token',
               refreshToken: 'refresh-token',
               expiresAt: Date.now() - 1000, // Expired 1 second ago
               tokenType: 'bearer' as const,
               expiresIn: -1,
            };

            const client = new YahooFantasyClient({
               ...config,
               accessToken: expiredTokens.accessToken,
               refreshToken: expiredTokens.refreshToken,
               expiresAt: expiredTokens.expiresAt,
            });

            expect(client.isTokenExpired()).toBe(true);
         });

         test('should detect valid tokens', () => {
            const validTokens = {
               accessToken: 'valid-token',
               refreshToken: 'refresh-token',
               expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
               tokenType: 'bearer' as const,
               expiresIn: 3600,
            };

            const client = new YahooFantasyClient({
               ...config,
               accessToken: validTokens.accessToken,
               refreshToken: validTokens.refreshToken,
               expiresAt: validTokens.expiresAt,
            });

            expect(client.isTokenExpired()).toBe(false);
         });

         test('should refresh expired token', async () => {
            const tokens = getStoredTokens();
            if (!tokens) {
               console.warn('Skipping: No stored tokens available');
               return;
            }

            const client = new YahooFantasyClient({
               ...config,
               accessToken: tokens.accessToken,
               refreshToken: tokens.refreshToken,
               expiresAt: tokens.expiresAt,
            });

            // Only test if token is actually expired or about to expire
            if (client.isTokenExpired(300)) {
               // 5 minute buffer
               const oldTokens = client.getTokens();
               await client.refreshToken();
               const newTokens = client.getTokens();

               expect(newTokens).toBeTruthy();
               expect(newTokens?.accessToken).not.toBe(
                  oldTokens?.accessToken,
               );
               expect(newTokens?.refreshToken).toBeTruthy();
               expect(client.isTokenExpired()).toBe(false);
            }
         });
      });

      describe('Token Storage', () => {
         test('should integrate with token storage', async () => {
            const storage = new InMemoryTokenStorage();
            const client = new YahooFantasyClient(config, storage);

            expect(await client.loadTokens()).toBe(false);
         });

         test('should load tokens from storage', async () => {
            const mockTokens = {
               accessToken: 'stored-access-token',
               refreshToken: 'stored-refresh-token',
               expiresAt: Date.now() + 3600 * 1000,
               tokenType: 'bearer' as const,
               expiresIn: 3600,
            };

            const storage = createMockTokenStorage(mockTokens);
            const client = new YahooFantasyClient(config, storage);

            const loaded = await client.loadTokens();

            expect(loaded).toBe(true);
            expect(client.isAuthenticated()).toBe(true);
            expect(client.getTokens()?.accessToken).toBe(
               mockTokens.accessToken,
            );
         });

         test('should clear tokens on logout', async () => {
            const mockTokens = {
               accessToken: 'stored-access-token',
               refreshToken: 'stored-refresh-token',
               expiresAt: Date.now() + 3600 * 1000,
               tokenType: 'bearer' as const,
               expiresIn: 3600,
            };

            const storage = createMockTokenStorage(mockTokens);
            const client = new YahooFantasyClient(config, storage);

            await client.loadTokens();
            expect(client.isAuthenticated()).toBe(true);

            await client.logout();

            expect(client.isAuthenticated()).toBe(false);
            expect(client.getTokens()).toBeNull();
            expect(storage.load()).toBeNull();
         });
      });

      describe.skipIf(!hasStoredTokens())('API Access', () => {
         test('should make authenticated API request', async () => {
            const tokens = getStoredTokens();
            if (!tokens) {
               console.warn('Skipping: No stored tokens available');
               return;
            }

            const client = new YahooFantasyClient({
               ...config,
               accessToken: tokens.accessToken,
               refreshToken: tokens.refreshToken,
               expiresAt: tokens.expiresAt,
            });

            // Make a simple API call to verify authentication
            const httpClient = client.getHttpClient();
            const response = await httpClient.get('/users;use_login=1');

            expect(response).toBeDefined();
            expect((response as any).fantasy_content).toBeDefined();
         });

         test('should automatically refresh token if expired', async () => {
            const tokens = getStoredTokens();
            if (!tokens) {
               console.warn('Skipping: No stored tokens available');
               return;
            }

            // Create client with expired token
            const client = new YahooFantasyClient({
               ...config,
               accessToken: 'expired-token',
               refreshToken: tokens.refreshToken,
               expiresAt: Date.now() - 1000, // Expired
            });

            // Should automatically refresh before making request
            const httpClient = client.getHttpClient();
            const response = await httpClient.get('/users;use_login=1');

            expect(response).toBeDefined();
            expect(client.getTokens()?.accessToken).not.toBe(
               'expired-token',
            );
         });
      });
   },
);
