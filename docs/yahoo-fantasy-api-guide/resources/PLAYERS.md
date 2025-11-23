# Yahoo Fantasy Sports API – Players

This document summarizes the **Player resource** and **Players collection** from the official Yahoo Fantasy Sports API guide.

## Contents
- [Player Resource](#player-resource)
  - [Description](#description)
  - [Player Keys](#player-keys)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
  - [Sample Responses](#sample-responses)
- [Players Collection](#players-collection)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Filters](#filters)

---

## Player Resource

### Description

The **Player** resource represents a professional athlete in the context of a fantasy **game** (sport + season).

Player data includes:
- Name (full, first, last, ASCII forms).
- Professional team and abbreviation.
- Positions and eligible positions.
- Status (e.g. `P`, `DL`).
- Bye weeks (for NFL).
- Undroppable flag.

When accessed in a **league context**, additional information such as stats, points, ownership, and ranking are also available.

### Player Keys

A player is identified by a **player key** of the form:

```text
{game_key}.p.{player_id}
```

Examples:
- `pnfl.p.5479`
- `223.p.5479`

### HTTP Operations

- Supported: `GET`

No public `POST`/`PUT`/`DELETE` methods are documented for `player` resources directly; roster and transaction APIs handle changes to which team owns a player.

### URIs

Base player URI:

```text
https://fantasysports.yahooapis.com/fantasy/v2/player/{player_key}
```

Sub‑resources:

```text
https://fantasysports.yahooapis.com/fantasy/v2/player/{player_key}/{sub_resource}
```

You can also request additional sub‑resources using `out`:

```text
/player/{player_key};out={sub_resource_1},{sub_resource_2}
```

In practice, players are frequently requested through collections scoped to a league or team, such as:

- `/league/{league_key}/players;player_keys={player_key1}`
- `/team/{team_key}/players`

### Sub-resources

The guide lists **`metadata`** as the default sub‑resource.

Common player sub‑resources include:
- `stats` – fantasy and/or real‑world statistics.
- `ownership` – ownership information in leagues.
- `percent_owned` – percent of leagues in which the player is owned.

(Exact sub‑resource set can vary by sport and environment; the official docs show `stats` explicitly.)

### Sample Responses

#### Player in league context

Example: `GET /league/223.l.431/players;player_keys=223.p.5479` (simplified)

```xml
<fantasy_content>
  <league>
    <league_key>223.l.431</league_key>
    <league_id>431</league_id>
    <name>Y! Friends and Family League</name>
    <url>https://football.fantasysports.yahoo.com/archive/pnfl/2009/431</url>
    <players count="1">
      <player>
        <player_key>223.p.5479</player_key>
        <player_id>5479</player_id>
        <name>
          <full>Drew Brees</full>
          <first>Drew</first>
          <last>Brees</last>
          <ascii_first>Drew</ascii_first>
          <ascii_last>Brees</ascii_last>
        </name>
        <status>P</status>
        <editorial_player_key>nfl.p.5479</editorial_player_key>
        <editorial_team_key>nfl.t.18</editorial_team_key>
        <editorial_team_full_name>New Orleans Saints</editorial_team_full_name>
        <editorial_team_abbr>NO</editorial_team_abbr>
        <bye_weeks>
          <week>5</week>
        </bye_weeks>
        <uniform_number>9</uniform_number>
        <display_position>QB</display_position>
        <image_url>...</image_url>
        <is_undroppable>0</is_undroppable>
        <position_type>O</position_type>
        <eligible_positions>
          <position>QB</position>
        </eligible_positions>
      </player>
    </players>
  </league>
</fantasy_content>
```

#### Player stats in league context

Example: `GET /league/223.l.431/players;player_keys=223.p.5479/stats` returns:
- League metadata.
- `<players>` with one `<player>`.
- Inside `<player>`:
  - Same metadata as above.
  - `<player_stats>`:
    - `coverage_type` (e.g. `season`).
    - `season` (e.g. `2009`).
    - `<stats>` list, each with `stat_id` and `value`.
  - `<player_points>`:
    - `coverage_type` and `season`.
    - `<total>` – fantasy points total according to league scoring.

Example snippet (simplified):

```xml
<player_stats>
  <coverage_type>season</coverage_type>
  <season>2009</season>
  <stats>
    <stat><stat_id>4</stat_id><value>4388</value></stat>
    <stat><stat_id>5</stat_id><value>34</value></stat>
    <!-- ... -->
  </stats>
</player_stats>
<player_points>
  <coverage_type>season</coverage_type>
  <season>2009</season>
  <total>310.17</total>
</player_points>
```

---

## Players Collection

### Description

The **Players** collection represents a set of players in some context. It can be qualified in the URI by:
- **Game** – generic player information not tied to a specific league.
- **League** – player information within a league, including availability, stats, and ranking.
- **Team** – players on a particular team.

Each `<player>` under `<players>` is a **Player resource**.

### HTTP Operations

- Supported: `GET`

### URIs

Patterns for players collections (relative to `/fantasy/v2`):

```text
/players/{sub_resource}
/players;player_keys={player_key1},{player_key2}/{sub_resource}
```

When nested under other resources:

- Game context:
  - `/game/{game_key}/players`
- League context:
  - `/league/{league_key}/players`
- Team context:
  - `/team/{team_key}/players`

Examples:

- `/league/223.l.431/players;player_keys=223.p.5479`
- `/league/223.l.431/players;player_keys=223.p.5479/stats`
- `/league/{league_key}/players;status=A;position=QB;sort=PTS;count=25`

`out` works similarly to other collections:

```text
/players;player_keys={k1},{k2};out=stats
```

### Filters

The **players** collection supports powerful filters (primarily in a **league context**). From the guide:

| Filter        | Description                                               | Example                                      | Notes                                                |
|---------------|-----------------------------------------------------------|----------------------------------------------|------------------------------------------------------|
| `position`    | Valid player positions                                   | `/players;position=QB`                       | Only in league context                               |
| `status`      | Player availability: `A` (all available), `FA` (free agents), `W` (waivers), `T` (taken), `K` (keepers) | `/players;status=A`                          | Only in league context                               |
| `search`      | Name search (partial player name)                        | `/players;search=smith`                      | Only in league context                               |
| `sort`        | Sort key: `{stat_id}`, `NAME` (last, first), `OR` (overall rank), `AR` (actual rank), `PTS` (fantasy points) | `/players;sort=60`                          | Only in league context                               |
| `sort_type`   | Sort coverage: `season`, `date` (MLB/NBA/NHL), `week` (NFL), `lastweek` (MLB/NBA/NHL), `lastmonth` | `/players;sort_type=season`                 | Only in league context                               |
| `sort_season` | Season year for sorting                                  | `/players;sort_type=season;sort_season=2010` | Only in league context                               |
| `sort_date`   | Sort date (`YYYY-MM-DD`, MLB/NBA/NHL only)               | `/players;sort_type=date;sort_date=2010-02-01` | Only in league context                              |
| `sort_week`   | Sort week (NFL only)                                     | `/players;sort_type=week;sort_week=10`       | Only in league context                               |
| `start`       | Offset index (0-based)                                   | `/players;start=25`                          | Pagination                                           |
| `count`       | Limit count (> 0)                                        | `/players;count=5`                           | Pagination                                           |

Filters can be **combined**, e.g.:

```text
/league/{league_key}/players;status=FA;position=WR;sort=PTS;sort_type=season;sort_season=2011;start=0;count=25
```