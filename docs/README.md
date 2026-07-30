# yfs-api Documentation

This index maps documentation to its audience. Each file has a single canonical owner; every other reference links here rather than maintaining a second copy.

## Current SDK Users

- Root [README.md](../README.md) — install, import, and basic usage
- [Domain glossary](CONTEXT.md) — fantasy vocabulary and shared terminology
- [OAuth 2.0 implementation](OAUTH2_IMPLEMENTATION.md) — authorization lifecycle
- [Token storage contract](TOKEN_FILE_GUIDE.md) — `TokenStorage` interface

## Yahoo Protocol Reference

- [API overview](yahoo-fantasy-api-guide/OVERVIEW.md) — mental model, keys, surface
- [Path cheat sheet](yahoo-fantasy-api-guide/PATH_CHEAT_SHEET.md) — copy-ready request recipes
- [Path decision tree](yahoo-fantasy-api-guide/PATH_DECISION_TREE.md) — navigate by question
- [Path reference](yahoo-fantasy-api-guide/PATH_REFERENCE_TABLE.md) — resource children and filters
- [Route support matrix](yahoo-fantasy-api-guide/ALLOWED_CHAIN_MATRIX.md) — official vs live-validated
- Resource pages — [Games](yahoo-fantasy-api-guide/resources/GAMES.md), [Leagues](yahoo-fantasy-api-guide/resources/LEAGUES.md), [Teams/Rosters](yahoo-fantasy-api-guide/resources/TEAMS_ROSTERS.md), [Players](yahoo-fantasy-api-guide/resources/PLAYERS.md), [Transactions](yahoo-fantasy-api-guide/resources/TRANSACTIONS.md), [Users](yahoo-fantasy-api-guide/resources/USERS.md)
- [Editorial audit](yahoo-fantasy-api-guide/AUDIT.md) — review history

## Contributors

- [Integration test setup](INTEGRATION_TEST_SETUP.md) — commands, destructive-test gating
- [Auth flow helper policy](AUTH_FLOW_HELPER.md) — manual-test infrastructure rules

## Research And Evidence

- [Path validation harness](../research/api-path-validation/README.md) — route probes and reports
- [Experimental frontend API adapter](frontend-api-adapter.md) — observed JSON routes and browser-session boundaries
- [Guide audit](../research/api-path-validation/GUIDE_AUDIT.md) — claim provenance and discrepancies
- [Follow-up runs](../research/api-path-validation/FOLLOW_UP_RUNS.md) — evidence-producing run queue
- [Route report](../research/api-path-validation/actionable-route-report.md) — current concrete evidence
- [Yahoo API investigation](../research/yahoo-api-investigation/README.md) — HAR-based web API findings

## Archived Material

- [Archive index](archive/README.md) — historical protocol notes
