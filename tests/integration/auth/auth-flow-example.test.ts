/**
 * Example: Using the authentication flow helper in integration tests
 *
 * This demonstrates how integration tests can automatically handle OAuth authentication
 * without requiring pre-configured tokens.
 */

import { describe, expect, test } from 'bun:test';
import {
   canAuthenticate,
   getAuthenticatedClient,
} from '../helpers/authFlow.js';
import { shouldSkipIntegrationTests } from '../helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !canAuthenticate())(
   'Example: Authenticated Integration Tests',
   () => {
      test(
         'should get authenticated client and make API call',
         async () => {
            // Get an authenticated client - will use stored tokens or prompt user
            const client = await getAuthenticatedClient();

            // Verify client is authenticated
            expect(client.isAuthenticated()).toBe(true);

            // Example: Make an API call
            // const leagues = await client.user.getLeagues();
            // expect(leagues).toBeDefined();

            console.log('✓ Client authenticated successfully');
         },
         { timeout: 120000 },
      ); // 2 minute timeout for interactive auth

      test('should reuse stored tokens on subsequent runs', async () => {
         // This should use the tokens from the previous test without prompting
         const client = await getAuthenticatedClient();

         expect(client.isAuthenticated()).toBe(true);
         expect(client.isTokenExpired()).toBe(false);

         console.log('✓ Reused stored tokens');
      });
   },
);
