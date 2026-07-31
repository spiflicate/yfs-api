# Yahoo API Investigation Findings

Initial analysis of the two local HAR captures from 2026-07-28. The captures
show browser behavior and are evidence of observed requests only. They do not
establish that Yahoo documents or supports these routes for third-party SDKs.

## Independent Probe: 2026-07-30T21:18:39Z

The read-only `research:v3` probe tested the candidate hosts without browser
cookies or bearer credentials:

| Host and route | Auth | Result | Classification |
| --- | --- | --- | --- |
| `pub-api-ro.fantasysports.yahoo.com/fantasy/v2/game/nhl` | none | HTTP 200, `fantasy_content` JSON envelope | externally reachable read |
| `pub-api-rw.fantasysports.yahoo.com/fantasy/v2/game/nhl` | none | HTTP 200, `fantasy_content` JSON envelope | externally reachable read |
| `pub-api.fantasysports.yahoo.com/fantasy/v3/getCrumb` | none | HTTP 200, `service` envelope, `crumb: null` | reachable but no session crumb |
| `pub-api.fantasysports.yahoo.com/fantasy/v3/user/subscriptions` | none | HTTP 401, `Must provide guid or be logged in` | session required |

The canonical hostname is `pub-api.fantasysports.yahoo.com`, and it is used by
the probe. The result confirms reachability, not third-party compatibility.

## Authenticated Browser Session: 2026-07-30T21:32Z

The Playwright browser session was authenticated to Yahoo and requested the
supplied prior-season private league fixture through `fetch(...,
{credentials: "include"})`. The page itself rendered the offseason shell, but
the underlying APIs still served the archived league.

- The URL resolved to a prior-season game key and a private league/team key;
  exact identifiers are intentionally omitted here.
- The v2 `pub-api-ro` host returned `200` for league, team, settings, standings,
  scoreboard, transactions, roster, stats, and a roster-derived player read.
- The v2 `pub-api-rw` host returned `200` for league, team, and league-team
  reads. No write request was sent.
- The v3 `user/subscriptions` and `getCrumb` routes returned `200` in the
  authenticated browser session.
- The v3 `suggested_players` route returned `200` for both observed
  `add-drop` and `sit-start` contexts using the private team fixture.
- Yahoo returned CORS headers allowing credentials for the authenticated API
  responses, consistent with browser-cookie session authentication.

This confirms that the observed v3 surface is externally reachable and usable
from an authenticated Yahoo web session for these read-only requests. It does
not establish OAuth2 bearer-token compatibility, a supported cookie acquisition
flow, or a stable SDK contract. The current-season page message is a frontend
season-state limitation, not an API access failure for the archived league.

## Recommendation

For this SDK, treat the `pub-api*` private surface as **browser-session
authenticated only**. Preserve the canonical OAuth2 adapter and do not replace
it with the observed frontend routes. Do not add bearer-token support for these
routes: the available bearer token was rejected by the canonical API, and the
same token produced the session-required response from private `pub-api*`
routes. A valid bearer token for a currently approved application would be
needed to turn that last observation into a definitive protocol rejection, but
there is no evidence or documented acquisition path that justifies SDK
support today.

The v3 routes may remain useful as a separate, explicitly experimental browser
integration that accepts a user-managed Yahoo session. That integration must
not attempt to manufacture cookies from a client secret or claim compatibility
with the OAuth2 token flow.

The probe supports optional `YAHOO_ACCESS_TOKEN` and
`YAHOO_SESSION_COOKIE` variants for future credentialed tests. It does not
attempt to convert an OAuth2 bearer token into a browser cookie, and it never
prints or persists either credential.

Yahoo's current [Fantasy API documentation](https://sports.yahoo.com/developer/docs/)
describes OAuth2 as the API authorization mechanism and identifies the
canonical v2 endpoint, but does not document the observed v3 routes or a
token-to-browser-cookie exchange. The cookie path therefore remains an
observed frontend behavior requiring an authenticated browser session, not a
supported SDK authentication flow.

## Executive Summary

- The web application uses `https://pub-api.fantasysports.yahoo.com` for
  three observed `/fantasy/v3` JSON services.
- The observed v3 services are `getCrumb`, `suggested_players`, and
  `user/subscriptions`.
- The v3 responses use a `service` envelope with `xml:lang`, despite being
  JSON responses.
- The requests in both HARs carry browser cookies. They do not carry an
  `Authorization` request header, so these captures do not prove that the
  endpoints accept the SDK's OAuth 2.0 bearer-token flow.
- Existing v2 requests continue to use separate `pub-api-ro` and
  `pub-api-rw` hosts. The v3 requests observed here use the neutral
  `pub-api` host.
