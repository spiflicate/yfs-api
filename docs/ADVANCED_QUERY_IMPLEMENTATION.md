# Advanced Query Module - Implementation Summary

## Overview

The Advanced Query module provides a flexible, low-level interface for constructing complex Yahoo Fantasy API requests that go beyond the standard typed resource methods.

## Files Created

### Core Implementation
1. **`src/client/QueryBuilder.ts`**
   - Core query building logic
   - Chainable API for constructing URL paths
   - Parameter handling with semicolon syntax
   - Supports resources, collections, and parameters
   - Helper function `query()` for functional style

2. **`src/client/AdvancedQuery.ts`**
   - Combines QueryBuilder with HTTP client
   - Executes queries (GET, POST, PUT, DELETE)
   - Type-safe with generic parameter
   - Integrated with YahooFantasyClient

3. **`src/client/YahooFantasyClient.ts`** (Modified)
   - Added `advanced<T>()` method
   - Returns AdvancedQuery instance
   - Fully integrated with existing client

### Documentation
4. **`examples/advanced-query/README.md`**
   - Comprehensive usage guide
   - API reference
   - Real-world examples
   - Best practices

5. **`examples/advanced-query/usage-examples.ts`**
   - 15 working examples
   - Covers common and complex scenarios
   - Demonstrates all features

6. **`design/URL_PATTERN_GUIDE.md`**
   - In-depth URL pattern explanation
   - Parameter reference
   - Context-dependent behavior
   - Advanced examples

7. **`design/diagrams/api-resource-relationships.mmd`**
   - Visual map of resource relationships
   - Shows connections between resources

8. **`design/diagrams/api-context-hierarchy.mmd`**
   - Demonstrates context-dependent access
   - Shows bidirectional relationships

9. **`design/diagrams/api-url-patterns.mmd`**
   - URL structure examples
   - Pattern visualization

### Tests
10. **`tests/unit/QueryBuilder.test.ts`**
    - 21 test cases
    - 100% pass rate
    - Covers all QueryBuilder functionality

### Exports
11. **`src/index.ts`** (Modified)
    - Exports QueryBuilder
    - Exports AdvancedQuery
    - Exports query() helper

12. **`README.md`** (Modified)
    - Added Advanced Queries section
    - Examples and use cases

## API Surface

### QueryBuilder Class
```typescript
class QueryBuilder {
  resource(name: string, key?: string): this
  collection(name: string): this
  param(key: string, value: string | string[]): this
  params(params: Record<string, string | string[]>): this
  out(subResources: string | string[]): this
  build(): string
  reset(): this
  toString(): string
}
```

### AdvancedQuery Class
```typescript
class AdvancedQuery<T = unknown> {
  resource(name: string, key?: string): this
  collection(name: string): this
  param(key: string, value: string | string[]): this
  params(params: Record<string, string | string[]>): this
  out(subResources: string | string[]): this
  buildPath(): string
  execute(): Promise<T>
  post(data?: Record<string, unknown>): Promise<T>
  put(data?: Record<string, unknown>): Promise<T>
  delete(): Promise<T>
  toString(): string
}
```

### YahooFantasyClient Integration
```typescript
class YahooFantasyClient {
  // Existing methods...
  advanced<T = unknown>(): AdvancedQuery<T>
}
```

## Usage Examples

### Simple Query
```typescript
const league = await client.advanced()
  .resource('league', '423.l.12345')
  .execute();
```

### Complex Chain
```typescript
const leagues = await client.advanced()
  .resource('users')
  .param('use_login', '1')
  .collection('games')
  .param('game_keys', 'nfl')
  .collection('leagues')
  .out(['settings', 'standings'])
  .execute();
```

### With Filters
```typescript
const qbs = await client.advanced()
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

### Type-Safe
```typescript
interface LeagueResponse {
  league: {
    league_key: string;
    settings: unknown;
  };
}

const result = await client.advanced<LeagueResponse>()
  .resource('league', '423.l.12345')
  .out('settings')
  .execute();
```

## Key Features

1. **Chainable API** - Fluent interface for building queries
2. **Type Safety** - Generic type parameter for responses
3. **HTTP Method Support** - GET, POST, PUT, DELETE
4. **Parameter Handling** - Semicolon-separated, comma-delimited values
5. **Sub-resource Support** - `out` parameter for nested data
6. **Error Handling** - Validates query structure before execution
7. **Debugging** - `buildPath()` and `toString()` for inspection
8. **Integration** - Seamlessly works with existing client

## Design Decisions

1. **Optional Module** - Doesn't interfere with existing typed methods
2. **Separate Classes** - QueryBuilder (URL building) vs AdvancedQuery (HTTP execution)
3. **Immutability** - Each method returns `this` for chaining
4. **Validation** - Throws errors for invalid query construction
5. **Flexibility** - Supports any Yahoo Fantasy API endpoint pattern

## Testing

- ✅ 21 unit tests passing
- ✅ All edge cases covered
- ✅ Error handling validated
- ✅ TypeScript compilation successful
- ✅ No lint errors

## Documentation Quality

- Comprehensive README with examples
- Inline JSDoc comments on all public methods
- Mermaid diagrams for visual understanding
- URL pattern guide with reference tables
- Real-world usage examples

## Benefits

1. **Flexibility** - Access any Yahoo API endpoint, even undocumented ones
2. **Discovery** - Explore API capabilities from official docs
3. **Future-Proof** - Works with new endpoints without code changes
4. **Type-Safe** - Optional typing for known responses
5. **Debugging** - Build and inspect URLs before execution
6. **Backwards Compatible** - Existing code unaffected

## Comparison with Standard Methods

| Aspect | Standard Methods | Advanced Query |
|--------|-----------------|----------------|
| Type Safety | ✅ Full | 🟡 Optional |
| Ease of Use | ✅ Simple | 🟡 More verbose |
| Flexibility | 🔴 Limited | ✅ Unlimited |
| Documentation | ✅ Built-in | 🟡 Need docs |
| IDE Support | ✅ Autocomplete | 🟡 Generic |
| Use Case | Common operations | Complex/rare queries |

## Recommendation

- **Use standard methods** for common operations (90% of use cases)
- **Use advanced query** when:
  - Building complex resource chains
  - Exploring API capabilities
  - Accessing endpoints not in standard methods
  - Need maximum flexibility

## Future Enhancements

Possible future additions (not implemented):
1. Response type inference from path
2. Auto-completion hints for parameter names
3. URL validation against known patterns
4. Request caching/memoization
5. Query templates for common patterns
