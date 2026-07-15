# Documentation Correction Schedule

This schedule covers the entire documentation surface, not only `docs/yahoo-fantasy-api-guide/`. It separates editorial consolidation from live API validation so another agent pass does not create a second evidence system.

## Ownership Boundary

| Concern | Canonical home | Secondary presentation |
| --- | --- | --- |
| Package installation, stable API, and exports | Root `README.md` | Source JSDoc and examples |
| SDK OAuth2 behavior | `docs/OAUTH2_IMPLEMENTATION.md` | Short root README example |
| Token persistence contract | `docs/TOKEN_FILE_GUIDE.md` | Root README summary |
| Integration commands and safety policy | `docs/INTEGRATION_TEST_SETUP.md` | Test READMEs link here |
| Manual authorization helper policy | `docs/AUTH_FLOW_HELPER.md` | Helper README reduced to implementation details |
| Fantasy domain vocabulary | `docs/CONTEXT.md` | Protocol guide links to definitions |
| Yahoo protocol overview | `docs/yahoo-fantasy-api-guide/OVERVIEW.md` | Root README and docs index link here |
| Resource semantics and official filters | `docs/yahoo-fantasy-api-guide/resources/*.md` | Cheat sheet summarizes |
| Copy-ready request recipes | `docs/yahoo-fantasy-api-guide/PATH_CHEAT_SHEET.md` | Resource pages provide context |
| Question-to-resource navigation | `docs/yahoo-fantasy-api-guide/PATH_DECISION_TREE.md` | Leaves link to resource pages |
| Current route-support matrix | `docs/yahoo-fantasy-api-guide/ALLOWED_CHAIN_MATRIX.md`, manually derived until Work Package 7 generates it | Guide pages link to it |
| Editorial review history | `docs/yahoo-fantasy-api-guide/AUDIT.md` | No active queue |
| Harness operation | `research/api-path-validation/README.md` | Root docs index links to it |
| Executable route claims | `research/api-path-validation/static-route-definitions.ts` | Generated reports and matrices |
| Current concrete evidence | `research/api-path-validation/actionable-route-report.md` | Findings summarize without owning counts |
| Yahoo claim/runtime discrepancies | `research/api-path-validation/GUIDE_AUDIT.md` | Guide surfaces concise warnings |
| Provisional one-off observations | `research/api-path-validation/API_NOTES.md` | Never promoted without a run |
| Evidence-producing run queue | `research/api-path-validation/FOLLOW_UP_RUNS.md` | This schedule lists editorial dependencies only |
| Release history | `CHANGELOG.md` | Do not rewrite old entries to current behavior |

## Overlap From Prior Spikes

### Route Surface Repeated Across Six Layers

The same routes are independently maintained in:

- `docs/yahoo-fantasy-api-guide/OVERVIEW.md`
- `PATH_REFERENCE_TABLE.md`
- `PATH_CHEAT_SHEET.md`
- `PATH_DECISION_TREE.md`
- `ALLOWED_CHAIN_MATRIX.md`
- `resources/*.md`

Disposition:

- Resource pages own semantics.
- The cheat sheet owns recipes.
- The decision tree owns navigation.
- The matrix becomes generated evidence.
- The overview and reference table become indexes rather than additional route authorities.

### Current Evidence Repeated In Handwritten Files

Current counts, game IDs, route lists, and conclusions appear in:

- Generated `actionable-route-report.md`
- `CURRENT_FINDINGS.md`
- `VALIDATED_API_PATH_TREE.md`
- `GUIDE_AUDIT.md`
- `FOLLOW_UP_RUNS.md`

Disposition:

- The generated report owns counts and concrete results.
- `CURRENT_FINDINGS.md` becomes a short interpretation with links.
- Generate `VALIDATED_API_PATH_TREE.md` from results or delete it.
- `GUIDE_AUDIT.md` owns claim provenance and discrepancies only.
- `FOLLOW_UP_RUNS.md` owns future evidence work without copying report totals.

### Two Active Audit Files

- `docs/yahoo-fantasy-api-guide/AUDIT.md` records editorial history.
- `research/api-path-validation/GUIDE_AUDIT.md` maps Yahoo claims to executable routes and runtime evidence.

