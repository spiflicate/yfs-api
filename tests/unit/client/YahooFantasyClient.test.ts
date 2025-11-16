/**
 * Unit tests for YahooFantasyClient
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
   YahooFantasyClient,
   type TokenStorage,
} from '../../../src/client/YahooFantasyClient.js';
import type { Config } from '../../../src/types/index.js';
import { ConfigError } from '../../../src/types/index.js';
import type { OAuth2Tokens } from '../../../src/client/OAuth2Client.js';

describe('YahooFantasyClient', () => {
   const config: Config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
   };

   const mockTokens: OAuth2Tokens = {
      accessToken: 'test-access-token',
      tokenType: 'bearer',
      expiresIn: 3600,
      refreshToken: 'test-refresh-token',
      expiresAt: Date.now() + 3600 * 1000,
   };

   describe('constructor', () => {
      test('should create client with valid config', () => {
         const client = new YahooFantasyClient(config);
         expect(client).toBeInstanceOf(YahooFantasyClient);
      });

      test('should throw ConfigError if clientId is missing', () => {
         expect(() => {
            new YahooFantasyClient({ ...config, clientId: '' });
         }).toThrow(ConfigError);
      });

      test('should throw ConfigError if clientSecret is missing', () => {
         expect(() => {
            new YahooFantasyClient({ ...config, clientSecret: '' });
         }).toThrow(ConfigError);
      });

      test('should throw ConfigError if redirectUri is missing in user auth mode', () => {
         expect(() => {
            new YahooFantasyClient({
               clientId: config.clientId,
               clientSecret: config.clientSecret,
               redirectUri: '',
            });
         }).toThrow(ConfigError);
      });

      test('should allow creating client in public mode without redirectUri', () => {
         const publicConfig: Config = {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            publicMode: true,
         };
         const client = new YahooFantasyClient(publicConfig);
         expect(client).toBeInstanceOf(YahooFantasyClient);
         expect(client.isAuthenticated()).toBe(true);
      });

      test('should throw ConfigError when calling getAuthUrl in public mode', () => {
         const publicConfig: Config = {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            publicMode: true,
         };
         const client = new YahooFantasyClient(publicConfig);
         expect(() => {
            client.getAuthUrl();
         }).toThrow(ConfigError);
      });

      test('should throw ConfigError when calling authenticate in public mode', () => {
         const publicConfig: Config = {
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            publicMode: true,
         };
         const client = new YahooFantasyClient(publicConfig);
         expect(async () => {
            await client.authenticate('test-code');
         }).toThrow(ConfigError);
      });

      test('should accept debug option', () => {
         const client = new YahooFantasyClient({ ...config, debug: true });
         expect(client).toBeInstanceOf(YahooFantasyClient);
      });

      test('should accept timeout option', () => {
         const client = new YahooFantasyClient({
            ...config,
            timeout: 60000,
         });
         expect(client).toBeInstanceOf(YahooFantasyClient);
      });

      test('should accept maxRetries option', () => {
         const client = new YahooFantasyClient({
            ...config,
            maxRetries: 5,
         });
         expect(client).toBeInstanceOf(YahooFantasyClient);
      });

      test('should accept tokens in config', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };
         const client = new YahooFantasyClient(configWithTokens);
         expect(client.isAuthenticated()).toBe(true);
      });

      test('should accept token storage', () => {
         const storage: TokenStorage = {
            save: () => {},
            load: () => null,
            clear: () => {},
         };
         const client = new YahooFantasyClient(config, storage);
         expect(client).toBeInstanceOf(YahooFantasyClient);
      });
   });

   describe('resource clients', () => {
      test('should have user resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.user).toBeDefined();
      });

      test('should have league resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.league).toBeDefined();
      });

      test('should have team resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.team).toBeDefined();
      });

      test('should have player resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.player).toBeDefined();
      });

      test('should have transaction resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.transaction).toBeDefined();
      });

      test('should have game resource', () => {
         const client = new YahooFantasyClient(config);
         expect(client.game).toBeDefined();
      });
   });

   describe('getAuthUrl', () => {
      test('should generate authorization URL', () => {
         const client = new YahooFantasyClient(config);
         const authUrl = client.getAuthUrl();

         expect(authUrl).toContain(
            'https://api.login.yahoo.com/oauth2/request_auth',
         );
         expect(authUrl).toContain(`client_id=${config.clientId}`);
         expect(authUrl).toContain(
            `redirect_uri=${encodeURIComponent(config.redirectUri || '')}`,
         );
      });

      test('should include state parameter when provided', () => {
         const client = new YahooFantasyClient(config);
         const state = 'random-state-string';
         const authUrl = client.getAuthUrl(state);

         expect(authUrl).toContain(`state=${state}`);
      });

      test('should support custom language', () => {
         const client = new YahooFantasyClient(config);
         const authUrl = client.getAuthUrl(undefined, 'es-es');

         expect(authUrl).toContain('language=es-es');
      });
   });

   describe('authenticate', () => {
      test('should exchange code for tokens', async () => {
         // Mock fetch for OAuth token request
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'test-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'test-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new YahooFantasyClient(config);
         await client.authenticate('test-code');

         expect(client.isAuthenticated()).toBe(true);
         expect(client.getTokens()).not.toBeNull();
      });

      test('should save tokens to storage after authentication', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'test-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'test-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         let savedTokens: OAuth2Tokens | undefined;
         const storage: TokenStorage = {
            save: (tokens) => {
               savedTokens = tokens;
            },
            load: () => null,
            clear: () => {},
         };

         const client = new YahooFantasyClient(config, storage);
         await client.authenticate('test-code');

         expect(savedTokens).toBeDefined();
         if (savedTokens) {
            expect(savedTokens.accessToken).toBe('test-access-token');
         }
      });
   });

   describe('loadTokens', () => {
      test('should load tokens from storage', async () => {
         const storage: TokenStorage = {
            save: () => {},
            load: () => mockTokens,
            clear: () => {},
         };

         const client = new YahooFantasyClient(config, storage);
         const loaded = await client.loadTokens();

         expect(loaded).toBe(true);
         expect(client.isAuthenticated()).toBe(true);
      });

      test('should return false when no tokens in storage', async () => {
         const storage: TokenStorage = {
            save: () => {},
            load: () => null,
            clear: () => {},
         };

         const client = new YahooFantasyClient(config, storage);
         const loaded = await client.loadTokens();

         expect(loaded).toBe(false);
         expect(client.isAuthenticated()).toBe(false);
      });

      test('should return false when no storage provided', async () => {
         const client = new YahooFantasyClient(config);
         const loaded = await client.loadTokens();

         expect(loaded).toBe(false);
      });

      test('should support async load', async () => {
         const storage: TokenStorage = {
            save: async () => {},
            load: async () => mockTokens,
            clear: async () => {},
         };

         const client = new YahooFantasyClient(config, storage);
         const loaded = await client.loadTokens();

         expect(loaded).toBe(true);
      });
   });

   describe('refreshToken', () => {
      test('should refresh access token', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'new-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'new-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         const configWithTokens: Config = {
            ...config,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };

         const client = new YahooFantasyClient(configWithTokens);
         await client.refreshToken();

         const tokens = client.getTokens();
         expect(tokens?.accessToken).toBe('new-access-token');
      });

      test('should throw ConfigError if no refresh token available', async () => {
         const client = new YahooFantasyClient(config);

         await expect(client.refreshToken()).rejects.toThrow(ConfigError);
      });

      test('should save refreshed tokens to storage', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'new-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'new-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         let savedTokens: OAuth2Tokens | undefined;
         const storage: TokenStorage = {
            save: (tokens) => {
               savedTokens = tokens;
            },
            load: () => null,
            clear: () => {},
         };

         const configWithTokens: Config = {
            ...config,
            accessToken: 'old-access',
            refreshToken: 'old-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };

         const client = new YahooFantasyClient(configWithTokens, storage);
         await client.refreshToken();

         if (savedTokens) {
            expect(savedTokens.accessToken).toBe('new-access-token');
         }
      });
   });

   describe('isAuthenticated', () => {
      test('should return true when tokens exist', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };
         const client = new YahooFantasyClient(configWithTokens);

         expect(client.isAuthenticated()).toBe(true);
      });

      test('should return false when no tokens', () => {
         const client = new YahooFantasyClient(config);

         expect(client.isAuthenticated()).toBe(false);
      });
   });

   describe('isTokenExpired', () => {
      test('should return false for valid token', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000, // 1 hour from now
         };
         const client = new YahooFantasyClient(configWithTokens);

         expect(client.isTokenExpired()).toBe(false);
      });

      test('should return true for expired token', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() - 1000, // 1 second ago
         };
         const client = new YahooFantasyClient(configWithTokens);

         expect(client.isTokenExpired()).toBe(true);
      });

      test('should return true when no tokens', () => {
         const client = new YahooFantasyClient(config);

         expect(client.isTokenExpired()).toBe(true);
      });

      test('should respect custom buffer time', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 30 * 1000, // 30 seconds from now
         };
         const client = new YahooFantasyClient(configWithTokens);

         // With 60 second buffer, should be expired
         expect(client.isTokenExpired(60)).toBe(true);

         // With 10 second buffer, should not be expired
         expect(client.isTokenExpired(10)).toBe(false);
      });
   });

   describe('getTokens', () => {
      test('should return tokens when authenticated', () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };
         const client = new YahooFantasyClient(configWithTokens);

         const tokens = client.getTokens();
         expect(tokens).not.toBeNull();
         expect(tokens?.accessToken).toBe('test-access');
      });

      test('should return null when not authenticated', () => {
         const client = new YahooFantasyClient(config);

         const tokens = client.getTokens();
         expect(tokens).toBeNull();
      });
   });

   describe('logout', () => {
      test('should clear tokens', async () => {
         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };
         const client = new YahooFantasyClient(configWithTokens);

         expect(client.isAuthenticated()).toBe(true);

         await client.logout();

         expect(client.isAuthenticated()).toBe(false);
         expect(client.getTokens()).toBeNull();
      });

      test('should clear tokens from storage', async () => {
         let cleared = false;
         const storage: TokenStorage = {
            save: () => {},
            load: () => mockTokens,
            clear: () => {
               cleared = true;
            },
         };

         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };

         const client = new YahooFantasyClient(configWithTokens, storage);
         await client.logout();

         expect(cleared).toBe(true);
      });

      test('should support async clear', async () => {
         let cleared = false;
         const storage: TokenStorage = {
            save: async () => {},
            load: async () => mockTokens,
            clear: async () => {
               cleared = true;
            },
         };

         const configWithTokens: Config = {
            ...config,
            accessToken: 'test-access',
            refreshToken: 'test-refresh',
            expiresAt: Date.now() + 3600 * 1000,
         };

         const client = new YahooFantasyClient(configWithTokens, storage);
         await client.logout();

         expect(cleared).toBe(true);
      });
   });

   describe('getHttpClient', () => {
      test('should return HTTP client', () => {
         const client = new YahooFantasyClient(config);
         const httpClient = client.getHttpClient();

         expect(httpClient).toBeDefined();
      });
   });

   describe('token storage integration', () => {
      test('should save tokens on authentication', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'test-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'test-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         let saveCallCount = 0;
         const storage: TokenStorage = {
            save: () => {
               saveCallCount++;
            },
            load: () => null,
            clear: () => {},
         };

         const client = new YahooFantasyClient(config, storage);
         await client.authenticate('test-code');

         expect(saveCallCount).toBe(1);
      });

      test('should work without storage', async () => {
         const fetchMock = mock(() =>
            Promise.resolve({
               ok: true,
               json: () =>
                  Promise.resolve({
                     access_token: 'test-access-token',
                     token_type: 'bearer',
                     expires_in: 3600,
                     refresh_token: 'test-refresh-token',
                  }),
            }),
         );
         global.fetch = fetchMock as any;

         const client = new YahooFantasyClient(config);
         await client.authenticate('test-code');

         expect(client.isAuthenticated()).toBe(true);
      });
   });
});
