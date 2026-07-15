# Cross-Sport Yahoo Route Report

- Run: 2026-07-15T19-33-25-809Z
- Sports: nfl, mlb, nba, nhl
- Mode: public
- Route IDs: all selected routes
- Source revision: 89980fd831978c5b0fada0ee848fc0e11ab38f46 + working tree changes
- Source fingerprint: sha256:5ed8734b495f37dbff80fcf926288e7e883fe3515e77c2ae80de20b6ac2df31c
- Non-sensitive profile fingerprint: sha256:136bbe2ec664892c2139c4578809cd85204b40d1cba46f30daa850b40c90fcb1
- Profile overrides: defaults only
- Bun: 1.3.14
- Strict shapes: true
- Require complete: false
- Include invalid: false
- Non-interactive auth: false
- Detailed artifacts: omitted from tracked summary
- Scenarios: 120
- Passed: 75
- Failed: 0
- Fixture unavailable: 45
- Expected rejection: 0
- Shape warnings: 0

## Sport Summary

| Sport | Passed | Failed | Fixture unavailable | Expected rejection | Shape warnings |
| --- | ---: | ---: | ---: | ---: | ---: |
| NFL | 15 | 0 | 15 | 0 | 0 |
| MLB | 15 | 0 | 15 | 0 | 0 |
| NBA | 15 | 0 | 15 | 0 | 0 |
| NHL | 30 | 0 | 0 | 0 | 0 |

## Discovery Facts

- **NFL public passed** `/game/nfl`: current game metadata discovered; gameKey=470; code=nfl; season=2026; gameName=Football
- **NFL public passed** `/game/nfl/players;search=mahomes;count=2`: public player fixtures discovered through observed game search behavior; gameKey=470; code=nfl; season=2026; week=11,6; gameName=Football
- **MLB public passed** `/game/mlb`: current game metadata discovered; gameKey=469; code=mlb; season=2026; gameName=Baseball
- **MLB public passed** `/game/mlb/players;search=judge;count=2`: public player fixtures discovered through observed game search behavior; gameKey=469; code=mlb; season=2026; gameName=Baseball
- **NBA public passed** `/game/nba`: current game metadata discovered; gameKey=466; code=nba; season=2025; gameName=Basketball
- **NBA public passed** `/game/nba/players;search=james;count=2`: public player fixtures discovered through observed game search behavior; gameKey=466; code=nba; season=2025; gameName=Basketball
- **NHL public passed** `/game/nhl`: current game metadata discovered; gameKey=465; code=nhl; season=2025; gameName=Hockey
- **NHL public passed** `/game/nhl/players;search=mcdavid;count=2`: public player fixtures discovered through observed game search behavior; gameKey=465; code=nhl; season=2025; gameName=Hockey
- **NHL public passed** `/league/{fixture_key}/teams`: public team fixtures discovered from configured league; season=2025; coverageType=week; rosterType=date; scoringType=headpoint

## NFL

### Game metadata by sport code

- ID: `nfl/game`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football
- Notes: request succeeded and returned data

### Game metadata child

- ID: `nfl/game-metadata`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/metadata`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football
- Notes: request succeeded and returned data

### Game player search

- ID: `nfl/game-players`
- Evidence: public / explicit / observed-only / public
- Status: passed; shape passed
- Path: `/game/nfl/players;search=mahomes;count=5`
- Facts: gameKey=470; code=nfl; season=2026; week=11,6; gameName=Football
- Notes: request succeeded and returned data

### Game players by key

- ID: `nfl/game-players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/players;player_keys={fixture_key},{fixture_key}`
- Facts: gameKey=470; code=nfl; season=2026; week=11,6; gameName=Football
- Notes: request succeeded and returned data

### Game dates

- ID: `nfl/game-dates`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/dates`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football; seasonStartDate=2026-09-09; seasonEndDate=2027-01-10
- Notes: request succeeded and returned data

### Game weeks

- ID: `nfl/game-weeks`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/game_weeks`
- Facts: gameKey=470; code=nfl; season=2026; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Football; gameWeeksCount=18
- Notes: request succeeded and returned data

### Game stat categories

- ID: `nfl/game-stat-categories`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/stat_categories`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football; statCategoriesCount=94
- Notes: request succeeded and returned data

