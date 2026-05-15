# Actionable Route Report

- Mode: all
- Routes selected: 96
- Routes passed: 77
- Routes failed: 19
- Routes skipped: 0
- Shape warnings: 0

## Failure Split

- Likely unsupported routes: 2
- Likely bad test parameters or fixtures: 17
- league_keys reprobe passed: 6
- league_keys reprobe still failed: 5
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
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/001-public-game-by-id-response.json)
- Request: request succeeded and returned data

#### public-game-by-code

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/002-public-game-by-code-response.json)
- Request: request succeeded and returned data

#### public-game-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/005-public-game-players-response.json)
- Request: request succeeded and returned data

#### public-game-weeks

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl/game_weeks
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/006-public-game-weeks-response.json)
- Request: request succeeded and returned data

#### public-game-out

- Status: route passed; shape passed
- Route: public / explicit
- Path: /game/nhl;out=players,game_weeks
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/007-public-game-out-response.json)
- Request: request succeeded and returned data

#### public-games-available

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;is_available=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/008-public-games-available-response.json)
- Request: request succeeded and returned data

#### public-games-metadata

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;is_available=1/metadata
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/009-public-games-metadata-response.json)
- Request: request succeeded and returned data

#### public-games-by-code-season

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/010-public-games-by-code-season-response.json)
- Request: request succeeded and returned data

#### public-games-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /games;game_keys=nhl/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/011-public-games-players-response.json)
- Request: request succeeded and returned data

#### public-league-metadata

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/035-public-league-metadata-response.json)
- Request: request succeeded and returned data

#### public-league-settings

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/settings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/036-public-league-settings-response.json)
- Request: request succeeded and returned data

#### public-league-standings

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/standings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/037-public-league-standings-response.json)
- Request: request succeeded and returned data

#### public-league-scoreboard

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/scoreboard;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/038-public-league-scoreboard-response.json)
- Request: request succeeded and returned data

#### public-league-teams

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/039-public-league-teams-response.json)
- Request: request succeeded and returned data

#### public-league-players

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/040-public-league-players-response.json)
- Request: request succeeded and returned data

#### public-league-transactions

- Status: route passed; shape passed
- Route: public / explicit
- Path: /league/465.l.121384/transactions;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/041-public-league-transactions-response.json)
- Request: request succeeded and returned data

#### private-users-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/042-private-users-root-response.json)
- Request: request succeeded and returned data

#### private-users-games

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/043-private-users-games-response.json)
- Request: request succeeded and returned data

#### private-users-games-filtered

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/044-private-users-games-filtered-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/045-private-users-games-leagues-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/046-private-users-games-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /users;use_login=1/games;game_keys=nhl;out=leagues,teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/047-private-users-games-out-response.json)
- Request: request succeeded and returned data

#### private-users-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/050-private-users-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/051-private-users-games-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/052-private-users-games-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-settings

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/settings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/053-private-users-games-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/teams/roster
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/054-private-users-games-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/055-private-league-metadata-response.json)
- Request: request succeeded and returned data

#### private-league-settings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/settings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/056-private-league-settings-response.json)
- Request: request succeeded and returned data

#### private-league-standings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/standings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/057-private-league-standings-response.json)
- Request: request succeeded and returned data

#### private-league-scoreboard

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/scoreboard;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/058-private-league-scoreboard-response.json)
- Request: request succeeded and returned data

#### private-league-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/059-private-league-teams-response.json)
- Request: request succeeded and returned data

#### private-league-players-status

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;status=FA;position=C;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/060-private-league-players-status-response.json)
- Request: request succeeded and returned data

#### private-league-players-search

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/061-private-league-players-search-response.json)
- Request: request succeeded and returned data

#### private-league-transactions

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/063-private-league-transactions-response.json)
- Request: request succeeded and returned data

#### private-league-transactions-filtered

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;type=waiver;team_key=465.l.30702.t.9;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/064-private-league-transactions-filtered-response.json)
- Request: request succeeded and returned data

