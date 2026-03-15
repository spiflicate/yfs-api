# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0-beta.3] - 2026-03-15

### Overview

Incremental beta release focused on transaction write ergonomics, new transaction payload builders, games collection query filters, and expanded test/documentation coverage for transaction workflows.

### Added

- **Transaction Payload Builder:** Added `TransactionBuilder` for fluent construction of add/drop and pending-trade payloads, including FAAB bids and optional trade notes.
- **Staged Transaction Write Helpers:** Added request-builder `create`, `edit`, and `cancel` helpers for transaction endpoints, designed for staged write execution via `execute()`.
- **Games Collection Filters:** Added request-builder helpers for root games collection filters: `isAvailable`, `gameTypes`, `gameCodes`, and `seasons`.
- **Trade/Drop Semantics Probe:** Added an opt-in live integration scaffold to validate pending-trade drop-player payload behavior across leagues.
- **Transaction Builder Coverage:** Added dedicated unit coverage for `TransactionBuilder` mode inference, payload shape validation, and error paths.

### Changed

- **Write Dispatch Flow:** Updated request-builder write execution to support staged write state, including explicit dispatch paths for collection-scoped edit/cancel operations.
- **Automatic XML Serialization:** Updated transaction write requests so object payloads are normalized to Yahoo XML at dispatch time for `POST`/`PUT` transaction paths.
- **Public Exports:** Exported `TransactionBuilder` from package entrypoints for direct consumer use.
- **Examples and Guides:** Added a new request-builder transaction example and expanded transactions guide coverage for edit/cancel semantics and pending-trade notes.

### Fixed

- **Execute Reuse Guard:** Prevented accidental duplicate `execute()` calls after a staged write has already been successfully sent unless a new write is explicitly staged.
- **Write Retry Semantics:** Preserved staged write state after failed write attempts so callers can retry `POST`/`PUT`/`DELETE` execution without rebuilding the request chain.
- **Game Parameter Naming:** Aligned game filter parameter naming toward pluralized `seasons` usage in request parameter definitions.

### Notes

- This release further stabilizes v2 transaction write flows and test scaffolding while keeping the broader beta API surface incremental.

## [2.0.0-beta.2] - 2026-03-14

### Overview

Incremental beta release focused on transaction write workflows, request-builder coverage for transaction paths, and safer HTTP body handling for Yahoo write operations.

### Added

- **Transaction Fluent Writes:** Added fluent request-builder support for direct transaction resource paths plus `POST`, `PUT`, and `DELETE` execution against transaction endpoints.
- **Transaction Collection Filters:** Added transaction collection helpers for `type`, `types`, and `team_key` parameters when querying league transactions.

### Changed

- **Transaction Key Modeling:** Updated transaction key typing so standard transactions, waiver claims, and pending trades can be addressed through a single transaction resource path model.
- **Write Request Options:** Expanded request-builder write helpers to accept raw string payloads and request options for transaction-oriented write calls.

### Fixed

- **XML Content Type Handling:** Updated `HttpClient` to default string `POST`/`PUT` bodies to `application/xml` while preserving explicit `Content-Type` overrides.
- **Regression Coverage:** Added unit coverage for transaction path construction, transaction write execution helpers, and content-type behavior for JSON, XML, and delete requests.

### Notes

- This release is focused on transaction API ergonomics and correctness; no additional breaking changes are expected beyond the existing v2 beta surface.

## [2.0.0-beta.1] - 2026-03-12

### Overview

Incremental beta release focused on strengthening the v2 request typing model and aligning key-type behavior across core types and tests.

### Added

- **Request Type Definitions:** Expanded request-context and response-type definitions to improve type-safe request construction across the v2 request flow.

### Changed

- **Key Type Flexibility:** Updated league, team, player, transaction, waiver-claim, and pending-trade key types to support broader string-based key unions.

### Fixed

- **Test Type Alignment:** Updated `RequestBuilderClient` league-key test typing to match the current key-type model.

### Notes

- This release is focused on type-system quality and developer experience; no runtime behavior changes are expected.

---

## [2.0.0-beta.0] - 2026-03-12

### Overview

First beta release of the v2 line, driven by a major refactor/rewrite after v1.1.1.
This release reshapes the API around a composable request-building workflow and removes the legacy resource-oriented surface.

### Added

- **Composable Request Builder:** Introduced request-builder-first API (`src/request/builder.ts`, `src/request/index.ts`) for flexible Yahoo path composition.
- **Query Type Layer:** Added dedicated query typing modules under `src/types/query/*`.
- **Client Test Coverage:** Added request-builder-centric and client-focused tests, including `RequestBuilderClient` unit coverage.

### Changed

- **Client Flow:** Refactored `HttpClient` token handling to use a token-provider callback and improved 401 refresh behavior.
- **Examples & Docs:** Reworked examples and docs to align with request-builder usage; removed outdated advanced-query docs/examples.
- **Project Cleanup:** Consolidated and removed obsolete scripts and debug helpers no longer aligned with the v2 direction.

### Removed

- **Legacy Resources:** Removed resource modules (`GameResource`, `LeagueResource`, `PlayerResource`, `TeamResource`, `TransactionResource`, `UserResource`).
- **Legacy Query APIs:** Removed `AdvancedQuery` and `QueryBuilder` implementations from the v1.x approach.

### Breaking Changes

- **Public API Surface:** v1.x resource-based usage patterns are no longer the primary API in this beta.
- **Migration Required:** Existing integrations using removed resource/query-builder APIs will require code changes.
- **Beta Stability:** This is a beta release and public API details may still evolve before stable v2.0.0.

### Deprecated

- **v1.x Line:** All v1.x releases are officially deprecated and no longer recommended for new or existing production use.
- **Support Status:** v1.x is in end-of-life maintenance status and should be migrated to v2.

### Notes

- Migrate all active integrations to the v2 API surface as soon as possible.

---

## [1.1.1] - 2025-11-29

Patch release with bug fixes, parser improvements, and type/refactor cleanups.

### Changed

- **Refactor:** Response types and resource handling reorganized for consistency (game, league, player, team, transaction).
- **Refactor:** Streamlined TypeScript types and simplified `AdvancedQuery` / `QueryBuilder` type safety.
- **Remove:** Unused local OAuth server implementation removed.

### Fixed

- **XML Parser:** Handle empty arrays represented as empty strings and optimized parsing performance.
- **Advanced Query Builder:** Fixed query parameter serialization edge cases.
- **Response Handling:** Resolved edge cases when extracting data from parsed XML responses.

### Added

- **Types:** Stubs for MLB, NBA, and NFL added to support future sport-specific types.

### Notes

- **HttpClient:** TODO added to track automatic token-refresh handling in a future patch.
- **LeagueResource:** `getScoreboard` updated to return a `League`-typed response.

No breaking changes; safe to upgrade for fixes and refactors.

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

[1.0.0]: https://github.com/spiflicate/yfs-api/releases/tag/v1.0.0
[1.1.0]: https://github.com/spiflicate/yfs-api/releases/tag/v1.1.0
[1.1.1]: https://github.com/spiflicate/yfs-api/releases/tag/v1.1.1
[2.0.0-beta.3]: https://github.com/spiflicate/yfs-api/releases/tag/v2.0.0-beta3
[2.0.0-beta.0]: https://github.com/spiflicate/yfs-api/releases/tag/v2.0.0-beta0
[2.0.0-beta.1]: https://github.com/spiflicate/yfs-api/releases/tag/v2.0.0-beta1
[2.0.0-beta.2]: https://github.com/spiflicate/yfs-api/releases/tag/v2.0.0-beta2
