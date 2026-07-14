# Actionable Route Report

- Mode: all
- Invalid definitions included: no
- Routes selected: 84
- Invalid routes selected: 0
- Routes passed: 84
- Routes failed: 0
- Routes skipped: 0
- Shape warnings: 0

## Failure Split

- Likely unsupported routes: 0
- Likely bad test parameters or fixtures: 0
- league_keys reprobe passed: 0
- league_keys reprobe still failed: 0
- Auth or scope blockers: 0
- Empty-data probes: 0
- Unknown failures: 0

## Implementation Guidance

### keep-as-supported

Route succeeded live. Keep as supported in builder typing or docs.

#### public-game-by-id

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/465
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/001-public-game-by-id-response.json)
- Request: request succeeded and returned data

#### public-game-by-code

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/002-public-game-by-code-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/003-public-game-leagues-by-key-response.json)
- Request: request succeeded and returned data

#### public-game-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/004-public-game-players-response.json)
- Request: request succeeded and returned data

#### public-game-weeks

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl/game_weeks
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/005-public-game-weeks-response.json)
- Request: request succeeded and returned data

#### public-game-out

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl;out=players,game_weeks
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/006-public-game-out-response.json)
- Request: request succeeded and returned data

#### public-games-available

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;is_available=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/007-public-games-available-response.json)
- Request: request succeeded and returned data

#### public-games-metadata

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;is_available=1/metadata
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/008-public-games-metadata-response.json)
- Request: request succeeded and returned data

#### public-games-by-code-season

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/009-public-games-by-code-season-response.json)
- Request: request succeeded and returned data

#### public-games-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;game_keys=nhl/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/010-public-games-players-response.json)
- Request: request succeeded and returned data

#### public-games-leagues-by-key

- Status: route passed; shape passed
- Route: public / composed
- Path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/011-public-games-leagues-by-key-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-teams

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/012-public-game-leagues-by-key-teams-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-players

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/013-public-game-leagues-by-key-players-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-transactions

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/transactions;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/014-public-game-leagues-by-key-transactions-response.json)
- Request: request succeeded and returned data

#### public-games-leagues-by-key-teams

- Status: route passed; shape passed
- Route: public / composed
- Path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/015-public-games-leagues-by-key-teams-response.json)
- Request: request succeeded and returned data

#### public-league-metadata

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/016-public-league-metadata-response.json)
- Request: request succeeded and returned data

#### public-league-settings

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/settings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/017-public-league-settings-response.json)
- Request: request succeeded and returned data

#### public-league-standings

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/standings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/018-public-league-standings-response.json)
- Request: request succeeded and returned data

#### public-league-scoreboard

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/scoreboard;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/019-public-league-scoreboard-response.json)
- Request: request succeeded and returned data

#### public-league-teams

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/020-public-league-teams-response.json)
- Request: request succeeded and returned data

#### public-league-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/021-public-league-players-response.json)
- Request: request succeeded and returned data

#### public-league-transactions

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/transactions;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/022-public-league-transactions-response.json)
- Request: request succeeded and returned data

#### private-users-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/023-private-users-root-response.json)
- Request: request succeeded and returned data

#### private-users-games

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/024-private-users-games-response.json)
- Request: request succeeded and returned data

#### private-users-games-filtered

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/025-private-users-games-filtered-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl/leagues
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/026-private-users-games-leagues-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/027-private-users-games-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl;out=leagues,teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/028-private-users-games-out-response.json)
- Request: request succeeded and returned data

#### private-users-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/029-private-users-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/030-private-users-games-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/031-private-users-games-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-settings

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/settings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/032-private-users-games-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/teams/roster
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/033-private-users-games-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/034-private-league-metadata-response.json)
- Request: request succeeded and returned data

#### private-league-settings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/settings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/035-private-league-settings-response.json)
- Request: request succeeded and returned data

#### private-league-standings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/standings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/036-private-league-standings-response.json)
- Request: request succeeded and returned data

#### private-league-scoreboard

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/scoreboard;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/037-private-league-scoreboard-response.json)
- Request: request succeeded and returned data

#### private-league-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/038-private-league-teams-response.json)
- Request: request succeeded and returned data

#### private-league-players-status

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;status=FA;position=C;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/039-private-league-players-status-response.json)
- Request: request succeeded and returned data

#### private-league-players-search

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/040-private-league-players-search-response.json)
- Request: request succeeded and returned data

#### private-league-transactions

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/041-private-league-transactions-response.json)
- Request: request succeeded and returned data

#### private-league-transactions-filtered

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;type=waiver;team_key=465.l.30702.t.9;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/042-private-league-transactions-filtered-response.json)
- Request: request succeeded and returned data

#### private-league-transactions-types

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;types=add,trade;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/043-private-league-transactions-types-response.json)
- Request: request succeeded and returned data

#### private-league-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702;out=settings,standings,scoreboard
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/044-private-league-out-response.json)
- Request: request succeeded and returned data

#### private-leagues-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/045-private-leagues-root-response.json)
- Request: request succeeded and returned data

