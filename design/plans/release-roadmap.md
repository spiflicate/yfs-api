# Release Roadmap

This document outlines the planned releases and milestones for the Yahoo Fantasy Sports API wrapper.

## Version Strategy

We follow **semantic versioning** (semver):
- **Major (X.0.0)**: Breaking API changes
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, backward compatible

Pre-1.0 versions (0.x.x) may have breaking changes in minor versions as we refine the API.

---

## v0.1.0 - NHL MVP 🏒

**Target:** Q1 2025  
**Status:** In Planning  
**Priority:** High

### Goals
Provide a minimal but functional wrapper focused on NHL fantasy hockey with the core features needed for lineup management.

### Features

#### Core Infrastructure
- [x] Project setup with Bun
- [ ] OAuth 2.0 authentication
  - [ ] Initial auth flow
  - [ ] Token storage
  - [ ] Token refresh
- [ ] HTTP client with retry logic
- [ ] XML to JSON parsing
- [ ] Error handling

#### Type System
- [ ] Base types (common across all sports)
- [ ] NHL-specific types
  - [ ] NHL positions (C, LW, RW, D, G, BN, IR, IR+)
  - [ ] NHL stats
  - [ ] NHL scoring categories
- [ ] League types
- [ ] Team types
- [ ] Player types
- [ ] Roster types

#### Resources
- [ ] User resource
  - [ ] Get current user
  - [ ] Get user's teams
- [ ] League resource
  - [ ] Get league metadata
  - [ ] Get league settings
  - [ ] Get league standings
- [ ] Team resource
  - [ ] Get team metadata
  - [ ] Get team roster
  - [ ] Update roster positions
- [ ] Player resource
  - [ ] Search players
  - [ ] Get player details
  - [ ] Get player stats

#### Transactions (Basic)
- [ ] Add/drop players
- [ ] FAAB waiver bids

#### Documentation
- [ ] API reference (auto-generated)
- [ ] Getting started guide
- [ ] NHL-specific guide
- [ ] Authentication guide

#### Testing
- [ ] Unit tests for core functionality
- [ ] Integration tests with mocked API
- [ ] Example code that runs

### Success Criteria
- Can authenticate with Yahoo
- Can retrieve user's NHL teams
- Can view and modify NHL roster
- Can search for NHL players
- Can add/drop NHL players
- Full TypeScript types with JSDoc
- 70%+ test coverage

---

## v0.2.0 - NHL Complete

**Target:** Q2 2025  
**Status:** Planned  
**Priority:** High

### Goals
Complete NHL support with all transaction types and advanced features.

### Features

#### Enhanced Transactions
- [ ] Propose trades
- [ ] Accept/reject trades
- [ ] Vote on trades (league settings dependent)
- [ ] Cancel trades
- [ ] Edit waiver priorities
- [ ] View transaction history

#### Advanced Features
- [ ] Matchup information
- [ ] Scoreboard data
- [ ] League scoreboard
- [ ] Player ownership percentages
- [ ] Projected stats
- [ ] Recent player news

#### Performance & Polish
- [ ] Request caching
- [ ] Rate limiting compliance
- [ ] Batch requests where possible
- [ ] Better error messages

#### Documentation
- [ ] Transaction workflows guide
- [ ] Advanced features guide
- [ ] Troubleshooting guide

#### Testing
- [ ] 85%+ test coverage
- [ ] Performance benchmarks

### Success Criteria
- All NHL features from Yahoo's API accessible
- Can execute all transaction types
- Production-ready error handling
- Comprehensive documentation

---

## v0.3.0 - Multi-Sport Support

**Target:** Q3 2025  
**Status:** Planned  
**Priority:** Medium

### Goals
Extend support to NFL, MLB, and NBA.

### Features

#### NFL Support
- [ ] NFL-specific types
  - [ ] Positions (QB, RB, WR, TE, K, DEF, BN, IR)
  - [ ] Week-based operations
  - [ ] NFL stats and scoring
- [ ] NFL examples