- The raw captures are kept under `captures/` but ignored by Git because they
  contain authenticated browser state.

## Observed v3 Endpoints

| Method and route | Query parameters | Observations | Response shape |
| --- | --- | --- | --- |
| `GET /fantasy/v3/getCrumb` | `format=json_f` | Seen twice in the baseball capture; both returned `200`. | `{ service: { "xml:lang": string, crumb: string } }` |
| `GET /fantasy/v3/suggested_players` | `format=json`, `context`, `roster_key`, `team_key` | Seen with `context=add-drop` and `context=sit-start`. Returned zero to three suggestions. | `{ service: { "xml:lang": string, suggested_players: SuggestedPlayer[] } }` |
| `GET /fantasy/v3/user/subscriptions` | `format=json` | Returned `200` in both captures; the observed account had no subscriptions. | `{ service: { "xml:lang": string, user: UserStatus, subscriptions: Subscription[] } }` |

The exact capture values are intentionally omitted. They include private
league/team keys and a live crumb.

### `suggested_players` item

Observed items have this shape:

```json
{
  "base_player": {
    "name": "<player name>",
    "playerKey": "<game id>.p.<player id>",
    "imageUrl": "<Yahoo image URL>"
  },
  "action_player": {
    "name": "<player name>",
    "playerKey": "<game id>.p.<player id>",
    "imageUrl": "<Yahoo image URL>"
  },
  "action": "add | start",
  "reason": "<human-readable explanation>"
}
```

The observed reasons included `add-drop suggestion by overall ranks` and
`sit-start suggestion by overall ranks`. `suggested_players` must be modeled
as an empty-capable collection; successful responses with no suggestions were
present in both captures.

### `user/subscriptions` item and status

The observed `user` object contained:

```json
{
  "isPremium": false,
  "premiumFeatures": [],
  "highestTierRank": null,
  "highestTier": null
}
```

Nullability and the element shape of non-empty `subscriptions` and
`premiumFeatures` were not established by these captures.

## Related v2 Behavior

The baseball capture also shows the web application using:

- `GET /fantasy/v2/users;use_login=1/profile` on `pub-api-ro`.
- `GET /fantasy/v2/league/{league_key}/teams;out=standings;...` on
  `pub-api-rw`.
- `GET /fantasy/v2/league/{league_key}/teams;out=recommended_trade_partners;...`
  on `pub-api-rw`.
- `OPTIONS` followed by `PUT /fantasy/v2/team/{team_key}/roster` on
  `pub-api-rw`, with `format=json_f` and `crumb` query parameters.

The roster write body was XML and represented a date coverage update:

```xml
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>&lt;YYYY-MM-DD&gt;</date>
    <action>start_active_players</action>
  </roster>
</fantasy_content>
```

The write response was the existing compact confirmation envelope:

```json
{
  "fantasy_content": {
    "confirmation": { "status": "success" }
  }
}
```

This related v2 traffic does not change the v3 findings, but it confirms that
the browser obtains a crumb before a roster mutation and passes it as a query
parameter.

## Confidence And Gaps

### Established by the captures

- Route paths, HTTP methods, query parameter names, host selection, JSON
  content type, and top-level response envelopes.
- `suggested_players` contexts observed: `add-drop` and `sit-start`.
- Empty successful collections are valid for `suggested_players` and
  `subscriptions`.
- `getCrumb` returns a string value under `service.crumb`.

### Not established

- Whether v3 accepts OAuth 2.0 bearer tokens, OAuth 1.0 signatures, or only
  browser-cookie authentication.
- Required OAuth scopes, rate limits, cache semantics, or official support.
- Whether `roster_key` is always a date, how it differs from a scoring-period
  key, or whether other roster key formats work.
- Whether `context` accepts values beyond `add-drop` and `sit-start`.
- The request and response schemas for non-empty subscriptions and premium
  feature entries.
- Error responses for missing, expired, or mismatched `crumb` values.

## Recommended Next Probes

1. Use an existing authorized SDK OAuth 2.0 session to request each v3 GET
   route with `format=json`, without browser cookies. Record status and shape.
2. Repeat `suggested_players` with the two observed contexts and a known
   private team fixture; assert returned player keys belong to the requested
   game.
3. Probe missing and invalid `context`, `roster_key`, and `team_key` values,
   without mutations, to classify validation errors.
4. Request `getCrumb` with OAuth 2.0, then compare a harmless roster-read or
   preflight behavior before considering any write test.
5. Do not claim OAuth2 bearer-token compatibility for v3 until it is
   independently confirmed. The separate experimental browser-session adapter
   supports the observed v3 JSON routes without replacing the canonical OAuth2
   client.
