# Yahoo Fantasy API Path Decision Tree

Use this guide to choose the correct Yahoo Fantasy API root path based on the question you are trying to answer.

Base path:

```text
/fantasy/v2
```

## Decision Tree

```text
What are you trying to learn?
├─ Do you already have a list of keys for one object type?
│  ├─ Many games? → /games;game_keys={g1},{g2}
│  ├─ Many leagues? → /leagues;league_keys={l1},{l2}
│  ├─ Many teams? → /teams;team_keys={t1},{t2}
│  ├─ Many players? → /players;player_keys={p1},{p2}
│  └─ Many transactions in one league? → /league/{league_key}/transactions;transaction_keys={tr1},{tr2}
├─ What does the logged-in user participate in?
│  └─ Start at /users;use_login=1
│     ├─ Which games? → /users;use_login=1/games
│     ├─ Which leagues in a game? → /users;use_login=1/games;game_keys={game_key}/leagues
│     ├─ Which teams in a game? → /users;use_login=1/games;game_keys={game_key}/teams
│     ├─ Which teams in those leagues? → /users;use_login=1/games;game_keys={game_key}/leagues/teams
│     └─ Want leagues and teams together? → /users;use_login=1/games;game_keys={game_key};out=leagues,teams
├─ What exists for a sport or season?
│  ├─ One game or current sport season? → /game/{game_key}
│  ├─ Many games? → /games
│  ├─ Players in that game? → /game/{game_key}/players
│  ├─ Leagues in that game? → /game/{game_key}/leagues
│  ├─ Teams across those leagues? → /game/{game_key}/leagues/teams
│  ├─ Players across those leagues? → /game/{game_key}/leagues/players
│  └─ Schedule or week structure? → /game/{game_key}/game_weeks
├─ What is happening in a specific league?
│  └─ Start at /league/{league_key}
│     ├─ Basic metadata? → /league/{league_key}
│     ├─ Settings? → /league/{league_key}/settings
│     ├─ Standings? → /league/{league_key}/standings
│     ├─ Scoreboard for a week? → /league/{league_key}/scoreboard;week={week}
│     ├─ Teams? → /league/{league_key}/teams
│     ├─ Rosters for selected teams? → /league/{league_key}/teams;team_keys={t1},{t2}/roster
│     ├─ Roster players for selected teams? → /league/{league_key}/teams;team_keys={t1},{t2}/roster/players
│     ├─ Players in league context? → /league/{league_key}/players
│     ├─ Available players? → /league/{league_key}/players;status=FA
│     ├─ Search players? → /league/{league_key}/players;search={name}
│     └─ Transactions? → /league/{league_key}/transactions
├─ What is on or about a specific team?
│  └─ Start at /team/{team_key}
│     ├─ Basic metadata? → /team/{team_key}
│     ├─ Roster now? → /team/{team_key}/roster
│     ├─ Roster players for a week? → /team/{team_key}/roster;week={week}/players
│     ├─ Roster players for a date? → /team/{team_key}/roster;date={yyyy-mm-dd}/players
│     ├─ Matchups? → /team/{team_key}/matchups;weeks={w1},{w2}
│     └─ Stats? → /team/{team_key}/stats;type=season
├─ What do I know about a specific player?
│  └─ Start at /player/{player_key}
│     ├─ Basic metadata? → /player/{player_key}
│     ├─ Stats? → /player/{player_key}/stats
│     ├─ Ownership? → /player/{player_key}/ownership
│     └─ Percent owned? → /player/{player_key}/percent_owned
├─ What do I know about multiple teams, players, or leagues at once?
│  ├─ Teams by key? → /teams;team_keys={t1},{t2}
│  ├─ Team rosters by key? → /teams;team_keys={t1},{t2}/roster
│  ├─ Team roster players by key? → /teams;team_keys={t1},{t2}/roster/players
│  ├─ Players by key? → /players;player_keys={p1},{p2}
│  ├─ Player stats by key? → /players;player_keys={p1},{p2}/stats
│  ├─ Leagues by key? → /leagues;league_keys={l1},{l2}
│  └─ League teams by key? → /leagues;league_keys={l1},{l2}/teams
└─ What do I know about a specific transaction?
   └─ Start at /transaction/{transaction_key}
      ├─ Transaction details? → /transaction/{transaction_key}
      └─ Involved players? → returned under the transaction resource
```

## Resources And Collections

Documented resources:

```text
game, league, player, team, roster, transaction
```

Documented collections:

```text
games, leagues, players, teams, transactions, users
```

## Question-To-Path Patterns

### 1. Discovery questions

Use these when you do not know league keys or team keys yet.

