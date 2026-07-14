# Plan 002: Define The Normalized Yahoo Response Contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command before continuing. Stop and report on any STOP
> condition; do not invent response fields or restructure Yahoo data.
>
> **Drift check (run first)**:
> `git diff --stat 65b8f14..HEAD -- src/domain src/utils/xmlParser.ts src/utils/xmlParser.test.ts tests/fixtures/data src/index.ts`
> Any material runtime or model change requires this plan to be refreshed
> before execution.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/001-verification-baseline.md`
- **Category**: tech-debt, tests, direction
- **Planned at**: commit `65b8f14`, 2026-07-13

## Why This Matters

The package promises typed responses, but its current models mix observed Yahoo
fields, duplicate domain concepts, generic wrappers, and aspirational operation
results. This plan makes captured Yahoo behavior the authority and defines the
stable normalization boundary. It deliberately avoids adding a richer domain
model: types should teach consumers Yahoo's API, not hide it behind a second
representation.

## Current State

- `src/utils/xmlParser.ts:45-73` camel-cases XML tags, parses scalar values, and
  converts a selected set of `0`/`1` fields to booleans.
- `src/utils/xmlParser.ts:282-354` removes singular collection wrappers and
  normalizes known plural collections to arrays.
- `parseYahooXML<T>` at `src/utils/xmlParser.ts:99-121` accepts any caller type
  and returns the normalized object through a cast.
- `src/domain/models/game.ts`, `league.ts`, `team.ts`, `player.ts`,
  `transaction.ts`, and `user.ts` contain large interdependent models. Several
  concepts, including matchup and response wrappers, are duplicated.
- `src/domain/common.ts:230-253` exports `ApiResponse<T>`, but runtime requests
  do not return its `{ data, meta }` shape.
- `src/domain/responses.ts` wraps singular and plural entities, but several
  endpoint resources use an unrelated wrapper or return `unknown`.
- `tests/fixtures/data` contains captured normalized responses across NHL, NFL,
  MLB, and NBA. Repository search found no deterministic test that imports
  these fixtures.
- `tests/fixtures/data/game-nhl.json` demonstrates the accepted normalized
  representation: `gameKey`, numeric `gameId`, and boolean status fields.
- `tests/fixtures/data/league-nhl-l-121384-settings.json` demonstrates that
  requested sub-resources remain nested on their Yahoo parent after mechanical
  normalization.

Accepted contract:

- remove the top-level `fantasy_content` transport wrapper;
- convert Yahoo snake-case names to camel case;
- replace plural-container/singular-item wrappers with arrays;
- preserve Yahoo field meaning, parent-child nesting, empty values, and
  endpoint-specific optionality;
- do not rename concepts, synthesize metadata, combine endpoints, or introduce
  behavior-rich entities; and
- keep raw XML as a separately typed transport/advanced concern.

## Commands You Will Need

| Purpose | Command | Expected On Success |
|---|---|---|
| Baseline | `bun run check` | exit 0 before and after work |
| Parser tests | `bun test src/utils/xmlParser.test.ts` | all pass |
| Response contract tests | `bun test src/domain` | all new contract tests pass |
| Build | `bun run build` | declarations emit without errors |

## Scope

**In scope**:

- `src/domain/**`
- `src/utils/xmlParser.ts`
- `src/utils/xmlParser.test.ts`
- new deterministic response-contract tests under `src/domain/**`
- `src/index.ts`
- `src/resources/*.ts` only when required to update type-only imports after a
  DTO move; resource methods, paths, serialization, and runtime behavior must
  not change
- `tests/fixtures/data/**` may be sanitized in place to replace private
  league/team/user contact and profile values with deterministic placeholders
  while preserving schema, scalar types, resource-key formats, and
  cross-fixture relationships
- `plans/README.md`

**Out of scope**:

- Resource route methods and endpoint return-type assignment; Plan 003 owns it.
  Type-only import path updates are the sole permitted resource-file change.
- HTTP retries, OAuth, raw request API design, and roster write behavior.
- Editing fixture structure or values merely to make a type fit. Privacy
  sanitization is required, but schema and Yahoo-observed value categories must
  remain representative.
- Complete sport-specific stat enums.
- Runtime schema validation of every response field.
- Compatibility aliases for beta model names.

## Git Workflow

- Branch: `advisor/002-normalized-response-contract`.
- Use Conventional Commits, for example
  `refactor(types): define normalized Yahoo DTOs`.
- Do not push or open a pull request without explicit operator instruction.

## Steps

### Step 1: Sanitize And Inventory Representative Captured Shapes

Before importing captured responses into tests, sanitize all committed fixture
values that identify private leagues, fantasy teams, Yahoo users/managers, or
their contact/profile/chat details. Use deterministic synthetic replacements so
the same source value maps to the same placeholder across files. Preserve JSON
structure, scalar types, valid resource-key formats, URLs where their shape is
part of the contract, and relationships between league/team/user captures.
Public professional-player names and public sports metadata are not private
manager profile data and should remain representative.

Do not print original sensitive values in logs, comments, commits, or reports.
Add a small sanitizer script only if it is needed to make the transformation
repeatable and reviewable; place it under `tests/fixtures` and keep it free of
source values. The reusable script must sanitize and verify files currently on
disk; it must not read private source values from an earlier Git commit or keep
a permanent dependency on pre-sanitization history. It must verify shape before
writing and be idempotent. Tests must assert placeholders rather than personal
values.

Then select a minimal fixture matrix covering singular and collection responses for
game, league settings/standings/scoreboard, team roster/stats/matchups, player
metadata/stats/ownership, user games/teams, and transaction reads. Include at
least one fixture from each sport for core game/player differences.

Write a short source-controlled fixture matrix comment or test table inside the
new response-contract test file. Do not create a second planning document and
do not copy sensitive user identifiers into comments.

**Verify**: every selected fixture exists; all changed fixture files remain
valid JSON; a key-based privacy scan reports no unsanitized private profile or
contact value; structural comparison confirms no object key, array length, or
scalar type changed solely because of sanitization.

### Step 2: Separate Shared Yahoo Fragments From Endpoint DTOs

Refactor `src/domain` into a small public DTO surface. Shared fragments are
appropriate only when captured responses use the same shape and optionality.
Endpoint-specific projections should remain distinct when Yahoo differs by
context.

Every exported DTO and every non-obvious public field must have useful JSDoc
that explains Yahoo's meaning, units or format where known, and when the field
is present. These types are the primary API documentation; replacing detailed
model comments with bare property lists does not satisfy this plan. Do not claim
more certainty than captured evidence supports. Mark intentionally exported
but unverified endpoint variants as provisional in JSDoc.

At minimum define named exported contracts for:

- game metadata and game collections;
- league metadata, settings, standings, and scoreboard;
- team metadata, roster, stats, and matchups;
- player metadata, stats, ownership, percent-owned, and draft analysis;
- logged-in user responses; and
- transaction read data and roster-update confirmation.

Names must identify normalized Yahoo DTOs or endpoint responses clearly. Remove
the unused `ApiResponse<T>` abstraction and duplicate wrappers that no runtime
endpoint is intended to return. Do not preserve beta names solely for
compatibility.

**Verify**: `bun run build` -> exit 0; generated declarations contain each
intended public contract.

### Step 3: Make Fixtures Compile Against The Contracts

Add table-driven deterministic tests that import representative JSON fixtures
and use TypeScript's `satisfies` operator or a typed identity helper to prove
their checked-in normalized shape is assignable to the corresponding DTO.
Tests must also assert a few load-bearing runtime values per endpoint: keys,
array normalization, nested sub-resource location, booleans, numbers, and empty
collections where represented.

Do not cast fixture values with `as Contract`; that would bypass the purpose of
the test. If JSON inference widens a literal beyond an intentionally narrow
union, either keep Yahoo's field type appropriately broad or use a local
fixture parsing boundary that still checks object structure.

**Verify**: `bun test src/domain` -> all contract tests pass.

### Step 4: Document And Preserve The Mechanical Parser Boundary

Keep parser runtime behavior unchanged while documenting its exact mechanical
normalization boundary in exported JSDoc and tests. Existing parser tests must
continue to prove camel casing, string `gameKey`, boolean conversion, and array
normalization.

Do not add endpoint-specific restructuring to the parser. It may mechanically
normalize transport syntax only. Removing the unconstrained parser generic and
moving narrowing to endpoint-owned decoders is deferred to Plan 003 because it
requires coordinated changes in `src/client/http.ts` and resource return paths.

**Verify**: `bun test src/utils/xmlParser.test.ts` -> all tests pass;
`bun run type-check` -> parser behavior and current callers remain compatible.

### Step 5: Export The Public DTO Vocabulary

Update `src/domain/index.ts` and `src/index.ts` to export the stable DTOs and
their shared fragments. Export only contracts intended for consumers; internal
parser helpers and fixture-test utilities remain private.

Verify declarations from the root package entry point rather than relying on
deep imports, because `package.json` exposes only `.`.

**Verify**: `bun run build` -> exit 0; a temporary TypeScript consumer outside
the repository source can import representative DTO names from `./dist/index.js`
for type checking without deep paths. Do not commit the temporary file.

### Step 6: Remove Superseded Model Definitions

Delete duplicate or aspirational definitions once all intended public exports
point to the normalized DTO vocabulary. Avoid compatibility re-exports. Search
the active source for old model names and classify every remaining reference as
an intentional stable name or remove it.

**Verify**: `bun run check` -> exit 0; no duplicate `Config`, response wrapper,
or matchup definition remains in active source unless the endpoint shapes are
demonstrably different and distinctly named.

## Test Plan

- Add one table-driven contract suite using the selected checked-in fixtures.
- Cover all four sports at the cross-sport core level.
- Cover singular resources, plural collections, nested sub-resources, empty
  collections, booleans, numeric values, and fields that Yahoo returns as empty
  strings.
- Preserve all parser normalization tests.
- Do not use network access, snapshots, or broad type assertions.

## Done Criteria

- [ ] Plan 001 is marked `DONE` and `bun run check` starts green.
- [ ] Public DTOs describe normalized Yahoo data rather than a richer domain.
- [ ] Exported DTOs and non-obvious fields have useful evidence-bounded JSDoc
      so editor tooltips explain Yahoo semantics and presence conditions.
- [ ] Representative fixtures for every stable response family are checked by
      deterministic tests.
- [ ] At least one core fixture from NHL, NFL, MLB, and NBA is covered.
- [ ] Parser JSDoc and tests define mechanical normalization without claiming
      endpoint validation; generic narrowing is explicitly deferred to Plan 003.
- [ ] `ApiResponse<T>` and duplicate unused response concepts are removed.
- [ ] Stable DTOs are importable from the package root declarations.
- [ ] `bun run check` exits 0.
- [ ] Captured fixtures contain deterministic placeholders instead of private
      league/team/user contact or profile values, with schema and scalar types
      preserved.
- [ ] The sanitizer/verifier is idempotent and has no dependency on a Git
      commit containing the original private values.
- [ ] No out-of-scope file is modified.

## STOP Conditions

Stop and report if:

- Plan 001 is not complete or the baseline is not green;
- a selected fixture contains credentials rather than sanitizable profile data;
- sanitization cannot preserve cross-fixture relationships or valid key formats;
- two fixtures conflict on a required field or scalar type and the difference
  cannot be represented honestly with optionality or a Yahoo-observed union;
- satisfying a DTO requires changing a fixture;
- the parser would need endpoint-specific semantic restructuring;
- the work requires assigning resource return types before the DTO vocabulary
  is stable; or
- `bun run check` fails twice after reasonable corrections.

## Maintenance Notes

- New fields should be added from captured evidence and accompanied by fixture
  coverage.
- A field omitted by one endpoint should not automatically become optional in
  every endpoint projection; prefer endpoint-specific DTO composition.
- Reviewers should reject convenient casts that make fixture tests vacuous.
- Plan 003 must map resource paths to these exact endpoint contracts and remove
  heuristic result typing.
- Sanitizing the working tree does not remove prior values from Git history. If
  this repository has been public or shared, assess history cleanup separately.
