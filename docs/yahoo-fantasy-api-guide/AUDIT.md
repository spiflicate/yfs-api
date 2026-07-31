# Documentation Review Audit

Working record for the 2026-07-15 review of Yahoo's live [Fantasy Sports API documentation](https://sports.yahoo.com/developer/docs/).

This file records editorial and factual changes so future reviews can distinguish intentional simplification from accidental loss. The editorial schedule is maintained in [docs/DOCUMENTATION_CORRECTIONS.md](../DOCUMENTATION_CORRECTIONS.md); this file only records history.

## Sources Reviewed

- Yahoo live Fantasy Sports page, scraped 2026-07-15; Firecrawl scrape ID `019f66c8-2246-75b1-b725-ca8a3f3b5984`.
- Archived local capture in [`docs/archive/yahoo-developer-docs-capture-2026-05-14.md`](../archive/yahoo-developer-docs-capture-2026-05-14.md), generated 2026-05-14.
- Latest successful static route report in `research/api-path-validation/actionable-route-report.md`; counts are read from the generated report rather than duplicated here.
- Known failures and provisional findings in `research/api-path-validation/CURRENT_FINDINGS.md`.
- One-off live behavior notes in `research/api-path-validation/API_NOTES.md`.

The July live page has the same major API surface as the May capture. Most scrape differences are extraction/link formatting rather than Yahoo contract changes.

## Added To The Guide

| Item | Why |
| --- | --- |
| OAuth 2.0 requirement and Authorization Code flow | Current Yahoo page explicitly requires OAuth 2.0; the old overview incorrectly led with OAuth 1.0a |
| Evidence labels | Separates Yahoo claims, live passes, provisional behavior, and structural rejection |
| `game/dates` | Present in Yahoo's current Game table, absent from the old guide |
| `game/stat_categories` | Present in Yahoo's current Game table |
| `game/position_types` | Present in Yahoo's current Game table |
| `game/roster_positions` | Present in Yahoo's current Game table |
| `league/draftresults` | Present in Yahoo's current League table |
| `team/standings` | Present in Yahoo's current Team table |
| `team/draftresults` | Present in Yahoo's current Team table |
| `player/draft_analysis` | Present in Yahoo's current Player table |
| Team-qualified players | Present in Yahoo's Players collection examples |
| Top-level transactions collection by keys | Present in Yahoo's Transactions collection examples |
| Pending transaction discovery rule | Yahoo's prose is ambiguous; its filter table requires `team_key` with pending types |
| `?format=json` note | Supported by repository format research but omitted from Yahoo's current Fantasy page; not in the static route suite |
| Compact roster PUT response/error note | Confirmed by live probing and SDK contract tests |
| New concise Transactions resource page | The overview linked to a missing file; historical notes existed only under `docs/archive/` |

## Removed Or Corrected

| Previous claim or content | Action | Reason |
| --- | --- | --- |
| "Yahoo Fantasy API uses OAuth 1.0a" | Replaced with OAuth 2.0 as the documented default | Contradicts Yahoo's current page |
| Detailed OAuth 1.0 token/session-handle instructions | Removed from this API guide | Stale for the documented flow; SDK compatibility is noted without making it the default |
| `/users;use_login=1/leagues` | Marked unsupported | Live structural rejection: `subresource leagues not supported` |
| `/users;use_login=1;out=leagues` | Marked unsupported | Same direct structural rejection |
| Unfiltered `/game/{key}/leagues` examples | Replaced with `leagues;league_keys=...` | Yahoo's own table uses keys; live unfiltered requests can return `league ids expected` |
| Broad `games;game_codes=...;out=leagues,players` promotion | Marked as a documented/runtime discrepancy | Repeated live failures despite generic official composition language |
| Claim that team children were only `roster`, `matchups`, `stats` | Expanded | Yahoo currently also lists `standings` and `draftresults` |
| Claim that player children were only `stats`, `ownership`, `percent_owned` | Expanded | Yahoo currently lists `draft_analysis` |
| Large copied XML samples | Removed | They were stale, duplicated Yahoo, and obscured route contracts |
| Specific old-season IDs and athlete examples | Replaced with placeholders | Avoids turning ephemeral examples into apparent contracts |
| Repeated path trees across four files | Consolidated | Keeps each page focused: cheat sheet, reference, decision, and evidence matrix |
| Absolute local link to `src/types/request/schema.ts` | Removed | Non-portable and unrelated to an API consumer guide |

## Retained Despite Yahoo Documentation Gaps

These facts are useful but should remain labeled by evidence rather than presented as official promises.

| Fact | Status | Evidence or caution |
| --- | --- | --- |
| `?format=json` alternate response path | Repository-supported; revalidation recommended | Used by repository OAuth/format research code; writes still use XML |
| `/users;use_login=1/teams` works | Historical-private | Yahoo's User table omits it, but the Teams table includes it |
| Deep user chains such as `users/games/leagues/players` work | Validated | Generic composition plus successful private route probes |
| Teams collection can descend through `roster/players` | Validated | Yahoo says team children inherit, while also saying only one roster period can be requested |
| Players collections support `ownership` and `percent_owned` | Historical-private | Follows Yahoo's generic inheritance rule and passed in a prior private session |
| Nested `league_ids` and `team_ids` filters can work | Provisional | Limited one-off evidence; full keys remain the documented, recommended form |
| Roster players can expose deeper player children | Provisional | `roster/players/stats` worked in a probe; broader bounds are not established |
| OAuth 1.0 signed public requests remain usable | Compatibility observation | Yahoo's current Fantasy page declares OAuth 2.0 required; do not infer long-term support |

## Yahoo Ambiguities And Errors Not Copied Literally

- The page says pending transactions are discovered by filtering by a transaction key, but its examples and filter table use `team_key`. This guide follows the example and filter table.
- The page broadly says every resource child applies to its collection. Live behavior shows that required key filters and route-specific exceptions still matter.
- The page's FAAB add/drop XML shows `destination_team_key` on the dropped player in one sample. The logical and earlier documented field is `source_team_key`; this guide does not reproduce the suspect payload.
- Several current links have malformed braces, and sample responses still contain 2019/2020 data beneath 2025-oriented prose. Those literals are examples, not current fixtures.
- Yahoo calls `metadata` a sub-resource while many examples obtain it by omitting `/metadata`. This guide treats metadata as the default representation.

## Follow-Up Ownership

Validation work is scheduled in [`research/api-path-validation/FOLLOW_UP_RUNS.md`](../../research/api-path-validation/FOLLOW_UP_RUNS.md). Editorial work is scheduled in [`docs/DOCUMENTATION_CORRECTIONS.md`](../DOCUMENTATION_CORRECTIONS.md). This audit does not maintain a separate queue.

## Review Policy

For future updates:

1. Capture the live page and record the date and scrape ID here.
2. Diff endpoint tables, filters, methods, and auth claims rather than copied sample payloads.
3. Preserve validated gap notes unless a new probe contradicts them.
4. Move contradicted behavior to the removed/corrected table with evidence.
5. Keep the user-facing guide concise; put investigation history in this audit file.
