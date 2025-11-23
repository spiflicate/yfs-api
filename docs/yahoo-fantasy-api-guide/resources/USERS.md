# Yahoo Fantasy Sports API – Users

This document summarizes the **User resource** and **Users collection** from the official Yahoo Fantasy Sports API guide.

## Contents
- [User Resource](#user-resource)
  - [Description](#description)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
- [Users Collection](#users-collection)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Sub-resources](#sub-resources-1)
  - [Typical Usage Patterns](#typical-usage-patterns)

---

## User Resource

### Description

A **User** represents a Yahoo account in the context of Fantasy Sports.

User‑level APIs allow you to:
- Discover which **games** a user is playing.
- Discover which **leagues** they belong to in those games.
- Discover which **teams** they own.

However, the guide suggests that you should **generally use the Users collection** with `use_login=1`, rather than calling an individual `user` resource directly.

### HTTP Operations

- Supported: `GET`

### URIs

The docs discourage direct use of `/user/{guid}` and instead recommend the `users` collection with `use_login`. Conceptually, a user resource would be accessible via:

```text
/user/{guid}
```

But in practice you work with:

```text
/users;use_login=1
```

### Sub-resources

The guide lists no default sub‑resource (`N/A`), but valid sub‑resources at the user level mirror those exposed via the `users` collection, such as:
- `games`
- `leagues`
- `teams`

---

## Users Collection

### Description

The **Users** collection lets you retrieve information about one or more users. In almost all practical scenarios, you use it to access the **currently logged‑in user** via `use_login=1`.

Each `<user>` under `<users>` is a **User resource**.

### HTTP Operations

- Supported: `GET`

### URIs

Patterns relative to `/fantasy/v2`:

```text
/users;use_login=1/{sub_resource}
```

Or with expansions:

```text
/users;use_login=1;out={sub_resource_1},{sub_resource_2}
```

Example:

```text
GET /fantasy/v2/users;use_login=1/games;game_keys=nfl/teams
```

This returns, for the logged‑in user:
- A `users` collection.
- A single `user` element.
- Under that user, a `games` collection restricted to the specified game keys.
- For each game, a `teams` collection listing the teams owned by the user.

### Sub-resources

Any valid `user` sub‑resource can be used under `users`, commonly:
- `games` – games in which the user participates.
- `games/leagues` – leagues for those games.
- `games/teams` – teams for those games.

Because of the nested resource model, URIs naturally chain sub‑resources:

```text
/users;use_login=1/games
/users;use_login=1/games;game_keys=nfl/leagues
/users;use_login=1/games;game_keys=nfl/teams
```

`out` can be used to attach extra sub‑resources to these collections in a single call:

```text
/users;use_login=1/games;game_keys=nfl;out=leagues,teams
```

### Typical Usage Patterns

1. **Get all user games and leagues**

   ```text
   GET /fantasy/v2/users;use_login=1/games
   ```

   Then for each game:
   - `/games/{game_key}/leagues`

2. **Get all teams for the current user in a specific game**

   ```text
   GET /fantasy/v2/users;use_login=1/games;game_keys=nfl/teams
   ```

3. **Get all leagues and teams in a single call** using `out`:

   ```text
   GET /fantasy/v2/users;use_login=1/games;game_keys=nfl;out=leagues,teams
   ```

   The response will include, for each game, nested `leagues` and `teams` collections beneath that game.