# Stable Release Audit

Audited at commit `ac79ca9` on 2026-07-13.

## Decision Summary

The stable API should use:

- a pragmatic fluent resource builder for validated Yahoo routes;
- mechanically normalized Yahoo responses: remove transport-only wrappers,
  convert field names to camel case, and normalize collections to arrays;
- endpoint DTOs that document Yahoo's observed fields and nesting without
  introducing a richer domain representation;
- cross-sport core types, with sport-specific precision added only where
  captured evidence supports it;
- supported reads plus roster writes in the first stable release; and
- no compatibility requirement for any `2.0.0-beta.*` API.

## Current Architecture

The repository contains four useful implementation areas:

- `src/client` handles authentication, transport, retries, and errors.
- `src/resources` implements an immutable fluent path builder.
- `src/utils/xmlParser.ts` converts Yahoo XML into camel-cased objects and
  normalizes known collection wrappers.
- `tests/fixtures/data` contains captured cross-sport Yahoo responses.

It also contains competing sources of truth:

- `src/domain/models` contains large aspirational entity definitions.
- `src/domain/responses.ts` contains generic wrappers used by resource methods.
- historical request-schema designs remain in documentation and changelog
  entries after their source was removed.
- ignored/stale `dist` output does not reliably represent current source.

## Verification Results

Commands were run from the repository root.

| Command | Result at audit time |
|---|---|
| `bun run type-check` | Failed because it included obsolete examples, research scripts, fixture collectors, integration tests, and one stale source test import. |
| `bun run build` | Failed on unused `ResponseKeyMap` in `src/domain/responses.ts`. |
| `bun test tests/unit` | Matched no test files. |
| `bun test src` | 284 passed; suite then failed because `PlayerStatsCollection` no longer exists. |
| `bun run lint` | Failed because it scanned research data, temporary files, obsolete code, and a local token file. |
| `bun audit --audit-level high` | Reported reachable high-severity advisories in the XML dependency and development-only advisories. |

Credentialed integration tests were not run. No source files were modified
during the audit.

## Prioritized Findings

### 1. Establish a trustworthy release gate

- **Evidence**: `package.json:24-33`, `src/domain/responses.ts:141`,
  `src/resources/player.test.ts:4`.
- **Impact**: publication currently depends on a build that fails and a test
  command that executes no tests.
- **Effort**: S.
- **Fix risk**: LOW.
- **Confidence**: HIGH.

### 2. Define one wire-to-public-model boundary

- **Evidence**: `src/utils/xmlParser.ts:99-121`,
  `src/resources/resource.ts:131-147`, `src/client/http.ts:481-496`.
- **Impact**: parsed payloads are reshaped heuristically and cast to a
  caller-selected generic type without runtime or fixture validation.
- **Effort**: L.
- **Fix risk**: HIGH because response shape is the SDK compatibility contract.
- **Confidence**: HIGH.

### 3. Replace generic wrappers with endpoint contracts

- **Evidence**: `src/resources/team.ts:166-202`,
  `src/resources/player.ts:230`, `src/resources/roster.ts:53-63`.
- **Impact**: neighboring fluent calls return incorrect wrappers or `unknown`,
  so path typing does not produce reliable result typing.
- **Effort**: M.
- **Fix risk**: MEDIUM.
- **Confidence**: HIGH.

### 4. Consolidate competing model representations

- **Evidence**: duplicate `Config` definitions at `src/client/yahoo.ts:49` and
  `src/domain/common.ts:262`; duplicate response and matchup concepts across
  `src/domain/responses.ts`, `src/domain/models/league.ts`, and
  `src/domain/models/team.ts`.
- **Impact**: maintainers cannot tell whether a type is a Yahoo DTO, a response
  envelope, an operation result, or an unimplemented aspiration.
- **Effort**: M.
- **Fix risk**: MEDIUM.
- **Confidence**: HIGH.

### 5. Make validated route knowledge authoritative

- **Evidence**: distributed methods in `src/resources`, unused parameter lists
  at `src/resources/api.ts:20-24`, throw-only methods at
  `src/resources/user.ts:40-45`, and route verdicts in
  `research/api-path-validation/CURRENT_FINDINGS.md`.
