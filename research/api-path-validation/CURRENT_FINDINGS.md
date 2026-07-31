# Current Cross-Sport Findings

Latest reproducible evidence: [private-access-baseline.md](private-access-baseline.md), private non-interactive run `2026-07-30T21-11-01-018Z`. The last successful public route audit remains [actionable-route-report.md](actionable-route-report.md), run `2026-07-15T19-33-25-809Z`; Yahoo rejected all previously known credentials when a refresh was attempted on 2026-07-30.

## Authenticated Access Baseline

The 2026-07-30 run exercised the existing Yahoo Fantasy API v2 surface at
`https://fantasysports.yahooapis.com/fantasy/v2` using OAuth2 bearer-token
authentication in private mode. All selected requests were read-only; no
roster or transaction mutations were attempted.

- 104 scenarios selected across NFL, MLB, NBA, and NHL.
- 20 user/account discovery requests failed as `auth-or-scope`.
- 84 dependent league, team, roster, player, and transaction scenarios were
  classified as `fixture-unavailable`, not route failures.
- 0 routes passed because authorization failed before account fixtures could
  be discovered.
- Public requests in the same run also returned Yahoo's application-level
  authorization failure; this is recorded separately from the private OAuth2
  blocker in the detailed report.

Safe reproduction, without interactive prompts or mutations:

```bash
bun run research:routes -- --mode private --sports nfl,mlb,nba,nhl --allow-incomplete --non-interactive
```

The next human action is to authorize the configured Yahoo application again
or provide a refreshed OAuth2 token file, then rerun the command. Until that
happens, these results must not be interpreted as evidence that the private
resource routes are unsupported.

## Result Summary

- 120 public scenarios across NFL, MLB, NBA, and NHL.
- 75 passed with no route failures or shape warnings.
- 45 were explicitly `fixture-unavailable`; none were silently skipped.
- Every sport passed the same 15 current game and keyed-collection route families.
- NHL passed 15 additional public league and team scenarios using the configured current-season fixture.

| Sport | Current game | Season | Passed | Missing public league fixtures |
| --- | --- | ---: | ---: | ---: |
| NFL | `470` | 2026 | 15 | 15 |
| MLB | `469` | 2026 | 15 | 15 |
| NBA | `466` | 2025 | 15 | 15 |
| NHL | `465` | 2025 | 30 | 0 |

## Cross-Sport Facts

The following route families passed with parser-shape assertions for all four sports:

- `/game/{sport}` and `/metadata`
- `/players;search=...;count=5`
- `/dates`
- `/game_weeks`
- `/stat_categories`
- `/position_types`
- `/roster_positions`
- `;out=stat_categories,position_types,game_weeks`
- `/games;game_codes={sport}`
- `/games;game_codes={sport};seasons={current_season}`
- `/games;game_keys={current_game_key}`
- `/games;game_codes={sport};is_available=1`
- `/game/{sport}/players;player_keys=...`
- `/players;player_keys=...`

| Sport | Season dates | Weeks | Stat categories | Position types | Roster positions |
| --- | --- | ---: | ---: | ---: | ---: |
| NFL | 2026-09-09 to 2027-01-10 | 18 | 94 | 5 | 21 |
| MLB | 2026-03-25 to 2026-09-27 | 26 | 92 | 2 | 19 |
| NBA | 2025-10-21 to 2026-04-12 | 24 | 29 | 1 | 12 |
| NHL | 2025-10-07 to 2026-04-16 | 24 | 35 | 2 | 12 |

These counts describe the current game responses on the run date, not permanent API constants.

## Newly Confirmed Official Routes

The documentation review identified several official routes missing from the old matrix. The cross-sport run now confirms these game routes for every sport:

- `dates`
- `stat_categories`
- `position_types`
- `roster_positions`

The current NHL public fixture also confirms:

- `/league/{league_key}/draftresults`
- game-to-league-to-teams and game-to-league-to-players when `league_keys` is supplied
- `/leagues;league_keys=...`
- `/league/{league_key}/teams` and the keyed leagues-to-teams collection chain
- `/teams;team_keys=...` and `/team/{team_key}/players`
- `/league/{league_key}/scoreboard` with the default current period

## Private Coverage Status

Private cross-sport discovery is implemented but the latest non-interactive
run could not refresh the stored OAuth2 token because Yahoo authorization is
required.

This is an authentication blocker, not route evidence. The verifier supports
`--non-interactive` so automation fails immediately rather than waiting for
an authorization code.

After authorization, private discovery will identify account teams, derive league keys, fetch roster/player/period fixtures, and collect current transaction keys independently for each sport. Sports without account membership remain `fixture-unavailable`.

## Known Boundaries

- NFL, MLB, and NBA still need reproducible public league fixtures for cross-sport league comparisons.
- Direct transaction and top-level keyed transaction routes need current private transaction fixtures.
- Team `standings`, team `draftresults`, and player `draft_analysis` are in the new matrix but await refreshed private authorization.
- `games;game_codes=...;out=leagues,players` is a documented/runtime discrepancy: NFL, MLB, NBA, and NHL each returned `Bad Request: league ids expected` in dedicated run `2026-07-15T19-10-59-454Z`. It remains in the invalid/provisional probe set so a future runtime change is visible.
- `/users;use_login=1/leagues` remains a known structural rejection; league discovery must pass through `games`.

## Evidence Policy

- A route pass is recorded per sport; it is never generalized from one sport.
- Missing fixtures are not evidence that a route failed, but they fail the run by default so incomplete matrices cannot appear green. Exploratory runs may opt out with `--allow-incomplete`.
- Discovery failures always fail the run; they cannot degrade into successful fixture gaps.
- Routes without assertions report shape `not-run`, not shape `passed`.
- `--strict-shapes` turns parser-shape drift into a failing run.
- Invalid routes count as expected rejection only for failure classes declared by that route definition.
- The tracked report is sanitized and contains no local artifact links; detailed immutable evidence remains under ignored `tmp/` storage.

Route provenance is audited against Yahoo's current [Fantasy Sports API reference](https://sports.yahoo.com/developer/docs/) and [access guide](https://developer.yahoo.com/fantasysports/guide/), reviewed on 2026-07-15. Documentation is a claim; live fixture-specific validation is the evidence. See [GUIDE_AUDIT.md](GUIDE_AUDIT.md).
