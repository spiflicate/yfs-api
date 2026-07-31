# Authenticated Yahoo Access Baseline

- Run: `2026-07-30T21-11-01-018Z`
- API surface: Yahoo Fantasy API v2 at `https://fantasysports.yahooapis.com/fantasy/v2`
- Auth mode: OAuth2 bearer token, private mode
- Access mode: read-only; no roster or transaction mutations attempted
- Command: `bun run research:routes -- --mode private --sports nfl,mlb,nba,nhl --allow-incomplete --non-interactive`

## Result

The run attempted authenticated user and account discovery for NFL, MLB, NBA,
and NHL. OAuth2 authorization was unavailable, so account fixtures could not
be discovered and dependent route checks did not run.

- Scenarios selected: 104
- Authenticated discovery failures: 20
- Discovery failure classification: `auth-or-scope`
- Dependent scenarios: 84 `fixture-unavailable`
- Routes passed: 0
- Destructive requests: 0

The failures are authorization evidence, not route evidence. The public
requests emitted during discovery also returned Yahoo's application-level
authorization failure and are tracked separately from the private OAuth2
blocker.

## Next Action

Authorize the configured Yahoo application again or provide a refreshed
`.oauth2-tokens.json`, then rerun the command above. Do not infer private
resource incompatibility until authenticated discovery succeeds.

Detailed response artifacts remain under the ignored `tmp/` directory. No
credentials or private fixture identifiers are included in this report.
