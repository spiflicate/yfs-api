## Purpose

This document defines a shared vocabulary for developers and domain experts working with the Yahoo Fantasy Sports API, including fantasy objects, API resources, and OAuth-based authentication. It is meant to standardize how you talk about games, leagues, teams, players, and how clients authenticate and retrieve data over XML or JSON.

***

## Core Noun Glossary

### Fantasy domain entities

| Term | Ubiquitous meaning |
| --- | --- |
| Game | A fantasy sports game for a specific sport and season (e.g. NFL 2011), identified by a `game_key` that is either a `game_id` (season-specific) or a `game_code` (e.g. `nfl`) that resolves to the current season. |
| Game key | The identifier used in URIs to refer to a game; either `{game_code}` or `{game_id}`, for example `nfl` or `257`. |
| League | A competition within a game where a fixed number of users manage teams under shared rules, such as scoring type, roster positions, and playoff settings. |
| League key | The identifier used in URIs to refer to a specific league within a game, formatted as `{game_key}.l.{league_id}`, for example `223.l.431`. |
| Public league | A league that is publicly visible so that any user (or any authenticated app) may retrieve its data when permitted by the API’s access rules. |
| Private league | A league whose data is only accessible to members of that league; the API requires user-specific authorization to return private league data. |
| Team | A managed fantasy roster within a league, owned or co-owned by one or more users; teams compete using real‑world player stats interpreted through league scoring rules. |
| Team key | The identifier used in URIs to refer to a specific team, usually composed of the league key and an internal team identifier. |
| Player | A real-world athlete that can be drafted, rostered, and moved via transactions; players are exposed through player resources and collections. |
| Roster | The set of players currently assigned to a team for a given scoring period (e.g. week or date), constrained by roster positions. |
| Roster position | A position slot type on a roster, such as QB, WR, RB, D, G, or bench (BN), each with a maximum count per team as defined in league settings. |
| Stat category | A category of real‑world statistics, such as Passing Yards, Rushing Touchdowns, or Save Percentage, configured by each league and used to compute fantasy scoring. |
| Transaction | A change to a roster or league state (add, drop, trade, waiver claim, etc.), exposed by the transactions resource and subject to league rules. |
| User | A Yahoo account holder who participates in games and leagues; in the API, the "logged in user" (via OAuth) scopes which private data can be retrieved. |

### API & transport entities

| Term | Ubiquitous meaning |
| --- | --- |
| Resource | A singular API entity identified by a key, such as `game`, `league`, `team`, `player`, or `user`. |
| Collection | A group of resources of the same type (e.g. `games`, `leagues`, `teams`, `players`) that can be filtered by keys or other parameters. |
| Sub-resource | A resource or collection nested under another resource in the URI, such as `league/{league_key}/settings` or `team/{team_key}/roster`. |
| Filter | A parameter that narrows a collection, such as `game_keys`, `league_keys`, `team_keys`, `player_keys`, `game_codes`, `seasons`, or `use_login=1`. |
| Parameter | A semicolon‑delimited key–value pair in the URI (e.g. `;game_keys=nfl,mlb;seasons=2011`) that controls filters and behavior, including the `out` parameter for branching sub-resources. |
| Request | An HTTP call to the Fantasy Sports API base URL `https://fantasysports.yahooapis.com/fantasy/v2`, built from resources, collections, keys, and parameters. |
| Response | The data returned from a request, typically XML (and optionally JSON) structured under a top‑level `<fantasy_content>` element or equivalent JSON structure. |
| XML | The primary response and write format for the Fantasy Sports API, with strongly defined element names for games, leagues, teams, players, and settings; all POST/PUT write operations use XML payloads. |
| JSON | An alternate response format requested via HTTP headers or parameters; it mirrors the XML structure but may be more cumbersome in shape than typical "REST JSON," and write operations still require XML. |

### OAuth & security entities

