# Yahoo Fantasy API Path Decision Tree

Choose the narrowest root that matches the information you already have.

```text
What do you know?
|
+- Only the authorized user
|  +- Games -> /users;use_login=1/games
|  +- Leagues -> /users;use_login=1/games/leagues
|  `- Teams -> /users;use_login=1/teams
|
+- A sport or season
|  +- Current game -> /game/{game_code}
|  +- Historical game -> /games;game_codes={code};seasons={season}
|  +- Players -> /game/{game_key}/players
|  `- Known leagues -> /game/{game_key}/leagues;league_keys={league_key}
|
+- A league key
|  +- Rules -> /league/{league_key}/settings
|  +- Standings -> /league/{league_key}/standings
|  +- Schedule and scores -> /league/{league_key}/scoreboard
|  +- Teams -> /league/{league_key}/teams
|  +- Player pool -> /league/{league_key}/players
|  +- Draft -> /league/{league_key}/draftresults
|  `- Moves and trades -> /league/{league_key}/transactions
|
+- A team key
|  +- Team record -> /team/{team_key}/standings
|  +- Stats -> /team/{team_key}/stats
|  +- Roster -> /team/{team_key}/roster
|  +- Drafted players -> /team/{team_key}/draftresults
|  `- Matchups -> /team/{team_key}/matchups
|
+- A player key
|  +- Identity -> /player/{player_key}
|  +- Stats -> /player/{player_key}/stats
|  +- Overall ownership rate -> /player/{player_key}/percent_owned
|  +- Draft trends -> /player/{player_key}/draft_analysis
|  `- League owner/status -> /league/{league_key}/players;player_keys={player_key}/ownership
|
`- A transaction key
   +- Details -> /transaction/{transaction_key}
   `- Involved players -> /transaction/{transaction_key}/players
```

## Fast Rules

- Start with `users` for "my" games or teams.
- Start with `game` or `games` for sport and season discovery.
- Start with `league` for scoring meaning, availability, standings, and transactions.
- Start with `team` for roster, matchup, and team result questions.
- Use a plural collection for multiple keys, discovery filters, or a scoped list such as league players.
- Add filters to the segment they constrain.
- Use `out` only for one unfiltered side expansion.
