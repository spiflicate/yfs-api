# Token and Configuration File Guide

This document explains where tokens and configuration are stored in the project.

## Quick Reference

| File | Purpose | Used By | Auto-Created | Git-Ignored |
|------|---------|---------|--------------|-------------|
| `.env` | Main environment config | All code | ❌ No | ✅ Yes |
| `.env.test` | Test environment config | Integration tests | ❌ No | ✅ Yes |
| `.env.test.example` | Template for .env.test | Documentation | ✅ Committed | ❌ No |
| `.test-tokens.json` | Integration test tokens | Integration tests | ✅ Yes | ✅ Yes |
| `.oauth2-tokens.json` | Example/script tokens | Examples & scripts | ✅ Yes | ✅ Yes |

## Environment Files (.env)

### File Priority (Bun)

Bun automatically loads `.env` files in this priority order:

1. `.env.local` (highest priority, use for local overrides)
2. `.env.test` (when running tests)
3. `.env.development`, `.env.production` (based on NODE_ENV)
4. `.env` (lowest priority, default values)

### Recommended Setup

**For Local Development:**
```bash
# .env - committed example, safe defaults
YAHOO_CLIENT_ID=your-client-id-here
YAHOO_CLIENT_SECRET=your-client-secret-here
YAHOO_REDIRECT_URI=oob

# .env.test - gitignored, your actual values
YAHOO_CLIENT_ID=dj0yJmk9...
YAHOO_CLIENT_SECRET=8fe14fcb...
# Optional: Pre-configure tokens
YAHOO_ACCESS_TOKEN=...
YAHOO_REFRESH_TOKEN=...
YAHOO_TOKEN_EXPIRES_AT=1234567890000
TEST_LEAGUE_KEY=nhl.l.12345
TEST_TEAM_KEY=nhl.l.12345.t.1
```

**For CI/CD:**
Set environment variables directly in your CI system. They override all `.env` files.

## Token Files (.json)

### Integration Tests: `.test-tokens.json`

**Purpose:** Store OAuth 2.0 tokens for integration test authentication

**Location:** Project root

**Created by:** `getAuthenticatedClient()` in `tests/integration/helpers/authFlow.ts`

**Used by:** Integration tests

**Format:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1234567890000,
  "tokenType": "bearer",
  "expiresIn": 3600
}
```

**When created:** 
- First time you run integration tests
- When you complete the interactive OAuth flow
- Automatically saved for reuse

**To clear:**
```typescript
import { clearStoredTokens } from './tests/integration/helpers/authFlow.js';
clearStoredTokens();
```

### Examples/Scripts: `.oauth2-tokens.json`

**Purpose:** Store OAuth 2.0 tokens for running examples and utility scripts

**Location:** Project root

**Created by:** Examples like `examples/hockey/01-authentication.ts`

**Used by:** 
- Example files in `examples/` directory
- Utility scripts in `scripts/` directory

**Format:** Same as `.test-tokens.json`

**When created:**
- When you run authentication examples
- Manually for script usage

**Note:** Independent from `.test-tokens.json` - different tokens, different purposes

## Token Priority in Integration Tests

When `getAuthenticatedClient()` looks for tokens:

### 1. Environment Variables (Highest Priority)

Checks for:
```bash
YAHOO_ACCESS_TOKEN=...
YAHOO_REFRESH_TOKEN=...
YAHOO_TOKEN_EXPIRES_AT=...
```

**Source:** `.env`, `.env.test`, `.env.local`, or system environment

**Use when:** 
- Running in CI/CD
- Want to override file-stored tokens
- Testing with specific token scenarios

### 2. File Storage: `.test-tokens.json`

Checks for tokens in `.test-tokens.json` file

**Use when:**
- Running tests locally
- Want persistent authentication across test runs
- Normal development workflow

### 3. Interactive OAuth (Fallback)

Prompts user to authenticate if no valid tokens found

**Triggers when:**
- No tokens in environment or file
- Existing tokens are expired and refresh fails
- `forceReauth=true` parameter passed

## Common Scenarios

### Scenario 1: First Time Running Integration Tests

```bash
# 1. Set up credentials in .env.test
YAHOO_CLIENT_ID=your-client-id
YAHOO_CLIENT_SECRET=your-client-secret

