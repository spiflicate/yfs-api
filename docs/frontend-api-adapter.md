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
- Observed v2 `GET` routes use `pub-api-ro`.
- The observed v2 league-to-teams read and roster `PUT` use `pub-api-rw`.
- Observed v3 routes use the neutral `pub-api` host.

The adapter rejects OAuth bearer headers, never exchanges bearer tokens for
cookies, and never manufactures browser credentials from client secrets.

## Response envelopes

v2 and v3 responses are JSON and should be modeled separately:

```ts
type V2 = FrontendV2Response<MyPayload>;
type V3 = FrontendV3Response<MyPayload>;
```

The route allowlist currently covers observed v2 reads for the `game`, `league`,
`player`, `team`, and `user` resources, the league-to-teams read, the roster
`PUT`, and the observed v3 `getCrumb`, `suggested_players`, and
`user/subscriptions` routes. Unknown and unobserved write routes fail before a
request is sent.
