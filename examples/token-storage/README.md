# Token Storage Examples

This directory contains examples of implementing token storage for the Yahoo Fantasy Sports API client.

## Files

### `file-storage.ts`
Token storage implementations:
- **FileTokenStorage**: Encrypted file storage using AES-256-GCM (recommended for production)
- **SimpleFileTokenStorage**: Unencrypted file storage (development only)

### `usage-example.ts`
Complete example showing how to use token storage with the YahooFantasyClient.

## Quick Start

### 1. Generate an Encryption Key

```bash
# Generate a secure 32-byte (64 hex character) encryption key
openssl rand -hex 32
```

Save this key securely! If you lose it, you won't be able to decrypt your stored tokens.

### 2. Set Environment Variables

```bash
export YAHOO_CONSUMER_KEY=your-client-id
export YAHOO_CONSUMER_SECRET=your-client-secret
export TOKEN_ENCRYPTION_KEY=your-64-character-hex-key
```

### 3. Run the Example

```bash
bun run examples/token-storage/usage-example.ts
```

## Features Demonstrated

### Automatic Token Saving
When you authenticate, tokens are automatically saved to storage:
```typescript
const client = new YahooFantasyClient(config, storage);
await client.authenticateWithLocalServer({ port: 3000 });
// Tokens are automatically saved via storage.save()
```

### Loading Existing Tokens
On subsequent runs, load tokens instead of re-authenticating:
```typescript
const client = new YahooFantasyClient(config, storage);

if (await client.loadTokens()) {
  console.log('Using existing tokens!');
} else {
  console.log('Need to authenticate');
  await client.authenticateWithLocalServer({ port: 3000 });
}
```

### Automatic Token Refresh
When tokens expire, they're automatically refreshed AND re-saved:
```typescript
// First request after token expires
const teams = await client.user.getTeams();
// HttpClient detected expired token
// Automatically refreshed it
// Automatically saved new tokens via storage.save()
// Then completed the request
```

### Logout (Clear Tokens)
```typescript
await client.logout();
// Calls storage.clear() and removes tokens from memory
```

## Storage Implementations

### Encrypted File Storage (Recommended)

```typescript
import { FileTokenStorage } from './examples/token-storage/file-storage.js';

const storage = new FileTokenStorage(
  '.tokens.enc',                    // File path
  process.env.TOKEN_ENCRYPTION_KEY, // 64-char hex key
  true                              // Debug logging
);

const client = new YahooFantasyClient(config, storage);
```

**Features:**
- AES-256-GCM encryption
- Authenticated encryption (detects tampering)
- Atomic writes (prevents corruption)
- Restrictive file permissions (0600)

### Simple File Storage (Development Only)

```typescript
import { SimpleFileTokenStorage } from './examples/token-storage/file-storage.js';

const storage = new SimpleFileTokenStorage('.oauth2-tokens.json', true);
const client = new YahooFantasyClient(config, storage);
```

**Features:**
- Plain JSON storage
- Restrictive file permissions (0600)
- Simple and readable
- **NOT secure** - use only for development

## Custom Storage Implementations

You can implement your own storage backend:

### Database Storage

```typescript
import type { TokenStorage } from 'yahoo-fantasy-sports';
import type { OAuth2Tokens } from 'yahoo-fantasy-sports';

class DatabaseTokenStorage implements TokenStorage {
  constructor(private userId: string) {}

  async save(tokens: OAuth2Tokens): Promise<void> {
    await db.tokens.upsert({
      where: { userId: this.userId },
      update: tokens,
      create: { userId: this.userId, ...tokens }
    });
  }

  async load(): Promise<OAuth2Tokens | null> {
    const record = await db.tokens.findUnique({
      where: { userId: this.userId }
    });
    return record || null;
  }

  async clear(): Promise<void> {
    await db.tokens.delete({
      where: { userId: this.userId }
    });
  }
}
```

### Redis Storage

```typescript
class RedisTokenStorage implements TokenStorage {
  constructor(
    private redis: Redis,
    private key: string
  ) {}

  async save(tokens: OAuth2Tokens): Promise<void> {
    await this.redis.set(
      this.key,
      JSON.stringify(tokens),
      'EX',
      60 * 60 * 24 * 30 // 30 days
    );
  }

  async load(): Promise<OAuth2Tokens | null> {
    const data = await this.redis.get(this.key);
    return data ? JSON.parse(data) : null;
  }

  async clear(): Promise<void> {
    await this.redis.del(this.key);
  }
}
```

