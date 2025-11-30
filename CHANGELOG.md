# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### Initial Release

First stable release of yfs-api, a TypeScript wrapper for the Yahoo Fantasy Sports API.

### Added

#### Core Features
- **OAuth 1.0 Support** - Public API access without user authentication
- **OAuth 2.0 Support** - User authentication with token refresh support
- **Token Storage Interface** - Save and restore authentication tokens between sessions
- **Resource-Based API** - Client organization for user, league, team, player, game, and transaction
- **TypeScript Support** - Type definitions with IDE autocomplete
- **JSDoc** - Inline documentation on public APIs

#### Resources
- **UserResource** - Get current user, games, leagues, and teams
- **LeagueResource** - Fetch league details, settings, standings, scoreboard, and teams
- **TeamResource** - Get team info, roster, matchups, and stats
- **PlayerResource** - Search players, get stats, ownership, and draft analysis
- **GameResource** - Query available games, search players, get position types and stat categories
- **TransactionResource** - Add/drop players, propose trades (⚠️ experimental, not integration tested)

#### Sports Support
All major Yahoo Fantasy sports (NHL, NBA, NFL, MLB) are intended to work with this release, but initial testing has focused on NHL leagues.

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
- **Type Safety** - Compile-time checking via TypeScript
- **Token Refresh** - OAuth 2.0 token refresh support
- **Error Handling** - Specific error types with descriptive messages
- **Rate Limiting** - Request throttling to help respect API limits
- **Retry Logic** - Automatic retry for selected failures
- **Local OAuth Server** - Helper for OAuth 2.0 flow during development

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

## [1.1.0] - 2025-11-24

### Overview

Major refactor addressing significant implementation flaws in v1.0.0. This release improves XML parsing, enhances the API with an advanced query builder, and reorganizes documentation for clarity.

### Added

#### Advanced Query Builder (⚠️ Experimental)
- **Advanced Query Builder** - New `client.advanced()` method for constructing complex API requests with fluent API
- Support for resource chaining, parameter passing, and output selection
- Enables queries not covered by standard resource methods
- ⚠️ API and behavior may change; use with caution in production

#### Testing & Fixtures
- **Data Collection Script** - `multi-league-collector.ts` for gathering comprehensive fixture data from real Yahoo Fantasy API
- Enhanced fixture data covering multiple sports and league configurations
- Script-based discovery of league and team keys for integration testing

#### Developer Tools
- **Auto-Discovery Script** - Automatically find and configure test resources from user's Yahoo Fantasy account
- Comprehensive fixture management and data collection infrastructure

### Changed

#### Core Improvements
- **Response Property Names** - Updated game, player, and team response property names for consistency
- **Array Normalization** - Enhanced XML parser array normalization with mappings for users and leagues
- **Transaction Interfaces** - Streamlined transaction API interfaces and documentation
- **Response Handling** - Updated response handling in resource classes for better data extraction

#### Documentation
- **Restructured Docs** - Reorganized documentation files for the Yahoo API guide
- **Removed Outdated Docs** - Cleaned up CI/CD and OAuth improvement documentation
- **API Documentation** - Added comprehensive documentation for players, teams, transactions, and users
- **Design Folder Cleanup** - Removed outdated design documents and summaries
- **README Updates** - Updated README to remove design folder references and reflect current capabilities

#### Type System
- **Type Organization** - Restored and reorganized TypeScript response types into dedicated folder structure
- **Type Consistency** - Improved type consistency across resource clients

### Fixed

#### Parser & XML Handling
- **Array Normalization** - Fixed nested array handling for Yahoo API responses (`[[{...}], null]` format)
- **XML Parser Mappings** - Added proper mappings for users and leagues in array normalization

#### Type & Build Issues
- **TypeScript Diagnostics** - Resolved TypeScript warnings and diagnostic errors in tests
- **Import Cleanup** - Cleaned up imports to enable proper building

### Other

- Removed exposed client credentials from repository history
- Cleaned out legacy fixture data and consolidated test infrastructure
- Minor improvements to error handling and validation

### Upgrade Guide from 1.0.0

If upgrading from v1.0.0, be aware of:
- **Response property names** have been updated for consistency - review your usage of resource responses
- **Array normalization** has been improved - nested arrays should now parse correctly
- **Advanced query builder** is experimental - prefer standard resource methods for stable APIs

---

## [1.1.1] - Unreleased

> This version is being prepared and may change before release.

### Overview

Minor patch release addressing issues found in v1.1.0. This release includes bug fixes and performance improvements.

### Fixed

#### Bug Fixes
- **Advanced Query Builder** - Fixed issues with query parameter serialization in the experimental query builder
- **Response Handling** - Resolved edge cases in response handling for certain API endpoints

#### Performance Improvements
- **XML Parsing** - Optimized XML parsing logic for improved performance
- **Data Collection** - Enhanced data collection script to reduce API call overhead

### Upgrade Guide from 1.1.0
No breaking changes; recommended to upgrade for bug fixes and performance improvements.


[1.0.0]: https://github.com/spiflicate/yfs-api/releases/tag/v1.0.0
[1.1.0]: https://github.com/spiflicate/yfs-api/releases/tag/v1.1.0
[1.1.1]: https://github.com/spiflicate/yfs-api/releases/tag/v1.1.1
