# Yahoo Fantasy API Path Cheat Sheet

This cheat sheet summarizes the documented Yahoo Fantasy Sports API path patterns using the documentation in this repository as the source of truth.

Base path:

```text
/fantasy/v2
```

## Core Mental Model

Build every path in this order:

1. Pick a root scope.
2. Choose a resource or collection.
3. Add parameters to the segment they belong to.
4. Either descend to a child with `/child` or expand in place with `;out=...`.

Key rule:

```text
parameters apply to the immediately preceding segment
```

Example:

```text
/users;use_login=1/games;game_keys=nfl/teams
```

- `use_login=1` applies to `users`
- `game_keys=nfl` applies to `games`

## Path Grammar

```text
/{resource}/{key}
/{collection}
/{resource}/{key};param=value
/{collection};param=value
/{resource}/{key}/{sub_resource}
/{collection};{resource}_keys=k1,k2/{sub_resource}
/.../{collection}/{sub_resource}
/.../{collection}/{sub_resource}/{sub_resource}
/{resource}/{key};out=sub1,sub2
```

## Resources And Collections

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

## Common Root Entry Points

```text
/game/{game_key}
/league/{league_key}
/team/{team_key}
/player/{player_key}
/transaction/{transaction_key}
/users;use_login=1
/games
/leagues
```

## Resource Key Formats

| Resource | Format | Example |
| --- | --- | --- |
| Game | `{game_id}` or `{game_code}` | `423` or `nfl` |
| League | `{game_key}.l.{league_id}` | `423.l.12345` |
| Team | `{game_key}.l.{league_id}.t.{team_id}` | `423.l.12345.t.1` |
| Player | `{game_key}.p.{player_id}` | `423.p.8261` |
| Transaction | `{game_key}.l.{league_id}.tr.{id}` | `423.l.12345.tr.9` |
| Waiver claim | `{game_key}.l.{league_id}.w.c.{id}` | `423.l.12345.w.c.2_6390` |
| Pending trade | `{game_key}.l.{league_id}.pt.{id}` | `423.l.12345.pt.1` |

## Root Trees

```text
users
└─ games
   ├─ leagues
   └─ teams

game
├─ metadata
├─ leagues
├─ players
└─ game_weeks

games
├─ metadata
├─ leagues
│  ├─ settings
│  ├─ standings
│  ├─ scoreboard
│  ├─ teams
│  ├─ players
│  └─ transactions
└─ players

league
├─ metadata
├─ settings
├─ standings
├─ scoreboard
├─ teams
├─ players
└─ transactions

team
├─ metadata
├─ roster
│  └─ players
├─ matchups
└─ stats

teams
├─ metadata
├─ roster
│  └─ players
├─ matchups
└─ stats

players
├─ metadata
├─ stats
├─ ownership
└─ percent_owned

player
├─ metadata
├─ stats
├─ ownership
└─ percent_owned

transactions
└─ players

transaction
├─ metadata
└─ players

roster
└─ players
```

## Common Filters By Context

### Users

```text
;use_login=1
```

### Games

```text
;is_available=1
;game_types=full,pickem-team
;game_codes=nfl,mlb
;seasons=2025,2026
;game_keys=nfl,mlb
```

### Leagues

```text
;league_keys=423.l.12345,423.l.67890
;out=settings,standings,scoreboard
```

### Teams

```text
;team_keys=423.l.12345.t.1,423.l.12345.t.2
;out=roster,stats,matchups
```

### Players

```text
;player_keys=423.p.8261,423.p.9527
;position=QB
;status=FA
;search=mcdavid
;sort=PTS
;sort_type=season
;sort_season=2025
;sort_week=10
;sort_date=2026-04-22
;start=0
;count=25
```

### Time Filters

```text
;week=10
;weeks=1,5,10
;date=2026-04-22
;type=season
;type=week;week=10
;type=date;date=2026-04-22
```

### Transactions

```text
;transaction_keys=423.l.12345.tr.9,423.l.12345.tr.10
;type=add
;types=add,drop,trade
;team_key=423.l.12345.t.1
;start=0
;count=25
```

## Descend Vs Expand

Use `/child` when the child is the main thing you want.

```text
/league/423.l.12345/teams
```

Use `;out=` when the parent is still the main thing and you want one extra level attached.

```text
/league/423.l.12345;out=settings,standings
```

