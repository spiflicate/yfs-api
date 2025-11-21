/**
 * Interactive OAuth authentication helper for integration tests
 *
 * This module provides utilities to handle OAuth authentication flows
 * during integration testing, allowing tests to request authentication
 * when needed rather than requiring pre-configured tokens.
 *
 * TOKEN PRIORITY ORDER:
 * 1. Environment variables (YAHOO_ACCESS_TOKEN, etc.) - from .env, .env.test, or system
 * 2. File storage (.test-tokens.json in project root)
 * 3. Interactive OAuth flow (prompts user)
 *
 * See docs/TOKEN_FILE_GUIDE.md for complete documentation on token management.
 */

import type { OAuth2Tokens } from '../../../src/client/OAuth2Client.js';
import type { TokenStorage } from '../../../src/client/YahooFantasyClient.js';
import { YahooFantasyClient } from '../../../src/client/YahooFantasyClient.js';
import { getOAuth2Config, getStoredTokens } from './testConfig.js';

/**
 * File-based token storage for integration tests
 */
export class FileTokenStorage implements TokenStorage {
   private readonly tokenPath: string;

   constructor(tokenPath = '.test-tokens.json') {
      this.tokenPath = tokenPath;
   }

   save(tokens: OAuth2Tokens): void {
      try {
         Bun.write(this.tokenPath, JSON.stringify(tokens, null, 2));
      } catch (error) {
         console.error('Failed to save tokens:', error);
      }
   }

   /**
    * Synchronous load is not supported for file storage
    * Use loadAsync() instead
    */
   load(): OAuth2Tokens | null {
      return null;
   }

   clear(): void {
      try {
         const file = Bun.file(this.tokenPath);
         if (file.size > 0) {
            Bun.write(this.tokenPath, '');
         }
      } catch {
         // Ignore errors
      }
   }

   async loadAsync(): Promise<OAuth2Tokens | null> {
      try {
         const file = Bun.file(this.tokenPath);
         const exists = await file.exists();
         if (!exists) {
            return null;
         }
         const content = await file.text();
         return JSON.parse(content) as OAuth2Tokens;
      } catch {
         return null;
      }
   }
}

/**
 * Prompt user for authorization code via console
 */
async function promptForAuthCode(authUrl: string): Promise<string> {
   console.log('\n' + '='.repeat(70));
   console.log('AUTHENTICATION REQUIRED');
   console.log('='.repeat(70));
   console.log('\nPlease complete the following steps:');
   console.log('\n1. Open this URL in your browser:');
   console.log(`\n   ${authUrl}\n`);
   console.log('2. Authorize the application');
   console.log(
      '3. Copy the authorization code from the redirect URL or page',
   );
   console.log('4. Paste it below and press Enter');
   console.log('\n' + '='.repeat(70) + '\n');

   // Use readline for cross-platform stdin reading
   const readline = await import('node:readline');
   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
   });

   return new Promise<string>((resolve, reject) => {
      rl.question('Authorization Code: ', (answer) => {
         rl.close();
         const code = answer.trim();
         if (code) {
            resolve(code);
         } else {
            reject(new Error('No authorization code provided'));
         }
      });
   });
}

/**
 * Get an authenticated client for integration tests
 *
 * Token Priority Order:
 * 1. Environment variables (YAHOO_ACCESS_TOKEN, YAHOO_REFRESH_TOKEN, YAHOO_TOKEN_EXPIRES_AT)
 *    - Loaded from .env, .env.test, or system environment
 *    - Bun automatically loads .env files
 * 2. File storage (.test-tokens.json in project root)
 *    - Used by integration tests
 *    - Automatically saved when completing OAuth flow
 * 3. Interactive OAuth flow (if no valid tokens found)
 *    - Prompts user to authenticate
 *    - Saves tokens to file storage for future use
 *
 * This function will:
 * - Load tokens from highest priority source available
 * - Validate tokens are not expired
 * - Refresh expired tokens if refresh token exists
 * - Prompt for interactive auth if needed
 * - Save new tokens to file storage
 *
 * @param forceReauth - Force re-authentication even if valid tokens exist
 * @param tokenStorage - Optional custom token storage (defaults to .test-tokens.json)
 * @returns Authenticated YahooFantasyClient instance
 */
