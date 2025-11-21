# Integration Test Helpers

This directory contains helper utilities for integration testing with the Yahoo Fantasy Sports API.

## Available Helpers

### `authFlow.ts` - OAuth Authentication Flow Helper

**Main exports:**
- `getAuthenticatedClient()` - Get an authenticated client with automatic token management
- `canAuthenticate()` - Check if authentication is available
- `clearStoredTokens()` - Clear stored tokens
- `FileTokenStorage` - File-based token storage implementation

**Use this when:** You need an authenticated client in your tests and want automatic handling of OAuth flows.

**Example:**
```typescript
import { getAuthenticatedClient } from './helpers/authFlow.js';

test('my test', async () => {
  const client = await getAuthenticatedClient();
  // client is ready to use
});
```

See [AUTH_FLOW_HELPER.md](../../../docs/AUTH_FLOW_HELPER.md) for detailed documentation.

---

### `testConfig.ts` - Test Configuration Utilities

**Main exports:**
- `getOAuth2Config()` - Get OAuth 2.0 configuration from environment
- `getOAuth1Config()` - Get OAuth 1.0 (public mode) configuration from environment
- `getStoredTokens()` - Get stored tokens from environment variables
- `getTestLeagueKey()` - Get test league key from environment
- `getTestTeamKey()` - Get test team key from environment
- `shouldSkipIntegrationTests()` - Check if integration tests should be skipped
- `hasValidCredentials()` - Check if valid API credentials are configured
- `hasStoredTokens()` - Check if valid tokens are available in environment

**Use this when:** You need low-level access to configuration or want to manually manage authentication.

**Example:**
```typescript
import { getOAuth2Config, hasValidCredentials } from './helpers/testConfig.js';

describe.skipIf(!hasValidCredentials())('My Tests', () => {
  test('manual auth', () => {
    const config = getOAuth2Config();
    const client = new YahooFantasyClient(config);
    // ...
  });
});
```

---

### `testStorage.ts` - Token Storage Implementations

**Main exports:**
- `InMemoryTokenStorage` - In-memory token storage for testing
- `createMockTokenStorage()` - Create a mock token storage with predefined tokens

**Use this when:** You need to test token storage behavior or want ephemeral token storage.

**Example:**
```typescript
import { InMemoryTokenStorage } from './helpers/testStorage.js';

test('token storage test', () => {
  const storage = new InMemoryTokenStorage();
  const client = new YahooFantasyClient(config, storage);
  // ...
});
```

## Recommended Approach

For most integration tests, use `authFlow.ts`:

```typescript
import { describe, test, expect } from 'bun:test';
import { getAuthenticatedClient, canAuthenticate } from './helpers/authFlow.js';
import { shouldSkipIntegrationTests } from './helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !canAuthenticate())(
  'My Integration Tests',
  () => {
    test('should work with authenticated client', async () => {
      const client = await getAuthenticatedClient();
      // Use client here
    }, { timeout: 120000 });
  }
);
```

This approach:
- ✅ Automatically handles token loading and storage
- ✅ Prompts for authentication only when needed
- ✅ Reuses tokens across test runs
- ✅ Handles token refresh automatically
- ✅ Works in both interactive and CI environments

## Environment Variables

All helpers use these environment variables:

```bash
# Required
YAHOO_CLIENT_ID=your-client-id
YAHOO_CLIENT_SECRET=your-client-secret

# Optional
YAHOO_REDIRECT_URI=oob                    # Default: 'oob'
YAHOO_ACCESS_TOKEN=...                    # Pre-configured access token
YAHOO_REFRESH_TOKEN=...                   # Pre-configured refresh token
YAHOO_TOKEN_EXPIRES_AT=1234567890000      # Token expiration timestamp
TEST_LEAGUE_KEY=nhl.l.12345               # Test league key
TEST_TEAM_KEY=nhl.l.12345.t.1             # Test team key
SKIP_INTEGRATION_TESTS=true               # Skip all integration tests
DEBUG=true                                # Enable debug logging
```

## File Storage

### Token File Locations

The project uses different token files for different purposes:

**Integration Tests:**
- **`.test-tokens.json`** - Used by `authFlow.ts` for integration test authentication
  - Automatically created by `getAuthenticatedClient()`
  - Located in project root
  - Git-ignored

**Examples and Scripts:**
- **`.oauth2-tokens.json`** - Used by example files and utility scripts
  - Located in project root
  - Independent from test tokens
  - Git-ignored

### Token Priority Order

When `getAuthenticatedClient()` looks for tokens, it checks in this order:

1. **Environment Variables** (highest priority)
   - `YAHOO_ACCESS_TOKEN`
   - `YAHOO_REFRESH_TOKEN`
   - `YAHOO_TOKEN_EXPIRES_AT`
   - Loaded from `.env`, `.env.test`, or system environment

2. **File Storage** (`.test-tokens.json`)
   - Automatically saved when completing OAuth flow
   - Used on subsequent test runs

3. **Interactive Auth** (fallback)
   - Prompts user if no valid tokens found

### Managing Token Files

**To clear integration test tokens:**
```typescript
import { clearStoredTokens } from './helpers/authFlow.js';
clearStoredTokens();
```

**To use different token files:**
```typescript
const storage = new FileTokenStorage('.my-custom-tokens.json');
const client = await getAuthenticatedClient(false, storage);
```

## See Also

- [AUTH_FLOW_HELPER.md](../../../docs/AUTH_FLOW_HELPER.md) - Detailed authentication flow documentation
- [TOKEN_FILE_GUIDE.md](../../../docs/TOKEN_FILE_GUIDE.md) - Complete guide to token files and priority
- [INTEGRATION_TEST_SETUP.md](../../../docs/INTEGRATION_TEST_SETUP.md) - General integration test setup
- [OAUTH2_IMPLEMENTATION.md](../../../docs/OAUTH2_IMPLEMENTATION.md) - OAuth 2.0 implementation details
