# Yahoo Fantasy Sports API – Teams & Rosters

This document summarizes the **Team resource**, **Teams collection**, and **Roster resource** from the official Yahoo Fantasy Sports API guide.

## Contents
- [Team Resource](#team-resource)
  - [Description](#description)
  - [Team Keys](#team-keys)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
  - [Sample Responses](#sample-responses)
- [Roster Resource](#roster-resource)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Sub-resources](#sub-resources-1)
  - [Sample Responses](#sample-responses-1)
  - [PUT – Editing Lineups](#put--editing-lineups)
- [Teams Collection](#teams-collection)
  - [Description](#description-2)
  - [HTTP Operations](#http-operations-2)
  - [URIs](#uris-2)

---

## Team Resource

### Description

A **team** is the fundamental competitive unit in a league. It:
- Belongs to a single **league**.
- Has a manager (and optional co‑manager).
- Manages a roster of players.
- Accumulates stats, points, and standings.

The Team APIs let you retrieve:
- Team metadata (name, URL, division, FAAB balance, logos).
- Manager information.
- Team stats and points.
- Matchups.
- Rosters.

Access is restricted:
- For **private leagues**, team information is only available to authorized users belonging to the league or with proper permissions.

### Team Keys

A team is identified by a **team key** of the form:

```text
{game_key}.l.{league_id}.t.{team_id}
```

Examples:
- `pnfl.l.431.t.1`
- `223.l.431.t.1`

### HTTP Operations

- Supported: `GET`

Team resources themselves are read‑only; write operations are made via `roster` and `transactions` endpoints.

### URIs

Base team URI:

```text
https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}
```

Examples:
- `GET /fantasy/v2/team/223.l.431.t.1`

Sub‑resources for additional data:

```text
https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/{sub_resource}
```

Important sub‑resources include:
- `roster`
- `matchups`
- `stats`

You can also use `out` to append extra sub‑resources:

```text
/team/{team_key};out=roster,stats
```

### Sub-resources

The documentation lists **`metadata`** as the default sub‑resource. Common sub‑resources:

- `roster` – players on the team for a given date/week.
- `matchups` – team matchups and weekly scoring.
- `stats` – team stats for a season or date.

Note: Live team responses may contain additional elements or sub-resources beyond those summarized here. These extras do not appear in the official Yahoo Fantasy Sports API guide and are therefore not treated as first-class concepts in this library until they have been explored and validated.

### Sample Responses

#### Team metadata

Example: `GET /fantasy/v2/team/223.l.431.t.1` (simplified)

```xml
<fantasy_content>
  <team>
    <team_key>223.l.431.t.1</team_key>
    <team_id>1</team_id>
    <name>PFW - Blunda</name>
    <url>https://football.fantasysports.yahoo.com/archive/pnfl/2009/431/1</url>
    <team_logos>
      <team_logo>
        <size>medium</size>
        <url>...</url>
      </team_logo>
    </team_logos>
    <division_id>2</division_id>
    <faab_balance>22</faab_balance>
    <managers>
      <manager>
        <manager_id>13</manager_id>
        <nickname>Michael Blunda</nickname>
        <guid>XNAXQZRDZPJ3RVFMY7ZTSWEFLU</guid>
      </manager>
    </managers>
  </team>
</fantasy_content>
```

#### Team matchups

Example: `GET /fantasy/v2/team/223.l.431.t.1/matchups;weeks=1,5` returns:
- Team metadata.
- `<matchups>` with one `<matchup>` per requested week.
- Each matchup includes:
  - Week number, status, `is_tied`, `winner_team_key`.
  - Two `<team>` elements with weekly `team_points` and `team_projected_points`.

#### Team stats

Example: `GET /fantasy/v2/team/223.l.431.t.1/stats;type=season` returns:
- Team metadata.
- `<team_points>` with coverage type `season`, season year, and total points.

Another example (MLB, date stats):

- `GET /fantasy/v2/team/253.l.102614.t.10/stats;type=date;date=2011-07-06` returns a `<team_stats>` block with per‑stat values for the given date.

---

## Roster Resource

### Description

The **Roster** resource represents the squad of players on a team for a given coverage period:
- For NFL (football): **week**.
- For MLB, NBA, NHL: **date**.

A roster:
- Contains each player on the team.
- Indicates eligible positions and currently selected positions.
- Indicates whether each player is starting or on the bench.

You can:
- Use `GET` to retrieve roster data.
- Use `PUT` to change player positions / starting status for a given week/date (lineup changes).

### HTTP Operations

- `GET` – list current or historical roster and positions.
- `PUT` – modify player positions on the roster (lineup editing).

### URIs

The roster is a **sub‑resource of team**:

```text
GET  https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster
PUT  https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster
```

Sub‑resources of roster (primarily `players`):

```text
/team/{team_key}/roster/{sub_resource}
```

Coverage parameters:

- NFL (weekly):
  - `;week={week}` (defaults to current week)
  - Example: `/team/{team_key}/roster;week=10`
- MLB/NBA/NHL (daily):
  - `;date=YYYY-MM-DD` (defaults to today)
  - Example: `/team/{team_key}/roster;date=2011-05-01`

### Sub-resources

- Default sub‑resource: `players`.
- The primary nested structure is a `<players>` collection with individual `<player>` elements.

Note: The roster examples in the official Yahoo documentation focus on commonly used fields. Actual API responses may expose additional roster-level flags or fields that are not covered there; this library does not yet model those until their behavior is better understood.

### Sample Responses

Example: `GET /fantasy/v2/team/253.l.102614.t.10/roster/players` (simplified):

```xml
<fantasy_content>
  <team>
    <team_key>253.l.102614.t.10</team_key>
    <team_id>10</team_id>
    <name>Matt Dzaman</name>
    <url>https://baseball.fantasysports.yahoo.com/b1/102614/10</url>
    <team_logos>...</team_logos>
    <managers>...</managers>
    <roster>
      <coverage_type>date</coverage_type>
      <date>2011-07-22</date>
      <players count="22">
        <player>
          <player_key>253.p.7569</player_key>
          <player_id>7569</player_id>
          <name>
            <full>Brian McCann</full>
            ...
          </name>
          <editorial_player_key>mlb.p.7569</editorial_player_key>
          <editorial_team_key>mlb.t.15</editorial_team_key>
          <editorial_team_full_name>Atlanta Braves</editorial_team_full_name>
          <editorial_team_abbr>Atl</editorial_team_abbr>
          <uniform_number>16</uniform_number>
          <display_position>C</display_position>
          <image_url>...</image_url>
          <is_undroppable>0</is_undroppable>
          <position_type>B</position_type>
          <eligible_positions>
            <position>C</position>
            <position>Util</position>
          </eligible_positions>
          <has_player_notes>1</has_player_notes>
          <selected_position>
            <coverage_type>date</coverage_type>
            <date>2011-07-22</date>
            <position>C</position>
          </selected_position>
          <starting_status>
            <coverage_type>date</coverage_type>
            <date>2011-07-22</date>
            <is_starting>1</is_starting>
          </starting_status>
        </player>
        <!-- more players -->
      </players>
    </roster>
  </team>
</fantasy_content>
```

### PUT – Editing Lineups

You can edit your roster by sending a `PUT` request with XML specifying player positions for a given week/date. You can change multiple players at once; players you do **not** include in the payload keep their existing positions.

#### NFL (Weekly Lineups)

Endpoint:

```text
PUT https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster
```

Body:

```xml
<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>week</coverage_type>
    <week>13</week>
    <players>
      <player>
        <player_key>242.p.8332</player_key>
        <position>WR</position>
      </player>
      <player>
        <player_key>242.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

#### MLB / NBA / NHL (Daily Lineups)

Endpoint:

```text
PUT https://fantasysports.yahooapis.com/fantasy/v2/team/{team_key}/roster
```

Body:

```xml
<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>2011-05-01</date>
    <players>
      <player>
        <player_key>253.p.8332</player_key>
        <position>1B</position>
      </player>
      <player>
        <player_key>253.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

Validation notes:
- If you attempt an invalid move (e.g. too many players in a slot or ineligible positions), the API returns an error and no lineup changes are applied.

---

## Teams Collection

### Description

The **Teams** collection represents multiple teams in a particular context:
- All teams in a given league.
- All teams owned by a user (optionally filtered by game).

Each `<team>` element in the collection is a full **Team resource**.

### HTTP Operations

- Supported: `GET`

### URIs

Patterns under `/fantasy/v2`:

```text
/teams/{sub_resource}
/teams;team_keys={team_key1},{team_key2}/{sub_resource}
```

With base URL:

```text
https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys={team_key1},{team_key2}
https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys={team_key1},{team_key2}/{sub_resource}
```

Any sub‑resource valid for `team` is also valid at the `teams` level, and you can use `out` similarly:

```text
/teams;team_keys={t1},{t2};out=roster,stats
```