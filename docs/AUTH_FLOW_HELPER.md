# OAuth Authentication Flow Helper for Integration Tests

The `authFlow.ts` helper module provides utilities for handling OAuth authentication during integration testing, eliminating the need to manually configure tokens before running tests.

## Features

- **Automatic Token Management**: Loads existing tokens from environment variables or file storage
- **Interactive Authentication**: Prompts user to complete OAuth flow when needed
- **Token Refresh**: Automatically refreshes expired tokens
- **Persistent Storage**: Saves tokens for reuse across test runs
- **Type-Safe**: Full TypeScript support with proper typing

## Quick Start

### Basic Usage

```typescript
import { getAuthenticatedClient } from '../helpers/authFlow.js';

// In your test
test('should make authenticated API call', async () => {
  // Get an authenticated client - handles everything automatically
  const client = await getAuthenticatedClient();
  
  // Use the client
  const leagues = await client.user.getLeagues();
  expect(leagues).toBeDefined();
});
```

### With Test Suite

```typescript
import { describe, test, expect } from 'bun:test';
import { 
  getAuthenticatedClient, 
  canAuthenticate 
} from '../helpers/authFlow.js';
import { shouldSkipIntegrationTests } from '../helpers/testConfig.js';

describe.skipIf(shouldSkipIntegrationTests() || !canAuthenticate())(
  'My Integration Tests',
  () => {
    test('authenticated test', async () => {
      const client = await getAuthenticatedClient();
      // ... your test code
    }, { timeout: 120000 }); // Allow time for interactive auth
  }
);
```

## How It Works

When you call `getAuthenticatedClient()`, it follows this priority order:

### Token Priority Order

1. **Environment Variables** (Highest Priority)
   - `YAHOO_ACCESS_TOKEN`
   - `YAHOO_REFRESH_TOKEN`
   - `YAHOO_TOKEN_EXPIRES_AT`
   - Loaded from `.env`, `.env.test`, or system environment
   - Bun automatically loads `.env` files in the project root
   - Use this for CI/CD or when you want to override file storage

2. **File Storage** (`.test-tokens.json`)
   - Located in project root
   - Automatically created when completing interactive OAuth flow
   - Used by integration tests for persistent token storage
   - Git-ignored for security

3. **Interactive Authentication** (Fallback)
   - If no valid tokens found in env vars or file
   - Prompts user to complete OAuth flow
   - Saves tokens to file storage for future use

### Authentication Flow

1. **Check Environment Variables**: First tries to load tokens from `YAHOO_ACCESS_TOKEN`, `YAHOO_REFRESH_TOKEN`, and `YAHOO_TOKEN_EXPIRES_AT`

2. **Check File Storage**: If env vars aren't set, tries to load from `.test-tokens.json`

3. **Validate Tokens**: Checks if loaded tokens are still valid and not expired

4. **Refresh if Needed**: If tokens are expired but a refresh token exists, attempts to refresh

5. **Interactive Auth**: If no valid tokens exist, prompts user to:
   - Visit the OAuth authorization URL
   - Authorize the application
   - Paste the authorization code
   - Automatically exchanges code for tokens and saves them

6. **Return Authenticated Client**: Returns a fully authenticated `YahooFantasyClient` instance

## API Reference

### `getAuthenticatedClient()`

Get an authenticated client for integration tests.

```typescript
async function getAuthenticatedClient(
  forceReauth?: boolean,
  tokenStorage?: TokenStorage
): Promise<YahooFantasyClient>
```

**Parameters:**
- `forceReauth` (optional): Force re-authentication even if valid tokens exist
- `tokenStorage` (optional): Custom token storage implementation (defaults to file storage)

**Returns:** Authenticated `YahooFantasyClient` instance

**Example:**
```typescript
// Use default behavior (load from storage or prompt)
const client = await getAuthenticatedClient();

// Force re-authentication
const client = await getAuthenticatedClient(true);

// Use custom storage
const storage = new InMemoryTokenStorage();
const client = await getAuthenticatedClient(false, storage);
```

### `canAuthenticate()`

Check if authentication is available for tests.

```typescript
function canAuthenticate(): boolean
```

**Returns:** `true` if valid tokens are available or interactive auth is possible

**Example:**
```typescript
describe.skipIf(!canAuthenticate())('My Tests', () => {
  // Tests that require authentication
});
```

### `clearStoredTokens()`

Clear all stored authentication tokens.

```typescript
function clearStoredTokens(): void
```

**Example:**
```typescript
import { clearStoredTokens } from '../helpers/authFlow.js';

// In a cleanup or reset test
afterAll(() => {
  clearStoredTokens();
});
```

### `FileTokenStorage`

File-based token storage implementation.

```typescript
class FileTokenStorage implements TokenStorage {
  constructor(tokenPath?: string)
  save(tokens: OAuth2Tokens): void
  load(): OAuth2Tokens | null
  clear(): void
  loadAsync(): Promise<OAuth2Tokens | null>
}
```

**Example:**
```typescript
import { FileTokenStorage } from '../helpers/authFlow.js';

const storage = new FileTokenStorage('.my-tokens.json');
const client = await getAuthenticatedClient(false, storage);
```

## Configuration

The helper uses the same environment variables as other integration tests:

