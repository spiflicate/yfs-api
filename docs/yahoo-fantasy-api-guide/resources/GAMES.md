# Games

Official source: [Game APIs](https://sports.yahoo.com/developer/docs/#game-apis)

A game identifies a sport and season. A numeric `game_id` is season-specific; a code such as `nfl` resolves to the current season and is converted to a numeric ID in response keys.

## Resource

```text
GET /game/{game_key}
```

| Child | Purpose |
| --- | --- |
| `metadata` | Key, code, name, URL, type, and season; default child |
| `leagues;league_keys=...` | Selected leagues in the game |
| `players` | Players in the game |
| `dates` | Key game dates |
| `game_weeks` | Week start and end dates |
| `stat_categories` | Available game stat definitions |
| `position_types` | Player position types |
| `roster_positions` | Available fantasy roster slots |

Examples:

```text
/game/nfl
/game/nfl/players;position=QB;count=10
/game/461/leagues;league_keys=461.l.1000
/game/nfl/stat_categories
/game/nfl;out=players,game_weeks
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
/games;is_available=1
/games;game_codes=nfl;seasons=2025
/games;game_keys=nfl,mlb
/games;game_keys=nfl/players;count=25
```

Yahoo says game children carry over to the games collection. Live testing confirms a filtered `leagues;league_keys=...` node and its `/teams` descendant. Equivalent `/players`, `/transactions`, and broad `games;...;out=leagues` forms remain provisional for the games collection.