# 2. Run tests
bun test tests/integration

# 3. You'll see:
# 🔐 Interactive OAuth authentication required
# (Follow prompts to authenticate)

# 4. Tokens saved to .test-tokens.json
# 5. Future test runs use saved tokens automatically
```

### Scenario 2: CI/CD Pipeline

```yaml
# GitHub Actions example
env:
  YAHOO_CLIENT_ID: ${{ secrets.YAHOO_CLIENT_ID }}
  YAHOO_CLIENT_SECRET: ${{ secrets.YAHOO_CLIENT_SECRET }}
  YAHOO_ACCESS_TOKEN: ${{ secrets.YAHOO_ACCESS_TOKEN }}
  YAHOO_REFRESH_TOKEN: ${{ secrets.YAHOO_REFRESH_TOKEN }}
  YAHOO_TOKEN_EXPIRES_AT: ${{ secrets.YAHOO_TOKEN_EXPIRES_AT }}

- name: Run integration tests
  run: bun test tests/integration
```

Environment variables override file storage, no interactive prompts needed.

### Scenario 3: Force Re-authentication

```typescript
// In your test
const client = await getAuthenticatedClient(true); // Force reauth
```

Ignores cached tokens, prompts for fresh authentication.

### Scenario 4: Using Different Token Files

```typescript
// Use custom token file
const storage = new FileTokenStorage('.my-tokens.json');
const client = await getAuthenticatedClient(false, storage);
```

### Scenario 5: Tokens Expired

```bash
# Automatic refresh attempt:
⚠ Tokens from .test-tokens.json have expired, will attempt to refresh
🔄 Refreshing access token...
✓ Access token refreshed successfully

# If refresh fails:
✗ Token refresh failed, will need to re-authenticate
🔐 Interactive OAuth authentication required
```

## Best Practices

### ✅ Do

- Use `.env.test` for local test configuration
- Let `getAuthenticatedClient()` manage tokens automatically
- Commit `.env.test.example` with safe placeholder values
- Use environment variables in CI/CD
- Keep `.test-tokens.json` and `.oauth2-tokens.json` separate

### ❌ Don't

- Commit `.env`, `.env.test`, or any `.env.local` files
- Commit any `.json` token files
- Hardcode credentials in test files
- Mix up `.test-tokens.json` and `.oauth2-tokens.json`
- Share token files between developers (each should authenticate)

## Troubleshooting

### "Missing required environment variables"

**Solution:** Create `.env.test` or `.env` with your credentials:
```bash
YAHOO_CLIENT_ID=your-client-id
YAHOO_CLIENT_SECRET=your-client-secret
```

### "Tokens from ... have expired"

**Solution:** Don't worry! The system will:
1. Try to refresh automatically
2. Prompt for re-authentication if refresh fails

### "No authorization code provided"

**Solution:** Make sure you:
1. Visit the full authorization URL
2. Complete the OAuth flow
3. Copy the **entire** authorization code
4. Paste it when prompted

### Tests use wrong tokens

**Solution:** Check priority order:
1. Remove environment variables if you want to use file storage
2. Delete `.test-tokens.json` to force re-authentication
3. Use `forceReauth=true` to bypass all caching

### Want to use different tokens for different test suites

**Solution:** Use custom token storage:
```typescript
const storage = new FileTokenStorage('.suite-specific-tokens.json');
const client = await getAuthenticatedClient(false, storage);
```

## See Also

- [AUTH_FLOW_HELPER.md](./AUTH_FLOW_HELPER.md) - Detailed authentication flow documentation
- [INTEGRATION_TEST_SETUP.md](./INTEGRATION_TEST_SETUP.md) - Integration test setup guide
- [tests/integration/helpers/README.md](../tests/integration/helpers/README.md) - Test helper reference
