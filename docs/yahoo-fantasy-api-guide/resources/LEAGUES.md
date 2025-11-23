# Yahoo Fantasy Sports API – Leagues

This document summarizes the **League resource** and **Leagues collection** as described in the official Yahoo Fantasy Sports API guide.

## Contents
- [League Resource](#league-resource)
  - [Description](#description)
  - [League Keys](#league-keys)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
  - [Sample Responses](#sample-responses)
- [Leagues Collection](#leagues-collection)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Sub-resources](#sub-resources-1)

---

## League Resource

### Description

A **league** represents one instance of a fantasy competition within a game. It contains:
- A set of teams (managed by one or more Yahoo users).
- Scoring and roster configuration.
- Schedules, standings, and scoreboards.
- Transaction history.

Leagues:
- Exist in the context of a **game** (NFL, MLB, NBA, NHL, etc.).
- May be **public** or **private**.
- For private leagues, data is only available to authorized users (managers in the league or commissioners), subject to OAuth permissions.

### League Keys

A league is identified by a **league key** of the form:

```text
{game_key}.l.{league_id}
```

Examples:
- `pnfl.l.431`
- `223.l.431`

Notes:
- The separator between `game_key` and `league_id` is a **lowercase `l`**, not the digit `1`.

### HTTP Operations

- Supported: `GET`

There are no public `POST`/`PUT`/`DELETE` methods documented for `league` itself; write operations generally happen via `roster` or `transactions` APIs.

### URIs

Base league URI:

```text
https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}
```

Examples:
- `GET /fantasy/v2/league/223.l.431`

Sub‑resources are appended:

```text
https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/{sub_resource}
```

Examples:
- `GET /fantasy/v2/league/223.l.431/settings`
- `GET /fantasy/v2/league/223.l.431/standings`
- `GET /fantasy/v2/league/223.l.431/scoreboard`
- `GET /fantasy/v2/league/223.l.431/teams`
- `GET /fantasy/v2/league/223.l.431/players`
- `GET /fantasy/v2/league/223.l.431/transactions`

You can also use `out` to retrieve multiple sub‑resources in a single call:

```text
/league/{league_key};out=settings,standings
```

### Sub-resources

The official guide lists **`metadata`** as the default sub‑resource. Key league sub‑resources include:

- `settings` – league configuration:
  - Draft type and status.
  - Scoring type (e.g. `head` for head‑to‑head, `roto` for rotisserie).
  - Playoff configuration.
  - Roster positions.
  - Stat categories and stat modifiers.
  - Divisions.
- `standings` – standings and team outcome totals:
  - Overall rank and record (wins/losses/ties, percentage).
  - Divisional records.
  - Team points totals.
- `scoreboard` – weekly matchups and scores:
  - Week number.
  - For each matchup: teams, week, status, winner_team_key.
  - Weekly team points and projected points.
- `teams` – collection of teams in the league.
- `players` – league‑context players collection (with league filters and sorting).
- `transactions` – league‑scoped transactions collection.

### Sample Responses

#### League metadata

Example: `GET /fantasy/v2/league/223.l.431` (simplified)

```xml
<fantasy_content>
  <league>
    <league_key>223.l.431</league_key>
    <league_id>431</league_id>
    <name>Y! Friends and Family League</name>
    <url>https://football.fantasysports.yahoo.com/archive/pnfl/2009/431</url>
    <draft_status>postdraft</draft_status>
    <num_teams>14</num_teams>
    <scoring_type>head</scoring_type>
    <current_week>16</current_week>
    <start_week>1</start_week>
    <end_week>16</end_week>
    <is_finished>1</is_finished>
  </league>
</fantasy_content>
```

#### League settings

Example: `GET /fantasy/v2/league/223.l.431/settings` includes:
- Basic league metadata (same as above).
- `<settings>` block with:
  - `<draft_type>` and `<scoring_type>`.
  - Playoff flags (`uses_playoff`, `playoff_start_week`, `uses_playoff_reseeding`, etc.).
  - FAAB (Free Agent Acquisition Budget) settings.
  - Trade rules (`trade_end_date`, `trade_ratify_type`, `trade_reject_time`).
  - `<roster_positions>` – list of position slots with counts.
  - `<stat_categories>` – list of stats including `stat_id`, `name`, `display_name`, `position_type`, etc.
  - `<stat_modifiers>` – scoring weights mapping `stat_id` → value.
  - `<divisions>` – optional league divisions.

#### League standings

Example: `GET /fantasy/v2/league/223.l.431/standings` returns:
- League metadata.
- `<standings>` with `<teams>`.
- Each `<team>` includes:
  - `team_key`, `team_id`, `name`, `url`, logos.
  - `division_id`, `faab_balance`, `clinched_playoffs`.
  - `<managers>` with manager id, nickname, guid.
  - `<team_points>` – total season points.
  - `<team_standings>` – `rank`, `outcome_totals`, `divisional_outcome_totals`.

#### League scoreboard

Example: `GET /fantasy/v2/league/223.l.431/scoreboard` returns:
- League metadata.
- `<scoreboard>` with:
  - `<week>` – current or requested week.
  - `<matchups>` – each `<matchup>` includes:
    - `week`, `status` (`postevent`), `is_tied`, `winner_team_key`.
    - `<teams>` – two teams per matchup with weekly `<team_points>` and `<team_projected_points>`.

---

## Leagues Collection

### Description

The **Leagues** collection lets you work with **multiple leagues at once**. This is usually scoped via:
- A games collection (e.g. games → leagues).
- A users collection (e.g. users → games → leagues).

Each element under `<leagues>` is a `<league>` resource.

### HTTP Operations

- Supported: `GET`

### URIs

Within the docs, league collections appear as nested sub‑resources. The patterns under `/fantasy/v2` are:

```text
/leagues/{sub_resource}
/leagues;league_keys={league_key1},{league_key2}/{sub_resource}
```

With full base URL:

```text
https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys={league_key1},{league_key2}
https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys={league_key1},{league_key2}/{sub_resource}
```

You can also append `out` to pull sub‑resources for each league:

```text
/leagues;league_keys={k1},{k2};out=settings,standings
```

### Sub-resources

Any sub‑resource valid for a **single `league`** is also valid under the **`leagues` collection**.

- Valid sub‑resources include at least:
  - `settings`
  - `standings`
  - `scoreboard`
  - `teams`
  - `players`
  - `transactions`

Examples:

- `GET /leagues;league_keys=223.l.431,223.l.999/settings`
- `GET /leagues;league_keys=223.l.431,223.l.999;out=standings`
- `GET /leagues/teams` (when nested under `games` or `users` chains)

The response will contain a `<leagues>` element with a `<league>` child element for each league key provided, each including the requested sub‑resources.