/**
 * Example: Basic Authentication Flow
 *
 * This example demonstrates how to authenticate with Yahoo Fantasy Sports API.
 *
 * Prerequisites:
 * 1. Create a Yahoo Developer Application at https://developer.yahoo.com/apps/
 * 2. Get your Consumer Key and Consumer Secret
 * 3. Set them as environment variables or in a .env file
 *
 * To run this example:
 * ```bash
 * bun run examples/hockey/01-authentication.ts
 * ```
 */

import { YahooFantasyClient, type TokenStorage } from '../../src/index.js';

// Simple file-based token storage
const tokenStorage: TokenStorage = {
   save() {
      console.log('[TokenStorage] Saving tokens...');
      // In a real app, save to file or database
      // await Bun.write('tokens.json', JSON.stringify(tokens));
   },

   load() {
      console.log('[TokenStorage] Loading tokens...');
      // In a real app, load from file or database
      // try {
      //   const file = await Bun.file('tokens.json').text();
      //   return JSON.parse(file);
      // } catch {
      //   return null;
      // }
      return null;
   },

   clear() {
      console.log('[TokenStorage] Clearing tokens...');
      // In a real app, delete file or database entry
      // await Bun.file('tokens.json').unlink();
   },
};

async function main() {
   // Create client
   const client = new YahooFantasyClient(
      {
         consumerKey: process.env.YAHOO_CONSUMER_KEY || 'your-consumer-key',
         consumerSecret:
            process.env.YAHOO_CONSUMER_SECRET || 'your-consumer-secret',
         debug: true, // Enable debug logging
      },
      tokenStorage,
   );

   console.log('='.repeat(60));
   console.log('Yahoo Fantasy Sports API - Authentication Example');
   console.log('='.repeat(60));
   console.log();

   // Try to load existing tokens
   console.log('Step 1: Checking for existing tokens...');
   const hasTokens = await client.loadTokens();

   if (hasTokens) {
      console.log('✓ Found existing tokens!');
      console.log();
   } else {
      console.log('✗ No existing tokens found.');
      console.log();

      // Step 1: Get authorization URL
      console.log('Step 2: Getting authorization URL...');
      const authUrl = await client.getAuthUrl();

      console.log();
      console.log('='.repeat(60));
      console.log('AUTHORIZATION REQUIRED');
      console.log('='.repeat(60));
      console.log();
      console.log('Please visit this URL to authorize the application:');
      console.log();
      console.log(authUrl);
      console.log();
      console.log('After authorizing, you will receive a VERIFIER CODE.');
      console.log();
      console.log('Then run this script again with the verifier:');
      console.log(
         'YAHOO_VERIFIER=<code> bun run examples/hockey/01-authentication.ts',
      );
      console.log();
      console.log('='.repeat(60));

      // If verifier is provided via environment variable
      const verifier = process.env.YAHOO_VERIFIER;

      if (verifier) {
         console.log();
         console.log('Step 3: Authenticating with verifier...');

         try {
            await client.authenticate(verifier);
            console.log('✓ Authentication successful!');
            console.log();
         } catch (error) {
            console.error('✗ Authentication failed:', error);
            process.exit(1);
         }
      } else {
         // Exit and wait for user to authorize
         process.exit(0);
      }
   }

   // Check if authenticated
   if (client.isAuthenticated()) {
      console.log('Status: AUTHENTICATED ✓');
      console.log();

      const tokens = client.getTokens();
      if (tokens) {
         console.log('Token Info:');
         console.log(
            '- Access Token:',
            tokens.accessToken.substring(0, 20) + '...',
         );
         console.log('- Has Session Handle:', !!tokens.sessionHandle);
         if (tokens.expiresAt) {
            const expiresIn = Math.floor(
               (tokens.expiresAt - Date.now()) / 1000 / 60,
            );
            console.log('- Expires In:', `${expiresIn} minutes`);
         }
         console.log();
      }

      console.log('You can now make API calls!');
      console.log('(API resource methods will be available in Phase 2)');
      console.log();

      // Example of how to use the HTTP client directly (advanced)
      console.log('Testing API access...');
      try {
         const http = client.getHttpClient();
         // This endpoint returns user info - will be wrapped in client.user.get() in Phase 2
         const response = await http.get('/users;use_login=1');
         console.log('✓ API test successful!');
         console.log(
            'Response:',
            JSON.stringify(response, null, 2).substring(0, 200) + '...',
         );
      } catch (error) {
         console.error('✗ API test failed:', error);
      }
   } else {
      console.log('Status: NOT AUTHENTICATED ✗');
      console.log();
      console.log('Please follow the authorization URL above.');
   }

   console.log();
   console.log('='.repeat(60));
   console.log('Example completed');
   console.log('='.repeat(60));
}

// Run the example
main().catch((error) => {
   console.error('Fatal error:', error);
   process.exit(1);
});
