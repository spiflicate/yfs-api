# Yahoo Fantasy Sports API – Games

This document summarizes the **Game resource** and **Games collection** from the official Yahoo Fantasy Sports API guide.

## Contents
- [Game Resource](#game-resource)
  - [Description](#description)
  - [Game Keys](#game-keys)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
  - [Sample Response](#sample-response)
- [Games Collection](#games-collection)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Filters](#filters)
  - [Sub-resources](#sub-resources-1)

---

## Game Resource

### Description

The **Game** resource describes a specific fantasy game (sport + season), such as:
- Fantasy Football (NFL)
- Fantasy Baseball (MLB)
- Fantasy Basketball (NBA)
- Fantasy Hockey (NHL)

It exposes metadata such as:
- Human‑readable name
- Game code
- Game ID
- Game type (full, pickem, etc.)
- Game URL
- Season year

### Game Keys

A game is identified by a **game key**, which can be either:
- `game_id` – numeric per season, e.g. `222`, `223`, `257`, etc.
- `game_code` – stable identifier for the game across seasons, e.g. `nfl`, `mlb`.

Key behavior:
- Using a `game_code` as the `game_key` returns the **current season** for that game.
  - Example: `game_key = nfl` during 2011 season is equivalent to numeric `game_id` `257`.
- The documentation includes a table of historical `game_id` values per sport and season.
- When you pass a `game_code` in the URI, the API converts it internally to a `game_id`. All keys in the XML response will use the numeric `game_id`.

Examples:
- Game code: `nfl`, `pnfl` (legacy plus/free distinction), `mlb`, `nhl`, etc.
- Game ID: `257` (NFL 2011), `253` (MLB 2011), etc.

### HTTP Operations

- Supported: `GET`

There are no documented `POST`/`PUT`/`DELETE` operations on the `game` resource in the public guide.

### URIs

Base format:

```text
https://fantasysports.yahooapis.com/fantasy/v2/game/{game_key}
```

Examples:
- `GET https://fantasysports.yahooapis.com/fantasy/v2/game/nfl`
- `GET https://fantasysports.yahooapis.com/fantasy/v2/game/257`

Sub‑resources are appended:

```text
https://fantasysports.yahooapis.com/fantasy/v2/game/{game_key}/{sub_resource}
```

Multiple sub‑resources using `out`:

```text
https://fantasysports.yahooapis.com/fantasy/v2/game/{game_key};out={sub_resource_1},{sub_resource_2}
```

### Sub-resources

The guide lists `metadata` as the **default sub‑resource**. Additional game‑level sub‑resources (summarized from the Yahoo docs) typically include:

- `metadata` – game meta info (default)
- `leagues` – leagues for this game
- `players` – players in this game
- `game_weeks` – schedule of weeks

Supported sub‑resources can vary by sport and game type, but any sub‑resource valid at `game` level is also valid beneath the `games` collection.

### Sample Response

Example `GET /fantasy/v2/game/nfl` (simplified):

```xml
<fantasy_content>
  <game>
    <game_key>257</game_key>
    <game_id>257</game_id>
    <name>Football</name>
    <code>nfl</code>
    <type>full</type>
    <url>https://football.fantasysports.yahoo.com/f1</url>
    <season>2011</season>
  </game>
</fantasy_content>
```

---

## Games Collection

### Description

The **Games** collection lets you work with **multiple game resources at once** and filter them by code, type, season, or availability.

Each element under `<games>` in the response is a `<game>` resource as described above.

### HTTP Operations

- Supported: `GET`

### URIs

The guide uses shorthand URIs under the `/fantasy/v2` root; when fully qualified, the patterns are:

```text
GET https://fantasysports.yahooapis.com/fantasy/v2/games/{sub_resource}
GET https://fantasysports.yahooapis.com/fantasy/v2/games;game_keys={game_key1},{game_key2}/{sub_resource}
```

You can also request games directly (no trailing sub‑resource) to only retrieve game metadata.

Examples:

- All games (optionally filtered):
  - `/fantasy/v2/games;game_codes=nfl,mlb;seasons=2011`
- Games plus sub‑resources:
  - `/fantasy/v2/games;is_available=1/metadata`
  - `/fantasy/v2/games;game_keys=nfl,mlb;out=leagues`

### Filters

The **games** collection supports several filters that can be combined:

| Filter       | Values / Meaning                                     | Example                                      |
|--------------|------------------------------------------------------|----------------------------------------------|
| `is_available` | `1` = only games currently in season                 | `/games;is_available=1`                      |
| `game_types` | `full`, `pickem-team`, `pickem-group`, `pickem-team-list` | `/games;game_types=full,pickem-team`         |
| `game_codes` | Any valid game codes                                 | `/games;game_codes=nfl,mlb`                 |
| `seasons`    | Any valid season years                               | `/games;seasons=2011,2012`                  |

Filters can be combined, e.g.:

```text
/games;seasons=2011;game_codes=nfl
```

### Sub-resources

In addition to the sub‑resources valid for a single `game` resource, the **games** collection supports collection‑level sub‑resources that are equivalent to resource‑level ones applied to each game:

- Any valid `game` sub‑resource is also valid under `games`.

Examples:

- `/games/leagues` – leagues for all games in the collection.
- `/games;game_keys=nfl,mlb/players` – players across NFL and MLB games.
- `/games;out=leagues,players` – attach both leagues and players as `out` expansions for the selected games.
