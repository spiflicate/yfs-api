# Yahoo API Investigation

Evidence and notes from reverse-engineering requests made by the Yahoo Fantasy
web application. This is protocol research, not an assertion of an official
public API contract.

## Contents

- [Findings](FINDINGS.md) - sanitized endpoint and response analysis.
- `captures/` - local HAR evidence. These files are intentionally ignored
  because browser HARs contain cookies and authenticated request context.
- `probe-v3.ts` - read-only probe for the observed v3 routes and candidate
  bearer/cookie authentication modes.

## Reproduce the unauthenticated probe

```bash
bun run research:v3
```

The probe checks the observed v2 hosts, `getCrumb`, and
`user/subscriptions`. It adds bearer and cookie variants only when
`YAHOO_ACCESS_TOKEN` or `YAHOO_SESSION_COOKIE` is present. To test
`suggested_players`, also provide `YAHOO_V3_TEAM_KEY` and
`YAHOO_V3_ROSTER_KEY`. Values are sent as headers or query parameters and are
never printed or saved.

To test bearer access against private v2 resources without printing their
identifiers, also provide `YAHOO_V2_LEAGUE_KEY` and `YAHOO_V2_TEAM_KEY`.

OAuth2 bearer tokens and Yahoo browser session cookies are separate
credentials. This probe does not attempt to exchange one for the other.

## Capture provenance

| Capture | Entries | Captured |
| --- | ---: | --- |
| `baseball-yahoo-api.har` | 1,000 | 2026-07-28 17:56-18:05 -0400 |
| `yahoo-api-v3.har` | 57 | 2026-07-28 10:40-11:29 -0400 |

Raw captures stay local. Reports must use placeholders for league, team,
player, crumb, cookie, and other account-specific values.