Neither should schedule work. Editorial scheduling belongs here; validation scheduling belongs in `FOLLOW_UP_RUNS.md`.

### Root Operational Documentation Overlap

- Root `README.md` duplicates OAuth setup from `OAUTH2_IMPLEMENTATION.md`.
- `AUTH_FLOW_HELPER.md` conflicts with `tests/integration/helpers/README.md` over whether the helper is normal, local-only, or CI-capable.
- `INTEGRATION_TEST_SETUP.md` conflicts with `tests/integration/README.md` over supported commands and destructive-test boundaries.
- `TOKEN_FILE_GUIDE.md` is a token-storage contract despite its filename suggesting file-priority behavior.
- The former `CONTEXT.MD` mixed domain vocabulary with OAuth, transport, route, and XML/JSON claims already owned elsewhere.

Disposition: root README remains concise; root `docs/` files become canonical detailed policy; test READMEs link to them; `CONTEXT.md` narrows to domain language.

### Source Captures And Historical Material

- `docs/new-api-doc-page/docs.md` is an unannotated duplicate scrape.
- `docs/new-api-doc-page/sports-yahoo-com-docs.md` contains the captured Yahoo page twice.
- `docs/archive/TRANSACTIONS.md` is useful historical protocol material but overlaps the current transaction resource page.
- `docs/URL_PATTERN_GUIDE.md` describes removed APIs such as `client.request()`, `.out()`, `.teamKeys()`, and `.buildPath()`.

Disposition:

- Delete `docs/new-api-doc-page/docs.md` after preserving the richer capture.
- Move one deduplicated Yahoo capture to a dated research-source archive with URL, date, tool, and checksum metadata.
- Keep archived transactions behind `docs/archive/README.md` with a clear “Yahoo protocol history, not stable SDK API” boundary.
- Delete `URL_PATTERN_GUIDE.md` after checking for unique explanatory material.
- Remove `docs/.DS_Store` and ensure it remains ignored.

## Ordered Work Packages

### 0. Stabilize Evidence Inputs

Dependencies: current SDK/research changes reviewed; clean commit available.

1. Commit or isolate active DTO and research-ledger changes.
2. Re-run the public strict matrix from a clean commit.
3. Generate and track a sanitized discrepancy report in addition to the positive report.
4. Decide whether tracked reports with `+ working tree changes` are prohibited or accepted solely by content fingerprint.

Completion criteria:

- A fresh clone contains the evidence behind every current support and discrepancy claim.
- Generated artifacts identify a clean revision or an explicitly accepted reproducible fingerprint policy.

### 1. Establish Documentation Topology

Dependencies: none beyond agreement on the ownership table.

1. Add `docs/README.md` as the audience-based index.
2. Link the docs index and Yahoo protocol overview from the root README.
3. Normalize `CONTEXT.MD` to `CONTEXT.md` and fix case-sensitive links.
4. Add `docs/archive/README.md`.
5. Mark generated files with generation headers and source ownership.

Completion criteria:

- A reader can identify current SDK docs, protocol docs, contributor docs, research evidence, and archives without browsing every file.

### 2. Correct Known Evidence Labels

Dependencies: Work Package 0 baseline.

No new Yahoo run is required for these corrections:

1. Rewrite `ALLOWED_CHAIN_MATRIX.md` with current four-sport, current NHL-only, historical-private, documented-only, observed-only, discrepancy, and fixture-unavailable scopes.
2. Mark League `draftresults` as a current NHL pass rather than absent from the suite.
3. Mark `games;game_codes=...;out=leagues,players` as the tested four-sport documented/runtime discrepancy.
4. Mark game-context player search observed-only and prefer keyed player examples.
5. Scope transaction read evidence to the current NHL public league fixture.
6. Remove unqualified `passed` labels from private routes that were not refreshed.
7. Resolve the Games resource page versus chain-matrix conflict over singular Game players and Games-collection players.

Completion criteria:

- Every `safe`, `supported`, `validated`, or `passed` claim states evidence class, sport scope, auth scope, and run provenance.

