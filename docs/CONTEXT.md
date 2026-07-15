# Domain Context

## Purpose

This document defines a shared vocabulary for developers and domain experts working with the Yahoo Fantasy Sports API: fantasy objects, API resources, and shared terminology. OAuth and transport detail belong in their respective docs.

***

## Core Noun Glossary

### Fantasy domain entities

| Term | Ubiquitous meaning |
| --- | --- |
| Game | A fantasy sports game for a specific sport and season (e.g. NFL 2011), identified by a `game_key` that is either a `game_id` (season-specific) or a `game_code` (e.g. `nfl`) that resolves to the current season. |
| Game key | The identifier used in URIs to refer to a game; either `{game_code}` or `{game_id}`, for example `nfl` or `257`. |
| League | A competition within a game where a fixed number of users manage teams under shared rules, such as scoring type, roster positions, and playoff settings. |
| League key | The identifier used in URIs to refer to a specific league within a game, formatted as `{game_key}.l.{league_id}`, for example `223.l.431`. |
| Public league | A league that is publicly visible so that any authenticated app may retrieve its data when permitted by the API's access rules. |
| Private league | A league whose data is only accessible to members of that league; the API requires user-specific authorization to return private league data. |
| Team | A managed fantasy roster within a league, owned or co-owned by one or more users; teams compete using real-world player stats interpreted through league scoring rules. |
| Team key | The identifier used in URIs to refer to a specific team, usually composed of the league key and an internal team identifier. |
| Player | A real-world athlete that can be drafted, rostered, and moved via transactions; players are exposed through player resources and collections. |
| Roster | The set of players currently assigned to a team for a given scoring period (e.g. week or date), constrained by roster positions. |
| Roster position | A position slot type on a roster, such as QB, WR, RB, D, G, or bench (BN), each with a maximum count per team as defined in league settings. |
| Stat category | A category of real-world statistics, such as Passing Yards, Rushing Touchdowns, or Save Percentage, configured by each league and used to compute fantasy scoring. |
| Transaction | A change to a roster or league state (add, drop, trade, waiver claim, etc.), exposed by the transactions resource and subject to league rules. |
| User | A Yahoo account holder who participates in games and leagues; in the API, the "logged in user" (via OAuth) scopes which private data can be retrieved. |

### API & transport entities

| Term | Ubiquitous meaning |
| --- | --- |
| Resource | A singular API entity identified by a key, such as `game`, `league`, `team`, `player`, or `user`. |
| Collection | A group of resources of the same type (e.g. `games`, `leagues`, `teams`, `players`) that can be filtered by keys or other parameters. |
| Sub-resource | A resource or collection nested under another resource in the URI, such as `league/{league_key}/settings` or `team/{team_key}/roster`. |
| Filter | A parameter that narrows a collection, such as `game_keys`, `league_keys`, `team_keys`, `player_keys`, `game_codes`, `seasons`, or `use_login=1`. |
| Parameter | A semicolon-delimited key-value pair in the URI (e.g. `;game_keys=nfl,mlb;seasons=2011`) that controls filters and behavior, including the `out` parameter for branching sub-resources. |
| Request | An HTTP call to the Fantasy Sports API base URL `https://fantasysports.yahooapis.com/fantasy/v2`, built from resources, collections, keys, and parameters. |
| Response | The data returned from a request, typically XML (and optionally JSON) structured under a top-level `<fantasy_content>` element or equivalent JSON structure. |

***

## Core Verb Glossary

### Data retrieval verbs

| Verb | Ubiquitous meaning |
| --- | --- |
| Request a resource | Issue an HTTP GET to a single resource URI, such as `game/{game_key}` or `league/{league_key}`. |
| Request a collection | Issue an HTTP GET to a collection URI (e.g. `games`, `leagues`, `teams`, `players`) possibly with filters like `game_keys` or `seasons`. |
| Filter a collection | Apply URI parameters (e.g. `;game_codes=nfl;seasons=2012`) to reduce which resources are returned from a collection. |
| Chain sub-resources | Extend the URI to include nested resources (e.g. `users;use_login=1/games/leagues/teams`) to traverse the hierarchy in one request. |
| Branch with `out` | Use the `out` parameter to fetch an additional sub-resource (e.g. `league/{league_key};out=settings`) alongside the main chain. |
| Retrieve settings | Fetch a league's or game's settings sub-resource (e.g. scoring rules, roster positions, stat categories) to interpret stats and standings correctly. |
| Retrieve stats | Fetch player or team stats for a given scoring period, using league settings to interpret them. |
| Retrieve a roster | Fetch the roster sub-resource for a team for a given week or date. |

### Fantasy gameplay verbs

| Verb | Ubiquitous meaning |
| --- | --- |
| Draft a player | Assign a player to a team at the start of a season via the league's draft process. |
| Add / drop a player | Create a transaction that moves a player from the free agent pool or waivers onto a team, or removes them from a team. |
| Trade a player | Create a trade transaction between teams, subject to league trade rules and deadlines. |
| Set a lineup | Arrange players into roster positions for a scoring period. |

***

## Speaking Consistently About Data Retrieval

For data access, domain experts should phrase operations in terms of resources, collections, and sub-resources:

- Say **"request the game resource for `nfl`"** or **"GET `game/nfl`"** rather than "hit the NFL endpoint," emphasizing the game resource and key.
- Say **"fetch a games collection filtered by `game_codes` and `seasons`"** for URIs like `/games;game_codes=nfl;seasons=2012`.
- Say **"chain from users to games to leagues to teams"** for URIs such as `users;use_login=1/games/leagues/teams`, making it clear you are traversing sub-resources in a single call.
- When you add `;out=settings`, describe this as **"branching to include the league settings sub-resource via the `out` parameter"**.

This keeps discussions anchored on the REST resource model, which is how the official guide describes the API.

***

## Speaking Consistently About Fantasy Objects

When you talk about the fantasy model itself:

- Always anchor data to a **game**: say **"this league exists within the `nfl` game for season 2011"** rather than treating leagues as global.
- Treat **league settings** (scoring type, roster positions, stat categories) as first-class domain concepts; say **"interpret player stats under the league's scoring settings"**, not just "read stats."
- When relating stats to fantasy points, say **"fantasy value is derived from real-world player stats through the league's configured stat categories and modifiers"**.
- When distinguishing visibility, use **public league** and **private league** tied to membership rules and OAuth scope, not informal terms like "hidden league."

A concise mental model to use in conversations is:

> **Fantasy meaning = real-world sports stats + game context + league rules + user/league visibility scope.**

Using this vocabulary consistently will make it much easier to design APIs, SDKs, and documentation that match how Yahoo's Fantasy Sports platform actually behaves.
