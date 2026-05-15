# Current Findings

This note captures the current support-demotion picture from the latest static route verifier run.

Use this document for product and implementation decisions when deciding what should be removed from the safe supported surface versus what should stay provisional.

## Confident Demotion Candidates

These paths have strong evidence for demotion because Yahoo rejected the route shape itself, not just the concrete parameters.

### private-users-leagues

- Path: `/users;use_login=1/leagues`
- Current verdict: demote support
- Evidence: Yahoo returned `Bad Request: subresource leagues not supported`
- Confidence: high
- Why this is demotable: this is a direct structural rejection of the subresource chain, not a missing key or invalid filter.

### private-users-out-leagues

- Path: `/users;use_login=1;out=leagues`
- Current verdict: demote support
- Evidence: Yahoo returned `Bad Request: subresource leagues not supported`
- Confidence: high
- Why this is demotable: Yahoo rejected the requested expansion directly, which makes this a route-shape problem rather than a fixture problem.

## Not Yet Safe To Demote

These paths remain unresolved. They are not good candidates for supported-path promotion, but the current evidence is still weaker than the two confident demotion cases above.

### games out=leagues family

The following paths still fail after injecting `league_keys`, and for the `out=leagues` cases they also still fail after testing a parameter-order variant where `league_keys` appears before `out`.

- `/games;game_codes=nhl;seasons=2025;out=leagues,players`
- `/games;game_keys=nhl;out=leagues`
- `/games;game_keys=nhl;out=leagues,players`
- `/games;game_codes=nhl/leagues/players;search=mcdavid;count=5`
- `/games;game_codes=nhl/leagues/transactions;count=5`

Current interpretation:

- Do not treat these as validated supported paths.
- Do not yet treat them as confident demotion targets either.
- Keep them provisional until we either find a path form Yahoo accepts or collect stronger contrary evidence from docs plus additional live probes.

Why they stay provisional:

- The primary failure is still `league ids expected`, which reads like a parameter contract issue rather than a clean unsupported-route rejection.
- The `games ... /leagues/...` variants are closer to supported than the `users ... leagues` failures because several `league_keys` reprobes do succeed elsewhere in the same family.
- The `out=leagues` variants remain especially ambiguous because both tested parameter orders still fail with the same message.

## Practical Recommendation

If we are trimming the supported surface now:

- Remove or clearly mark unsupported: `/users;use_login=1/leagues`
- Remove or clearly mark unsupported: `/users;use_login=1;out=leagues`

If we are documenting unresolved behavior:

- Mark the `games ... out=leagues ...` family and the failing `games ... /leagues/...` variants as provisional and under investigation, not supported.
- Avoid builder promotion for the unresolved set until a successful probe exists for the same path shape.