### Game position types

- ID: `nfl/game-position-types`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/position_types`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football; positionTypesCount=5
- Notes: request succeeded and returned data

### Game roster positions

- ID: `nfl/game-roster-positions`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl/roster_positions`
- Facts: gameKey=470; code=nfl; season=2026; gameName=Football; rosterPositionsCount=21
- Notes: request succeeded and returned data

### Game out expansion

- ID: `nfl/game-out`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nfl;out=stat_categories,position_types,game_weeks`
- Facts: gameKey=470; code=nfl; season=2026; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Football; gameWeeksCount=18; statCategoriesCount=94; positionTypesCount=5
- Notes: request succeeded and returned data

### Games collection by sport code

- ID: `nfl/games-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nfl`
- Facts: gameKey=49,50,53,57,79,101,124,153,175,199 (sample, max 10); code=nfl; season=2002,1999,2000,2001,2003,2004,2005,2006,2007,2008 (sample, max 10)
- Notes: request succeeded and returned data

### Games collection by sport and season

- ID: `nfl/games-by-code-season`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nfl;seasons=2026`
- Facts: gameKey=470; code=nfl; season=2026
- Notes: request succeeded and returned data

### Games collection by key

- ID: `nfl/games-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_keys=470`
- Facts: gameKey=470; code=nfl; season=2026
- Notes: request succeeded and returned data

### Available games by sport code

- ID: `nfl/games-available-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nfl;is_available=1`
- Facts: gameKey=470; code=nfl; season=2026
- Notes: request succeeded and returned data

### Players collection by key

- ID: `nfl/players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/players;player_keys={fixture_key},{fixture_key}`
- Facts: week=11,6
- Notes: request succeeded and returned data

### Game league by key

- ID: `nfl/game-league-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league teams

- ID: `nfl/game-league-teams`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league players

- ID: `nfl/game-league-players`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league metadata

- ID: `nfl/league`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection by key

- ID: `nfl/leagues-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Public league settings

- ID: `nfl/league-settings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league standings

- ID: `nfl/league-standings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league scoreboard

- ID: `nfl/league-scoreboard`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league current scoreboard

- ID: `nfl/league-scoreboard-current`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league teams

- ID: `nfl/league-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection teams

- ID: `nfl/leagues-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Teams collection by key

- ID: `nfl/teams-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEYS
- Facts: none
- Notes: missing fixtures: TEAM_KEYS

### Public team players

- ID: `nfl/team-players`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEY
- Facts: none
- Notes: missing fixtures: TEAM_KEY

### Public league draft results

- ID: `nfl/league-draftresults`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league transactions

- ID: `nfl/league-transactions`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY


## MLB

### Game metadata by sport code

- ID: `mlb/game`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball
- Notes: request succeeded and returned data

### Game metadata child

- ID: `mlb/game-metadata`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/metadata`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball
- Notes: request succeeded and returned data

### Game player search

- ID: `mlb/game-players`
- Evidence: public / explicit / observed-only / public
- Status: passed; shape passed
- Path: `/game/mlb/players;search=judge;count=5`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball
- Notes: request succeeded and returned data

### Game players by key

- ID: `mlb/game-players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/players;player_keys={fixture_key},{fixture_key}`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball
- Notes: request succeeded and returned data

### Game dates

- ID: `mlb/game-dates`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/dates`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball; seasonStartDate=2026-03-25; seasonEndDate=2026-09-27
- Notes: request succeeded and returned data

### Game weeks

- ID: `mlb/game-weeks`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/game_weeks`
- Facts: gameKey=469; code=mlb; season=2026; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Baseball; gameWeeksCount=26
- Notes: request succeeded and returned data

### Game stat categories

- ID: `mlb/game-stat-categories`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/stat_categories`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball; statCategoriesCount=92
- Notes: request succeeded and returned data

### Game position types

- ID: `mlb/game-position-types`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/position_types`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball; positionTypesCount=2
- Notes: request succeeded and returned data

