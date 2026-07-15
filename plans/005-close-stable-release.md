# Plan 005: Produce A Verifiable Stable Package

> **Executor instructions**: This plan prepares but does not publish `2.1.0`.
> Build and test the exact packed artifact. Stop if native Node, package types,
> integration contracts, or documentation disagree with the package.
>
> **Drift check**:
> `git diff --stat 265ad0d..HEAD -- src package.json bun.lock tsconfig.json tsconfig.build.json README.md CHANGELOG.md CONTRIBUTING.md examples docs tests/integration .github`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 002, 003, and 004
- **Category**: migration, dx, docs, tests
- **Planned at**: commit `265ad0d`, 2026-07-13

## Why This Matters

The current source checks pass, but emitted ESM cannot load in native Node and
OAuth 1 signing uses `require()` inside an ESM module. Package metadata claims a
different release than the README/changelog, current examples are not compiled,
CI is absent, and integration tests encode removed response shapes. A stable
release must prove the exact tarball works for consumers rather than trusting an
ignored pre-existing `dist` directory.

## Current State

- Production source has extensionless relative imports; native import of
  `dist/index.js` fails at a resource import.
- `src/auth/oauth1.ts:227-233` calls `require('node:crypto')`.
- Build configs use bundler module resolution, which hides Node ESM failures.
- `src/index.ts` exports normalized DTOs but omits `RequestOptions`, OAuth 1,
  many key/common types, and public builder input types.
- Transaction writes are outside the accepted stable scope; transaction
  builders must not be promoted merely because historical docs promised them.
- `package.json` is still `2.0.0-beta.4`; README/changelog claim a nonexistent
  released 2.1 line.
- Packed `dist` includes `.tsbuildinfo` and has no installed-consumer smoke test.
- No CI workflow exists.
- Examples import source internals and stale docs reference removed APIs.
- Integration tests parse under Bun when skipped but fail strict type checking
  against parent-preserving responses and removed transaction writes.

## Scope

**In scope**:

- Production/test relative imports under `src/**`
- `src/auth/oauth1.ts` and tests
- `src/index.ts`, `src/domain/index.ts`, stable builder/type exports
- `tsconfig.json`, `tsconfig.build.json`, new integration/example configs
- `package.json`, `bun.lock`, package inclusion/exclusion config
- package smoke fixtures/scripts under `tests/package/**`
- `.github/workflows/ci.yml`
- read-only integration tests/helpers/docs under `tests/integration/**`
- `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`
- maintained `examples/**`
- current auth/token/integration docs; stale historical docs may be clearly
  archived instead of rewritten
- `plans/README.md`

**Out of scope**:

- Publishing, pushing, tagging, or changing Git configuration.
- Transaction mutation support or exporting transaction builders as stable.
- Live credentialed requests during execution.
- History rewriting for pre-sanitization fixtures.
- CommonJS package output.

## Steps

### Step 1: Emit Native Node ESM

Add `.js` to every relative production import/export and normalize source tests
where needed. Use NodeNext module/resolution for the library build. Replace
OAuth 1 `require()` with an ESM `node:crypto` import and correct its JSDoc.

Clean and build, then scan emitted `.js` and `.d.ts` for extensionless relative
specifiers. Native Node must import `dist/index.js`, instantiate a public client,
and call OAuth1 signing with dummy values without network access.

### Step 2: Finalize Stable Root Exports

Export `OAuth1Client` and its public types, `RequestOptions`, all stable common
resource-key types, normalized DTOs, roster builder inputs/outputs, OAuth state
request type, client config, token storage, and error types from the root.

Do not export transaction mutation builders in 2.1 because mutation support is
deferred. Do not export resource implementation classes unless intentionally
supported. Eliminate private types from public method declarations, including
the roster coverage options type.

Add a NodeNext TypeScript consumer that imports every promised symbol from only
`yfs-api`.

### Step 3: Make Packing Deterministic

