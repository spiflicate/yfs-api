# Design Changelog

This file tracks major design decisions and architectural changes over time.

---

## 2024-11-15 - Project Initialization

### Design Documentation Created
- Established comprehensive design documentation structure
- Created ADR (Architecture Decision Record) system
- Set up planning documents directory

### Key Decisions Made

#### ADR 001: TypeScript Over JavaScript
- **Decision**: Use TypeScript with strict type checking
- **Rationale**: Self-documenting API, compile-time safety, excellent DX
- **Impact**: All code will be TypeScript, full type coverage required

#### ADR 002: Resource-Based API Design
- **Decision**: Organize API around resources (league, team, player, etc.)
- **Rationale**: Matches Yahoo's API structure, discoverable, maintainable
- **Impact**: Client will expose resource namespaces (client.league.get(), etc.)

#### ADR 008: Bun as Runtime
- **Decision**: Use Bun for development, testing, and package management
- **Rationale**: Fast, modern, TypeScript-native, all-in-one tooling
- **Impact**: Developers need Bun installed; library works in Node.js for users

### Architecture Established
- Created architecture diagram showing component relationships
- Defined separation between:
  - Client layer (main entry point)
  - Resource layer (league, team, player, etc.)
  - HTTP layer (requests, auth, retry)
  - Type system (sport-specific types)
  - Utilities (parsing, validation)

### Planning Documents Created
- **Release Roadmap**: Defined v0.1.0 (NHL MVP) through v1.0.0
- **API Coverage Matrix**: Tracked which Yahoo API features will be implemented
- **Initial Plan**: Comprehensive implementation plan

### Priorities Set
1. **Phase 1 (Current)**: Core infrastructure and OAuth
2. **Phase 2**: NHL-specific features (primary use case)
3. **Phase 3**: Transactions (add/drop, trades, waivers)
4. **Phase 4**: Other sports (NFL, MLB, NBA)
5. **Phase 5**: Polish and production-readiness

### Philosophy Codified
**Core Philosophy**: The library should be fully self-documenting and provide excellent DX

This means:
- Full TypeScript types on everything
- Comprehensive JSDoc with examples
- Clear, descriptive names
- Type inference where possible
- Compile-time error prevention
- IntelliSense support for all operations

### Next Steps
- Set up Phase 1 source code structure
- Implement OAuth authentication layer
- Create base HTTP client
- Define core type system
- Begin NHL-specific types

---

## Future Entries

As the project evolves, major changes will be documented here with:
- Date
- What changed
- Why it changed
- Impact on existing code
- Migration path (if breaking)

---

*Initialized: 2024-11-15*
