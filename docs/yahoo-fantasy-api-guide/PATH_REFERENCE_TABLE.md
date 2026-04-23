# Yahoo Fantasy API Path Reference Table

This reference table summarizes documented root paths, child paths, common filters, and common use cases from the Yahoo Fantasy API documentation collected in this repository.

Base path:

```text
/fantasy/v2
```

## Root Reference

| Root | Type | Typical Purpose | Common Children | Common Filters |
| --- | --- | --- | --- | --- |
| `/users;use_login=1` | Collection | Discover the logged-in user's games, leagues, and teams | `games`, `leagues`, `teams` | `use_login=1` |
| `/game/{game_key}` | Resource | Explore one game or current sport season | `leagues`, `players`, `game_weeks` | `out` |
| `/games` | Collection | Explore multiple games across codes or seasons | game-level sub-resources | `is_available`, `game_types`, `game_codes`, `seasons`, `game_keys` |
| `/league/{league_key}` | Resource | Explore one league and its league-scoped data | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | `out` |
| `/leagues` | Collection | Work with multiple leagues at once | league-level sub-resources, `teams` | `league_keys`, `out` |
| `/team/{team_key}` | Resource | Explore one team | `roster`, `matchups`, `stats` | `out` |
| `/teams;team_keys={t1},{t2}` | Collection | Work with multiple teams at once | `roster`, `matchups`, `stats` | `team_keys`, `out` |
| `/player/{player_key}` | Resource | Explore one player | `stats`, `ownership`, `percent_owned` | `out` |
| `/players;player_keys={p1},{p2}` | Collection | Work with multiple players at once | `stats`, `ownership`, `percent_owned` | `player_keys`, `out`, player filters by context |
| `/team/{team_key}/roster` | Resource | Explore one roster coverage period | `players` | `week`, `date` |
| `/transaction/{transaction_key}` | Resource | Inspect a specific transaction | `players` | none documented as common filters |
| `/league/{league_key}/transactions` | Collection | Work with multiple transactions in one league | `players` | `transaction_keys`, `type`, `types`, `team_key`, `start`, `count`, `out` |

## Resource And Collection Surface

| Category | Names |
| --- | --- |
| Resources | `game`, `league`, `player`, `team`, `roster`, `transaction` |
| Collections | `games`, `leagues`, `players`, `teams`, `transactions`, `users` |

## Child Reference By Root

### `/users;use_login=1`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| `/games` | Games the logged-in user participates in | `game_keys`, `game_codes`, `seasons`, `is_available`, `game_types` | `/users;use_login=1/games;game_keys=nfl` |
| `/games/leagues` | Leagues for the selected user games | `league_keys` | `/users;use_login=1/games;game_keys=nfl/leagues` |
| `/games/teams` | Teams for the selected user games | `team_keys` | `/users;use_login=1/games;game_keys=nfl/teams` |
| `;out=leagues,teams` on `games` | Attach leagues and teams to each game result | `game_keys` | `/users;use_login=1/games;game_keys=nfl;out=leagues,teams` |

### `/game/{game_key}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Game metadata | none | `/game/nfl` |
| `/leagues` | Leagues in the game | `league_keys` | `/game/nfl/leagues` |
| `/players` | Players in the game | `player_keys`, `search`, `start`, `count` | `/game/nfl/players;search=mahomes;count=25` |
| `/game_weeks` | Week schedule structure | none | `/game/nfl/game_weeks` |
| `;out=leagues,players,game_weeks` | Attach child data to the game | `out` | `/game/nfl;out=players,game_weeks` |

### `/games`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Games collection | `is_available`, `game_types`, `game_codes`, `seasons` | `/games;is_available=1` |
| `/players` | Players across selected games | `game_keys`, `player_keys`, `search`, `count` | `/games;game_keys=nfl,nhl/players` |
| `/leagues` | Leagues across selected games | `game_keys`, `league_keys` | `/games;game_codes=nfl;seasons=2025/leagues` |
| `/leagues/teams` | Teams across leagues in selected games | `game_keys`, `league_keys`, `team_keys` | `/games;game_codes=nfl;seasons=2025/leagues/teams` |
| `/leagues/players` | League-context players across leagues in selected games | `game_keys`, `league_keys`, player filters by context | `/games;game_codes=nfl/leagues/players;status=FA` |
| `/leagues/transactions` | Transactions across leagues in selected games | `game_keys`, `league_keys`, `type`, `count` | `/games;game_codes=nfl/leagues/transactions;type=add` |
| `;out=leagues,players` | Attach children to each game result | `game_keys`, `game_codes`, `seasons` | `/games;game_codes=nfl,mlb;out=leagues` |

