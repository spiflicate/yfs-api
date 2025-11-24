# Advanced Query Module

The Advanced Query module provides a flexible, low-level interface for constructing complex Yahoo Fantasy API requests that may not be covered by the standard typed resource methods.

## When to Use

- **Complex resource chains**: Multi-level relationships like `users → games → leagues → teams`
- **Advanced filters**: Multiple parameters and collection filters
- **Discovery**: Exploring API capabilities from the Yahoo documentation
- **Edge cases**: Uncommon endpoint combinations

## When NOT to Use

Use the standard resource methods (`client.league.get()`, `client.team.getRoster()`, etc.) for common operations. They provide better type safety and are easier to use.

## Basic Usage

```typescript
import { YahooFantasyClient } from 'yahoo-fantasy-sports';

const client = new YahooFantasyClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'https://example.com/callback',
});

// Simple resource
const league = await client.advanced()
  .resource('league', '423.l.12345')
  .execute();

// With sub-resources
const leagueWithSettings = await client.advanced()
  .resource('league', '423.l.12345')
  .out(['settings', 'standings'])
  .execute();
```

## API Reference

### Methods

#### `resource(name, key?)`
Add a resource to the query path.

```typescript
.resource('game', 'nfl')        // /game/nfl
.resource('league', '423.l.12345')  // /league/423.l.12345
.resource('users')              // /users (no key needed)
```

#### `collection(name)`
Add a collection to the query path.

```typescript
.collection('leagues')  // /leagues
.collection('teams')    // /teams
.collection('players')  // /players
```

#### `param(key, value)`
Add a parameter to the most recent resource/collection.

```typescript
.param('week', '10')
.param('position', 'QB')
.param('use_login', '1')
```

#### `params(object)`
Add multiple parameters at once.

```typescript
.params({
  position: 'QB',
  status: 'A',
  count: '25'
})
```

#### `out(subResources)`
Convenience method for the `out` parameter (include sub-resources).

```typescript
.out('settings')
.out(['settings', 'standings', 'scoreboard'])
```

#### `execute()`
Execute the query as a GET request.

```typescript
const result = await client.advanced()
  .resource('league', '423.l.12345')
  .execute();
```

#### `post(data)`, `put(data)`, `delete()`
Execute as POST, PUT, or DELETE request.

```typescript
await client.advanced()
  .resource('league', '423.l.12345')
  .collection('transactions')
  .post({ /* transaction data */ });
```

#### `buildPath()`
Build the path without executing (useful for debugging).

```typescript
const path = client.advanced()
  .resource('users')
  .param('use_login', '1')
  .buildPath();
// Returns: /users;use_login=1
```

## URL Pattern Structure

The Yahoo Fantasy API uses this pattern:
```
/resource/key;param=value;param=value/collection;param=value/resource
```

Key points:
- **Resources** and **collections** are separated by `/`
- **Parameters** are added with `;` after a resource/collection
- **Multiple values** for a parameter use `,` (e.g., `out=settings,standings`)
- Parameters apply to the **immediately preceding** resource/collection

## Examples

### User's NFL Leagues

```typescript
const leagues = await client.advanced()
  .resource('users')
  .param('use_login', '1')
  .collection('games')
  .param('game_keys', 'nfl')
  .collection('leagues')
  .execute();

// URL: /users;use_login=1/games;game_keys=nfl/leagues
```

### Team Roster for Specific Week

```typescript
const roster = await client.advanced()
  .resource('team', '423.l.12345.t.1')
  .collection('roster')
  .param('week', '10')
  .collection('players')
  .execute();

// URL: /team/423.l.12345.t.1/roster;week=10/players
```

### Available Players with Filters

```typescript
const qbs = await client.advanced()
  .resource('league', '423.l.12345')
  .collection('players')
  .params({
    position: 'QB',
    status: 'A',     // Available
    sort: 'AR',      // Actual rank
    count: '25'
  })
  .execute();

// URL: /league/423.l.12345/players;position=QB;status=A;sort=AR;count=25
```

### League with Multiple Sub-resources

```typescript
const league = await client.advanced()
  .resource('league', '423.l.12345')
  .out(['settings', 'standings', 'scoreboard'])
  .execute();

// URL: /league/423.l.12345;out=settings,standings,scoreboard
```

### Specific Teams from League

```typescript
const teams = await client.advanced()
  .resource('league', '423.l.12345')
  .collection('teams')
  .param('team_keys', '423.l.12345.t.1,423.l.12345.t.2')
  .execute();

// URL: /league/423.l.12345/teams;team_keys=423.l.12345.t.1,423.l.12345.t.2
```

## Type Safety

You can provide a type parameter for better TypeScript support:

```typescript
interface LeagueResponse {
  league: {
    league_key: string;
    name: string;
    settings?: unknown;
  };
}

const result = await client.advanced<LeagueResponse>()
  .resource('league', '423.l.12345')
  .out('settings')
  .execute();

// result is typed as LeagueResponse
```

## Comparison with Standard Methods

**Standard (recommended for common cases):**
```typescript
const league = await client.league.get('423.l.12345', {
  includeSettings: true,
  includeStandings: true
});
```

**Advanced (for complex or uncommon cases):**
```typescript
const league = await client.advanced()
  .resource('league', '423.l.12345')
  .out(['settings', 'standings'])
  .execute();
```

Both produce the same result, but the standard method provides better type safety and documentation.

## Best Practices

1. **Use standard methods first** - Only use advanced queries when necessary
2. **Test with `buildPath()`** - Verify your URL structure before executing
3. **Add types when possible** - Use type parameters for better IDE support
4. **Reference Yahoo docs** - The [official API documentation](https://developer.yahoo.com/fantasysports/guide/) shows valid paths
5. **Start simple** - Build complex queries incrementally

## Error Handling

```typescript
try {
  const result = await client.advanced()
    .resource('league', '423.l.12345')
    .collection('invalid')  // Invalid collection
    .execute();
} catch (error) {
  if (error instanceof Error) {
    console.error('Query failed:', error.message);
  }
}
```

## See Also

- [Official Yahoo Fantasy API Guide](https://developer.yahoo.com/fantasysports/guide/)
- [API Resource Diagrams](../../design/diagrams/) - Visual reference for resource relationships
- [Standard Resource Methods](../../src/resources/) - Typed resource clients
