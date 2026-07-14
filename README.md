# yfs-api

TypeScript client for the Yahoo Fantasy Sports API.

This README documents the planned `2.1+` API line.

## Version Support

Only `2.1.x` and newer are supported.

- `2.0.0-beta.*` and all `1.x` releases are deprecated.
- Previous API surfaces are not documented as current usage in this repository.
- New integrations should target `2.1+` only.

## Installation

```bash
npm install yfs-api
```

## Requirements

- Node.js `>=18`
- Yahoo Fantasy Sports application credentials
- Bun `>=1.0.0` for local development in this repo

## Core API

The supported API surface is centered on `YahooFantasyClient` and the resource API returned by `client.api()`.

Main entry points:

- `client.api()`
- `client.getAuthUrl()`
- `client.authenticate(code)`
- `client.loadTokens()`
- `client.refreshToken()`
- `client.logout()`

Common builder roots:

- `game(key)`
- `games()`
- `league(key)`
- `team(key)`
- `player(key)`
- `users()`

Common builder operations:

- `get()`
- `toPath()`
- `put()`
- `delete()`
- `include()`
- `count()`
- `start()`

## Authentication Modes

### Public mode

Public mode uses OAuth 1.0 2-legged signing. Use it for public resources such as game metadata and game-level player search.

```ts
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  publicMode: true,
});

const game = await client.api().game("nhl").get();

const players = await client
  .api()
  .game("nhl")
  .players()
  .search("mcdavid")
  .count(10)
  .get();
```

Public mode does not cover user-specific resources such as `/users;use_login=1/...`, roster management, or transaction writes.

### User mode

User mode uses OAuth 2.0. Use it for team, league, roster, and transaction workflows tied to a Yahoo account.

```ts
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: "oob",
});

const authUrl = client.getAuthUrl();
console.log(authUrl);

await client.authenticate(authorizationCode);

const teams = await client
  .api()
  .users()
  .games()
  .teams(["423.l.12345.t.1"])
  .include("standings")
  .get();
```

## Resource API

The resource API mirrors Yahoo path composition directly.

```ts
const path = client
  .api()
  .league("423.l.12345")
  .players()
  .position("C")
  .status("FA")
  .count(25)
  .toPath();

console.log(path);
// league/423.l.12345/players;position=C;status=FA;count=25
```

Common collection and sub-resource methods include:

- `players()`
- `teams()`
- `leagues()`
- `transactions()`
- `games()`
- `settings()`
- `standings()`
- `scoreboard()`
- `roster()`
- `matchups()`
- `stats()`
- `ownership()`

Common selectors and filters include:

- keyed collection methods such as `games([keys])`, `teams([keys])`, `players([keys])`
- `search()`
- `position()`
- `status()`
- `sort()`
- `week()`
- `date()`

## Writes

Writes stay on the same resource API surface.

Roster updates use `RosterMoveBuilder` with `team(...).roster().put(...)`.

```ts
import { RosterMoveBuilder } from "yfs-api";

await client
  .api()
  .team("423.l.12345.t.1")
  .roster()
  .week(10)
  .put(
    new RosterMoveBuilder()
      .week(10)
      .movePlayer("423.p.8332", "WR")
      .movePlayer("423.p.1423", "BN"),
  );
```

Current write support is narrower than the older draft README implied:

- roster writes support `put(...)`
- transaction resources expose `delete()` and collections expose `post()`, but both currently throw `not yet implemented`

## Token Storage

Pass a `TokenStorage` implementation as the second constructor argument to persist OAuth 2.0 tokens.

```ts
import { YahooFantasyClient } from "yfs-api";
import * as fs from "node:fs/promises";

const storage = {
  async save(tokens) {
    await fs.writeFile(".tokens.json", JSON.stringify(tokens, null, 2));
  },
  async load() {
    try {
      return JSON.parse(await fs.readFile(".tokens.json", "utf8"));
    } catch {
      return null;
    }
  },
  async clear() {
    await fs.rm(".tokens.json", { force: true });
  },
};

const client = new YahooFantasyClient(
  {
    clientId: process.env.YAHOO_CLIENT_ID!,
    clientSecret: process.env.YAHOO_CLIENT_SECRET!,
    redirectUri: "oob",
  },
  storage,
);

await client.loadTokens();
```

## Package Exports

Top-level exports include:

- `YahooFantasyClient`
- `OAuth2Client`
- `parseYahooXML`
- error classes and error guards from the client layer
- `RosterMoveBuilder`

## Examples

- `examples/public-api/01-public-endpoints.ts`
- `examples/hockey/01-authentication.ts`
- `examples/request-builder/01-basic-usage.ts`
- `examples/request-builder/02-transactions.ts`
- `examples/request-builder/03-roster-editing.ts`
- `examples/token-storage/01-file-storage.ts`

## Documentation

- `docs/INTEGRATION_TEST_SETUP.md`
- `docs/OAUTH2_IMPLEMENTATION.md`
- `docs/AUTH_FLOW_HELPER.md`
- `docs/yahoo-fantasy-api-guide/OVERVIEW.md`

## Development

```bash
bun install
npm run type-check
npm test
npm run test:integration
npm run lint
npm run build
```

## Notes

- Yahoo responses are not fully uniform across endpoints; some defensive response handling is still necessary.
- Public mode coverage is narrower than authenticated user mode.
- Some write-oriented surfaces shown in older design docs are not implemented in the current exported API.

## License

MIT. See `LICENSE`.