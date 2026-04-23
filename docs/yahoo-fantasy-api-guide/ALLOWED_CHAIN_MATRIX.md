# Yahoo Fantasy API Allowed Chain Matrix

This document is a documentation-first matrix for deciding which request-builder chains should be allowed.

It is intended to verify the stage graph in [src/types/request/schema.ts](/Users/jbru/Projects/yfs-api/src/types/request/schema.ts) against the Yahoo Fantasy API docs collected in this repository.

Base path:

```text
/fantasy/v2
```

## How To Read This Matrix

There are two levels of confidence:

- `explicit`: the child segment is directly documented in the resource or collection docs.
- `composed`: the child is not shown as a standalone example for that exact parent path, but follows from a documented collection/resource rule. Example: if `leagues` supports `teams`, then `games/leagues/teams` is a composed chain once `games/leagues` is accepted.

For builder typing, this gives you a clean rule:

- Use `explicit` edges for hard guarantees.
- Use `composed` edges only if you intentionally want the builder to model Yahoo's compositional URI semantics beyond the most conservative reading of the docs.

## Canonical Node Set

Documented resources:

```text
game
league
player
team
roster
transaction
```

Documented collections:

```text
games
leagues
players
teams
transactions
users
```

Important scope note:

- `transactions` is a documented collection node, but the docs in this repo place it under league scope: `/league/{league_key}/transactions`.
- `roster` is a documented resource node, but only as a child of `team` or `teams`.

## Top-Level Entry Points

| Entry Point | Kind | Confidence | Current Schema Support |
| --- | --- | --- | --- |
| `/game/{game_key}` | resource | explicit | yes |
| `/league/{league_key}` | resource | explicit | yes |
| `/team/{team_key}` | resource | explicit | yes |
| `/player/{player_key}` | resource | explicit | yes |
| `/transaction/{transaction_key}` | resource | explicit | yes |
| `/users;use_login=1` | collection | explicit | yes |
| `/games` | collection | explicit | yes |
| `/leagues` | collection | explicit | yes |
| `/teams;team_keys={t1},{t2}` | collection | explicit | no |
| `/players;player_keys={p1},{p2}` | collection | explicit | no |

## Allowed Chain Matrix

| Node | Canonical Path Shape | Kind | Allowed Next Segments | Confidence | Current Schema Support |
| --- | --- | --- | --- | --- | --- |
| `root` | `/fantasy/v2` | pseudo-root | `game`, `league`, `team`, `player`, `transaction`, `users`, `games`, `leagues`, `teams`, `players` | explicit | partial |
| `users` | `/users;use_login=1` | collection | `games`, `leagues`, `teams` | explicit | yes |
| `users.games` | `/users;use_login=1/games` | collection | `leagues`, `teams` | explicit | yes |
| `users.leagues` | `/users;use_login=1/leagues` | collection | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | composed | partial |
| `users.teams` | `/users;use_login=1/teams` | collection | `roster`, `matchups`, `stats` | composed | partial |
| `users.games.leagues` | `/users;use_login=1/games/leagues` | collection | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | composed | no |
| `users.games.teams` | `/users;use_login=1/games/teams` | collection | `roster`, `matchups`, `stats` | composed | no |
| `game` | `/game/{game_key}` | resource | `leagues`, `players`, `game_weeks` | explicit | yes |
| `games` | `/games` | collection | `metadata`, `leagues`, `players` | explicit | no |
| `games` | `/games` | collection | `game_weeks` | composed | no |
| `league` | `/league/{league_key}` | resource | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | explicit | yes |
| `leagues` | `/leagues;league_keys={l1},{l2}` | collection | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | explicit | partial |
| `game.leagues` | `/game/{game_key}/leagues` | collection | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | composed | no |
| `team` | `/team/{team_key}` | resource | `roster`, `matchups`, `stats` | explicit | yes |
| `teams` | `/teams;team_keys={t1},{t2}` | collection | `roster`, `matchups`, `stats` | explicit | no |
| `league.teams` | `/league/{league_key}/teams` | collection | `roster`, `matchups`, `stats` | composed | no |
| `roster` | `/team/{team_key}/roster` | resource | `players` | explicit | yes |
| `teams.roster` | `/teams;team_keys={t1},{t2}/roster` | resource collection view | `players` | explicit | no |
| `player` | `/player/{player_key}` | resource | `stats`, `ownership`, `percent_owned` | explicit | partial |
| `players` | `/players;player_keys={p1},{p2}` | collection | `stats` | explicit | no |
| `players` | `/players;player_keys={p1},{p2}` | collection | `ownership`, `percent_owned` | composed | no |
| `league.players` | `/league/{league_key}/players` | collection | `stats` | explicit | partial |
| `league.players` | `/league/{league_key}/players` | collection | `ownership`, `percent_owned` | composed | no |
| `transactions` | `/league/{league_key}/transactions` | collection | `players` | explicit | partial |
| `transaction` | `/transaction/{transaction_key}` | resource | `players` | explicit | no |

## Parameter And `out` Matrix

This section matters because chainability and parameter legality are coupled in the builder.

