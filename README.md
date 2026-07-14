# yfs-api

Typed ESM client for the Yahoo Fantasy Sports API.

## Requirements

- Node.js 18 or newer
- ESM (`import`); CommonJS is not published
- Yahoo application credentials

```bash
npm install yfs-api
```

## Public Reads

Public mode uses two-legged OAuth 1.0 signing.

```ts
import { YahooFantasyClient } from 'yfs-api';

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  publicMode: true,
});

const { game } = await client.api().game('nhl').get();
```

## User Authentication

User mode uses OAuth 2.0. Generate and retain a state value, validate it on
the callback, then exchange the authorization code.

```ts
const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: 'https://example.com/oauth/callback',
});

const request = client.createAuthorizationRequest();
// Store request.state in the user's server-side session and redirect to request.url.

client.validateAuthorizationState(request.state, callbackState);
await client.authenticate(authorizationCode);
```

Pass a `TokenStorage` implementation as the second constructor argument and
call `loadTokens()` when starting a session. Access tokens are refreshed when
needed and newly issued tokens are saved through that storage.

## Resource Reads

Responses preserve the selected parent hierarchy. For example, a nested user
request returns `users -> games -> teams`, not a top-level teams array.

```ts
const response = await client.api().users().games(['nhl']).teams().get();

for (const user of response.users) {
  for (const game of user.games ?? []) {
    console.log(game.teams ?? []);
  }
}

const league = await client
  .api()
  .league('1.l.2')
  .include('settings', 'standings')
  .get();
```

Root plural selectors require at least one key. Filters and selectors are
serialized into Yahoo's semicolon-delimited paths and can be inspected with
`toPath()`.

## Roster Writes

Roster updates are the only stable write helper exported at the package root.
The result is a confirmation object when Yahoo returns one, otherwise
`undefined`.

```ts
import { RosterMoveBuilder } from 'yfs-api';

const moves = new RosterMoveBuilder()
  .week(10)
  .movePlayer('1.p.2', 'BN');

const confirmation = await client
  .api()
  .team('1.l.2.t.3')
  .roster()
  .update(moves);
```

Transaction mutation builders and resources are intentionally not public.
Transaction DTOs describe read responses only.

## Raw XML

Use `client.requestRawXml(path, options)` when the normalized DTO is not
suitable. Regular resource reads continue to parse and normalize Yahoo XML.

## Public Surface

The package root exports the client, OAuth 1.0 and OAuth 2.0 clients/types,
OAuth state request type, `Config`, `TokenStorage`, `RequestOptions`, error
classes and guards, common key/scalar types, normalized DTOs,
`RosterMoveBuilder`, `RosterCoverageOptions`, and `parseYahooXML`.

## Development

```bash
bun install --frozen-lockfile
bun run check:package
SKIP_INTEGRATION_TESTS=true bun run test:integration
```

Live integration tests are manual. Destructive tests require the separate
`test:integration:destructive` command and explicit configuration. See
`docs/INTEGRATION_TEST_SETUP.md`.

## Release History

`2.1.0` is the current stable API. Material for the `2.0.0-beta.*` and `1.x`
lines in the changelog and archive is historical, not current guidance.

MIT licensed. See `LICENSE`.
