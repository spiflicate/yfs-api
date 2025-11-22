# Yahoo Fantasy Sports API – Overview

This document summarizes the official Yahoo Fantasy Sports API guide at https://developer.yahoo.com/fantasysports/guide/ and organizes it for use with this SDK.

## Contents
- [Introduction](#introduction)
- [Authentication & App Registration](#authentication--app-registration)
- [Core Concepts](#core-concepts)
- [Resource Model](#resource-model)
- [Common URI Patterns](#common-uri-patterns)
- [Games](#games)
- [Leagues](#leagues)
- [Teams](#teams)
- [Rosters](#rosters)
- [Players](#players)
- [Transactions](#transactions)
- [Users](#users)

For detailed per‑resource docs, see:
- `YAHOO_FANTASY_API_GAMES.md`
- `YAHOO_FANTASY_API_LEAGUES.md`
- `YAHOO_FANTASY_API_TEAMS_ROSTERS.md`
- `YAHOO_FANTASY_API_PLAYERS.md`
- `YAHOO_FANTASY_API_TRANSACTIONS.md`
- `YAHOO_FANTASY_API_USERS.md`

---

## Introduction

The Yahoo Fantasy Sports APIs expose read/write access to fantasy games:
- Supported sports: NFL (football), MLB (baseball), NBA (basketball), NHL (hockey).
- Data types: games, leagues, teams, players, rosters, stats, standings, scoreboards, and transactions.

APIs are REST‑style over HTTPS and return XML. Resources are identified by **keys** (e.g. league key, team key, player key) and can be composed into **collections** and **sub‑resources**.

Many leagues are private; access to league and team data requires authorized user access via OAuth.

---

## Authentication & App Registration

### OAuth

- Yahoo Fantasy API uses **OAuth 1.0a**.
- Most fantasy data is **user‑specific**, so you typically use **3‑legged OAuth** (user authorization).
- Purely public data (e.g. basic game metadata) can be accessed with **2‑legged OAuth** where the app’s consumer key/secret act as the token.
- Key references from Yahoo docs:
  - General OAuth docs: https://developer.yahoo.com/oauth/
  - OAuth authorization flow: https://developer.yahoo.com/oauth/guide/oauth-auth-flow.html

### Application Registration

To call the Fantasy API you must:
1. Create an app at https://developer.yahoo.com/apps/create/.
2. Request **Fantasy Sports** scope with **Private user data** and choose **Read** or **Read/Write** depending on needs.
3. Record the **consumer key** and **consumer secret** – these are required in every signed request and must be kept secret.

### Access Patterns

- **3‑legged OAuth** (most common):
  - Obtain request token → redirect user to Yahoo → user authorizes → exchange request token for access token → sign Fantasy API requests with access token.
  - Tokens can be refreshed using Yahoo’s session handle.
- **2‑legged OAuth** for public endpoints:
  - Sign requests with consumer key/secret without an access token.
  - Example public request: `GET https://fantasysports.yahooapis.com/fantasy/v2/game/nfl`.

The official guide provides PHP examples using:
- The PHP OAuth extension for typical flows, token caching, and signed fetches.
- A full manual OAuth implementation (signing, parameter canonicalization, HMAC‑SHA1, PLAINTEXT signing).
- Examples for making **PUT** and **POST** requests with curl, including XML payloads.

---

## Core Concepts

### Games, Leagues, Teams, Players

- A **game** is a fantasy game for a sport and season (e.g. NFL 2011). Identified by a `game_id` or a stable `game_code` (e.g. `nfl`, `mlb`).
- A **league** is a competition within a game for a set of managers (typically 8–12 teams). Identified by a **league key** `"{game_key}.l.{league_id}"`.
- A **team** belongs to a league and is managed by one or more managers. Identified by a **team key** `"{game_key}.l.{league_id}.t.{team_id}"`.
- A **player** represents a real‑world athlete in the context of a game. Identified by a **player key** `"{game_key}.p.{player_id}"`.

### Coverage vs. Official Yahoo Docs

This documentation intentionally mirrors the public guide at `https://developer.yahoo.com/fantasysports/guide/` and focuses on what Yahoo explicitly documents:
- Only sub-resources and fields that appear in the official guide are treated as part of the "official" surface of this library.
- Live API responses may include additional, lesser-used sub-resources or fields that are not present in the official guide; these are intentionally omitted here.
- Those undocumented elements should be considered unstable and subject to change without notice.

Before introducing any such undocumented sub-resources or fields into the library as first-class types or helpers, they should be explored and validated using real responses (across games, leagues, seasons, and scoring types) to understand their behavior and stability.

### Scoping & Context

Many pieces of data are only meaningful in context:
- Player stats only have scoring meaning in a **league context** (since scoring settings vary between leagues).
- Team standings are meaningful only within a particular league.
- Transactions (adds/drops/trades) exist only in a league.

Hence many endpoints are expressed as nested resource paths (e.g. `league/.../players`, `team/.../matchups`).

---

## Resource Model

The API is built on **Resources** and **Collections**:

- **Resource**: individual object with a unique key (e.g. game, league, team, player, transaction, user, roster).
- **Collection**: container of homogeneous resources (e.g. `games`, `leagues`, `teams`, `players`, `transactions`, `users`).

### Resource URIs

Typical resource pattern:

- Resource: `https://fantasysports.yahooapis.com/fantasy/v2/{resource}/{resource_key}`
- Collection: `https://fantasysports.yahooapis.com/fantasy/v2/{collection};{resource}_keys={key1},{key2}`

Examples:
- Game: `/fantasy/v2/game/nfl`
- League: `/fantasy/v2/league/223.l.431`
- Team: `/fantasy/v2/team/223.l.431.t.1`
- Player: `/fantasy/v2/player/223.p.5479`

### Collections & Filtering

Collections accept **filters**, usually via semicolon‑separated parameters after the collection name:

- `games;is_available=1` – available games (currently in season).
- `games;game_codes=nfl,mlb;seasons=2011` – NFL & MLB for seasons 2011.
- `players;position=QB;status=A;sort=PTS;count=25` – top 25 available QBs in a league context.
- `transactions;type=add;count=5` – last 5 add transactions.

Filters differ per collection; see the per‑topic docs files for details.

### Sub‑Resources

Resources can expose nested resources/collections as **sub‑resources**. Common patterns:

- League → `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions`.
- Team → `roster`, `matchups`, `stats`.
- Player → `stats`, `ownership`, `percent_owned`, etc.
- Roster → `players`.

Sub‑resources are appended as trailing path segments:

- `.../league/{league_key}/settings`
- `.../team/{team_key}/matchups;weeks=1,5`
- `.../team/{team_key}/roster;date=YYYY-MM-DD`

### `out` Parameter (One‑Level Expansion)

You can request additional sub‑resources in the same call using the `out` parameter, which provides one extra expansion level:

- `.../league/{league_key};out=settings,standings`
- `.../game/{game_key};out=leagues,players`

Limitations:
- `out` only adds **one level** of extra sub‑resources.
- You cannot chain parameters on the `out` sub‑resources beyond defaults.

---

## Common URI Patterns

Base URI:

- `https://fantasysports.yahooapis.com/fantasy/v2`

Patterns:

- Resource: `/game/{game_key}`
- Collection: `/games;game_keys={g1},{g2}`
- Sub‑resource: `/{resource}/{resource_key}/{sub_resource}`
- Collection + sub‑resource: `/{collection};{resource}_keys={k1},{k2}/{sub_resource}`
- Global base (for some resources): you can use global paths like `/league/{league_key}`, `/team/{team_key}`, `/player/{player_key}`, `/transaction/{transaction_key}`.

Parameters are always semicolon‑delimited immediately after resource or collection names or after resource keys:

```text
/fantasy/v2/{resource}/{resource_key};key=value;key=value/{collection};key=value/{resource};key=value
```

---

## Games

See `YAHOO_FANTASY_API_GAMES.md` for full details.

Highlights:
- Resources: `game`, collection: `games`.
- Game keys: `game_code` or numeric `game_id`.
- Sub‑resources include: `metadata` (default), `leagues`, `players`, `game_weeks`, etc.
- Examples:
  - `GET /fantasy/v2/game/nfl`
  - `GET /fantasy/v2/games;game_codes=nfl,mlb;seasons=2011`

---

## Leagues

See `YAHOO_FANTASY_API_LEAGUES.md` for full details.

Highlights:
- Resource: `league`, collection: `leagues`.
- League key format: `{game_key}.l.{league_id}`.
- Sub‑resources: `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions`, etc.
- Example:
  - `GET /fantasy/v2/league/223.l.431/settings`

---

## Teams

See `YAHOO_FANTASY_API_TEAMS_ROSTERS.md` for full details.

Highlights:
- Resource: `team`, collection: `teams`.
- Team key format: `{game_key}.l.{league_id}.t.{team_id}`.
- Sub‑resources: `roster`, `matchups`, `stats`, `standings` (when nested under leagues), etc.
- Example:
  - `GET /fantasysports.yahooapis.com/fantasy/v2/team/223.l.431.t.1`

---

## Rosters

See `YAHOO_FANTASY_API_TEAMS_ROSTERS.md` for full details.

Highlights:
- Roster is a sub‑resource under `team`: `/team/{team_key}/roster`.
- Parameters:
  - NFL: `week={week}` for specific week, otherwise current.
  - MLB/NBA/NHL: `date=YYYY-MM-DD` for specific date, otherwise today.
- Supports `GET` and `PUT` to edit lineup positions.

Examples:
- `GET /team/253.l.102614.t.10/roster/players`
- `PUT /team/{team_key}/roster` with XML specifying player keys and new positions.

---

## Players

See `YAHOO_FANTASY_API_PLAYERS.md` for full details.

Highlights:
- Resource: `player`, collection: `players`.
- Player key: `{game_key}.p.{player_id}`.
- Sub‑resources: `stats`, `ownership`, `percent_owned`, etc.
- When accessed through `/league/.../players` or `/team/.../players`, responses are in league/team context.

Example:
- `GET /league/223.l.431/players;player_keys=223.p.5479`
- `GET /league/223.l.431/players;player_keys=223.p.5479/stats`

---

## Transactions

See `YAHOO_FANTASY_API_TRANSACTIONS.md` for full details.

Highlights:
- Transaction resource types: completed adds/drops, commissioner changes, waiver claims, pending trades.
- Methods:
  - `GET` on `transaction` and `transactions`.
  - `PUT` on `transaction` for editing waivers and trades.
  - `DELETE` on `transaction` for cancelling pending waivers/trades.
  - `POST` on `league/{league_key}/transactions` to create transactions (add/drop/trade).

Key formats:
- Completed transaction: `{game_key}.l.{league_id}.tr.{transaction_id}`
- Waiver claim: `{game_key}.l.{league_id}.w.c.{claim_id}`
- Pending trade: `{game_key}.l.{league_id}.pt.{pending_trade_id}`

---

## Users

See `YAHOO_FANTASY_API_USERS.md` for full details.

Highlights:
- Resource: `user`, collection: `users`.
- Intended usage is via `users;use_login=1` to get the current logged‑in user.
- Sub‑resources: `games`, `leagues`, `teams`, etc., representing where the user is participating.
- Example:
  - `GET /fantasy/v2/users;use_login=1/games;game_keys=nfl/teams` – teams for logged‑in user in NFL game.

---

This overview is intended as a hub; see the companion Markdown files for exhaustive per‑endpoint details, filters, and XML shapes.