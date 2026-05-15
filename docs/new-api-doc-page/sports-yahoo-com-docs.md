# Sports.yahoo.com Documentation

*Generated on 2026-05-14 14:42:41*

- **Base URL**: https://sports.yahoo.com
- **Total Pages**: 1
- **Max Depth**: 1

---

## Table of Contents

  - [Yahoo Fantasy Sports API Documentation - Yahoo Sports Developer PortalGetting StartedAccessing the APIsAPI ConceptsAPI ReferenceGame APIsLeague APIsTeam APIsPlayer APIsTransaction APIsUser APIs](#yahoo-fantasy-sports-api-documentation-yahoo-sports-developer-portalgetting-startedaccessing-the-apisapi-conceptsapi-referencegame-apisleague-apisteam-apisplayer-apistransaction-apisuser-apis)

---

## Yahoo Fantasy Sports API Documentation - Yahoo Sports Developer PortalGetting StartedAccessing the APIsAPI ConceptsAPI ReferenceGame APIsLeague APIsTeam APIsPlayer APIsTransaction APIsUser APIs

*Source: [https://sports.yahoo.com/developer/docs/](https://sports.yahoo.com/developer/docs/)*

<!-- Source: https://sports.yahoo.com/developer/docs/ -->
<!-- Title: Yahoo Fantasy Sports API Documentation - Yahoo Sports Developer PortalGetting StartedAccessing the APIsAPI ConceptsAPI ReferenceGame APIsLeague APIsTeam APIsPlayer APIsTransaction APIsUser APIs -->
<!-- Depth: 1 -->

☰

# Getting Started

# Accessing the APIs

## OAuth 2.0

To use the Fantasy Sports APIs, you first need to familiarize yourself with OAuth 2.0. OAuth 2.0 is the authentication mechanism that allows users to grant permission to make requests on their behalf. Many other Yahoo! services use OAuth 2.0, and thus all of the underlying details are explained in exhaustive detail in our [primary OAuth 2.0 documentation](https://developer.yahoo.com/oauth2/guide/). Of particular interest is the [OAuth 2.0 Authorization Flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/), which explains where each request is made and where the user is involved.

However, constructing OAuth 2.0 flows from scratch is complicated and easy to get wrong. It’s often easier to use existing libraries, which are available for most languages on the [OAuth.net Code page](https://oauth.net/code/).

The Yahoo Fantasy Sports API requires Oauth 2.0, and all references to Oauth in this documentation refer to this version.

## Register Your Application

To work with OAuth and Yahoo! services, you also must register your application with the Yahoo! Developer Network. When you register your application, you define a scope of Yahoo! services that your application will need access to, as well as the basic descriptive information that will be presented to users of your application when they’re asked to grant you permissions. You will be given a consumer key and secret value that will need to be fed into OAuth requests that you generate. Keep these values secret! Anyone with access to them could masquerade as your application.

To create a new OAuth application to use with the Fantasy Sports APIs, follow the [New API Key flow](https://developer.yahoo.com/apps/create/) on the Yahoo Developer Network (YDN). Be sure to specify that you need access to private user data, and select either Read or Read/Write access for Fantasy Sports. If you don’t have a Yahoo account, you will need to register a new one.

[Go here](https://github.com/smock514/yahoo-fantasy-api-demo/wiki/OAuth2-Flow) to learn more about the user flow through OAuth and how to register your app.

## API Endpoints

The Fantasy Sports APIs are hosted at the following URL: [https://fantasysports.yahooapis.com/fantasy/v2](https://fantasysports.yahooapis.com/fantasy/v2)

## Sample Code

Examples given in PHP.

- [Basic OAuth flow](https://gist.github.com/VerizonMediaOwner/c739411169d6f92ceec36ec33a6ef5b8)

- [Full OAuth flow](https://gist.github.com/VerizonMediaOwner/21926160fbd951854f6cd624197870eb)

- [PUTs and POSTs](https://gist.github.com/VerizonMediaOwner/61df288e0c53e709b247562a4f6253da)

- [Public requests](https://gist.github.com/VerizonMediaOwner/279a90382d817bed1fc66e4cfe55788b)

# API Concepts

The primary building blocks of the Fantasy Sports APIs are resources and collections. Resources typically describe chunks of data that can be identified by a unique key, while collections are simply wrappers that contain similar resources. So, for instance, if we need to retrieve data about a single league, we might ask for a [League resource](#league-resource) and provide a single [league key](#league-resource). However, if we wanted data across several leagues, we would ask for a [Leagues collection](#leagues-collection) and provide multiple league keys or a set of filter parameters.

## Resources

Resources represent the primary entities within our Fantasy games, collecting together the important data fields related to those entities. It is usually possible to reference any particular resource using a globally unique resource key. The resource keys are usually namespaced to represent nesting, using specific delimiters to identify the resource type. Here are some examples of resource key formats:

- **Game key**: <game\_id> - Example: 461

- **League key**: <game\_id>.l.<league\_id> - Example: 461.l.1000

- **Team key**: <game\_id>.l.<league\_id>.t.<team\_id> - Example: 461.l.1000.t.1

- **Player key**: <game\_id>.p.<player\_id> - Example: 461.p.30121

The resource key formats for particular resources are described in more detail in later sections of this document.

- Here is a typical format for requesting a resource: [/fantasy/v2/{resource}/{resource\_key}](https://fantasysports.yahooapis.com/fantasy/v2/%7Bresource%7D/%7Bresource_key%7D)

- Here is the typical format for requesting specific resources within a collection: [/fantasy/v2/{collection};{resource}\_keys={resource\_key1},{resource\_key2}](https://fantasysports.yahooapis.com/fantasy/v2/%7Bcollection%7D;%7Bresource%7D_keys=%7Bresource_key1%7D,%7Bresource_key2%7D)

## Collections

Collections are simply groups of resources. If you care about particular resources within a collection, you can apply filters to the collection to narrow the results. The most common type of filtering is by key. For instance, if you’d like to see two particular players, you could ask for them directly: /fantasy/v2/players;player\_keys={player\_key1},{player\_key2}

- Some collections support more complex filters. Within a game, for example, you might ask for only the players that play a certain position: /fantasy/v2/game/nfl/players;position=QB;count=10

- You could also request only the particular user who is currently logged in: /fantasy/v2/users;use\_login=1

## Sub-Resources

Resources will typically define a list of valid sub-resources. These are resources and collections that can live within the scope of the parent resource. For instance, a fantasy league in the Football draft and trade games can contain up to 20 fantasy teams; therefore, the [League resource](#league-resource) can have a [Teams collection](#teams-collection) as a sub-resource. Generally, if it is possible for multiple of a single sub-resource to be contained within another resource, then a collection of the sub-resources will be returned; otherwise a single sub-resource will be returned.

The scope of a sub-resource is typically defined by the parent resource; for instance, when viewing a [Players collection](#players-collection) as a sub-resource of a particular [League](#league-resource), you would expect to only see Players that are eligible within that League. Further filters could then be applied to this already narrowed list.

Having sub-resources allows you to chain together resources and collections to provide more data, and the URI you request directly specifies how the chaining works. For instance, if you wanted to take a particular logged in user, see which games they’ve played, and then get the league information within those games, you might construct a request like:

```

/fantasy/v2/users;use_login=1/games/leagues
```

This would present you with a [Users collection](#users-collection), a single [User resource](#user-resource) for the logged in user, a [Games collection](#games-collection) for that user, potentially multiple [Game resources](#game-resource) for each game the user is playing, a [Leagues collection](#leagues-collection) beneath each Game resource, and potentially multiple [League resources](#league-resource) for each league the user belongs to in that game.

When you specify a sub-resource beneath a collection, you’re really saying that you want to see that sub-resource appended beneath each resource within the collection. Therefore, the sub-resources available to a collection will be equivalent to the sub-resources available to the corresponding resource.

If you ever need to include other sub-resources outside of your main resource chain, you can use the out parameter, which will let you specify one level of extra sub-resources to pull in. At the moment, you cannot pass any parameters along to these out sub-resources, aside from any data that might get passed by default. This typically means that you can’t chain other resources off of sub-resources specified by the out parameter.

As an example, if you wanted to view a league’s settings along with two teams in particular in the league, you might construct a URI like:

```

/fantasy/v2/league/{league_key};out=settings/teams;team_keys={team_key1},{team_key2}
```

## Parameters

Parameters can be provided to resources and collections as semicolon-delimited key-value pairs. These should be placed after the resource or collection name in the URI; in the case of entry-point resources like [Game](#game-resource) s, [League](#league-resource) s, [Team](#team-resource) s, and [Player](#player-resource) s, the parameters belong after the resource\_key.

```

/fantasy/v2/{resource}/{resource_key};{key}={value};{key}={value}/{collection};{key}={value};{key}={value}/{collection};{key}={value}/{resource};{key}={value}
```

Resource keys, out parameters, and other filters are just specific types of parameters that can be applied to various resources or collections.

# API Reference

# Game APIs

## Game Resource

- HTTP Operations Supported: GET

- URIs:

- [https://fantasysports.yahooapis.com/fantasy/v2/game/{game\_key}](https://fantasysports.yahooapis.com/fantasy/v2/game/%7Bgame_key%7D)

- Extract a sub-resource under a game: /fantasy/v2/game/{game\_key}/{sub\_resource}

- Extract multiple sub-resources from game in the same URI:

- /fantasy/v2/game/{game\_key};out={sub\_resource\_1},{sub\_resource\_2}

- Game key format: {game\_code} or {game\_id} _Example:_ nfl or 461

- Note: If you specify a game\_code as the game\_key, we’ll translate that to the corresponding game\_id upon parsing the URI. Therefore, any game\_codes will be converted to game\_ids in any keys returned by the Fantasy Sports APIs in the API response.

### Description

Using the Game resource, you can obtain the fantasy game related information, like the fantasy game name, game code, and season.

To refer to a Game resource, you’ll need to provide a game\_key, which will either be a game\_id or game\_code. The game\_id is a unique ID identifying a given fantasy game for a given season. For instance, the game\_id for the NFL draft and trade fantasy game for the 2025 season is 461, while the game\_id for the 2020 season is 399. A game\_code generally identifies a game, independent of season, and, when used as a game\_key, will typically return the current season of that game. For instance, the game\_code for the NFL game is nfl, and the game\_code for the MLB game is mlb; using nfl as your game\_key during the 2020 season would be the same as providing the game\_id for the 2020 season of the NFL game (399). Once the next season is available, providing the game\_code would return the next season of that game instead (with a new game\_id). Thus, if you always want the current season of a game, the game\_code can be used as a game\_key.

It may not be immediately obvious how to determine the game\_id for any particular season of a specific game\_code. Luckily, we provide a number of filters on our Games collection that can help narrow down to the specific game that you are interested in.

Specifically, you can determine the game\_id for any particular season with this API call that retrieves a specific season of a game:

```

https://fantasysports.yahooapis.com/fantasy/v2/games;game_codes=<game_code>;seasons=<season>
```

And you can see a listing of all seasons of a particular game with this API call that retrieves all seasons of a specific game:

```

https://fantasysports.yahooapis.com/fantasy/v2/games;game_codes=<game_code>
```

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| metadata | Includes game key, code, name, url, type and season. | /fantasy/v2/game/ [{game\_key}](#game-resource)/metadata | The 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461](https://fantasysports.yahooapis.com/fantasy/v2/game/461) |
| [leagues](#leagues-collection) | Fetch specified leagues under a game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/leagues;league\_keys= [{league\_key1}](#league-resource),{league\_key2} | A publicly viewable league within the 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461/leagues;league\_keys=461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/game/461/leagues;league_keys=461.l.1000) |
| [players](#players-collection) | Fetch specified players under a game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/players;player\_keys= [{player\_key1}](#player-resource),{player\_key2} | Christian McCaffrey’s information from the 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461/players;player\_keys=461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/game/461/players;player_keys=461.p.30121) |
| dates | Key dates relevant to the game | /fantasy/v2/game/ [{game\_key}](#game-resource)/dates | NFL key dates [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/dates](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/dates) |
| game\_weeks | Start and end date information for each week in the game | /fantasy/v2/game/ [{game\_key}](#game-resource)/game\_weeks | NFL game weeks [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/game\_weeks](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/game_weeks) |
| stat\_categories | Detailed description of all available stat categories for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/stat\_categories | NFL stat categories [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/stat\_categories](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/stat_categories) |
| position\_types | Detailed description of all player position types for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/position\_types | NFL position types [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/position\_types](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/position_types) |
| roster\_positions | Detailed description of all roster positions for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/roster\_positions | NFL roster positions [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/roster\_positions](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/roster_positions) |

### Sample Responses

[https://fantasysports.yahooapis.com/fantasy/v2/game/nfl](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/game/nfl" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" time="30.575037002563ms" copyright="Data provided by Yahoo! and STATS, LLC" xmlns="https://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <game>
  <game_key>399</game_key>
  <game_id>399</game_id>
  <name>Football</name>
  <code>nfl</code>
  <type>full</type>
  <url>https://football.fantasysports.yahoo.com/f1</url>
  <season>2020</season>
  <is_registration_over>0</is_registration_over>
  <is_game_over>0</is_game_over>
  <is_offseason>0</is_offseason>
 </game>
</fantasy_content>
```

## Games Collection

With the Games API, you can obtain information from a collection of games simultaneously. Each element beneath the Games collection will be a [Game resource](#game-resource)

**HTTP Operations Supported: GET**

- Any [sub-resource](#sub-resources-1) valid for a game is a valid sub-resource under the games collection.

- Any sub-resource for a collection of games is extracted using a URI like the following:

- /games/{sub\_resource}

- /games;game\_keys={game\_key1},{game\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from games in the same URI using the following formatting:

- /games;out={sub\_resource\_1},{sub\_resource\_2}

- /games;game\_keys={game\_key1},{game\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Examples |
| --- | --- | --- |
| /fantasy/v2/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2} | Fetch specific games {game\_key1} and {game\_key2} | nfl and mlb games: [https://fantasysports.yahooapis.com/fantasy/v2/games;game\_keys=nfl,mlb](https://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=nfl,mlb) |
| /fantasy/v2/users;use\_login=1/games | Fetch all games for the logged in user | all games for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games) |
| /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2} | Fetch specific games {game\_key1} and {game\_key2} that the logged in user owns teams in. | nfl and mlb games for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=nfl,mlb](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl,mlb) |

### Filters

The games collection can have filters such as the following to obtain a subset of a games collection that satisfy the filtering condition. These filters can be combined to obtain a more restricted list of games. For instance, if you wanted only the 2020 version of the nfl game, you might filter by seasons=2020 and game\_codes=nfl.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| is\_available | 1 to only show games currently in season | /games;is\_available=1 |
| game\_types | full | pickem-team |
| game\_codes | Any valid game codes | /games;game\_codes=nfl,mlb |
| seasons | Any valid seasons | /games;seasons=2024,2025 |

### Sub-resources

In addition to the [sub-resources](#sub-resources-1) valid for a game resource, the following are valid sub-resources for a games collection.

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| [teams](#teams-collection) | Fetch teams owned by a user for one or more games. | /fantasy/v2/users;use\_login=1/games/teams OR /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2}/teams | all teams for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/teams) |

# League APIs

## League Resource

When users join a Fantasy Football, Baseball, Basketball, or Hockey draft and trade game, they are organized into leagues with a limited number of friends or other Yahoo! users, with each user managing a [Team](#team-resource). With the League API, you can obtain the league related information, like the league name, the number of teams, the draft status, et cetera. Leagues only exist in the context of a particular [Game](#game-resource), although you can request a League resource as the base of your URI by using the global league\_key. A particular user can only retrieve data for private leagues of which they are a member, or for public leagues.

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/league/{league\_key}](https://fantasysports.yahooapis.com/fantasy/v2/league/%7Bleague_key%7D)

- Extract a sub-resource under a league: /fantasy/v2/league/{league\_key}/{sub\_resource}

- Extract multiple sub-resources from league in the same URI: /fantasy/v2/league/{league\_key};out={sub\_resource\_1},{sub\_resource\_2}

- **League key format:** {game\_key}.l.{league\_id} - Example: nfl.l.1000 or 461.l.1000

- **Note:** The separator between the game\_key and league\_id is a lower case L (not the number 1).

### Sub-resources

_Default sub-resource_: metadata

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes league key, id, name, url, draft status, number of teams, and current week information. | /fantasy/v2/league/ [{league\_key}](#league-resource)/metadata | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000) |
| settings | League settings. For instance, draft type, scoring type, roster positions, stat categories and modifiers, divisions. | /fantasy/v2/league/ [{league\_key}](#league-resource)/settings | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings) |
| standings | Ranking of teams within the league. Accepts [Teams](#teams-collection) as a sub-resource, and includes team\_standingsdata by default beneath the teams | /fantasy/v2/league/ [{league\_key}](#league-resource)/standings | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings) |
| scoreboard | League scoreboard. Accepts Matchups as a sub-resource, which in turn accept [Teams](#teams-collection) as a sub-resource. Includes team\_stats data by default. | _Scoreboard for current week:_ /fantasy/v2/league/ [{league\_key}](#league-resource)/scoreboard _Scoreboard for a particular week:_ /fantasy/v2/league/ [{league\_key}](#league-resource)/scoreboard;week={week} | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard;week=2](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard;week=2) |
| [teams](#teams-collection) | All teams in the league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/teams | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams) |
| [players](#players-collection) | The league's eligible players. | /fantasy/v2/league/ [{league\_key}](#league-resource)/players | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players) |
| draftresults | Draft results for all teams in the league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/draftresults | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/draftresults](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/draftresults) |
| [transactions](#transactions-collection) | League transactions -- adds, drops, and trades. | /fantasy/v2/league/ [{league\_key}](#league-resource)/transactions | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions) |

### Sample Responses

- League Resource: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000)

```

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasyspots.yahooapis.com/fantasy/v2/league/390.l.1000" time="19.485950469971ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
 </league>
</fantasy_content>
```

- League Settings: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/settings" time="28.674125671387ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <settings>
   <draft_type>live</draft_type>
   <is_auction_draft>0</is_auction_draft>
   <scoring_type>head</scoring_type>
   <uses_playoff>1</uses_playoff>
   <has_playoff_consolation_games>1</has_playoff_consolation_games>
   <playoff_start_week>15</playoff_start_week>
   <uses_playoff_reseeding>1</uses_playoff_reseeding>
   <uses_lock_eliminated_teams>1</uses_lock_eliminated_teams>
   <num_playoff_teams>4</num_playoff_teams>
   <num_playoff_consolation_teams>4</num_playoff_consolation_teams>
   <has_multiweek_championship>0</has_multiweek_championship>
   <waiver_type>R</waiver_type>
   <waiver_rule>gametime</waiver_rule>
   <uses_faab>0</uses_faab>
   <draft_time>1564781400</draft_time>
   <draft_pick_time>60</draft_pick_time>
   <post_draft_players>W</post_draft_players>
   <max_teams>10</max_teams>
   <waiver_time>2</waiver_time>
   <trade_end_date>2019-11-09</trade_end_date>
   <trade_ratify_type>vote</trade_ratify_type>
   <trade_reject_time>2</trade_reject_time>
   <player_pool>ALL</player_pool>
   <cant_cut_list>yahoo</cant_cut_list>
   <sendbird_channel_url/>
   <roster_positions>
    <roster_position>
     <position>QB</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>WR</position>
     <position_type>O</position_type>
     <count>2</count>
    </roster_position>
    <roster_position>
     <position>RB</position>
     <position_type>O</position_type>
     <count>2</count>
    </roster_position>
    <roster_position>
     <position>TE</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>W/R/T</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>K</position>
     <position_type>K</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>DEF</position>
     <position_type>DT</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>BN</position>
     <count>6</count>
    </roster_position>
    <roster_position>
     <position>IR</position>
     <count>1</count>
    </roster_position>
   </roster_positions>
   <stat_categories>
    <stats>
     <stat>
      <stat_id>4</stat_id>
      <enabled>1</enabled>
      <name>Passing Yards</name>
      <display_name>Pass Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>5</stat_id>
      <enabled>1</enabled>
      <name>Passing Touchdowns</name>
      <display_name>Pass TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>6</stat_id>
      <enabled>1</enabled>
      <name>Interceptions</name>
      <display_name>Int</display_name>
      <sort_order>0</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>8</stat_id>
      <enabled>1</enabled>
      <name>Rushing Attempts</name>
      <display_name>Rush Att</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>9</stat_id>
      <enabled>1</enabled>
      <name>Rushing Yards</name>
      <display_name>Rush Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>10</stat_id>
      <enabled>1</enabled>
      <name>Rushing Touchdowns</name>
      <display_name>Rush TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>78</stat_id>
      <enabled>1</enabled>
      <name>Targets</name>
      <display_name>Targets</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>11</stat_id>
      <enabled>1</enabled>
      <name>Receptions</name>
      <display_name>Rec</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>12</stat_id>
      <enabled>1</enabled>
      <name>Receiving Yards</name>
      <display_name>Rec Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>13</stat_id>
      <enabled>1</enabled>
      <name>Receiving Touchdowns</name>
      <display_name>Rec TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>15</stat_id>
      <enabled>1</enabled>
      <name>Return Touchdowns</name>
      <display_name>Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>16</stat_id>
      <enabled>1</enabled>
      <name>2-Point Conversions</name>
      <display_name>2-PT</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>18</stat_id>
      <enabled>1</enabled>
      <name>Fumbles Lost</name>
      <display_name>Fum Lost</display_name>
      <sort_order>0</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>57</stat_id>
      <enabled>1</enabled>
      <name>Offensive Fumble Return TD</name>
      <display_name>Fum Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
      <is_excluded_from_display>1</is_excluded_from_display>
     </stat>
     <stat>
      <stat_id>19</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 0-19 Yards</name>
      <display_name>FG 0-19</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>20</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 20-29 Yards</name>
      <display_name>FG 20-29</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>21</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 30-39 Yards</name>
      <display_name>FG 30-39</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>22</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 40-49 Yards</name>
      <display_name>FG 40-49</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>23</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 50+ Yards</name>
      <display_name>FG 50+</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>29</stat_id>
      <enabled>1</enabled>
      <name>Point After Attempt Made</name>
      <display_name>PAT Made</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>31</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed</name>
      <display_name>Pts Allow</display_name>
      <sort_order>0</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>32</stat_id>
      <enabled>1</enabled>
      <name>Sack</name>
      <display_name>Sack</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>33</stat_id>
      <enabled>1</enabled>
      <name>Interception</name>
      <display_name>Int</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>34</stat_id>
      <enabled>1</enabled>
      <name>Fumble Recovery</name>
      <display_name>Fum Rec</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>35</stat_id>
      <enabled>1</enabled>
      <name>Touchdown</name>
      <display_name>TD</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>36</stat_id>
      <enabled>1</enabled>
      <name>Safety</name>
      <display_name>Safe</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>37</stat_id>
      <enabled>1</enabled>
      <name>Block Kick</name>
      <display_name>Blk Kick</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>49</stat_id>
      <enabled>1</enabled>
      <name>Kickoff and Punt Return Touchdowns</name>
      <display_name>Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>82</stat_id>
      <enabled>1</enabled>
      <name>Extra Point Returned</name>
      <display_name>XPR</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
      <is_excluded_from_display>1</is_excluded_from_display>
     </stat>
     <stat>
      <stat_id>50</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 0 points</name>
      <display_name>Pts Allow 0</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>51</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 1-6 points</name>
      <display_name>Pts Allow 1-6</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>52</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 7-13 points</name>
      <display_name>Pts Allow 7-13</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>53</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 14-20 points</name>
      <display_name>Pts Allow 14-20</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>54</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 21-27 points</name>
      <display_name>Pts Allow 21-27</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>55</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 28-34 points</name>
      <display_name>Pts Allow 28-34</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>56</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 35+ points</name>
      <display_name>Pts Allow 35+</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
    </stats>
   </stat_categories>
   <stat_modifiers>
    <stats>
     <stat>
      <stat_id>4</stat_id>
      <value>0.04</value>
     </stat>
     <stat>
      <stat_id>5</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>6</stat_id>
      <value>-1</value>
     </stat>
     <stat>
      <stat_id>9</stat_id>
      <value>0.1</value>
     </stat>
     <stat>
      <stat_id>10</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>11</stat_id>
      <value>0.5</value>
     </stat>
     <stat>
      <stat_id>12</stat_id>
      <value>0.1</value>
     </stat>
     <stat>
      <stat_id>13</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>15</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>16</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>18</stat_id>
      <value>-2</value>
     </stat>
     <stat>
      <stat_id>57</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>19</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>20</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>21</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>22</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>23</stat_id>
      <value>5</value>
     </stat>
     <stat>
      <stat_id>29</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>32</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>33</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>34</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>35</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>36</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>37</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>49</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>50</stat_id>
      <value>10</value>
     </stat>
     <stat>
      <stat_id>51</stat_id>
      <value>7</value>
     </stat>
     <stat>
      <stat_id>52</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>53</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>54</stat_id>
      <value>0</value>
     </stat>
     <stat>
      <stat_id>55</stat_id>
      <value>-1</value>
     </stat>
     <stat>
      <stat_id>56</stat_id>
      <value>-4</value>
     </stat>
     <stat>
      <stat_id>82</stat_id>
      <value>2</value>
     </stat>
    </stats>
   </stat_modifiers>
   <pickem_enabled>1</pickem_enabled>
   <uses_fractional_points>1</uses_fractional_points>
   <uses_negative_points>1</uses_negative_points>
  </settings>
 </league>
</fantasy_content>
```

- League Standings: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/standings" time="143.89801025391ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <standings>
   <teams count="10">
    <team>
     <team_key>390.l.1000.t.10</team_key>
     <team_id>10</team_id>
     <name>Pierre's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/10</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_8_p.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>7</waiver_priority>
     <number_of_moves>14</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>3</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C+</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/10/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>10</manager_id>
       <nickname>--hidden--</nickname>
       <guid>5JCHKZ3FPBB4VK4BXQMZ5SSM2A</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1583.16</total>
     </team_points>
     <team_standings>
      <rank>1</rank>
      <playoff_seed>4</playoff_seed>
      <outcome_totals>
       <wins>8</wins>
       <losses>6</losses>
       <ties>0</ties>
       <percentage>.571</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>2</value>
      </streak>
      <points_for>1583.16</points_for>
      <points_against>1447.26</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.7</team_key>
     <team_id>7</team_id>
     <name>ray's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/7</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_r.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>10</waiver_priority>
     <number_of_moves>82</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>5</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/7/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>7</manager_id>
       <nickname>--hidden--</nickname>
       <guid>PVJLKB47ITJ6NU4ZRWZAUORFDY</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1594.88</total>
     </team_points>
     <team_standings>
      <rank>2</rank>
      <playoff_seed>3</playoff_seed>
      <outcome_totals>
       <wins>9</wins>
       <losses>5</losses>
       <ties>0</ties>
       <percentage>.643</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>1</value>
      </streak>
      <points_for>1594.88</points_for>
      <points_against>1454.78</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.1</team_key>
     <team_id>1</team_id>
     <name>marky's Bold Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>6</waiver_priority>
     <number_of_moves>23</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>8</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>1</manager_id>
       <nickname>--hidden--</nickname>
       <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1567.82</total>
     </team_points>
     <team_standings>
      <rank>3</rank>
      <playoff_seed>2</playoff_seed>
      <outcome_totals>
       <wins>10</wins>
       <losses>4</losses>
       <ties>0</ties>
       <percentage>.714</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>7</value>
      </streak>
      <points_for>1567.82</points_for>
      <points_against>1166.08</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.8</team_key>
     <team_id>8</team_id>
     <name>Mayfield of dreams</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/8</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/24974190479_e917a6ed91.jpg</url>
      </team_logo>
     </team_logos>
     <waiver_priority>5</waiver_priority>
     <number_of_moves>9</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>1</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C+</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/8/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>8</manager_id>
       <nickname>--hidden--</nickname>
       <guid>RIDRSRN5WO4HD2KSBJ3FHZQHRQ</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1646.12</total>
     </team_points>
     <team_standings>
      <rank>4</rank>
      <playoff_seed>1</playoff_seed>
      <outcome_totals>
       <wins>10</wins>
       <losses>4</losses>
       <ties>0</ties>
       <percentage>.714</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>8</value>
      </streak>
      <points_for>1646.12</points_for>
      <points_against>1415.48</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.9</team_key>
     <team_id>9</team_id>
     <name>CHRISTOPHER's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/9</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_c.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>8</waiver_priority>
     <number_of_moves>22</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>2</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/9/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>9</manager_id>
       <nickname>--hidden--</nickname>
       <guid>I26YN6SRCGET2HKBDL6HC7CODC</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1388.46</total>
     </team_points>
     <team_standings>
      <rank>5</rank>
      <playoff_seed>6</playoff_seed>
      <outcome_totals>
       <wins>7</wins>
       <losses>7</losses>
       <ties>0</ties>
       <percentage>.500</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>1</value>
      </streak>
      <points_for>1388.46</points_for>
      <points_against>1415.5</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.6</team_key>
     <team_id>6</team_id>
     <name>Chike's Nice Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>3</waiver_priority>
     <number_of_moves>3</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>10</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>6</manager_id>
       <nickname>--hidden--</nickname>
       <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1344.46</total>
     </team_points>
     <team_standings>
      <rank>6</rank>
      <playoff_seed>8</playoff_seed>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>5</value>
      </streak>
      <points_for>1344.46</points_for>
      <points_against>1449.58</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.2</team_key>
     <team_id>2</team_id>
     <name>Don's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>9</waiver_priority>
     <number_of_moves>12</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>4</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>A-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>2</manager_id>
       <nickname>--hidden--</nickname>
       <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1446.84</total>
     </team_points>
     <team_standings>
      <rank>7</rank>
      <playoff_seed>5</playoff_seed>
      <outcome_totals>
       <wins>8</wins>
       <losses>6</losses>
       <ties>0</ties>
       <percentage>.571</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>4</value>
      </streak>
      <points_for>1446.84</points_for>
      <points_against>1494.94</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.3</team_key>
     <team_id>3</team_id>
     <name>Team 2</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/3</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>4</waiver_priority>
     <number_of_moves>2</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>7</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/3/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>3</manager_id>
       <nickname>--hidden--</nickname>
       <guid>DOOAIV6NXW4VZ7HARR6XCDSA2U</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1242.16</total>
     </team_points>
     <team_standings>
      <rank>8</rank>
      <playoff_seed>7</playoff_seed>
      <outcome_totals>
       <wins>6</wins>
       <losses>8</losses>
       <ties>0</ties>
       <percentage>.429</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>1</value>
      </streak>
      <points_for>1242.16</points_for>
      <points_against>1469.98</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.4</team_key>
     <team_id>4</team_id>
     <name>Andrew's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/4</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_a.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>2</waiver_priority>
     <number_of_moves>0</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>6</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/4/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>4</manager_id>
       <nickname>--hidden--</nickname>
       <guid>SAC2YY4GQ7VGV3YWUVGQ45VD5E</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1226.88</total>
     </team_points>
     <team_standings>
      <rank>9</rank>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>1</value>
      </streak>
      <points_for>1226.88</points_for>
      <points_against>1550.38</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.5</team_key>
     <team_id>5</team_id>
     <name>Maria Moiseeva</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/5</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_1_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>1</waiver_priority>
     <number_of_moves>0</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>9</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/5/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>5</manager_id>
       <nickname>--hidden--</nickname>
       <guid>GDPAQJI3ETKF7SFJ7SI6H6KRXU</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1123.70</total>
     </team_points>
     <team_standings>
      <rank>10</rank>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>7</value>
      </streak>
      <points_for>1123.70</points_for>
      <points_against>1300.5</points_against>
     </team_standings>
    </team>
   </teams>
  </standings>
 </league>
</fantasy_content>
```

- League Scoreboard: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/scoreboard" time="347.84603118896ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <scoreboard>
   <week>16</week>
   <matchups count="4">
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>0</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=1&amp;mid2=8</matchup_recap_url>
     <matchup_recap_title>marky's Bold Team beat Mayfield of dreams for seventh straight win, 112.82-95.80</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.1</team_key>
       <grade>B</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.8</team_key>
       <grade>C</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.1</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.1</team_key>
       <team_id>1</team_id>
       <name>marky's Bold Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>6</waiver_priority>
       <number_of_moves>23</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>8</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>1</manager_id>
         <nickname>--hidden--</nickname>
         <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>112.82</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>108.87</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.8</team_key>
       <team_id>8</team_id>
       <name>Mayfield of dreams</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/8</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/24974190479_e917a6ed91.jpg</url>
        </team_logo>
       </team_logos>
       <waiver_priority>5</waiver_priority>
       <number_of_moves>9</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>1</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C+</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/8/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>8</manager_id>
         <nickname>--hidden--</nickname>
         <guid>RIDRSRN5WO4HD2KSBJ3FHZQHRQ</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>95.80</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.99</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>1</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=2&amp;mid2=3</matchup_recap_url>
     <matchup_recap_title>Don's Team top Team 2 for fourth straight win, 117.32-99.94</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.2</team_key>
       <grade>B</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.3</team_key>
       <grade>B</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.2</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.2</team_key>
       <team_id>2</team_id>
       <name>Don's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>9</waiver_priority>
       <number_of_moves>12</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>4</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>A-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>2</manager_id>
         <nickname>--hidden--</nickname>
         <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>117.32</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>114.03</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.3</team_key>
       <team_id>3</team_id>
       <name>Team 2</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/3</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_m.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>4</waiver_priority>
       <number_of_moves>2</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>7</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/3/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>3</manager_id>
         <nickname>--hidden--</nickname>
         <guid>DOOAIV6NXW4VZ7HARR6XCDSA2U</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.94</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.96</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>1</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=6&amp;mid2=9</matchup_recap_url>
     <matchup_recap_title>CHRISTOPHER's Team hand Chike's Nice Team fifth consecutive loss in 123.36-60.22 rout</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.6</team_key>
       <grade>F</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.9</team_key>
       <grade>A-</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.9</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.6</team_key>
       <team_id>6</team_id>
       <name>Chike's Nice Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>3</waiver_priority>
       <number_of_moves>3</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>10</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>6</manager_id>
         <nickname>--hidden--</nickname>
         <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>60.22</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>90.03</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.9</team_key>
       <team_id>9</team_id>
       <name>CHRISTOPHER's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/9</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_c.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>8</waiver_priority>
       <number_of_moves>22</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>2</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/9/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>9</manager_id>
         <nickname>--hidden--</nickname>
         <guid>I26YN6SRCGET2HKBDL6HC7CODC</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>123.36</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>117.76</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>0</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=7&amp;mid2=10</matchup_recap_url>
     <matchup_recap_title>ray's Team fall to Pierre's Team in 120.34-91.86 rout</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.7</team_key>
       <grade>D</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.10</team_key>
       <grade>B-</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.10</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.7</team_key>
       <team_id>7</team_id>
       <name>ray's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/7</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_r.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>10</waiver_priority>
       <number_of_moves>82</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>5</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/7/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>7</manager_id>
         <nickname>--hidden--</nickname>
         <guid>PVJLKB47ITJ6NU4ZRWZAUORFDY</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>91.86</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>119.55</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.10</team_key>
       <team_id>10</team_id>
       <name>Pierre's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/10</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_8_p.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>7</waiver_priority>
       <number_of_moves>14</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>3</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C+</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/10/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>10</manager_id>
         <nickname>--hidden--</nickname>
         <guid>5JCHKZ3FPBB4VK4BXQMZ5SSM2A</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>121.14</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>112.53</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
   </matchups>
  </scoreboard>
 </league>
</fantasy_content>
```

## Leagues Collection

With the Leagues API, you can obtain information from a collection of leagues simultaneously. Each element beneath the Leagues collection will be a [League resource](#league-resource)

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-3) valid for a league is a valid sub-resource under the leagues collection.

- Any sub-resource for a collection of leagues is extracted using a URI like the following:

- /leagues/{sub\_resource}

- /leagues;league\_keys={league\_key1},{league\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from leagues in the same URI using the following formatting:

- /leagues;out={sub\_resource\_1},{sub\_resource\_2}

- /leagues;league\_keys={league\_key1},{league\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/leagues;league\_keys= [{league\_key1}](#league-resource),{league\_key2} | Fetch specific leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000) |

# Team APIs

## Team Resource

The Team APIs allow you to retrieve information about a team within our fantasy games. The team is the basic unit for keeping track of a roster of players, and can be managed by either one or two managers (the second manager being called a co-manager). With the Team APIs, you can obtain team-related information, like the team name, managers, logos, stats and points, and rosters for particular weeks. Teams only exist in the context of a particular [League](#league-resource), although you can request a Team resource as the base of your URI by using the global [team\_key](#team-resource). A particular user can only retrieve data about a team if that team is part of a private league of which the user is a member, or if it’s in a public league.

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D)

- Extract a sub-resource under a team: /fantasy/v2/team/{team\_key}/{sub\_resource}

- Extract multiple sub-resources from team in the same URI: /fantasy/v2/team/{team\_key};out={sub\_resource\_1},{sub\_resource\_2}

- **Team key format:** {game\_key}.l.{league\_id}.t.{team\_id} - Example: nfl.l.1000.t.1 or 461.l.1000.t.1

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes team key, id, name, url, division ID, logos, and team manager information. | /fantasy/v2/team/ [{team\_key}](#team-resource)/metadata | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1) |
| stats | Team statistical data and points. | _Season stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats _Week stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats;type=week;week={week} Here {week} is a non-zero integer, or current for the current week. _Date stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats;type=date;date={date} For non-NFL, rosters are organized by date instead of week | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=week;week=2](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=week;week=2) |
| standings | Team rank, wins, losses, ties, and winning percentage (as well as divisional data if applicable). | /fantasy/v2/team/ [{team\_key}](#team-resource)/standings | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/standings](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/standings) |
| [roster](#roster-resource) | Team roster. Accepts a week/date parameter. Also accepts [Players](#players-collection) as a sub-resource (included by default) | _Roster for a particular week:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/roster;week={week} Here {week} is a non-zero integer. If week is current, or isn't provided, defaults to current week. _Roster for a particular date_: /fantasy/v2/team/{team\_key}/roster;date={date} For non-NFL, rosters are organized by date instead of week | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster;week=2](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster;week=2) \- The week 2 roster for NFL team 461.l.1000.t.1 [https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/roster;date=2019-08-01](https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/roster;date=2019-08-01) \- The roster for MLB team 388.l.1010.t.1 on 2019-08-01 |
| draftresults | List of players drafted by the team. | /fantasy/v2/team/ [{team\_key}](#team-resource)/draftresults | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/draftresults](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/draftresults) |
| matchups | All the matchups this team has scheduled (for H2H leagues). | _All matchups:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/matchups _Particular weeks:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/matchups;weeks=1,3,6 | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,3,6](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,3,6) |

### Sample Responses

- Team Resource: [/fantasy/v2/team/461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1" time="30.21502494812ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
 </team>
</fantasy_content>
```

- Team Matchups: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,5](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,5) \- team’s matchups for weeks 1 and 5 in a NFL H2H league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/matchups;weeks=1,5" time="112.8261089325ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <matchups count="2">
   <matchup>
    <week>1</week>
    <week_start>2019-09-05</week_start>
    <week_end>2019-09-09</week_end>
    <status>postevent</status>
    <is_playoffs>0</is_playoffs>
    <is_consolation>0</is_consolation>
    <is_matchup_recap_available>1</is_matchup_recap_available>
    <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=1&amp;mid1=1&amp;mid2=2</matchup_recap_url>
    <matchup_recap_title>Offensively challenged Don's Team knock off marky's Bold Team, 107.56-96.82</matchup_recap_title>
    <matchup_grades>
     <matchup_grade>
      <team_key>390.l.1000.t.1</team_key>
      <grade>B</grade>
     </matchup_grade>
     <matchup_grade>
      <team_key>390.l.1000.t.2</team_key>
      <grade>B</grade>
     </matchup_grade>
    </matchup_grades>
    <is_tied>0</is_tied>
    <winner_team_key>390.l.1000.t.2</winner_team_key>
    <teams count="2">
     <team>
      <team_key>390.l.1000.t.1</team_key>
      <team_id>1</team_id>
      <name>marky's Bold Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>6</waiver_priority>
      <number_of_moves>23</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <clinched_playoffs>1</clinched_playoffs>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>8</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>1</manager_id>
        <nickname>--hidden--</nickname>
        <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
       </manager>
      </managers>
      <win_probability>0</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>96.82</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>103.57</total>
      </team_projected_points>
     </team>
     <team>
      <team_key>390.l.1000.t.2</team_key>
      <team_id>2</team_id>
      <name>Don's Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>9</waiver_priority>
      <number_of_moves>12</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>4</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>A-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>2</manager_id>
        <nickname>--hidden--</nickname>
        <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
       </manager>
      </managers>
      <win_probability>1</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>107.56</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>124.18</total>
      </team_projected_points>
     </team>
    </teams>
   </matchup>
   <matchup>
    <week>5</week>
    <week_start>2019-10-01</week_start>
    <week_end>2019-10-07</week_end>
    <status>postevent</status>
    <is_playoffs>0</is_playoffs>
    <is_consolation>0</is_consolation>
    <is_matchup_recap_available>1</is_matchup_recap_available>
    <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=5&amp;mid1=1&amp;mid2=6</matchup_recap_url>
    <matchup_recap_title>marky's Bold Team earn win over Chike's Nice Team in 154.92-83.84 rout</matchup_recap_title>
    <matchup_grades>
     <matchup_grade>
      <team_key>390.l.1000.t.1</team_key>
      <grade>A+</grade>
     </matchup_grade>
     <matchup_grade>
      <team_key>390.l.1000.t.6</team_key>
      <grade>D+</grade>
     </matchup_grade>
    </matchup_grades>
    <is_tied>0</is_tied>
    <winner_team_key>390.l.1000.t.1</winner_team_key>
    <teams count="2">
     <team>
      <team_key>390.l.1000.t.1</team_key>
      <team_id>1</team_id>
      <name>marky's Bold Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>6</waiver_priority>
      <number_of_moves>23</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <clinched_playoffs>1</clinched_playoffs>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>8</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>1</manager_id>
        <nickname>--hidden--</nickname>
        <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
       </manager>
      </managers>
      <win_probability>1</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>154.92</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>107.83</total>
      </team_projected_points>
     </team>
     <team>
      <team_key>390.l.1000.t.6</team_key>
      <team_id>6</team_id>
      <name>Chike's Nice Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>3</waiver_priority>
      <number_of_moves>3</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>10</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>6</manager_id>
        <nickname>--hidden--</nickname>
        <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
       </manager>
      </managers>
      <win_probability>0</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>83.84</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>115.54</total>
      </team_projected_points>
     </team>
    </teams>
   </matchup>
  </matchups>
 </team>
</fantasy_content>
```

- NFL Team Season Stats: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=season](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=season) \- team’s season stats in a NFL H2H league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/stats;type=season" time="40.952920913696ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <team_points>
   <coverage_type>season</coverage_type>
   <season>2019</season>
   <total>1567.82</total>
  </team_points>
 </team>
</fantasy_content>
```

- MLB Team Date Stats: [https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06](https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06) \- team’s date stats in a MLB roto league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06" time="158.32614898682ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>388.l.1010.t.1</team_key>
  <team_id>1</team_id>
  <name>CHAMPS</name>
  <url>https://baseball.fantasysports.yahoo.com/2019/b1/1010/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/mlb/mlb_3.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>7</waiver_priority>
  <number_of_moves>32</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>25</coverage_value>
   <value>2</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>2</draft_position>
  <has_draft_grade>0</has_draft_grade>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>ILW73TYMCXYPVTNKMNEYX3HRXM</guid>
   </manager>
  </managers>
  <team_stats>
   <coverage_type>date</coverage_type>
   <date>2019-07-06</date>
   <stats>
    <stat>
     <stat_id>60</stat_id>
     <value>11/40</value>
    </stat>
    <stat>
     <stat_id>7</stat_id>
     <value>4</value>
    </stat>
    <stat>
     <stat_id>12</stat_id>
     <value>1</value>
    </stat>
    <stat>
     <stat_id>13</stat_id>
     <value>7</value>
    </stat>
    <stat>
     <stat_id>16</stat_id>
     <value>1</value>
    </stat>
    <stat>
     <stat_id>3</stat_id>
     <value>.275</value>
    </stat>
    <stat>
     <stat_id>50</stat_id>
     <value>14.0</value>
    </stat>
    <stat>
     <stat_id>28</stat_id>
     <value>2</value>
    </stat>
    <stat>
     <stat_id>32</stat_id>
     <value>0</value>
    </stat>
    <stat>
     <stat_id>42</stat_id>
     <value>11</value>
    </stat>
    <stat>
     <stat_id>26</stat_id>
     <value>5.14</value>
    </stat>
    <stat>
     <stat_id>27</stat_id>
     <value>1.36</value>
    </stat>
   </stats>
  </team_stats>
 </team>
</fantasy_content>
```

## Teams Collection

With the Teams API, you can obtain information from a collection of teams simultaneously. The teams collection is qualified in the URI by a particular league to obtain information about teams within the league, or by a particular user (and optionally, a game) to obtain information about the teams owned by the user. Each element beneath the Teams collection will be a [Team resource](#team-resource).

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-4) valid for a team is a valid sub-resource under the teams collection.

- Any sub-resource for a collection of teams is extracted using a URI like the following:

- /teams/{sub\_resource}

- /teams;team\_keys={team\_key1},{team\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from teams in the same URI using the following formatting:

- /teams;out={sub\_resource\_1},{sub\_resource\_2}

- /teams;team\_keys={team\_key1},{team\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/teams | Fetch all teams within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams) |
| /fantasy/v2/teams;team\_keys= [{team\_key1}](#team-resource),{team\_key2} | Fetch specific teams {team\_key1} and {team\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/teams;team\_keys=461.l.1000.t.1,461.l.1001.t.2](https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys=461.l.1000.t.1,461.l.1001.t.2) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/teams | Fetch all teams of the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.1001/teams](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.1001/teams) |
| /fantasy/v2/users;use\_login=1/teams | Fetch all teams for the logged in user | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/teams) |
| /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2}/teams | Fetch all teams for the logged in user for the games {game\_key1} and {game\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=nfl,mlb/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl,mlb/teams) |

## Roster Resource

Players on a team are organized into rosters corresponding to certain weeks, in NFL, or certain dates, in MLB, NBA, and NHL. Each player on a roster will be assigned a position if they’re in the starting lineup, or will be on the bench. You can only receive credit for stats accumulated by players in your starting lineup.

You can use this API to edit your lineup by PUTting up new positions for the players on a roster. You can also add/drop players from your roster by POSTing new transactions to the league’s transactions collection.

Even though there are many rosters (for particular dates or weeks) contained within a single team, we only currently support requesting a single roster at a time (as a sub-resource, not as a collection) within a Team resource.

- **HTTP Operations Supported:**

- GET

- PUT

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster)

- Extract a sub-resource under a roster:

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster/{sub\_resource}](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster/%7Bsub_resource%7D)

- For NFL, you can specify a week parameter to retrieve a specific week – otherwise it will default to the current roster

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster;week=10](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster;week=10)

- For MLB, NHL, or NBA, you can specify a date parameter to retrieve a specific date – otherwise it will default to today’s roster.

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster;date=2019-07-01](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster;date=2019-07-01)

### Sub-resources

_Default sub-resource:_ players

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| [players](#players-collection) | Access the players collection within the roster. | /fantasy/v2/team/ [{team\_key}](#team-resource)/roster/players | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players) |

### Sample Responses

Roster Players: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/roster/players" time="71.652889251709ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <roster>
   <coverage_type>week</coverage_type>
   <week>16</week>
   <is_editable>0</is_editable>
   <players count="15">
    <player>
     <player_key>390.p.31833</player_key>
     <player_id>31833</player_id>
     <name>
      <full>Kyler Murray</full>
      <first>Kyler</first>
      <last>Murray</last>
      <ascii_first>Kyler</ascii_first>
      <ascii_last>Murray</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31833</editorial_player_key>
     <editorial_team_key>nfl.t.22</editorial_team_key>
     <editorial_team_full_name>Arizona Cardinals</editorial_team_full_name>
     <editorial_team_abbr>Ari</editorial_team_abbr>
     <bye_weeks>
      <week>12</week>
     </bye_weeks>
     <uniform_number>1</uniform_number>
     <display_position>QB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/P_YAlI23JfFA_1nS6l7vWA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08062019/31833.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/P_YAlI23JfFA_1nS6l7vWA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08062019/31833.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>QB</primary_position>
     <eligible_positions>
      <position>QB</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>QB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31051</player_key>
     <player_id>31051</player_id>
     <name>
      <full>Michael Gallup</full>
      <first>Michael</first>
      <last>Gallup</last>
      <ascii_first>Michael</ascii_first>
      <ascii_last>Gallup</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31051</editorial_player_key>
     <editorial_team_key>nfl.t.6</editorial_team_key>
     <editorial_team_full_name>Dallas Cowboys</editorial_team_full_name>
     <editorial_team_abbr>Dal</editorial_team_abbr>
     <bye_weeks>
      <week>8</week>
     </bye_weeks>
     <uniform_number>13</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/16dAM_tZ8DfvOoO8Bx.XjA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31051.1.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/16dAM_tZ8DfvOoO8Bx.XjA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31051.1.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>WR</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30182</player_key>
     <player_id>30182</player_id>
     <name>
      <full>Cooper Kupp</full>
      <first>Cooper</first>
      <last>Kupp</last>
      <ascii_first>Cooper</ascii_first>
      <ascii_last>Kupp</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30182</editorial_player_key>
     <editorial_team_key>nfl.t.14</editorial_team_key>
     <editorial_team_full_name>Los Angeles Rams</editorial_team_full_name>
     <editorial_team_abbr>LAR</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>10</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/lalq4GQm81B5HwQHQx6wDg--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30182.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/lalq4GQm81B5HwQHQx6wDg--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30182.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>WR</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.28403</player_key>
     <player_id>28403</player_id>
     <name>
      <full>Melvin Gordon III</full>
      <first>Melvin</first>
      <last>Gordon III</last>
      <ascii_first>Melvin</ascii_first>
      <ascii_last>Gordon III</ascii_last>
     </name>
     <editorial_player_key>nfl.p.28403</editorial_player_key>
     <editorial_team_key>nfl.t.7</editorial_team_key>
     <editorial_team_full_name>Denver Broncos</editorial_team_full_name>
     <editorial_team_abbr>Den</editorial_team_abbr>
     <bye_weeks>
      <week>10</week>
     </bye_weeks>
     <uniform_number>25</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/nSTMDQOiYSnOjVHiaPebfw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08152019/28403.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/nSTMDQOiYSnOjVHiaPebfw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08152019/28403.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>RB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31228</player_key>
     <player_id>31228</player_id>
     <name>
      <full>Mike Boone</full>
      <first>Mike</first>
      <last>Boone</last>
      <ascii_first>Mike</ascii_first>
      <ascii_last>Boone</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31228</editorial_player_key>
     <editorial_team_key>nfl.t.16</editorial_team_key>
     <editorial_team_full_name>Minnesota Vikings</editorial_team_full_name>
     <editorial_team_abbr>Min</editorial_team_abbr>
     <bye_weeks>
      <week>12</week>
     </bye_weeks>
     <uniform_number>23</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/RzYtRW9jiodtk1Gj0QZzrQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/31228.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/RzYtRW9jiodtk1Gj0QZzrQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/31228.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>RB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31019</player_key>
     <player_id>31019</player_id>
     <name>
      <full>Dallas Goedert</full>
      <first>Dallas</first>
      <last>Goedert</last>
      <ascii_first>Dallas</ascii_first>
      <ascii_last>Goedert</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31019</editorial_player_key>
     <editorial_team_key>nfl.t.21</editorial_team_key>
     <editorial_team_full_name>Philadelphia Eagles</editorial_team_full_name>
     <editorial_team_abbr>Phi</editorial_team_abbr>
     <bye_weeks>
      <week>10</week>
     </bye_weeks>
     <uniform_number>88</uniform_number>
     <display_position>TE</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/OLFWL8womkbApafC0KvN6w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31019.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/OLFWL8womkbApafC0KvN6w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31019.png</image_url>

     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>TE</primary_position>
     <eligible_positions>
      <position>TE</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>TE</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.29281</player_key>
     <player_id>29281</player_id>
     <name>
      <full>Michael Thomas</full>
      <first>Michael</first>
      <last>Thomas</last>
      <ascii_first>Michael</ascii_first>
      <ascii_last>Thomas</ascii_last>
     </name>
     <editorial_player_key>nfl.p.29281</editorial_player_key>
     <editorial_team_key>nfl.t.18</editorial_team_key>
     <editorial_team_full_name>New Orleans Saints</editorial_team_full_name>
     <editorial_team_abbr>NO</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>13</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/cearLySB.TP8BAZc8ai7Ig--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/29281.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/cearLySB.TP8BAZc8ai7Ig--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/29281.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>W/R/T</position>
      <is_flex>1</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.29279</player_key>
     <player_id>29279</player_id>
     <name>
      <full>Derrick Henry</full>
      <first>Derrick</first>
      <last>Henry</last>
      <ascii_first>Derrick</ascii_first>
      <ascii_last>Henry</ascii_last>
     </name>
     <editorial_player_key>nfl.p.29279</editorial_player_key>
     <editorial_team_key>nfl.t.10</editorial_team_key>
     <editorial_team_full_name>Tennessee Titans</editorial_team_full_name>
     <editorial_team_abbr>Ten</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number>22</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/R429FlhNa_Hub0Djx_5UlA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08232019/29279.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/R429FlhNa_Hub0Djx_5UlA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08232019/29279.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <player_notes_last_timestamp>1591215527</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30971</player_key>
     <player_id>30971</player_id>
     <name>
      <full>Baker Mayfield</full>
      <first>Baker</first>
      <last>Mayfield</last>
      <ascii_first>Baker</ascii_first>
      <ascii_last>Mayfield</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30971</editorial_player_key>
     <editorial_team_key>nfl.t.5</editorial_team_key>
     <editorial_team_full_name>Cleveland Browns</editorial_team_full_name>
     <editorial_team_abbr>Cle</editorial_team_abbr>
     <bye_weeks>
      <week>7</week>
     </bye_weeks>
     <uniform_number>6</uniform_number>
     <display_position>QB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/B7BiBtG9Y3Q_17hxPY.HkQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30971.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/B7BiBtG9Y3Q_17hxPY.HkQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30971.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>QB</primary_position>
     <eligible_positions>
      <position>QB</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <player_notes_last_timestamp>1591308412</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.28398</player_key>
     <player_id>28398</player_id>
     <name>
      <full>Todd Gurley II</full>
      <first>Todd</first>
      <last>Gurley II</last>
      <ascii_first>Todd</ascii_first>
      <ascii_last>Gurley II</ascii_last>
     </name>
     <editorial_player_key>nfl.p.28398</editorial_player_key>
     <editorial_team_key>nfl.t.1</editorial_team_key>
     <editorial_team_full_name>Atlanta Falcons</editorial_team_full_name>
     <editorial_team_abbr>Atl</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>21</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/CysIvnp3dwrmK9iImyiSPw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/28398.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/CysIvnp3dwrmK9iImyiSPw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/28398.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <has_recent_player_notes>1</has_recent_player_notes>
     <player_notes_last_timestamp>1591706729</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30157</player_key>
     <player_id>30157</player_id>
     <name>
      <full>Gerald Everett</full>
      <first>Gerald</first>
      <last>Everett</last>
      <ascii_first>Gerald</ascii_first>
      <ascii_last>Everett</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30157</editorial_player_key>
     <editorial_team_key>nfl.t.14</editorial_team_key>
     <editorial_team_full_name>Los Angeles Rams</editorial_team_full_name>
     <editorial_team_abbr>LAR</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>81</uniform_number>
     <display_position>TE</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/Pswufbbx3KS3XTSlEpmM2w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30157.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/Pswufbbx3KS3XTSlEpmM2w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30157.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>TE</primary_position>
     <eligible_positions>
      <position>TE</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31896</player_key>
     <player_id>31896</player_id>
     <name>
      <full>DK Metcalf</full>
      <first>DK</first>
      <last>Metcalf</last>
      <ascii_first>DK</ascii_first>
      <ascii_last>Metcalf</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31896</editorial_player_key>
     <editorial_team_key>nfl.t.26</editorial_team_key>
     <editorial_team_full_name>Seattle Seahawks</editorial_team_full_name>
     <editorial_team_abbr>Sea</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number>14</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/yr4AQCZ_vGBRP1Tr6QiZcQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08102019/31896.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/yr4AQCZ_vGBRP1Tr6QiZcQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08102019/31896.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.32002</player_key>
     <player_id>32002</player_id>
     <name>
      <full>Austin Seibert</full>
      <first>Austin</first>
      <last>Seibert</last>
      <ascii_first>Austin</ascii_first>
      <ascii_last>Seibert</ascii_last>
     </name>
     <editorial_player_key>nfl.p.32002</editorial_player_key>
     <editorial_team_key>nfl.t.5</editorial_team_key>
     <editorial_team_full_name>Cleveland Browns</editorial_team_full_name>
     <editorial_team_abbr>Cle</editorial_team_abbr>
     <bye_weeks>
      <week>7</week>
     </bye_weeks>
     <uniform_number>4</uniform_number>
     <display_position>K</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/i0dp02LJ0zd5LNOdjkUGyQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08092019/32002.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/i0dp02LJ0zd5LNOdjkUGyQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08092019/32002.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>K</position_type>
     <primary_position>K</primary_position>
     <eligible_positions>
      <position>K</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>K</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.100026</player_key>
     <player_id>100026</player_id>
     <name>
      <full>Seattle</full>
      <first>Seattle</first>
      <last/>
      <ascii_first>Seattle</ascii_first>
      <ascii_last/>
     </name>
     <editorial_player_key>nfl.p.100026</editorial_player_key>
     <editorial_team_key>nfl.t.26</editorial_team_key>
     <editorial_team_full_name>Seattle Seahawks</editorial_team_full_name>
     <editorial_team_abbr>Sea</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number></uniform_number>
     <display_position>DEF</display_position>
     <headshot>
      <url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/sea.gif</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/sea.gif</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>DT</position_type>
     <primary_position>DEF</primary_position>
     <eligible_positions>
      <position>DEF</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>DEF</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.100009</player_key>
     <player_id>100009</player_id>
     <name>
      <full>Green Bay</full>
      <first>Green Bay</first>
      <last/>
      <ascii_first>Green Bay</ascii_first>
      <ascii_last/>
     </name>
     <editorial_player_key>nfl.p.100009</editorial_player_key>
     <editorial_team_key>nfl.t.9</editorial_team_key>
     <editorial_team_full_name>Green Bay Packers</editorial_team_full_name>
     <editorial_team_abbr>GB</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number></uniform_number>
     <display_position>DEF</display_position>
     <headshot>
      <url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/gnb.gif</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/gnb.gif</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>DT</position_type>
     <primary_position>DEF</primary_position>
     <eligible_positions>
      <position>DEF</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
   </players>
  </roster>
 </team>
</fantasy_content>
```

### PUT

Using PUT, you may modify a subset of players on the roster for a particular day, specifically in terms of changing their position or whether they’re in the starting lineup. The URL to PUT to a Roster resource is:

[https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster)

You may move as many players as you like in your input XML – any players whose position you do not change will stay in the same position they were previously. If you try to move players in an invalid way, you will receive an error and no changes will be made.

Your input XML should look like:

#### NFL

```xml

<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>week</coverage_type>
    <week>13</week>

    <players>
      <player>
        <player_key>461.p.8332</player_key>
        <position>WR</position>
      </player>
      <player>
        <player_key>461.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

#### MLB, NBA, or NHL

```xml

<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>2019-05-01</date>

    <players>
      <player>
        <player_key>388.p.8332</player_key>
        <position>1B</position>
      </player>
      <player>
        <player_key>388.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

# Player APIs

## Player Resource

With the Player API, you can obtain the player (athlete) related information, such as their name, professional team, and eligible positions. The player is identified in the context of a particular game, and can be requested as the base of your URI by using the global [player\_key](#player-key-format).

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key}](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D)

- Extract a sub-resource under a player:

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key}/{sub\_resource}](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D/%7Bsub_resource%7D)

- Extract multiple sub-resources from player in the same URI:

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key};out={sub\_resource\_1},{sub\_resource\_2](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D;out=%7Bsub_resource_1%7D,%7Bsub_resource_2)}

- **Player key format** {#player-key-format}: {game\_key}.p.{player\_id}

- _Example:_ nfl.p.30121 or 461.p.30121

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| metadata | Includes player key, id, name, editorial information, image, eligible positions, etc. | /fantasy/v2/player/ [{player\_key}](#player-resource)/metadata | Christian McCaffrey’s info in the 2025 season: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121) |
| stats | Player stats and points (if in a league context). | _Season stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats _Week stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats;type=week;week={week} Here {week} is a non-zero integer. _Date stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats;type=date;date={date} For non-NFL, stats are also available by date instead of week | Christian McCaffrey’s info and stats in the 2019 season: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/stats](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/stats) |
| ownership | The player ownership status within a league (whether they're owned by a team, on waivers, or free agents). Only relevant within a league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/players;player\_keys= [{player\_key}](#player-resource)/ownership | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121/ownership](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121/ownership) |
| percent\_owned | Data about ownership percentage of the player | /fantasy/v2/player/ [{player\_key}](#player-resource)/percent\_owned | The percentage of leagues in which Christian McCaffrey was owned in the 2020 game: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/percent\_owned](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/percent_owned) |
| draft\_analysis | Average pick, Average round and Percent Drafted. | /fantasy/v2/player/ [{player\_key}](#player-resource)/draft\_analysis | Yahoo! fantasy draft information for Christan McCaffrey in 2019: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/draft\_analysis](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/draft_analysis) |

### Sample Responses

- Player Resource: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121) \- Player in a NFL league context

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/players;player_keys=390.p.30121" time="47.651052474976ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <players count="1">
   <player>
    <player_key>390.p.30121</player_key>
    <player_id>30121</player_id>
    <name>
     <full>Christian McCaffrey</full>
     <first>Christian</first>
     <last>McCaffrey</last>
     <ascii_first>Christian</ascii_first>
     <ascii_last>McCaffrey</ascii_last>
    </name>
    <editorial_player_key>nfl.p.30121</editorial_player_key>
    <editorial_team_key>nfl.t.29</editorial_team_key>
    <editorial_team_full_name>Carolina Panthers</editorial_team_full_name>
    <editorial_team_abbr>Car</editorial_team_abbr>
    <bye_weeks>
     <week>7</week>
    </bye_weeks>
    <uniform_number>22</uniform_number>
    <display_position>RB</display_position>
    <headshot>
     <url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</url>
     <size>small</size>
    </headshot>
    <image_url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</image_url>
    <is_undroppable>0</is_undroppable>
    <position_type>O</position_type>
    <primary_position>RB</primary_position>
    <eligible_positions>
     <position>RB</position>
     <position>W/R/T</position>
    </eligible_positions>
   </player>
  </players>
 </league>
</fantasy_content>
```

- NFL Player Season Stats: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121/stats](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121/stats) \- Player season stats in a NFL league context

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/players;player_keys=390.p.30121/stats" time="30.03978729248ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <players count="1">
   <player>
    <player_key>390.p.30121</player_key>
    <player_id>30121</player_id>
    <name>
     <full>Christian McCaffrey</full>
     <first>Christian</first>
     <last>McCaffrey</last>
     <ascii_first>Christian</ascii_first>
     <ascii_last>McCaffrey</ascii_last>
    </name>
    <editorial_player_key>nfl.p.30121</editorial_player_key>
    <editorial_team_key>nfl.t.29</editorial_team_key>
    <editorial_team_full_name>Carolina Panthers</editorial_team_full_name>
    <editorial_team_abbr>Car</editorial_team_abbr>
    <bye_weeks>
     <week>7</week>
    </bye_weeks>
    <uniform_number>22</uniform_number>
    <display_position>RB</display_position>
    <headshot>
     <url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</url>
     <size>small</size>
    </headshot>
    <image_url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</image_url>
    <is_undroppable>0</is_undroppable>
    <position_type>O</position_type>
    <primary_position>RB</primary_position>
    <eligible_positions>
     <position>RB</position>
     <position>W/R/T</position>
    </eligible_positions>
    <player_stats>
     <coverage_type>season</coverage_type>
     <season>2019</season>
     <stats>
      <stat>
       <stat_id>4</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>5</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>6</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>8</stat_id>
       <value>287</value>
      </stat>
      <stat>
       <stat_id>9</stat_id>
       <value>1387</value>
      </stat>
      <stat>
       <stat_id>10</stat_id>
       <value>15</value>
      </stat>
      <stat>
       <stat_id>78</stat_id>
       <value>142</value>
      </stat>
      <stat>
       <stat_id>11</stat_id>
       <value>116</value>
      </stat>
      <stat>
       <stat_id>12</stat_id>
       <value>1005</value>
      </stat>
      <stat>
       <stat_id>13</stat_id>
       <value>4</value>
      </stat>
      <stat>
       <stat_id>15</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>16</stat_id>
       <value>1</value>
      </stat>
      <stat>
       <stat_id>18</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>57</stat_id>
       <value>0</value>
      </stat>
     </stats>
    </player_stats>
    <player_points>
     <coverage_type>season</coverage_type>
     <season>2019</season>
     <total>413.20</total>
    </player_points>
   </player>
  </players>
 </league>
</fantasy_content>
```

## Players Collection

With the Players API, you can obtain information from a collection of players simultaneously. To obtain general players information, the players collection can be qualified in the URI by a particular game, league or team. To obtain specific league or team related information, the players collection is qualified by the relevant league or team. Each element beneath the Players collection will be a [Player resource](#player-resource)

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-6) valid for a player is a valid sub-resource under the players collection.

- Any sub-resource for a collection of players is extracted using a URI like the following:

- /players/{sub\_resource}

- /players;player\_keys={player\_key1},{player\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from players in the same URI using the following formatting:

- /players;out={sub\_resource\_1},{sub\_resource\_2}

- /players;player\_keys={player\_key1},{player\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/players | Fetch all players within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/players | Fetch all players from the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.10011/players](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.10011/players) |
| /fantasy/v2/team/ [{team\_key}](#team-resource)/players | Fetch all players within a team. | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/players) |
| /fantasy/v2/teams;team\_keys={team\_key1},{team\_key2}/players | Fetch all players from the teams {team\_key1} and {team\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/teams;team\_keys=461.l.1000.t.1,461.l.1000.t.2/players](https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys=461.l.1000.t.1,461.l.1000.t.2/players) |
| /fantasy/v2/players;player\_keys= [{player\_key1}](#player-resource),{player\_key2} | Fetch specific players {player\_key1} and {player\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/players;player\_keys=461.p.30121,461.p.31002](https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=461.p.30121,461.p.31002) |

### Filters

The players collection can have filters such as the following to obtain a subset of a players collection that satisfy the filtering condition. The filters can be combined to obtain a more restricted list of players.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| position | Valid player positions | /players;position=QB **Note** Applied only in a league’s context |
| status | A (all available players) FA (free agents only) W (waivers only) T (all taken players) K (keepers only) | /players;status=A **Note** Applied only in a league’s context |
| search | player name | /players;search=smith **Note** Applied only in a league’s context |
| sort | {stat\_id} NAME (last, first) OR (overall rank) AR (actual rank) PTS (fantasy points) | /players;sort=60 **Note** Applied only in a league’s context |
| sort\_type | season date (baseball, basketball, and hockey only) week (football only) lastweek (baseball, basketball, and hockey only) lastmonth | /players;sort\_type=season **Note** Applied only in a league’s context |
| sort\_season | year | /players;sort\_type=season;sort\_season=2019 **Note** Applied only in a league’s context |
| sort\_date (baseball, basketball, and hockey only) | YYYY-MM-DD | /players;sort\_type=date;sort\_date=2019-02-01 **Note** Applied only in a league’s context |
| sort\_week (football only) | week | /players;sort\_type=week;sort\_week=10 **Note** Applied only in a league’s context |
| start | Pagination start value. Any integer 0 or greater | /players;start=25 |
| count | Number of items in pagination. Any integer greater than 0 | /players;count=5 |

# Transaction APIs

## Transaction Resource

With the Transaction API, you can obtain information about transactions (adds, drops, trades, and league settings changes) performed on a league. A transaction is identified in the context of a particular league, although you can request a particular Transaction resource as the base of your URI by using the global [transaction\_key](#transaction-key-format).

You can also PUT to the API to perform operations like editing waiver priorities or FAAB bids, or modifying the state of pending trades. You can also cancel pending transactions by DELETEing them.

Keep in mind, if you don’t have the [transaction\_key](#transaction-key-format) for a waiver claim or pending trade, the only way to discover these transactions is to filter the league [Transactions collection](#transactions-collection) by a particular type (waiver or pending\_trade) and by a particular [transaction\_key](#transaction-key-format). Pending transactions will not show up if you simply ask for all of the transactions in the league, because they can only be seen by certain teams.

- **HTTP Operations Supported**

- GET

- PUT

- DELETE

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key)}

- Extract a sub-resource under a transaction:

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key}/{sub\_resource](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key%7D/%7Bsub_resource)}

- Extract multiple sub-resources from transaction in the same URI:

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key};out={sub\_resource\_1},{sub\_resource\_2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key%7D;out=%7Bsub_resource_1%7D,%7Bsub_resource_2)}

- **Transaction key format** {#transaction-key-format}

- Completed transactions: {game\_key}.l.{league\_id}.tr.{transaction\_id}

- _Example:_ nfl.l.1000.tr.26 or 461.l.1000.tr.26

- Waiver claims: {game\_key}.l.{league\_id}.w.c.{claim\_id}

- _Example:_ 461.l.1000.w.c.2\_6461

- Pending trades: {game\_key}.l.{league\_id}.pt.{pending\_trade\_id}

- _Example:_ 461.l.1000.pt.1

### Sub-resources

_Default sub-resources:_ metadata, players

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes transaction key, id, type, timestamp, status, players (not displayed for all transaction types) | /fantasy/v2/transaction/ [{transaction\_key}](#transaction-key-format)/metadata | An add/drop transaction: [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2) |
| [players](#players-collection) | Players that are part of the transaction. The [Player Resources](#player-resource) will include a transaction data element by default. | /fantasy/v2/transaction/ [{transaction\_key}](#transaction-key-format)/players | [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.26/players](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.26/players) |

### Sample Responses

Add/Drop Transaction: [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2) \- Completed add/drop transaction

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/transaction/390.l.1000.tr.2" time="38.97500038147ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <transaction>
  <transaction_key>390.l.1000.tr.2</transaction_key>
  <transaction_id>2</transaction_id>
  <type>add/drop</type>
  <status>successful</status>
  <timestamp>1564988958</timestamp>
  <players count="2">
   <player>
    <player_key>390.p.6762</player_key>
    <player_id>6762</player_id>
    <name>
     <full>Larry Fitzgerald</full>
     <first>Larry</first>
     <last>Fitzgerald</last>
     <ascii_first>Larry</ascii_first>
     <ascii_last>Fitzgerald</ascii_last>
    </name>
    <editorial_team_abbr>Ari</editorial_team_abbr>
    <display_position>WR</display_position>
    <position_type>O</position_type>
    <transaction_data>
     <type>add</type>
     <source_type>waivers</source_type>
     <destination_type>team</destination_type>
     <destination_team_key>390.l.1000.t.1</destination_team_key>
     <destination_team_name>marky's Bold Team</destination_team_name>
    </transaction_data>
   </player>
   <player>
    <player_key>390.p.8447</player_key>
    <player_id>8447</player_id>
    <name>
     <full>Mason Crosby</full>
     <first>Mason</first>
     <last>Crosby</last>
     <ascii_first>Mason</ascii_first>
     <ascii_last>Crosby</ascii_last>
    </name>
    <editorial_team_abbr>GB</editorial_team_abbr>
    <display_position>K</display_position>
    <position_type>K</position_type>
    <transaction_data>
     <type>drop</type>
     <source_type>team</source_type>
     <source_team_key>390.l.1000.t.1</source_team_key>
     <source_team_name>marky's Bold Team</source_team_name>
     <destination_type>waivers</destination_type>
    </transaction_data>
   </player>
  </players>
 </transaction>
</fantasy_content>
```

### PUT

Using PUT, you may edit the waiver priority or FAAB bid for any of your pending waiver claims. You can also accept or reject trades that have been proposed to you, and allow or vote against trades if your league settings allow it. The URL to PUT to a Transaction resource is:

```

https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

You can only PUT to Transactions of the types waiver or pending\_trade.

#### Editing Waivers

Once you have the transaction\_key for a waiver claim, which you can get by asking the transactions collection for all waivers for a certain team, you can edit the waiver priority or FAAB bid. The input XML should look like:

```

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.w.c.2_6093</transaction_key>
    <type>waiver</type>
    <waiver_priority>1</waiver_priority>
    <faab_bid>20</faab_bid>
  </transaction>
</fantasy_content>
```

#### Accepting Trades

Once you have the transaction\_key for a pending trade that has been proposed to you, which you can get by asking the transactions collection for all pending trades for your team, you can choose to accept it. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>accept</action>
    <trade_note>Dude, that is a totally fair trade.</trade_note>
  </transaction>
</fantasy_content>
```

#### Rejecting Trades

To reject a pending trade proposed to you, the input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>reject</action>
    <trade_note>No way!</trade_note>
  </transaction>
</fantasy_content>
```

#### Allowing/Disallowing Trades

If there are accepted trades in your league waiting to be processed, which you can get by asking the transactions collection for all pending trades for your team, and you’re the commissioner of a league that has the commissioner approve trades, you can choose to allow or disallow the trade. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>allow</action>
  </transaction>
</fantasy_content>
```

Or

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>disallow</action>
  </transaction>
</fantasy_content>
```

#### Voting Against Trades

If there are accepted trades in your league waiting to be processed, which you can get by asking the transactions collection for all pending trades for your team, and you’re a manager in a league that allows managers to vote against trades, you can choose to vote against the trade. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>vote_against</action>
    <voter_team_key>461.l.1000.t.2</voter_team_key>
  </transaction>
</fantasy_content>
```

### DELETE

Using DELETE, you may cancel any pending waiver claim or proposed trade. The URL to DELETE a Transaction resource is:

```

https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

You can only DELETE transactions of the types waiver or pending\_trade if the pending trade has not yet been accepted.

## Transactions Collection

With the Transactions API, you can obtain information via GET from a collection of transactions simultaneously. The transactions collection is qualified in the URI by a particular league. Each element beneath the Transactions collection will be a [Transaction resource](#transaction-resource)

You can also POST to the API to perform operations like adding and/or dropping players to/from a team and proposing trades.

- **HTTP Operations Supported**

- GET

- POST

- Any [sub-resource](#sub-resources-7) valid for a transaction is a valid sub-resource under the transactions collection.

- Any sub-resource for a collection of transactions is extracted using a URI like the following:

- /transactions/{sub\_resource}

- /transactions;transaction\_keys={transaction\_key1},{transaction\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from transactions in the same URI using the following formatting:

- /transactions;out={sub\_resource\_1},{sub\_resource\_2}

- /transactions;transaction\_keys={transaction\_key1},{transaction\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/transactions | Fetch all completed transactions within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions) |
| /fantasy/v2/transactions;transaction\_keys= [{transaction\_key1}](#transaction-key-format),{transaction\_key2} | Fetch specific transactions {transaction\_key1} and {transaction\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/transactions;transaction\_keys=461.l.1000.tr.26,461.l.1000.tr.27](https://fantasysports.yahooapis.com/fantasy/v2/transactions;transaction_keys=461.l.1000.tr.26,461.l.1000.tr.27) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/transactions | Fetch all completed transactions of the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.1001/transactions](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.1001/transactions) |
| /fantasy/v2/league/{league\_key}/transactions;types=waiver,pending\_trade;team\_key= [{team\_key}](#team-resource) | Fetch all pending trades and waivers relevant to the particular team. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions;types=waiver,pending\_trade;team\_key=461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions;types=waiver,pending_trade;team_key=461.l.1000.t.1) |

### Filters

The transactions collection can have filters such as the following to obtain a subset of a transactions collection that satisfy the filtering condition. These filters can be combined to obtain a more restricted list of transactions.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| type | add,drop,commish,trade | /transactions;type=add |
| types | Any valid types | /transactions;types=add,trade |
| team\_key | A [team\_key](#team-resource) within the league | /transactions;team\_key=461.l.1000.t.1 |
| type with team\_key | waiver,pending\_trade | You can only use these options when also providing the team\_key, ie /transactions;team\_key=461.l.1000.t.1;type=waiver |
| count | Number of items returned. Any integer greater than 0 | /transactions;count=5 |

### POST

Using POST, players can be added and/or dropped from a team, or trades can be proposed. The URI for POSTing to transactions collection is:

[https://fantasysports.yahooapis.com/fantasy/v2/league/{league\_key}/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/%7Bleague_key%7D/transactions)

#### Adding/Dropping Players

The input XML format for a POST request to the transactions API for adding a player is:

```xml

<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>{team_key}</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

The input XML format for a POST request to the transactions API for dropping a player is:

```xml

<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>{team_key}</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

The input XML format for a POST request to the transactions API for replacing one player with another player in a team is:

```xml

<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>{player_key}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>{team_key}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>{player_key}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>{team_key}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

You may also add players that are currently on waivers – the players will not be immediately added to your team, but rather, you will be returned back a waiver claim that will be processed at some point in the future. Various league rules will control in which conditions you will actually receive the player, in the case that multiple teams have placed waiver claims.

If you are placing a waiver claim in a league that uses FAAB, you may add that to the XML that you POST:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <faab_bid>25</faab_bid>
    <players>
      <player>
        <player_key>461.p.5484</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>461.l.1000.t.6</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>461.p.6327</player_key>
        <transaction_data>
          <type>drop</type>
          <destination_team_key>461.l.1000.t.6</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once you have a waiver claim transaction, you may also [edit the waiver priority or FAAB bid](#editing-waivers), or [cancel](#delete) the waiver entirely.

#### Proposing Trades

The input XML format for a POST request to the transactions API for proposing a trade is:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>pending_trade</type>
    <trader_team_key>461.l.1000.t.11</trader_team_key>
    <tradee_team_key>461.l.1000.t.4</tradee_team_key>
    <trade_note>Yo yo yo yo yo!!!</trade_note>
    <players>
      <player>
        <player_key>461.p.4130</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>461.l.1000.t.11</source_team_key>
          <destination_team_key>461.l.1000.t.4</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>461.p.2415</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>461.l.1000.t.4</source_team_key>
          <destination_team_key>461.l.1000.t.11</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once you have a pending trade transaction, you may [accept](#accepting-trades), [reject](#rejecting-trades), [allow/disallow](#allowing/disallowing-trades), or [vote against](#voting-against-trades) the trade (depending on which role you have in the league). You may also [cancel](#delete) the trade.

# User APIs

## User Resource

With the User API, you can retrieve fantasy information for a particular Yahoo! user. Most usefully, you can see which games a user is playing, and which leagues they belong to and teams that they own within those games. Because you can currently only view user information for the logged in user, you would generally want to use the [Users collection](#users-collection), passing along the use\_login flag, instead of trying to request a User resource directly from the URI.

- **HTTP Operations Supported:** GET

- **URIs**

- It is generally recommended that you instead use the [Users collection](#users-collection), passing along the use\_login flag.

### Sub-resources

_Default sub-resource:_ N/A

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| [games](#games-collection) | Fetch the [Games](#games-collection) in which the user has played. Additionally accepts flags is\_availableto only return available games. | /fantasy/v2/ [users](#users-collection);use\_login=1/games | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games) |
| [games](#games-collection)/ [leagues](#leagues-collection) | Fetch leagues that the user belongs to in one or more games. The leagues will be scoped to the user. This will throw an error if any of the specified games do not support league sub-resources. | /fantasy/v2/ [users](#users-collection);use\_login=1/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2}/leagues | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=461/leagues](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=461/leagues) |
| [games](#games-collection)/ [teams](#teams-collection) | Fetch teams owned by the user in one or more games. The teams will be scoped to the user. This will throw an error if any of the specified games do not support team sub-resources. | /fantasy/v2/ [users](#users-collection);use\_login=1/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2}/teams | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=461/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=461/teams) |

## Users Collection

With the Users API, you can obtain information from a collection of users simultaneously. Each element beneath the Users collection will be a [User resource](#user-resource)

**HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-8) valid for a user is a valid sub-resource under the users collection.

- Any sub-resource for a collection of users is extracted using a URI like the following: /users;use\_login=1/{sub\_resource}

- Multiple sub-resources can be extracted from users in the same URI using the following formatting:

- /users;use\_login=1;out={sub\_resource\_1},{sub\_resource\_2}

- /users;field={field\_name1},{field\_name2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/users;use\_login=1 | Fetch user information of the logged-in user. | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1) |

# Getting Started

# Accessing the APIs

## OAuth 2.0

To use the Fantasy Sports APIs, you first need to familiarize yourself with OAuth 2.0. OAuth 2.0 is the authentication mechanism that allows users to grant permission to make requests on their behalf. Many other Yahoo! services use OAuth 2.0, and thus all of the underlying details are explained in exhaustive detail in our [primary OAuth 2.0 documentation](https://developer.yahoo.com/oauth2/guide/). Of particular interest is the [OAuth 2.0 Authorization Flow](https://developer.yahoo.com/oauth2/guide/flows_authcode/), which explains where each request is made and where the user is involved.

However, constructing OAuth 2.0 flows from scratch is complicated and easy to get wrong. It’s often easier to use existing libraries, which are available for most languages on the [OAuth.net Code page](https://oauth.net/code/).

The Yahoo Fantasy Sports API requires Oauth 2.0, and all references to Oauth in this documentation refer to this version.

## Register Your Application

To work with OAuth and Yahoo! services, you also must register your application with the Yahoo! Developer Network. When you register your application, you define a scope of Yahoo! services that your application will need access to, as well as the basic descriptive information that will be presented to users of your application when they’re asked to grant you permissions. You will be given a consumer key and secret value that will need to be fed into OAuth requests that you generate. Keep these values secret! Anyone with access to them could masquerade as your application.

To create a new OAuth application to use with the Fantasy Sports APIs, follow the [New API Key flow](https://developer.yahoo.com/apps/create/) on the Yahoo Developer Network (YDN). Be sure to specify that you need access to private user data, and select either Read or Read/Write access for Fantasy Sports. If you don’t have a Yahoo account, you will need to register a new one.

[Go here](https://github.com/smock514/yahoo-fantasy-api-demo/wiki/OAuth2-Flow) to learn more about the user flow through OAuth and how to register your app.

## API Endpoints

The Fantasy Sports APIs are hosted at the following URL: [https://fantasysports.yahooapis.com/fantasy/v2](https://fantasysports.yahooapis.com/fantasy/v2)

## Sample Code

Examples given in PHP.

- [Basic OAuth flow](https://gist.github.com/VerizonMediaOwner/c739411169d6f92ceec36ec33a6ef5b8)

- [Full OAuth flow](https://gist.github.com/VerizonMediaOwner/21926160fbd951854f6cd624197870eb)

- [PUTs and POSTs](https://gist.github.com/VerizonMediaOwner/61df288e0c53e709b247562a4f6253da)

- [Public requests](https://gist.github.com/VerizonMediaOwner/279a90382d817bed1fc66e4cfe55788b)

# API Concepts

The primary building blocks of the Fantasy Sports APIs are resources and collections. Resources typically describe chunks of data that can be identified by a unique key, while collections are simply wrappers that contain similar resources. So, for instance, if we need to retrieve data about a single league, we might ask for a [League resource](#league-resource) and provide a single [league key](#league-resource). However, if we wanted data across several leagues, we would ask for a [Leagues collection](#leagues-collection) and provide multiple league keys or a set of filter parameters.

## Resources

Resources represent the primary entities within our Fantasy games, collecting together the important data fields related to those entities. It is usually possible to reference any particular resource using a globally unique resource key. The resource keys are usually namespaced to represent nesting, using specific delimiters to identify the resource type. Here are some examples of resource key formats:

- **Game key**: <game\_id> - Example: 461

- **League key**: <game\_id>.l.<league\_id> - Example: 461.l.1000

- **Team key**: <game\_id>.l.<league\_id>.t.<team\_id> - Example: 461.l.1000.t.1

- **Player key**: <game\_id>.p.<player\_id> - Example: 461.p.30121

The resource key formats for particular resources are described in more detail in later sections of this document.

- Here is a typical format for requesting a resource: [/fantasy/v2/{resource}/{resource\_key}](https://fantasysports.yahooapis.com/fantasy/v2/%7Bresource%7D/%7Bresource_key%7D)

- Here is the typical format for requesting specific resources within a collection: [/fantasy/v2/{collection};{resource}\_keys={resource\_key1},{resource\_key2}](https://fantasysports.yahooapis.com/fantasy/v2/%7Bcollection%7D;%7Bresource%7D_keys=%7Bresource_key1%7D,%7Bresource_key2%7D)

## Collections

Collections are simply groups of resources. If you care about particular resources within a collection, you can apply filters to the collection to narrow the results. The most common type of filtering is by key. For instance, if you’d like to see two particular players, you could ask for them directly: /fantasy/v2/players;player\_keys={player\_key1},{player\_key2}

- Some collections support more complex filters. Within a game, for example, you might ask for only the players that play a certain position: /fantasy/v2/game/nfl/players;position=QB;count=10

- You could also request only the particular user who is currently logged in: /fantasy/v2/users;use\_login=1

## Sub-Resources

Resources will typically define a list of valid sub-resources. These are resources and collections that can live within the scope of the parent resource. For instance, a fantasy league in the Football draft and trade games can contain up to 20 fantasy teams; therefore, the [League resource](#league-resource) can have a [Teams collection](#teams-collection) as a sub-resource. Generally, if it is possible for multiple of a single sub-resource to be contained within another resource, then a collection of the sub-resources will be returned; otherwise a single sub-resource will be returned.

The scope of a sub-resource is typically defined by the parent resource; for instance, when viewing a [Players collection](#players-collection) as a sub-resource of a particular [League](#league-resource), you would expect to only see Players that are eligible within that League. Further filters could then be applied to this already narrowed list.

Having sub-resources allows you to chain together resources and collections to provide more data, and the URI you request directly specifies how the chaining works. For instance, if you wanted to take a particular logged in user, see which games they’ve played, and then get the league information within those games, you might construct a request like:

```

/fantasy/v2/users;use_login=1/games/leagues
```

This would present you with a [Users collection](#users-collection), a single [User resource](#user-resource) for the logged in user, a [Games collection](#games-collection) for that user, potentially multiple [Game resources](#game-resource) for each game the user is playing, a [Leagues collection](#leagues-collection) beneath each Game resource, and potentially multiple [League resources](#league-resource) for each league the user belongs to in that game.

When you specify a sub-resource beneath a collection, you’re really saying that you want to see that sub-resource appended beneath each resource within the collection. Therefore, the sub-resources available to a collection will be equivalent to the sub-resources available to the corresponding resource.

If you ever need to include other sub-resources outside of your main resource chain, you can use the out parameter, which will let you specify one level of extra sub-resources to pull in. At the moment, you cannot pass any parameters along to these out sub-resources, aside from any data that might get passed by default. This typically means that you can’t chain other resources off of sub-resources specified by the out parameter.

As an example, if you wanted to view a league’s settings along with two teams in particular in the league, you might construct a URI like:

```

/fantasy/v2/league/{league_key};out=settings/teams;team_keys={team_key1},{team_key2}
```

## Parameters

Parameters can be provided to resources and collections as semicolon-delimited key-value pairs. These should be placed after the resource or collection name in the URI; in the case of entry-point resources like [Game](#game-resource) s, [League](#league-resource) s, [Team](#team-resource) s, and [Player](#player-resource) s, the parameters belong after the resource\_key.

```

/fantasy/v2/{resource}/{resource_key};{key}={value};{key}={value}/{collection};{key}={value};{key}={value}/{collection};{key}={value}/{resource};{key}={value}
```

Resource keys, out parameters, and other filters are just specific types of parameters that can be applied to various resources or collections.

# API Reference

# Game APIs

## Game Resource

- HTTP Operations Supported: GET

- URIs:

- [https://fantasysports.yahooapis.com/fantasy/v2/game/{game\_key}](https://fantasysports.yahooapis.com/fantasy/v2/game/%7Bgame_key%7D)

- Extract a sub-resource under a game: /fantasy/v2/game/{game\_key}/{sub\_resource}

- Extract multiple sub-resources from game in the same URI:

- /fantasy/v2/game/{game\_key};out={sub\_resource\_1},{sub\_resource\_2}

- Game key format: {game\_code} or {game\_id} _Example:_ nfl or 461

- Note: If you specify a game\_code as the game\_key, we’ll translate that to the corresponding game\_id upon parsing the URI. Therefore, any game\_codes will be converted to game\_ids in any keys returned by the Fantasy Sports APIs in the API response.

### Description

Using the Game resource, you can obtain the fantasy game related information, like the fantasy game name, game code, and season.

To refer to a Game resource, you’ll need to provide a game\_key, which will either be a game\_id or game\_code. The game\_id is a unique ID identifying a given fantasy game for a given season. For instance, the game\_id for the NFL draft and trade fantasy game for the 2025 season is 461, while the game\_id for the 2020 season is 399. A game\_code generally identifies a game, independent of season, and, when used as a game\_key, will typically return the current season of that game. For instance, the game\_code for the NFL game is nfl, and the game\_code for the MLB game is mlb; using nfl as your game\_key during the 2020 season would be the same as providing the game\_id for the 2020 season of the NFL game (399). Once the next season is available, providing the game\_code would return the next season of that game instead (with a new game\_id). Thus, if you always want the current season of a game, the game\_code can be used as a game\_key.

It may not be immediately obvious how to determine the game\_id for any particular season of a specific game\_code. Luckily, we provide a number of filters on our Games collection that can help narrow down to the specific game that you are interested in.

Specifically, you can determine the game\_id for any particular season with this API call that retrieves a specific season of a game:

```

https://fantasysports.yahooapis.com/fantasy/v2/games;game_codes=<game_code>;seasons=<season>
```

And you can see a listing of all seasons of a particular game with this API call that retrieves all seasons of a specific game:

```

https://fantasysports.yahooapis.com/fantasy/v2/games;game_codes=<game_code>
```

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| metadata | Includes game key, code, name, url, type and season. | /fantasy/v2/game/ [{game\_key}](#game-resource)/metadata | The 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461](https://fantasysports.yahooapis.com/fantasy/v2/game/461) |
| [leagues](#leagues-collection) | Fetch specified leagues under a game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/leagues;league\_keys= [{league\_key1}](#league-resource),{league\_key2} | A publicly viewable league within the 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461/leagues;league\_keys=461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/game/461/leagues;league_keys=461.l.1000) |
| [players](#players-collection) | Fetch specified players under a game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/players;player\_keys= [{player\_key1}](#player-resource),{player\_key2} | Christian McCaffrey’s information from the 2025 Football game: [https://fantasysports.yahooapis.com/fantasy/v2/game/461/players;player\_keys=461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/game/461/players;player_keys=461.p.30121) |
| dates | Key dates relevant to the game | /fantasy/v2/game/ [{game\_key}](#game-resource)/dates | NFL key dates [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/dates](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/dates) |
| game\_weeks | Start and end date information for each week in the game | /fantasy/v2/game/ [{game\_key}](#game-resource)/game\_weeks | NFL game weeks [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/game\_weeks](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/game_weeks) |
| stat\_categories | Detailed description of all available stat categories for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/stat\_categories | NFL stat categories [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/stat\_categories](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/stat_categories) |
| position\_types | Detailed description of all player position types for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/position\_types | NFL position types [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/position\_types](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/position_types) |
| roster\_positions | Detailed description of all roster positions for the game. | /fantasy/v2/game/ [{game\_key}](#game-resource)/roster\_positions | NFL roster positions [https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/roster\_positions](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/roster_positions) |

### Sample Responses

[https://fantasysports.yahooapis.com/fantasy/v2/game/nfl](https://fantasysports.yahooapis.com/fantasy/v2/game/nfl)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/game/nfl" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" time="30.575037002563ms" copyright="Data provided by Yahoo! and STATS, LLC" xmlns="https://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <game>
  <game_key>399</game_key>
  <game_id>399</game_id>
  <name>Football</name>
  <code>nfl</code>
  <type>full</type>
  <url>https://football.fantasysports.yahoo.com/f1</url>
  <season>2020</season>
  <is_registration_over>0</is_registration_over>
  <is_game_over>0</is_game_over>
  <is_offseason>0</is_offseason>
 </game>
</fantasy_content>
```

## Games Collection

With the Games API, you can obtain information from a collection of games simultaneously. Each element beneath the Games collection will be a [Game resource](#game-resource)

**HTTP Operations Supported: GET**

- Any [sub-resource](#sub-resources-1) valid for a game is a valid sub-resource under the games collection.

- Any sub-resource for a collection of games is extracted using a URI like the following:

- /games/{sub\_resource}

- /games;game\_keys={game\_key1},{game\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from games in the same URI using the following formatting:

- /games;out={sub\_resource\_1},{sub\_resource\_2}

- /games;game\_keys={game\_key1},{game\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Examples |
| --- | --- | --- |
| /fantasy/v2/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2} | Fetch specific games {game\_key1} and {game\_key2} | nfl and mlb games: [https://fantasysports.yahooapis.com/fantasy/v2/games;game\_keys=nfl,mlb](https://fantasysports.yahooapis.com/fantasy/v2/games;game_keys=nfl,mlb) |
| /fantasy/v2/users;use\_login=1/games | Fetch all games for the logged in user | all games for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games) |
| /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2} | Fetch specific games {game\_key1} and {game\_key2} that the logged in user owns teams in. | nfl and mlb games for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=nfl,mlb](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl,mlb) |

### Filters

The games collection can have filters such as the following to obtain a subset of a games collection that satisfy the filtering condition. These filters can be combined to obtain a more restricted list of games. For instance, if you wanted only the 2020 version of the nfl game, you might filter by seasons=2020 and game\_codes=nfl.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| is\_available | 1 to only show games currently in season | /games;is\_available=1 |
| game\_types | full | pickem-team |
| game\_codes | Any valid game codes | /games;game\_codes=nfl,mlb |
| seasons | Any valid seasons | /games;seasons=2024,2025 |

### Sub-resources

In addition to the [sub-resources](#sub-resources-1) valid for a game resource, the following are valid sub-resources for a games collection.

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| [teams](#teams-collection) | Fetch teams owned by a user for one or more games. | /fantasy/v2/users;use\_login=1/games/teams OR /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2}/teams | all teams for user: [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games/teams) |

# League APIs

## League Resource

When users join a Fantasy Football, Baseball, Basketball, or Hockey draft and trade game, they are organized into leagues with a limited number of friends or other Yahoo! users, with each user managing a [Team](#team-resource). With the League API, you can obtain the league related information, like the league name, the number of teams, the draft status, et cetera. Leagues only exist in the context of a particular [Game](#game-resource), although you can request a League resource as the base of your URI by using the global league\_key. A particular user can only retrieve data for private leagues of which they are a member, or for public leagues.

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/league/{league\_key}](https://fantasysports.yahooapis.com/fantasy/v2/league/%7Bleague_key%7D)

- Extract a sub-resource under a league: /fantasy/v2/league/{league\_key}/{sub\_resource}

- Extract multiple sub-resources from league in the same URI: /fantasy/v2/league/{league\_key};out={sub\_resource\_1},{sub\_resource\_2}

- **League key format:** {game\_key}.l.{league\_id} - Example: nfl.l.1000 or 461.l.1000

- **Note:** The separator between the game\_key and league\_id is a lower case L (not the number 1).

### Sub-resources

_Default sub-resource_: metadata

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes league key, id, name, url, draft status, number of teams, and current week information. | /fantasy/v2/league/ [{league\_key}](#league-resource)/metadata | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000) |
| settings | League settings. For instance, draft type, scoring type, roster positions, stat categories and modifiers, divisions. | /fantasy/v2/league/ [{league\_key}](#league-resource)/settings | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings) |
| standings | Ranking of teams within the league. Accepts [Teams](#teams-collection) as a sub-resource, and includes team\_standingsdata by default beneath the teams | /fantasy/v2/league/ [{league\_key}](#league-resource)/standings | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings) |
| scoreboard | League scoreboard. Accepts Matchups as a sub-resource, which in turn accept [Teams](#teams-collection) as a sub-resource. Includes team\_stats data by default. | _Scoreboard for current week:_ /fantasy/v2/league/ [{league\_key}](#league-resource)/scoreboard _Scoreboard for a particular week:_ /fantasy/v2/league/ [{league\_key}](#league-resource)/scoreboard;week={week} | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard;week=2](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard;week=2) |
| [teams](#teams-collection) | All teams in the league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/teams | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams) |
| [players](#players-collection) | The league's eligible players. | /fantasy/v2/league/ [{league\_key}](#league-resource)/players | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players) |
| draftresults | Draft results for all teams in the league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/draftresults | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/draftresults](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/draftresults) |
| [transactions](#transactions-collection) | League transactions -- adds, drops, and trades. | /fantasy/v2/league/ [{league\_key}](#league-resource)/transactions | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions) |

### Sample Responses

- League Resource: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000)

```

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasyspots.yahooapis.com/fantasy/v2/league/390.l.1000" time="19.485950469971ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
 </league>
</fantasy_content>
```

- League Settings: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/settings)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/settings" time="28.674125671387ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <settings>
   <draft_type>live</draft_type>
   <is_auction_draft>0</is_auction_draft>
   <scoring_type>head</scoring_type>
   <uses_playoff>1</uses_playoff>
   <has_playoff_consolation_games>1</has_playoff_consolation_games>
   <playoff_start_week>15</playoff_start_week>
   <uses_playoff_reseeding>1</uses_playoff_reseeding>
   <uses_lock_eliminated_teams>1</uses_lock_eliminated_teams>
   <num_playoff_teams>4</num_playoff_teams>
   <num_playoff_consolation_teams>4</num_playoff_consolation_teams>
   <has_multiweek_championship>0</has_multiweek_championship>
   <waiver_type>R</waiver_type>
   <waiver_rule>gametime</waiver_rule>
   <uses_faab>0</uses_faab>
   <draft_time>1564781400</draft_time>
   <draft_pick_time>60</draft_pick_time>
   <post_draft_players>W</post_draft_players>
   <max_teams>10</max_teams>
   <waiver_time>2</waiver_time>
   <trade_end_date>2019-11-09</trade_end_date>
   <trade_ratify_type>vote</trade_ratify_type>
   <trade_reject_time>2</trade_reject_time>
   <player_pool>ALL</player_pool>
   <cant_cut_list>yahoo</cant_cut_list>
   <sendbird_channel_url/>
   <roster_positions>
    <roster_position>
     <position>QB</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>WR</position>
     <position_type>O</position_type>
     <count>2</count>
    </roster_position>
    <roster_position>
     <position>RB</position>
     <position_type>O</position_type>
     <count>2</count>
    </roster_position>
    <roster_position>
     <position>TE</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>W/R/T</position>
     <position_type>O</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>K</position>
     <position_type>K</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>DEF</position>
     <position_type>DT</position_type>
     <count>1</count>
    </roster_position>
    <roster_position>
     <position>BN</position>
     <count>6</count>
    </roster_position>
    <roster_position>
     <position>IR</position>
     <count>1</count>
    </roster_position>
   </roster_positions>
   <stat_categories>
    <stats>
     <stat>
      <stat_id>4</stat_id>
      <enabled>1</enabled>
      <name>Passing Yards</name>
      <display_name>Pass Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>5</stat_id>
      <enabled>1</enabled>
      <name>Passing Touchdowns</name>
      <display_name>Pass TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>6</stat_id>
      <enabled>1</enabled>
      <name>Interceptions</name>
      <display_name>Int</display_name>
      <sort_order>0</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>8</stat_id>
      <enabled>1</enabled>
      <name>Rushing Attempts</name>
      <display_name>Rush Att</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>9</stat_id>
      <enabled>1</enabled>
      <name>Rushing Yards</name>
      <display_name>Rush Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>10</stat_id>
      <enabled>1</enabled>
      <name>Rushing Touchdowns</name>
      <display_name>Rush TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>78</stat_id>
      <enabled>1</enabled>
      <name>Targets</name>
      <display_name>Targets</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>11</stat_id>
      <enabled>1</enabled>
      <name>Receptions</name>
      <display_name>Rec</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>12</stat_id>
      <enabled>1</enabled>
      <name>Receiving Yards</name>
      <display_name>Rec Yds</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>13</stat_id>
      <enabled>1</enabled>
      <name>Receiving Touchdowns</name>
      <display_name>Rec TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>15</stat_id>
      <enabled>1</enabled>
      <name>Return Touchdowns</name>
      <display_name>Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>16</stat_id>
      <enabled>1</enabled>
      <name>2-Point Conversions</name>
      <display_name>2-PT</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>18</stat_id>
      <enabled>1</enabled>
      <name>Fumbles Lost</name>
      <display_name>Fum Lost</display_name>
      <sort_order>0</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>57</stat_id>
      <enabled>1</enabled>
      <name>Offensive Fumble Return TD</name>
      <display_name>Fum Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>O</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>O</position_type>
       </stat_position_type>
      </stat_position_types>
      <is_excluded_from_display>1</is_excluded_from_display>
     </stat>
     <stat>
      <stat_id>19</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 0-19 Yards</name>
      <display_name>FG 0-19</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>20</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 20-29 Yards</name>
      <display_name>FG 20-29</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>21</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 30-39 Yards</name>
      <display_name>FG 30-39</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>22</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 40-49 Yards</name>
      <display_name>FG 40-49</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>23</stat_id>
      <enabled>1</enabled>
      <name>Field Goals 50+ Yards</name>
      <display_name>FG 50+</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>29</stat_id>
      <enabled>1</enabled>
      <name>Point After Attempt Made</name>
      <display_name>PAT Made</display_name>
      <sort_order>1</sort_order>
      <position_type>K</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>K</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>31</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed</name>
      <display_name>Pts Allow</display_name>
      <sort_order>0</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
        <is_only_display_stat>1</is_only_display_stat>
       </stat_position_type>
      </stat_position_types>
      <is_only_display_stat>1</is_only_display_stat>
     </stat>
     <stat>
      <stat_id>32</stat_id>
      <enabled>1</enabled>
      <name>Sack</name>
      <display_name>Sack</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>33</stat_id>
      <enabled>1</enabled>
      <name>Interception</name>
      <display_name>Int</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>34</stat_id>
      <enabled>1</enabled>
      <name>Fumble Recovery</name>
      <display_name>Fum Rec</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>35</stat_id>
      <enabled>1</enabled>
      <name>Touchdown</name>
      <display_name>TD</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>36</stat_id>
      <enabled>1</enabled>
      <name>Safety</name>
      <display_name>Safe</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>37</stat_id>
      <enabled>1</enabled>
      <name>Block Kick</name>
      <display_name>Blk Kick</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>49</stat_id>
      <enabled>1</enabled>
      <name>Kickoff and Punt Return Touchdowns</name>
      <display_name>Ret TD</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>82</stat_id>
      <enabled>1</enabled>
      <name>Extra Point Returned</name>
      <display_name>XPR</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
      <is_excluded_from_display>1</is_excluded_from_display>
     </stat>
     <stat>
      <stat_id>50</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 0 points</name>
      <display_name>Pts Allow 0</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>51</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 1-6 points</name>
      <display_name>Pts Allow 1-6</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>52</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 7-13 points</name>
      <display_name>Pts Allow 7-13</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>53</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 14-20 points</name>
      <display_name>Pts Allow 14-20</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>54</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 21-27 points</name>
      <display_name>Pts Allow 21-27</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>55</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 28-34 points</name>
      <display_name>Pts Allow 28-34</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
     <stat>
      <stat_id>56</stat_id>
      <enabled>1</enabled>
      <name>Points Allowed 35+ points</name>
      <display_name>Pts Allow 35+</display_name>
      <sort_order>1</sort_order>
      <position_type>DT</position_type>
      <stat_position_types>
       <stat_position_type>
        <position_type>DT</position_type>
       </stat_position_type>
      </stat_position_types>
     </stat>
    </stats>
   </stat_categories>
   <stat_modifiers>
    <stats>
     <stat>
      <stat_id>4</stat_id>
      <value>0.04</value>
     </stat>
     <stat>
      <stat_id>5</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>6</stat_id>
      <value>-1</value>
     </stat>
     <stat>
      <stat_id>9</stat_id>
      <value>0.1</value>
     </stat>
     <stat>
      <stat_id>10</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>11</stat_id>
      <value>0.5</value>
     </stat>
     <stat>
      <stat_id>12</stat_id>
      <value>0.1</value>
     </stat>
     <stat>
      <stat_id>13</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>15</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>16</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>18</stat_id>
      <value>-2</value>
     </stat>
     <stat>
      <stat_id>57</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>19</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>20</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>21</stat_id>
      <value>3</value>
     </stat>
     <stat>
      <stat_id>22</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>23</stat_id>
      <value>5</value>
     </stat>
     <stat>
      <stat_id>29</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>32</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>33</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>34</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>35</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>36</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>37</stat_id>
      <value>2</value>
     </stat>
     <stat>
      <stat_id>49</stat_id>
      <value>6</value>
     </stat>
     <stat>
      <stat_id>50</stat_id>
      <value>10</value>
     </stat>
     <stat>
      <stat_id>51</stat_id>
      <value>7</value>
     </stat>
     <stat>
      <stat_id>52</stat_id>
      <value>4</value>
     </stat>
     <stat>
      <stat_id>53</stat_id>
      <value>1</value>
     </stat>
     <stat>
      <stat_id>54</stat_id>
      <value>0</value>
     </stat>
     <stat>
      <stat_id>55</stat_id>
      <value>-1</value>
     </stat>
     <stat>
      <stat_id>56</stat_id>
      <value>-4</value>
     </stat>
     <stat>
      <stat_id>82</stat_id>
      <value>2</value>
     </stat>
    </stats>
   </stat_modifiers>
   <pickem_enabled>1</pickem_enabled>
   <uses_fractional_points>1</uses_fractional_points>
   <uses_negative_points>1</uses_negative_points>
  </settings>
 </league>
</fantasy_content>
```

- League Standings: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/standings)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/standings" time="143.89801025391ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <standings>
   <teams count="10">
    <team>
     <team_key>390.l.1000.t.10</team_key>
     <team_id>10</team_id>
     <name>Pierre's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/10</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_8_p.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>7</waiver_priority>
     <number_of_moves>14</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>3</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C+</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/10/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>10</manager_id>
       <nickname>--hidden--</nickname>
       <guid>5JCHKZ3FPBB4VK4BXQMZ5SSM2A</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1583.16</total>
     </team_points>
     <team_standings>
      <rank>1</rank>
      <playoff_seed>4</playoff_seed>
      <outcome_totals>
       <wins>8</wins>
       <losses>6</losses>
       <ties>0</ties>
       <percentage>.571</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>2</value>
      </streak>
      <points_for>1583.16</points_for>
      <points_against>1447.26</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.7</team_key>
     <team_id>7</team_id>
     <name>ray's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/7</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_r.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>10</waiver_priority>
     <number_of_moves>82</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>5</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/7/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>7</manager_id>
       <nickname>--hidden--</nickname>
       <guid>PVJLKB47ITJ6NU4ZRWZAUORFDY</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1594.88</total>
     </team_points>
     <team_standings>
      <rank>2</rank>
      <playoff_seed>3</playoff_seed>
      <outcome_totals>
       <wins>9</wins>
       <losses>5</losses>
       <ties>0</ties>
       <percentage>.643</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>1</value>
      </streak>
      <points_for>1594.88</points_for>
      <points_against>1454.78</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.1</team_key>
     <team_id>1</team_id>
     <name>marky's Bold Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>6</waiver_priority>
     <number_of_moves>23</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>8</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>1</manager_id>
       <nickname>--hidden--</nickname>
       <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1567.82</total>
     </team_points>
     <team_standings>
      <rank>3</rank>
      <playoff_seed>2</playoff_seed>
      <outcome_totals>
       <wins>10</wins>
       <losses>4</losses>
       <ties>0</ties>
       <percentage>.714</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>7</value>
      </streak>
      <points_for>1567.82</points_for>
      <points_against>1166.08</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.8</team_key>
     <team_id>8</team_id>
     <name>Mayfield of dreams</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/8</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/24974190479_e917a6ed91.jpg</url>
      </team_logo>
     </team_logos>
     <waiver_priority>5</waiver_priority>
     <number_of_moves>9</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <clinched_playoffs>1</clinched_playoffs>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>1</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C+</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/8/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>8</manager_id>
       <nickname>--hidden--</nickname>
       <guid>RIDRSRN5WO4HD2KSBJ3FHZQHRQ</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1646.12</total>
     </team_points>
     <team_standings>
      <rank>4</rank>
      <playoff_seed>1</playoff_seed>
      <outcome_totals>
       <wins>10</wins>
       <losses>4</losses>
       <ties>0</ties>
       <percentage>.714</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>8</value>
      </streak>
      <points_for>1646.12</points_for>
      <points_against>1415.48</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.9</team_key>
     <team_id>9</team_id>
     <name>CHRISTOPHER's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/9</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_c.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>8</waiver_priority>
     <number_of_moves>22</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>2</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/9/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>9</manager_id>
       <nickname>--hidden--</nickname>
       <guid>I26YN6SRCGET2HKBDL6HC7CODC</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1388.46</total>
     </team_points>
     <team_standings>
      <rank>5</rank>
      <playoff_seed>6</playoff_seed>
      <outcome_totals>
       <wins>7</wins>
       <losses>7</losses>
       <ties>0</ties>
       <percentage>.500</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>1</value>
      </streak>
      <points_for>1388.46</points_for>
      <points_against>1415.5</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.6</team_key>
     <team_id>6</team_id>
     <name>Chike's Nice Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>3</waiver_priority>
     <number_of_moves>3</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>10</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>6</manager_id>
       <nickname>--hidden--</nickname>
       <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1344.46</total>
     </team_points>
     <team_standings>
      <rank>6</rank>
      <playoff_seed>8</playoff_seed>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>5</value>
      </streak>
      <points_for>1344.46</points_for>
      <points_against>1449.58</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.2</team_key>
     <team_id>2</team_id>
     <name>Don's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>9</waiver_priority>
     <number_of_moves>12</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>4</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>A-</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>2</manager_id>
       <nickname>--hidden--</nickname>
       <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1446.84</total>
     </team_points>
     <team_standings>
      <rank>7</rank>
      <playoff_seed>5</playoff_seed>
      <outcome_totals>
       <wins>8</wins>
       <losses>6</losses>
       <ties>0</ties>
       <percentage>.571</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>4</value>
      </streak>
      <points_for>1446.84</points_for>
      <points_against>1494.94</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.3</team_key>
     <team_id>3</team_id>
     <name>Team 2</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/3</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>4</waiver_priority>
     <number_of_moves>2</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>7</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/3/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>3</manager_id>
       <nickname>--hidden--</nickname>
       <guid>DOOAIV6NXW4VZ7HARR6XCDSA2U</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1242.16</total>
     </team_points>
     <team_standings>
      <rank>8</rank>
      <playoff_seed>7</playoff_seed>
      <outcome_totals>
       <wins>6</wins>
       <losses>8</losses>
       <ties>0</ties>
       <percentage>.429</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>1</value>
      </streak>
      <points_for>1242.16</points_for>
      <points_against>1469.98</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.4</team_key>
     <team_id>4</team_id>
     <name>Andrew's Team</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/4</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_a.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>2</waiver_priority>
     <number_of_moves>0</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>6</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>C</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/4/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>4</manager_id>
       <nickname>--hidden--</nickname>
       <guid>SAC2YY4GQ7VGV3YWUVGQ45VD5E</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1226.88</total>
     </team_points>
     <team_standings>
      <rank>9</rank>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>win</type>
       <value>1</value>
      </streak>
      <points_for>1226.88</points_for>
      <points_against>1550.38</points_against>
     </team_standings>
    </team>
    <team>
     <team_key>390.l.1000.t.5</team_key>
     <team_id>5</team_id>
     <name>Maria Moiseeva</name>
     <url>https://football.fantasysports.yahoo.com/2019/f1/1000/5</url>
     <team_logos>
      <team_logo>
       <size>large</size>
       <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_1_m.png</url>
      </team_logo>
     </team_logos>
     <waiver_priority>1</waiver_priority>
     <number_of_moves>0</number_of_moves>
     <number_of_trades>0</number_of_trades>
     <roster_adds>
      <coverage_type>week</coverage_type>
      <coverage_value>17</coverage_value>
      <value>0</value>
     </roster_adds>
     <league_scoring_type>head</league_scoring_type>
     <draft_position>9</draft_position>
     <has_draft_grade>1</has_draft_grade>
     <draft_grade>B</draft_grade>
     <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/5/draftrecap</draft_recap_url>
     <managers>
      <manager>
       <manager_id>5</manager_id>
       <nickname>--hidden--</nickname>
       <guid>GDPAQJI3ETKF7SFJ7SI6H6KRXU</guid>
      </manager>
     </managers>
     <team_points>
      <coverage_type>season</coverage_type>
      <season>2019</season>
      <total>1123.70</total>
     </team_points>
     <team_standings>
      <rank>10</rank>
      <outcome_totals>
       <wins>4</wins>
       <losses>10</losses>
       <ties>0</ties>
       <percentage>.286</percentage>
      </outcome_totals>
      <streak>
       <type>loss</type>
       <value>7</value>
      </streak>
      <points_for>1123.70</points_for>
      <points_against>1300.5</points_against>
     </team_standings>
    </team>
   </teams>
  </standings>
 </league>
</fantasy_content>
```

- League Scoreboard: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/scoreboard)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/scoreboard" time="347.84603118896ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <scoreboard>
   <week>16</week>
   <matchups count="4">
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>0</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=1&amp;mid2=8</matchup_recap_url>
     <matchup_recap_title>marky's Bold Team beat Mayfield of dreams for seventh straight win, 112.82-95.80</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.1</team_key>
       <grade>B</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.8</team_key>
       <grade>C</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.1</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.1</team_key>
       <team_id>1</team_id>
       <name>marky's Bold Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>6</waiver_priority>
       <number_of_moves>23</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>8</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>1</manager_id>
         <nickname>--hidden--</nickname>
         <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>112.82</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>108.87</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.8</team_key>
       <team_id>8</team_id>
       <name>Mayfield of dreams</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/8</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://yahoofantasysports-res.cloudinary.com/image/upload/t_s192sq/fantasy-logos/24974190479_e917a6ed91.jpg</url>
        </team_logo>
       </team_logos>
       <waiver_priority>5</waiver_priority>
       <number_of_moves>9</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>1</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C+</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/8/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>8</manager_id>
         <nickname>--hidden--</nickname>
         <guid>RIDRSRN5WO4HD2KSBJ3FHZQHRQ</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>95.80</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.99</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>1</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=2&amp;mid2=3</matchup_recap_url>
     <matchup_recap_title>Don's Team top Team 2 for fourth straight win, 117.32-99.94</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.2</team_key>
       <grade>B</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.3</team_key>
       <grade>B</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.2</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.2</team_key>
       <team_id>2</team_id>
       <name>Don's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>9</waiver_priority>
       <number_of_moves>12</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>4</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>A-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>2</manager_id>
         <nickname>--hidden--</nickname>
         <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>117.32</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>114.03</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.3</team_key>
       <team_id>3</team_id>
       <name>Team 2</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/3</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_m.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>4</waiver_priority>
       <number_of_moves>2</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>7</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/3/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>3</manager_id>
         <nickname>--hidden--</nickname>
         <guid>DOOAIV6NXW4VZ7HARR6XCDSA2U</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.94</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>100.96</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>1</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=6&amp;mid2=9</matchup_recap_url>
     <matchup_recap_title>CHRISTOPHER's Team hand Chike's Nice Team fifth consecutive loss in 123.36-60.22 rout</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.6</team_key>
       <grade>F</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.9</team_key>
       <grade>A-</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.9</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.6</team_key>
       <team_id>6</team_id>
       <name>Chike's Nice Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>3</waiver_priority>
       <number_of_moves>3</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>10</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B-</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>6</manager_id>
         <nickname>--hidden--</nickname>
         <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>60.22</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>90.03</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.9</team_key>
       <team_id>9</team_id>
       <name>CHRISTOPHER's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/9</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_11_c.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>8</waiver_priority>
       <number_of_moves>22</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>2</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>B</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/9/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>9</manager_id>
         <nickname>--hidden--</nickname>
         <guid>I26YN6SRCGET2HKBDL6HC7CODC</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>123.36</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>117.76</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
    <matchup>
     <week>16</week>
     <week_start>2019-12-17</week_start>
     <week_end>2019-12-23</week_end>
     <status>postevent</status>
     <is_playoffs>1</is_playoffs>
     <is_consolation>0</is_consolation>
     <is_matchup_recap_available>1</is_matchup_recap_available>
     <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=16&amp;mid1=7&amp;mid2=10</matchup_recap_url>
     <matchup_recap_title>ray's Team fall to Pierre's Team in 120.34-91.86 rout</matchup_recap_title>
     <matchup_grades>
      <matchup_grade>
       <team_key>390.l.1000.t.7</team_key>
       <grade>D</grade>
      </matchup_grade>
      <matchup_grade>
       <team_key>390.l.1000.t.10</team_key>
       <grade>B-</grade>
      </matchup_grade>
     </matchup_grades>
     <is_tied>0</is_tied>
     <winner_team_key>390.l.1000.t.10</winner_team_key>
     <teams count="2">
      <team>
       <team_key>390.l.1000.t.7</team_key>
       <team_id>7</team_id>
       <name>ray's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/7</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_4_r.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>10</waiver_priority>
       <number_of_moves>82</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>5</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/7/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>7</manager_id>
         <nickname>--hidden--</nickname>
         <guid>PVJLKB47ITJ6NU4ZRWZAUORFDY</guid>
        </manager>
       </managers>
       <win_probability>0</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>91.86</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>119.55</total>
       </team_projected_points>
      </team>
      <team>
       <team_key>390.l.1000.t.10</team_key>
       <team_id>10</team_id>
       <name>Pierre's Team</name>
       <url>https://football.fantasysports.yahoo.com/2019/f1/1000/10</url>
       <team_logos>
        <team_logo>
         <size>large</size>
         <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_8_p.png</url>
        </team_logo>
       </team_logos>
       <waiver_priority>7</waiver_priority>
       <number_of_moves>14</number_of_moves>
       <number_of_trades>0</number_of_trades>
       <roster_adds>
        <coverage_type>week</coverage_type>
        <coverage_value>17</coverage_value>
        <value>0</value>
       </roster_adds>
       <clinched_playoffs>1</clinched_playoffs>
       <league_scoring_type>head</league_scoring_type>
       <draft_position>3</draft_position>
       <has_draft_grade>1</has_draft_grade>
       <draft_grade>C+</draft_grade>
       <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/10/draftrecap</draft_recap_url>
       <managers>
        <manager>
         <manager_id>10</manager_id>
         <nickname>--hidden--</nickname>
         <guid>5JCHKZ3FPBB4VK4BXQMZ5SSM2A</guid>
        </manager>
       </managers>
       <win_probability>1</win_probability>
       <team_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>121.14</total>
       </team_points>
       <team_projected_points>
        <coverage_type>week</coverage_type>
        <week>16</week>
        <total>112.53</total>
       </team_projected_points>
      </team>
     </teams>
    </matchup>
   </matchups>
  </scoreboard>
 </league>
</fantasy_content>
```

## Leagues Collection

With the Leagues API, you can obtain information from a collection of leagues simultaneously. Each element beneath the Leagues collection will be a [League resource](#league-resource)

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-3) valid for a league is a valid sub-resource under the leagues collection.

- Any sub-resource for a collection of leagues is extracted using a URI like the following:

- /leagues/{sub\_resource}

- /leagues;league\_keys={league\_key1},{league\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from leagues in the same URI using the following formatting:

- /leagues;out={sub\_resource\_1},{sub\_resource\_2}

- /leagues;league\_keys={league\_key1},{league\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/leagues;league\_keys= [{league\_key1}](#league-resource),{league\_key2} | Fetch specific leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000) |

# Team APIs

## Team Resource

The Team APIs allow you to retrieve information about a team within our fantasy games. The team is the basic unit for keeping track of a roster of players, and can be managed by either one or two managers (the second manager being called a co-manager). With the Team APIs, you can obtain team-related information, like the team name, managers, logos, stats and points, and rosters for particular weeks. Teams only exist in the context of a particular [League](#league-resource), although you can request a Team resource as the base of your URI by using the global [team\_key](#team-resource). A particular user can only retrieve data about a team if that team is part of a private league of which the user is a member, or if it’s in a public league.

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D)

- Extract a sub-resource under a team: /fantasy/v2/team/{team\_key}/{sub\_resource}

- Extract multiple sub-resources from team in the same URI: /fantasy/v2/team/{team\_key};out={sub\_resource\_1},{sub\_resource\_2}

- **Team key format:** {game\_key}.l.{league\_id}.t.{team\_id} - Example: nfl.l.1000.t.1 or 461.l.1000.t.1

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes team key, id, name, url, division ID, logos, and team manager information. | /fantasy/v2/team/ [{team\_key}](#team-resource)/metadata | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1) |
| stats | Team statistical data and points. | _Season stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats _Week stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats;type=week;week={week} Here {week} is a non-zero integer, or current for the current week. _Date stats:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/stats;type=date;date={date} For non-NFL, rosters are organized by date instead of week | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=week;week=2](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=week;week=2) |
| standings | Team rank, wins, losses, ties, and winning percentage (as well as divisional data if applicable). | /fantasy/v2/team/ [{team\_key}](#team-resource)/standings | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/standings](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/standings) |
| [roster](#roster-resource) | Team roster. Accepts a week/date parameter. Also accepts [Players](#players-collection) as a sub-resource (included by default) | _Roster for a particular week:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/roster;week={week} Here {week} is a non-zero integer. If week is current, or isn't provided, defaults to current week. _Roster for a particular date_: /fantasy/v2/team/{team\_key}/roster;date={date} For non-NFL, rosters are organized by date instead of week | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster;week=2](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster;week=2) \- The week 2 roster for NFL team 461.l.1000.t.1 [https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/roster;date=2019-08-01](https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/roster;date=2019-08-01) \- The roster for MLB team 388.l.1010.t.1 on 2019-08-01 |
| draftresults | List of players drafted by the team. | /fantasy/v2/team/ [{team\_key}](#team-resource)/draftresults | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/draftresults](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/draftresults) |
| matchups | All the matchups this team has scheduled (for H2H leagues). | _All matchups:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/matchups _Particular weeks:_ /fantasy/v2/team/ [{team\_key}](#team-resource)/matchups;weeks=1,3,6 | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,3,6](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,3,6) |

### Sample Responses

- Team Resource: [/fantasy/v2/team/461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1" time="30.21502494812ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
 </team>
</fantasy_content>
```

- Team Matchups: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,5](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/matchups;weeks=1,5) \- team’s matchups for weeks 1 and 5 in a NFL H2H league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/matchups;weeks=1,5" time="112.8261089325ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <matchups count="2">
   <matchup>
    <week>1</week>
    <week_start>2019-09-05</week_start>
    <week_end>2019-09-09</week_end>
    <status>postevent</status>
    <is_playoffs>0</is_playoffs>
    <is_consolation>0</is_consolation>
    <is_matchup_recap_available>1</is_matchup_recap_available>
    <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=1&amp;mid1=1&amp;mid2=2</matchup_recap_url>
    <matchup_recap_title>Offensively challenged Don's Team knock off marky's Bold Team, 107.56-96.82</matchup_recap_title>
    <matchup_grades>
     <matchup_grade>
      <team_key>390.l.1000.t.1</team_key>
      <grade>B</grade>
     </matchup_grade>
     <matchup_grade>
      <team_key>390.l.1000.t.2</team_key>
      <grade>B</grade>
     </matchup_grade>
    </matchup_grades>
    <is_tied>0</is_tied>
    <winner_team_key>390.l.1000.t.2</winner_team_key>
    <teams count="2">
     <team>
      <team_key>390.l.1000.t.1</team_key>
      <team_id>1</team_id>
      <name>marky's Bold Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>6</waiver_priority>
      <number_of_moves>23</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <clinched_playoffs>1</clinched_playoffs>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>8</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>1</manager_id>
        <nickname>--hidden--</nickname>
        <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
       </manager>
      </managers>
      <win_probability>0</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>96.82</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>103.57</total>
      </team_projected_points>
     </team>
     <team>
      <team_key>390.l.1000.t.2</team_key>
      <team_id>2</team_id>
      <name>Don's Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/2</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_10_d.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>9</waiver_priority>
      <number_of_moves>12</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>4</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>A-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/2/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>2</manager_id>
        <nickname>--hidden--</nickname>
        <guid>ENQSRSO6YKQ7NT3AJAXPIKJA2U</guid>
       </manager>
      </managers>
      <win_probability>1</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>107.56</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>1</week>
       <total>124.18</total>
      </team_projected_points>
     </team>
    </teams>
   </matchup>
   <matchup>
    <week>5</week>
    <week_start>2019-10-01</week_start>
    <week_end>2019-10-07</week_end>
    <status>postevent</status>
    <is_playoffs>0</is_playoffs>
    <is_consolation>0</is_consolation>
    <is_matchup_recap_available>1</is_matchup_recap_available>
    <matchup_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/recap?week=5&amp;mid1=1&amp;mid2=6</matchup_recap_url>
    <matchup_recap_title>marky's Bold Team earn win over Chike's Nice Team in 154.92-83.84 rout</matchup_recap_title>
    <matchup_grades>
     <matchup_grade>
      <team_key>390.l.1000.t.1</team_key>
      <grade>A+</grade>
     </matchup_grade>
     <matchup_grade>
      <team_key>390.l.1000.t.6</team_key>
      <grade>D+</grade>
     </matchup_grade>
    </matchup_grades>
    <is_tied>0</is_tied>
    <winner_team_key>390.l.1000.t.1</winner_team_key>
    <teams count="2">
     <team>
      <team_key>390.l.1000.t.1</team_key>
      <team_id>1</team_id>
      <name>marky's Bold Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>6</waiver_priority>
      <number_of_moves>23</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <clinched_playoffs>1</clinched_playoffs>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>8</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>1</manager_id>
        <nickname>--hidden--</nickname>
        <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
       </manager>
      </managers>
      <win_probability>1</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>154.92</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>107.83</total>
      </team_projected_points>
     </team>
     <team>
      <team_key>390.l.1000.t.6</team_key>
      <team_id>6</team_id>
      <name>Chike's Nice Team</name>
      <url>https://football.fantasysports.yahoo.com/2019/f1/1000/6</url>
      <team_logos>
       <team_logo>
        <size>large</size>
        <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_6_c.png</url>
       </team_logo>
      </team_logos>
      <waiver_priority>3</waiver_priority>
      <number_of_moves>3</number_of_moves>
      <number_of_trades>0</number_of_trades>
      <roster_adds>
       <coverage_type>week</coverage_type>
       <coverage_value>17</coverage_value>
       <value>0</value>
      </roster_adds>
      <league_scoring_type>head</league_scoring_type>
      <draft_position>10</draft_position>
      <has_draft_grade>1</has_draft_grade>
      <draft_grade>B-</draft_grade>
      <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/6/draftrecap</draft_recap_url>
      <managers>
       <manager>
        <manager_id>6</manager_id>
        <nickname>--hidden--</nickname>
        <guid>TIXIVPB7SBOVR6XFB5SH67RW6Y</guid>
       </manager>
      </managers>
      <win_probability>0</win_probability>
      <team_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>83.84</total>
      </team_points>
      <team_projected_points>
       <coverage_type>week</coverage_type>
       <week>5</week>
       <total>115.54</total>
      </team_projected_points>
     </team>
    </teams>
   </matchup>
  </matchups>
 </team>
</fantasy_content>
```

- NFL Team Season Stats: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=season](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/stats;type=season) \- team’s season stats in a NFL H2H league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/stats;type=season" time="40.952920913696ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <team_points>
   <coverage_type>season</coverage_type>
   <season>2019</season>
   <total>1567.82</total>
  </team_points>
 </team>
</fantasy_content>
```

- MLB Team Date Stats: [https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06](https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06) \- team’s date stats in a MLB roto league

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/388.l.1010.t.1/stats;type=date;date=2019-07-06" time="158.32614898682ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>388.l.1010.t.1</team_key>
  <team_id>1</team_id>
  <name>CHAMPS</name>
  <url>https://baseball.fantasysports.yahoo.com/2019/b1/1010/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/mlb/mlb_3.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>7</waiver_priority>
  <number_of_moves>32</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>25</coverage_value>
   <value>2</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>2</draft_position>
  <has_draft_grade>0</has_draft_grade>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>ILW73TYMCXYPVTNKMNEYX3HRXM</guid>
   </manager>
  </managers>
  <team_stats>
   <coverage_type>date</coverage_type>
   <date>2019-07-06</date>
   <stats>
    <stat>
     <stat_id>60</stat_id>
     <value>11/40</value>
    </stat>
    <stat>
     <stat_id>7</stat_id>
     <value>4</value>
    </stat>
    <stat>
     <stat_id>12</stat_id>
     <value>1</value>
    </stat>
    <stat>
     <stat_id>13</stat_id>
     <value>7</value>
    </stat>
    <stat>
     <stat_id>16</stat_id>
     <value>1</value>
    </stat>
    <stat>
     <stat_id>3</stat_id>
     <value>.275</value>
    </stat>
    <stat>
     <stat_id>50</stat_id>
     <value>14.0</value>
    </stat>
    <stat>
     <stat_id>28</stat_id>
     <value>2</value>
    </stat>
    <stat>
     <stat_id>32</stat_id>
     <value>0</value>
    </stat>
    <stat>
     <stat_id>42</stat_id>
     <value>11</value>
    </stat>
    <stat>
     <stat_id>26</stat_id>
     <value>5.14</value>
    </stat>
    <stat>
     <stat_id>27</stat_id>
     <value>1.36</value>
    </stat>
   </stats>
  </team_stats>
 </team>
</fantasy_content>
```

## Teams Collection

With the Teams API, you can obtain information from a collection of teams simultaneously. The teams collection is qualified in the URI by a particular league to obtain information about teams within the league, or by a particular user (and optionally, a game) to obtain information about the teams owned by the user. Each element beneath the Teams collection will be a [Team resource](#team-resource).

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-4) valid for a team is a valid sub-resource under the teams collection.

- Any sub-resource for a collection of teams is extracted using a URI like the following:

- /teams/{sub\_resource}

- /teams;team\_keys={team\_key1},{team\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from teams in the same URI using the following formatting:

- /teams;out={sub\_resource\_1},{sub\_resource\_2}

- /teams;team\_keys={team\_key1},{team\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/teams | Fetch all teams within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/teams) |
| /fantasy/v2/teams;team\_keys= [{team\_key1}](#team-resource),{team\_key2} | Fetch specific teams {team\_key1} and {team\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/teams;team\_keys=461.l.1000.t.1,461.l.1001.t.2](https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys=461.l.1000.t.1,461.l.1001.t.2) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/teams | Fetch all teams of the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.1001/teams](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.1001/teams) |
| /fantasy/v2/users;use\_login=1/teams | Fetch all teams for the logged in user | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/teams) |
| /fantasy/v2/users;use\_login=1/games;game\_keys={game\_key1},{game\_key2}/teams | Fetch all teams for the logged in user for the games {game\_key1} and {game\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=nfl,mlb/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=nfl,mlb/teams) |

## Roster Resource

Players on a team are organized into rosters corresponding to certain weeks, in NFL, or certain dates, in MLB, NBA, and NHL. Each player on a roster will be assigned a position if they’re in the starting lineup, or will be on the bench. You can only receive credit for stats accumulated by players in your starting lineup.

You can use this API to edit your lineup by PUTting up new positions for the players on a roster. You can also add/drop players from your roster by POSTing new transactions to the league’s transactions collection.

Even though there are many rosters (for particular dates or weeks) contained within a single team, we only currently support requesting a single roster at a time (as a sub-resource, not as a collection) within a Team resource.

- **HTTP Operations Supported:**

- GET

- PUT

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster)

- Extract a sub-resource under a roster:

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster/{sub\_resource}](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster/%7Bsub_resource%7D)

- For NFL, you can specify a week parameter to retrieve a specific week – otherwise it will default to the current roster

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster;week=10](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster;week=10)

- For MLB, NHL, or NBA, you can specify a date parameter to retrieve a specific date – otherwise it will default to today’s roster.

- [https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster;date=2019-07-01](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster;date=2019-07-01)

### Sub-resources

_Default sub-resource:_ players

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| [players](#players-collection) | Access the players collection within the roster. | /fantasy/v2/team/ [{team\_key}](#team-resource)/roster/players | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players) |

### Sample Responses

Roster Players: [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/roster/players)

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/team/390.l.1000.t.1/roster/players" time="71.652889251709ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <team>
  <team_key>390.l.1000.t.1</team_key>
  <team_id>1</team_id>
  <name>marky's Bold Team</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000/1</url>
  <team_logos>
   <team_logo>
    <size>large</size>
    <url>https://s.yimg.com/cv/apiv2/default/nfl/nfl_3_m.png</url>
   </team_logo>
  </team_logos>
  <waiver_priority>6</waiver_priority>
  <number_of_moves>23</number_of_moves>
  <number_of_trades>0</number_of_trades>
  <roster_adds>
   <coverage_type>week</coverage_type>
   <coverage_value>17</coverage_value>
   <value>0</value>
  </roster_adds>
  <clinched_playoffs>1</clinched_playoffs>
  <league_scoring_type>head</league_scoring_type>
  <draft_position>8</draft_position>
  <has_draft_grade>1</has_draft_grade>
  <draft_grade>B-</draft_grade>
  <draft_recap_url>https://football.fantasysports.yahoo.com/2019/f1/1000/1/draftrecap</draft_recap_url>
  <managers>
   <manager>
    <manager_id>1</manager_id>
    <nickname>--hidden--</nickname>
    <guid>AKFCI2L2UVU2ZIPGBXZYGYBNWN</guid>
   </manager>
  </managers>
  <roster>
   <coverage_type>week</coverage_type>
   <week>16</week>
   <is_editable>0</is_editable>
   <players count="15">
    <player>
     <player_key>390.p.31833</player_key>
     <player_id>31833</player_id>
     <name>
      <full>Kyler Murray</full>
      <first>Kyler</first>
      <last>Murray</last>
      <ascii_first>Kyler</ascii_first>
      <ascii_last>Murray</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31833</editorial_player_key>
     <editorial_team_key>nfl.t.22</editorial_team_key>
     <editorial_team_full_name>Arizona Cardinals</editorial_team_full_name>
     <editorial_team_abbr>Ari</editorial_team_abbr>
     <bye_weeks>
      <week>12</week>
     </bye_weeks>
     <uniform_number>1</uniform_number>
     <display_position>QB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/P_YAlI23JfFA_1nS6l7vWA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08062019/31833.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/P_YAlI23JfFA_1nS6l7vWA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08062019/31833.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>QB</primary_position>
     <eligible_positions>
      <position>QB</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>QB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31051</player_key>
     <player_id>31051</player_id>
     <name>
      <full>Michael Gallup</full>
      <first>Michael</first>
      <last>Gallup</last>
      <ascii_first>Michael</ascii_first>
      <ascii_last>Gallup</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31051</editorial_player_key>
     <editorial_team_key>nfl.t.6</editorial_team_key>
     <editorial_team_full_name>Dallas Cowboys</editorial_team_full_name>
     <editorial_team_abbr>Dal</editorial_team_abbr>
     <bye_weeks>
      <week>8</week>
     </bye_weeks>
     <uniform_number>13</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/16dAM_tZ8DfvOoO8Bx.XjA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31051.1.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/16dAM_tZ8DfvOoO8Bx.XjA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31051.1.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>WR</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30182</player_key>
     <player_id>30182</player_id>
     <name>
      <full>Cooper Kupp</full>
      <first>Cooper</first>
      <last>Kupp</last>
      <ascii_first>Cooper</ascii_first>
      <ascii_last>Kupp</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30182</editorial_player_key>
     <editorial_team_key>nfl.t.14</editorial_team_key>
     <editorial_team_full_name>Los Angeles Rams</editorial_team_full_name>
     <editorial_team_abbr>LAR</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>10</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/lalq4GQm81B5HwQHQx6wDg--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30182.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/lalq4GQm81B5HwQHQx6wDg--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30182.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>WR</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.28403</player_key>
     <player_id>28403</player_id>
     <name>
      <full>Melvin Gordon III</full>
      <first>Melvin</first>
      <last>Gordon III</last>
      <ascii_first>Melvin</ascii_first>
      <ascii_last>Gordon III</ascii_last>
     </name>
     <editorial_player_key>nfl.p.28403</editorial_player_key>
     <editorial_team_key>nfl.t.7</editorial_team_key>
     <editorial_team_full_name>Denver Broncos</editorial_team_full_name>
     <editorial_team_abbr>Den</editorial_team_abbr>
     <bye_weeks>
      <week>10</week>
     </bye_weeks>
     <uniform_number>25</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/nSTMDQOiYSnOjVHiaPebfw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08152019/28403.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/nSTMDQOiYSnOjVHiaPebfw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08152019/28403.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>RB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31228</player_key>
     <player_id>31228</player_id>
     <name>
      <full>Mike Boone</full>
      <first>Mike</first>
      <last>Boone</last>
      <ascii_first>Mike</ascii_first>
      <ascii_last>Boone</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31228</editorial_player_key>
     <editorial_team_key>nfl.t.16</editorial_team_key>
     <editorial_team_full_name>Minnesota Vikings</editorial_team_full_name>
     <editorial_team_abbr>Min</editorial_team_abbr>
     <bye_weeks>
      <week>12</week>
     </bye_weeks>
     <uniform_number>23</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/RzYtRW9jiodtk1Gj0QZzrQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/31228.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/RzYtRW9jiodtk1Gj0QZzrQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/31228.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>RB</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31019</player_key>
     <player_id>31019</player_id>
     <name>
      <full>Dallas Goedert</full>
      <first>Dallas</first>
      <last>Goedert</last>
      <ascii_first>Dallas</ascii_first>
      <ascii_last>Goedert</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31019</editorial_player_key>
     <editorial_team_key>nfl.t.21</editorial_team_key>
     <editorial_team_full_name>Philadelphia Eagles</editorial_team_full_name>
     <editorial_team_abbr>Phi</editorial_team_abbr>
     <bye_weeks>
      <week>10</week>
     </bye_weeks>
     <uniform_number>88</uniform_number>
     <display_position>TE</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/OLFWL8womkbApafC0KvN6w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31019.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/OLFWL8womkbApafC0KvN6w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08202019/31019.png</image_url>

     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>TE</primary_position>
     <eligible_positions>
      <position>TE</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>TE</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.29281</player_key>
     <player_id>29281</player_id>
     <name>
      <full>Michael Thomas</full>
      <first>Michael</first>
      <last>Thomas</last>
      <ascii_first>Michael</ascii_first>
      <ascii_last>Thomas</ascii_last>
     </name>
     <editorial_player_key>nfl.p.29281</editorial_player_key>
     <editorial_team_key>nfl.t.18</editorial_team_key>
     <editorial_team_full_name>New Orleans Saints</editorial_team_full_name>
     <editorial_team_abbr>NO</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>13</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/cearLySB.TP8BAZc8ai7Ig--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/29281.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/cearLySB.TP8BAZc8ai7Ig--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08212019/29281.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>W/R/T</position>
      <is_flex>1</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.29279</player_key>
     <player_id>29279</player_id>
     <name>
      <full>Derrick Henry</full>
      <first>Derrick</first>
      <last>Henry</last>
      <ascii_first>Derrick</ascii_first>
      <ascii_last>Henry</ascii_last>
     </name>
     <editorial_player_key>nfl.p.29279</editorial_player_key>
     <editorial_team_key>nfl.t.10</editorial_team_key>
     <editorial_team_full_name>Tennessee Titans</editorial_team_full_name>
     <editorial_team_abbr>Ten</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number>22</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/R429FlhNa_Hub0Djx_5UlA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08232019/29279.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/R429FlhNa_Hub0Djx_5UlA--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08232019/29279.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <player_notes_last_timestamp>1591215527</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30971</player_key>
     <player_id>30971</player_id>
     <name>
      <full>Baker Mayfield</full>
      <first>Baker</first>
      <last>Mayfield</last>
      <ascii_first>Baker</ascii_first>
      <ascii_last>Mayfield</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30971</editorial_player_key>
     <editorial_team_key>nfl.t.5</editorial_team_key>
     <editorial_team_full_name>Cleveland Browns</editorial_team_full_name>
     <editorial_team_abbr>Cle</editorial_team_abbr>
     <bye_weeks>
      <week>7</week>
     </bye_weeks>
     <uniform_number>6</uniform_number>
     <display_position>QB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/B7BiBtG9Y3Q_17hxPY.HkQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30971.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/B7BiBtG9Y3Q_17hxPY.HkQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30971.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>QB</primary_position>
     <eligible_positions>
      <position>QB</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <player_notes_last_timestamp>1591308412</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.28398</player_key>
     <player_id>28398</player_id>
     <name>
      <full>Todd Gurley II</full>
      <first>Todd</first>
      <last>Gurley II</last>
      <ascii_first>Todd</ascii_first>
      <ascii_last>Gurley II</ascii_last>
     </name>
     <editorial_player_key>nfl.p.28398</editorial_player_key>
     <editorial_team_key>nfl.t.1</editorial_team_key>
     <editorial_team_full_name>Atlanta Falcons</editorial_team_full_name>
     <editorial_team_abbr>Atl</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>21</uniform_number>
     <display_position>RB</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/CysIvnp3dwrmK9iImyiSPw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/28398.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/CysIvnp3dwrmK9iImyiSPw--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/28398.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>RB</primary_position>
     <eligible_positions>
      <position>RB</position>
      <position>W/R/T</position>
     </eligible_positions>
     <has_player_notes>1</has_player_notes>
     <has_recent_player_notes>1</has_recent_player_notes>
     <player_notes_last_timestamp>1591706729</player_notes_last_timestamp>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.30157</player_key>
     <player_id>30157</player_id>
     <name>
      <full>Gerald Everett</full>
      <first>Gerald</first>
      <last>Everett</last>
      <ascii_first>Gerald</ascii_first>
      <ascii_last>Everett</ascii_last>
     </name>
     <editorial_player_key>nfl.p.30157</editorial_player_key>
     <editorial_team_key>nfl.t.14</editorial_team_key>
     <editorial_team_full_name>Los Angeles Rams</editorial_team_full_name>
     <editorial_team_abbr>LAR</editorial_team_abbr>
     <bye_weeks>
      <week>9</week>
     </bye_weeks>
     <uniform_number>81</uniform_number>
     <display_position>TE</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/Pswufbbx3KS3XTSlEpmM2w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30157.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/Pswufbbx3KS3XTSlEpmM2w--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08192019/30157.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>TE</primary_position>
     <eligible_positions>
      <position>TE</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.31896</player_key>
     <player_id>31896</player_id>
     <name>
      <full>DK Metcalf</full>
      <first>DK</first>
      <last>Metcalf</last>
      <ascii_first>DK</ascii_first>
      <ascii_last>Metcalf</ascii_last>
     </name>
     <editorial_player_key>nfl.p.31896</editorial_player_key>
     <editorial_team_key>nfl.t.26</editorial_team_key>
     <editorial_team_full_name>Seattle Seahawks</editorial_team_full_name>
     <editorial_team_abbr>Sea</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number>14</uniform_number>
     <display_position>WR</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/yr4AQCZ_vGBRP1Tr6QiZcQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08102019/31896.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/yr4AQCZ_vGBRP1Tr6QiZcQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08102019/31896.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>O</position_type>
     <primary_position>WR</primary_position>
     <eligible_positions>
      <position>WR</position>
      <position>W/R/T</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.32002</player_key>
     <player_id>32002</player_id>
     <name>
      <full>Austin Seibert</full>
      <first>Austin</first>
      <last>Seibert</last>
      <ascii_first>Austin</ascii_first>
      <ascii_last>Seibert</ascii_last>
     </name>
     <editorial_player_key>nfl.p.32002</editorial_player_key>
     <editorial_team_key>nfl.t.5</editorial_team_key>
     <editorial_team_full_name>Cleveland Browns</editorial_team_full_name>
     <editorial_team_abbr>Cle</editorial_team_abbr>
     <bye_weeks>
      <week>7</week>
     </bye_weeks>
     <uniform_number>4</uniform_number>
     <display_position>K</display_position>
     <headshot>
      <url>https://s.yimg.com/iu/api/res/1.2/i0dp02LJ0zd5LNOdjkUGyQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08092019/32002.png</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/iu/api/res/1.2/i0dp02LJ0zd5LNOdjkUGyQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08092019/32002.png</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>K</position_type>
     <primary_position>K</primary_position>
     <eligible_positions>
      <position>K</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>K</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.100026</player_key>
     <player_id>100026</player_id>
     <name>
      <full>Seattle</full>
      <first>Seattle</first>
      <last/>
      <ascii_first>Seattle</ascii_first>
      <ascii_last/>
     </name>
     <editorial_player_key>nfl.p.100026</editorial_player_key>
     <editorial_team_key>nfl.t.26</editorial_team_key>
     <editorial_team_full_name>Seattle Seahawks</editorial_team_full_name>
     <editorial_team_abbr>Sea</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number></uniform_number>
     <display_position>DEF</display_position>
     <headshot>
      <url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/sea.gif</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/sea.gif</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>DT</position_type>
     <primary_position>DEF</primary_position>
     <eligible_positions>
      <position>DEF</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>DEF</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
    <player>
     <player_key>390.p.100009</player_key>
     <player_id>100009</player_id>
     <name>
      <full>Green Bay</full>
      <first>Green Bay</first>
      <last/>
      <ascii_first>Green Bay</ascii_first>
      <ascii_last/>
     </name>
     <editorial_player_key>nfl.p.100009</editorial_player_key>
     <editorial_team_key>nfl.t.9</editorial_team_key>
     <editorial_team_full_name>Green Bay Packers</editorial_team_full_name>
     <editorial_team_abbr>GB</editorial_team_abbr>
     <bye_weeks>
      <week>11</week>
     </bye_weeks>
     <uniform_number></uniform_number>
     <display_position>DEF</display_position>
     <headshot>
      <url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/gnb.gif</url>
      <size>small</size>
     </headshot>
     <image_url>https://s.yimg.com/lq/i/us/sp/v/nfl/teams/1/50x50w/gnb.gif</image_url>
     <is_undroppable>0</is_undroppable>
     <position_type>DT</position_type>
     <primary_position>DEF</primary_position>
     <eligible_positions>
      <position>DEF</position>
     </eligible_positions>
     <selected_position>
      <coverage_type>week</coverage_type>
      <week>16</week>
      <position>BN</position>
      <is_flex>0</is_flex>
     </selected_position>
    </player>
   </players>
  </roster>
 </team>
</fantasy_content>
```

### PUT

Using PUT, you may modify a subset of players on the roster for a particular day, specifically in terms of changing their position or whether they’re in the starting lineup. The URL to PUT to a Roster resource is:

[https://fantasysports.yahooapis.com/fantasy/v2/team/{team\_key}/roster](https://fantasysports.yahooapis.com/fantasy/v2/team/%7Bteam_key%7D/roster)

You may move as many players as you like in your input XML – any players whose position you do not change will stay in the same position they were previously. If you try to move players in an invalid way, you will receive an error and no changes will be made.

Your input XML should look like:

#### NFL

```xml

<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>week</coverage_type>
    <week>13</week>

    <players>
      <player>
        <player_key>461.p.8332</player_key>
        <position>WR</position>
      </player>
      <player>
        <player_key>461.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

#### MLB, NBA, or NHL

```xml

<?xml version="1.0"?>
<fantasy_content>
  <roster>
    <coverage_type>date</coverage_type>
    <date>2019-05-01</date>

    <players>
      <player>
        <player_key>388.p.8332</player_key>
        <position>1B</position>
      </player>
      <player>
        <player_key>388.p.1423</player_key>
        <position>BN</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

# Player APIs

## Player Resource

With the Player API, you can obtain the player (athlete) related information, such as their name, professional team, and eligible positions. The player is identified in the context of a particular game, and can be requested as the base of your URI by using the global [player\_key](#player-key-format).

- **HTTP Operations Supported**: GET

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key}](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D)

- Extract a sub-resource under a player:

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key}/{sub\_resource}](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D/%7Bsub_resource%7D)

- Extract multiple sub-resources from player in the same URI:

- [https://fantasysports.yahooapis.com/fantasy/v2/player/{player\_key};out={sub\_resource\_1},{sub\_resource\_2](https://fantasysports.yahooapis.com/fantasy/v2/player/%7Bplayer_key%7D;out=%7Bsub_resource_1%7D,%7Bsub_resource_2)}

- **Player key format** {#player-key-format}: {game\_key}.p.{player\_id}

- _Example:_ nfl.p.30121 or 461.p.30121

### Sub-resources

_Default sub-resource:_ metadata

| Name | Description | URI | Examples |
| --- | --- | --- | --- |
| metadata | Includes player key, id, name, editorial information, image, eligible positions, etc. | /fantasy/v2/player/ [{player\_key}](#player-resource)/metadata | Christian McCaffrey’s info in the 2025 season: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121) |
| stats | Player stats and points (if in a league context). | _Season stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats _Week stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats;type=week;week={week} Here {week} is a non-zero integer. _Date stats:_ /fantasy/v2/player/ [{player\_key}](#player-resource)/stats;type=date;date={date} For non-NFL, stats are also available by date instead of week | Christian McCaffrey’s info and stats in the 2019 season: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/stats](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/stats) |
| ownership | The player ownership status within a league (whether they're owned by a team, on waivers, or free agents). Only relevant within a league. | /fantasy/v2/league/ [{league\_key}](#league-resource)/players;player\_keys= [{player\_key}](#player-resource)/ownership | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121/ownership](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121/ownership) |
| percent\_owned | Data about ownership percentage of the player | /fantasy/v2/player/ [{player\_key}](#player-resource)/percent\_owned | The percentage of leagues in which Christian McCaffrey was owned in the 2020 game: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/percent\_owned](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/percent_owned) |
| draft\_analysis | Average pick, Average round and Percent Drafted. | /fantasy/v2/player/ [{player\_key}](#player-resource)/draft\_analysis | Yahoo! fantasy draft information for Christan McCaffrey in 2019: [https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/draft\_analysis](https://fantasysports.yahooapis.com/fantasy/v2/player/461.p.30121/draft_analysis) |

### Sample Responses

- Player Resource: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121) \- Player in a NFL league context

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/players;player_keys=390.p.30121" time="47.651052474976ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <players count="1">
   <player>
    <player_key>390.p.30121</player_key>
    <player_id>30121</player_id>
    <name>
     <full>Christian McCaffrey</full>
     <first>Christian</first>
     <last>McCaffrey</last>
     <ascii_first>Christian</ascii_first>
     <ascii_last>McCaffrey</ascii_last>
    </name>
    <editorial_player_key>nfl.p.30121</editorial_player_key>
    <editorial_team_key>nfl.t.29</editorial_team_key>
    <editorial_team_full_name>Carolina Panthers</editorial_team_full_name>
    <editorial_team_abbr>Car</editorial_team_abbr>
    <bye_weeks>
     <week>7</week>
    </bye_weeks>
    <uniform_number>22</uniform_number>
    <display_position>RB</display_position>
    <headshot>
     <url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</url>
     <size>small</size>
    </headshot>
    <image_url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</image_url>
    <is_undroppable>0</is_undroppable>
    <position_type>O</position_type>
    <primary_position>RB</primary_position>
    <eligible_positions>
     <position>RB</position>
     <position>W/R/T</position>
    </eligible_positions>
   </player>
  </players>
 </league>
</fantasy_content>
```

- NFL Player Season Stats: [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player\_keys=461.p.30121/stats](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players;player_keys=461.p.30121/stats) \- Player season stats in a NFL league context

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/league/390.l.1000/players;player_keys=390.p.30121/stats" time="30.03978729248ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <league>
  <league_key>390.l.1000</league_key>
  <league_id>1000</league_id>
  <name>Yahoo Public 1000</name>
  <url>https://football.fantasysports.yahoo.com/2019/f1/1000</url>
  <logo_url>https://s.yimg.com/cv/api/default/20180206/default-league-logo@2x.png</logo_url>
  <draft_status>postdraft</draft_status>
  <num_teams>10</num_teams>
  <edit_key>16</edit_key>
  <weekly_deadline/>
  <league_update_timestamp>1577869389</league_update_timestamp>
  <scoring_type>head</scoring_type>
  <league_type>public</league_type>
  <renew/>
  <renewed/>
  <iris_group_chat_id/>
  <allow_add_to_dl_extra_pos>0</allow_add_to_dl_extra_pos>
  <is_pro_league>0</is_pro_league>
  <is_cash_league>0</is_cash_league>
  <current_week>16</current_week>
  <start_week>1</start_week>
  <start_date>2019-09-05</start_date>
  <end_week>16</end_week>
  <end_date>2019-12-23</end_date>
  <is_finished>1</is_finished>
  <game_code>nfl</game_code>
  <season>2019</season>
  <players count="1">
   <player>
    <player_key>390.p.30121</player_key>
    <player_id>30121</player_id>
    <name>
     <full>Christian McCaffrey</full>
     <first>Christian</first>
     <last>McCaffrey</last>
     <ascii_first>Christian</ascii_first>
     <ascii_last>McCaffrey</ascii_last>
    </name>
    <editorial_player_key>nfl.p.30121</editorial_player_key>
    <editorial_team_key>nfl.t.29</editorial_team_key>
    <editorial_team_full_name>Carolina Panthers</editorial_team_full_name>
    <editorial_team_abbr>Car</editorial_team_abbr>
    <bye_weeks>
     <week>7</week>
    </bye_weeks>
    <uniform_number>22</uniform_number>
    <display_position>RB</display_position>
    <headshot>
     <url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</url>
     <size>small</size>
    </headshot>
    <image_url>https://s.yimg.com/iu/api/res/1.2/yJImsXzYYUYM_SxD6fEAzQ--~C/YXBwaWQ9eXNwb3J0cztjaD0yMzM2O2NyPTE7Y3c9MTc5MDtkeD04NTc7ZHk9MDtmaT11bGNyb3A7aD02MDtxPTEwMDt3PTQ2/https://s.yimg.com/xe/i/us/sp/v/nfl_cutout/players_l/08162019/30121.png</image_url>
    <is_undroppable>0</is_undroppable>
    <position_type>O</position_type>
    <primary_position>RB</primary_position>
    <eligible_positions>
     <position>RB</position>
     <position>W/R/T</position>
    </eligible_positions>
    <player_stats>
     <coverage_type>season</coverage_type>
     <season>2019</season>
     <stats>
      <stat>
       <stat_id>4</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>5</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>6</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>8</stat_id>
       <value>287</value>
      </stat>
      <stat>
       <stat_id>9</stat_id>
       <value>1387</value>
      </stat>
      <stat>
       <stat_id>10</stat_id>
       <value>15</value>
      </stat>
      <stat>
       <stat_id>78</stat_id>
       <value>142</value>
      </stat>
      <stat>
       <stat_id>11</stat_id>
       <value>116</value>
      </stat>
      <stat>
       <stat_id>12</stat_id>
       <value>1005</value>
      </stat>
      <stat>
       <stat_id>13</stat_id>
       <value>4</value>
      </stat>
      <stat>
       <stat_id>15</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>16</stat_id>
       <value>1</value>
      </stat>
      <stat>
       <stat_id>18</stat_id>
       <value>0</value>
      </stat>
      <stat>
       <stat_id>57</stat_id>
       <value>0</value>
      </stat>
     </stats>
    </player_stats>
    <player_points>
     <coverage_type>season</coverage_type>
     <season>2019</season>
     <total>413.20</total>
    </player_points>
   </player>
  </players>
 </league>
</fantasy_content>
```

## Players Collection

With the Players API, you can obtain information from a collection of players simultaneously. To obtain general players information, the players collection can be qualified in the URI by a particular game, league or team. To obtain specific league or team related information, the players collection is qualified by the relevant league or team. Each element beneath the Players collection will be a [Player resource](#player-resource)

- **HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-6) valid for a player is a valid sub-resource under the players collection.

- Any sub-resource for a collection of players is extracted using a URI like the following:

- /players/{sub\_resource}

- /players;player\_keys={player\_key1},{player\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from players in the same URI using the following formatting:

- /players;out={sub\_resource\_1},{sub\_resource\_2}

- /players;player\_keys={player\_key1},{player\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/players | Fetch all players within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/players) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/players | Fetch all players from the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.10011/players](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.10011/players) |
| /fantasy/v2/team/ [{team\_key}](#team-resource)/players | Fetch all players within a team. | [https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/players](https://fantasysports.yahooapis.com/fantasy/v2/team/461.l.1000.t.1/players) |
| /fantasy/v2/teams;team\_keys={team\_key1},{team\_key2}/players | Fetch all players from the teams {team\_key1} and {team\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/teams;team\_keys=461.l.1000.t.1,461.l.1000.t.2/players](https://fantasysports.yahooapis.com/fantasy/v2/teams;team_keys=461.l.1000.t.1,461.l.1000.t.2/players) |
| /fantasy/v2/players;player\_keys= [{player\_key1}](#player-resource),{player\_key2} | Fetch specific players {player\_key1} and {player\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/players;player\_keys=461.p.30121,461.p.31002](https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=461.p.30121,461.p.31002) |

### Filters

The players collection can have filters such as the following to obtain a subset of a players collection that satisfy the filtering condition. The filters can be combined to obtain a more restricted list of players.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| position | Valid player positions | /players;position=QB **Note** Applied only in a league’s context |
| status | A (all available players) FA (free agents only) W (waivers only) T (all taken players) K (keepers only) | /players;status=A **Note** Applied only in a league’s context |
| search | player name | /players;search=smith **Note** Applied only in a league’s context |
| sort | {stat\_id} NAME (last, first) OR (overall rank) AR (actual rank) PTS (fantasy points) | /players;sort=60 **Note** Applied only in a league’s context |
| sort\_type | season date (baseball, basketball, and hockey only) week (football only) lastweek (baseball, basketball, and hockey only) lastmonth | /players;sort\_type=season **Note** Applied only in a league’s context |
| sort\_season | year | /players;sort\_type=season;sort\_season=2019 **Note** Applied only in a league’s context |
| sort\_date (baseball, basketball, and hockey only) | YYYY-MM-DD | /players;sort\_type=date;sort\_date=2019-02-01 **Note** Applied only in a league’s context |
| sort\_week (football only) | week | /players;sort\_type=week;sort\_week=10 **Note** Applied only in a league’s context |
| start | Pagination start value. Any integer 0 or greater | /players;start=25 |
| count | Number of items in pagination. Any integer greater than 0 | /players;count=5 |

# Transaction APIs

## Transaction Resource

With the Transaction API, you can obtain information about transactions (adds, drops, trades, and league settings changes) performed on a league. A transaction is identified in the context of a particular league, although you can request a particular Transaction resource as the base of your URI by using the global [transaction\_key](#transaction-key-format).

You can also PUT to the API to perform operations like editing waiver priorities or FAAB bids, or modifying the state of pending trades. You can also cancel pending transactions by DELETEing them.

Keep in mind, if you don’t have the [transaction\_key](#transaction-key-format) for a waiver claim or pending trade, the only way to discover these transactions is to filter the league [Transactions collection](#transactions-collection) by a particular type (waiver or pending\_trade) and by a particular [transaction\_key](#transaction-key-format). Pending transactions will not show up if you simply ask for all of the transactions in the league, because they can only be seen by certain teams.

- **HTTP Operations Supported**

- GET

- PUT

- DELETE

- **URIs**

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key)}

- Extract a sub-resource under a transaction:

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key}/{sub\_resource](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key%7D/%7Bsub_resource)}

- Extract multiple sub-resources from transaction in the same URI:

- [https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction\_key};out={sub\_resource\_1},{sub\_resource\_2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/%7Btransaction_key%7D;out=%7Bsub_resource_1%7D,%7Bsub_resource_2)}

- **Transaction key format** {#transaction-key-format}

- Completed transactions: {game\_key}.l.{league\_id}.tr.{transaction\_id}

- _Example:_ nfl.l.1000.tr.26 or 461.l.1000.tr.26

- Waiver claims: {game\_key}.l.{league\_id}.w.c.{claim\_id}

- _Example:_ 461.l.1000.w.c.2\_6461

- Pending trades: {game\_key}.l.{league\_id}.pt.{pending\_trade\_id}

- _Example:_ 461.l.1000.pt.1

### Sub-resources

_Default sub-resources:_ metadata, players

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| metadata | Includes transaction key, id, type, timestamp, status, players (not displayed for all transaction types) | /fantasy/v2/transaction/ [{transaction\_key}](#transaction-key-format)/metadata | An add/drop transaction: [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2) |
| [players](#players-collection) | Players that are part of the transaction. The [Player Resources](#player-resource) will include a transaction data element by default. | /fantasy/v2/transaction/ [{transaction\_key}](#transaction-key-format)/players | [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.26/players](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.26/players) |

### Sample Responses

Add/Drop Transaction: [https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2](https://fantasysports.yahooapis.com/fantasy/v2/transaction/461.l.1000.tr.2) \- Completed add/drop transaction

```xml

<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content xml:lang="en-US" yahoo:uri="https://fantasysports.yahooapis.com/fantasy/v2/transaction/390.l.1000.tr.2" time="38.97500038147ms" copyright="Data provided by Yahoo! and STATS, LLC" refresh_rate="60" xmlns:yahoo="http://www.yahooapis.com/v1/base.rng" xmlns="http://fantasysports.yahooapis.com/fantasy/v2/base.rng">
 <transaction>
  <transaction_key>390.l.1000.tr.2</transaction_key>
  <transaction_id>2</transaction_id>
  <type>add/drop</type>
  <status>successful</status>
  <timestamp>1564988958</timestamp>
  <players count="2">
   <player>
    <player_key>390.p.6762</player_key>
    <player_id>6762</player_id>
    <name>
     <full>Larry Fitzgerald</full>
     <first>Larry</first>
     <last>Fitzgerald</last>
     <ascii_first>Larry</ascii_first>
     <ascii_last>Fitzgerald</ascii_last>
    </name>
    <editorial_team_abbr>Ari</editorial_team_abbr>
    <display_position>WR</display_position>
    <position_type>O</position_type>
    <transaction_data>
     <type>add</type>
     <source_type>waivers</source_type>
     <destination_type>team</destination_type>
     <destination_team_key>390.l.1000.t.1</destination_team_key>
     <destination_team_name>marky's Bold Team</destination_team_name>
    </transaction_data>
   </player>
   <player>
    <player_key>390.p.8447</player_key>
    <player_id>8447</player_id>
    <name>
     <full>Mason Crosby</full>
     <first>Mason</first>
     <last>Crosby</last>
     <ascii_first>Mason</ascii_first>
     <ascii_last>Crosby</ascii_last>
    </name>
    <editorial_team_abbr>GB</editorial_team_abbr>
    <display_position>K</display_position>
    <position_type>K</position_type>
    <transaction_data>
     <type>drop</type>
     <source_type>team</source_type>
     <source_team_key>390.l.1000.t.1</source_team_key>
     <source_team_name>marky's Bold Team</source_team_name>
     <destination_type>waivers</destination_type>
    </transaction_data>
   </player>
  </players>
 </transaction>
</fantasy_content>
```

### PUT

Using PUT, you may edit the waiver priority or FAAB bid for any of your pending waiver claims. You can also accept or reject trades that have been proposed to you, and allow or vote against trades if your league settings allow it. The URL to PUT to a Transaction resource is:

```

https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

You can only PUT to Transactions of the types waiver or pending\_trade.

#### Editing Waivers

Once you have the transaction\_key for a waiver claim, which you can get by asking the transactions collection for all waivers for a certain team, you can edit the waiver priority or FAAB bid. The input XML should look like:

```

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.w.c.2_6093</transaction_key>
    <type>waiver</type>
    <waiver_priority>1</waiver_priority>
    <faab_bid>20</faab_bid>
  </transaction>
</fantasy_content>
```

#### Accepting Trades

Once you have the transaction\_key for a pending trade that has been proposed to you, which you can get by asking the transactions collection for all pending trades for your team, you can choose to accept it. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>accept</action>
    <trade_note>Dude, that is a totally fair trade.</trade_note>
  </transaction>
</fantasy_content>
```

#### Rejecting Trades

To reject a pending trade proposed to you, the input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>reject</action>
    <trade_note>No way!</trade_note>
  </transaction>
</fantasy_content>
```

#### Allowing/Disallowing Trades

If there are accepted trades in your league waiting to be processed, which you can get by asking the transactions collection for all pending trades for your team, and you’re the commissioner of a league that has the commissioner approve trades, you can choose to allow or disallow the trade. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>allow</action>
  </transaction>
</fantasy_content>
```

Or

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>disallow</action>
  </transaction>
</fantasy_content>
```

#### Voting Against Trades

If there are accepted trades in your league waiting to be processed, which you can get by asking the transactions collection for all pending trades for your team, and you’re a manager in a league that allows managers to vote against trades, you can choose to vote against the trade. The input XML should look like:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>461.l.1000.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>vote_against</action>
    <voter_team_key>461.l.1000.t.2</voter_team_key>
  </transaction>
</fantasy_content>
```

### DELETE

Using DELETE, you may cancel any pending waiver claim or proposed trade. The URL to DELETE a Transaction resource is:

```

https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

You can only DELETE transactions of the types waiver or pending\_trade if the pending trade has not yet been accepted.

## Transactions Collection

With the Transactions API, you can obtain information via GET from a collection of transactions simultaneously. The transactions collection is qualified in the URI by a particular league. Each element beneath the Transactions collection will be a [Transaction resource](#transaction-resource)

You can also POST to the API to perform operations like adding and/or dropping players to/from a team and proposing trades.

- **HTTP Operations Supported**

- GET

- POST

- Any [sub-resource](#sub-resources-7) valid for a transaction is a valid sub-resource under the transactions collection.

- Any sub-resource for a collection of transactions is extracted using a URI like the following:

- /transactions/{sub\_resource}

- /transactions;transaction\_keys={transaction\_key1},{transaction\_key2}/{sub\_resource}

- Multiple sub-resources can be extracted from transactions in the same URI using the following formatting:

- /transactions;out={sub\_resource\_1},{sub\_resource\_2}

- /transactions;transaction\_keys={transaction\_key1},{transaction\_key2};out={sub\_resource\_1},{sub\_resource\_2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/league/ [{league\_key}](#league-resource)/transactions | Fetch all completed transactions within a league. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions) |
| /fantasy/v2/transactions;transaction\_keys= [{transaction\_key1}](#transaction-key-format),{transaction\_key2} | Fetch specific transactions {transaction\_key1} and {transaction\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/transactions;transaction\_keys=461.l.1000.tr.26,461.l.1000.tr.27](https://fantasysports.yahooapis.com/fantasy/v2/transactions;transaction_keys=461.l.1000.tr.26,461.l.1000.tr.27) |
| /fantasy/v2/leagues;league\_keys={league\_key1},{league\_key2}/transactions | Fetch all completed transactions of the leagues {league\_key1} and {league\_key2} | [https://fantasysports.yahooapis.com/fantasy/v2/leagues;league\_keys=461.l.1000,461.l.1001/transactions](https://fantasysports.yahooapis.com/fantasy/v2/leagues;league_keys=461.l.1000,461.l.1001/transactions) |
| /fantasy/v2/league/{league\_key}/transactions;types=waiver,pending\_trade;team\_key= [{team\_key}](#team-resource) | Fetch all pending trades and waivers relevant to the particular team. | [https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions;types=waiver,pending\_trade;team\_key=461.l.1000.t.1](https://fantasysports.yahooapis.com/fantasy/v2/league/461.l.1000/transactions;types=waiver,pending_trade;team_key=461.l.1000.t.1) |

### Filters

The transactions collection can have filters such as the following to obtain a subset of a transactions collection that satisfy the filtering condition. These filters can be combined to obtain a more restricted list of transactions.

| Filter parameter | Filter parameter values | Usage |
| --- | --- | --- |
| type | add,drop,commish,trade | /transactions;type=add |
| types | Any valid types | /transactions;types=add,trade |
| team\_key | A [team\_key](#team-resource) within the league | /transactions;team\_key=461.l.1000.t.1 |
| type with team\_key | waiver,pending\_trade | You can only use these options when also providing the team\_key, ie /transactions;team\_key=461.l.1000.t.1;type=waiver |
| count | Number of items returned. Any integer greater than 0 | /transactions;count=5 |

### POST

Using POST, players can be added and/or dropped from a team, or trades can be proposed. The URI for POSTing to transactions collection is:

[https://fantasysports.yahooapis.com/fantasy/v2/league/{league\_key}/transactions](https://fantasysports.yahooapis.com/fantasy/v2/league/%7Bleague_key%7D/transactions)

#### Adding/Dropping Players

The input XML format for a POST request to the transactions API for adding a player is:

```xml

<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>{team_key}</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

The input XML format for a POST request to the transactions API for dropping a player is:

```xml

<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>{team_key}</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

The input XML format for a POST request to the transactions API for replacing one player with another player in a team is:

```xml

<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>{player_key}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>{team_key}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>{player_key}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>{team_key}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

You may also add players that are currently on waivers – the players will not be immediately added to your team, but rather, you will be returned back a waiver claim that will be processed at some point in the future. Various league rules will control in which conditions you will actually receive the player, in the case that multiple teams have placed waiver claims.

If you are placing a waiver claim in a league that uses FAAB, you may add that to the XML that you POST:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <faab_bid>25</faab_bid>
    <players>
      <player>
        <player_key>461.p.5484</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>461.l.1000.t.6</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>461.p.6327</player_key>
        <transaction_data>
          <type>drop</type>
          <destination_team_key>461.l.1000.t.6</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once you have a waiver claim transaction, you may also [edit the waiver priority or FAAB bid](#editing-waivers), or [cancel](#delete) the waiver entirely.

#### Proposing Trades

The input XML format for a POST request to the transactions API for proposing a trade is:

```xml

<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>pending_trade</type>
    <trader_team_key>461.l.1000.t.11</trader_team_key>
    <tradee_team_key>461.l.1000.t.4</tradee_team_key>
    <trade_note>Yo yo yo yo yo!!!</trade_note>
    <players>
      <player>
        <player_key>461.p.4130</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>461.l.1000.t.11</source_team_key>
          <destination_team_key>461.l.1000.t.4</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>461.p.2415</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>461.l.1000.t.4</source_team_key>
          <destination_team_key>461.l.1000.t.11</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once you have a pending trade transaction, you may [accept](#accepting-trades), [reject](#rejecting-trades), [allow/disallow](#allowing/disallowing-trades), or [vote against](#voting-against-trades) the trade (depending on which role you have in the league). You may also [cancel](#delete) the trade.

# User APIs

## User Resource

With the User API, you can retrieve fantasy information for a particular Yahoo! user. Most usefully, you can see which games a user is playing, and which leagues they belong to and teams that they own within those games. Because you can currently only view user information for the logged in user, you would generally want to use the [Users collection](#users-collection), passing along the use\_login flag, instead of trying to request a User resource directly from the URI.

- **HTTP Operations Supported:** GET

- **URIs**

- It is generally recommended that you instead use the [Users collection](#users-collection), passing along the use\_login flag.

### Sub-resources

_Default sub-resource:_ N/A

| Name | Description | URI | Sample |
| --- | --- | --- | --- |
| [games](#games-collection) | Fetch the [Games](#games-collection) in which the user has played. Additionally accepts flags is\_availableto only return available games. | /fantasy/v2/ [users](#users-collection);use\_login=1/games | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games) |
| [games](#games-collection)/ [leagues](#leagues-collection) | Fetch leagues that the user belongs to in one or more games. The leagues will be scoped to the user. This will throw an error if any of the specified games do not support league sub-resources. | /fantasy/v2/ [users](#users-collection);use\_login=1/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2}/leagues | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=461/leagues](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=461/leagues) |
| [games](#games-collection)/ [teams](#teams-collection) | Fetch teams owned by the user in one or more games. The teams will be scoped to the user. This will throw an error if any of the specified games do not support team sub-resources. | /fantasy/v2/ [users](#users-collection);use\_login=1/games;game\_keys= [{game\_key1}](#game-resource),{game\_key2}/teams | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1/games;game\_keys=461/teams](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=461/teams) |

## Users Collection

With the Users API, you can obtain information from a collection of users simultaneously. Each element beneath the Users collection will be a [User resource](#user-resource)

**HTTP Operations Supported**: GET

- Any [sub-resource](#sub-resources-8) valid for a user is a valid sub-resource under the users collection.

- Any sub-resource for a collection of users is extracted using a URI like the following: /users;use\_login=1/{sub\_resource}

- Multiple sub-resources can be extracted from users in the same URI using the following formatting:

- /users;use\_login=1;out={sub\_resource\_1},{sub\_resource\_2}

- /users;field={field\_name1},{field\_name2}

| URI | Description | Sample |
| --- | --- | --- |
| /fantasy/v2/users;use\_login=1 | Fetch user information of the logged-in user. | [https://fantasysports.yahooapis.com/fantasy/v2/users;use\_login=1](https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1) |