### Game roster positions

- ID: `mlb/game-roster-positions`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb/roster_positions`
- Facts: gameKey=469; code=mlb; season=2026; gameName=Baseball; rosterPositionsCount=19
- Notes: request succeeded and returned data

### Game out expansion

- ID: `mlb/game-out`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/mlb;out=stat_categories,position_types,game_weeks`
- Facts: gameKey=469; code=mlb; season=2026; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Baseball; gameWeeksCount=26; statCategoriesCount=92; positionTypesCount=2
- Notes: request succeeded and returned data

### Games collection by sport code

- ID: `mlb/games-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=mlb`
- Facts: gameKey=10,11,12,39,74,98,113,147,171,195 (sample, max 10); code=mlb; season=1999,2000,2001,2002,2003,2004,2005,2006,2007,2008 (sample, max 10)
- Notes: request succeeded and returned data

### Games collection by sport and season

- ID: `mlb/games-by-code-season`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=mlb;seasons=2026`
- Facts: gameKey=469; code=mlb; season=2026
- Notes: request succeeded and returned data

### Games collection by key

- ID: `mlb/games-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_keys=469`
- Facts: gameKey=469; code=mlb; season=2026
- Notes: request succeeded and returned data

### Available games by sport code

- ID: `mlb/games-available-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=mlb;is_available=1`
- Facts: gameKey=469; code=mlb; season=2026
- Notes: request succeeded and returned data

### Players collection by key

- ID: `mlb/players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/players;player_keys={fixture_key},{fixture_key}`
- Facts: none
- Notes: request succeeded and returned data

### Game league by key

- ID: `mlb/game-league-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league teams

- ID: `mlb/game-league-teams`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league players

- ID: `mlb/game-league-players`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league metadata

- ID: `mlb/league`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection by key

- ID: `mlb/leagues-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Public league settings

- ID: `mlb/league-settings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league standings

- ID: `mlb/league-standings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league scoreboard

- ID: `mlb/league-scoreboard`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league current scoreboard

- ID: `mlb/league-scoreboard-current`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league teams

- ID: `mlb/league-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection teams

- ID: `mlb/leagues-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Teams collection by key

- ID: `mlb/teams-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEYS
- Facts: none
- Notes: missing fixtures: TEAM_KEYS

### Public team players

- ID: `mlb/team-players`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEY
- Facts: none
- Notes: missing fixtures: TEAM_KEY

### Public league draft results

- ID: `mlb/league-draftresults`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league transactions

- ID: `mlb/league-transactions`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY


## NBA

### Game metadata by sport code

- ID: `nba/game`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball
- Notes: request succeeded and returned data

### Game metadata child

- ID: `nba/game-metadata`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/metadata`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball
- Notes: request succeeded and returned data

### Game player search

- ID: `nba/game-players`
- Evidence: public / explicit / observed-only / public
- Status: passed; shape passed
- Path: `/game/nba/players;search=james;count=5`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball
- Notes: request succeeded and returned data

### Game players by key

- ID: `nba/game-players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/players;player_keys={fixture_key},{fixture_key}`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball
- Notes: request succeeded and returned data

### Game dates

- ID: `nba/game-dates`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/dates`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball; seasonStartDate=2025-10-21; seasonEndDate=2026-04-12
- Notes: request succeeded and returned data

### Game weeks

- ID: `nba/game-weeks`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/game_weeks`
- Facts: gameKey=466; code=nba; season=2025; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Basketball; gameWeeksCount=24
- Notes: request succeeded and returned data

### Game stat categories

- ID: `nba/game-stat-categories`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/stat_categories`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball; statCategoriesCount=29
- Notes: request succeeded and returned data

### Game position types

- ID: `nba/game-position-types`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/position_types`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball; positionTypesCount=1
- Notes: request succeeded and returned data

### Game roster positions

- ID: `nba/game-roster-positions`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba/roster_positions`
- Facts: gameKey=466; code=nba; season=2025; gameName=Basketball; rosterPositionsCount=12
- Notes: request succeeded and returned data

