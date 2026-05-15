/**
 * MLB-specific types for fantasy baseball
 * @module
 */

/**
 * Roster positions
 */
export type RosterPosition = string;

/**
 * Player positions
 */
export type PlayerPosition = string;

/**
 * Position type for roster requirements
 */
export type PositionType = string;

/**
 * Player injury status
 */
export type InjuryStatus = string;

/**
 * Stat IDs used by Yahoo
 */
export type StatId = keyof typeof StatIdMap;
export type StatName = (typeof StatIdMap)[keyof typeof StatIdMap]['name'];
export type StatAbbrev =
   (typeof StatIdMap)[keyof typeof StatIdMap]['abbrev'];

/**
 * Mapping of stat IDs to their names and abbreviations
 */
export const StatIdMap = {
   0: { name: 'StatName', abbrev: 'StatAbbrev' },
} as const;

export const StatEnum = Object.entries(StatIdMap).reduce(
   (acc, [id, { name, abbrev }]) => {
      acc[name] = Number(id);
      acc[abbrev] = Number(id);
      return acc;
   },
   {} as Record<
      (typeof StatIdMap)[keyof typeof StatIdMap]['name' | 'abbrev'],
      number
   >,
);

export const TeamKeyMappings = [
   {
      teamKey: '{game_code}.t.{team_id}',
      teamFullName: '',
      teamAbbr: '',
   },
];
