# Yahoo Fantasy Sports API Guide

This is a concise companion to Yahoo's live [Fantasy Sports API documentation](https://sports.yahoo.com/developer/docs/). It corrects ambiguities with live API evidence collected in this repository.

Reviewed: **2026-07-15**

## Evidence Labels

- **Official**: stated or exemplified by Yahoo's live documentation.
- **Validated**: confirmed by a successful live request recorded in this repository.
- **Provisional**: observed in limited testing or contradicted by other evidence; do not build a stable interface around it yet.
- **Unsupported**: Yahoo rejected the route shape directly.

Yahoo's documentation describes broad composition rules, but not every syntactically composable path works. Prefer routes in [PATH_CHEAT_SHEET.md](PATH_CHEAT_SHEET.md), which accounts for live validation.

## Start Here

- [Path cheat sheet](PATH_CHEAT_SHEET.md): common, safe request shapes.
- [Path reference](PATH_REFERENCE_TABLE.md): resources, children, and filters.
- [Decision tree](PATH_DECISION_TREE.md): choose a root from the question you are asking.
- [Allowed chain matrix](ALLOWED_CHAIN_MATRIX.md): official versus live-validated path evidence.
- [Audit log](AUDIT.md): what this review added, removed, or retained despite gaps in Yahoo's docs.

Resource details:

- [Games](resources/GAMES.md)
- [Leagues](resources/LEAGUES.md)
- [Teams and rosters](resources/TEAMS_ROSTERS.md)
- [Players](resources/PLAYERS.md)
- [Transactions](resources/TRANSACTIONS.md)
- [Users](resources/USERS.md)

## Authentication

Yahoo's current documentation requires **OAuth 2.0** and recommends the Authorization Code flow for user-delegated access.

1. [Register an application](https://developer.yahoo.com/apps/create/).
2. Select Fantasy Sports and either Read or Read/Write access.
3. Send the user through Yahoo's [OAuth 2.0 Authorization Code flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/).
4. Send the access token as a bearer token and refresh it when needed.

Keep the client secret and refresh tokens server-side. Private league, team, and user data requires authorization from an eligible user.

Gap note: Yahoo still publishes a public-request sample and the API accepts signed public requests used by this repository's OAuth 1.0 integration. That is useful compatibility behavior, but OAuth 2.0 is the only version the current Fantasy Sports page declares required.

## Endpoint And Formats

Base URL:

```text
https://fantasysports.yahooapis.com/fantasy/v2
```

- XML is the default response format and the format used in Yahoo's examples.
- `?format=json` is supported by this repository's format research and returns Yahoo's alternate JSON representation, although the current guide does not explain it. It is not part of the static route-validation suite.
- Write requests use XML bodies.
- Yahoo's JSON mirrors its XML hierarchy; it is not a conventional flat REST shape.

## Mental Model

The API consists of singular **resources**, plural **collections**, and nested **sub-resources**.

```text
/fantasy/v2/{resource}/{resource_key}
/fantasy/v2/{collection};{resource}_keys={key1},{key2}
/fantasy/v2/{resource}/{resource_key}/{sub_resource}
```

Parameters are semicolon-delimited and apply to the segment immediately before them:

```text
/users;use_login=1/games;game_keys=nfl/teams
```

Use `/child` when the child is the requested result. Use `;out=child1,child2` when the parent remains the result and you want one extra level attached. Yahoo does not allow parameters or further chaining on an `out` branch.

## Keys

| Resource | Format | Example |
| --- | --- | --- |
| Game | `{game_id}` or current-season `{game_code}` | `461`, `nfl` |
| League | `{game_key}.l.{league_id}` | `461.l.1000` |
| Team | `{game_key}.l.{league_id}.t.{team_id}` | `461.l.1000.t.1` |
| Player | `{game_key}.p.{player_id}` | `461.p.30121` |
| Completed transaction | `{game_key}.l.{league_id}.tr.{id}` | `461.l.1000.tr.26` |
| Waiver claim | `{game_key}.l.{league_id}.w.c.{id}` | `461.l.1000.w.c.2_6461` |
| Pending trade | `{game_key}.l.{league_id}.pt.{id}` | `461.l.1000.pt.1` |

A game code such as `nfl` resolves to the current game and Yahoo returns numeric game IDs in response keys. Use a numeric game ID when season stability matters.

## Resource Surface

| Resource | Main children | Methods |
| --- | --- | --- |
| `game` | `leagues`, `players`, `dates`, `game_weeks`, `stat_categories`, `position_types`, `roster_positions` | GET |
| `league` | `settings`, `standings`, `scoreboard`, `teams`, `players`, `draftresults`, `transactions` | GET |
| `team` | `stats`, `standings`, `roster`, `draftresults`, `matchups` | GET |
| `roster` | `players` | GET, PUT |
| `player` | `stats`, `ownership`, `percent_owned`, `draft_analysis` | GET |
| `transaction` | `players` | GET, PUT, DELETE |
| `league/.../transactions` | transaction resources | GET, POST |
| `users;use_login=1` | `games`, `teams`; league discovery is through `games/leagues` | GET |

## Important Context Rules

- League scoring settings determine the meaning of player and team points.
- `ownership` needs league context to identify an owning team, waivers, or free agency.
- NFL coverage is commonly weekly; MLB, NBA, and NHL commonly use dates.
- Private data is visible only when the authorized user has access.
- Pending waivers and trades do not appear in an unfiltered completed transaction feed. Filter by `team_key` and `type` or `types`.
- Collection inheritance is imperfect in practice. A child valid on a resource is not proof that every deeply composed collection path works without required key filters.

## Known Documentation Traps

- `/users;use_login=1/leagues` is **unsupported**. Use `/users;use_login=1/games/leagues`.
- Game-to-league requests should include `league_keys`; Yahoo otherwise may return `league ids expected`.
- `games;...;out=leagues` remains **provisional** after repeated failures, despite Yahoo's generic `out` rule.
- Direct transaction routes are official, but this repository has not recently validated them with a current concrete transaction key.
- Yahoo's current page contains stale sample seasons and a few malformed links or payload typos. Treat the endpoint tables as contracts, not every literal sample value.
