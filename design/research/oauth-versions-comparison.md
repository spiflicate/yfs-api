# Yahoo Fantasy Sports API - OAuth Version Comparison

**Date**: 2024-11-16  
**Status**: Active Research  
**Author**: Investigation into OAuth 1.0a vs OAuth 2.0 support

## Executive Summary

Yahoo Fantasy Sports API supports **BOTH OAuth 1.0a and OAuth 2.0**, but newer Yahoo Developer applications default to OAuth 2.0. This document outlines the findings from testing both protocols and recommends implementation strategy.

## Key Findings

### 1. OAuth Protocol Support

**OAuth 1.0a Endpoints:**
- Request Token: `https://api.login.yahoo.com/oauth/v2/get_request_token`
- Authorize: `https://api.login.yahoo.com/oauth/v2/request_auth`
- Access Token: `https://api.login.yahoo.com/oauth/v2/get_token`

**OAuth 2.0 Endpoints:**
- Authorize: `https://api.login.yahoo.com/oauth2/request_auth`
- Token: `https://api.login.yahoo.com/oauth2/get_token`

### 2. Yahoo Developer Application Configuration

**Discovery**: New Yahoo Developer applications created in 2024+ are configured for OAuth 2.0 by default.

**Evidence**:
- OAuth 1.0a endpoints return `401 Unauthorized` with `"not found"` error for new credentials
- OAuth 2.0 endpoints return `302 redirect` (success) for the same credentials
- The authorization URL `https://api.login.yahoo.com/oauth2/request_auth?client_id=...` accepts the credentials and initiates auth flow

### 3. Testing Results

#### OAuth 1.0a Test (FAILED)
```bash
curl -X POST "https://api.login.yahoo.com/oauth/v2/get_request_token" \
  -H "Authorization: OAuth ..." \
  -H "Content-Type: application/x-www-form-urlencoded"

Response: 401 Unauthorized
Body: {"error":{"localizedMessage":"not found","errorId":"NOT_FOUND","message":"not found"}}
```

#### OAuth 2.0 Test (SUCCESS)
```bash
curl -I "https://api.login.yahoo.com/oauth2/request_auth?client_id=...&redirect_uri=https://jbru.cloud/yfs-redirect&response_type=code"

Response: 302 Found
Set-Cookie: A3=...
Location: <redirect to Yahoo login>
```

### 4. Protocol Comparison

| Feature | OAuth 1.0a | OAuth 2.0 |
|---------|-----------|-----------|
| **Complexity** | High (signatures, nonces, base strings) | Low (Bearer tokens, SSL) |
| **Security** | HMAC-SHA1 signatures | HTTPS/TLS required |
| **Token Types** | Access Token + Secret | Access Token + Refresh Token |
| **Token Lifetime** | Long-lived (can be years) | Short-lived (1 hour) |
| **Token Refresh** | Session handle (optional) | Refresh token (standard) |
| **Client Types** | Web applications only | Web, mobile, native apps |
| **Callback** | `oob` or URL | Must be registered URL |

## OAuth 2.0 Flow for Yahoo Fantasy Sports

### Authorization Code Grant Flow

This is the recommended flow for server-side applications.

#### Step 1: Get Authorization URL

```typescript
const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `response_type=code&` +
  `language=en-us`;
```

**Parameters:**
- `client_id`: Consumer Key from Yahoo Developer
- `redirect_uri`: Must match what's configured in Yahoo Developer app
- `response_type`: Always `"code"` for authorization code flow
- `language`: Optional, default `"en-us"`

#### Step 2: User Authorization

User visits the authorization URL and grants permission. Yahoo redirects to:

```
https://your-redirect-uri?code=AUTHORIZATION_CODE&state=STATE_VALUE
```

#### Step 3: Exchange Code for Tokens

```bash
POST https://api.login.yahoo.com/oauth2/get_token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=https://your-redirect-uri
```

**Response:**
```json
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN",
  "xoauth_yahoo_guid": "USER_GUID"
}
```

#### Step 4: Refresh Access Token (when expired)

```bash
POST https://api.login.yahoo.com/oauth2/get_token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token=REFRESH_TOKEN&
redirect_uri=https://your-redirect-uri
```