### 3. Consolidate The Consumer Guide

Dependencies: Work Package 2.

1. Narrow `OVERVIEW.md` to entry-point concepts and major caveats.
2. Add evidence badges to `PATH_CHEAT_SHEET.md`; remove “official and/or validated.”
3. Keep `PATH_DECISION_TREE.md` navigational and move verdicts to the matrix.
4. Reduce `PATH_REFERENCE_TABLE.md` to a generated/mechanically checked index, then evaluate deletion.
5. Keep detailed route semantics only in `resources/*.md`.
6. Replace old literal game IDs and seasons with placeholders.
7. Keep XML/JSON compatibility in one provisional note with a named evidence owner.

Completion criteria:

- A route fact has one canonical prose owner and no contradictory verdict elsewhere.

### 4. Correct Package And Domain Documentation

Dependencies: Work Package 1.

1. Clarify in root README that public OAuth1 is observed SDK compatibility while Yahoo currently documents OAuth2.
2. Keep detailed OAuth2 lifecycle material only in `OAUTH2_IMPLEMENTATION.md`.
3. Rename or retitle `TOKEN_FILE_GUIDE.md` around the `TokenStorage` contract.
4. Narrow `CONTEXT.md` to domain nouns, scoring, visibility, and shared terminology.
5. Remove ambiguous “two-legged OAuth” wording that could be read as OAuth2 client credentials.
6. Keep Yahoo mutation capability separate from this SDK's stable public exports.

Completion criteria:

- Package behavior, Yahoo protocol capability, and observed compatibility cannot be mistaken for one another.

### 5. Correct Contributor And Integration Documentation

Dependencies: Work Package 1.

1. Make `INTEGRATION_TEST_SETUP.md` authoritative for commands and destructive-test gating.
2. Reduce `tests/integration/README.md` to suite structure plus a link to the canonical setup.
3. Make `AUTH_FLOW_HELPER.md` authoritative for manual helper policy.
4. Reconcile `tests/integration/helpers/README.md` with the local-only/CI policy.
5. Verify every documented command against `package.json`.

Completion criteria:

- Contributors have one supported command path and cannot accidentally run destructive tests.

### 6. Retire Spike And Capture Artifacts

Dependencies: Work Package 1 archive policy.

1. Delete obsolete `URL_PATTERN_GUIDE.md` after mining unique content.
2. Delete the stripped duplicate Yahoo scrape.
3. Deduplicate and move the richer Yahoo capture to the research-source archive.
4. Add archive provenance metadata and checksums.
5. Remove `.DS_Store`.

Completion criteria:

- Active docs contain no obsolete SDK APIs or unlabeled copied external documentation.

### 7. Add Drift Prevention

Dependencies: Work Packages 1-3.

1. Generate or test the chain matrix from route definitions and latest results.
2. Generate or remove the validated path tree.
3. Verify every guide evidence marker maps to an executable route or explicit historical record.
4. Add case-sensitive Markdown link checks.
5. Reject official-only routes labeled validated.
6. Prevent static guide prose from duplicating generated report counts.
7. Ensure no ignored `tmp` report is the sole evidence behind a tracked claim.

Completion criteria:

- CI detects stale route verdicts, broken links, duplicated generated facts, and missing tracked evidence.

## Execution Order

| Order | Work package | Can run in parallel with |
| ---: | --- | --- |
| 0 | Stabilize evidence inputs | Initial topology design |
| 1 | Establish documentation topology | Evidence baseline generation |
| 2 | Correct known evidence labels | Nothing editing the same guide files |
| 3 | Consolidate consumer guide | Package/domain corrections after index exists |
| 4 | Correct package/domain docs | Consumer-guide consolidation |
| 5 | Correct contributor/integration docs | Consumer-guide consolidation |
| 6 | Retire spike/capture artifacts | Packages 4-5 after archive policy exists |
| 7 | Add drift prevention | After corrected canonical documents exist |

Validation runs remain ordered separately in `research/api-path-validation/FOLLOW_UP_RUNS.md`. After each run, update generated evidence first, research interpretation second, and user-facing documentation last.
