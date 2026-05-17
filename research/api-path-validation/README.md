# Research Scripts

## Static Route Verifier

Run a fixed set of raw Yahoo API paths and verify that each route still exists and still returns the expected high-level shape.

This script bypasses `YahooFantasyClient` and the request builder entirely. It uses the shared `HttpClient`, manages OAuth directly, requests raw API paths, and then parses the returned XML.

The editable route matrix lives in `research/api-path-validation/static-route-definitions.ts`.
The runtime config lives in `research/api-path-validation/static-route-config.ts`.

The route matrix is derived from:

- `docs/yahoo-fantasy-api-guide/PATH_REFERENCE_TABLE.md`
- `docs/yahoo-fantasy-api-guide/PATH_DECISION_TREE.md`
- `docs/yahoo-fantasy-api-guide/PATH_CHEAT_SHEET.md`
- `docs/yahoo-fantasy-api-guide/ALLOWED_CHAIN_MATRIX.md`

Each route definition is tagged with:

- `mode`: `public` or `private`
- `confidence`: `explicit` or `composed`

The definitions are also split into three route sets:

- `public`: public routes included by default
- `private`: private routes included by default
- `invalid`: known failing probes excluded by default but still preserved for repro runs

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
cd research/api-path-validation && bun run static-route-verifier.ts
```

To include the known failing probes as well:

```bash
cd research/api-path-validation && bun run static-route-verifier.ts --include-invalid
```

## One-Off Path Probe

Run a single raw Yahoo API path from the terminal without editing the static route matrix.

Use this when you want to quickly test one path, inspect the returned shape, or see whether a failure looks structural versus parameter-related.

```bash
cd research/api-path-validation && bun run path-probe.ts --mode public "/game/465"
```

```bash
bun run research:path-probe -- --mode private "/league/465.l.30702/transactions;count=5"
```

Notes:

- `--mode public` uses OAuth1 credentials from `static-route-config.ts`
- `--mode private` uses the same OAuth2 token flow and persisted token file as the verifier
- the path can be passed as a raw Yahoo API path like `/game/465` or as a full Yahoo API URL
- each probe writes a JSON artifact under `research/api-path-validation/tmp/<timestamp>/`
- failures are classified using the same heuristic buckets as the batch verifier

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

Each run creates a timestamped subdirectory under `output.responseDumpDirPath`, which defaults to `research/api-path-validation/tmp`.

Within that run folder, each exercised route writes a numbered JSON file.

The verifier also updates `research/api-path-validation/tmp/latest-run.txt` with the path to the newest run folder.

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