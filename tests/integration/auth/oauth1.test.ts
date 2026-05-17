/**
 * Integration tests for OAuth 1.0 (Public Mode) authentication
 *
 * These tests verify the OAuth 1.0 2-legged authentication for public endpoints:
 * - Public mode configuration
 * - Access to public endpoints without user authorization
 * - Game metadata
 * - Player searches
 *
 * NOTE: These tests require valid Yahoo API credentials.
 * Set the following environment variables:
 * - YAHOO_CLIENT_ID
 * - YAHOO_CLIENT_SECRET
 */

// biome-ignore-all lint/suspicious/noExplicitAny: This file contains unit tests with explicit any types for mocking purposes

import { beforeAll, describe, expect, test } from 'bun:test';
import { ConfigError } from '../../../src/client/errors.js';
import { YahooFantasyClient } from '../../../src/client/yahoo.js';
import {
   getOAuth1Config,
   hasValidCredentials,
   shouldSkipIntegrationTests,
} from '../helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !hasValidCredentials())(
   'OAuth 1.0 (Public Mode) Integration Tests',
   () => {
      let config: ReturnType<typeof getOAuth1Config>;

      beforeAll(() => {
         config = getOAuth1Config();
      });

      describe('Client Configuration', () => {
         test('should create client in public mode', () => {
            const client = new YahooFantasyClient(config);
            expect(client).toBeInstanceOf(YahooFantasyClient);
         });

         test('should be authenticated in public mode', () => {
            const client = new YahooFantasyClient(config);
            expect(client.isAuthenticated()).toBe(true);
         });

         test('should throw error when calling getAuthUrl in public mode', () => {
            const client = new YahooFantasyClient(config);
            expect(() => client.getAuthUrl()).toThrow(ConfigError);
         });

         test('should throw error when calling authenticate in public mode', async () => {
            const client = new YahooFantasyClient(config);
            expect(async () => {
               await client.authenticate('test-code');
            }).toThrow(ConfigError);
         });

         test('should not require redirectUri in public mode', () => {
            const publicConfig = {
               clientId: config.clientId,
               clientSecret: config.clientSecret,
               publicMode: true,
            };

            expect(
               () => new YahooFantasyClient(publicConfig),
            ).not.toThrow();
         });
      });

      describe('Game Resource - Public Endpoints', () => {
         test('should fetch game metadata by code', async () => {
            const client = new YahooFantasyClient(config);
            const game = (
               (await client.api().game('nhl').get()) as { game: any }
            ).game;

            expect(game).toBeDefined();
            expect(game.code).toBe('nhl');
            expect(game.gameKey).toBeTruthy();
            expect(game.name).toBeTruthy();
            expect(game.season).toBeGreaterThan(2000);
         });

         test('should fetch game metadata by game key', async () => {
            const client = new YahooFantasyClient(config);
            // NHL game key format: 427 (or similar)
            const game = (
               (await client.api().game('nhl').get()) as { game: any }
            ).game;
            const gameByKey = (
               (await client.api().game(game.gameKey).get()) as {
                  game: any;
               }
            ).game;

            expect(gameByKey).toBeDefined();
            expect(gameByKey.gameKey).toBe(game.gameKey);
            expect(gameByKey.code).toBe(game.code);
         });

         test('should fetch multiple games', async () => {
            const client = new YahooFantasyClient(config);
            const games = (
               (await client.api().games(['nhl', 'nfl']).get()) as {
                  games: any[];
               }
            ).games;

            expect(games).toBeDefined();
            expect(Array.isArray(games)).toBe(true);
            expect(games.length).toBeGreaterThan(0);

            const gameCodes = games.map((g) => g.code);
            expect(gameCodes).toContain('nhl');
         });

         test('should fetch available games', async () => {
            const client = new YahooFantasyClient(config);
            const games = (
               (await client
                  .api()
                  .games()
                  .params({ is_available: '1' })
                  .get()) as { games: any[] }
            ).games;

            expect(games).toBeDefined();
            expect(Array.isArray(games)).toBe(true);
            expect(games.length).toBeGreaterThan(0);

            // All games should be available (or isGameOver may be undefined if API doesn't include it)
            for (const game of games) {
               // Yahoo API may not include isGameOver field in filtered results
               expect(
                  game.isGameOver === false ||
                     game.isGameOver === undefined,
               ).toBe(true);
            }
         });

         test('should include game metadata with settings', async () => {
            const client = new YahooFantasyClient(config);
            const game = (
               (await client
                  .api()
                  .game('nhl')
                  .include('position_types', 'stat_categories')
                  .get()) as { game: any }
            ).game;

            expect(game).toBeDefined();
            expect(game.code).toBe('nhl');
            // These may or may not be present depending on API response
            // but the request should succeed
         });
      });

      describe('Player Search - Public Endpoints', () => {
         test('should search for players by name', async () => {
            const client = new YahooFantasyClient(config);
            const result = (await client
               .api()
               .game('nhl')
               .players()
               .search('McDavid')
               .count(5)
               .get()) as { players: any[] };

            expect(result).toBeDefined();
            expect(result.players).toBeDefined();
            expect(Array.isArray(result.players)).toBe(true);

            if (result.players && result.players.length > 0) {
               const firstPlayer = result.players[0];
               expect(firstPlayer?.name).toBeTruthy();
               expect(firstPlayer?.playerKey).toBeTruthy();
            }
         });

         test('should filter players by position', async () => {
            const client = new YahooFantasyClient(config);
            const result = (await client
               .api()
               .game('nhl')
               .players()
               .position('C')
               .count(10)
               .get()) as { players: any[] };

            expect(result).toBeDefined();
            expect(result.players).toBeDefined();
         });

         test('should sort players', async () => {
            const client = new YahooFantasyClient(config);
            const result = (await client
               .api()
               .game('nhl')
               .players()
               .sort('NAME')
               .count(5)
               .get()) as { players: any[] };

            expect(result).toBeDefined();
            expect(result.players).toBeDefined();
         });

         test('should handle pagination', async () => {
            const client = new YahooFantasyClient(config);
            const firstPage = (await client
               .api()
               .game('nhl')
               .players()
               .start(0)
               .count(10)
               .get()) as { players: any[] };

            const secondPage = (await client
               .api()
               .game('nhl')
               .players()
               .start(10)
               .count(10)
               .get()) as { players: any[] };

            expect(firstPage).toBeDefined();
            expect(secondPage).toBeDefined();

            // Results should be different pages
            if (
               firstPage.players &&
               firstPage.players.length > 0 &&
               secondPage.players &&
               secondPage.players.length > 0
            ) {
               expect(firstPage.players[0]?.playerKey).not.toBe(
                  secondPage.players[0]?.playerKey,
               );
            }
         });
      });

      describe('Error Handling', () => {
         test('should handle invalid game code', async () => {
            const client = new YahooFantasyClient(config);

            expect(async () => {
               await client.api().game('invalid-game-code').get();
            }).toThrow();
         });

         test('should handle invalid player search', async () => {
            const client = new YahooFantasyClient(config);

            // Empty search should still work but might return fewer results
            const result = await client
               .api()
               .game('nhl')
               .players()
               .search('')
               .count(5)
               .get();

            expect(result).toBeDefined();
         });
      });

      describe('Multiple Requests', () => {
         test('should handle concurrent requests', async () => {
            const client = new YahooFantasyClient(config);

            const requests = [
               client.api().game('nhl').get() as Promise<{ game: any }>,
               client.api().game('nfl').get() as Promise<{ game: any }>,
               client
                  .api()
                  .game('nhl')
                  .players()
                  .search('McDavid')
                  .count(5)
                  .get() as Promise<{ players: any[] }>,
            ] as const;

            const results = await Promise.all(requests);

            expect(results).toHaveLength(3);
            expect(results[0].game.code).toBe('nhl');
            expect(results[1].game.code).toBe('nfl');
            expect(results[2].players).toBeDefined();
         });

         test('should handle sequential requests', async () => {
            const client = new YahooFantasyClient(config);

            const nhlGame = (await client.api().game('nhl').get()) as {
               game: any;
            };
            expect(nhlGame).toBeDefined();

            const players = (await client
               .api()
               .game(nhlGame.game.gameKey)
               .players()
               .count(5)
               .get()) as { players: any[] };
            expect(players).toBeDefined();

            const nflGame = (await client.api().game('nfl').get()) as {
               game: any;
            };
            expect(nflGame.game).toBeDefined();
         });
      });
   },
);
