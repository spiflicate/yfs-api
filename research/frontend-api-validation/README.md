# Frontend API Verification

This suite compares the v2.2 adapter allowlist with Yahoo's live frontend
behavior. It is deliberately separate from the adapter: every live request is
an explicitly configured `GET`, so a successful candidate cannot silently
expand production API access.

## Commands

Run deterministic matrix checks without network access:

```bash
bun run research:frontend -- --dry-run
```

Run the full public read matrix:

```bash
bun run research:frontend
```

Probe only selected definitions:

```bash
bun run research:frontend -- --ids candidate-games-collection,candidate-game-players
```

Private fixtures are opt-in through environment variables:

```text
YAHOO_FRONTEND_LEAGUE_KEY=...
YAHOO_FRONTEND_TEAM_KEY=...
YAHOO_FRONTEND_PLAYER_KEY=...
YAHOO_FRONTEND_TRANSACTION_KEY=...
YAHOO_SESSION_COOKIE=...
```

The cookie is sent only for the optional `cookie` GET pass. It is never
printed. Results are written to the ignored `tmp/` directory and include the
current SDK policy, HTTP classification, status, content type, and JSON
top-level keys. XML bodies are not persisted by this probe.

## Interpreting Results

- `localPolicy: allowed` means the current adapter would send the route.
- `localPolicy: rejected` plus `classification: success` identifies a concrete
  candidate for a future allowlist change.
- `auth-required` means the route may need a browser session; it is not proof
  that the route is unsupported.
- `fixture-missing` means the route was not sent because a concrete private key
  was not supplied.
- `client-error` on a negative control is expected evidence that Yahoo rejected
  the path.

Removing the allowlist requires broader evidence than one successful GET:
the route must be safe for the intended host, auth mode, response format, and
method, and it must not expose an untested write path. This suite does not
probe writes.
