/**
 * NHL-specific types for fantasy hockey
 * @module
 */

/**
 * NHL roster positions
 */
export type RosterPosition =
   | 'C' // Center
   | 'LW' // Left Wing
   | 'RW' // Right Wing
   | 'D' // Defense
   | 'UTIL' // Utility
   | 'G' // Goalie
   | 'BN' // Bench
   | 'IR' // Injured Reserve
   | 'IR+'; // Injured Reserve Plus

/**
 * NHL player positions
 */
export type PlayerPosition =
   | 'C'
   | 'LW'
   | 'RW'
   | 'C,LW'
   | 'C,RW'
   | 'LW,RW'
   | 'C,LW,RW'
   | 'D'
   | 'G';

/**
 * NHL position type for player/stats categorization
 * This is used to differentiate between skaters and goalies
 */
export type NHLPositionType = 'P' | 'G';

/**
 * NHL player injury status
 */
export type NHLInjuryStatus =
   | 'IR'
   | 'IR-LT'
   | 'IR-NR'
   | 'DTD'
   | 'O'
   | 'SUSP'
   | 'NA'
   | '';

/**
 * NHL skater stat IDs used by Yahoo
 */
export type NHLSkaterStatId = keyof typeof NHLSkaterStatIdMap;
export type NHLSkaterStatName =
   (typeof NHLSkaterStatIdMap)[keyof typeof NHLSkaterStatIdMap]['name'];
export type NHLSkaterStatAbbrev =
   (typeof NHLSkaterStatIdMap)[keyof typeof NHLSkaterStatIdMap]['abbrev'];

export const NHLSkaterStatIdMap = {
   0: { name: 'GamesPlayed', abbrev: 'GP' },
   1: { name: 'Goals', abbrev: 'G' },
   2: { name: 'Assists', abbrev: 'A' },
   3: { name: 'Points', abbrev: 'P' },
   4: { name: 'PlusMinus', abbrev: '+/-' },
   5: { name: 'PenaltyMinutes', abbrev: 'PIM' },
   6: { name: 'PowerPlayGoals', abbrev: 'PPG' },
   7: { name: 'PowerPlayAssists', abbrev: 'PPA' },
   8: { name: 'PowerPlayPoints', abbrev: 'PPP' },
   9: { name: 'ShorthandedGoals', abbrev: 'SHG' },
   10: { name: 'ShorthandedAssists', abbrev: 'SHA' },
   11: { name: 'ShorthandedPoints', abbrev: 'SHP' },
   12: { name: 'GameWinningGoals', abbrev: 'GWG' },
   13: { name: 'Shots', abbrev: 'SOG' },
   14: { name: 'ShootingPercentage', abbrev: 'SH%' },
   15: { name: 'FaceoffsWon', abbrev: 'FOW' },
   16: { name: 'FaceoffsLost', abbrev: 'FOL' },
   17: { name: 'Hits', abbrev: 'HIT' },
   18: { name: 'Blocks', abbrev: 'BLK' },
} as const;

export const NHLSkaterStatEnum = Object.entries(NHLSkaterStatIdMap).reduce(
   (acc, [id, { name, abbrev }]) => {
      acc[name] = Number(id);
      acc[abbrev] = Number(id);
      return acc;
   },
   {} as Record<
      (typeof NHLSkaterStatIdMap)[keyof typeof NHLSkaterStatIdMap][
         | 'name'
         | 'abbrev'],
      number
   >,
);

/**
 * NHL goalie stat IDs used by Yahoo
 */
export type NHLGoalieStatId = keyof typeof NHLGoalieStatIdMap;
export type NHLGoalieStatName =
   (typeof NHLGoalieStatIdMap)[keyof typeof NHLGoalieStatIdMap]['name'];
export type NHLGoalieStatAbbrev =
   (typeof NHLGoalieStatIdMap)[keyof typeof NHLGoalieStatIdMap]['abbrev'];

export const NHLGoalieStatIdMap = {
   0: { name: 'GamesPlayed', abbrev: 'GP' },
   19: { name: 'GamesStarted', abbrev: 'GS' },
   20: { name: 'Wins', abbrev: 'W' },
   21: { name: 'Losses', abbrev: 'L' },
   22: { name: 'OvertimeLosses', abbrev: 'OTL' },
   23: { name: 'Shutouts', abbrev: 'SHO' },
   24: { name: 'GoalsAgainst', abbrev: 'GA' },
   25: { name: 'GoalsAgainstAverage', abbrev: 'GAA' },
   26: { name: 'Saves', abbrev: 'SV' },
   27: { name: 'SavePercentage', abbrev: 'SV%' },
   28: { name: 'ShotsAgainst', abbrev: 'SA' },
} as const;

