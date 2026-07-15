# Yahoo Fantasy Sports API Guide

This is a concise companion to Yahoo's live [Fantasy Sports API documentation](https://sports.yahoo.com/developer/docs/). It corrects ambiguities with live API evidence collected in this repository.

Reviewed: **2026-07-15**

## Evidence Labels

- **Official**: stated or exemplified by Yahoo's live documentation.
- **Observed-only**: live behavior exists without matching current documentation.
- **Documented/runtime discrepancy**: current Yahoo documentation and a reproducible live result disagree.
- **Fixture-unavailable**: route not tested because a required league or team key is missing for that sport.
- **Historical-private**: passed in a prior session with private credentials, not refreshed in the current evidence baseline.

## Entry Points

- [Path cheat sheet](PATH_CHEAT_SHEET.md) — common, safe request shapes.
- [Path reference](PATH_REFERENCE_TABLE.md) — resources, children, and filters.
- [Decision tree](PATH_DECISION_TREE.md) — choose a root from the question you are asking.
- [Allowed chain matrix](ALLOWED_CHAIN_MATRIX.md) — official versus live-validated path evidence.
- [Audit log](AUDIT.md) — what this review added, removed, or retained despite gaps in Yahoo's docs.

Resource detail pages:

- [Games](resources/GAMES.md)
- [Leagues](resources/LEAGUES.md)
- [Teams and rosters](resources/TEAMS_ROSTERS.md)
- [Players](resources/PLAYERS.md)
- [Transactions](resources/TRANSACTIONS.md)
- [Users](resources/USERS.md)

## Authentication

Yahoo's current documentation requires **OAuth 2.0** and recommends the Authorization Code flow for user-delegated access. Keep the client secret and refresh tokens server-side. See [OAUTH2_IMPLEMENTATION.md](../OAUTH2_IMPLEMENTATION.md) for SDK details.

Gap note: Yahoo still publishes public-request samples and the API accepts signed OAuth 1.0 requests. That is useful compatibility behavior, but OAuth 2.0 is the only version the current Fantasy Sports page declares required.

## Endpoint And Formats

Base URL: `https://fantasysports.yahooapis.com/fantasy/v2`

- XML is the default response format and the format used in Yahoo's examples.
- `?format=json` is observed-only; the current guide does not explain it.
- Write requests use XML bodies regardless of response format.

## Mental Model

The API consists of singular **resources**, plural **collections**, and nested **sub-resources**.

```text
/fantasy/v2/{resource}/{resource_key}
/fantasy/v2/{collection};{resource}_keys={key1},{key2}
/fantasy/v2/{resource}/{resource_key}/{sub_resource}
```

Parameters are semicolon-delimited and apply to the segment immediately before them. Use `/child` for a focused result. Use `;out=child1,child2` when the parent remains the result and you want one extra level attached.

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

A game code such as `nfl` resolves to the current game; Yahoo returns numeric game IDs in response keys.

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
| `users;use_login=1` | `games`, `teams`; league discovery through `games/leagues` | GET |

## Known Documentation Traps

- `/users;use_login=1/leagues` is **unsupported** (`subresource leagues not supported`).
- Game-to-league requests should include `league_keys`; unfiltered routes can return `league ids expected`.
- `games;game_codes=...;out=leagues,players` is a **documented/runtime discrepancy** — Yahoo's generic `out` rule says it should work, but live four-sport testing returned `league ids expected` for every sport.
- Game-context player `search` is **observed-only** — not in Yahoo's current filter table.
- The league transaction collection read passed on the NHL public fixture. Direct transaction-key routes are official but not current; no cross-sport transaction keys exist.
- League `draftresults` passed for a current NHL public league; other sports are fixture-unavailable.
- `league/scoreboard` with no `week` parameter defaulted to the current week in the NHL public run.
- Yahoo's current page contains stale sample seasons and a few malformed links or payload typos.
- Collection inheritance is imperfect: a child valid on a resource is not proof that every deeply composed collection path works without required key filters.