#### MLB Support
- [ ] MLB-specific types
  - [ ] Positions (C, 1B, 2B, SS, 3B, OF, SP, RP, P, BN, DL)
  - [ ] Date-based operations
  - [ ] MLB stats and scoring
- [ ] MLB examples

#### NBA Support
- [ ] NBA-specific types
  - [ ] Positions (PG, SG, SF, PF, C, G, F, UTIL, BN, IL)
  - [ ] Date-based operations
  - [ ] NBA stats and scoring
- [ ] NBA examples

#### Type System Enhancements
- [ ] Sport-specific type narrowing
- [ ] Generic resource types with sport parameter
- [ ] Compile-time sport validation

#### Documentation
- [ ] Sport-specific guides for each
- [ ] Migration examples between sports
- [ ] Comparison of sport differences

### Success Criteria
- All four major sports supported
- Sport-specific types prevent cross-sport errors
- Examples for each sport
- Feature parity across sports

---

## v0.4.0 - Developer Experience

**Target:** Q4 2025  
**Status:** Planned  
**Priority:** Medium

### Goals
Enhance developer experience with better tooling and debugging.

### Features

#### Developer Tools
- [ ] Debug mode with request/response logging
- [ ] CLI tool for common operations
- [ ] Request inspector
- [ ] Mock server for testing

#### Advanced Type Features
- [ ] Type predicates for runtime checks
- [ ] Better type inference in complex scenarios
- [ ] Branded types for keys

#### Performance
- [ ] Request deduplication
- [ ] Optimistic updates
- [ ] Pagination helpers
- [ ] Streaming large datasets

#### Ecosystem
- [ ] React hooks (optional package)
- [ ] Vue composables (optional package)
- [ ] Express middleware for OAuth

### Success Criteria
- Excellent debugging experience
- High-quality ecosystem packages
- Performance optimizations measurable

---

## v1.0.0 - Production Ready

**Target:** Q1 2026  
**Status:** Planned  
**Priority:** High

### Goals
Stable, production-ready API with comprehensive coverage.

### Requirements

#### Stability
- [ ] No breaking changes for 3 months
- [ ] 95%+ test coverage
- [ ] Performance benchmarks meet targets
- [ ] Security audit passed

#### Documentation
- [ ] Complete API reference
- [ ] Video tutorials
- [ ] Interactive examples
- [ ] Migration guides

#### Quality
- [ ] All known bugs fixed
- [ ] Accessibility review
- [ ] Performance profiling
- [ ] Bundle size optimized

#### Community
- [ ] Contributing guidelines
- [ ] Code of conduct
- [ ] Issue templates
- [ ] PR templates

### Success Criteria
- API is stable and well-tested
- Documentation is comprehensive
- Community infrastructure in place
- Ready for production use at scale

---

## Future Considerations (Post 1.0)

### Potential Features
- **GraphQL API** - Alternative to REST interface
- **Real-time Updates** - WebSocket support for live data
- **Offline Support** - Local caching and sync
- **Advanced Analytics** - Statistical analysis tools
- **Mobile SDKs** - React Native, Flutter support
- **Additional Sports** - If Yahoo adds more sports

### Versioning Strategy Post-1.0
- **1.x.x** - Feature additions, no breaking changes
- **2.0.0** - Major redesign or breaking changes (only when necessary)

---

## Release Checklist

Before each release:

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] npm publish
- [ ] GitHub release created
- [ ] Announcement posted

---

## Notes

### Release Frequency
- **Pre-1.0**: Release when features are complete (flexible timing)
- **Post-1.0**: Regular release schedule (monthly or bi-monthly)

### Breaking Changes
Pre-1.0, we may introduce breaking changes in minor versions. All breaking changes will be:
- Clearly documented in CHANGELOG
- Announced in advance when possible
- Accompanied by migration guide

### Feedback Integration
This roadmap is living and will evolve based on:
- User feedback
- Yahoo API changes
- Community contributions
- Technical discoveries

---

*Last Updated: 2024-11-15*