export const NHLGoalieStatEnum = Object.entries(NHLGoalieStatIdMap).reduce(
   (acc, [id, { name, abbrev }]) => {
      acc[name] = Number(id);
      acc[abbrev] = Number(id);
      return acc;
   },
   {} as Record<
      (typeof NHLGoalieStatIdMap)[keyof typeof NHLGoalieStatIdMap][
         | 'name'
         | 'abbrev'],
      number
   >,
);

/**
 * All NHL stats (union of skater and goalie stats)
 */
export type NHLStat =
   | NHLSkaterStatName
   | NHLSkaterStatAbbrev
   | NHLGoalieStatName
   | NHLGoalieStatAbbrev;

export const TeamKeyMappings = {
   'nhl.t.19': {
      teamFullName: 'St. Louis Blues',
      teamAbbr: 'STL',
   },
   'nhl.t.17': {
      teamFullName: 'Colorado Avalanche',
      teamAbbr: 'COL',
   },
   'nhl.t.8': {
      teamFullName: 'Los Angeles Kings',
      teamAbbr: 'LA',
   },
   'nhl.t.23': {
      teamFullName: 'Washington Capitals',
      teamAbbr: 'WSH',
   },
   'nhl.t.16': {
      teamFullName: 'Pittsburgh Penguins',
      teamAbbr: 'PIT',
   },
   'nhl.t.30': {
      teamFullName: 'Minnesota Wild',
      teamAbbr: 'MIN',
   },
   'nhl.t.18': {
      teamFullName: 'San Jose Sharks',
      teamAbbr: 'SJ',
   },
   'nhl.t.7': {
      teamFullName: 'Carolina Hurricanes',
      teamAbbr: 'CAR',
   },
   'nhl.t.28': {
      teamFullName: 'Winnipeg Jets',
      teamAbbr: 'WPG',
   },
   'nhl.t.2': {
      teamFullName: 'Buffalo Sabres',
      teamAbbr: 'BUF',
   },
   'nhl.t.14': {
      teamFullName: 'Ottawa Senators',
      teamAbbr: 'OTT',
   },
   'nhl.t.12': {
      teamFullName: 'New York Islanders',
      teamAbbr: 'NYI',
   },
   'nhl.t.4': {
      teamFullName: 'Chicago Blackhawks',
      teamAbbr: 'CHI',
   },
   'nhl.t.13': {
      teamFullName: 'New York Rangers',
      teamAbbr: 'NYR',
   },
   'nhl.t.5': {
      teamFullName: 'Detroit Red Wings',
      teamAbbr: 'DET',
   },
   'nhl.t.20': {
      teamFullName: 'Tampa Bay Lightning',
      teamAbbr: 'TB',
   },
   'nhl.t.60': {
      teamFullName: 'Utah Mammoth',
      teamAbbr: 'UTA',
   },
   'nhl.t.21': {
      teamFullName: 'Toronto Maple Leafs',
      teamAbbr: 'TOR',
   },
   'nhl.t.3': {
      teamFullName: 'Calgary Flames',
      teamAbbr: 'CGY',
   },
   'nhl.t.29': {
      teamFullName: 'Columbus Blue Jackets',
      teamAbbr: 'CBJ',
   },
   'nhl.t.26': {
      teamFullName: 'Florida Panthers',
      teamAbbr: 'FLA',
   },
   'nhl.t.27': {
      teamFullName: 'Nashville Predators',
      teamAbbr: 'NSH',
   },
   'nhl.t.58': {
      teamFullName: 'Vegas Golden Knights',
      teamAbbr: 'VGK',
   },
   'nhl.t.22': {
      teamFullName: 'Vancouver Canucks',
      teamAbbr: 'VAN',
   },
   'nhl.t.59': {
      teamFullName: 'Seattle Kraken',
      teamAbbr: 'SEA',
   },
   'nhl.t.9': {
      teamFullName: 'Dallas Stars',
      teamAbbr: 'DAL',
   },
   'nhl.t.11': {
      teamFullName: 'New Jersey Devils',
      teamAbbr: 'NJ',
   },
   'nhl.t.15': {
      teamFullName: 'Philadelphia Flyers',
      teamAbbr: 'PHI',
   },
   'nhl.t.25': {
      teamFullName: 'Anaheim Ducks',
      teamAbbr: 'ANA',
   },
   'nhl.t.10': {
      teamFullName: 'Montreal Canadiens',
      teamAbbr: 'MTL',
   },
   'nhl.t.6': {
      teamFullName: 'Edmonton Oilers',
      teamAbbr: 'EDM',
   },
   'nhl.t.1': {
      teamFullName: 'Boston Bruins',
      teamAbbr: 'BOS',
   },
};

export type TeamKey = keyof typeof TeamKeyMappings;
