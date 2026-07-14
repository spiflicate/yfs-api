# API Notes

One-off notes from live Yahoo API probing that do not yet belong in the validated path docs.

## Collection ID filters appear collection-only

Yahoo appears to silently support `league_ids` and `team_ids` when they are used as filters on collection segments inside a larger path.

Observed working example:

- `/game/nhl/leagues;league_ids=121384/teams;team_ids=14/roster/players;type=week;week=2`

Current interpretation from testing:

- `leagues;league_ids=...` and `teams;team_ids=...` can work as filtered collection segments.
- The same collection-style parameters do not currently appear to be supported on resource-shaped routes.
- Treat these ID collections as collection-only until a direct resource-form probe succeeds.

## Roster may expose a nested players collection

Yahoo appears to accept a `players` collection directly under the `roster` resource, even though that shape is not clearly documented.

Observed working example:

- `/team/nhl.l.121384.t.14/roster;type=week;week=1/players/stats;type=week;week=12`

Current interpretation from testing:

- `roster/players` appears to be a valid nested collection shape.
- This may mean Yahoo supports additional players collection subresources under `roster`, not just `stats`.
- Initial testing suggests multiple subresources combined in the `out` path may not work for this shape.
- Treat broader `roster/players/...` support and any `out`-path expansion behavior as provisional until more direct probes confirm the boundaries.

## PUT roster updates return either confirmation or a filled-position error

PUT requests to the `roster` subresource appear to have a narrow response shape: Yahoo either returns a confirmation object or rejects the request with an HTTP error stating that the target position is already occupied.

Observed success response:

```json
{
	"confirmation": {
		"status": "success"
	}
}
```

Observed failure response:

- HTTP error with message `That position has already been filled.`

Current interpretation from testing:

- Successful roster PUT operations may not return a richer mutated-resource payload.
- A common failure mode is a position-conflict error surfaced as `That position has already been filled.`
- Treat roster PUT handling as confirmation-or-error unless later probes show additional response variants.