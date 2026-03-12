# yfs-api

A TypeScript wrapper for the Yahoo Fantasy Sports API with OAuth 1.0 and OAuth 2.0 support.

[![npm version](https://img.shields.io/npm/v/yfs-api.svg)](https://www.npmjs.com/package/yfs-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- TypeScript client for Yahoo Fantasy Sports
- OAuth 1.0 (public API) and OAuth 2.0 (user auth)
- Token refresh support for OAuth 2.0
- Composable query builder via `client.q()` for typed Yahoo API paths
- Integration-tested against real Yahoo Fantasy leagues (primarily NHL)
- Transaction APIs are implemented but still experimental

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

### Public API Access (OAuth 1.0 - No User Auth Required)

Useful for public data like game info, player search, and league metadata:

```typescript
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  publicMode: true, // OAuth 1.0 for public endpoints
});

// Get a public game resource
const nhl = await client.q().game("nhl").execute();

// Search public game-level players
const playerSearch = await client
  .q()
  .game("nhl")
  .players()
  .search("mcdavid")
  .count(10)
  .execute();

console.log(`Game: ${nhl.game.name}`);
console.log(`Found ${playerSearch.game.players?.length ?? 0} players`);
```

### User Authentication (OAuth 2.0)

For accessing user-specific data (teams, leagues, rosters):

```typescript
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: "oob", // or your callback URL
});

// Step 1: Get authorization URL
const authUrl = client.getAuthUrl();
console.log("Visit this URL to authorize:", authUrl);

// Step 2: After user authorizes, exchange code for tokens
await client.authenticate(authorizationCode);

// Step 3: Use authenticated endpoints
const teamsResponse = await client
  .q()
  .users()
  .useLogin()
  .games()
  .gameKeys("nhl")
  .teams()
  .execute();

const teams = teamsResponse.users.flatMap((user) =>
  (user.games ?? []).flatMap((game) => game.teams ?? []),
);

console.log(`Found ${teams.length} teams`);

// Get league details
const league = await client.q().league(teams[0].league.leagueKey).execute();
console.log(`League: ${league.league.name} (${league.league.season})`);

// Get team roster
const roster = await client.q().team(teams[0].teamKey).roster().execute();
console.log(`Roster has ${roster.team.roster?.players?.length ?? 0} players`);

// Get league standings
const standings = await client
  .q()
  .league(teams[0].league.leagueKey)
  .standings()
  .execute();
console.log(
  `${standings.league.standings?.teams?.length ?? 0} teams in standings`,
);

// Search for players in league
const freeAgents = await client
  .q()
  .league(teams[0].league.leagueKey)
  .players()
  .status("FA")
  .position("C")
  .count(25)
  .execute();
```

### Token Storage & Persistence

Save and restore tokens between sessions:

```typescript
import { YahooFantasyClient } from "yfs-api";
import * as fs from "fs/promises";

// Create token storage
const tokenStorage = {
  save: async (tokens) => {
    await fs.writeFile(".tokens.json", JSON.stringify(tokens));
  },
  load: async () => {
    try {
      const data = await fs.readFile(".tokens.json", "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  clear: async () => {
    await fs.unlink(".tokens.json").catch(() => {});
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

// Try to load existing tokens
await client.loadTokens();

// If no tokens, authenticate
if (!client.hasValidTokens()) {
  const authUrl = client.getAuthUrl();
  console.log("Visit:", authUrl);
  // ... get authorization code ...
  await client.authenticate(code);
}

// Tokens are automatically saved and refreshed
const teams = await client.q().users().useLogin().games().teams().execute();
```

## Query Coverage

The main public surface is the composable query builder returned by `client.q()`.

| Query Pattern | Example                                              | Status |
| ------------- | ---------------------------------------------------- | ------ |
| **Users**     | `client.q().users().useLogin().games().teams()`      | Tested |
| **League**    | `client.q().league(key).settings()`                  | Tested |
| **Team**      | `client.q().team(key).roster()`                      | Tested |
| **Player**    | `client.q().player(key).stats()`                     | Tested |
| **Game**      | `client.q().game('nhl').players().search('McDavid')` | Tested |
| **Games**     | `client.q().games().gameKeys(['nhl', 'nfl'])`        | Tested |

### Experimental (Not Fully Tested)

| Query Pattern          | Example                                           | Status          |
| ---------------------- | ------------------------------------------------- | --------------- |
| **Transaction writes** | `client.q().league(key).transactions().post(...)` | ⚠️ Experimental |

Transaction operations are implemented but have limited real-world testing so far. Use with caution and please report any issues.

## Supported Sports

| Sport      | Status        | Notes                                             |
| ---------- | ------------- | ------------------------------------------------- |
| 🏒 **NHL** | Primary focus | Actively tested with real leagues                 |
| 🏀 **NBA** | Basic support | Core endpoints have some coverage, not exhaustive |
| 🏈 **NFL** | Experimental  | Likely to work; types may need refinement         |
| ⚾ **MLB** | Experimental  | Likely to work; types may need refinement         |

Feedback and contributions to improve support for any sport are welcome.

## Getting Yahoo API Credentials

1. Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/)
2. Create a new app
3. Get your **Client ID** (Consumer Key) and **Client Secret** (Consumer Secret)
4. Set your **Redirect URI** (use `oob` for out-of-band if testing locally)

## Examples

Check out the `/examples` directory for complete working examples:

- `examples/hockey/01-authentication.ts` - Traditional OAuth 2.0 flow
- `examples/hockey/02-client-test.ts` - Testing API endpoints
- `examples/public-api/01-public-endpoints.ts` - Public API without auth
- `examples/token-storage/usage-example.ts` - Token persistence
- `examples/query-builder/01-basic-usage.ts` - Query builder basics
- `examples/query-builder/02-type-safety.ts` - Query builder typing examples

### Query Builder Patterns

The query builder covers both keyed resources and the root `/games` collection:

```typescript
import { YahooFantasyClient } from "yfs-api";

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: "oob",
});

// Complex chain: User's NFL leagues with settings and standings
const result = await client
  .q()
  .users()
  .useLogin()
  .games()
  .gameKeys("nfl")
  .leagues()
  .out(["settings", "standings"])
  .execute();

// Root games collection
const games = await client.q().games().gameKeys(["nhl", "nfl"]).execute();

// Team roster for specific week
const roster = await client
  .q()
  .team("423.l.12345.t.1")
  .roster({ week: 10 })
  .players()
  .execute();

// Available players with filters
const qbs = await client
  .q()
  .league("423.l.12345")
  .players()
  .position("QB")
  .status("A")
  .sort("AR")
  .count(25)
  .execute();
```

## Documentation

- **[Integration Test Setup](docs/INTEGRATION_TEST_SETUP.md)** - Running integration tests
- **[OAuth 2.0 Implementation](docs/OAUTH2_IMPLEMENTATION.md)** - OAuth details
- **[URL Pattern Guide](docs/URL_PATTERN_GUIDE.md)** - Query path patterns and composition

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or later (for development)
- Node.js >= 18.0.0 (for runtime)
- Yahoo Developer Application credentials

### Setup

```bash
# Install dependencies
bun install

# Run type checking
bun run type-check

# Run unit tests
bun test tests/unit

# Run integration tests (requires .env.test)
bun test tests/integration

# Lint and format
bun run lint
bun run format

# Build the project
bun run build
```

### Running Integration Tests

See [docs/INTEGRATION_TEST_SETUP.md](docs/INTEGRATION_TEST_SETUP.md) for detailed setup instructions.

```bash
# 1. Copy environment template
cp .env.test.example .env.test

# 2. Add your credentials to .env.test
# 3. Discover your league and team keys
bun run scripts/discover-test-resources.ts

# 4. Run tests
source .env.test && bun test tests/integration
```

## Project Structure

```
yfs-api/
├── src/
│   ├── client/              # OAuth clients and main client
│   ├── query/               # Composable query builder
│   ├── types/               # TypeScript type definitions
│   │   ├── resources/       # Resource types (league, team, etc.)
│   │   ├── sports/          # Sport-specific types (NHL, etc.)
│   │   ├── common.ts        # Common types
│   │   └── errors.ts        # Error types
│   └── utils/               # Utilities (validators, formatters)
├── tests/
│   ├── unit/                # Unit tests (301 passing)
│   ├── integration/         # Integration tests (45 passing)
│   └── fixtures/            # Test fixtures and mock data
├── examples/                # Usage examples
├── docs/                    # User documentation
└── scripts/                 # Development and discovery scripts
```

## Philosophy

This library aims to be easy to understand and use while staying close to Yahoo's API. Over time the goal is to improve type safety, documentation, and examples as real-world usage surfaces gaps.

## Contributing

Contributions welcome! Please:

1. Follow existing code patterns and style
2. Add comprehensive JSDoc comments
3. Include tests for new functionality
4. Update documentation
5. Test against real Yahoo Fantasy API when possible

If you have real-world usage that surfaces missing or incomplete types, contributions to improve type information are very welcome—please open an issue or pull request.

## Known Limitations

1. **Transaction APIs** are experimental and untested
2. **NFL/MLB** types may need refinement based on real usage
3. **Stat Categories** are sport-specific and may vary
4. **League Settings** support most options but some edge cases may exist

Please report issues or contribute improvements where you see gaps or rough edges.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Built by [jbru](https://github.com/spiflicate) for the fantasy sports community 🏒⚾🏈🏀

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R01DV0JD)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

_Last Updated: 2025-11-24_
