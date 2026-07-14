# Integration Tests

Integration TypeScript is checked in strict NodeNext mode:

```bash
bun run type-check:integration
```

To verify parsing and skip behavior without credentials or network access:

```bash
SKIP_INTEGRATION_TESTS=true bun run test:integration
SKIP_INTEGRATION_TESTS=true bun run test:integration:destructive
```

## Live Read Tests

`bun run test:integration` contains GET/read flows only. It requires Yahoo
client credentials and, for authenticated reads, OAuth token environment
variables. Tests skip when prerequisites are absent. Do not place token values
in command history, logs, documentation, or committed files.

## Destructive Tests

Mutation probes live only under `tests/integration/destructive`. They are never
selected by the normal integration command. Run them manually with
`bun run test:integration:destructive` only after configuring a disposable
league and all test resource selectors. The command sets the explicit
destructive opt-in flag; individual tests also require their complete selector
configuration before running.

CI does not run live tests automatically. The live workflow is manual only.