| Question | Start Here | Example |
| --- | --- | --- |
| Which games does this user play? | `/users;use_login=1/games` | `/users;use_login=1/games` |
| Which leagues does this user have in NFL? | `/users;use_login=1/games;game_keys=nfl/leagues` | `/users;use_login=1/games;game_keys=nfl/leagues` |
| Which teams does this user have in NHL? | `/users;use_login=1/games;game_keys=nhl/teams` | `/users;use_login=1/games;game_keys=nhl/teams` |
| Which games are currently available? | `/games;is_available=1` | `/games;is_available=1` |
| Which leagues exist in selected games? | `/games;game_keys=nfl,nhl/leagues` | `/games;game_keys=nfl,nhl/leagues` |
| Which teams exist in those leagues? | `/games;game_keys=nfl/leagues/teams` | `/games;game_keys=nfl/leagues/teams` |

### 2. League questions

Use these once you know the league key.

| Question | Path Pattern |
| --- | --- |
| What is this league? | `/league/{league_key}` |
| What are this league's rules? | `/league/{league_key}/settings` |
| What are this league's standings? | `/league/{league_key}/standings` |
| What is this week's scoreboard? | `/league/{league_key}/scoreboard;week={week}` |
| Which teams are in this league? | `/league/{league_key}/teams` |
| Which players are available? | `/league/{league_key}/players;status=FA` |
| Which quarterbacks are available? | `/league/{league_key}/players;status=FA;position=QB` |
| What transactions happened recently? | `/league/{league_key}/transactions;count=25` |
| Which teams are in selected leagues? | `/leagues;league_keys={l1},{l2}/teams` |
| Which players are in selected leagues? | `/leagues;league_keys={l1},{l2}/players` |

### 3. Team questions

Use these when you know the team key.

| Question | Path Pattern |
| --- | --- |
| What is this team? | `/team/{team_key}` |
| What is its roster? | `/team/{team_key}/roster` |
| Who is on the roster this week? | `/team/{team_key}/roster;week={week}/players` |
| Who is on the roster on a date? | `/team/{team_key}/roster;date={yyyy-mm-dd}/players` |
| What are the matchups? | `/team/{team_key}/matchups;weeks={w1},{w2}` |
| What are the stats? | `/team/{team_key}/stats;type=season` |
| What are rosters for selected teams? | `/teams;team_keys={t1},{t2}/roster` |
| Who is on selected team rosters? | `/teams;team_keys={t1},{t2}/roster/players` |

### 4. Player questions

Use these when you already know the player key.

| Question | Path Pattern |
| --- | --- |
| Who is this player? | `/player/{player_key}` |
| What are this player's stats? | `/player/{player_key}/stats` |
| Who owns this player? | `/player/{player_key}/ownership` |
| How widely owned is this player? | `/player/{player_key}/percent_owned` |
| Show multiple players by key | `/players;player_keys={p1},{p2}` |
| Show stats for multiple players | `/players;player_keys={p1},{p2}/stats` |

### 5. Transaction questions

Use these when you know the transaction key or are browsing a league's transaction feed.

| Question | Path Pattern |
| --- | --- |
| What are the latest transactions? | `/league/{league_key}/transactions` |
| Show only waiver claims | `/league/{league_key}/transactions;type=waiver` |
| Show this team's pending waivers | `/league/{league_key}/transactions;type=waiver;team_key={team_key}` |
| Show one transaction | `/transaction/{transaction_key}` |
| Show multiple transactions by key in a league | `/league/{league_key}/transactions;transaction_keys={tr1},{tr2}` |

## Why You Do Not See Arbitrary Multi-Hop Routes

Yahoo path composition is tree-shaped, but not free-form.

- Each segment must be a documented child of the segment before it.
- Singular resource names and plural collection names are not interchangeable.
- That is why `games/league/teams` is not the right documented shape.
- The documented collection chain is `games/leagues/teams`.

Good mental rule:

```text
parent -> documented child -> documented grandchild
```

Examples:

```text
/users;use_login=1/games/leagues/teams
/games;game_codes=nfl/leagues/teams
/leagues;league_keys={l1},{l2}/teams/roster
/teams;team_keys={t1},{t2}/roster/players
```

## When To Use `out`

Use `;out=` when the parent object is still the primary thing you want.

Examples:

```text
/league/{league_key};out=settings,standings
/game/{game_key};out=players,game_weeks
/users;use_login=1/games;game_keys=nfl;out=leagues,teams
```

Use `/child` instead when the child collection or child resource is the actual target.

Examples:

```text
/league/{league_key}/teams
/league/{league_key}/players
/team/{team_key}/roster/players
```

## Fast Heuristics

- If the question starts with “my” or “the logged-in user”, start at `users;use_login=1`.
- If the question starts with “for this sport” or “for this season”, start at `game` or `games`.
- If the question starts with “in this league”, start at `league/{league_key}`.
- If the question starts with “on this team”, start at `team/{team_key}`.
- If the question starts with “for this player”, start at `player/{player_key}`.
- If you already have a transaction key, go directly to `transaction/{transaction_key}`.
