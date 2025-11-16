# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### 🎉 Initial Release

First production-ready release of yfs-api - a fully typed TypeScript wrapper for the Yahoo Fantasy Sports API.

### Added

#### Core Features
- **OAuth 1.0 Support** - Public API access without user authentication
- **OAuth 2.0 Support** - User authentication with automatic token refresh
- **Token Storage Interface** - Save and restore authentication tokens between sessions
- **Resource-Based API** - Intuitive client organization (user, league, team, player, game, transaction)
- **Full TypeScript Support** - Complete type definitions with excellent IDE autocomplete
- **Comprehensive JSDoc** - Self-documenting API with inline examples

#### Resources
- **UserResource** - Get current user, games, leagues, and teams
- **LeagueResource** - Fetch league details, settings, standings, scoreboard, and teams
- **TeamResource** - Get team info, roster, matchups, and stats
- **PlayerResource** - Search players, get stats, ownership, and draft analysis
- **GameResource** - Query available games, search players, get position types and stat categories
- **TransactionResource** - Add/drop players, propose trades (⚠️ experimental, not integration tested)

#### Sports Support
- **NHL** - Fully tested with real fantasy hockey leagues (primary focus)
- **NBA** - Basic support, core endpoints working
- **NFL** - Types implemented, not extensively tested
- **MLB** - Types implemented, not extensively tested

#### Testing
- **301 Unit Tests** - 96.83% line coverage, 98.19% function coverage
- **45 Integration Tests** - Tested against live Yahoo Fantasy API
- **Test Infrastructure** - Comprehensive test helpers and fixtures
- **Auto-Discovery Script** - Automatically find league/team keys for testing

#### Documentation
- Complete README with quickstart examples
- OAuth 1.0 and 2.0 authentication guides
- Integration test setup guide
- Token storage examples
- Public API examples
- Contributing guidelines
- MIT License

#### Developer Experience
- **Type Safety** - Catch errors at compile time
- **Auto Token Refresh** - Seamless OAuth 2.0 token renewal
- **Error Handling** - Specific error types with helpful messages
- **Rate Limiting** - Built-in request throttling
- **Retry Logic** - Automatic retry for failed requests
- **Local OAuth Server** - Simplify OAuth 2.0 flow during development

### Fixed

#### Critical Parsing Bugs
- **Nested Array Handling** - Yahoo API returns data as `[[{...}], null]` instead of flat arrays
- **Team Parsing** - Fixed team data extraction from nested structures in UserResource
- **Game Parsing** - Fixed game and player parsing in GameResource
- **Player Parsing** - Safe name object access in PlayerResource
- **Roster Parsing** - Fixed roster player parsing in TeamResource
- **League Key Extraction** - Properly extract league info from team_key format

All parsing methods now safely handle nested arrays, null values, and non-array data.

### Known Limitations

- **Transaction APIs** - Marked as experimental; add/drop/trade operations implemented but not integration tested
- **NFL/MLB Support** - Types may need refinement based on real-world usage
- **Stat Categories** - Sport-specific stats may vary; report issues if you find missing categories
- **League Settings** - Most options supported; some edge cases may exist

### Technical Details

#### Dependencies
- `fast-xml-parser` - XML to JSON conversion for Yahoo API responses
- TypeScript 5.6.3+ (peer dependency)
- Node.js 18.0.0+ or Bun 1.0.0+

#### Package Configuration
- ESM module format
- Source maps included
- Tree-shakeable exports
- TypeScript definitions included

### Migration Guide

This is the first release, so there's no migration needed. See the README for getting started.

### Contributors

- [jbru](https://github.com/spiflicate) - Initial development and release

---

## Future Releases

Future updates may include:
- Enhanced NFL/MLB/NBA support based on community feedback
- Integration tests for Transaction APIs
- Performance optimizations
- Additional examples and documentation
- Improved TypeScript inference
- Additional Yahoo Fantasy features

Breaking changes will be clearly documented in major version releases.

---

[1.0.0]: https://github.com/spiflicate/yfs-api/releases/tag/v1.0.0
