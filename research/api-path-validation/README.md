# Cross-Sport API Path Validation

This research suite probes Yahoo's raw Fantasy Sports API independently of the SDK request builder. It records route support, response facts, shape warnings, fixture gaps, and failures separately for NFL, MLB, NBA, and NHL.

## What It Prevents

- A successful NHL route is no longer generalized to every sport.
- Missing keys are reported as `fixture-unavailable`, not silently skipped.
- Route templates are checked for unknown placeholders before any request.
- Weekly NFL routes are not applied to daily MLB/NBA/NHL coverage.
- Empty account membership or stale transaction fixtures are not classified as unsupported routes.
- Each run keeps local immutable Markdown and JSON reports with working artifact links.
- The tracked latest summary omits private fixture identifiers and local-only links.

## Commands

Deterministic matrix inspection, with no credentials or network:

```bash
bun run research:routes -- --dry-run --mode all --sports nfl,mlb,nba,nhl --allow-incomplete
```

Public cross-sport validation:

```bash
bun run research:routes -- --mode public --sports nfl,mlb,nba,nhl --allow-incomplete
```

Private validation for sports available to the authorized account:

```bash
bun run research:routes -- --mode private --sports nfl,mlb,nba,nhl
```

Strict regression run:

```bash
bun run research:routes -- --mode all --strict-shapes --require-complete
```

Known-invalid and provisional probes:

```bash
bun run research:routes -- --mode all --include-invalid
```

One route:

```bash
bun run research:path-probe -- --mode public "/game/nfl/dates"
```

Quality checks:

```bash
bun run type-check:research
bun run lint:research
bun run test:research
bun run check:research
```

## CLI Options

| Option | Meaning |
| --- | --- |
| `--mode public|private|all` | Select authentication and route families |
| `--sports nfl,mlb,nba,nhl` | Select sports |
| `--route-ids id1,id2` | Run named definitions only |
| `--dry-run` | Resolve the matrix without credentials or requests |
| `--strict-shapes` | Fail when a route passes but its expected shape changes |
| `--allow-incomplete` | Permit a successful exit when scenarios lack required fixtures |
| `--require-complete` | Explicitly retain the default behavior of failing on fixture gaps |
| `--include-invalid` | Reprobe known-invalid or provisional paths |
| `--non-interactive` | Fail instead of prompting when OAuth2 authorization is required |

Normal live runs fail on discovery failures, route failures, and fixture gaps. Use `--allow-incomplete` for exploratory matrices where fixture gaps are expected. A known-invalid route is successful evidence only when its definition explicitly permits the observed failure class; acceptance remains a regression.

## Discovery

Before executing the selected matrix, the verifier discovers:

1. Current game key and season from `/game/{sport}`.
2. Authorized teams from `/users;use_login=1/games;game_keys={sport}/teams`.
3. League keys from discovered team keys.
4. Player and coverage-period fixtures from the selected team's roster.
5. Current transaction keys from the selected league's transaction feed.

An account may not participate in every sport. Those private scenarios remain `fixture-unavailable` while public game-level coverage still runs across all selected sports.

## Explicit Fixture Overrides

Set `YAHOO_ROUTE_PROFILES_JSON` when a reproducible public league or private fixture is preferred over discovery. Values merge into the defaults by sport.

```json
{
  "nfl": {
    "code": "nfl",
    "context": {
      "PLAYER_SEARCH": "mahomes",
      "WEEK": "1"
    },
    "publicContext": {
      "LEAGUE_KEY": "{public-league-key}"
    },
    "privateContext": {
      "LEAGUE_KEY": "{private-league-key}",
      "TEAM_KEY": "{private-team-key}",
      "PLAYER_KEY": "{player-key}",
      "DATE": "YYYY-MM-DD"
    }
  }
}
```

Canonical placeholders are defined in `route-model.ts`. Unknown placeholders fail preflight rather than becoming skipped routes.

## Credentials

The local `.env` file in this directory may provide:

```text
YAHOO_CLIENT_ID=...
YAHOO_CLIENT_SECRET=...
```

- Public probes use OAuth 1.0 compatibility signing.
- Private probes use OAuth 2.0 and persist refreshable tokens in `.oauth2-tokens.json`.
- Both files are ignored by Git.

## Outputs

Each live run writes under `tmp/{timestamp}/`:

- `report.md`: human-readable per-sport evidence.
- `results.json`: machine-readable discovery and route results.
- One raw response or error dump per scenario.

The latest sanitized summary is copied to `actionable-route-report.md`, and `tmp/latest-run.txt` points to the immutable local run directory. The tracked summary redacts league, team, player, and transaction fixtures and does not link to ignored artifacts.

Raw private dumps may contain account, league, and team information. Keep `tmp/` private.

## Route Sources

The catalog is compared against Yahoo's current [Fantasy Sports API reference](https://sports.yahoo.com/developer/docs/) and [access guide](https://developer.yahoo.com/fantasysports/guide/), reviewed on 2026-07-15. Yahoo documentation is recorded as a claim, not accepted as proof. Route definitions distinguish documented claims, observed-only behavior, and documented/runtime discrepancies; only live results provide evidence for a concrete sport and fixture.

See [GUIDE_AUDIT.md](GUIDE_AUDIT.md) for the current source comparison, known contradictions, deterministic links to route definitions, and coverage backlog.

## Result Meanings

| Result | Meaning |
| --- | --- |
| `passed` | Yahoo accepted the route; facts and shape evidence were recorded |
| `failed` | The request failed and was classified for follow-up |
| `fixture-unavailable` | The sport/account lacked a required concrete key or period |
| `expected-rejection` | A known-invalid/provisional route was rejected as expected |
| Shape `warning` | Route worked but the parsed response missed an expected path/type |

Failure classes separate structural rejection, bad fixtures, auth/scope, empty data, parser failures, and transient/rate-limit errors.

## Extending Coverage

1. Add one definition to `static-route-definitions.ts`.
2. Use only canonical placeholders from `route-model.ts`.
3. Restrict sport-specific routes with `sports`.
4. Mark legitimately empty collections with `allowEmpty`.
5. Add expectations when the parsed response contract is known.
6. Run preflight tests and a dry run before making live requests.

`simple-routes.ts` and its generated JSON were removed because they formed a second, malformed route catalog that the verifier never consumed.
