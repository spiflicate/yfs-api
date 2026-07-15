# Plan 001: Establish A Trustworthy Verification Baseline

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If a STOP condition occurs, stop and report; do not improvise.
> When done, update this plan's row in `plans/README.md` unless a reviewer says
> they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat ac79ca9..HEAD -- package.json bun.lock .gitignore tsconfig.json tsconfig.build.json biome.json src/domain/responses.ts src/resources/player.test.ts`
> If any in-scope file changed, compare the current code with the excerpts below.
> A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests, security, dx
- **Planned at**: commit `ac79ca9`, 2026-07-13

## Why This Matters

The package cannot be stabilized while its normal checks disagree about which
code is active. The build fails, the default test command runs no tests, the
actual source tests contain one stale class reference, and repository-wide
type checking and linting include historical research artifacts. This plan
creates a green, product-scoped baseline without changing the intended public
response model or route behavior.

## Current State

- `package.json:24` defines `test` as `bun test tests/unit`, but that directory
  does not exist. The maintained unit tests are colocated under `src`.
- `package.json:33` makes that empty test target part of `prepublishOnly`.
- `tsconfig.json` has no `include` or `exclude`, so `tsc --noEmit` checks old
  examples, research probes, fixture collectors, and credentialed integration
  tests alongside product source.
- `src/domain/responses.ts:141-143` declares an unused `ResponseKeyMap`, causing
  the declaration build to fail under `noUnusedLocals`.
- `src/resources/player.test.ts:4,60` expects the removed
  `PlayerStatsCollection`; `PlayersCollection.stats()` now returns
  `PlayerStatsResource` at `src/resources/player.ts:79-83`.
- `.gitignore:36-44` ignores several token files but not the local
  `.oauth2-tokens-server.json` filename found during the audit.
- `package.json:77` pins `fast-xml-parser` at a version reported by
  `bun audit --audit-level high` as affected by a high-severity entity-expansion
  advisory. The parser is used at `src/utils/xmlParser.ts:33`.
- `biome.json:8-10` scans the whole repository, including research output and
  temporary captured data. The product code convention is three-space
  indentation and single quotes (`biome.json:11-26`).
- Tests use Bun's colocated `*.test.ts` pattern; use
  `src/client/http.test.ts` and `src/resources/api.test.ts` as structural
  examples.
- Commit messages follow Conventional Commits, for example
  `feat(research): add test data for Yahoo fantasy leagues`.

The domain vocabulary must remain consistent with `docs/CONTEXT.md`: use
resource, collection, sub-resource, parameter, response, public request, and
private request as defined there.

## Commands You Will Need

| Purpose | Command | Expected On Success |
|---|---|---|
| Install | `bun install --frozen-lockfile` | exit 0 |
| Source type check | `bun run type-check` | exit 0, no diagnostics |
| Unit tests | `bun run test` | all colocated source tests pass |
| Product lint | `bun run lint` | exit 0, no diagnostics |
| Build | `bun run build` | exit 0 and declarations emitted to `dist` |
| Dependency audit | `bun audit --audit-level high` | no high advisory from a runtime dependency |
| Aggregate check | `bun run check` | type check, lint, tests, and build all exit 0 |

## Scope

**In scope** (the only files to modify):

- `package.json`
- `bun.lock`
- `.gitignore`
- `tsconfig.json`
- `tsconfig.build.json`
- `biome.json`
- `src/domain/responses.ts`
- `src/resources/player.test.ts`
- `plans/README.md`

**Out of scope**:

- All runtime resource behavior and public response shapes.
- `src/domain/models/**`; Plan 002 owns model changes.
- HTTP retry, OAuth state, token refresh, and empty-response behavior.
- Native Node ESM import rewriting and package consumer smoke tests; these are
  release-artifact work, not required to establish this first source baseline.
- Integration tests requiring Yahoo credentials.
- Research, fixture, old example, and development-document cleanup.
- The untracked local token file itself. Do not read, modify, stage, or delete
  it. Credential rotation is a human action outside this plan.

## Git Workflow

- Branch: `advisor/001-verification-baseline`.
- Make one logical commit with a message such as
  `chore: establish verification baseline`.
- Do not push or open a pull request unless the operator explicitly requests it.
- Never stage the local OAuth token file or `old-types.zip`.

## Steps

### Step 1: Scope Development Checks To Maintained Product Code

Update `tsconfig.json` so normal type checking includes `src/**/*.ts` and does
not discover `research`, `dev-docs`, `examples`, `tests`, generated output, or
dependencies. Source tests must remain included so their imports and calls are
checked. Preserve strict compiler options.

Keep `tsconfig.build.json` limited to production source and its existing test
exclusions. Do not relax `strict`, `noUncheckedIndexedAccess`, build-time
`noUnusedLocals`, or declaration generation. When using TypeScript 7 or newer,
set `rootDir` explicitly to `src` so declaration output remains rooted at the
package source directory.

Change the lint command or Biome include configuration so `bun run lint` checks
maintained product inputs only: `src`, `package.json`, `tsconfig.json`,
`tsconfig.build.json`, and `biome.json`. Do not make historical research files
pass by editing them.

**Verify**: `bun run type-check` may still fail only on the known stale player
test import; it must not report files under `research`, `dev-docs`, `examples`,
or `tests`.

### Step 2: Repair The Source Test And Declaration Build

Delete the unused `ResponseKeyMap` declaration from
`src/domain/responses.ts:141-143`; do not alter response interfaces.

In `src/resources/player.test.ts`, replace the removed
`PlayerStatsCollection` import and assertion with `PlayerStatsResource`, which
is the actual class returned by `PlayersCollection.stats()`. Keep the path
assertion unchanged because it characterizes expected serialization.

Set `package.json`'s unit `test` script to execute the colocated source tests,
using `bun test src` or an equally explicit source-only pattern.

**Verify**: `bun run test` -> all 19 source test files load and every test
passes; `bun run build` -> exit 0.

### Step 3: Add One Aggregate Verification Command

Add a `check` script to `package.json` that runs, in fail-fast order:

1. source type checking;
2. product linting;
3. source unit tests; and
4. the declaration build.

Update `prepublishOnly` to invoke this aggregate command after cleaning, rather
than maintaining a weaker duplicate sequence. Preserve the current `clean`
behavior.

**Verify**: `bun run check` -> every child command exits 0.

### Step 4: Close The Active Credential Ignore Gap

Add `.oauth2-tokens-server.json` to the token section of `.gitignore`. Also add
the README-documented `.tokens.json` filename if it is not already ignored.
Do not use a broad `*.json` pattern and do not touch any token file.

**Verify**: `git check-ignore .oauth2-tokens-server.json .tokens.json` -> both
paths are printed.

### Step 5: Upgrade The Runtime XML Dependency Safely

Update `fast-xml-parser` to the smallest compatible patched release that clears
the reported high-severity parser advisory. Update `bun.lock` using Bun rather
than hand-editing it. Do not perform unrelated major dependency upgrades.

Run all XML parser tests after the upgrade. Existing mechanical normalization
must remain unchanged: camel-case field names, string `gameKey`, normalized
arrays, empty collections, and boolean fields must retain their tested values.

Development-only `undici` advisories are not part of this plan unless the lock
operation updates `undici` within its existing declared range without source
changes.

**Verify**: `bun test src/utils/xmlParser.test.ts` -> all tests pass;
`bun audit --audit-level high` -> no high advisory for the runtime
`fast-xml-parser` dependency.

### Step 6: Run The Clean Baseline From End To End

Run the aggregate command, inspect status, and confirm only in-scope files were
modified. Generated `dist` output is ignored and must not be staged.

**Verify**: `bun run check` -> exit 0; `git status --short` -> no modified path
outside the in-scope list and the operator's pre-existing untracked files.

## Test Plan

- Preserve all existing parser assertions in `src/utils/xmlParser.test.ts`.
- Update only the stale class assertion in `src/resources/player.test.ts`; its
  path assertion must continue to prove collection-to-stats serialization.
- Run all colocated source tests, not only the two changed files.
- Do not add live network tests or credentials.

## Done Criteria

- [ ] `bun run type-check` exits 0 with no diagnostics.
- [ ] `bun run lint` exits 0 with no diagnostics.
- [ ] `bun run test` executes the colocated source suite and all tests pass.
- [ ] `bun run build` exits 0 and emits declarations.
- [ ] `bun run check` executes all four gates and exits 0.
- [ ] `bun audit --audit-level high` reports no high advisory reachable through
      the runtime XML parser dependency.
- [ ] `git check-ignore .oauth2-tokens-server.json .tokens.json` prints both.
- [ ] No runtime response shape or resource method changed.
- [ ] No out-of-scope file is modified or staged.
- [ ] Plan 001 is marked `DONE` in `plans/README.md` when approved.

## STOP Conditions

Stop and report rather than improvising if:

- any in-scope code differs materially from the Current State excerpts;
- the XML parser upgrade changes an existing normalized value;
- clearing the parser advisory requires a breaking major upgrade or source API
  migration;
- product-scoped type checking reveals errors beyond the known stale player
  test and unused response map;
- TypeScript 7 compatibility requires source changes beyond an explicit
  `rootDir` in `tsconfig.build.json`;
- making lint pass requires modifying product source unrelated to this plan;
- any verification fails twice after a reasonable correction; or
- an out-of-scope file appears necessary.

## Maintenance Notes

- Future source directories must be added deliberately to type-check and lint
  scope rather than returning to repository-wide accidental discovery.
- Plan 005 must add a native Node packed-package smoke test; this plan proves
  source consistency, not distributable ESM compatibility.
- Review dependency changes for unrelated lockfile churn.
- Credential rotation remains required even after ignore rules are fixed.
