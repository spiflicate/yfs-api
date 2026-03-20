# yfs-api

A fully typed TypeScript wrapper for the Yahoo Fantasy Sports API, rebuilt around a composable request builder.

[![npm version](https://img.shields.io/npm/v/yfs-api.svg)](https://www.npmjs.com/package/yfs-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What Changed In The Refactor

This project has been fully refactored around a single core concept: build Yahoo Fantasy API paths compositionally, with strong TypeScript guidance.

### Refactor Highlights

- Unified request surface via `client.request()`
- Type-aware chainable builder for resources, collections, and sub-resources
- Cleaner OAuth split:
  - OAuth 1.0 (2-legged) for public mode
  - OAuth 2.0 for user-authenticated mode
- First-class path composition support (`buildPath()`)
- Improved response typing routed by query shape
- Better internal separation of concerns (client, request graph, response routes, parsers)

### Design Goals

- Keep Yahoo URL semantics visible instead of hiding them behind opaque helpers
- Make composition predictable and debuggable
- Provide useful typing without fighting real-world Yahoo response variability

## Installation

```bash
npm install yfs-api
# or
yarn add yfs-api
# or
pnpm add yfs-api
# or
bun add yfs-api
```

## Quick Start

### 1) Public Mode (OAuth 1.0, no user auth)

Use this for public data like game metadata and game-level player search.

```ts
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  publicMode: true,
});

const game = await client.request().game("nhl").execute();

const players = await client
  .request()
  .game("nhl")
  .players()
  .search("mcdavid")
  .count(10)
  .execute();

console.log(game.game.name);
console.log(players.players?.length ?? 0);
```

### 2) User Mode (OAuth 2.0)

Use this for user-specific data like your teams, rosters, standings, and league data.

```ts
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: "oob", // or your callback URL
});

const authUrl = client.getAuthUrl();
console.log("Authorize here:", authUrl);

await client.authenticate(authorizationCode);

const myTeams = await client
  .request()
  .users()
  .useLogin()
  .games()
  .teams()
  .execute();

console.log(myTeams.users.length);
```

### 3) Token Persistence

```ts
import { YahooFantasyClient } from "yfs-api";
import * as fs from "node:fs/promises";

const tokenStorage = {
  save: async (tokens) => {
    await fs.writeFile(".tokens.json", JSON.stringify(tokens, null, 2));
  },
  load: async () => {
    try {
      const data = await fs.readFile(".tokens.json", "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  clear: async () => {
    await fs.rm(".tokens.json", { force: true });
  },
};

const client = new YahooFantasyClient(
  {
    clientId: process.env.YAHOO_CLIENT_ID!,
    clientSecret: process.env.YAHOO_CLIENT_SECRET!,
    redirectUri: "oob",
  },
  tokenStorage,
);

await client.loadTokens();
if (!client.isAuthenticated()) {
  const authUrl = client.getAuthUrl();
  console.log("Visit:", authUrl);
  await client.authenticate(code);
}
```

## Composable Query Builder

The request builder models Yahoo path composition directly:

```ts
const result = await client
  .request()
  .users()
  .useLogin()
  .games()
  .gameKeys("nfl")
  .leagues()
  .execute();
```

Generated path:

```text
/users;use_login=1/games;game_keys=nfl/leagues
```

### Core Entry Points

- `game(key)`
- `league(key)`
- `team(key)`
- `player(key)`
- `users()`
- `games()`

### Common Chain Methods

- Collections: `leagues()`, `teams()`, `players()`, `transactions()`, `drafts()`, `games()`
- Sub-resources: `settings()`, `standings()`, `scoreboard()`, `roster()`, `matchups()`, `stats()`, `ownership()`, `percentOwned()`, `draftAnalysis()`, `statCategories()`, `positionTypes()`, `gameWeeks()`
- Filters and selectors: `filters()`, `out()`, `position()`, `status()`, `sort()`, `count()`, `start()`, `search()`, `week()`, `date()`, `gameKeys()`, `leagueKeys()`, `teamKeys()`, `playerKeys()`
- Execution: `execute()`, `post()`, `put()`, `delete()`, `buildPath()`

### Path-Only Debugging

```ts
const path = client
  .request()
  .league("423.l.12345")
  .players()
  .position("C")
  .status("FA")
  .count(25)
  .buildPath();

console.log(path);
// /league/423.l.12345/players;position=C;status=FA;count=25
```

## Authentication Modes

### Public Mode (OAuth 1.0)

- Enable with `publicMode: true`
- No `redirectUri` required
- No user authorization step
- Good for public resources and metadata

### User Mode (OAuth 2.0)

- Requires `redirectUri`
- Use `getAuthUrl()` then `authenticate(code)`
- Access token refresh supported automatically during requests
- Optional token storage via `TokenStorage`

## Supported Sports

- NHL: most heavily exercised in integration tests
- NFL: supported, fewer real-world validation cycles
- NBA: supported, fewer real-world validation cycles
- MLB: supported, fewer real-world validation cycles

## Documentation

- [Integration Test Setup](docs/INTEGRATION_TEST_SETUP.md)
- [OAuth 2.0 Implementation](docs/OAUTH2_IMPLEMENTATION.md)
- [Auth Flow Helper](docs/AUTH_FLOW_HELPER.md)
- [Yahoo API Reference Notes](docs/yahoo-fantasy-api-guide/OVERVIEW.md)

## Examples

- [Public endpoints (OAuth 1.0)](examples/public-api/01-public-endpoints.ts)
- [OAuth 2.0 auth flow](examples/hockey/01-authentication.ts)
- [Client endpoint walk-through](examples/hockey/02-client-test.ts)
- [Composable builder usage](examples/request-builder/01-basic-usage.ts)
- [Token storage helper](examples/token-storage/file-storage.ts)

## Development

### Requirements

- Node.js >= 18
- Bun >= 1.0.0

### Scripts

```bash
# Install deps
bun install

# Type check
npm run type-check

# Unit tests
npm test

# Integration tests
npm run test:integration

# Lint / format
npm run lint
npm run format

# Build
npm run build
```

## Project Structure

```text
yfs-api/
├── src/
│   ├── client/         # OAuth clients, HTTP transport, top-level client
│   ├── request/        # Composable request builder
│   ├── types/          # Resource, response, and query typing graph
│   └── utils/          # Parsing and validation utilities
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── examples/
├── docs/
└── scripts/
```

## Migration Notes

If you used older, non-builder style helpers, migrate to the builder-first API:

- Prefer `client.request().<resource>()...` for all reads/writes
- Use `buildPath()` to verify generated Yahoo paths during migration
- Replace ad-hoc query string assembly with chain methods, `filters()`, and `out()`
- Keep response handling aligned to normalized camelCase payload shapes

## Known Limitations

- Transaction write flows are available but still less field-tested than read flows
- Some sport-specific typing edges may still surface in less common endpoints
- Yahoo response shape inconsistencies can still require occasional defensive checks

## Contributing

Contributions are welcome.

1. Follow existing style and architecture patterns
2. Add or update tests for behavioral changes
3. Update docs/examples with API changes
4. Validate against real Yahoo API behavior when possible

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Built by [jbru](https://github.com/spiflicate) for the fantasy sports community 🏒⚾🏈🏀

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

Last updated: 2026-03-12