## Implementation Recommendations

### 1. Dual Protocol Support

**Recommendation**: Support both OAuth 1.0a and OAuth 2.0 protocols.

**Rationale**:
- Legacy applications may still use OAuth 1.0a
- New applications use OAuth 2.0
- Provide migration path for existing users
- Maximum compatibility

### 2. Default to OAuth 2.0

**Recommendation**: Make OAuth 2.0 the default for new implementations.

**Rationale**:
- Yahoo's direction for new applications
- Simpler implementation
- Better developer experience
- Automatic token refresh

### 3. Configuration Strategy

```typescript
interface OAuthConfig {
  consumerKey: string;
  consumerSecret: string;
  redirectUri?: string;
  oauthVersion?: '1.0a' | '2.0'; // Auto-detect if not specified
}
```

## Migration Path

### For Existing OAuth 1.0a Users

1. Keep existing `OAuthClient` implementation
2. Add new `OAuth2Client` implementation
3. Allow configuration to choose version
4. Provide migration guide in documentation

### For New Users

1. Default to OAuth 2.0
2. Provide clear setup instructions
3. Handle token refresh automatically
4. Store refresh tokens securely

## Token Storage Considerations

### OAuth 1.0a Tokens

```typescript
interface OAuth1Tokens {
  accessToken: string;
  accessTokenSecret: string;
  sessionHandle?: string;
  expiresAt?: number;
}
```

### OAuth 2.0 Tokens

```typescript
interface OAuth2Tokens {
  accessToken: string;
  tokenType: string; // "bearer"
  expiresIn: number; // seconds
  refreshToken: string;
  expiresAt: number; // calculated timestamp
  yahooGuid?: string;
}
```

### Unified Token Storage

```typescript
interface TokenStorage {
  oauthVersion: '1.0a' | '2.0';
  tokens: OAuth1Tokens | OAuth2Tokens;
}
```

## Security Considerations

### OAuth 1.0a
- ✓ Works over HTTP (signature-based)
- ✗ Complex signature generation prone to errors
- ✗ Requires timestamp synchronization
- ✓ Token secret never transmitted

### OAuth 2.0
- ✓ Simpler implementation
- ✓ Industry-standard protocol
- ✗ Requires HTTPS/TLS (not a real concern in 2024)
- ✓ Refresh token rotation support
- ✓ Token expiration built-in

## Callback URL Requirements

### OAuth 1.0a
- Can use `oob` (out-of-band) for manual code entry
- Can use custom URLs
- No strict validation

### OAuth 2.0
- **Must** use exact URL registered in Yahoo Developer app
- Cannot use `oob` (though Yahoo docs mention it, it doesn't work reliably)
- Strict URL matching (including protocol, host, port, path)
- Must be accessible URL (can be localhost for development)

## Testing Notes

### Successful OAuth 2.0 Test Configuration

**Yahoo Developer App Settings:**
- Application Type: Web Application
- Redirect URI: `https://jbru.cloud/yfs-redirect`
- API Permissions: (Fantasy Sports should be enabled)

**Credentials Format:**
- Consumer Key (client_id): Base64-encoded structure, starts with `dj0y...`
- Consumer Secret (client_secret): 40-character hexadecimal string

**Test Results:**
- ✓ Authorization URL generation successful
- ✓ Yahoo accepts client_id and shows login page
- ✓ Token endpoint responds correctly to requests
- ✗ OAuth 1.0a endpoints reject the same credentials

## Next Steps

1. ✅ Document findings (this document)
2. ⏳ Implement `OAuth2Client` class
3. ⏳ Update `YahooFantasyClient` to support both protocols
4. ⏳ Create OAuth 2.0 authentication example
5. ⏳ Add auto-detection of OAuth version based on credentials
6. ⏳ Update documentation and migration guide
7. ⏳ Test with real Yahoo Fantasy Sports API calls

## References

- [Yahoo OAuth 2.0 Guide](https://developer.yahoo.com/oauth2/guide/)
- [Yahoo OAuth 2.0 Authorization Code Flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [Yahoo Fantasy Sports API](https://developer.yahoo.com/fantasysports/guide/)

---

*Last Updated: 2024-11-16*
