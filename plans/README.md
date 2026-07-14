# Implementation Plans

Generated from the stable release audit on 2026-07-13 at commit `ac79ca9`.
Execute in order unless dependencies say otherwise. Each executor must read its
plan fully, honor STOP conditions, and update the status row when done.

The accepted product direction is recorded in `plans/AUDIT.md`.

## Execution Order And Status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---|---|---|---|
| 001 | Establish a trustworthy verification baseline | P1 | M | - | DONE (`65b8f14`) |
| 002 | Define the normalized Yahoo response contract | P1 | L | 001 | DONE (`9540864`) |
| 003 | Preserve Yahoo response hierarchy through fluent routes | P1 | L | 002 | DONE (`474b2df`) |
| 004 | Harden transport, writes, and OAuth behavior | P1 | L | 003 | DONE (`265ad0d`) |
| 005 | Produce a verifiable stable package | P1 | L | 002, 003, 004 | DONE (`4e56eda`) |

Status values: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED`, `REJECTED`, or
`NOT YET WRITTEN`.

## Dependency Notes

- Plan 001 comes first because architectural work is unsafe while build and
  test commands are not trustworthy.
- Plan 002 establishes the public response vocabulary before resource methods
  can be assigned exact endpoint results.
- Plan 003 must land after Plan 002 because its route map refers to those DTOs.
- Plan 004 can proceed after Plan 001 in parallel with response work.
- Plan 005 is the release closure and depends on every public contract and
  runtime behavior plan.

## Execution Notes

- Plan 001 was implemented and independently verified in the isolated worktree
  `/private/var/folders/45/wdm9f8ks3659fb3gkcvfy_0w0000gn/T/opencode/yfs-api-plan-001`
  on branch `advisor/001-verification-baseline`, commit `5d1e977`.
- Verification passed: type check, product lint, 287 unit tests, declaration
  build, token ignore checks, and runtime XML dependency audit.
- Three high advisories remain in development-only `undici`; they were outside
  Plan 001 and do not affect its approved runtime XML remediation.
- After isolated verification, the main worktree's `package.json` changed
  independently in overlapping dependency and engine fields. Do not blindly
  cherry-pick Plan 001; reconcile that file first and rerun all Plan 001 gates.
- Reconciliation preserves TypeScript 7.0.2, `undici` 8.7.0,
  `fast-xml-parser` 5.10.0, and removal of the Bun engine. TypeScript 7 requires
  an explicit source `rootDir` in `tsconfig.build.json`; this is an approved
  compatibility adjustment within Plan 001's original scope.
- Reconciliation was independently verified and committed as `65b8f14`; the
  aggregate gate passes 287 tests and `bun audit` reports no vulnerabilities.
- Plan 002 initially stopped before edits because captured league/team/user
  responses contain private profile data. The approved direction is in-place,
  deterministic sanitization before those fixtures become contract tests.
- Plan 002 was implemented and independently verified in the isolated worktree
  `/var/folders/45/wdm9f8ks3659fb3gkcvfy_0w0000gn/T/opencode/yfs-api-plan-002`
  on branch `advisor/002-normalized-response-contract`. Commits `45a3ac3` and
  `9540864` provide fixture-backed DTOs, privacy sanitization, editor JSDoc, and
  the observed roster-write confirmation contract. The aggregate gate passes
  295 tests and `bun audit` reports no vulnerabilities.
- Plan 003 was implemented and independently verified in
  `/var/folders/45/wdm9f8ks3659fb3gkcvfy_0w0000gn/T/opencode/yfs-api-plan-003`
  on branch `advisor/003-preserve-response-hierarchy`. Commits `a600640` and
  `474b2df` remove runtime response flattening, preserve typed parent hierarchy,
  enforce validated route contexts, type roster confirmation, and separate raw
  XML access. The aggregate gate passes 299 tests and the audit is clean.
- Plan 004 was implemented and independently verified in
  `/var/folders/45/wdm9f8ks3659fb3gkcvfy_0w0000gn/T/opencode/yfs-api-plan-004`
  on branch `advisor/004-harden-transport-oauth`, commit `265ad0d`. It adds
  method-safe retries, parse/no-content semantics, refresh single-flight,
  explicit OAuth state helpers, token timeouts, Retry-After parsing, and
  concurrency-safe rate admission. The aggregate gate passes 326 tests and the
  audit is clean.
- Plan 005 was implemented and independently verified in
  `/var/folders/45/wdm9f8ks3659fb3gkcvfy_0w0000gn/T/opencode/yfs-api-plan-005`
  on branch `advisor/005-close-stable-release`. Commits `0c2f7e1` and
  `4e56eda` produce the cumulative 2.1.0 release candidate: native NodeNext ESM,
  stable root exports, deterministic exact-tarball verification, strict
  integration/example contracts, compiled examples, current documentation, and
  CI package smoke on Node 18/20/22/24. Package checks pass 326 tests, verify 54
  sanitized fixtures and a 124-entry tarball, and report no vulnerabilities.

## Planning Decisions

- Breaking all beta APIs is allowed.
- Stable scope is validated reads plus roster writes.
- Responses remain faithful to Yahoo after mechanical normalization only.
- The builder favors discoverability and pragmatic typing over maximum
  compile-time graph encoding.
- Core DTOs cover NHL, NFL, MLB, and NBA; detailed sport literals are refined
  only from evidence.

## Findings Considered And Rejected

- Preserve beta compatibility: rejected because it would retain competing
  architectures and compatibility code before any stable contract exists.
- Fully encode Yahoo's route graph in conditional TypeScript: rejected because
  the repository already demonstrates that this complexity becomes a second
  undocumented system to maintain.
- Delay stable release for complete transaction mutations: rejected; the first
  stable scope is reads plus the validated roster PUT workflow.