#### private-league-transactions-types

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/transactions;types=add,trade;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/067-private-league-transactions-types-response.json)
- Request: request succeeded and returned data

#### private-league-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702;out=settings,standings,scoreboard
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/069-private-league-out-response.json)
- Request: request succeeded and returned data

#### private-leagues-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/070-private-leagues-root-response.json)
- Request: request succeeded and returned data

#### private-leagues-settings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/settings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/071-private-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-leagues-standings

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/standings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/072-private-leagues-standings-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/073-private-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-leagues-players

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/074-private-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-leagues-transactions

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/transactions;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/075-private-leagues-transactions-response.json)
- Request: request succeeded and returned data

#### private-leagues-scoreboard

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702/scoreboard;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/076-private-leagues-scoreboard-response.json)
- Request: request succeeded and returned data

#### private-leagues-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /leagues;league_keys=465.l.30702;out=settings,standings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/077-private-leagues-out-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/078-private-leagues-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/079-private-leagues-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-team-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/080-private-team-metadata-response.json)
- Request: request succeeded and returned data

#### private-team-roster

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/081-private-team-roster-response.json)
- Request: request succeeded and returned data

#### private-team-roster-players-week

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/082-private-team-roster-players-week-response.json)
- Request: request succeeded and returned data

#### private-team-roster-players-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/roster;date=2025-11-24/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/083-private-team-roster-players-date-response.json)
- Request: request succeeded and returned data

#### private-team-matchups

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/matchups;weeks=1,2
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/084-private-team-matchups-response.json)
- Request: request succeeded and returned data

#### private-team-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9/stats;type=season
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/085-private-team-stats-response.json)
- Request: request succeeded and returned data

#### private-team-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /team/465.l.30702.t.9;out=roster,stats,matchups
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/086-private-team-out-response.json)
- Request: request succeeded and returned data

#### private-teams-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/087-private-teams-root-response.json)
- Request: request succeeded and returned data

#### private-teams-roster

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/088-private-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-teams-roster-players

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/089-private-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-teams-matchups

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/matchups;weeks=1,2
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/090-private-teams-matchups-response.json)
- Request: request succeeded and returned data

#### private-teams-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/stats;type=season
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/091-private-teams-stats-response.json)
- Request: request succeeded and returned data

#### private-teams-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9;out=roster,stats
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/092-private-teams-out-response.json)
- Request: request succeeded and returned data

#### private-teams-roster-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/roster;date=2025-11-24/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/093-private-teams-roster-date-response.json)
- Request: request succeeded and returned data

#### private-teams-stats-date

- Status: route passed; shape passed
- Route: private / explicit
- Path: /teams;team_keys=465.l.30702.t.9/stats;type=date;date=2025-11-24
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/094-private-teams-stats-date-response.json)
- Request: request succeeded and returned data

#### private-player-metadata

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/095-private-player-metadata-response.json)
- Request: request succeeded and returned data

#### private-player-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/stats;type=season
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/096-private-player-stats-response.json)
- Request: request succeeded and returned data

#### private-player-ownership

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/097-private-player-ownership-response.json)
- Request: request succeeded and returned data

#### private-player-percent-owned

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431/percent_owned
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/098-private-player-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-player-out

- Status: route passed; shape passed
- Route: private / explicit
- Path: /player/nhl.p.5431;out=stats,ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/099-private-player-out-response.json)
- Request: request succeeded and returned data

#### private-players-root

- Status: route passed; shape passed
- Route: private / explicit
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/100-private-players-root-response.json)
- Request: request succeeded and returned data

#### private-players-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/stats
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/101-private-players-stats-response.json)
- Request: request succeeded and returned data

#### private-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/102-private-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/103-private-players-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/106-private-league-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/107-private-league-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-league-players-stats

- Status: route passed; shape passed
- Route: private / explicit
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/stats
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/108-private-league-players-stats-response.json)
- Request: request succeeded and returned data

#### private-league-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/109-private-league-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-league-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/110-private-league-players-percent-owned-response.json)
- Request: request succeeded and returned data