| Term | Ubiquitous meaning |
| --- | --- |
| Application | A client registered in the Yahoo Developer portal that is allowed to call Yahoo APIs, including Fantasy Sports; defines its name, callback domain, and authorized API scopes. |
| Consumer key | The public identifier issued to an application upon registration; it identifies the application in OAuth flows and is included in signed requests. |
| Consumer secret | A confidential secret paired with the consumer key; used to sign OAuth requests or obtain tokens and must never be exposed to end users or checked into source control. |
| Callback domain | A domain registered for the application to which Yahoo redirects users after they authorize the app; redirect URIs must match the configured callback domain rules. [wernull](https://wernull.com/2016/01/getting-started-with-the-yahoo-fantasy-sports-api/) |
| Token | A generic term for OAuth tokens, including request tokens, access tokens, and (for OAuth 2.0) refresh tokens; tokens represent delegated authorization for a user or for public access. |
| Access token | The token used on API requests to authorize access to user or league data; in Fantasy APIs this is typically obtained via a 3‑legged OAuth / Authorization Code flow. |
| Refresh token | A long‑lived token (in OAuth 2.0) used to obtain new access tokens without a new user login; often stored securely and used by server-side applications. [yahoo-fantasy-api.readthedocs](https://yahoo-fantasy-api.readthedocs.io/en/latest/yahoo_fantasy_api.html) |
| Scope | The set of Yahoo services and permissions the application can access, such as "Fantasy Sports (Read)" or "Fantasy Sports (Read/Write)," defined at app registration. |
| OAuth flow | The sequence of steps where the user is redirected to Yahoo, grants access, and the client obtains tokens; Fantasy Sports primarily uses 3‑legged OAuth for user/private data and 2‑legged OAuth for public data. |
| Public request | A request that uses only the application’s consumer key/secret (2‑legged OAuth) to retrieve public fantasy data, typically for games or public leagues. |
| Private request | A request that includes a user-specific access token (3‑legged OAuth / Authorization Code grant) to retrieve private user, league, or team data. |

***

## Core Verb Glossary

These verbs describe domain‑level actions rather than implementation details.

### Authentication and authorization verbs

| Verb | Ubiquitous meaning |
| --- | --- |
| Register an application | Create an application entry in the Yahoo Developer portal, configure callback domain and scopes, and obtain consumer key and secret. |
| Authenticate the user | Redirect the user to Yahoo’s authorization endpoint, where they sign in and grant the application access to their Yahoo Fantasy data. |
| Authorize the application | The user’s act of granting the app permission to access their data; in conversations we say the user "authorizes" or "grants access" to the app. |
| Obtain a token | Exchange a verifier or authorization code for an access token (and optionally refresh token), or refresh an access token using an existing refresh token. |
| Refresh a token | Use a refresh token or session handle to obtain a new access token when the previous token has expired or been invalidated. |
| Sign a request | (For legacy OAuth 1.0 flows) Compute and attach OAuth signature parameters using the consumer key/secret and token; for OAuth 2.0, this is replaced by sending bearer tokens over HTTPS. |

### Data retrieval and mutation verbs

| Verb | Ubiquitous meaning |
| --- | --- |
| Request a resource | Issue an HTTP GET to a single resource URI, such as `game/{game_key}` or `league/{league_key}`. |
| Request a collection | Issue an HTTP GET to a collection URI (e.g. `games`, `leagues`, `teams`, `players`) possibly with filters like `game_keys` or `seasons`. |
| Filter a collection | Apply URI parameters (e.g. `;game_codes=nfl;seasons=2012`) to reduce which resources are returned from a collection. |
| Chain sub-resources | Extend the URI to include nested resources (e.g. `users;use_login=1/games/leagues/teams`) to traverse the hierarchy in one request. |
| Branch with `out` | Use the `out` parameter to fetch an additional sub-resource (e.g. `league/{league_key};out=settings`) alongside the main chain. |
| Retrieve settings | Fetch a league’s or game’s settings sub-resource (e.g. scoring rules, roster positions, stat categories) to interpret stats and standings correctly. |
| Retrieve stats | Fetch player or team stats (often via players or team sub-resources) for a given scoring period, using league settings to interpret them. |
| Retrieve a roster | Fetch the roster sub-resource for a team for a given week or date. |
| Post a transaction | Submit an XML payload via POST or PUT to create or update a fantasy transaction, such as a trade, add/drop, or waiver move. |

### Fantasy gameplay verbs

| Verb | Ubiquitous meaning |
| --- | --- |
| Draft a player | Assign a player to a team at the start of a season via the league’s draft process. |
| Add / drop a player | Create a transaction that moves a player from the free agent pool or waivers onto a team, or removes them from a team. |
| Trade a player | Create a trade transaction between teams, subject to league trade rules and deadlines. |
| Set a lineup | Arrange players into roster positions for a scoring period; often discussed in terms of "updating the roster" for a specific week. |

***

## Speaking Consistently About Authentication

When domain experts talk about authentication with Yahoo Fantasy Sports, they should use the following patterns:

- Say **"register the application in Yahoo Developer"** to mean creating the app, defining callback domain, and selecting Fantasy Sports read or read/write scope; this is where you obtain the consumer key and secret.
- Say **"authenticate the user via Yahoo OAuth and obtain an access token"** to describe the full 3‑legged OAuth / Authorization Code process where the user logs in, grants access, and the app receives tokens.
- Distinguish **"public requests"** (2‑legged, no user token, consumer key/secret only) from **"private requests"** (3‑legged, user access token included) rather than talking generically about "logged in" vs "not logged in" calls.
- When tokens expire, say **"refresh the access token using the refresh token (or session handle)"** instead of "log in again" if the flow does not require user interaction.

In code and documentation, prefer **consumer key**, **consumer secret**, **access token**, **refresh token**, and **callback domain** instead of ad hoc labels like "app key" or "redirect URL" unless you explicitly map them to Yahoo’s terminology.

***

## Speaking Consistently About Data Retrieval

For data access, domain experts should phrase operations in terms of resources, collections, and sub-resources:

- Say **"request the game resource for `nfl`"** or **"GET `game/nfl`"** rather than "hit the NFL endpoint," emphasizing the game resource and key.
- Say **"fetch a games collection filtered by `game_codes` and `seasons`"** for URIs like `/games;game_codes=nfl;seasons=2012`.
- Say **"chain from users to games to leagues to teams"** for URIs such as `users;use_login=1/games/leagues/teams`, making it clear you are traversing sub-resources in a single call.
- When you add `;out=settings`, describe this as **"branching to include the league settings sub-resource via the `out` parameter"**.
- Refer to XML and JSON precisely: **"the Fantasy API primarily returns XML under `<fantasy_content>`, with JSON as an alternate representation"**, and **"write operations such as POST/PUT accept XML bodies"**.

This keeps discussions anchored on the REST resource model, which is how the official guide describes the API.

***

## Speaking Consistently About Fantasy Objects

Finally, when you talk about the fantasy model itself:

- Always anchor data to a **game**: say **"this league exists within the `nfl` game for season 2011"** rather than treating leagues as global.
- Treat **league settings** (scoring type, roster positions, stat categories) as first‑class domain concepts; say **"interpret player stats under the league’s scoring settings"**, not just "read stats."
- When relating stats to fantasy points, say **"fantasy value is derived from real‑world player stats through the league’s configured stat categories and modifiers"**.
- When distinguishing visibility, use **public league** and **private league** tied to membership rules and OAuth scope, not informal terms like "hidden league."

A concise mental model to use in conversations is:

> **Fantasy meaning = real‑world sports stats + game context + league rules + user/league visibility scope.** 

Using this vocabulary consistently will make it much easier to design APIs, SDKs, and documentation that match how Yahoo’s Fantasy Sports platform actually behaves.