### Environment Variables (Serverless)

```typescript
class EnvTokenStorage implements TokenStorage {
  save(tokens: OAuth2Tokens): void {
    // In serverless, you might update environment variables
    // via your platform's API (Vercel, AWS Lambda, etc.)
    console.log('Save these tokens to your environment:');
    console.log('YAHOO_ACCESS_TOKEN=' + tokens.accessToken);
    console.log('YAHOO_REFRESH_TOKEN=' + tokens.refreshToken);
    console.log('YAHOO_EXPIRES_AT=' + tokens.expiresAt);
  }

  load(): OAuth2Tokens | null {
    const accessToken = process.env.YAHOO_ACCESS_TOKEN;
    const refreshToken = process.env.YAHOO_REFRESH_TOKEN;
    const expiresAt = process.env.YAHOO_EXPIRES_AT;

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt),
      tokenType: 'bearer',
      expiresIn: Math.floor((parseInt(expiresAt) - Date.now()) / 1000)
    };
  }

  clear(): void {
    // Update environment variables via your platform's API
    console.log('Clear these environment variables:');
    console.log('- YAHOO_ACCESS_TOKEN');
    console.log('- YAHOO_REFRESH_TOKEN');
    console.log('- YAHOO_EXPIRES_AT');
  }
}
```

## Security Best Practices

### 1. Encryption Key Management
- **Generate**: Use `openssl rand -hex 32` to generate keys
- **Store**: Use environment variables or secrets manager
- **Rotate**: Change keys periodically
- **Never commit**: Add to `.gitignore`

### 2. File Permissions
Both storage implementations set files to `0600` (owner read/write only):
```bash
-rw------- 1 user user 245 Nov 16 10:00 .tokens.enc
```

### 3. Token Files in .gitignore
Add these to your `.gitignore`:
```
.oauth2-tokens.json
.tokens.enc
.tokens.enc.tmp
```

### 4. Production Storage
For production applications:
- ✅ Use encrypted storage (FileTokenStorage with strong key)
- ✅ Use database with encryption at rest
- ✅ Use secrets manager (AWS Secrets Manager, HashiCorp Vault)
- ✅ Use OS keychain (macOS Keychain, Windows Credential Manager)
- ❌ Don't use plain JSON files
- ❌ Don't store in environment variables (they can leak in logs)

## Troubleshooting

### "Encryption key must be 64 hex characters"
Your encryption key is the wrong length. Generate a new one:
```bash
openssl rand -hex 32
```

### "Failed to decrypt"
Your encryption key doesn't match the one used to encrypt the file. You'll need to:
1. Delete the token file
2. Re-authenticate

### "Permission denied"
The token file has incorrect permissions. Fix with:
```bash
chmod 600 .tokens.enc
```

### Tokens not persisting
Make sure you're passing the storage to the constructor:
```typescript
// ✅ Correct
const client = new YahooFantasyClient(config, storage);

// ❌ Wrong - storage not provided
const client = new YahooFantasyClient(config);
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        First Run                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. Create client with storage                                  │
│  2. loadTokens() → null (no tokens yet)                         │
│  3. authenticateWithLocalServer()                                │
│     ├─ User authorizes in browser                               │
│     ├─ Get tokens from Yahoo                                    │
│     └─ storage.save(tokens) ← AUTOMATIC                         │
│  4. Make API calls                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Subsequent Runs                           │
├─────────────────────────────────────────────────────────────────┤
│  1. Create client with storage                                  │
│  2. loadTokens() → tokens loaded!                               │
│  3. Make API calls                                              │
│     └─ If token expired:                                        │
│        ├─ Auto-refresh token                                    │
│        └─ storage.save(newTokens) ← AUTOMATIC                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           Logout                                 │
├─────────────────────────────────────────────────────────────────┤
│  1. client.logout()                                             │
│     ├─ Clear tokens from memory                                 │
│     └─ storage.clear() ← AUTOMATIC                              │
└─────────────────────────────────────────────────────────────────┘
```

## Summary

Token storage is:
- **Optional** but highly recommended
- **Automatic** once configured (save/load handled by client)
- **Flexible** (implement any backend you want)
- **Secure** (use encryption in production)

The library handles all the token lifecycle management - you just provide the storage backend!
