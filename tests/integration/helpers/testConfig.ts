/**
 * Test configuration helper for integration tests
 *
 * For automatic OAuth authentication handling, see authFlow.ts
 * which provides getAuthenticatedClient() for seamless token management.
 */

import type { OAuth2Tokens } from '../../../src/client/OAuth2Client.js';
import type { Config } from '../../../src/types/index.js';

/**
 * Get OAuth 2.0 configuration from environment
 */
export function getOAuth2Config(): Config {
   const clientId = process.env.YAHOO_CLIENT_ID;
   const clientSecret = process.env.YAHOO_CLIENT_SECRET;
   const redirectUri = process.env.YAHOO_REDIRECT_URI || 'oob';

   if (!clientId || !clientSecret) {
      throw new Error(
         'Missing required environment variables: YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET',
      );
   }

   return {
      clientId,
      clientSecret,
      redirectUri,
      debug: process.env.DEBUG === 'true',
   };
}

/**
 * Get OAuth 1.0 (public mode) configuration from environment
 */
export function getOAuth1Config(): Config {
   const clientId = process.env.YAHOO_CLIENT_ID;
   const clientSecret = process.env.YAHOO_CLIENT_SECRET;

   if (!clientId || !clientSecret) {
      throw new Error(
         'Missing required environment variables: YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET',
      );
   }

   return {
      clientId,
      clientSecret,
      publicMode: true,
      debug: process.env.DEBUG === 'true',
   };
}

/**
 * Get stored tokens from environment (for CI/testing)
 *
 * Loads OAuth 2.0 tokens from environment variables.
 * Bun automatically loads .env files from the project root in this priority:
 * 1. .env.local (highest priority)
 * 2. .env.development, .env.test, .env.production (based on NODE_ENV)
 * 3. .env (lowest priority)
 *
 * For integration tests, tokens can be set in:
 * - .env.test (recommended for local testing)
 * - .env (general use)
 * - System environment variables (CI/CD)
 *
 * @returns OAuth2Tokens if all required env vars are set, null otherwise
 */
export function getStoredTokens(): OAuth2Tokens | null {
   const accessToken = process.env.YAHOO_ACCESS_TOKEN;
   const refreshToken = process.env.YAHOO_REFRESH_TOKEN;
   const expiresAt = process.env.YAHOO_TOKEN_EXPIRES_AT;

   if (!accessToken || !refreshToken || !expiresAt) {
      return null;
   }

   return {
      accessToken,
      refreshToken,
      expiresAt: Number.parseInt(expiresAt, 10),
      tokenType: 'bearer',
      expiresIn: Math.floor(
         (Number.parseInt(expiresAt, 10) - Date.now()) / 1000,
      ),
   };
}

/**
 * Get test league key from environment
 */
export function getTestLeagueKey(): string {
   const leagueKey = process.env.TEST_LEAGUE_KEY;
   if (!leagueKey) {
      throw new Error('TEST_LEAGUE_KEY environment variable is required');
   }
   return leagueKey;
}

/**
 * Get test team key from environment
 */
export function getTestTeamKey(): string {
   const teamKey = process.env.TEST_TEAM_KEY;
   if (!teamKey) {
      throw new Error('TEST_TEAM_KEY environment variable is required');
   }
   return teamKey;
}

/**
 * Check if integration tests should be skipped
 */
export function shouldSkipIntegrationTests(): boolean {
   return process.env.SKIP_INTEGRATION_TESTS === 'true';
}

/**
 * Check if we have valid credentials for integration tests
 */
export function hasValidCredentials(): boolean {
   const clientId = process.env.YAHOO_CLIENT_ID;
   const clientSecret = process.env.YAHOO_CLIENT_SECRET;
   return !!(clientId && clientSecret);
}

/**
 * Check if we have stored tokens for testing
 */
export function hasStoredTokens(): boolean {
   const tokens = getStoredTokens();
   return tokens !== null && tokens.expiresAt > Date.now();
}