## Common Patterns

### User Discovery

```text
/users;use_login=1/games
/users;use_login=1/games;game_keys=nfl/leagues
/users;use_login=1/games;game_keys=nfl/leagues/teams
/users;use_login=1/games;game_keys=nfl/teams
/users;use_login=1/games;game_keys=nfl;out=leagues,teams
```

### Game Discovery

```text
/game/nfl
/game/nfl/players
/game/nfl/leagues
/game/nfl/leagues/teams
/game/nfl/leagues/players
/games;game_codes=nfl;seasons=2025/leagues
/games;game_codes=nfl;seasons=2025/leagues/teams
/game/nfl;out=players,game_weeks
/games;is_available=1
/games;game_codes=nfl,nhl;seasons=2025
```

### League Work

```text
/league/423.l.12345
/league/423.l.12345/settings
/league/423.l.12345/standings
/league/423.l.12345/scoreboard;week=10
/league/423.l.12345/teams
/league/423.l.12345/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster
/league/423.l.12345/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster/players
/league/423.l.12345/players;status=FA;position=QB;count=25
/league/423.l.12345/transactions;type=add;count=10
/league/423.l.12345;out=settings,standings
/leagues;league_keys=423.l.12345,423.l.67890
/leagues;league_keys=423.l.12345,423.l.67890/teams
/leagues;league_keys=423.l.12345,423.l.67890/players
/leagues;league_keys=423.l.12345,423.l.67890/transactions
```

### Team Work

```text
/team/423.l.12345.t.1
/team/423.l.12345.t.1/roster
/team/423.l.12345.t.1/roster;week=10/players
/team/423.l.12345.t.1/roster;date=2026-04-22/players
/team/423.l.12345.t.1/matchups;weeks=1,5
/team/423.l.12345.t.1/stats;type=season
/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2
/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster
/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster/players
/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/stats;type=season
```

### Player Work

```text
/player/423.p.8261
/player/423.p.8261/stats
/player/423.p.8261/ownership
/player/423.p.8261/percent_owned
/players;player_keys=423.p.8261,423.p.9527
/players;player_keys=423.p.8261,423.p.9527/stats
/players;player_keys=423.p.8261,423.p.9527;out=stats
/league/423.l.12345/players;player_keys=423.p.8261/stats
```

### Transactions

```text
/transaction/423.l.12345.tr.9
/transaction/423.l.12345.w.c.2_6390
/transaction/423.l.12345.pt.1
/league/423.l.12345/transactions
/league/423.l.12345/transactions;transaction_keys=423.l.12345.tr.9,423.l.12345.tr.10/players
/league/423.l.12345/transactions;type=waiver;team_key=423.l.12345.t.1
/league/423.l.12345/transactions;type=add,drop;count=25
```

## Multi-Hop Routes

Yahoo paths can chain multiple resource and collection hops, but they are not arbitrary. Each next segment must be a documented child of the segment before it.

Valid examples:

```text
/users;use_login=1/games/leagues
/users;use_login=1/games/leagues/teams
/games;game_codes=nfl/leagues
/games;game_codes=nfl/leagues/teams
/leagues;league_keys=423.l.12345,423.l.67890/teams/roster
/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster/players
```

Not the right shape:

```text
/games/league/teams
```

Why not:

- `games` is a collection, so the next segment should be a documented child collection such as `leagues` or `players`.
- `league` is the singular resource form, not the collection hop that follows `games`.
- The documented collection-to-collection chain is `games/leagues/teams`, not `games/league/teams`.

## Context Changes Meaning

The same noun can mean different things depending on the parent.

- `/game/nfl/players` means players in the game.
- `/league/{league_key}/players` means players in league context, including availability and scoring context.
- `/team/{team_key}/roster/players` means the players currently on that team.

## Fast Decision Rule

- Start at `users` if the question begins with “what does this logged-in user have?”
- Start at `game` or `games` if the question begins with “what exists for this sport or season?”
- Start at `league` if the question begins with “what is happening in this league?”
- Start at `team` if the question begins with “what is on this team?”
- Start at `player` if the question begins with “what do we know about this player?”
- Start at `transaction` if you already know the transaction key and need the details.
- Start at `teams`, `players`, or `transactions` when you already have multiple keys and want to fetch those objects in bulk.
