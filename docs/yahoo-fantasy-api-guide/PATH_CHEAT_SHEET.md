# Yahoo Fantasy API Path Cheat Sheet

Base path: `https://fantasysports.yahooapis.com/fantasy/v2`

Examples use placeholders so they do not become stale. Unless marked otherwise, these shapes are official and/or live-validated.

## Discovery

```text
/games;is_available=1
/games;game_codes=nfl;seasons={season}
/game/{game_key}
/users;use_login=1/games
/users;use_login=1/games;game_keys={game_key}/leagues
/users;use_login=1/games;game_keys={game_key}/teams
/users;use_login=1/teams
```

Do not use `/users;use_login=1/leagues`; Yahoo rejects that direct child. Go through `games`.

## Games

```text
/game/{game_key}/players;search={name};count=25
/game/{game_key}/leagues;league_keys={league_key}
/game/{game_key}/dates
/game/{game_key}/game_weeks
/game/{game_key}/stat_categories
/game/{game_key}/position_types
/game/{game_key}/roster_positions
/game/{game_key};out=players,game_weeks
```

For a collection:

```text
/games;game_keys={game_key1},{game_key2}
/games;game_keys={game_key}/players;search={name};count=25
/games;game_codes={code};seasons={season}/leagues;league_keys={league_key}/teams
```

Always filter a game-scoped `leagues` segment by `league_keys` unless you have separately validated the unfiltered form.

## Leagues

```text
/league/{league_key}
/league/{league_key}/settings
/league/{league_key}/standings
/league/{league_key}/scoreboard;week={week}
/league/{league_key}/teams
/league/{league_key}/players;status=FA;position=QB;count=25
/league/{league_key}/draftresults
/league/{league_key}/transactions;count=25
/league/{league_key};out=settings,standings,scoreboard
```

Multiple leagues:

```text
/leagues;league_keys={league_key1},{league_key2}
/leagues;league_keys={league_key1},{league_key2}/teams
/leagues;league_keys={league_key1},{league_key2}/players;search={name}
/leagues;league_keys={league_key1},{league_key2}/transactions;count=25
```

## Teams And Rosters

```text
/team/{team_key}
/team/{team_key}/standings
/team/{team_key}/stats;type=season
/team/{team_key}/stats;type=week;week={week}            # NFL
/team/{team_key}/stats;type=date;date={yyyy-mm-dd}     # MLB/NBA/NHL
/team/{team_key}/matchups;weeks={week1},{week2}
/team/{team_key}/draftresults
/team/{team_key}/roster;week={week}
/team/{team_key}/roster;date={yyyy-mm-dd}
/team/{team_key}/roster;week={week}/players
```

Multiple teams:

```text
/teams;team_keys={team_key1},{team_key2}
/teams;team_keys={team_key1},{team_key2}/roster;week={week}/players
/teams;team_keys={team_key1},{team_key2}/stats;type=season
```

Yahoo says a team has one requested roster at a time, not a roster collection. Live requests confirm roster traversal under a filtered teams collection.

## Players

```text
/player/{player_key}
/player/{player_key}/stats;type=season
/player/{player_key}/percent_owned
/player/{player_key}/draft_analysis
/players;player_keys={player_key1},{player_key2}
/players;player_keys={player_key1},{player_key2}/stats
/league/{league_key}/players;player_keys={player_key}/ownership
```

League-context filters:

```text
;position=QB
;status=A|FA|W|T|K
;search={name}
;sort={stat_id}|NAME|OR|AR|PTS
;sort_type=season|week|date|lastweek|lastmonth
;sort_season={year}
;sort_week={week}
;sort_date={yyyy-mm-dd}
;start=0
;count=25
```

`ownership` is meaningful in league context. `percent_owned` is game-wide ownership prevalence.

## Transactions

```text
/league/{league_key}/transactions
/league/{league_key}/transactions;type=add;count=25
/league/{league_key}/transactions;types=waiver,pending_trade;team_key={team_key}
/transactions;transaction_keys={transaction_key1},{transaction_key2}
/transaction/{transaction_key}
/transaction/{transaction_key}/players
```

Methods:

- `POST /league/{league_key}/transactions`: add, drop, add/drop, or propose a trade.
- `PUT /transaction/{transaction_key}`: edit a waiver claim or act on a pending trade.
- `DELETE /transaction/{transaction_key}`: cancel an eligible pending waiver or trade.
- Write bodies are XML.

## Parameters And `out`

Parameters belong to the immediately preceding segment:

```text
/users;use_login=1/games;game_keys=nfl/teams
```

Use a child path for a focused result:

```text
/league/{league_key}/teams
```

Use `out` for one unfiltered expansion level:

```text
/league/{league_key};out=settings,standings
```

Do not add parameters or descendants to an `out` branch. Continue the main path instead:

```text
/league/{league_key};out=settings/teams;team_keys={team_key1},{team_key2}
```

## Response Format

```text
GET {path}                 # XML, default
GET {path}?format=json     # JSON, live-observed
```

Yahoo documents XML request bodies for mutations even when JSON is requested for responses.
