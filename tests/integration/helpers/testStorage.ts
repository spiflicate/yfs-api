/**
 * In-memory token storage for integration tests
 */

import type { TokenStorage } from '../../../src/client/YahooFantasyClient.js';
import type { OAuth2Tokens } from '../../../src/client/OAuth2Client.js';

/**
 * Simple in-memory token storage for testing
 */
export class InMemoryTokenStorage implements TokenStorage {
   private tokens: OAuth2Tokens | null = null;

   save(tokens: OAuth2Tokens): void {
      this.tokens = tokens;
   }

   load(): OAuth2Tokens | null {
      return this.tokens;
   }

   clear(): void {
      this.tokens = null;
   }

   /**
    * Get the stored tokens (for testing)
    */
   getTokens(): OAuth2Tokens | null {
      return this.tokens;
   }
}

/**
 * Create a mock token storage with predefined tokens
 */
export function createMockTokenStorage(
   initialTokens?: OAuth2Tokens,
): InMemoryTokenStorage {
   const storage = new InMemoryTokenStorage();
   if (initialTokens) {
      storage.save(initialTokens);
   }
   return storage;
}
