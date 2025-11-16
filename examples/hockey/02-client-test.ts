/**
 * Test the refactored YahooFantasyClient with OAuth 2.0
 */

import { YahooFantasyClient } from '../../src/index.js';
import type { TokenStorage } from '../../src/index.js';
import type { OAuth2Tokens } from '../../src/index.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Configuration from environment variables
const config = {
   clientId: process.env.YAHOO_CONSUMER_KEY!,
   clientSecret: process.env.YAHOO_CONSUMER_SECRET!,
   redirectUri: process.env.YAHOO_REDIRECT_URI || 'oob',
   debug: true,
};

// Token storage implementation
const tokenFile = path.join(process.cwd(), '.test-tokens.json');
const storage: TokenStorage = {
   async save(tokens: OAuth2Tokens) {
      console.log('[TokenStorage] Saving tokens...');
      await fs.writeFile(tokenFile, JSON.stringify(tokens, null, 2));
   },
   async load(): Promise<OAuth2Tokens | null> {
      try {
         console.log('[TokenStorage] Loading tokens...');
         const data = await fs.readFile(tokenFile, 'utf-8');
         return JSON.parse(data);
      } catch {
         console.log('[TokenStorage] No existing tokens found');
         return null;
      }
   },
   async clear() {
      console.log('[TokenStorage] Clearing tokens...');
      try {
         await fs.unlink(tokenFile);
      } catch {
         // File doesn't exist, that's fine
      }
   },
};

async function main() {
   console.log(
      '======================================================================',
   );
   console.log('YahooFantasyClient - OAuth 2.0 Test');
   console.log(
      '======================================================================\n',
   );

   // Create client
   const client = new YahooFantasyClient(config, storage);

   // Try to load existing tokens
   console.log('Step 1: Checking for existing tokens...');
   const hasTokens = await client.loadTokens();

   if (!hasTokens) {
      console.log('\n✗ No existing tokens found. Need to authenticate.\n');

      // Get authorization URL
      const authUrl = client.getAuthUrl();
      console.log('Step 2: Please visit this URL to authorize:\n');
      console.log(authUrl);
      console.log(
         '\nAfter authorizing, paste the authorization code here:',
      );

      // In a real app, you'd get the code from user input
      // For now, we'll just show instructions
      console.log('\nTo complete authentication, run:');
      console.log(
         '  const code = "..."; // Authorization code from redirect',
      );
      console.log('  await client.authenticate(code);');

      return;
   }

   console.log('✓ Tokens loaded successfully\n');

   // Check if token is expired
   if (client.isTokenExpired()) {
      console.log('Token expired, refreshing...');
      await client.refreshToken();
      console.log('✓ Token refreshed\n');
   } else {
      const tokens = client.getTokens();
      if (tokens) {
         const secondsRemaining = Math.floor(
            (tokens.expiresAt - Date.now()) / 1000,
         );
         const minutesRemaining = Math.floor(secondsRemaining / 60);
         console.log(
            `✓ Token is still valid (expires in ${minutesRemaining} minutes)\n`,
         );
      }
   }

   // Test API access
   console.log('Step 2: Testing API access...');
   try {
      const httpClient = client.getHttpClient();
      const response = await httpClient.get('/users;use_login=1');
      console.log('✓ API test successful!\n');

      console.log('Response preview:');
      console.log(
         JSON.stringify(response, null, 2).substring(0, 500) + '...\n',
      );
   } catch (error) {
      console.error('✗ API test failed:', error);
      throw error;
   }

   console.log(
      '======================================================================',
   );
   console.log('SUCCESS: YahooFantasyClient is working correctly!');
   console.log(
      '======================================================================\n',
   );

   // Display token info
   const tokens = client.getTokens();
   if (tokens) {
      const secondsRemaining = Math.floor(
         (tokens.expiresAt - Date.now()) / 1000,
      );
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;

      console.log('Token Information:');
      console.log(
         `  Access Token: ${tokens.accessToken.substring(0, 20)}...`,
      );
      console.log(`  Token Type: ${tokens.tokenType}`);
      console.log(
         `  Expires At: ${new Date(tokens.expiresAt).toISOString()}`,
      );
      console.log(
         `  Time Remaining: ${minutes} minutes ${seconds} seconds\n`,
      );
   }
}

main().catch(console.error);
