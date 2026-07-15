# Games

Official source: [Game APIs](https://sports.yahoo.com/developer/docs/#game-apis)

A game identifies a sport and season. A numeric `game_id` is season-specific; a code such as `nfl` resolves to the current season and is converted to a numeric ID in response keys.

Evidence badges: **4S** = four-sport passed, **OBS** = observed-only, **NHL** = NHL-only fixture, **DRD** = documented/runtime discrepancy.

## Resource

```text
GET /game/{game_key}
```

| Child | Purpose | Evidence |
| --- | --- | --- |
| `metadata` | Key, code, name, URL, type, and season; default child | 4S |
| `leagues;league_keys=...` | Selected leagues in the game | NHL |
| `players` | Players in the game | 4S (by key), OBS (search) |
| `dates` | Key game dates | 4S |
| `game_weeks` | Week start and end dates | 4S |
| `stat_categories` | Available game stat definitions | 4S |
| `position_types` | Player position types | 4S |
| `roster_positions` | Available fantasy roster slots | 4S |

```text
/game/nfl
/game/{game_key}/players;player_keys={player_key1},{player_key2}
/game/{game_key}/stat_categories
/game/nfl;out=stat_categories,position_types,game_weeks
```

Live note: direct game-to-leagues requests have required `league_keys` in testing. Omitting it can return `league ids expected`.

## Collection

```text
GET /games;game_keys={key1},{key2}
```

| Filter | Meaning |
| --- | --- |
| `game_keys` | Specific game IDs or codes |
| `is_available=1` | Currently available games |
| `game_types` | Game format, such as `full` or `pickem-team` |
| `game_codes` | Sport/game codes |
| `seasons` | Season years |

```text
/games;game_codes=nfl;is_available=1
/games;game_codes=nfl;seasons=2025
/games;game_keys=nfl,mlb
```

### Collection Children

Yahoo says game resource children carry over to the games collection. Evidence status:

| Child | Evidence | Notes |
| --- | --- | --- |
| `metadata` (via keys) | 4S | `/games;game_keys=...` |
| `teams` (user-scoped) | HP | `/users;use_login=1/games/teams` |
| `leagues` child | official claim, not in suite | No current route tests a direct child beneath a Games collection |
| `players` | official claim, not in suite | Yahoo documents collection-level players; not tested in current route suite |
| `out=leagues,players` | DRD | `/games;game_codes=...;out=leagues,players` returned `league ids expected` in a dedicated four-sport run |

Prefer the singular game resource for player access. Collection-level `players` and `transactions` forms are not yet validated; the tested `out=leagues,players` form is a documented/runtime discrepancy.