### `/league/{league_key}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | League metadata | none | `/league/423.l.12345` |
| `/settings` | League rules and scoring setup | none | `/league/423.l.12345/settings` |
| `/standings` | League standings | none | `/league/423.l.12345/standings` |
| `/scoreboard` | Matchups and scores | `week`, `date` | `/league/423.l.12345/scoreboard;week=10` |
| `/teams` | Teams in the league | `team_keys`, `out` | `/league/423.l.12345/teams` |
| `/players` | League-context player pool | `player_keys`, `position`, `status`, `search`, `sort`, `sort_type`, `sort_season`, `sort_week`, `sort_date`, `start`, `count` | `/league/423.l.12345/players;status=FA;position=QB;count=25` |
| `/transactions` | League transactions | `type`, `types`, `team_key`, `start`, `count` | `/league/423.l.12345/transactions;type=waiver;team_key=423.l.12345.t.1` |
| `;out=settings,standings,scoreboard` | Attach child data to league metadata | `out` | `/league/423.l.12345;out=settings,standings` |

### `/leagues`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Multiple leagues by key | `league_keys`, `out` | `/leagues;league_keys=423.l.12345,423.l.67890` |
| `/teams` | Teams across selected leagues | `league_keys`, `team_keys` | `/leagues;league_keys=423.l.12345,423.l.67890/teams` |
| `/settings` | Settings for selected leagues | `league_keys` | `/leagues;league_keys=423.l.12345,423.l.67890/settings` |
| `/standings` | Standings for selected leagues | `league_keys` | `/leagues;league_keys=423.l.12345,423.l.67890/standings` |
| `/players` | Players across selected leagues | `league_keys`, player filters by context | `/leagues;league_keys=423.l.12345,423.l.67890/players` |
| `/transactions` | Transactions across selected leagues | `league_keys`, `transaction_keys`, `type`, `team_key`, `count` | `/leagues;league_keys=423.l.12345,423.l.67890/transactions` |
| `/teams/roster` | Rosters across selected leagues and teams | `league_keys`, `team_keys`, `week`, `date` | `/leagues;league_keys=423.l.12345,423.l.67890/teams/roster` |
| `/teams/roster/players` | Roster players across selected leagues and teams | `league_keys`, `team_keys`, `week`, `date` | `/leagues;league_keys=423.l.12345,423.l.67890/teams/roster/players` |

### `/team/{team_key}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Team metadata | none | `/team/423.l.12345.t.1` |
| `/roster` | Team roster for the default current period | `week`, `date` | `/team/423.l.12345.t.1/roster` |
| `/roster/players` | Players on the roster | `week`, `date` | `/team/423.l.12345.t.1/roster;week=10/players` |
| `/matchups` | Team matchup history | `weeks` | `/team/423.l.12345.t.1/matchups;weeks=1,5` |
| `/stats` | Team stats for a coverage period | `type`, `week`, `date` | `/team/423.l.12345.t.1/stats;type=season` |
| `;out=roster,stats,matchups` | Attach child data to team metadata | `out` | `/team/423.l.12345.t.1;out=roster,stats` |

### `/teams;team_keys={t1},{t2}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Multiple teams by key | `team_keys`, `out` | `/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2` |
| `/roster` | Rosters across selected teams | `team_keys`, `week`, `date` | `/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster` |
| `/roster/players` | Roster players across selected teams | `team_keys`, `week`, `date` | `/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/roster/players` |
| `/matchups` | Matchups across selected teams | `team_keys`, `weeks` | `/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/matchups;weeks=1,5` |
| `/stats` | Stats across selected teams | `team_keys`, `type`, `week`, `date` | `/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2/stats;type=season` |

### `/team/{team_key}/roster`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Roster for one team and coverage period | `week`, `date` | `/team/423.l.12345.t.1/roster;week=10` |
| `/players` | Players in that roster | `week`, `date` | `/team/423.l.12345.t.1/roster;week=10/players` |

### `/player/{player_key}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Player metadata | none | `/player/423.p.8261` |
| `/stats` | Player stats | `type`, `week`, `date` | `/player/423.p.8261/stats;type=season` |
| `/ownership` | Ownership info | none | `/player/423.p.8261/ownership` |
| `/percent_owned` | Percent owned info | none | `/player/423.p.8261/percent_owned` |
| `;out=stats,ownership` | Attach child data to player metadata | `out` | `/player/423.p.8261;out=stats,ownership` |

