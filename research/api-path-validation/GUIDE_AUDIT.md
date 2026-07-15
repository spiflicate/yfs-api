# Yahoo Guide Coverage Audit

Reviewed 2026-07-15 against Yahoo's current [Fantasy Sports API reference](https://sports.yahoo.com/developer/docs/) and [access guide](https://developer.yahoo.com/fantasysports/guide/).

## Evidence Policy

Yahoo documentation is an input claim, not proof that a route works. This project uses three separate labels:

- `documented-claim`: Yahoo currently describes the behavior, but our harness must still exercise it.
- `observed-only`: live behavior exists without matching current documentation.
- `documented-runtime-discrepancy`: current documentation and a reproducible live result disagree.

A route is supported in our findings only when a concrete sport and fixture passed live shape validation. Missing fixtures, authentication failures, and documentation claims are never converted into route passes.

Our own documentation is also treated as fallible. Every ``route:<id>`` reference in this file is checked against the executable route catalog by `route-model.test.ts`. Generated reports include the exact route provenance, source fingerprint, options, and observed result.

## Current Inconsistencies

### Authentication

Yahoo now says Fantasy Sports requires OAuth 2.0, while our public OAuth 1.0 compatibility requests still pass. OAuth 1.0 is therefore observed compatibility, not a currently documented authentication guarantee. A future authentication matrix should execute the same public route with OAuth 2.0 and OAuth 1.0 and preserve the distinction between read and read/write scope.

### Games `out` Composition

Yahoo says Games collections accept Game subresources and documents collection-level `out`. Dedicated run `2026-07-15T19-10-59-454Z` reproduced the rejection for NFL, MLB, NBA, and NHL: each returned `Bad Request: league ids expected`. The route ``route:invalid-games-out-leagues`` is therefore a documented/runtime discrepancy with evidence that the generic `out` rule cannot satisfy this child's mandatory filter.

### Game-Context Player Search

The route ``route:game-players`` passes across NFL, MLB, NBA, and NHL, but Yahoo's current filter table says `search` applies only in league context. It is observed-only behavior. The documented keyed equivalent is tracked separately as ``route:game-players-by-key``.

### Roster Players

Yahoo now explicitly documents `/team/{team_key}/roster/players` and describes players as the roster's default subresource. The base route is no longer provisional. Deeper compositions such as `roster/players/stats` remain observed-only until separately verified.

## Initial Canonical Expansion

These documented claims are the first expansion beyond the existing matrix. Results below are from strict-shape public run `2026-07-15T19-33-25-809Z`; each result remains scoped to its concrete sport and fixture.

| Claim | Harness route | Required fixture | Observed result |
| --- | --- | --- | --- |
| Games collection by key | ``route:games-by-key`` | game | Passed NFL, MLB, NBA, NHL |
| Game players by key | ``route:game-players-by-key`` | player | Passed NFL, MLB, NBA, NHL |
| Root players collection by key | ``route:players-by-key`` | player | Passed NFL, MLB, NBA, NHL |
| Root leagues collection by key | ``route:leagues-by-key`` | public league | Passed NHL; other sports fixture-unavailable |
| Direct league teams | ``route:league-teams`` | public league | Passed NHL; other sports fixture-unavailable |
| Leagues-to-teams chain | ``route:leagues-teams`` | public league | Passed NHL; other sports fixture-unavailable |
| Root teams collection by key | ``route:teams-by-key`` | public team | Passed NHL; other sports fixture-unavailable |
| Direct team players | ``route:team-players`` | public team | Passed NHL; other sports fixture-unavailable |
| Current league scoreboard | ``route:league-scoreboard-current`` | public league | Passed NHL; other sports fixture-unavailable |
| Logged-in user metadata | ``route:user`` | OAuth2 account | Not run; interactive authorization required |
| Direct logged-in user teams | ``route:user-teams`` | OAuth2 account | Not run; interactive authorization required |

## Remaining Backlog

1. Add resource and collection `out` cases without assuming the generic rule works for children that require filters.
2. Add bare/default team stats, roster, and matchups alongside explicit period variants.
3. Add player weekly and date stats with NFL versus MLB/NBA/NHL applicability.
4. Add league player pagination, search, status variants, sorting, and sport-specific sort periods.
5. Extend the passing ``route:games-available-by-code`` case with `game_types` and additional combined filters.
6. Add transaction metadata, players, completed filters, and separate pending waiver/trade discovery.
7. Validate numeric and sport-code resource key forms plus completed, waiver, and pending-trade transaction key grammars.
8. Catalog roster PUT and transaction POST/PUT/DELETE schemas, but never execute mutations without read/write scope, explicit destructive opt-in, and disposable fixtures.
9. Compare OAuth2 and observed OAuth1 compatibility on the same non-private route.

## Operational Claims

The access guide now describes application review, possible throttling, OAuth2 authorization, and attribution requirements. These are documented operational constraints rather than route support evidence. The harness should report authentication/scope and throttling failures distinctly, while product-facing compliance remains outside the route matrix.
