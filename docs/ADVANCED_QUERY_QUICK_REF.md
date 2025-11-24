# Advanced Query Quick Reference

## Import
```typescript
import { YahooFantasyClient } from 'yfs-api';
```

## Basic Pattern
```typescript
const result = await client.advanced()
  .resource(name, key?)
  .param(key, value)
  .collection(name)
  .execute();
```

## Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `resource(name, key?)` | Add resource | `.resource('league', '423.l.12345')` |
| `collection(name)` | Add collection | `.collection('teams')` |
| `param(key, value)` | Add parameter | `.param('week', '10')` |
| `params(obj)` | Add multiple params | `.params({ position: 'QB', status: 'A' })` |
| `out(resources)` | Include sub-resources | `.out(['settings', 'standings'])` |
| `execute()` | Execute GET | `.execute()` |
| `post(data)` | Execute POST | `.post({ ... })` |
| `put(data)` | Execute PUT | `.put({ ... })` |
| `delete()` | Execute DELETE | `.delete()` |
| `buildPath()` | Build without executing | `.buildPath()` |

## Common Patterns

### League with Sub-resources
```typescript
await client.advanced()
  .resource('league', '423.l.12345')
  .out(['settings', 'standings'])
  .execute();
```

### User's Teams
```typescript
await client.advanced()
  .resource('users')
  .param('use_login', '1')
  .collection('games')
  .param('game_keys', 'nfl')
  .collection('leagues')
  .execute();
```

### Team Roster (Specific Week)
```typescript
await client.advanced()
  .resource('team', '423.l.12345.t.1')
  .collection('roster')
  .param('week', '10')
  .collection('players')
  .execute();
```

### Available Players
```typescript
await client.advanced()
  .resource('league', '423.l.12345')
  .collection('players')
  .params({
    position: 'QB',
    status: 'A',
    sort: 'AR',
    count: '25'
  })
  .execute();
```

### Player Ownership
```typescript
await client.advanced()
  .resource('player', '423.p.8261')
  .collection('ownership')
  .execute();
```

## Common Parameters

| Parameter | Values | Use Case |
|-----------|--------|----------|
| `use_login` | `1` | Current user |
| `status` | `A`, `FA`, `W`, `T`, `K` | Player availability |
| `position` | `QB`, `RB`, `C`, etc. | Filter by position |
| `week` | `1-17` | NFL week |
| `date` | `YYYY-MM-DD` | Specific date |
| `sort` | `NAME`, `OR`, `AR`, `PTS` | Sort order |
| `count` | Number | Results limit |
| `start` | Number | Pagination offset |
| `out` | Sub-resource names | Include nested data |

## URL Pattern Quick Reference

```
/{resource}/{key};{param}={value}/{collection};{param}={value}
```

- `/` separates resources/collections
- `;` separates parameters
- `=` assigns values
- `,` separates multiple values

## Examples by Sport

### NFL
```typescript
// Current season game
.resource('game', 'nfl')

// Available QBs
.params({ position: 'QB', status: 'A' })

// Week-specific roster
.param('week', '10')
```

### NHL
```typescript
// Current season
.resource('game', 'nhl')

// Centers
.params({ position: 'C', status: 'A' })

// Date-specific roster
.param('date', '2023-11-15')
```

### NBA
```typescript
// Current season
.resource('game', 'nba')

// Guards
.params({ position: 'G', status: 'A' })

// Date-specific
.param('date', '2023-11-15')
```

## Type Safety
```typescript
interface MyResponse {
  league: { league_key: string };
}

const result = await client.advanced<MyResponse>()
  .resource('league', '423.l.12345')
  .execute();
```

## Error Handling
```typescript
try {
  const result = await client.advanced()
    .resource('league', '423.l.12345')
    .execute();
} catch (error) {
  console.error('Query failed:', error);
}
```

## Debugging
```typescript
const query = client.advanced()
  .resource('league', '423.l.12345')
  .collection('teams');

console.log(query.buildPath());
// Output: /league/423.l.12345/teams
```

## Resource Keys

| Resource | Format | Example |
|----------|--------|---------|
| Game | `{game_code}` or `{id}` | `nfl`, `423` |
| League | `{game}.l.{id}` | `423.l.12345` |
| Team | `{game}.l.{league}.t.{id}` | `423.l.12345.t.1` |
| Player | `{game}.p.{id}` | `423.p.8261` |

## When to Use

✅ **Use Advanced Query When:**
- Complex resource chains needed
- Multiple filters/parameters
- Exploring API from docs
- Endpoint not in standard methods

❌ **Use Standard Methods When:**
- Common operations
- Better type safety needed
- Simpler, cleaner code preferred

## See Also
- [Full Documentation](../examples/advanced-query/README.md)
- [URL Pattern Guide](../design/URL_PATTERN_GUIDE.md)
- [Examples](../examples/advanced-query/usage-examples.ts)
- [Yahoo API Docs](https://developer.yahoo.com/fantasysports/guide/)
