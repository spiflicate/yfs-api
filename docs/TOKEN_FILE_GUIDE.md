# Token Storage

Applications provide token persistence by implementing `TokenStorage`:

```ts
interface TokenStorage {
  save(tokens: OAuth2Tokens): Promise<void> | void;
  load(): Promise<OAuth2Tokens | null> | OAuth2Tokens | null;
  clear(): Promise<void> | void;
}
```

Pass storage as the second `YahooFantasyClient` constructor argument, then call
`loadTokens()` before authenticated reads. The client calls `save` after token
exchange and refresh, and calls `clear` during `logout()`.

Protect token files with user-only permissions. Keep them outside source
control, avoid logging their contents, and use a secrets service in deployed
applications. The repository ignores its local test token filenames.

See `examples/02-oauth-state-and-storage.ts` for a minimal Node file adapter.
