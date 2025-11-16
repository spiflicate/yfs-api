/**
 * Example: OAuth 2.0 Authentication Flow
 *
 * This example demonstrates how to authenticate with Yahoo Fantasy Sports API using OAuth 2.0.
 * OAuth 2.0 is simpler than OAuth 1.0a and is used by newer Yahoo Developer applications.
 *
 * Prerequisites:
 * 1. Create a Yahoo Developer Application at https://developer.yahoo.com/apps/
 * 2. Configure it for OAuth 2.0 (this is the default for new apps)
 * 3. Set a Redirect URI (e.g., https://example.com/callback)
 * 4. Get your Consumer Key (Client ID) and Consumer Secret (Client Secret)
 * 5. Set them as environment variables or in a .env file:
 *    - YAHOO_CONSUMER_KEY=your-client-id
 *    - YAHOO_CONSUMER_SECRET=your-client-secret
 *    - YAHOO_REDIRECT_URI=your-redirect-uri
 *
 * To run this example:
 * ```bash
 * bun run examples/hockey/02-authentication-oauth2.ts
 * ```
 *
 * OAuth 2.0 Flow:
 * 1. Get authorization URL and visit it in browser
 * 2. User authorizes the application
 * 3. User is redirected to redirect_uri with authorization code
 * 4. Exchange code for access token and refresh token
 * 5. Use refresh token to get new access tokens when they expire
 */

import {
   OAuth2Client,
   type OAuth2Tokens,
} from '../../src/client/OAuth2Client.js';

// Configuration from environment variables
const config = {
   clientId: process.env.YAHOO_CONSUMER_KEY || '',
   clientSecret: process.env.YAHOO_CONSUMER_SECRET || '',
   redirectUri:
      process.env.YAHOO_REDIRECT_URI || 'oob',
};

// Simple file-based token storage (example only - use secure storage in production)
const TOKEN_FILE = '.oauth2-tokens.json';

async function saveTokens(tokens: OAuth2Tokens): Promise<void> {
   console.log('[TokenStorage] Saving OAuth 2.0 tokens...');
   try {
      await Bun.write(TOKEN_FILE, JSON.stringify(tokens, null, 2));
      console.log('✓ Tokens saved successfully');
   } catch (error) {
      console.error('✗ Failed to save tokens:', error);
   }
}

async function loadTokens(): Promise<OAuth2Tokens | null> {
   console.log('[TokenStorage] Loading OAuth 2.0 tokens...');
   try {
      const file = Bun.file(TOKEN_FILE);
      const exists = await file.exists();
      if (!exists) {
         return null;
      }
      const content = await file.text();
      const tokens = JSON.parse(content) as OAuth2Tokens;
      console.log('✓ Tokens loaded successfully');
      return tokens;
   } catch (error) {
      console.log('✗ No existing tokens found');
      return null;
   }
}

async function clearTokens(): Promise<void> {
   console.log('[TokenStorage] Clearing tokens...');
   try {
      await Bun.write(TOKEN_FILE, '');
      console.log('✓ Tokens cleared');
   } catch {
      // Ignore errors
   }
}

