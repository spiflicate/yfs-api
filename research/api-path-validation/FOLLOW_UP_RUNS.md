# Follow-Up Validation Runs

This ledger turns unresolved research into repeatable runs. Yahoo documentation remains a claim source; only fixture-specific live results with semantic key and shape checks can change SDK or guide support statements.

## Current Baseline

- Strict public run: `2026-07-15T19-33-25-809Z`
- Matrix: 120 scenarios; 75 passed; 0 failed; 45 fixture-unavailable; 0 shape warnings
- Four-sport discrepancy run: `2026-07-15T19-10-59-454Z`
- Known discrepancy: ``route:invalid-games-out-leagues`` returned `league ids expected` for NFL, MLB, NBA, and NHL
- Current blocker: private OAuth2 authorization requires an interactive refresh
- Fixture gap: no reproducible NFL, MLB, or NBA public league fixtures

## Run Protocol

1. Record the source revision, source fingerprint, non-sensitive profile fingerprint, CLI options, and run ID.
2. Use `--strict-shapes`; use `--allow-incomplete` only while fixture gaps are expected.
3. Require semantic key equality for keyed collections. A valid envelope containing unrelated resources is a failure.
4. Classify authentication, fixture, transient, parser, empty-data, response-mismatch, and unsupported-route failures separately.
5. Keep raw private responses in ignored `tmp/` artifacts. The tracked report must contain only sanitized facts and normalized private failures.
6. Update `GUIDE_AUDIT.md`, `CURRENT_FINDINGS.md`, and the checked-in report only after the run completes.
7. Promote an SDK or guide claim only for the sports and fixtures that passed. Preserve explicit gaps for every other sport.

## Queue A: Authentication And Private Reads

Goal: refresh private evidence without treating authorization failure as route evidence.

1. Reauthorize OAuth2 interactively, then run private discovery for one sport before expanding to all four.
2. Compare OAuth2 and observed OAuth1 compatibility on the same non-private Game route.
3. Run ``route:user`` and ``route:user-teams`` without unrelated fixture discovery.
4. Revalidate team standings, team draft results, player draft analysis, direct transactions, and top-level keyed transactions.
5. Record Read versus Read/Write scope. Do not execute mutations in this queue.

Evidence gate: private routes need an authorized account fixture, strict shape checks, and no raw account text in the tracked report.

## Queue B: Cross-Sport League Fixtures

Goal: determine whether NHL-only league and team evidence generalizes.

1. Obtain reproducible current public league fixtures for NFL, MLB, and NBA.
2. Re-run ``route:leagues-by-key``, ``route:league-teams``, ``route:leagues-teams``, ``route:teams-by-key``, ``route:team-players``, and ``route:league-scoreboard-current``.
3. Compare response shapes by sport rather than assuming NHL DTOs are universal.

Evidence gate: each sport must independently return the requested keys and pass its child shape assertions.

## Queue C: Default And Period Forms

Goal: establish exact equivalence between default resources and explicit periods.

1. Add bare team stats, roster, and matchups alongside explicit season/week/date routes.
2. Add NFL player week stats and MLB/NBA/NHL player date stats.
3. Compare default scoreboard and roster periods with explicit values captured in the same run.

Evidence gate: report the resolved period and key facts; a shape-only pass is insufficient.

## Queue D: Filters And Pagination

Goal: verify filter semantics rather than merely successful responses.

1. Extend ``route:games-available-by-code`` with separately tested `game_types` and combined filters.
2. Compare `/games;game_keys={game_code}` with `/games;game_codes={game_code}` for every supported code and verify equivalent returned game keys before reconsidering a separate SDK query.
3. Add league-context player search, status variants, pagination, sorting, and sport-specific sort periods.
4. Verify every returned item satisfies the requested key, status, position, period, or pagination boundary where observable.

Evidence gate: filters need semantic assertions specific to the filter. Non-empty data alone cannot establish support.

## Queue E: Transactions And Mutations

Goal: distinguish completed, waiver, pending-trade, and write behavior.

1. Discover completed transaction fixtures separately from waiver and pending-trade fixtures.
2. Validate completed `.tr.`, waiver `.w.c.`, and pending-trade `.pt.` key grammars.
3. Add transaction metadata, players, `type`, `types`, and `team_key` filter cases.
4. Catalog roster PUT and transaction POST/PUT/DELETE payload schemas without executing them.
5. Execute mutations only with Read/Write scope, explicit destructive opt-in, disposable fixtures, and a rollback/cleanup plan.

Evidence gate: normal research commands must never mutate a league.

## SDK Synchronization

Implemented from current four-sport evidence, pending normal review and commit:

- `YahooGameDto.dates` with observed season boundaries.
- `YahooGameDto.rosterPositions` with optional item fields where element contracts remain under-specified.

Deliberate non-feature:

- Do not add a separate `api.gamesByCode(...)` API. Yahoo accepts known game codes as game keys, and the existing `GameKeyLike` surface already represents that behavior without a parallel filter API. Keep the live `game_codes` routes as protocol evidence, not an SDK requirement. Reconsider only if the equivalence run above finds distinct semantics worth exposing.

Candidate SDK work after additional evidence:

- Direct Game child builders for metadata, dates, weeks, categories, position types, and roster positions.
- Direct League scoreboard with an optional week.
- NHL-backed Team players and League draft-results DTOs, without cross-sport claims.
- Direct settings/standings resources and no-filter collection ergonomics.

Do not enable Games `out=leagues`, direct users-to-leagues, unverified private children, or mutation helpers based only on generic Yahoo composition prose.

## User-Facing Documentation Queue

The canonical editorial and consolidation schedule is [docs/DOCUMENTATION_CORRECTIONS.md](../../docs/DOCUMENTATION_CORRECTIONS.md). This file owns only evidence-producing runs and their promotion gates.

After each relevant run, update generated evidence first, research interpretation second, and user-facing documentation last. Counts should come from `actionable-route-report.md`; do not duplicate them in static guide prose.