### Game out expansion

- ID: `nba/game-out`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nba;out=stat_categories,position_types,game_weeks`
- Facts: gameKey=466; code=nba; season=2025; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Basketball; gameWeeksCount=24; statCategoriesCount=29; positionTypesCount=1
- Notes: request succeeded and returned data

### Games collection by sport code

- ID: `nba/games-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nba`
- Facts: gameKey=16,22,26,67,95,112,131,165,187,211 (sample, max 10); code=nba; season=2001,1999,2000,2002,2003,2004,2005,2006,2007,2008 (sample, max 10)
- Notes: request succeeded and returned data

### Games collection by sport and season

- ID: `nba/games-by-code-season`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nba;seasons=2025`
- Facts: gameKey=466; code=nba; season=2025
- Notes: request succeeded and returned data

### Games collection by key

- ID: `nba/games-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_keys=466`
- Facts: gameKey=466; code=nba; season=2025
- Notes: request succeeded and returned data

### Available games by sport code

- ID: `nba/games-available-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nba;is_available=1`
- Facts: gameKey=466; code=nba; season=2025
- Notes: request succeeded and returned data

### Players collection by key

- ID: `nba/players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/players;player_keys={fixture_key},{fixture_key}`
- Facts: none
- Notes: request succeeded and returned data

### Game league by key

- ID: `nba/game-league-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league teams

- ID: `nba/game-league-teams`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Game league players

- ID: `nba/game-league-players`
- Evidence: public / composed / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league metadata

- ID: `nba/league`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection by key

- ID: `nba/leagues-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Public league settings

- ID: `nba/league-settings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league standings

- ID: `nba/league-standings`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league scoreboard

- ID: `nba/league-scoreboard`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league current scoreboard

- ID: `nba/league-scoreboard-current`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league teams

- ID: `nba/league-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Leagues collection teams

- ID: `nba/leagues-teams`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEYS
- Facts: none
- Notes: missing fixtures: LEAGUE_KEYS

### Teams collection by key

- ID: `nba/teams-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEYS
- Facts: none
- Notes: missing fixtures: TEAM_KEYS

### Public team players

- ID: `nba/team-players`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: TEAM_KEY
- Facts: none
- Notes: missing fixtures: TEAM_KEY

### Public league draft results

- ID: `nba/league-draftresults`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY

### Public league transactions

- ID: `nba/league-transactions`
- Evidence: public / explicit / documented-claim / public
- Status: fixture-unavailable; shape not-run
- Missing fixtures: LEAGUE_KEY
- Facts: none
- Notes: missing fixtures: LEAGUE_KEY


## NHL

### Game metadata by sport code

- ID: `nhl/game`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Game metadata child

- ID: `nhl/game-metadata`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/metadata`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Game player search

- ID: `nhl/game-players`
- Evidence: public / explicit / observed-only / public
- Status: passed; shape passed
- Path: `/game/nhl/players;search=mcdavid;count=5`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Game players by key

- ID: `nhl/game-players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/players;player_keys={fixture_key},{fixture_key}`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Game dates

- ID: `nhl/game-dates`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/dates`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey; seasonStartDate=2025-10-07; seasonEndDate=2026-04-16
- Notes: request succeeded and returned data

### Game weeks

- ID: `nhl/game-weeks`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/game_weeks`
- Facts: gameKey=465; code=nhl; season=2025; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Hockey; gameWeeksCount=24
- Notes: request succeeded and returned data

### Game stat categories

- ID: `nhl/game-stat-categories`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/stat_categories`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey; statCategoriesCount=35
- Notes: request succeeded and returned data

### Game position types

- ID: `nhl/game-position-types`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/position_types`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey; positionTypesCount=2
- Notes: request succeeded and returned data

### Game roster positions

- ID: `nhl/game-roster-positions`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/roster_positions`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey; rosterPositionsCount=12
- Notes: request succeeded and returned data

### Game out expansion

- ID: `nhl/game-out`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl;out=stat_categories,position_types,game_weeks`
- Facts: gameKey=465; code=nhl; season=2025; week=1,2,3,4,5,6,7,8,9,10 (sample, max 10); gameName=Hockey; gameWeeksCount=24; statCategoriesCount=35; positionTypesCount=2
- Notes: request succeeded and returned data

