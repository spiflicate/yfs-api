# Plan 003: Preserve Yahoo Response Hierarchy Through Fluent Routes

> **Executor instructions**: Follow this plan step by step. Run every
> verification command before continuing. Stop on any STOP condition rather
> than adding casts, runtime property searches, or a second route graph.
> The reviewer maintains `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 9540864..HEAD -- src/domain src/resources src/client/http.ts src/client/yahoo.ts src/index.ts`
> Any material change to these files requires plan reconciliation.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/002-normalized-response-contract.md`
- **Category**: bug, tech-debt, tests
- **Planned at**: commit `9540864`, 2026-07-13

## Why This Matters

`parseYahooXML()` already preserves Yahoo's normalized root and parent
hierarchy. The resource layer then searches arbitrary descendants by property
name, returns the first matching child, and discards its ancestors. That loses
parent-to-child associations for multi-game, multi-league, and multi-team
responses. This plan returns transport results unchanged and carries an exact
root response type through supported fluent chains without rebuilding the old
deep conditional route schema.

## Current State

- `src/resources/resource.ts:119-148` records route-name response scopes and
  rewrites transport responses to `{ [terminalScope]: resolved }`.
- `src/resources/resource.ts:253-296` recursively searches every object value
  and returns the first matching array item.
- `src/resources/resource.test.ts:178-228` currently characterizes flattening
  and silent fallback for GET, POST, PUT, and DELETE.
- `src/utils/xmlParser.ts:97-120` removes only `fantasy_content`; its remaining
  normalized object is the desired runtime result.
- `src/domain/normalized.ts` contains documented Yahoo entity DTOs and root
  wrappers created by Plan 002.
- `src/resources/team.ts:166-203` incorrectly types matchup and stats results as
  `TeamsResponse`; player stats, transactions, and roster methods still return
  `unknown`.
- `src/resources/user.ts:40-45` exposes throw-only `leagues()` and `players()`.
- `src/resources/transaction.ts:94-99` exposes throw-only PUT and DELETE, while
  transaction writes are outside the accepted stable scope.
- `Config.rawXml` at `src/client/yahoo.ts:112-118` globally changes typed API
  methods into strings without changing their TypeScript return types.
- `research/api-path-validation/VALIDATED_API_PATH_TREE.md:18-85` records the
  positively validated read families. `CURRENT_FINDINGS.md:7-25` rejects direct
  users-to-leagues routes. `API_NOTES.md:34-56` records roster PUT's confirmation
  response.

Repository conventions:

- Immutable path state and clone-style filters are established in
  `src/resources/resource.ts`.
- Resource tests use Bun and mock the transport directly.
- Public DTO comments are evidence-bounded and optimized for editor tooltips.
- Breaking beta return shapes is allowed.

## Commands You Will Need

| Purpose | Command | Expected On Success |
|---|---|---|
| Install | `bun install --frozen-lockfile` | exit 0 |
| Aggregate gate | `bun run check` | type check, lint, all tests, and build pass |
| Resource tests | `bun test src/resources` | all resource tests pass |
| Client tests | `bun test src/client` | all client tests pass |
| DTO tests | `bun test src/domain` | all contract tests pass |
| Fixture privacy | `bun tests/fixtures/sanitize-fixtures.ts` | all fixtures verified |
| Audit | `bun audit --audit-level high` | no vulnerabilities |

## Scope

**In scope**:

- `src/domain/normalized.ts`
- `src/domain/responses.ts`
- `src/domain/index.ts`
- `src/index.ts`
- `src/resources/resource.ts`
- `src/resources/response-contract.ts` (create)
- `src/resources/api.ts`
- `src/resources/game.ts`
- `src/resources/league.ts`
- `src/resources/team.ts`
- `src/resources/roster.ts`
- `src/resources/player.ts`
- `src/resources/transaction.ts`
- `src/resources/user.ts`
- corresponding `src/resources/*.test.ts` files
- `src/client/http.ts` and `src/client/http.test.ts` only for a separately typed
  raw-XML request path
- `src/client/yahoo.ts` and `src/client/yahoo.test.ts` only for removal of the
  type-unsafe global raw mode and exposure of that raw path
- `plans/README.md`

**Out of scope**:

- HTTP retry, rate-limit, empty-response, refresh concurrency, OAuth state, and
  token timeout behavior; Plan 004 owns those.
- Runtime schema validation of Yahoo payload fields.
- New write operations other than the existing roster PUT.
- Complete route-table generation or maximum compile-time route encoding.
- Provisional route promotion, live network probes, or new unsanitized captures.
- README/changelog/package version cleanup; Plan 005 owns release documentation.
- Compatibility aliases for flattened beta results.

## Git Workflow

- Branch: `advisor/003-preserve-response-hierarchy` from commit `9540864`.
- Use Conventional Commits, for example
  `refactor(resources): preserve Yahoo response hierarchy`.
- Do not push, merge, or open a pull request unless explicitly instructed.

## Steps

### Step 1: Make Response Wrapper Names Describe Root Envelopes

Ensure every exported name ending in `ResponseDto` represents the object
returned after only `fantasy_content` removal. Inner required variants must be
named `YahooLeagueWithSettingsDto`, `YahooTeamWithRosterDto`, or equivalent,
not `ResponseDto`.

Keep documented entity DTOs shallow. Correct evidence-backed optionality found
during route review, including `teamPoints` not being universally present on
team stats. Do not widen or require fields without fixture or validated-route
evidence.

**Verify**: `bun test src/domain && bun run build` -> pass; root declarations
show `{ game }`, `{ league }`, `{ team }`, `{ player }`, and `{ users }` wrappers.

### Step 2: Add One Bounded Compile-Time Path Utility

Create `src/resources/response-contract.ts` with internal type utilities that
make a known nested property path required while preserving arrays. A suitable
shape is `RequireResponsePath<TRoot, TPath>` plus a bounded helper for multiple
expansion paths.

The utility must contain no runtime traversal, reflection, or property search.
It must operate on existing DTOs rather than encode allowed routes. Add
compile-time tests for a singular league-to-teams path, plural
leagues-to-teams-to-roster path, and users-to-games-to-teams path.

**Verify**: `bun run type-check` -> pass without excessively deep type errors.

### Step 3: Remove Runtime Response Scope Resolution

Genericize `Resource` over its complete root response and current DTO path.
Remove `RequestState.responseScope`, unused `parts`, `getResponseScope()`,
`resolveResponseScope()`, `findScopedValue()`, and related record-search code.
`performRequest()` must return the transport result unchanged for every method.

Keep path serialization and immutable cloning behavior unchanged. Update
`resource.test.ts` to prove:

- GET returns the exact transport object;
- POST, PUT, and DELETE return exact transport objects;
- duplicate property names at different depths are not searched;
- all parents in arrays remain present; and
- missing child properties do not trigger fallback rewriting.

**Verify**: `bun test src/resources/resource.test.ts` -> pass and no response
scope/search symbol remains in `src/resources`.

### Step 4: Propagate Root Response Types Through Resource Chains

Parameterize each resource/collection class with a root response type and a
bounded current context path. Root factories start with concrete wrappers.
Child methods retain the root and require the requested nested DTO field.
Filters and clones must preserve both generics.

Cover at minimum:

- singular/plural game, league, team, and player roots;
- game to players and keyed leagues to teams;
- users to games, teams, leagues, players, and roster through validated parents;
- league(s) to teams, players, transactions, roster, and roster players;
- team(s) to roster, stats, matchups, and roster players;
- player(s) to stats, ownership, and percent-owned; and
- one or multiple validated `include()` expansions.

Map wire route names explicitly where DTO names differ: `game_weeks` to
`gameWeeks`, `stat_categories` to `statCategories`, `position_types` to
`positionTypes`, player `stats` to `playerStats`, team `stats` to `teamStats`,
and `percent_owned` to `percentOwned`.

Use compile-time assignment or `Expect<Equal<...>>` tests alongside path tests.
Do not introduce `any`, broad public `unknown`, or terminal-only wrappers.

**Verify**: `bun test src/resources && bun run type-check` -> pass.

### Step 5: Remove Unsupported And Throw-Only Stable Methods

Remove direct `users().leagues()` and `users().players()` methods. Retain
`users().teams()` because it has positive validation. Remove transaction PUT,
DELETE, and transaction collection creation methods from the stable fluent
surface; transaction reads nested under validated league parents may remain.

Base `Resource` write methods should be protected so only explicitly supported
subclasses expose them. Roster PUT remains public. Do not expose methods whose
only behavior is `throw new Error('not implemented')`.

Keep provisional path research outside the stable resource API. Do not infer
that a serializable path is supported.

Require a non-empty selector for top-level `games`, `leagues`, `teams`, and
`players` collection roots. Context-sensitive shared collections must not leak
routes: direct `users().teams()` is rooted at `users.teams`, while
`users().games().teams()` is rooted at `users.games.teams`; root `games` must
not expose a direct teams traversal that lacks positive validation. Use a small
capability generic or distinct factory return type, not runtime ancestry search.

Player `ownership()` and `percentOwned()` methods must serialize their validated
child paths (`/ownership`, `/percent_owned`). Keep `include()` only for
positively validated `out=` combinations such as player stats plus ownership;
do not assume a child route and an expansion are interchangeable.

**Verify**: source search finds no `not implemented` method in stable resource
classes; resource tests prove supported user/team and nested transaction reads.

### Step 6: Type Roster PUT As A Separate Write Result

Keep roster XML serialization unchanged. Type `put`, `update`, and `setLineup`
as `Promise<YahooRosterUpdateConfirmationDto>`. Do not apply the roster read
root/context type to a write response. Add a transport test using only the
synthetic `{ confirmation: { status: 'success' } }` payload.

Failures remain HTTP errors; do not invent a failure DTO.

**Verify**: `bun test src/resources/roster.test.ts` -> pass and compile-time
checks confirm the confirmation return type.

### Step 7: Replace Global Raw Mode With An Honest Escape Hatch

Remove `rawXml` from stable client configuration and from typed resource API
construction. Add a separately named raw request method on the client, backed
by an HTTP client method that returns `Promise<string>` after normal auth,
timeout, rate-limit, and HTTP error handling but before XML parsing.

The raw method must be clearly documented as an advanced escape hatch accepting
a Yahoo API path. Typed `api()` methods must always return normalized DTOs and
must never cast raw strings to those DTOs.

Do not duplicate the complete HTTP request implementation. Use a private parse
mode or response-decoder boundary that keeps the public return types honest.

**Verify**: client/HTTP tests prove typed requests parse XML and raw requests
return the untouched XML string; `Config` no longer contains `rawXml`.

### Step 8: Run The Full Contract Matrix

Run all source checks, fixture privacy verification, and dependency audit.
Inspect generated root declarations and ensure no flattened beta aliases are
exported.

**Verify**: `bun run check && bun tests/fixtures/sanitize-fixtures.ts && bun audit --audit-level high`
-> all pass; worktree contains only in-scope modifications.

## Test Plan

- Replace all response-flattening expectations with transport-preservation
  assertions.
- Add compile-time tests for every minimum chain listed in Step 4.
- Test singular, plural, empty, and multi-parent nested responses.
- Test filters and clones after nested traversal to prevent generic erasure.
- Test one and multiple `include()` expansions.
- Test roster PUT confirmation separately from roster GET hierarchy.
- Test raw XML through the separately typed escape hatch.
- Use only sanitized fixtures or synthetic payloads; no network or credentials.

## Done Criteria

- [ ] Runtime resource code never searches or flattens parsed response objects.
- [ ] Typed requests preserve Yahoo root and every requested parent association.
- [ ] Minimum supported fluent chains have compile-time return-type tests.
- [ ] Incorrect `unknown` and `TeamsResponse` endpoint results are removed.
- [ ] Stable resource classes expose no throw-only method.
- [ ] Only roster PUT remains as a stable write operation.
- [ ] Roster writes return `YahooRosterUpdateConfirmationDto`.
- [ ] Raw XML has a separately named `Promise<string>` API and cannot masquerade
      as a normalized DTO.
- [ ] `bun run check` passes.
- [ ] Fixture privacy verification and dependency audit pass.
- [ ] No out-of-scope file changed.

## STOP Conditions

Stop and report if:

- a parsed response does not preserve the hierarchy recorded by validated
  response evidence;
- a route without positive validation must be promoted to complete a chain;
- a field must be required based on only one sport or league context;
- any runtime object search, first-array-item selection, or parent flattening
  appears necessary;
- empty/singular/plural forms cannot share the normalized collection contract;
- raw mode cannot be separated without duplicating the HTTP state machine;
- the type utility produces excessive instantiation depth or materially slows
  `bun run type-check`;
- a write other than roster PUT is required;
- a test requires private fixture values, credentials, or live network access;
- an out-of-scope file is required; or
- a verification fails twice after a reasonable correction.

## Maintenance Notes

- Route validity and response-field evidence are separate. A validated route
  with provisional fields must retain provisional DTO documentation.
- New fluent chains should compose the one path utility and existing DTOs, not
  add another recursive route schema.
- Plan 004 will harden retries, empty responses, OAuth state, refresh
  concurrency, and token request timeouts after this response boundary is stable.
- Plan 005 must update user-facing examples for parent-preserving return shapes.