- **Impact**: route support, filters, auth requirements, methods, tests, and
  result types drift independently.
- **Effort**: L.
- **Fix risk**: HIGH if this recreates the historical over-complex type graph.
- **Confidence**: HIGH.

### 6. Correct runtime and packaging behavior

- **Evidence**: extensionless runtime imports such as
  `src/resources/game.ts:1-17`, CommonJS `require()` in ESM at
  `src/auth/oauth1.ts:227-233`, and the root-only export map in
  `package.json:8-13`.
- **Impact**: a TypeScript/Bun build can produce output that cannot be imported
  by an advertised native Node consumer.
- **Effort**: S-M.
- **Fix risk**: LOW.
- **Confidence**: HIGH.

### 7. Make write and authentication behavior safe

- **Evidence**: method-independent retries at `src/client/http.ts:295-526`,
  empty response parsing at `src/client/http.ts:481-496`, concurrent refresh
  paths at `src/client/http.ts:338-352`, optional OAuth state at
  `src/auth/oauth2.ts:131-160`, and unbounded token requests at
  `src/auth/oauth2.ts:237-252`.
- **Impact**: writes can be repeated, successful empty writes can be reported
  as failures, and concurrent token refresh can race.
- **Effort**: M.
- **Fix risk**: MEDIUM.
- **Confidence**: HIGH.

### 8. Align package exports and documentation

- **Evidence**: missing primary DTO and `TransactionBuilder` exports in
  `src/index.ts`, version conflict between `package.json:3`, `README.md:5-13`,
  and `CHANGELOG.md:14-27`, plus removed paths in `CONTRIBUTING.md:76-87`.
- **Impact**: consumers cannot name principal response types and are directed
  to APIs and examples that do not exist.
- **Effort**: M.
- **Fix risk**: LOW after the model contract is settled.
- **Confidence**: HIGH.

### 9. Use captured responses as executable evidence

- **Evidence**: extensive files under `tests/fixtures/data` with no deterministic
  test consumers; current parser tests use small synthetic XML strings.
- **Impact**: real Yahoo response irregularities do not protect the public DTO
  contract from drift.
- **Effort**: M.
- **Fix risk**: LOW.
- **Confidence**: HIGH.

### 10. Address dependency and credential hygiene

- **Evidence**: high-severity parser advisory from `bun audit`; a local OAuth
  token-store filename is absent from `.gitignore:36-44`.
- **Impact**: parser callers are exposed to a denial-of-service class issue,
  and a broad staging operation can capture local OAuth credentials.
- **Effort**: S.
- **Fix risk**: LOW.
- **Confidence**: HIGH.

The local OAuth access and refresh credentials observed during the audit must
be rotated by their owner. No credential value is recorded here.

## Target Boundaries

The stable implementation should have five explicit responsibilities:

1. Transport returns raw XML and owns authentication, retries, timeouts, and
   HTTP errors.
2. Mechanical normalization converts XML to predictable Yahoo-shaped values.
3. Endpoint DTOs document observed normalized values and optionality.
4. Resource builders expose only supported routes and select exact result
   contracts.
5. A separately named advanced escape hatch returns raw XML or `unknown`
   without claiming stable DTO typing.

The route authority should be compact. It must not recreate a deeply recursive
type-level graph. Runtime validation remains authoritative for unusual Yahoo
constraints; TypeScript should make common valid use discoverable.

## Stable Release Gates

- One command runs source type checking, linting, unit tests, and build.
- Every advertised route has path serialization coverage.
- Every advertised result has a named, exported DTO backed by captured data.
- No stable method throws `not implemented`.
- Non-idempotent writes are not automatically retried.
- Built output imports under the minimum supported Node version.
- Maintained examples compile against the packed package.
- README, changelog, package version, and exports describe the same artifact.

## Audit Scope Limits

The audit covered source architecture, public API, response modeling,
authentication, HTTP behavior, parser behavior, tests, package metadata,
documentation, dependency audit output, and release tooling. It did not run
credentialed Yahoo integration tests, benchmark performance, or exhaustively
validate every captured response field against live Yahoo behavior.