Set version `2.1.0` in `package.json` and lockfile. Remove TypeScript as a peer;
keep it development-only. Keep Node `>=18`, ESM-only package intent, add
`sideEffects: false`, and record the Bun package manager used for development.
Place the `types` export condition before `import`, and add a `prepack` lifecycle
gate so ordinary npm/Bun pack or publish cannot use stale ignored output.

Move build info outside `dist` or disable incremental release output. Include
`CHANGELOG.md`; keep source/private fixtures out. Add deterministic scripts that
clean, check, build, pack, inspect, install the exact tarball into a temporary
consumer, run native ESM/runtime smoke, and run NodeNext consumer type-check.
Remove automatic `git push` from release scripts. Do not publish.

### Step 4: Align Integration Contracts Safely

Add strict `tsconfig.integration.json`. Update read-only integration tests for
required top-level selectors, parent-preserving response hierarchy, current
league `include(...)`, and current OAuth helpers. Repair token-file availability
checks.

Remove or quarantine transaction mutation tests behind a separate explicit
destructive opt-in; normal integration commands must never create transactions
or roster mutations. Add/retain read-only OAuth1 game, OAuth2 current-user, and
nested response canaries, but do not run them without credentials.

Verification is strict type-check plus a skip-mode parse run with zero network.

### Step 5: Replace Stale Examples And Current Documentation

Maintain a small compiled example set using package-root imports:

- public OAuth1 game read;
- OAuth2 authorization request/state validation and token storage;
- parent-preserving league/team/roster reads;
- roster PUT with confirmation-or-undefined result;
- raw XML escape hatch.

Rewrite README around actual 2.1 API and examples. Update CONTRIBUTING commands
and source layout. Rewrite the 2.1 changelog entry as the release prepared on
2026-07-13; retain older entries under a clearly historical beta heading without
presenting removed APIs as current.

Update current auth/token/integration guides. Mark obsolete design documents as
historical and remove them from current navigation rather than preserving false
instructions. Keep `docs/CONTEXT.md` as the current domain glossary; it defines
stable Yahoo terminology and is not an obsolete implementation guide. Ensure
package-level JSDoc names and examples import `yfs-api`, not a prior package name.

### Step 6: Add CI For The Supported Artifact

Create CI that uses frozen Bun install and runs aggregate checks, integration
type-check, examples type-check, clean build, extension scan, deterministic
pack, and installed-consumer smoke. Run native package smoke on Node 18, 20, 22,
and 24, matching `engines`.

Keep live Yahoo tests separate and manual/scheduled with protected secrets.

### Step 7: Verify The Release Candidate

From a clean ignored-output state, run all source checks, privacy verifier,
audit, integration/example type checks, package check, and Node matrix available
locally. Inspect tarball contents: no `.tsbuildinfo`, source, tests, credentials,
or unexpected files; required README/LICENSE/CHANGELOG/dist/package metadata are
present.

## Done Criteria

- [ ] Native Node imports the built and installed packed package.
- [ ] OAuth1 signing works under Node ESM.
- [ ] Emitted JS/declarations have no extensionless relative specifiers.
- [ ] Root-only consumer imports every stable symbol and type-checks NodeNext.
- [ ] Exact tested tarball has intentional contents and no build info/private data.
- [ ] Version, README, changelog, examples, and package metadata agree on 2.1.0.
- [ ] Strict integration and example type checks pass without network.
- [ ] Destructive live tests require separate explicit opt-in.
- [ ] CI covers source gates and Node 18/20/22/24 package smoke.
- [ ] `bun run check`, privacy verification, and audit pass.
- [ ] Nothing was published, pushed, or tagged.

## STOP Conditions

Stop if Node 18 cannot support the runtime without a documented engine change;
NodeNext declarations require consumer-incompatible syntax; stable root exports
would require transaction writes; integration verification requires live or
destructive requests; package smoke tests a different artifact than the packed
tarball; secrets/private fixture values appear; or release metadata cannot be
made internally consistent without a maintainer decision.

## Maintenance Notes

- Publishing remains a deliberate maintainer action after review and green CI.
- Transaction builders can be exported in a later version only with supported
  mutation routes and deterministic tests.
- Fixture history cleanup remains a separate repository-administration task.