| Node | Documented Params / Filters | Documented `out` Values | Current Schema Status |
| --- | --- | --- | --- |
| `users` | `use_login` | none clearly documented at users level | matches conservative docs |
| `users.games` | `game_keys`, `is_available`, `game_types`, `game_codes`, `seasons` | `leagues`, `teams` | schema missing `out` |
| `game` | `out` | `leagues`, `players`, `game_weeks` | schema mismatch |
| `games` | `game_keys`, `is_available`, `game_types`, `game_codes`, `seasons`, `out` | `leagues`, `players` | schema mismatch |
| `league` | `out` | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | schema mismatch |
| `leagues` | `league_keys`, `out` | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | schema mismatch |
| `team` | `out` | `roster`, `matchups`, `stats` | schema includes extra `standings` |
| `teams` | `team_keys`, `out` | `roster`, `matchups`, `stats` | missing stage |
| `roster` | `week`, `date` | none | matches |
| `player` | `out` | `stats`, `ownership`, `percent_owned` | schema includes extra `draft_analysis` |
| `players` | `player_keys`, `position`, `status`, `search`, `sort`, `sort_type`, `sort_season`, `sort_week`, `sort_date`, `start`, `count`, `out` | at least `stats`; ownership-style outs are composed from player sub-resources | missing stage |
| `transactions` | `transaction_keys`, `type`, `types`, `team_key`, `count`, `out` | `players` | schema missing `transaction_keys` and `out` |

## Safe Explicit Chains

These are the lowest-risk chains to model because they are directly documented.

```text
/users;use_login=1/games
/users;use_login=1/games/leagues
/users;use_login=1/games/teams
/game/{game_key}/leagues
/game/{game_key}/players
/game/{game_key}/game_weeks
/games/leagues
/games/players
/league/{league_key}/settings
/league/{league_key}/standings
/league/{league_key}/scoreboard
/league/{league_key}/teams
/league/{league_key}/players
/league/{league_key}/transactions
/leagues/settings
/leagues/standings
/leagues/scoreboard
/leagues/teams
/leagues/players
/leagues/transactions
/team/{team_key}/roster
/team/{team_key}/matchups
/team/{team_key}/stats
/team/{team_key}/roster/players
/teams/roster
/teams/matchups
/teams/stats
/teams/roster/players
/player/{player_key}/stats
/player/{player_key}/ownership
/player/{player_key}/percent_owned
/players/stats
/league/{league_key}/transactions/players
```

## Composed Chains

These follow the documented collection semantics, but are not always shown as standalone examples.

```text
/users;use_login=1/games/leagues/teams
/users;use_login=1/games/leagues/players
/game/{game_key}/leagues/teams
/game/{game_key}/leagues/players
/game/{game_key}/leagues/transactions
/games/leagues/teams
/games/leagues/players
/games/leagues/transactions
/leagues/teams/roster
/leagues/teams/roster/players
/league/{league_key}/teams/roster
/league/{league_key}/teams/roster/players
```

If you want a strict builder, do not allow composed chains unless there is a confirming live request or an explicit Yahoo example.

If you want a compositional builder, these chains should be modeled as valid whenever each intermediate node is a documented collection and the next segment is a documented child of that collection.

## Schema Comparison Summary

These are the main gaps between the current [src/types/request/schema.ts](/Users/jbru/Projects/yfs-api/src/types/request/schema.ts) and the documentation-derived matrix.

1. Root entry points are incomplete.

- Missing `teams` collection root.
- Missing `players` collection root.

2. Collection navigation is substantially under-modeled.

- `games` has no `next` stages, but the docs support at least `leagues` and `players` directly under `games`.
- `leagues` only allows `teams` in the schema, but the docs support `settings`, `standings`, `scoreboard`, `teams`, `players`, and `transactions`.
- `users.games.leagues` and `users.games.teams` have no `next` stages in the schema, so deeper composed chains are impossible.
- `league.teams` has no `next` stage to `roster`, even though the docs support team sub-resources on team collections.

3. Entire collection stages are missing.

- No `teams` stage.
- No `players` stage.
- No dedicated `transactions` collection stage.

4. `out` modeling is inconsistent with the docs.

- `gameOutValues` in schema is currently `stat_categories`, `position_types`, `game_weeks`, but the docs clearly show `;out=leagues,players` at game and games scope.
- `leagueOutValues` in schema is currently `settings`, `standings`, `scoreboard`, `drafts`, but the docs support league-level `teams`, `players`, and `transactions` as collection children and `out` candidates.
- `teamOutValues` includes `standings`, which is not clearly documented in the repo docs for `team` or `teams`.
- `playerOutValues` includes `draft_analysis`, which is not documented in the repo docs.

5. Transaction collection parameters are incomplete.

- The docs support `transaction_keys` and `out` on transaction collections.
- `league.transactions` in schema currently only models `type`, `types`, `team_key`, `count`, and `start`.

## Practical Recommendation For Builder Typing

If the goal is to type the builder accurately without overcommitting:

1. Split the graph into `explicit` and `composed` edges.
2. Type only `explicit` edges in the public builder surface first.
3. Add composed edges behind tests that prove live Yahoo acceptance.
4. Treat undocumented schema extras such as `draft_analysis`, `drafts`, and `team.standings` as provisional until validated.

That gives you a stable typing model while still leaving room to extend the graph once real API behavior is confirmed.