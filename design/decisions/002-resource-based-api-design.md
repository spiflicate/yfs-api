# 002. Resource-Based API Design

**Status:** Accepted

**Date:** 2024-11-15

**Deciders:** jbru (project creator)

## Context

We need to design the public API for the Yahoo Fantasy Sports wrapper. Yahoo's API is organized around resources (Game, League, Team, Player, Transaction, User) with hierarchical relationships and sub-resources.

We need to decide how users will interact with the library. Key considerations:

1. **Discoverability** - Users should easily find available operations
2. **Type Safety** - Operations should be type-checked
3. **Consistency** - Similar operations should work similarly
4. **Flexibility** - Support Yahoo's sub-resources and filters
5. **Familiarity** - Feel natural to JavaScript/TypeScript developers

## Decision

We will implement a **resource-based, fluent API** design with a central client that provides access to resource-specific clients.

Structure:
```typescript
const client = new YahooFantasyClient(config);

// Resource-based access
await client.league.get(leagueKey);
await client.team.getRoster(teamKey);
await client.player.search(filters);
await client.transaction.addDrop(params);
```

Each resource client encapsulates:
- All operations for that resource type
- Proper typing for that resource
- Resource-specific methods and filters

Key design principles:
1. **Resource Namespace** - Each resource (game, league, team, etc.) has its own namespace
2. **Method Naming** - Clear, descriptive method names (get, search, update, etc.)
3. **Type Inference** - Return types inferred from method calls
4. **Sub-resources** - Handled via method parameters or dedicated methods
5. **Fluent Interface** - Methods return promises that can be chained

## Consequences

### Positive Consequences

- **Excellent IDE Support:** Auto-complete shows available resources and methods
- **Logical Organization:** Related operations grouped together
- **Type Safety:** Each resource client has specific types
- **Easy to Learn:** Structure mirrors Yahoo's API documentation
- **Discoverable:** `client.` shows all available resources
- **Extensible:** New resources added as new properties
- **Testable:** Each resource client can be tested independently
- **Documentation Friendly:** Easy to document per-resource

### Negative Consequences

- **More Boilerplate:** Each resource needs its own client class
- **Circular Dependencies:** Resource clients might reference each other (mitigated with good design)
- **Initial Complexity:** More upfront structure than a flat API

### Neutral Consequences

- **Client Instance:** Users create one client instance and access resources from it
- **Configuration:** All config passed to main client, resources share config

## Alternatives Considered

### Alternative 1: Flat Function-Based API

**Description:** Export individual functions for each operation

```typescript
import { getLeague, getTeam, searchPlayers } from 'yahoo-fantasy';

await getLeague(config, leagueKey);
await getTeam(config, teamKey);
await searchPlayers(config, filters);
```

**Pros:**
- Simple, functional approach
- No classes needed
- Easy to tree-shake
- Direct imports

**Cons:**
- Config passed to every function (tedious)
- Less discoverability (need to know function names)
- Harder to group related operations
- No shared state (like auth tokens)
- More difficult to type complex relationships

**Why Not Chosen:** Passing config to every function is cumbersome. Shared state (like auth tokens) is awkward. Less discoverable than resource-based approach.

### Alternative 2: Single Client with All Methods

**Description:** One big client class with all methods

```typescript
const client = new YahooFantasyClient(config);

await client.getLeague(leagueKey);
await client.getTeam(teamKey);
await client.searchPlayers(filters);
await client.addDropPlayers(params);
```

**Pros:**
- Single point of entry
- All methods in one place
- Simple class structure

**Cons:**
- Massive class with 50+ methods
- Poor organization
- Auto-complete cluttered
- Hard to maintain
- Difficult to document
- Testing more complex

**Why Not Chosen:** Doesn't scale well. With 6+ resources and multiple methods per resource, the client would be unwieldy.

### Alternative 3: Builder Pattern

**Description:** Chain methods to build up a query

```typescript
await client
  .league(leagueKey)
  .teams()
  .where({ status: 'active' })
  .get();
```

**Pros:**
- Fluent, readable chains
- Clear query building
- Lazy evaluation possible

**Cons:**
- More complex implementation
- Harder to type correctly
- Less obvious API
- Doesn't match Yahoo's API structure
- Steeper learning curve

**Why Not Chosen:** Over-engineered for this use case. Yahoo's API isn't query-based; it's resource-based. The builder pattern doesn't add value here.

### Alternative 4: Repository Pattern

**Description:** Repositories for each resource type

```typescript
const leagueRepo = new LeagueRepository(client);
const teamRepo = new TeamRepository(client);

await leagueRepo.findById(leagueKey);
await teamRepo.findByKey(teamKey);
```

**Pros:**
- Familiar to backend developers
- Clear separation of concerns
- Easy to test

**Cons:**
- More ceremony (creating repositories)
- Doesn't match frontend conventions
- Confusing terminology for non-backend devs
- Extra layer of abstraction

**Why Not Chosen:** Too backend-focused. Most users will be frontend/full-stack developers familiar with client libraries, not repository patterns.

## References

- [Stripe API Design](https://stripe.com/docs/api) - Good example of resource-based API
- [GitHub Octokit](https://github.com/octokit/octokit.js) - Similar resource-based design
- [AWS SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) - Service clients pattern

## Notes

### Example Usage

The resource-based design leads to intuitive usage:

```typescript
// Initialize once
const client = new YahooFantasyClient({
  consumerKey: process.env.YAHOO_KEY,
  consumerSecret: process.env.YAHOO_SECRET,
});

await client.authenticate();

// Use resources as needed
const myTeams = await client.user.getTeams({ gameCode: 'nhl' });
const league = await client.league.get(myTeams[0].leagueKey);
const roster = await client.team.getRoster(myTeams[0].teamKey);
const players = await client.player.search({
  leagueKey: league.leagueKey,
  position: 'C',
  status: 'FA',
});
```

### Implementation Pattern

Each resource client follows this pattern:

```typescript
class LeagueResource {
  constructor(private http: HttpClient) {}
  
  async get(key: string, options?: GetLeagueOptions): Promise<League> {
    // Implementation
  }
  
  async getSettings(key: string): Promise<LeagueSettings> {
    // Implementation
  }
  
  // More methods...
}
```

The main client composes them:

```typescript
class YahooFantasyClient {
  public readonly league: LeagueResource;
  public readonly team: TeamResource;
  // ... more resources
  
  constructor(config: ClientConfig) {
    const http = new HttpClient(config);
    this.league = new LeagueResource(http);
    this.team = new TeamResource(http);
    // ... initialize more
  }
}
```

This keeps concerns separated while providing a unified interface.
