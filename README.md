# Yahoo Fantasy Sports API Wrapper

A fully typed TypeScript wrapper for the Yahoo Fantasy Sports API with excellent developer experience, built with Bun.

> **Status:** 🚧 In Development - v0.1.0 (NHL MVP)  
> **Current Phase:** Phase 1 - Core Infrastructure

## Features

- ✅ **Fully Typed** - Complete TypeScript types with inference
- ✅ **Self-Documenting** - Comprehensive JSDoc on every type and method
- ✅ **Modern Tooling** - Built with Bun for speed and simplicity
- ✅ **OAuth 2.0** - Secure authentication with Yahoo (fully implemented)
- 🚧 **NHL First** - Prioritizing fantasy hockey support
- 📋 **Multi-Sport** - NFL, MLB, NBA support planned
- 📋 **Resource-Based API** - Intuitive, fluent interface

## Installation

```bash
bun add yahoo-fantasy-sports
```

## Quick Start

```typescript
import { YahooFantasyClient } from 'yahoo-fantasy-sports';

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  redirectUri: 'https://example.com/callback',
});

// Step 1: Get authorization URL
const authUrl = client.getAuthUrl();
console.log('Visit this URL to authorize:', authUrl);

// Step 2: After user authorizes, exchange code for tokens
await client.authenticate(authorizationCode);

// Get your teams (once implemented)
const teams = await client.user.getTeams({ gameCode: 'nhl' });

// Manage your roster (once implemented)
const roster = await client.team.getRoster(teams[0].teamKey);
```

For detailed authentication examples, see `/examples/hockey/01-authentication.ts`.

## Project Status

### ✅ Completed (Phase 1 - Core Infrastructure)

- [x] Project structure and tooling setup
- [x] Comprehensive design documentation (see `/design` directory)
- [x] Base type system (common types, error types)
- [x] Error handling classes with type guards
- [x] Package configuration
- [x] **OAuth 2.0 authentication client** (fully implemented)
- [x] HTTP client with retry logic, rate limiting, and automatic token refresh
- [x] Utility functions (validators, formatters, constants)
- [x] Main client with OAuth 2.0 authentication flow
- [x] Token storage interface for persisting authentication
- [x] Unit tests for utilities (38 tests passing)
- [x] Working authentication examples

**Phase 1 is complete!** The core infrastructure is ready for building resource clients.

### 📋 Next Steps (Phase 2 - NHL Support)

- [ ] NHL-specific types (positions, stats, etc.)
- [ ] User resource (get teams, user info)
- [ ] League resource (settings, standings, scoreboard)
- [ ] Team resource (metadata, roster management)
- [ ] Player resource (search, stats)
- [ ] Basic transactions (add/drop, FAAB waiver bids)

### 📋 Future (Phase 3+)

- [ ] Advanced transactions (trades, trade voting)
- [ ] NFL, MLB, NBA support
- [ ] Performance optimizations
- [ ] Production-ready release (v1.0.0)

See [design/plans/release-roadmap.md](design/plans/release-roadmap.md) for detailed roadmap.

## Development

This project uses Bun for all development tasks.

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or later
- Yahoo Developer Application (for API keys)

### Setup

```bash
# Install dependencies
bun install

# Run type checking
bun run type-check

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Lint code
bun run lint

# Format code
bun run format
```

### Project Structure

```
yfs-api/
├── src/
│   ├── client/              # Main client and entry point
│   ├── resources/           # Resource-specific clients (league, team, etc.)
│   ├── types/               # TypeScript type definitions
│   │   ├── resources/       # Resource types
│   │   ├── sports/          # Sport-specific types
│   │   ├── common.ts        # Common types
│   │   └── errors.ts        # Error types
│   └── utils/               # Utilities (parsers, validators, etc.)
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── fixtures/            # Test fixtures
├── examples/
│   └── hockey/              # NHL examples
├── design/                  # Design documentation
│   ├── decisions/           # Architecture Decision Records (ADRs)
│   ├── plans/               # Planning documents
│   ├── research/            # Research and analysis
│   ├── diagrams/            # Architecture diagrams
│   └── api-mappings/        # Yahoo API to wrapper mappings
└── docs/                    # User documentation
```

## Design Documentation

This project includes comprehensive design documentation:

- **[Design Overview](design/README.md)** - Introduction to design docs
- **[Architecture Decisions](design/decisions/)** - ADRs explaining key choices
- **[Plans & Roadmap](design/plans/)** - Implementation plans and release roadmap
- **[Architecture Diagram](design/diagrams/architecture-overview.mmd)** - Visual overview

Key design decisions:
- **[ADR 001](design/decisions/001-typescript-over-javascript.md)** - Why TypeScript
- **[ADR 002](design/decisions/002-resource-based-api-design.md)** - API design philosophy
- **[ADR 008](design/decisions/008-bun-as-runtime.md)** - Why Bun

## Philosophy

This library is built with one core philosophy:

> **The library should be fully self-documenting and provide excellent DX**

This means:
- Every type has comprehensive JSDoc comments with examples
- IDE autocomplete guides you through the API
- Type inference prevents errors at compile time
- Clear, descriptive names throughout
- Examples embedded in documentation

You shouldn't need to constantly refer to Yahoo's API documentation - the types and IntelliSense should tell you everything you need.

## Contributing

Contributions are welcome! Please read our design documentation to understand the architecture and philosophy.

### Development Workflow

1. Check the [API Coverage Matrix](design/plans/api-coverage-matrix.md) for what needs implementation
2. Review relevant [ADRs](design/decisions/) for architectural context
3. Follow the existing patterns in the codebase
4. Add comprehensive JSDoc comments
5. Include tests for all new functionality
6. Update documentation as needed

## License

MIT

## Credits

Built by [jbru](https://github.com/yourusername) with love for fantasy hockey ⁣🏒

---

*Last Updated: 2024-11-15*
