# OAuth 2.0 Implementation for Yahoo Fantasy Sports API

## Overview

This document describes the OAuth 2.0 implementation for the Yahoo Fantasy Sports API wrapper. Yahoo Fantasy Sports supports **both OAuth 1.0a and OAuth 2.0**, and newer Yahoo Developer applications (created in 2024+) default to OAuth 2.0.

## Why OAuth 2.0?

**The Problem**: The original implementation used OAuth 1.0a, but new Yahoo Developer applications are configured for OAuth 2.0 by default. This caused authentication failures with error messages like `"not found"` when using OAuth 1.0a endpoints.

**The Solution**: Implemented a complete OAuth 2.0 client that works with Yahoo's Authorization Code Grant flow.

## Key Findings

### OAuth 1.0a vs OAuth 2.0

| Feature | OAuth 1.0a | OAuth 2.0 |
|---------|-----------|-----------|
| **Complexity** | High (requires HMAC-SHA1 signatures) | Low (uses Bearer tokens over HTTPS) |
| **Token Lifetime** | Long-lived (years) | Short-lived (1 hour) |
| **Token Refresh** | Session handle (optional) | Refresh token (standard) |
| **Yahoo Support** | Legacy apps | New apps (2024+) |

### Testing Results

```bash
# OAuth 1.0a (FAILED with new credentials)
curl -X POST "https://api.login.yahoo.com/oauth/v2/get_request_token"
Response: 401 Unauthorized - "not found"

# OAuth 2.0 (SUCCESS with new credentials)
curl "https://api.login.yahoo.com/oauth2/request_auth?client_id=..."
Response: 302 Found (redirects to Yahoo login)
```

**Conclusion**: New Yahoo Developer applications use OAuth 2.0, not OAuth 1.0a.

## Implementation

### Files Created

1. **`src/client/OAuth2Client.ts`** (8.5 KB)
   - Complete OAuth 2.0 Authorization Code Grant flow
   - Token refresh mechanism
   - Token expiration checking
   - Fully typed with TypeScript

2. **`examples/hockey/02-authentication-oauth2.ts`** (9.2 KB)
   - Complete working example
   - Step-by-step authentication flow
   - File-based token storage
   - API access testing

3. **`design/research/oauth-versions-comparison.md`** (7.9 KB)
   - Comprehensive research documentation
   - Protocol comparison
   - Testing notes
   - Migration guide

### OAuth2Client API

```typescript
import { OAuth2Client } from './src/client/OAuth2Client.js';

const client = new OAuth2Client(
  clientId,
  clientSecret,
  redirectUri
);

// Step 1: Get authorization URL
const authUrl = client.getAuthorizationUrl(state);
// => https://api.login.yahoo.com/oauth2/request_auth?client_id=...

// Step 2: User authorizes and gets redirected with code
// https://your-redirect-uri?code=AUTHORIZATION_CODE

// Step 3: Exchange code for tokens
const tokens = await client.exchangeCodeForToken(code);
// => { accessToken, refreshToken, expiresIn, expiresAt, ... }

// Step 4: Refresh when expired
if (client.isTokenExpired(tokens)) {
  const newTokens = await client.refreshAccessToken(tokens.refreshToken);
}
```

### Token Structure

```typescript
interface OAuth2Tokens {
  accessToken: string;      // Bearer token for API requests
  tokenType: string;        // "bearer"
  expiresIn: number;        // Lifetime in seconds (3600 = 1 hour)
  refreshToken: string;     // For getting new access tokens
  expiresAt: number;        // Calculated expiration timestamp
  yahooGuid?: string;       // User GUID (optional)
}
```

## Usage

### Quick Start

1. **Create Yahoo Developer Application**
   - Visit https://developer.yahoo.com/apps/create/
   - Configure redirect URI (e.g., `https://jbru.cloud/yfs-redirect`)
   - Get Client ID (Consumer Key) and Client Secret (Consumer Secret)

2. **Set Environment Variables**
   ```bash
   export YAHOO_CONSUMER_KEY="your-client-id"
   export YAHOO_CONSUMER_SECRET="your-client-secret"
   export YAHOO_REDIRECT_URI="https://jbru.cloud/yfs-redirect"
   ```

3. **Run the Example**
   ```bash
   bun run examples/hockey/02-authentication-oauth2.ts
   ```

4. **Follow the OAuth Flow**
   - Visit the authorization URL
   - Authorize the application
   - Copy the authorization code from redirect
   - Exchange code for tokens

### Example Output

