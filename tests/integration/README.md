# Integration Tests

This directory contains integration tests for the Yahoo Fantasy Sports API wrapper. These tests verify real API interactions and end-to-end workflows.

## Canonical Setup

See [docs/INTEGRATION_TEST_SETUP.md](../../docs/INTEGRATION_TEST_SETUP.md) for the authoritative command reference, destructive-test gating policy, and credential requirements.

## Suite Structure

```
integration/
├── auth/              # Authentication tests (oauth1, oauth2)
├── destructive/       # Mutation probes (never selected by normal command)
│   └── trade-drop-semantics.test.ts
├── workflows/         # End-to-end workflow tests
│   └── e2e.test.ts
└── helpers/           # Test utilities
    ├── authFlow.ts    # Manual-test auth helper (see docs/AUTH_FLOW_HELPER.md)
    ├── testConfig.ts  # Configuration helpers
    └── testStorage.ts # Token storage helpers
```

## Test Categories

### Authentication Tests (`auth/`)

- **OAuth 1.0** (`oauth1.test.ts`): public API access without user authorization.
- **OAuth 2.0** (`oauth2.test.ts`): user authentication flow with token management.

### Workflow Tests (`workflows/`)

- **End-to-end** (`e2e.test.ts`): complete user workflows for discovery, teams, players, and league analysis.

### Destructive Tests (`destructive/`)

- **Trade/drop semantics** (`trade-drop-semantics.test.ts`): opt-in write behavior probe, selected only by `test:integration:destructive`.

### Helpers (`helpers/`)

See the [helper README](helpers/README.md) and [docs/AUTH_FLOW_HELPER.md](../../docs/AUTH_FLOW_HELPER.md) for auth helper policy.

## Running Tests

```bash
# Normal read-only integration tests
bun run test:integration

# Destructive mutation tests (requires explicit opt-in)
bun run test:integration:destructive

# Type-check only (no network access required)
bun run type-check:integration
```

## Best Practices

1. Do not commit credentials — use environment variables or `.env.test`.
2. Use test leagues and disposable accounts.
3. Run periodically to detect API drift.
4. When adding tests, use `describe.skipIf()` for conditional execution and follow existing organization patterns.
