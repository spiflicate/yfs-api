# Contributing

## Prerequisites

- Bun 1.3.14
- Node.js 18 or newer

Install the locked dependency graph with `bun install --frozen-lockfile`.

## Branches

`dev` is the default integration branch. Start work from `dev` and target `dev`
with pull requests. Do not commit or open routine pull requests directly against
`main`.

`main` contains only known-good commits and release history. Promote `dev` to
`main` with a pull request after CI passes and the complete package gate has
been verified. Merge promotion pull requests with a merge commit, then
fast-forward `dev` to `main` before starting new work. Create release tags from
`main` only.

## Local Gates

```bash
bun run check:source
bun run clean
bun run build
bun run type-check:examples
bun run scan:extensions
bun run check:package
```

`check:package` creates and installs the exact `yfs-api-2.2.1.tgz` artifact,
runs a native Node import/OAuth 1.0 signing smoke test, and compiles a strict
NodeNext consumer. It never publishes or pushes.

## Tests

Unit tests do not use the network. Normal integration tests contain only read
flows and skip without credentials:

```bash
SKIP_INTEGRATION_TESTS=true bun run test:integration
```

Live tests must be started manually. Mutation tests are quarantined under
`tests/integration/destructive` and run only through the explicit
`test:integration:destructive` command. Never add a mutation test to the
normal integration command.

Do not commit credentials, token files, unsanitized fixtures, generated
tarballs, `dist`, or TypeScript build-info files. Fixture changes must retain
the repository's sanitization guarantees.

## API Changes

- Preserve ESM `.js` relative specifiers in TypeScript source and tests.
- Keep the package root intentionally small and stable.
- Do not export transaction mutation builders or resources.
- Add strict inferred-response tests when changing resource paths.
- Update package-root examples and current docs when behavior changes.

Use Conventional Commits and run the complete package gate before opening a
pull request. Routine pull requests target `dev`; only verified promotion pull
requests target `main`.