```
======================================================================
Yahoo Fantasy Sports API - OAuth 2.0 Authentication Example
======================================================================

Configuration:
  Client ID: dj0yJmk9SmVPcUg5Wmps...
  Client Secret: 8fe14fcb05...
  Redirect URI: https://jbru.cloud/yfs-redirect

Step 1: Checking for existing tokens...
✗ No existing tokens found.

Step 2: Getting authorization URL...

Please visit this URL to authorize the application:
https://api.login.yahoo.com/oauth2/request_auth?client_id=...&redirect_uri=...

After authorizing, you will be redirected to:
  https://jbru.cloud/yfs-redirect?code=AUTHORIZATION_CODE

Copy the AUTHORIZATION_CODE and run:
  YAHOO_AUTH_CODE=<code> bun run examples/hockey/02-authentication-oauth2.ts
```

### Making API Requests

Once you have tokens, use the Bearer token for API requests:

```typescript
const response = await fetch(
  'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1',
  {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`
    }
  }
);
```

## Features

### ✅ Implemented

- [x] Authorization Code Grant flow
- [x] Token exchange (code → access token + refresh token)
- [x] Token refresh mechanism
- [x] Token expiration checking
- [x] Complete TypeScript types
- [x] Working example with real credentials
- [x] File-based token storage example
- [x] API access testing
- [x] Comprehensive documentation

### ⏳ Pending

- [ ] Integrate OAuth2Client into YahooFantasyClient
- [ ] Unified TokenStorage for both OAuth 1.0a and 2.0
- [ ] Auto-detection of OAuth version
- [ ] Automatic token refresh on expiration
- [ ] HttpClient integration for OAuth 2.0

## Token Management

### Token Lifecycle

1. **Authorization** → Get authorization code (valid for ~10 minutes)
2. **Exchange** → Trade code for access token + refresh token
3. **Access Token** → Valid for 1 hour, use for API requests
4. **Refresh** → Use refresh token to get new access token
5. **Repeat** → Refresh tokens can be used multiple times

### Security Best Practices

```typescript
// ✅ DO: Store refresh tokens securely
await secureStorage.save(tokens.refreshToken);

// ✅ DO: Check expiration before requests
if (oauth2.isTokenExpired(tokens, 60)) { // 60s buffer
  tokens = await oauth2.refreshAccessToken(tokens.refreshToken);
}

// ✅ DO: Handle refresh failures
try {
  tokens = await oauth2.refreshAccessToken(tokens.refreshToken);
} catch (error) {
  // Re-authenticate user
  redirectToAuthUrl();
}

// ❌ DON'T: Store credentials in client-side code
// ❌ DON'T: Commit tokens to version control
// ❌ DON'T: Share refresh tokens between users
```

## Yahoo Developer App Configuration

### Required Settings

1. **Application Type**: Web Application
2. **Redirect URI**: Must match exactly (including protocol, host, port, path)
   - Example: `https://jbru.cloud/yfs-redirect`
   - For local dev: `http://localhost:3000/callback`
3. **API Permissions**: Enable "Fantasy Sports" access
4. **OAuth Version**: OAuth 2.0 (default for new apps)

### Credentials

- **Client ID (Consumer Key)**: Base64-encoded string starting with `dj0y...`
- **Client Secret (Consumer Secret)**: 40-character hexadecimal string

## Troubleshooting

### Common Issues

**401 Unauthorized - "not found"**
- Using OAuth 1.0a with OAuth 2.0 credentials
- Solution: Use OAuth2Client instead of OAuthClient

**Invalid redirect_uri**
- Redirect URI doesn't match Yahoo Developer app configuration
- Solution: Ensure exact match (including trailing slashes, protocol, etc.)

**Invalid client credentials**
- Wrong Client ID or Client Secret
- Solution: Copy credentials exactly from Yahoo Developer Console

**Token expired**
- Access token lifetime is only 1 hour
- Solution: Implement automatic refresh using refresh token

## Next Steps

1. **Full Integration**: Integrate OAuth2Client into YahooFantasyClient
2. **Unified Interface**: Create adapter for both OAuth versions
3. **Auto-Refresh**: Automatic token refresh in HttpClient
4. **Migration Guide**: Help OAuth 1.0a users migrate to OAuth 2.0
5. **Documentation**: Update main README with OAuth 2.0 instructions

## References

- [Yahoo OAuth 2.0 Guide](https://developer.yahoo.com/oauth2/guide/)
- [Yahoo OAuth 2.0 Authorization Code Flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [Research Document](./design/research/oauth-versions-comparison.md)

---

**Status**: ✅ **WORKING** - OAuth 2.0 implementation is complete and tested with real Yahoo credentials.

**Date**: 2024-11-16
