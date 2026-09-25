# Experimental Frontend API Adapter

The `YahooFrontendApiClient` is a separate, experimental adapter for observed
Yahoo Fantasy web frontend routes. It does not replace the documented OAuth2
client and does not claim that these routes are a supported third-party API.

## Authentication and hosts

- `public` allows unauthenticated `GET` requests only. It does not use OAuth2,
  OAuth1, or cookies.
- `browser-session` requires an explicitly supplied, user-managed Cookie header.
  It is the only mode that permits writes and is also required when reading
  private league data. Mark a private read with `access: 'private'`.
- v2 `GET` requests use `pub-api-ro`. The web app sends the league-to-teams
  read (`league/{league_key}/teams`) to `pub-api-rw`, but `pub-api-ro` returns
  the same body for it, with or without a browser session.
- v2 writes use `pub-api-rw`.
- v3 requests use the neutral `pub-api` host and are read-only.

The adapter rejects OAuth bearer headers, never exchanges bearer tokens for
cookies, and never manufactures browser credentials from client secrets.

## Response formats

The observed v2 routes return XML without a `format` query parameter. The
adapter requests that default and passes the response through the existing
`parseYahooXML` normalizer, so v2 results use the same shape as the canonical
client. The observed v3 routes return JSON and are modeled separately:

```ts
type V2 = FrontendV2Response<MyParsedPayload>;
type V3 = FrontendV3Response<MyPayload>;
```

## Request gating

Reads are not allowlisted; writes are.

- Routes must be relative paths under `/fantasy/v2/` or `/fantasy/v3/`.
  Anything else, including absolute URLs, fails before a request is sent.
- `public` authentication sends `GET` requests only, never with cookies.
- Unknown read paths are sent to Yahoo, which rejects routes it does not
  serve. Yahoo's error description is included in the `FrontendApiError`
  message (for example `subresource ... not supported`). Authentication
  failures (`401`/`403`) never include response content.
- Every write (`client.post()`, `client.put()`, `client.delete()`, or a typed
  resource operation) must match the write allowlist,
  `FRONTEND_WRITE_ROUTES`, and fails before a request is sent otherwise. A
  write to a real path changes real data, so writes keep a local gate. The
  allowlist currently holds one route:

  | Method | Route                                            |
  | ------ | ------------------------------------------------ |
  | `PUT`  | `/fantasy/v2/team/{team_key}/roster[;params]`    |

  Matrix parameters such as `;date=YYYY-MM-DD` are allowed on the `roster`
  segment, but the match is anchored at the end, so look-alike paths such as
  `.../roster/players`, `.../roster;x=1/players`, or `.../rosterx` are
  rejected.
- Writes also require browser-session authentication. Typed resource writes,
  such as `team(key).roster().date(...).update(moves)`, additionally require
  an API created with `createFrontendApi(client, { access: 'private' })`.
- v3 routes are read-only.

`client.get(path)` is an unchecked escape hatch for reads the fluent builder
does not model, such as the top-level
`transactions;transaction_keys=...` collection.

## Route evidence

Which routes have been verified live against the frontend hosts is recorded
in the [frontend verification matrix](../research/frontend-api-validation/README.md),
not enforced by the adapter. Verified reads include the `game`, `games`,
`league`, `player`, `team`, and `user` resources, the game child reads, league
`settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions`, and
`draftresults`, team `roster`, `matchups`, `stats`, and `standings`, player
`stats` (including date-scoped `stats;type=date;date=YYYY-MM-DD` coverage), the
top-level `transactions` collection, and the v3 `getCrumb`,
`suggested_players`, and `user/subscriptions` routes. The only observed write
is the roster `PUT`.

Team `standings` and league `draftresults` are reachable through the fluent
resource API via `include()` — `team(key).include('standings')` and
`league(key).include('draftresults')` — which requests them as `;out=`
expansions on the base resource.
