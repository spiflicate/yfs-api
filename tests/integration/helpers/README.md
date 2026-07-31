# Integration Test Helpers

This directory contains helper utilities for integration testing with the Yahoo Fantasy Sports API.

## Available Helpers

### `authFlow.ts` — OAuth Authentication Flow Helper

Manual-test infrastructure, not a package export. Checks token environment variables first, then `.test-tokens.json`, then an interactive OAuth flow when a TTY exists.

**Use this only for local manual testing.** The normal `bun run test:integration` command does not use the interactive helper. See [AUTH_FLOW_HELPER.md](../../../docs/AUTH_FLOW_HELPER.md) for the full policy.

### `testConfig.ts` — Test Configuration Utilities

Low-level helpers for `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`, and credential/token detection. Use when manually managing authentication in a test.

### `testStorage.ts` — Token Storage Implementations

`InMemoryTokenStorage` for ephemeral test use and `createMockTokenStorage()` for predefined token scenarios.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `YAHOO_CLIENT_ID` | Required |
| `YAHOO_CLIENT_SECRET` | Required |
| `YAHOO_REDIRECT_URI` | Default: `oob` |
| `YAHOO_ACCESS_TOKEN` | Pre-configured access token |
| `YAHOO_REFRESH_TOKEN` | Pre-configured refresh token |
| `YAHOO_TOKEN_EXPIRES_AT` | Token expiration timestamp |
| `TEST_LEAGUE_KEY` | Test league key |
| `TEST_TEAM_KEY` | Test team key |
| `SKIP_INTEGRATION_TESTS` | Skip all integration tests |
| `DEBUG` | Enable debug logging |

## See Also

- [AUTH_FLOW_HELPER.md](../../../docs/AUTH_FLOW_HELPER.md) — manual-test auth policy
- [INTEGRATION_TEST_SETUP.md](../../../docs/INTEGRATION_TEST_SETUP.md) — canonical command reference
- [OAUTH2_IMPLEMENTATION.md](../../../docs/OAUTH2_IMPLEMENTATION.md) — OAuth 2.0 implementation
- [TOKEN_FILE_GUIDE.md](../../../docs/TOKEN_FILE_GUIDE.md) — `TokenStorage` contract