```bash
# Required for OAuth
YAHOO_CLIENT_ID=your-client-id
YAHOO_CLIENT_SECRET=your-client-secret
YAHOO_REDIRECT_URI=oob  # or your custom redirect URI

# Optional: Pre-configured tokens (skips interactive auth)
YAHOO_ACCESS_TOKEN=your-access-token
YAHOO_REFRESH_TOKEN=your-refresh-token
YAHOO_TOKEN_EXPIRES_AT=1234567890000  # Unix timestamp in milliseconds
```

## Token Storage

### File Locations

The project uses different token files for different purposes:

- **`.test-tokens.json`** - Used by integration tests (via `authFlow.ts`)
  - Automatically created by `getAuthenticatedClient()`
  - Git-ignored for security
  - Contains OAuth 2.0 tokens for test authentication

- **`.oauth2-tokens.json`** - Used by examples and scripts
  - Used by example files in `examples/` directory
  - Git-ignored for security
  - Independent from integration test tokens

- **`.env`** - Main environment configuration
  - Loaded automatically by Bun
  - Can contain `YAHOO_ACCESS_TOKEN`, `YAHOO_REFRESH_TOKEN`, etc.
  - Git-ignored for security

- **`.env.test`** - Test-specific environment configuration
  - Can override `.env` values for testing
  - Git-ignored for security
  - Use `.env.test.example` as a template

### Token File Format

Tokens stored in `.test-tokens.json` follow this format:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1234567890000,
  "tokenType": "bearer",
  "expiresIn": 3600
}
```

### Environment Variable Format

When using environment variables in `.env` or `.env.test`:

```bash
YAHOO_ACCESS_TOKEN=your-access-token-here
YAHOO_REFRESH_TOKEN=your-refresh-token-here
YAHOO_TOKEN_EXPIRES_AT=1234567890000  # Unix timestamp in milliseconds
```

### Priority and Override Behavior

- Environment variables **always take priority** over file storage
- This allows overriding file-stored tokens in CI/CD environments
- If both sources have tokens, environment variables win
- To force using file storage, unset the environment variables

## Interactive Authentication Flow

When interactive authentication is needed, you'll see:

```
======================================================================
AUTHENTICATION REQUIRED
======================================================================

Please complete the following steps:

1. Open this URL in your browser:

   https://api.login.yahoo.com/oauth2/request_auth?...

2. Authorize the application
3. Copy the authorization code from the redirect URL or page
4. Paste it below and press Enter

======================================================================

Authorization Code: _
```

After entering the code:
```
Exchanging authorization code for tokens...
✓ Authentication successful!
✓ Tokens saved for future test runs
```

## Best Practices

### 1. Use Appropriate Timeouts

Interactive authentication may take time, so increase test timeouts:

```typescript
test('my test', async () => {
  const client = await getAuthenticatedClient();
  // ...
}, { timeout: 120000 }); // 2 minutes
```

### 2. Skip Tests Appropriately

Use `canAuthenticate()` to skip tests when auth isn't available:

```typescript
describe.skipIf(!canAuthenticate())('Auth Tests', () => {
  // Tests
});
```

### 3. Reuse Clients in Test Suites

For efficiency, create the client once per suite:

```typescript
describe('My Tests', () => {
  let client: YahooFantasyClient;

  beforeAll(async () => {
    client = await getAuthenticatedClient();
  });

  test('test 1', async () => {
    // Use client
  });

  test('test 2', async () => {
    // Use client
  });
});
```

### 4. Environment-Based Execution

For CI/CD, set tokens via environment variables to avoid interactive prompts:

```bash
# In CI/CD environment
export YAHOO_ACCESS_TOKEN="..."
export YAHOO_REFRESH_TOKEN="..."
export YAHOO_TOKEN_EXPIRES_AT="..."

# Run tests
bun test
```

## Troubleshooting

### "No authorization code provided"

Make sure you're entering a valid authorization code when prompted. The code should be visible in:
- The redirect URL (if using custom redirect URI)
- The page content (if using `oob` redirect)

### "Token refresh failed"

This can happen if:
- The refresh token has expired (90 days for Yahoo)
- The tokens were revoked
- Network issues

Solution: Force re-authentication:
```typescript
const client = await getAuthenticatedClient(true);
```

### "Missing required environment variables"

Ensure `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET` are set in your environment or `.env` file.

### Tests hang during authentication

The helper waits for stdin input. If running in non-interactive mode (CI/CD), ensure tokens are pre-configured via environment variables.

## Migration Guide

### Before (Manual Token Management)

```typescript
// Old approach - manual setup required
test('my test', async () => {
  const tokens = getStoredTokens();
  if (!tokens) {
    console.log('Skipping: No tokens available');
    return;
  }

  const client = new YahooFantasyClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
  });

  // ... test code
});
```

### After (Automatic with authFlow)

```typescript
// New approach - automatic handling
test('my test', async () => {
  const client = await getAuthenticatedClient();
  // ... test code
}, { timeout: 120000 });
```

## See Also

- [Integration Test Setup](./INTEGRATION_TEST_SETUP.md) - General integration test setup
- [OAuth2 Implementation](./OAUTH2_IMPLEMENTATION.md) - OAuth 2.0 implementation details
- [Examples](../examples/) - More usage examples
