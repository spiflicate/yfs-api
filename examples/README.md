# Examples

## Token Storage

### [`01-token-storage.ts`](01-token-storage.ts)

Provides two `TokenStorage` implementations:

- `FileTokenStorage`: encrypted file storage using AES-256-GCM
- `KeytarTokenStorage`: OS keychain storage via `keytar`
- `SimpleFileTokenStorage`: plain JSON file storage for development only

### `usage-example.ts.future`

Placeholder for a future end-to-end example. It does not represent the current supported workflow in this repo.

## What `FileTokenStorage` does

`FileTokenStorage` stores OAuth 2.0 tokens in an encrypted file and sets restrictive `0600` permissions.

Current behavior:

- encrypts tokens with AES-256-GCM
- writes the token file with owner-only permissions
- uses a temporary file during writes
- accepts a caller-provided 64-character hex key
- if no key is provided, generates one and writes a sibling `.key` file on first save
- reuses that `.key` file on later runs if it still exists

If a `.key` file is auto-generated, back it up immediately, move the key into a real secret store, then remove the file from disk.

## Recommended usage

Use an explicit encryption key in production.

```typescript
import { YahooFantasySportsClient } from '../../src/index.js';
import { FileTokenStorage } from './01-file-storage.js';

const yfs = new YahooFantasySportsClient(
   {
      clientId: process.env.YAHOO_CLIENT_ID || '',
      clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
      redirectUri: process.env.YAHOO_REDIRECT_URI || 'oob',
   },
   new FileTokenStorage(
      '.tokens.enc',
      process.env.TOKEN_ENCRYPTION_KEY,
      true,
   ),
);
```

Generate a key with:

```bash
openssl rand -hex 32
```

The key must be exactly 64 hex characters.

## Auto-generated key fallback

If you omit `TOKEN_ENCRYPTION_KEY`, `FileTokenStorage` now does this:

1. generates a random 32-byte key in memory
2. writes it to `.tokens.enc.key` on first save
3. logs a warning telling you to store it safely
4. loads that same `.key` file on later runs if present

This is a recovery/bootstrap path, not the preferred setup.

Important:

- if you delete the `.key` file before backing up the key, existing encrypted tokens become unreadable
- if you keep the auto-generated `.key` file on disk, your encryption key is sitting next to the encrypted tokens
- best practice is to copy the key into an environment variable or secret manager, then remove the `.key` file

## Minimal current auth flow

The supported client flow today is manual OAuth code exchange.

```typescript
import { YahooFantasySportsClient } from '../../src/index.js';
import { FileTokenStorage } from './01-file-storage.js';

const storage = new FileTokenStorage(
   '.tokens.enc',
   process.env.TOKEN_ENCRYPTION_KEY,
);

const yfs = new YahooFantasySportsClient(
   {
      clientId: process.env.YAHOO_CLIENT_ID || '',
      clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
      redirectUri: process.env.YAHOO_REDIRECT_URI || 'oob',
   },
   storage,
);

if (!(await yfs.loadTokens())) {
   const authUrl = yfs.getAuthUrl();
   console.log('Open this URL in a browser:');
   console.log(authUrl);

   // Exchange the authorization code returned by Yahoo.
   await yfs.authenticate(process.env.YAHOO_AUTH_CODE || '');
}

const userTeams = await yfs.api().users().games().teams().get();
console.log(userTeams);
```

Token persistence is automatic once storage is attached:

- `yfs.authenticate(code)` saves tokens through `storage.save()`
- `yfs.loadTokens()` restores previously saved tokens
- automatic token refresh also writes updated tokens back through storage
- `yfs.logout()` clears in-memory tokens and calls `storage.clear()`

## Simple development storage

Use `SimpleFileTokenStorage` only when you do not care about encryption.

```typescript
import { YahooFantasySportsClient } from '../../src/index.js';
import { SimpleFileTokenStorage } from './01-file-storage.js';

const yfs = new YahooFantasySportsClient(
   {
      clientId: process.env.YAHOO_CLIENT_ID || '',
      clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
      redirectUri: process.env.YAHOO_REDIRECT_URI || 'oob',
   },
   new SimpleFileTokenStorage('.oauth2-tokens.json', true),
);
```

This writes readable JSON to disk. Do not use it for production credentials.

## OS keychain storage with `keytar`

Use `KeytarTokenStorage` when you want the OS credential store to hold tokens instead of a file.

Install `keytar` in your app first:

```bash
bun add keytar
```

or:

```bash
npm install keytar
```

Then use the storage implementation from the example:

```typescript
import { YahooFantasySportsClient } from '../../src/index.js';
import { KeytarTokenStorage } from './01-token-storage.js';

const storage = new KeytarTokenStorage(
   'com.example.yfs-api',
   'primary-user',
   true,
);

const yfs = new YahooFantasySportsClient(
   {
      clientId: process.env.YAHOO_CLIENT_ID || '',
      clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
      redirectUri: process.env.YAHOO_REDIRECT_URI || 'oob',
   },
   storage,
);
```

`service` is the application-level namespace in the keychain, and `account` identifies the stored Yahoo token set.

## Suggested `.gitignore` entries

```gitignore
.oauth2-tokens.json
.tokens.enc
.tokens.enc.tmp
.tokens.enc.key
```

## Troubleshooting

### `Encryption key must be 64 hex characters (32 bytes)`

Your key is malformed. Regenerate it with:

```bash
openssl rand -hex 32
```

### `Failed to decrypt`

The key you supplied does not match the one used to encrypt the file.

Recovery options:

1. restore the original key from your backup or secret store
2. if you used the fallback flow, restore the sibling `.key` file
3. otherwise delete the token file and authenticate again

### Tokens disappear after restart

If you relied on the fallback generated key, make sure the matching `.key` file still exists or that you copied its value into `TOKEN_ENCRYPTION_KEY` before removing it.

### `Permission denied`

Fix file permissions with:

```bash
chmod 600 .tokens.enc
chmod 600 .tokens.enc.key
```

## Production guidance

Prefer one of these over the fallback `.key` file flow:

- environment variable provided by your deployment platform
- secrets manager
- encrypted database storage
- OS keychain or credential manager

The sidecar `.key` file exists to prevent accidental token loss in the example. It is not the strongest operational setup.