### Games collection by sport code

- ID: `nhl/games-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nhl`
- Facts: gameKey=15,61,64,94,111,130,164,186,210,233 (sample, max 10); code=nhl; season=2001,2000,2002,2003,2004,2005,2006,2007,2008,2009 (sample, max 10)
- Notes: request succeeded and returned data

### Games collection by sport and season

- ID: `nhl/games-by-code-season`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nhl;seasons=2025`
- Facts: gameKey=465; code=nhl; season=2025
- Notes: request succeeded and returned data

### Games collection by key

- ID: `nhl/games-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_keys=465`
- Facts: gameKey=465; code=nhl; season=2025
- Notes: request succeeded and returned data

### Available games by sport code

- ID: `nhl/games-available-by-code`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/games;game_codes=nhl;is_available=1`
- Facts: gameKey=465; code=nhl; season=2025
- Notes: request succeeded and returned data

### Players collection by key

- ID: `nhl/players-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/players;player_keys={fixture_key},{fixture_key}`
- Facts: none
- Notes: request succeeded and returned data

### Game league by key

- ID: `nhl/game-league-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/leagues;league_keys={fixture_key}`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Game league teams

- ID: `nhl/game-league-teams`
- Evidence: public / composed / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/leagues;league_keys={fixture_key}/teams`
- Facts: gameKey=465; code=nhl; season=2025; coverageType=week; gameName=Hockey
- Notes: request succeeded and returned data

### Game league players

- ID: `nhl/game-league-players`
- Evidence: public / composed / documented-claim / public
- Status: passed; shape passed
- Path: `/game/nhl/leagues;league_keys={fixture_key}/players;search=mcdavid;count=5`
- Facts: gameKey=465; code=nhl; season=2025; gameName=Hockey
- Notes: request succeeded and returned data

### Public league metadata

- ID: `nhl/league`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}`
- Facts: season=2025; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Leagues collection by key

- ID: `nhl/leagues-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/leagues;league_keys={fixture_key}`
- Facts: season=2025
- Notes: request succeeded and returned data

### Public league settings

- ID: `nhl/league-settings`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/settings`
- Facts: season=2025; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Public league standings

- ID: `nhl/league-standings`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/standings`
- Facts: season=2025; coverageType=week,season; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Public league scoreboard

- ID: `nhl/league-scoreboard`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/scoreboard;week=1`
- Facts: season=2025; week=1; coverageType=week; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Public league current scoreboard

- ID: `nhl/league-scoreboard-current`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/scoreboard`
- Facts: season=2025; week=23; coverageType=week; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Public league teams

- ID: `nhl/league-teams`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/teams`
- Facts: season=2025; coverageType=week; rosterType=date; scoringType=headpoint
- Notes: request succeeded and returned data

### Leagues collection teams

- ID: `nhl/leagues-teams`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/leagues;league_keys={fixture_key}/teams`
- Facts: season=2025; coverageType=week
- Notes: request succeeded and returned data

### Teams collection by key

- ID: `nhl/teams-by-key`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/teams;team_keys={fixture_key},{fixture_key}`
- Facts: coverageType=week
- Notes: request succeeded and returned data

### Public team players

- ID: `nhl/team-players`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/team/{fixture_key}/players`
- Facts: coverageType=week
- Notes: request succeeded and returned data

### Public league draft results

- ID: `nhl/league-draftresults`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/draftresults`
- Facts: season=2025; rosterType=date; scoringType=headpoint; draftResultsCount=252
- Notes: request succeeded and returned data

### Public league transactions

- ID: `nhl/league-transactions`
- Evidence: public / explicit / documented-claim / public
- Status: passed; shape passed
- Path: `/league/{fixture_key}/transactions;count=5`
- Facts: season=2025; rosterType=date; scoringType=headpoint; transactionsCount=5
- Notes: request succeeded and returned data
