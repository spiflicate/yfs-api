# Yahoo Fantasy API Path Cheat Sheet

Base path: `https://fantasysports.yahooapis.com/fantasy/v2`

Examples use placeholders so they do not become stale. Badges indicate evidence scope:

- **4S**: passed on all four sports (NFL, MLB, NBA, NHL)
- **NHL**: passed on current NHL fixture only
- **HP**: historical-private (not refreshed in current baseline)
- **OBS**: observed-only (live behavior without current docs)
- **DRD**: documented/runtime discrepancy
- **DOC**: documented by Yahoo, not exercised by the current route suite

Current badges derive from `research/api-path-validation/actionable-route-report.md`, run `2026-07-15T19-33-25-809Z`.

## Discovery

```text
/games;game_codes={code};is_available=1                        # 4S
/games;game_codes={code};seasons={season}                      # 4S
/game/{game_key}                                                # 4S
/users;use_login=1/games                                        # HP
/users;use_login=1/games;game_keys={game_key}/leagues           # HP
/users;use_login=1/games;game_keys={game_key}/teams             # HP
/users;use_login=1/teams                                         # HP
```

Do not use `/users;use_login=1/leagues`; Yahoo rejects that direct child.

## Games

```text
/game/{game_key}/players;search={name};count=5                  # OBS (passed 4S)
/game/{game_key}/leagues;league_keys={league_key}               # NHL
/game/{game_key}/dates                                           # 4S
/game/{game_key}/game_weeks                                      # 4S
/game/{game_key}/stat_categories                                 # 4S
/game/{game_key}/position_types                                  # 4S
/game/{game_key}/roster_positions                                # 4S
/game/{game_key};out=stat_categories,position_types,game_weeks   # 4S
```

Collection:

```text
/games;game_keys={game_key}                                     # 4S
/game/{game_key}/leagues;league_keys={league_key}/teams         # NHL
```

Always filter a game-scoped `leagues` segment by `league_keys`.

## Leagues

```text
/league/{league_key}                                              # NHL
/league/{league_key}/settings                                     # NHL
/league/{league_key}/standings                                    # NHL
/league/{league_key}/scoreboard;week={week}                       # NHL
/league/{league_key}/teams                                        # NHL
/league/{league_key}/players;status=FA;position=QB;count=25       # DOC
/league/{league_key}/draftresults                                 # NHL
/league/{league_key}/transactions;count=5                         # NHL
/league/{league_key};out=settings,standings,scoreboard            # DOC
```

Multiple leagues:

```text
/leagues;league_keys={league_key}                                 # NHL
/leagues;league_keys={league_key}/teams                           # NHL
/leagues;league_keys={league_key1},{league_key2}/players;search={name}  # DOC
/leagues;league_keys={league_key1},{league_key2}/transactions;count=25  # DOC
```

League/team evidence is from a single NHL public league. NFL/MLB/NBA league routes are fixture-unavailable.

## Teams And Rosters

```text
/team/{team_key}                                                  # HP
/team/{team_key}/standings                                        # HP
/team/{team_key}/stats;type=season                                # HP
/team/{team_key}/stats;type=week;week={week}                      # HP (NFL)
/team/{team_key}/stats;type=date;date={yyyy-mm-dd}                # HP (MLB/NBA/NHL)
/team/{team_key}/matchups;weeks={week1},{week2}                   # HP
/team/{team_key}/draftresults                                     # HP
/team/{team_key}/roster;week={week}                               # HP
/team/{team_key}/roster;date={yyyy-mm-dd}                         # HP
/team/{team_key}/roster;week={week}/players                       # HP
/team/{team_key}/players                                          # NHL
```

Multiple teams:

```text
/teams;team_keys={team_key1},{team_key2}                          # NHL
/teams;team_keys={team_key1},{team_key2}/roster;week={week}/players  # HP
/teams;team_keys={team_key1},{team_key2}/stats;type=season        # HP
```

## Players

```text
/player/{player_key}                                              # HP
/player/{player_key}/stats;type=season                            # HP
/player/{player_key}/percent_owned                                # HP
/player/{player_key}/draft_analysis                               # HP
/players;player_keys={player_key1},{player_key2}                  # 4S
/players;player_keys={player_key1},{player_key2}/stats            # DOC
/league/{league_key}/players;player_keys={player_key}/ownership   # HP
```

## Transactions

```text
/league/{league_key}/transactions                                  # NHL
/league/{league_key}/transactions;type=add;count=25                # DOC
/league/{league_key}/transactions;types=waiver,pending_trade;team_key={team_key}  # official, not in suite
/transactions;transaction_keys={transaction_key1},{transaction_key2}  # official, not in suite
/transaction/{transaction_key}                                      # official, not in suite
/transaction/{transaction_key}/players                              # official, not in suite
```

Methods: POST to create, PUT to modify, DELETE to cancel. Write bodies are XML.

## Parameters And `out`

Parameters belong to the immediately preceding segment. Use a child path for a focused result. Use `out` for one unfiltered expansion level. Do not add parameters or descendants to an `out` branch.

```text
/league/{league_key};out=settings/teams;team_keys={team_key1},{team_key2}
```

## Response Format

```text
GET {path}                 # XML, default
GET {path}?format=json     # JSON, observed-only
```

Yahoo documents XML request bodies for mutations even when JSON is requested for responses.