### league-keys-reprobe-passed

These routes initially failed with league ids expected, but the same path shape succeeded once league_keys was injected.

#### public-game-leagues

- Status: route failed; shape not run
- Route: public / explicit
- Path: /game/nhl/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/004-public-game-leagues-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /game/nhl/leagues;league_keys=465.l.121384
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/003-public-game-leagues-league-key-fallback-response.json)

#### public-games-leagues

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/013-public-games-leagues-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/012-public-games-leagues-league-key-fallback-response.json)

#### public-game-leagues-teams

- Status: route failed; shape not run
- Route: public / composed
- Path: /game/nhl/leagues/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/024-public-game-leagues-teams-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /game/nhl/leagues;league_keys=465.l.121384/teams
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/023-public-game-leagues-teams-league-key-fallback-response.json)

#### public-game-leagues-players

- Status: route failed; shape not run
- Route: public / composed
- Path: /game/nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/026-public-game-leagues-players-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /game/nhl/leagues;league_keys=465.l.121384/players;search=mcdavid;count=5
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/025-public-game-leagues-players-league-key-fallback-response.json)

#### public-game-leagues-transactions

- Status: route failed; shape not run
- Route: public / composed
- Path: /game/nhl/leagues/transactions;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/028-public-game-leagues-transactions-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /game/nhl/leagues;league_keys=465.l.121384/transactions;count=5
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/027-public-game-leagues-transactions-league-key-fallback-response.json)

#### public-games-leagues-teams

- Status: route failed; shape not run
- Route: public / composed
- Path: /games;game_codes=nhl;seasons=2025/leagues/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/030-public-games-leagues-teams-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384/teams
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/029-public-games-leagues-teams-league-key-fallback-response.json)

### league-keys-reprobe-failed

These routes still failed after injecting league_keys. Review the reprobe attempts before treating them as supported.

#### public-games-out

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025;out=leagues,players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/016-public-games-out-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_codes=nhl;seasons=2025;league_keys=465.l.121384;out=leagues,players
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/015-public-games-out-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_codes=nhl;seasons=2025;out=leagues,players;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/014-public-games-out-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_codes=nhl;seasons=2025;league_keys=465.l.121384;out=leagues,players
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/015-public-games-out-league-key-fallback-order-variant-error.json)

#### public-games-out-by-key

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_keys=nhl;out=leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/019-public-games-out-by-key-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/018-public-games-out-by-key-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_keys=nhl;out=leagues;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/017-public-games-out-by-key-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/018-public-games-out-by-key-league-key-fallback-order-variant-error.json)

#### public-games-out-by-key-players

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_keys=nhl;out=leagues,players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/022-public-games-out-by-key-players-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues,players
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/021-public-games-out-by-key-players-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_keys=nhl;out=leagues,players;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/020-public-games-out-by-key-players-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues,players
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/021-public-games-out-by-key-players-league-key-fallback-order-variant-error.json)

#### public-games-leagues-players

- Status: route failed; shape not run
- Route: public / composed
- Path: /games;game_codes=nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/032-public-games-leagues-players-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_codes=nhl/leagues;league_keys=465.l.121384/players;search=mcdavid;count=5
- Reprobe note: Bad Request: League key does not expected game key
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/031-public-games-leagues-players-league-key-fallback-error.json)

#### public-games-leagues-transactions

- Status: route failed; shape not run
- Route: public / composed
- Path: /games;game_codes=nhl/leagues/transactions;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/034-public-games-leagues-transactions-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_codes=nhl/leagues;league_keys=465.l.121384/transactions;count=5
- Reprobe note: Bad Request: League key does not expected game key
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/033-public-games-leagues-transactions-league-key-fallback-error.json)

### fix-test-parameters-and-rerun

Yahoo rejected the supplied ids or filters, so the route may still be real but the probe needs better concrete parameters.

