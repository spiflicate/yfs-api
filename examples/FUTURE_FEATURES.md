# Future Feature Examples

The following example files demonstrate planned features that are not yet implemented in v1.0.0:

## Planned for v1.1.0: Local Server Authentication

- `hockey/03-authentication-local-server.ts.future` - OAuth with automatic local callback server
- `hockey/04-simple-auth.ts.future` - Simplified one-method authentication
- `token-storage/usage-example.ts.future` - Token storage with local server auth

These files have been renamed with `.future` extension to prevent TypeScript errors.

### Planned Feature: `authenticateWithLocalServer()`

This method will:
1. Start a temporary local HTTP server
2. Open the user's browser to Yahoo's authorization page
3. Automatically receive the OAuth callback
4. Exchange the code for tokens
5. Save tokens via TokenStorage (if provided)
6. Shut down the local server

This eliminates the manual copy/paste step currently required.

## Working Examples (v1.0.0)

For current working examples, see:
- `hockey/01-authentication.ts` - Manual OAuth 2.0 flow
- `hockey/02-client-test.ts` - Using existing tokens
- `public-api/01-public-endpoints.ts` - OAuth 1.0 public mode
- `token-storage/file-storage.ts` - Token storage implementation

---

*These features will be tracked in GitHub issues for implementation in v1.1.0*