### `/players;player_keys={p1},{p2}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Multiple players by key | `player_keys`, `out` | `/players;player_keys=423.p.8261,423.p.9527` |
| `/stats` | Stats for selected players | `player_keys`, `type`, `week`, `date` | `/players;player_keys=423.p.8261,423.p.9527/stats` |
| `/ownership` | Ownership for selected players | `player_keys` | `/players;player_keys=423.p.8261,423.p.9527/ownership` |
| `/percent_owned` | Percent owned for selected players | `player_keys` | `/players;player_keys=423.p.8261,423.p.9527/percent_owned` |

### `/transaction/{transaction_key}`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Transaction details | none | `/transaction/423.l.12345.tr.9` |
| `/players` | Players involved in the transaction | none | returned within transaction payload |

### `/league/{league_key}/transactions`

| Child Path | Meaning | Common Filters | Example |
| --- | --- | --- | --- |
| none | Transactions for one league | `transaction_keys`, `type`, `types`, `team_key`, `start`, `count`, `out` | `/league/423.l.12345/transactions;type=waiver` |
| `/players` | Players involved in selected transactions | `transaction_keys`, `type`, `types`, `team_key` | `/league/423.l.12345/transactions;transaction_keys=423.l.12345.tr.9,423.l.12345.tr.10/players` |

## Valid Multi-Hop Chains

These are valid because each step is a documented child of the previous one.

| Chain | Meaning |
| --- | --- |
| `/users;use_login=1/games/leagues` | User to games to leagues |
| `/users;use_login=1/games/leagues/teams` | User to games to leagues to teams |
| `/games;game_codes=nfl/leagues` | Selected games to leagues |
| `/games;game_codes=nfl/leagues/teams` | Selected games to leagues to teams |
| `/leagues;league_keys={l1},{l2}/teams/roster` | Selected leagues to teams to rosters |
| `/teams;team_keys={t1},{t2}/roster/players` | Selected teams to rosters to players |

## Why Not `games/league/teams`

- Yahoo path composition is tree-like, but not arbitrary.
- Singular resource names and plural collection names are different nodes.
- After `games`, the documented collection hop is `leagues`, not `league`.
- The documented collection chain is `/games/.../leagues/teams`.

## Filter Reference By Topic

| Filter | Applies To | Meaning |
| --- | --- | --- |
| `use_login=1` | `users` | Select the logged-in Yahoo user |
| `game_keys=...` | `games`, `users/games`, some nested game paths | Restrict to specific games |
| `game_codes=...` | `games`, `users/games` | Restrict by sport code such as `nfl`, `mlb`, `nba`, `nhl` |
| `seasons=...` | `games`, `users/games` | Restrict by season year |
| `is_available=1` | `games`, `users/games` | Only in-season or available games |
| `game_types=...` | `games`, `users/games` | Restrict by game format |
| `league_keys=...` | `leagues`, league sub-collections | Restrict to specific leagues |
| `team_keys=...` | `teams` collections | Restrict to specific teams |
| `player_keys=...` | `players` collections | Restrict to specific players |
| `position=...` | league-context players | Filter by fantasy position |
| `status=...` | league-context players | Filter by availability status |
| `search=...` | players collections | Search by player name |
| `sort=...` | league-context players | Sort players by rank, name, points, or stat id |
| `sort_type=...` | league-context players | Choose season, week, or date sort coverage |
| `sort_season=...` | league-context players | Sort within a season |
| `sort_week=...` | league-context players | Sort within an NFL week |
| `sort_date=...` | league-context players | Sort within a date for daily sports |
| `week=...` | scoreboard, roster, stats | Select a week |
| `weeks=...` | matchups | Select multiple weeks |
| `date=...` | roster, stats, scoreboard in some contexts | Select a date |
| `type=...` | stats, transactions | Select coverage type or transaction type depending on context |
| `types=...` | transactions | Select multiple transaction types |
| `team_key=...` | transactions | Restrict transactions to one team |
| `start=...` | collections | Pagination offset |
| `count=...` | collections | Pagination limit |
| `out=...` | many resources and collections | Attach one extra level of sub-resource data |

## Usage Notes

- Start at `users` when the question begins with the logged-in user.
- Start at `game` or `games` when the question begins with a sport or season.
- Start at `league` when the question is about standings, scoreboards, player availability, or transactions.
- Start at `team` when the question is about a roster, matchup, or team stats.
- Start at `player` when the question is about player identity, stats, or ownership.
- Use `;out=` when the parent is still the main object you care about.
- Use `/child` when the child collection or child resource is the main target.