#### private-league-players-sorted

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/players;status=FA;position=C;sort=PTS;sort_type=season;sort_season=2025;start=0;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/062-private-league-players-sorted-error.json)
- Request: Bad Request: Invalid sort type (PTS) for league 30702.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-by-keys

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/065-private-league-transactions-by-keys-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-out

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334;out=players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/066-private-league-transactions-out-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-players

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/068-private-league-transactions-players-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-transaction-metadata

- Status: route failed; shape not run
- Route: private / explicit
- Path: /transaction/465.l.30702.tr.1334
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/104-private-transaction-metadata-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1334 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-transaction-players

- Status: route failed; shape not run
- Route: private / explicit
- Path: /transaction/465.l.30702.tr.1334/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/105-private-transaction-players-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1334 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

### demote-or-remove

Yahoo explicitly rejected the route shape or subresource chain. Demote docs confidence or remove from the safe builder surface.

#### private-users-leagues

- Status: route failed; shape not run
- Route: private / composed
- Path: /users;use_login=1/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/048-private-users-leagues-error.json)
- Request: Bad Request: subresource leagues not supported
- Classification: likely unsupported route (high confidence)
- Why: Yahoo explicitly rejected the requested subresource chain.
- Next step: Treat this as a structural route failure unless the docs show a materially different path shape.

#### private-users-out-leagues

- Status: route failed; shape not run
- Route: private / composed
- Path: /users;use_login=1;out=leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/049-private-users-out-leagues-error.json)
- Request: Bad Request: subresource leagues not supported
- Classification: likely unsupported route (high confidence)
- Why: Yahoo explicitly rejected the requested subresource chain.
- Next step: Treat this as a structural route failure unless the docs show a materially different path shape.

## Decision Summary

- Structural failures likely unsupported by Yahoo: 2
- Failures likely caused by test parameters or stale fixtures: 17
- league_keys reprobes that validated the original path shape: 6
- league_keys reprobes that still failed after injection: 5
- Explicit failures to review for doc mismatch: 11
- Explicit failures that still need better parameters before judgment: 11
- Explicit failures that look structurally unsupported: 0
- Composed passes that may justify promotion into builder support: 13

### Explicit Parameter-Dependent Failures

#### league_keys reprobe passed

#### public-game-leagues

- Status: route failed; shape not run
- Route: public / explicit
- Path: /game/nhl/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/004-public-game-leagues-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /game/nhl/leagues;league_keys=465.l.121384
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/003-public-game-leagues-league-key-fallback-response.json)

#### public-games-leagues

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025/leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/013-public-games-leagues-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (high confidence)
- Why: The original path asked Yahoo for league ids, and the explicit league-key reprobe succeeded.
- Next step: Use concrete league keys for this family or treat the original game-to-leagues chain as a discovery-only probe.
- Reprobe: league-ids-expected -> passed
- Reprobe path: /games;game_codes=nhl;seasons=2025/leagues;league_keys=465.l.121384
- Reprobe note: league-key fallback succeeded and returned data
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/012-public-games-leagues-league-key-fallback-response.json)

#### league_keys reprobe still failed

#### public-games-out

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_codes=nhl;seasons=2025;out=leagues,players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/016-public-games-out-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_codes=nhl;seasons=2025;league_keys=465.l.121384;out=leagues,players
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/015-public-games-out-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_codes=nhl;seasons=2025;out=leagues,players;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/014-public-games-out-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_codes=nhl;seasons=2025;league_keys=465.l.121384;out=leagues,players
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/015-public-games-out-league-key-fallback-order-variant-error.json)

#### public-games-out-by-key

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_keys=nhl;out=leagues
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/019-public-games-out-by-key-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/018-public-games-out-by-key-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_keys=nhl;out=leagues;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/017-public-games-out-by-key-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/018-public-games-out-by-key-league-key-fallback-order-variant-error.json)

#### public-games-out-by-key-players

