# Plan 004: Harden Transport, Writes, And OAuth

> **Executor instructions**: Execute test-first. Preserve typed reads, roster
> PUT, and separately typed raw XML. Stop instead of silently retaining unsafe
> retries or introducing client-global OAuth state.
>
> **Drift check**:
> `git diff --stat 474b2df..HEAD -- src/client src/auth src/resources/resource.ts src/resources/roster.ts src/utils/constants.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/003-preserve-response-hierarchy.md`
- **Category**: bug, security, tests
- **Planned at**: commit `474b2df`, 2026-07-13

## Why This Matters

The shared request loop retries writes after ambiguous failures, retries parser
errors as network failures, and cannot represent successful empty writes.
Concurrent requests independently refresh the same token. OAuth state is
optional and token endpoint calls are unbounded. These behaviors can duplicate
roster changes, race persisted credentials, hang authentication, and encourage
unsafe callback handling.

## Current State

- `src/client/http.ts:296-314` sends every method through one retry loop.
- `src/client/http.ts:472-545` retries retryable statuses and ordinary errors
  for all methods; XML parse failures become `NetworkError`.
- `src/client/http.ts:437-455` replays a 401 once, including writes.
- `src/client/http.ts:500-520` parses every typed success, including 204/empty.
- `src/client/http.ts:357-375` and `437-455` can refresh concurrently.
- `src/client/yahoo.ts:302-320` and `537-553` use separate automatic/manual
  refresh paths that can persist out of order.
- `src/auth/oauth2.ts:128-160` accepts optional caller state and provides no
  validation helper.
- `src/auth/oauth2.ts:237-252` fetches tokens without a timeout.
- `src/client/http.ts:413-426` parses only numeric `Retry-After`.
- `src/client/http.ts:70-105` does not serialize rate-limit admission.
- `ParseError` already exists in `src/client/errors.ts:199-212`.

## Scope

**In scope**:

- `src/client/http.ts`, `src/client/http.test.ts`
- `src/auth/oauth2.ts`, `src/auth/oauth2.test.ts`
- `src/client/yahoo.ts`, `src/client/yahoo.test.ts`
- `src/resources/resource.ts`, relevant resource tests
- `src/resources/roster.ts`, `src/resources/roster.test.ts`
- `src/utils/constants.ts`
- `src/index.ts` only if a new public OAuth helper type must be exported
- `plans/README.md`

**Out of scope**:

- Transaction or generic write APIs.
- Runtime response schema validation.
- Automatic storage of OAuth state inside a shared client.
- Package/docs/CI release closure.
- Changes to normalized read response hierarchy.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Baseline | `bun install --frozen-lockfile` | exit 0 |
| Focused | `bun test src/client src/auth src/resources/roster.test.ts` | pass |
| Full | `bun run check` | pass |
| Privacy | `bun tests/fixtures/sanitize-fixtures.ts` | pass |
| Audit | `bun audit --audit-level high` | no vulnerabilities |

## Steps

### Step 1: Add Regression Tests First

Add deterministic tests for unsafe-method retries, parser failures, 204/empty
success, refresh concurrency and rejection recovery, OAuth state, token timeout,
HTTP-date retry delays, and more than one rate-limit window of concurrent
admissions. Use fake clocks/injected timing where needed; do not make the suite
sleep for real rate-limit windows.

### Step 2: Make Retries Method-Aware

Keep automatic status/network retries for GET. Do not automatically replay
POST, PUT, or DELETE after network ambiguity, retryable status, parse failure,
or 401. Pre-request refresh of a token known to be expired remains allowed
because the write has not been sent.

Do not add an unsafe retry opt-in unless a concrete idempotency mechanism exists.

### Step 3: Separate Parse And Empty-Success Semantics

Wrap typed XML parse failures in `ParseError` so they are never retried. Raw XML
returns bytes unchanged, including `''`.

For POST/PUT/DELETE, return `undefined` for 204 or whitespace-only success. A
typed empty GET is `ParseError`. Propagate `T | undefined` through write-only
transport/resource methods and roster PUT/update/setLineup. Do not manufacture
a roster confirmation.

### Step 4: Serialize Token Refresh

Use one in-flight refresh promise and clear it in `finally`. Concurrent expired
requests and same-token GET 401 responses must join it. If a stale GET 401
arrives after another refresh, retry with the provider's newer token without
refreshing again. Never replay write methods after 401.

Share one Yahoo-client refresh helper between automatic and manual refresh so
tokens are persisted once. Rejection must be shared and a later attempt must be
able to retry.

### Step 5: Add Explicit OAuth State APIs

Keep the existing caller-supplied URL method for compatibility, and add:

```ts
interface OAuth2AuthorizationRequest {
  url: string;
  state: string;
}
```

Add `createAuthorizationRequest(language?)` using a cryptographically secure
state and `validateAuthorizationState(expected, received)` throwing
`AuthenticationError` for missing/mismatched values. Forward both from the main
client. Applications remain responsible for per-session persistence.

### Step 6: Bound Token Requests

Add an OAuth2 timeout option defaulting to the existing request timeout. Pass an
abort signal to token fetch and pass main client timeout configuration into the
OAuth2 client. Convert timeout failure to a stable `AuthenticationError` with
the original cause retained.

### Step 7: Correct Retry-After And Rate Admission

Parse delta seconds and HTTP-date, clamp past dates to zero, and use 60 seconds
for missing/invalid values. Exposed delays must always be finite.

Serialize only rate-limiter admission with a promise-chain mutex. Prune, wait,
and recheck in a loop before recording each timestamp. Release admission before
fetch. Use constants from `src/utils/constants.ts`.

### Step 8: Verify Full Behavior

Run focused and full gates, fixture privacy verification, audit, diff scope, and
generated declaration inspection.

## Done Criteria

- [ ] Writes are never replayed automatically after dispatch.
- [ ] Parse failures are `ParseError` and cause one fetch.
- [ ] Empty write success returns typed `undefined`; empty typed GET fails.
- [ ] Concurrent refreshes produce one token request and one persistence write.
- [ ] OAuth state generation and validation are explicit and documented.
- [ ] OAuth token requests use configured timeout.
- [ ] Both Retry-After forms produce finite delays.
- [ ] Concurrent rate-limit admission respects the configured rolling window.
- [ ] `bun run check`, privacy verification, and audit pass.
- [ ] No out-of-scope file changed.

## STOP Conditions

Stop if automatic write replay is required for compatibility; OAuth state would
need client-global storage; confirmation-only roster typing cannot accept
observed no-content success; token persistence semantics require a transaction;
the task expands into transaction writes or raw/typed response merging; tests
require real network/time delays; or an out-of-scope file is required.

## Maintenance Notes

- Future write retries require endpoint-supported idempotency, not a global flag.
- Applications must store generated OAuth state per user/session.
- Plan 005 documents the new authorization helper and no-content roster result.