async function main() {
   console.log('='.repeat(70));
   console.log(
      'Yahoo Fantasy Sports API - OAuth 2.0 Authentication Example',
   );
   console.log('='.repeat(70));
   console.log();

   // Validate configuration
   if (!config.clientId || !config.clientSecret) {
      console.error('✗ Error: Missing OAuth credentials');
      console.error();
      console.error('Please set the following environment variables:');
      console.error('  - YAHOO_CONSUMER_KEY=your-client-id');
      console.error('  - YAHOO_CONSUMER_SECRET=your-client-secret');
      console.error('  - YAHOO_REDIRECT_URI=your-redirect-uri (optional)');
      console.error();
      console.error('You can also create a .env file with these values.');
      process.exit(1);
   }

   console.log('Configuration:');
   console.log(`  Client ID: ${config.clientId.substring(0, 20)}...`);
   console.log(
      `  Client Secret: ${config.clientSecret.substring(0, 10)}...`,
   );
   console.log(`  Redirect URI: ${config.redirectUri}`);
   console.log();

   // Create OAuth 2.0 client
   const oauth2 = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri,
   );

   // Step 1: Check for existing tokens
   console.log('Step 1: Checking for existing tokens...');
   let tokens = await loadTokens();

   if (tokens) {
      console.log('✓ Found existing tokens!');
      console.log();

      // Check if token is expired
      if (oauth2.isTokenExpired(tokens)) {
         console.log('⚠ Access token is expired, refreshing...');
         try {
            tokens = await oauth2.refreshAccessToken(tokens.refreshToken);
            await saveTokens(tokens);
            console.log('✓ Token refreshed successfully!');
            console.log();
         } catch (error) {
            console.error('✗ Token refresh failed:', error);
            console.log('  Need to re-authenticate...');
            tokens = null;
         }
      } else {
         const expiresIn = oauth2.getTimeUntilExpiration(tokens);
         console.log(
            `✓ Access token is still valid (expires in ${Math.floor(expiresIn / 60)} minutes)`,
         );
         console.log();
      }
   } else {
      console.log('✗ No existing tokens found.');
      console.log();
   }

   // Step 2: If no valid tokens, start OAuth flow
   if (!tokens) {
      const authCode = process.env.YAHOO_AUTH_CODE;

      if (!authCode) {
         // Generate authorization URL
         console.log('Step 2: Getting authorization URL...');
         const state = Math.random().toString(36).substring(7);
         const authUrl = oauth2.getAuthorizationUrl(state);

         console.log();
         console.log('='.repeat(70));
         console.log('AUTHORIZATION REQUIRED');
         console.log('='.repeat(70));
         console.log();
         console.log('Please visit this URL to authorize the application:');
         console.log();
         console.log(authUrl);
         console.log();
         console.log('After authorizing, you will be redirected to:');
         console.log(
            `  ${config.redirectUri}?code=AUTHORIZATION_CODE&state=${state}`,
         );
         console.log();
         console.log(
            'Copy the AUTHORIZATION_CODE from the redirect URL and run:',
         );
         console.log();
         console.log(
            '  YAHOO_AUTH_CODE=<code> bun run examples/hockey/02-authentication-oauth2.ts',
         );
         console.log();
         console.log('='.repeat(70));
         process.exit(0);
      }

      // Exchange authorization code for tokens
      console.log('Step 3: Exchanging authorization code for tokens...');
      try {
         tokens = await oauth2.exchangeCodeForToken(authCode);
         console.log('✓ Authentication successful!');
         console.log();

         // Save tokens
         await saveTokens(tokens);
      } catch (error) {
         console.error('✗ Authentication failed:', error);
         process.exit(1);
      }
   }

   // Display token information
   if (tokens) {
      console.log('='.repeat(70));
      console.log('AUTHENTICATION SUCCESSFUL');
      console.log('='.repeat(70));
      console.log();
      console.log('Token Information:');
      console.log(
         `  Access Token: ${tokens.accessToken.substring(0, 20)}...`,
      );
      console.log(`  Token Type: ${tokens.tokenType}`);
      console.log(
         `  Expires In: ${Math.floor(tokens.expiresIn / 60)} minutes`,
      );
      console.log(
         `  Refresh Token: ${tokens.refreshToken.substring(0, 20)}...`,
      );
      if (tokens.yahooGuid) {
         console.log(`  Yahoo GUID: ${tokens.yahooGuid}`);
      }
      console.log();

      const expiresIn = oauth2.getTimeUntilExpiration(tokens);
      console.log(
         `Token expires in: ${Math.floor(expiresIn / 60)} minutes ${expiresIn % 60} seconds`,
      );
      console.log();

      console.log('You can now use these tokens to make API calls!');
      console.log();
      console.log('Example API request:');
      console.log('```');
      console.log('const response = await fetch(');
      console.log(
         '  "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1",',
      );
      console.log('  {');
      console.log('    headers: {');
      console.log(
         '      Authorization: "Bearer ${tokens.accessToken.substring(0, 30)}..."',
      );
      console.log('    }');
      console.log('  }');
      console.log(');');
      console.log('```');
      console.log();

      // Test API access
      console.log('Testing API access...');
      try {
         const response = await fetch(
            'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json',
            {
               headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
               },
            },
         );

         if (response.ok) {
            console.log('✓ API test successful!');
            const body = await response.text();
            Bun.write('api_test_response.json', body);
            console.log();
            console.log('Response preview:');
            console.log(body.substring(0, 300) + '...');
         } else {
            console.log(
               `✗ API test failed with status: ${response.status}`,
            );
            const error = await response.text();
            console.log('Error:', error.substring(0, 200));
         }
      } catch (error) {
         console.error('✗ API test failed:', error);
      }
   }

   console.log();
   console.log('='.repeat(70));
   console.log('Example completed');
   console.log('='.repeat(70));
}

// Run the example
main().catch((error) => {
   console.error('Fatal error:', error);
   process.exit(1);
});
