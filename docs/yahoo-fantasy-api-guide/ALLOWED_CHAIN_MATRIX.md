# Yahoo Fantasy API Chain Matrix

This matrix separates what Yahoo documents from what the API has accepted in this repository's live route probes. Evidence is scoped by sport, auth level, and run provenance.

The last successful public route matrix is `research/api-path-validation/actionable-route-report.md`, run `2026-07-15T19-33-25-809Z`. It could not be refreshed on 2026-07-30 because Yahoo rejected all previously known API credentials. The 2026-07-30 private run is recorded as an access blocker in `research/api-path-validation/private-access-baseline.md`; it is not route evidence.

> This is a manually maintained summary of the generated route report. Executable route definitions and generated reports remain authoritative until matrix generation is implemented.

Evidence classes:

- **Four-sport passed**: passed on NFL, MLB, NBA, NHL (public game surface)
- **NHL-only passed**: passed on NHL public league/team fixture; NFL/MLB/NBA fixture-unavailable
- **Documented/runtime discrepancy**: Yahoo claims it; live responses reject it
- **Observed-only**: live behavior without matching current Yahoo docs
- **Fixture-unavailable**: not run (missing league/team key for that sport)
- **Historical-private**: passed in a prior session with private credentials, not refreshed
- **Access-blocked**: refresh attempted, but Yahoo rejected available credentials or required an unavailable session

| Parent | Child | Official | Live evidence | Scope | Notes |
| --- | --- | --- | --- | --- | --- |
| `users` | `games` | yes | passed | historical-private | Primary league-discovery path |
| `users` | `teams` | yes | passed | historical-private | Listed in Yahoo's Teams collection table |
| `users` | `leagues` | no | rejected | historical-private | Use `users/games/leagues` |
| `users/games` | `leagues` | yes | passed | historical-private | May fail if a selected game lacks league support |
| `users/games` | `teams` | yes | passed | historical-private | User-owned teams only |
| `users/games/leagues` | `settings`, `teams`, `players` | generic composition | passed | historical-private | Deep collection composition works for tested user games |
| `users/games/teams` | `roster` | generic composition | passed | historical-private | Tested with authorized user data |
| `game` | `players`, `dates`, `game_weeks`, `stat_categories`, `position_types`, `roster_positions` | yes | passed | four-sport | Players passed by key; player search is observed-only |
| `game` | `leagues` | yes | passed with `league_keys` | NHL-only | Unfiltered route can return `league ids expected` |
| `game/leagues` | `teams`, `players` | generic composition | passed with `league_keys` | NHL-only | Players passed with `search`; keep the league filter on the `leagues` segment |
| `game/leagues` | `transactions` | generic composition | not current | documented-only | No executable current route covers this chain |
| `games` | keyed metadata | yes | passed | four-sport | Tested with `game_keys`, `game_codes`, seasons, and availability filters |
| `games` | `players` | yes | not current | documented-only | Collection inheritance is documented but not exercised by the current suite |
| `games` | `out=leagues,players` | generic composition | documented/runtime discrepancy | four-sport | `/games;game_codes=...;out=leagues,players` returned `league ids expected` |
| `league` | `settings`, `standings`, `scoreboard`, `teams`, `draftresults`, `transactions` | yes | passed | NHL-only | Explicit routes tested on the current NHL public league |
| `league` | `players` | yes | not current | documented-only | Current player evidence uses `game/leagues;league_keys=.../players` instead |
| `leagues` | keyed metadata, `teams` | yes | passed | NHL-only | Supply `league_keys`; other collection children are not current |
| `leagues` | `settings`, `standings`, `scoreboard`, `players`, `draftresults`, `transactions` | yes | not current | documented-only | Yahoo documents collection inheritance; current suite does not test these forms |
| `team` | `roster`, `matchups`, `stats` | yes | passed | historical-private | `standings` and `draftresults` are official, not yet in suite |
| `team` | `players` | yes | passed | NHL-only | Explicit public `/team/{key}/players` route |
| `teams` | `roster`, `matchups`, `stats` | yes | passed | historical-private | Supply `team_keys` |
| `teams` | `players` | yes | not current | historical-private | Explicit Yahoo collection example; not in the latest route suite |
| `roster` | `players` | yes | passed | historical-private | One roster period per team request |
| `player` | `stats`, `ownership`, `percent_owned` | yes | passed | historical-private | `draft_analysis` is official, not yet in suite |
| `players` | keyed metadata | yes | passed | four-sport | Root collection tested only with `player_keys` |
| `players` | `stats`, `ownership`, `percent_owned` | generic composition | not current | historical-private | Do not infer these children from the current keyed-metadata pass |
| `transaction` | `players` | yes | not current | historical-private | Concrete transaction fixtures were stale |

## Frontend API Boundary

The Yahoo web frontend also uses `pub-api-ro`, `pub-api-rw`, and `pub-api` v3 routes. The observed public game reads are externally reachable without credentials. Private league reads and write requests require browser-session cookies. These routes are documented in [the investigation findings](../../research/yahoo-api-investigation/FINDINGS.md), but remain a separate experimental surface until request contracts and cookie-session handling are implemented and tested.

## `out` Evidence

| Path family | Status | Scope |
| --- | --- | --- |
| `game/{key};out=stat_categories,position_types,game_weeks` | passed | four-sport |
| `league/{key};out=settings,standings,scoreboard` | not current | documented-only |
| `leagues;league_keys=...;out=settings,standings` | not current | documented-only |
| `team/{key};out=roster,stats,matchups` | passed | historical-private |
| `teams;team_keys=...;out=roster,stats` | passed | historical-private |
| `player/{key};out=stats,ownership` | passed | historical-private |
| `users;use_login=1/games;game_keys=...;out=leagues,teams` | passed | historical-private |
| `users;use_login=1;out=leagues` | rejected | historical-private |
| `games;game_codes=...;out=leagues,players` | documented/runtime discrepancy | four-sport |

## Stability Rule

Use this order when deciding whether to publish a route:

1. Prefer an official example that also passes live.
2. Accept a generic composed route only after a successful live request with realistic filters.
3. Mark parameter-contract failures provisional rather than unsupported.
4. Mark direct `subresource ... not supported` failures unsupported.
5. Revalidate mutations and transaction-key routes with disposable, current fixtures before relying on them.
