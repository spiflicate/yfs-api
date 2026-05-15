# Research Scripts

## Static Route Verifier

Run a fixed set of raw Yahoo API paths and verify that each route still exists and still returns the expected high-level shape.

This script bypasses `YahooFantasyClient` and the request builder entirely. It signs OAuth1 requests directly, manages OAuth2 tokens directly, fetches raw API paths with `fetch`, and then parses the returned XML.

The editable route matrix lives in `research/static-route-definitions.ts`.
The runtime config lives in `research/static-route-config.ts`.

The route matrix is derived from:

- `docs/yahoo-fantasy-api-guide/PATH_REFERENCE_TABLE.md`
- `docs/yahoo-fantasy-api-guide/PATH_DECISION_TREE.md`
- `docs/yahoo-fantasy-api-guide/PATH_CHEAT_SHEET.md`
- `docs/yahoo-fantasy-api-guide/ALLOWED_CHAIN_MATRIX.md`

Each route definition is tagged with:

- `mode`: `public` or `private`
- `confidence`: `explicit` or `composed`

### Configure It

Edit `research/static-route-config.ts` and set:

- `selection.mode` to `public`, `private`, or `all` (`all` is the default)
- `selection.routeIds` if you want a subset
- `auth.public` and `auth.private` credentials directly in TS
- `routeContext` placeholder values for the keys, filters, and date/week values used by the docs-derived paths

Important route context fields:

- `PUBLIC_GAME_KEY`, `PUBLIC_GAME_CODE`, `PUBLIC_LEAGUE_KEY`
- `PRIVATE_LEAGUE_KEY`, `PRIVATE_LEAGUE_KEYS`
- `PRIVATE_TEAM_KEY`, `PRIVATE_TEAM_KEYS`
- `PRIVATE_PLAYER_KEY`, `PRIVATE_PLAYER_KEYS`
- `PRIVATE_TRANSACTION_KEY`, `PRIVATE_TRANSACTION_KEYS`
- `GAME_KEY_FILTER`, `SEASON`, `WEEK`, `ALT_WEEK`, `DATE`, `COUNT_SMALL`

For OAuth2:

- `auth.private.tokenFilePath` controls persisted token storage
- `auth.private.seedTokens` can preload tokens in code
- If no valid token exists, the script prints the Yahoo auth URL, waits for the authorization code on stdin, exchanges it, and stores the resulting tokens in `tokenFilePath`
- If stored tokens exist but are expired, the script first tries refresh and writes the refreshed tokens back to `tokenFilePath`

### Run It

```bash
bun run research/static-route-verifier.ts
```

### Route Validation Priority

The script treats route validation as the primary concern:

- HTTP failures, bad paths, auth failures, and empty responses are reported as route failures
- Shape validation runs only after a route successfully returns data
- Shape mismatches are reported as warnings, not route failures
- `explicit` versus `composed` is printed for every result so you can compare docs confidence with live behavior

Routes with unresolved placeholders are skipped instead of failing the whole run.

### Actionable Report

Each run also writes a Markdown report to `output.reportFilePath`.

The report groups results into implementation actions:

- `keep-as-supported`
- `fix-shape-expectation`
- `demote-or-remove`
- `fill-config-and-rerun`

It also highlights:

- explicit routes that failed live and may indicate doc mismatch
- composed routes that passed live and may be strong candidates for promotion into builder support

### Response Dumps

Each run creates a timestamped subdirectory under `output.responseDumpDirPath`, which defaults to `research/tmp`.

Within that run folder, each exercised route writes a numbered JSON file.

The verifier also updates `research/tmp/latest-run.txt` with the path to the newest run folder.

Successful route dumps include:

- request URL
- route path
- raw XML body
- parsed response object

Failed route dumps include:

- request URL when available
- route path
- error metadata
- raw Yahoo error body when available