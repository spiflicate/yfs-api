# OAuth 2.0

Construct `YahooFantasyClient` without `publicMode` and provide a redirect URI
that exactly matches the Yahoo application configuration.

1. Call `createAuthorizationRequest()`.
2. Save its `state` in a server-side session.
3. Redirect the user to its `url`.
4. Validate the callback with `validateAuthorizationState(expected, received)`.
5. Call `authenticate(code)`.
6. Persist tokens through the optional `TokenStorage` constructor argument.

`getAuthUrl(state)` remains available when an application already owns state
generation. Prefer `createAuthorizationRequest()` for a complete request pair.

The client refreshes an expired access token before an API request when a
refresh token is available. A refresh is single-flight per client, and newly
issued tokens are saved through `TokenStorage`. `logout()` clears in-memory and
stored tokens.

OAuth endpoints require network access. Unit, package, and default CI gates do
not call them.
