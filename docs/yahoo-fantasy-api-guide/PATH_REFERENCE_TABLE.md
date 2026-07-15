# Yahoo Fantasy API Path Reference

This table combines Yahoo's live endpoint tables with successful route probes. See [ALLOWED_CHAIN_MATRIX.md](ALLOWED_CHAIN_MATRIX.md) for evidence boundaries.

| Node | Children | Parameters and filters |
| --- | --- | --- |
| `users;use_login=1` | `games`, `teams` | `use_login`; use `games/leagues`, not direct `leagues` |
| `game/{game_key}` | `leagues`, `players`, `dates`, `game_weeks`, `stat_categories`, `position_types`, `roster_positions` | `out`; filter `leagues` with `league_keys` |
| `games` | game children; user-scoped `teams` | `game_keys`, `is_available`, `game_types`, `game_codes`, `seasons`, `out` |
| `league/{league_key}` | `settings`, `standings`, `scoreboard`, `teams`, `players`, `draftresults`, `transactions` | `out`; `scoreboard` accepts `week` |
| `leagues` | league children | `league_keys`, `out` |
| `team/{team_key}` | `stats`, `standings`, `roster`, `draftresults`, `matchups`; players collection is also official | `out`; coverage filters belong on child |
| `teams` | team children | `team_keys`, `out` |
| `roster` | `players` | `week` for NFL; `date` for MLB/NBA/NHL |
| `player/{player_key}` | `stats`, `ownership`, `percent_owned`, `draft_analysis` | `out`; stats use `type`, `week`, or `date` |
| `players` | player children | `player_keys`; league-context search, status, position, sort, pagination filters |
| `transaction/{transaction_key}` | `players` | `out`; mutations depend on transaction type and permissions |
| `transactions` | transaction children | `transaction_keys`, `type`, `types`, `team_key`, `count`, `out` |

## Key Filters

| Filter | Segment | Notes |
| --- | --- | --- |
| `game_keys` | `games` | Game IDs or codes |
| `game_codes` | `games` | `nfl`, `mlb`, `nba`, `nhl`, and other valid Yahoo codes |
| `seasons` | `games` | Season years |
| `league_keys` | `leagues` | Required in many game-to-league paths in practice |
| `team_keys` | `teams` | Full team keys |
| `player_keys` | `players` | Full player keys |
| `transaction_keys` | `transactions` | Full transaction keys |

## Player Filters

These are primarily league-context filters.

| Filter | Values |
| --- | --- |
| `position` | Valid fantasy position |
| `status` | `A`, `FA`, `W`, `T`, `K` |
| `search` | Partial player name |
| `sort` | Stat ID, `NAME`, `OR`, `AR`, `PTS` |
| `sort_type` | `season`, `week`, `date`, `lastweek`, `lastmonth`, where sport-appropriate |
| `sort_season`, `sort_week`, `sort_date` | Coverage value for the sort |
| `start`, `count` | Zero-based offset and positive page size |

## Transaction Filters

| Filter | Values |
| --- | --- |
| `type` | `add`, `drop`, `commish`, `trade`; `waiver` or `pending_trade` with `team_key` |
| `types` | Comma-separated valid types |
| `team_key` | Team in the league; required to discover relevant pending transactions |
| `count` | Positive result limit |

## Coverage Filters

| Child | Parameters |
| --- | --- |
| `scoreboard` | `week` |
| `matchups` | `weeks` |
| `roster` | `week` for NFL, `date` for MLB/NBA/NHL |
| `stats` | `type=season`; `type=week;week=...` for NFL; `type=date;date=...` for MLB/NBA/NHL |

## Live-Observed Gaps

- `?format=json` is implemented in the repository's format research although Yahoo's current Fantasy page only demonstrates XML; it is not covered by the static route suite.
- `league_ids` and `team_ids` have worked on nested collection segments, but remain provisional; prefer full-key filters.
- Roster PUT success can be a small `{ confirmation: { status: "success" } }` response; invalid moves can return errors such as `That position has already been filled.`
