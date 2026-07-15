# Players

Official source: [Player APIs](https://sports.yahoo.com/developer/docs/#player-apis)

A player is an athlete in a game/season context.

Player key:

```text
{game_key}.p.{player_id}
```

## Resource

```text
GET /player/{player_key}
```

| Child | Purpose | Context |
| --- | --- | --- |
| `metadata` | Identity, pro team, status, image, positions; default | game |
| `stats` | Season, week, or date statistics; fantasy points in league context | game or league |
| `ownership` | Owning team, waivers, or free-agent state | league |
| `percent_owned` | Ownership prevalence across leagues | game |
| `draft_analysis` | Average pick, average round, and percent drafted | game |

```text
/player/{player_key}/stats;type=season
/player/{player_key}/percent_owned
/player/{player_key}/draft_analysis
/league/{league_key}/players;player_keys={player_key}/ownership
```

Use league context when you need fantasy points, scoring interpretation, or ownership state.

## Collection

```text
/game/{game_key}/players
/league/{league_key}/players
/team/{team_key}/players
/teams;team_keys={team_key1},{team_key2}/players
/players;player_keys={player_key1},{player_key2}
```

Player children also apply beneath collections:

```text
/players;player_keys={key1},{key2}/stats
/league/{league_key}/players;player_keys={key}/ownership
```

## Filters

League-context filters can be combined:

| Filter | Values |
| --- | --- |
| `position` | Valid fantasy position |
| `status` | `A` available, `FA` free agent, `W` waivers, `T` taken, `K` keeper |
| `search` | Player name |
| `sort` | Stat ID, `NAME`, `OR`, `AR`, `PTS` |
| `sort_type` | `season`, `week`, `date`, `lastweek`, `lastmonth` where sport-appropriate |
| `sort_season` | Year |
| `sort_week` | NFL week |
| `sort_date` | `YYYY-MM-DD` for daily sports |
| `start`, `count` | Pagination offset and positive page size |

```text
/league/{league_key}/players;status=FA;position=WR;sort=PTS;sort_type=season;start=0;count=25
```
