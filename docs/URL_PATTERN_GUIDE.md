# Yahoo Fantasy API URL Pattern Guide

## Overview

The Yahoo Fantasy API uses a hierarchical, chainable URL pattern that allows traversing from broad scopes (users, games) down to specific resources (players, teams) with flexible parameters and sub-resources.

## URL Pattern Structure

```
/fantasy/v2/{resource}/{resource_key};{param}={value}/{collection};{param}={value}/{sub-resource}
```

### Key Components

1. **Resources** - Single entities identified by a key
   - Format: `/{resource}/{key}`
   - Examples: `/game/nfl`, `/league/423.l.12345`, `/team/423.l.12345.t.1`

2. **Collections** - Groups of similar resources
   - Format: `/{collection}`
   - Examples: `/games`, `/leagues`, `/teams`, `/players`

3. **Parameters** - Filters and options
   - Format: `;key=value` (semicolon-separated)
   - Multiple values: `;key=value1,value2,value3`
   - Examples: `;week=10`, `;out=settings,standings`

4. **Sub-resources** - Nested data within a parent
   - Format: `/{sub_resource}`
   - Examples: `/roster`, `/stats`, `/matchups`

## Separator Rules

| Separator | Purpose | Example |
|-----------|---------|---------|
| `/` | Separate resources/collections | `/league/423.l.12345/teams` |
| `;` | Separate parameters | `/league/423.l.12345;out=settings` |
| `=` | Assign parameter values | `;week=10` |
| `,` | Multiple values for same parameter | `;out=settings,standings,scoreboard` |

## Common Patterns

### 1. Simple Resource Access
```
/league/423.l.12345
```
Get a single league by key.

### 2. Resource with Sub-resources (using `out`)
```
/league/423.l.12345;out=settings,standings
```
Get league data plus settings and standings.

### 3. Collection with Filters
```
/league/423.l.12345/players;position=QB;status=A
```
Get available quarterbacks in the league.

### 4. Resource Chain
```
/users;use_login=1/games;game_keys=nfl/leagues
```
Get current user's NFL leagues.

### 5. Deep Nesting
```
/team/423.l.12345.t.1/roster;week=10/players
```
Get team's roster players for week 10.

## Parameter Scope

Parameters apply to the **immediately preceding** resource or collection:

```
/league/423.l.12345;out=settings/teams;team_keys=t.1,t.2
```
- `;out=settings` applies to `league/423.l.12345`
- `;team_keys=t.1,t.2` applies to `teams` collection

## Common Parameters

### `out` - Include Sub-resources
Fetch additional related data in a single request.

```
;out=settings
;out=settings,standings,scoreboard
```

### Resource Key Filters
Filter collections to specific items.

```
;league_keys=423.l.12345,423.l.67890
;team_keys=423.l.12345.t.1,423.l.12345.t.2
;player_keys=423.p.8261,423.p.9527
```

### Status Filters (Players Collection)
```
;status=A    // Available (free agents)
;status=FA   // Free agents only
;status=W    // On waivers
;status=T    // Taken (on rosters)
;status=K    // Keepers
```

### Position Filters
```
;position=QB
;position=C,LW,RW  // Multiple positions
```

### Search
```
;search=mcdavid
;search=mahomes
```

### Pagination
```
;start=0;count=25
;start=25;count=25
```

### Sorting
```
;sort=NAME           // Last name, first name
;sort=OR             // Overall rank
;sort=AR             // Actual rank
;sort=PTS            // Fantasy points
;sort={stat_id}      // Sort by specific stat
```

### Time-based Filters

**Week (Football)**
```
;week=10
;weeks=1,5,10
```

**Date (Baseball, Basketball, Hockey)**
```
;date=2023-11-15
```

**Type & Season**
```
;type=season
;type=week;week=10
;type=date;date=2023-11-15
;season=2023
```

### League/Game Filters
```
;is_available=1      // Only available games
;game_types=full,pickem-team
;game_codes=nfl,mlb
;seasons=2023,2024
```

### Other Filters
```
;use_login=1         // Current logged-in user
```

## Context-Dependent Behavior

The same resource can appear in different contexts with different meanings:

### Team → Players (Roster Context)
```
/team/423.l.12345.t.1/roster/players
```
**Question:** "Which players are on my roster?"

### Player → Team (Ownership Context)
```
/player/423.p.8261/ownership
```
**Question:** "Which team owns this player?"

### League → Players (Availability Context)
```
/league/423.l.12345/players;status=A
```
**Question:** "Which players are available to pick up?"

## Resource Keys

### Format Patterns

| Resource | Key Format | Example |
|----------|------------|---------|
| Game | `{game_id}` or `{game_code}` | `423` or `nfl` |
| League | `{game_id}.l.{league_id}` | `423.l.12345` |
| Team | `{game_id}.l.{league_id}.t.{team_id}` | `423.l.12345.t.1` |
| Player | `{game_id}.p.{player_id}` | `423.p.8261` |

### Global vs. Scoped Keys

**Global Keys** - Can be used as base resources:
```
/player/423.p.8261
/team/423.l.12345.t.1
```

**Scoped Keys** - Used within a parent context:
```
/league/423.l.12345/players;player_keys=423.p.8261,423.p.9527
```

## Advanced Examples

### Example 1: User's All Teams Across All Games
```
/users;use_login=1/games/teams
```

### Example 2: Specific League with Settings and Specific Teams
```
/league/423.l.12345;out=settings/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2
```

### Example 3: Player Stats for Specific Week
```
/league/423.l.12345/players;player_keys=423.p.8261/stats;type=week;week=10
```

### Example 4: Available Players Sorted by Rank
```
/league/423.l.12345/players;status=A;position=QB;sort=AR;count=25
```

### Example 5: Team Matchups for Multiple Weeks
```
/team/423.l.12345.t.1/matchups;weeks=1,5,10
```

### Example 6: League Transactions Filtered by Type
```
/league/423.l.12345/transactions;type=trade
```

### Example 7: Game with Multiple Sub-resources
```
/game/nfl;out=stat_categories,position_types,game_weeks
```

## Best Practices

1. **Start broad, narrow down** - Begin with user/game, traverse to specifics
2. **Use `out` for efficiency** - Fetch multiple sub-resources in one request
3. **Apply filters at the right level** - Parameters apply to preceding segment
4. **Use specific keys when possible** - More efficient than filtering collections
5. **Leverage context** - Same resource, different paths = different data

## URL Builder Implementation

The query builder in this library follows these patterns:

```typescript
client.advanced()
  .resource('league', '423.l.12345')  // /league/423.l.12345
  .param('out', 'settings')            // ;out=settings
  .collection('teams')                 // /teams
  .param('team_keys', 't.1,t.2')      // ;team_keys=t.1,t.2
  .build()
  
// Result: /league/423.l.12345;out=settings/teams;team_keys=t.1,t.2
```

## References

- [Yahoo Fantasy API Official Guide](https://developer.yahoo.com/fantasysports/guide/)
- [API Resource Diagrams](../diagrams/) - Visual reference
- [Query Builder Documentation](../../examples/advanced-query/README.md)
