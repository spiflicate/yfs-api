# Validated API Path Tree

This tree shows current positive evidence from the 2026-07-15 cross-sport run. A four-sport edge passed for NFL, MLB, NBA, and NHL with parser-shape checks where defined. NHL-only league edges use a configured public fixture and must not be generalized to other sports.

```mermaid
flowchart LR
    root["Yahoo Fantasy API"]

    root --> nfl["NFL 470 / 2026"]
    root --> mlb["MLB 469 / 2026"]
    root --> nba["NBA 466 / 2025"]
    root --> nhl["NHL 465 / 2025"]

    nfl --> gameSurface["Four-sport game surface"]
    mlb --> gameSurface
    nba --> gameSurface
    nhl --> gameSurface

    gameSurface --> metadata["metadata"]
    gameSurface --> players["players search"]
    gameSurface --> dates["dates"]
    gameSurface --> weeks["game_weeks"]
    gameSurface --> stats["stat_categories"]
    gameSurface --> positionTypes["position_types"]
    gameSurface --> rosterPositions["roster_positions"]
    gameSurface --> gameOut["out: stats + positions + weeks"]
    gameSurface --> gamesByCode["games by code"]
    gameSurface --> gamesBySeason["games by current season"]
    gameSurface --> gamesByKey["games by key"]
    gameSurface --> availableGames["available games by code"]
    gameSurface --> gamePlayersByKey["game players by key"]
    gameSurface --> playersByKey["root players by key"]

    nhl --> publicLeague["NHL public league fixture"]
    publicLeague --> gameLeague["game/leagues;league_keys=..."]
    gameLeague --> leagueTeams["teams"]
    gameLeague --> leaguePlayers["players"]
    publicLeague --> leagueMetadata["league metadata"]
    publicLeague --> leagueSettings["settings"]
    publicLeague --> leagueStandings["standings"]
    publicLeague --> leagueScoreboard["scoreboard"]
    publicLeague --> currentScoreboard["current scoreboard"]
    publicLeague --> leaguesByKey["root leagues by key"]
    publicLeague --> directLeagueTeams["league teams"]
    publicLeague --> leaguesTeams["keyed leagues / teams"]
    publicLeague --> teamsByKey["root teams by key"]
    publicLeague --> teamPlayers["team players"]
    publicLeague --> leagueDraft["draftresults"]
    publicLeague --> leagueTransactions["transactions"]
```

## Coverage Interpretation

- The common game surface has direct evidence in every supported draft-and-trade sport.
- `game_weeks` exists in all four sports, even though roster/stat coverage is weekly for NFL and date-based for MLB/NBA/NHL.
- League and deeper resource evidence is currently complete only for the configured NHL public fixture.
- Private historical evidence from the May 2026 NHL-only verifier remains useful context, but it is not represented as current cross-sport proof here.
- See [actionable-route-report.md](actionable-route-report.md) for sanitized paths, facts, and statuses. Detailed response artifacts remain in ignored local `tmp/` storage.
