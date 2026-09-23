# Frontend API Verification

This suite records which frontend routes Yahoo actually serves. The adapter
does not enforce this list; it is evidence for documentation and for the
fluent API surface. Every live request is an explicitly configured `GET`, and
the suite does not probe writes.

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
host the adapter would select (`adapterHost`), HTTP classification, status,
content type, and JSON top-level keys. XML bodies are not persisted by this probe.

## Interpreting Results

- `category` is an evidence label: `current` routes are verified live,
  `candidate` routes are unverified, and `negative` routes are expected to be
  rejected by Yahoo.
- `candidate` plus `classification: success` is evidence to promote the route
  to `current` and document it.
- `auth-required` means the route may need a browser session; it is not proof
  that the route is unsupported.
- `fixture-missing` means the route was not sent because a concrete private key
  was not supplied.
- `client-error` on a negative control is expected evidence that Yahoo rejected
  the path.
- The unit tests require each definition's `host` to match `adapterHost`, so
  probes exercise the same host the adapter would use.