#### private-leagues-settings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/settings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/046-private-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-leagues-standings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/standings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/047-private-leagues-standings-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/048-private-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-leagues-players

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/049-private-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-leagues-transactions

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/transactions;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/050-private-leagues-transactions-response.json)
- Request: request succeeded and returned data

#### private-leagues-scoreboard

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/scoreboard;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/051-private-leagues-scoreboard-response.json)
- Request: request succeeded and returned data

#### private-leagues-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702;out=settings,standings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/052-private-leagues-out-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/053-private-leagues-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/054-private-leagues-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-team-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/055-private-team-metadata-response.json)
- Request: request succeeded and returned data

#### private-team-roster

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/056-private-team-roster-response.json)
- Request: request succeeded and returned data

#### private-team-roster-players-week

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/057-private-team-roster-players-week-response.json)
- Request: request succeeded and returned data

#### private-team-roster-players-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster;date=2025-11-24/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/058-private-team-roster-players-date-response.json)
- Request: request succeeded and returned data

#### private-team-matchups

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/matchups;weeks=1,2
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/059-private-team-matchups-response.json)
- Request: request succeeded and returned data

#### private-team-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/stats;type=season
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/060-private-team-stats-response.json)
- Request: request succeeded and returned data

#### private-team-stats-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9;out=standings,stats;type=date;date=2025-11-24
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/061-private-team-stats-date-response.json)
- Request: request succeeded and returned data

#### private-team-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9;out=roster,stats,matchups
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/062-private-team-out-response.json)
- Request: request succeeded and returned data

#### private-teams-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/063-private-teams-root-response.json)
- Request: request succeeded and returned data

#### private-teams-roster

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/064-private-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-teams-roster-players

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/065-private-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-teams-matchups

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/matchups;weeks=1,2
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/066-private-teams-matchups-response.json)
- Request: request succeeded and returned data

#### private-teams-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/stats;type=season
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/067-private-teams-stats-response.json)
- Request: request succeeded and returned data

#### private-teams-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9;out=roster,stats
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/068-private-teams-out-response.json)
- Request: request succeeded and returned data

#### private-teams-roster-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;date=2025-11-24/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/069-private-teams-roster-date-response.json)
- Request: request succeeded and returned data

#### private-teams-stats-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/stats;type=date;date=2025-11-24
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/070-private-teams-stats-date-response.json)
- Request: request succeeded and returned data

#### private-player-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/071-private-player-metadata-response.json)
- Request: request succeeded and returned data

#### private-player-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/stats;type=season
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/072-private-player-stats-response.json)
- Request: request succeeded and returned data

#### private-player-ownership

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/073-private-player-ownership-response.json)
- Request: request succeeded and returned data

#### private-player-percent-owned

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/percent_owned
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/074-private-player-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-player-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431;out=stats,ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/075-private-player-out-response.json)
- Request: request succeeded and returned data

#### private-players-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/076-private-players-root-response.json)
- Request: request succeeded and returned data

#### private-players-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/stats
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/077-private-players-stats-response.json)
- Request: request succeeded and returned data

#### private-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/078-private-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/079-private-players-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/080-private-league-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/081-private-league-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-league-players-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/stats
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/082-private-league-players-stats-response.json)
- Request: request succeeded and returned data

#### private-league-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/083-private-league-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-league-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/084-private-league-players-percent-owned-response.json)
- Request: request succeeded and returned data

## Decision Summary

- Structural failures likely unsupported by Yahoo: 0
- Failures likely caused by test parameters or stale fixtures: 0
- league_keys reprobes that validated the original path shape: 0
- league_keys reprobes that still failed after injection: 0
- Explicit failures to review for doc mismatch: 0
- Explicit failures that still need better parameters before judgment: 0
- Explicit failures that look structurally unsupported: 0
- Composed passes that may justify promotion into builder support: 19

### Composed Passes

#### public-game-leagues-by-key

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/003-public-game-leagues-by-key-response.json)
- Request: request succeeded and returned data

#### public-games-leagues-by-key

- Status: route passed; shape passed
- Route: public / composed
- Path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/011-public-games-leagues-by-key-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-teams

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/012-public-game-leagues-by-key-teams-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-players

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/013-public-game-leagues-by-key-players-response.json)
- Request: request succeeded and returned data

#### public-game-leagues-by-key-transactions

- Status: route passed; shape passed
- Route: public / composed
- Path: /game/nhl/leagues;league_keys=465.l.121384/transactions;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/014-public-game-leagues-by-key-transactions-response.json)
- Request: request succeeded and returned data

#### public-games-leagues-by-key-teams

- Status: route passed; shape passed
- Route: public / composed
- Path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/015-public-games-leagues-by-key-teams-response.json)
- Request: request succeeded and returned data

#### private-users-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/029-private-users-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/teams
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/030-private-users-games-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/031-private-users-games-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-settings

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/settings
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/032-private-users-games-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/teams/roster
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/033-private-users-games-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/053-private-leagues-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/054-private-leagues-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/078-private-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/079-private-players-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/080-private-league-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/081-private-league-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-league-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/083-private-league-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-league-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](api-path-validation/tmp/2026-05-22T03-20-09-307Z/084-private-league-players-percent-owned-response.json)
- Request: request succeeded and returned data