- Status: route failed; shape not run
- Route: public / explicit
- Path: /games;game_keys=nhl;out=leagues,players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/022-public-games-out-by-key-players-error.json)
- Request: Bad Request: league ids expected.
- Classification: likely invalid test parameters (medium confidence)
- Why: The original route needed league ids, and the explicit league-key reprobe still failed for a non-structural reason.
- Next step: Keep this route provisional and inspect the fallback dump to tighten the concrete league-key probe.
- Reprobe: league-ids-expected -> failed
- Reprobe path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues,players
- Reprobe note: Bad Request: league ids expected.
- Reprobe dump: [response file](tmp/2026-05-15T04-36-40-206Z/021-public-games-out-by-key-players-league-key-fallback-order-variant-error.json)
- Reprobe attempt (default): failed
- Reprobe attempt path: /games;game_keys=nhl;out=leagues,players;league_keys=465.l.121384
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/020-public-games-out-by-key-players-league-key-fallback-error.json)
- Reprobe attempt (parameter-order-variant): failed
- Reprobe attempt path: /games;game_keys=nhl;league_keys=465.l.121384;out=leagues,players
- Reprobe attempt note: Bad Request: league ids expected.
- Reprobe attempt dump: [response file](tmp/2026-05-15T04-36-40-206Z/021-public-games-out-by-key-players-league-key-fallback-order-variant-error.json)

#### No league_keys reprobe applied

#### private-league-players-sorted

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/players;status=FA;position=C;sort=PTS;sort_type=season;sort_season=2025;start=0;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/062-private-league-players-sorted-error.json)
- Request: Bad Request: Invalid sort type (PTS) for league 30702.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-by-keys

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/065-private-league-transactions-by-keys-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-out

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334;out=players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/066-private-league-transactions-out-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-league-transactions-players

- Status: route failed; shape not run
- Route: private / explicit
- Path: /league/465.l.30702/transactions;transaction_keys=465.l.30702.tr.1326,465.l.30702.tr.1334/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/068-private-league-transactions-players-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1326 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-transaction-metadata

- Status: route failed; shape not run
- Route: private / explicit
- Path: /transaction/465.l.30702.tr.1334
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/104-private-transaction-metadata-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1334 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.

#### private-transaction-players

- Status: route failed; shape not run
- Route: private / explicit
- Path: /transaction/465.l.30702.tr.1334/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/105-private-transaction-players-error.json)
- Request: Bad Request: Transaction ID 465.l.30702.tr.1334 does not exist.
- Classification: likely invalid test parameters (high confidence)
- Why: Yahoo rejected the supplied identifiers or filter parameters rather than the route shape itself.
- Next step: Keep the route provisional and rerun with valid concrete ids, transaction keys, or filter values.


### Composed Passes

#### private-users-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/050-private-users-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-teams

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/teams
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/051-private-users-games-leagues-teams-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/players;search=mcdavid;count=5
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/052-private-users-games-leagues-players-response.json)
- Request: request succeeded and returned data

#### private-users-games-leagues-settings

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/leagues/settings
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/053-private-users-games-leagues-settings-response.json)
- Request: request succeeded and returned data

#### private-users-games-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /users;use_login=1/games;game_keys=nhl/teams/roster
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/054-private-users-games-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/078-private-leagues-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-leagues-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /leagues;league_keys=465.l.30702/teams/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/079-private-leagues-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/102-private-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/103-private-players-percent-owned-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/106-private-league-teams-roster-response.json)
- Request: request succeeded and returned data

#### private-league-teams-roster-players

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/teams;team_keys=465.l.30702.t.9/roster;week=1/players
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/107-private-league-teams-roster-players-response.json)
- Request: request succeeded and returned data

#### private-league-players-ownership

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/ownership
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/109-private-league-players-ownership-response.json)
- Request: request succeeded and returned data

#### private-league-players-percent-owned

- Status: route passed; shape passed
- Route: private / composed
- Path: /league/465.l.30702/players;player_keys=nhl.p.8284,nhl.p.5431/percent_owned
- Dump: [response file](tmp/2026-05-15T04-36-40-206Z/110-private-league-players-percent-owned-response.json)
- Request: request succeeded and returned data