export async function getAuthenticatedClient(
   forceReauth = false,
   tokenStorage?: TokenStorage,
): Promise<YahooFantasyClient> {
   const config = getOAuth2Config();
   const storage = tokenStorage || new FileTokenStorage();

   // Try to get existing tokens
   let tokens: OAuth2Tokens | null = null;
   let tokenSource = '';

   if (!forceReauth) {
      // Priority 1: Environment variables (from .env, .env.test, or system env)
      tokens = getStoredTokens();
      if (tokens) {
         tokenSource = 'environment variables';
      }

      // Priority 2: File storage (.test-tokens.json)
      if (!tokens && storage instanceof FileTokenStorage) {
         tokens = await storage.loadAsync();
         if (tokens) {
            tokenSource = '.test-tokens.json';
         }
      }

      // Validate token expiration
      if (tokens && tokens.expiresAt <= Date.now()) {
         console.log(
            `⚠ Tokens from ${tokenSource} have expired, will attempt to refresh`,
         );
         // Keep the tokens for refresh attempt
      } else if (tokens) {
         console.log(`✓ Loaded valid tokens from ${tokenSource}`);
      }
   }

   // Create client with existing tokens if available
   if (tokens && !forceReauth) {
      const client = new YahooFantasyClient(
         {
            ...config,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
         },
         storage,
      );

      // Verify tokens still work (could have been revoked)
      if (client.isAuthenticated() && !client.isTokenExpired()) {
         return client;
      }

      // Try to refresh if tokens are expired or expiring soon
      if (tokens.refreshToken) {
         try {
            console.log('🔄 Refreshing access token...');
            await client.refreshToken();
            console.log('✓ Access token refreshed successfully');
            return client;
         } catch (error) {
            console.log(
               '✗ Token refresh failed, will need to re-authenticate',
            );
            console.log(
               `  Error: ${error instanceof Error ? error.message : String(error)}`,
            );
         }
      }
   }

   // Need to authenticate interactively
   console.log('\n🔐 Interactive OAuth authentication required');
   const client = new YahooFantasyClient(config, storage);

   // Generate authorization URL
   const state = `test-${Date.now()}`;
   const authUrl = client.getAuthUrl(state);

   // Prompt user for authorization code
   const authCode = await promptForAuthCode(authUrl);

   // Exchange code for tokens
   console.log('\nExchanging authorization code for tokens...');
   try {
      await client.authenticate(authCode);
      console.log('✓ Authentication successful!');
      console.log('✓ Tokens saved for future test runs\n');
      return client;
   } catch (error) {
      console.error('✗ Authentication failed:', error);
      throw new Error('Failed to authenticate with Yahoo API');
   }
}

/**
 * Check if authentication is available for tests
 *
 * This is useful for test suites that want to check if they can
 * run authenticated tests before executing them.
 *
 * @returns true if valid tokens are available or interactive auth is possible
 */
export function canAuthenticate(): boolean {
   try {
      // Check if we have credentials
      const config = getOAuth2Config();
      if (!config.clientId || !config.clientSecret) {
         return false;
      }

      // Check if we have valid tokens
      const tokens = getStoredTokens();
      if (tokens && tokens.expiresAt > Date.now()) {
         return true;
      }

      // Check file storage
      const storage = new FileTokenStorage();
      const fileTokens = storage.load();
      if (fileTokens && fileTokens.expiresAt > Date.now()) {
         return true;
      }

      // We can attempt interactive auth if running in TTY
      return Boolean(process.stdin.isTTY);
   } catch {
      return false;
   }
}

/**
 * Clear all stored authentication tokens
 * Useful for testing authentication flows or cleaning up after tests
 */
export function clearStoredTokens(): void {
   const storage = new FileTokenStorage();
   storage.clear();
   console.log('✓ Cleared stored tokens');
}
