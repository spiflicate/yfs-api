/**
 * XML parsing utilities for Yahoo Fantasy Sports API
 *
 * Yahoo's XML API returns cleaner, more consistent data than JSON:
 * - No numeric string keys ("0", "1", "2")
 * - No redundant wrapper objects
 * - Direct hierarchical structure
 * - 3.7x smaller response size
 *
 * ## Usage
 *
 * The main export is `parseYahooXML()`, which handles all Yahoo Fantasy Sports API
 * XML responses. It automatically:
 * - Parses the XML structure
 * - Unwraps the fantasy_content wrapper
 * - Detects and normalizes arrays (e.g., `teams.team` → `teams` as array)
 * - Handles error responses
 *
 * ```typescript
 * import { parseYahooXML } from './utils/xmlParser.js';
 *
 * const xmlString = await response.text();
 * const data = parseYahooXML(xmlString);
 *
 * // Arrays are automatically normalized - no need for ensureArray()
 * const teams = data.league.teams; // Always an array
 * const players = data.team.roster.players; // Always an array
 * ```
 *
 * @module
 */

import { XMLParser } from 'fast-xml-parser';
import { snakeToCamel } from './formatters';

/**
 * Configured XML parser for Yahoo Fantasy Sports API
 *
 * Settings optimized for Yahoo's XML structure:
 * - Preserves attributes (e.g., count="7")
 * - Auto-converts numbers and booleans
 * - Removes namespace prefixes (yahoo:uri -> uri)
 * - Trims whitespace
 */
const yahooXMLParser = new XMLParser({
   ignoreAttributes: true,
   textNodeName: '#text',
   parseTagValue: true, // Convert "1" to 1, "true" to true
   parseAttributeValue: true,
   trimValues: true,
   removeNSPrefix: true, // Remove "yahoo:" prefix
   tagValueProcessor: (tagName: string, tagValue: string) => {
      if (booleanProps.has(tagName)) {
         switch (tagValue) {
            case '1':
               return true;
            case '0':
               return false;
         }
         return undefined;
      }
      if (tagName === 'gameKey') {
         return undefined;
      }
      return tagValue;
   },
   transformTagName: (tagName: string) => snakeToCamel(tagName),
   numberParseOptions: {
      leadingZeros: false,
      hex: false,
   },
   ignoreDeclaration: true,
});

/**
 * Parses Yahoo Fantasy Sports API XML response with automatic array normalization
 *
 * This is the main parsing function that handles all Yahoo Fantasy Sports API XML responses.
 * It automatically:
 * - Parses the XML structure
 * - Unwraps the fantasy_content wrapper
 * - Detects and normalizes arrays (e.g., teams.team -> teams as array)
 * - Handles error responses
 *
 * @param xml - Raw XML string from API
 * @returns Parsed and normalized data object
 * @throws {Error} If XML is invalid or API returns an error
 *
 * @example
 * ```typescript
 * const xmlString = await response.text();
 * const data = parseYahooXML(xmlString);
 *
 * // Arrays are automatically normalized
 * const teams = data.league.teams; // Always an array, even with 1 team
 * const players = data.team.roster.players; // Always an array
 * ```
 */
export function parseYahooXML<T = unknown>(xml: string): T {
   try {
      const parsed = yahooXMLParser.parse(xml);

      // Yahoo API wraps all responses in fantasy_content
      if (!parsed.fantasyContent) {
         // Check for error response
         if (parsed.error) {
            throw new Error(
               `Yahoo API error: ${parsed.error.description || 'Unknown error'}`,
            );
         }
         throw new Error(
            'Invalid Yahoo API response: missing fantasy_content wrapper',
         );
      }

      const content = parsed.fantasyContent;

      // Normalize arrays throughout the data structure
      const normalized = normalizeArrays(content);

      return normalized as T;
   } catch (error) {
      if (error instanceof Error) {
         throw error;
      }
      throw new Error(`Failed to parse XML response: ${String(error)}`);
   }
}

/**
 * Ensures a value is an array
 *
 * XML parsers return arrays for multiple elements but single objects for one element.
 * This helper normalizes both cases to always return an array.
 *
 * @deprecated Arrays are now automatically normalized by parseYahooXML. Use direct property access instead.
 */
export function ensureArray<T>(
   value: T | T[] | undefined | null | '',
): T[] {
   if (!value || value === '') return [];
   return Array.isArray(value) ? value : [value];
}

/**
 * Identifies array patterns in raw XML by finding plural tags containing singular child elements
 *
 * Analyzes XML structure to detect patterns like:
 * - `<teams>` containing `<team>` elements
 * - `<players>` containing `<player>` elements
 * - `<managers>` containing `<manager>` elements
 *
 * This is more reliable than just checking for plural tag names, as it validates
 * the actual parent-child relationship in the XML structure.
 */
export function detectArrayPatterns(xml: string): Map<string, string> {
   const patterns = new Map<string, string>();

   // Find all opening tags and their first child tag
   // We look for: <container> followed by <child> (ignoring whitespace)
   const openTagPattern = /<([a-z_]+)(?:\s[^>]*)?>/gi;

   const matches = [...xml.matchAll(openTagPattern)];

   for (let i = 0; i < matches.length - 1; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      if (!currentMatch || !nextMatch) continue;

      const parentTag = currentMatch[1];
      const childTag = nextMatch[1];

      if (!parentTag || !childTag) continue;

      // Get the text between the two tags to ensure they're parent-child
      const startPos = (currentMatch.index || 0) + currentMatch[0].length;
      const endPos = nextMatch.index || 0;
      const betweenText = xml.substring(startPos, endPos).trim();

      // Only consider it a parent-child if there's minimal content between
      // (just whitespace or comments)
      if (betweenText.length < 100 && !betweenText.includes('<')) {
         // Check if parent is plural form of child
         if (isPluralOf(parentTag, childTag)) {
            patterns.set(parentTag, childTag);
         }
      }
   }

   return patterns;
}

/**
 * Checks if a parent tag name is the plural form of a child tag name
 *
 * Handles common pluralization patterns:
 * - Simple 's' suffix: team -> teams
 * - 'es' suffix: match -> matches
 * - 'ies' suffix: category -> categories
 *
 * @param parentTag - Potential plural tag name
 * @param childTag - Potential singular tag name
 * @returns true if parent appears to be plural of child
 *
 * @example
 * ```typescript
 * isPluralOf('teams', 'team')           // true
 * isPluralOf('matches', 'match')        // true
 * isPluralOf('categories', 'category')  // true
 * isPluralOf('status', 'statu')         // false
 * isPluralOf('settings', 'setting')     // true
 * ```
 */
function isPluralOf(parentTag: string, childTag: string): boolean {
   // Exact match with 's' suffix: teams -> team
   if (parentTag === `${childTag}s`) {
      return true;
   }

   // 'es' suffix: matches -> match, boxes -> box
   if (parentTag === `${childTag}es`) {
      return true;
   }

   // 'ies' suffix: categories -> category, entries -> entry
   if (
      parentTag.endsWith('ies') &&
      childTag.endsWith('y') &&
      parentTag.slice(0, -3) === childTag.slice(0, -1)
   ) {
      return true;
   }

   return false;
}

const booleanProps = new Set<string>([
   'allowAddToDlExtraPos',
   'enabled', //(stats league settings?)
   'draftTogether', //(league settings - must indicate online or offline drafting)
   // 'index-##', //(array of boolean indicators for weeks with qualifying number of days?)
   'onDisabledList',
   'sortOrder', //(stats.stat.sortOrder is this 1 or 0 to indicate asc or desc?)
   'tradeRejectTime', //(league settings - true false for if there a time period for rejecting?)
   'waiverTime',
   'hasDraftGrade',
   'hasMultiweekChampionship',
   'hasPlayerNotes',
   'hasPlayoffConsolationGames',
   'hasRecentPlayerNotes',
   'isAuctionDraft',
   'isCashLeague',
   'isComanager',
   'isCommissioner',
   'isCompositeStat',
   'isConsolation',
   'isEditable',
   'isFlex',
   'isGameOver',
   'isHighscore',
   'isLiveDraftLobbyActive',
   'isMatchupOfTheWeek',
   'isOffseason',
   'isPlayoffs',
   'isPlusLeague',
   'isPrescoring',
   'isProLeague',
   'isPubliclyViewable',
   'isRegistrationOver',
   'isStarting',
   'isStartingPosition',
   'isTied',
   'isUndroppable',
   'usesFaab',
   'usesLockEliminatedTeams',
   'usesMedianScore',
   'usesPlayoff',
   'usesPlayoffReseeding',
]);

const arrayMapping = new Map<string, string>([
   ['baseStats', 'baseStat'],
   ['gameWeeks', 'gameWeek'],
   ['games', 'game'],
   ['groups', 'group'],
   ['managers', 'manager'],
   ['matchups', 'matchup'],
   ['players', 'player'],
   ['positionTypes', 'positionType'],
   ['rosterPositions', 'rosterPosition'],
   ['statPositionTypes', 'statPositionType'],
   ['statWinners', 'statWinner'],
   ['stats', 'stat'],
   ['teamLogos', 'teamLogo'],
   ['teams', 'team'],
   ['transactions', 'transaction'],
]);

export function normalizeArrays(data: Record<string, unknown>) {
   // look for known plural keys
   // when found, make sure the object contains a single property matching the singular form
   // check if the singular form is an array, and parse to an array, and then replace the plural property with that array
   if (data && typeof data === 'object') {
      for (const [plural, singular] of arrayMapping) {
         if (
            Object.hasOwn(data, plural) &&
            data[plural] &&
            typeof data[plural] === 'object' &&
            Object.hasOwn(data[plural], singular) &&
            singular in data[plural]
         ) {
            const pluralValue = data[plural] as Record<string, unknown>;
            const singularValue = pluralValue[singular];
            if (Array.isArray(singularValue)) {
               data[plural] = singularValue;
            } else {
               data[plural] = [singularValue];
            }
         }
      }

      if ('weekHasEnoughQualifyingDays' in data) {
         const weekQualDays = data.weekHasEnoughQualifyingDays;
         const newWeekQualDays: Record<string, boolean> = {};
         if (
            weekQualDays &&
            typeof weekQualDays === 'object' &&
            !Array.isArray(weekQualDays)
         ) {
            for (const [key, value] of Object.entries(weekQualDays)) {
               const keyParts = key.split('-');
               const newKey = `week${keyParts[1]?.padStart(2, '0')}`;

               newWeekQualDays[newKey] = Boolean(value);
            }
            data.weekHasEnoughQualifyingDays = newWeekQualDays;
         }
      }

      // Recursively normalize nested objects
      for (const key of Object.keys(data)) {
         data[key] = normalizeArrays(data[key] as Record<string, unknown>);
      }
   }
   return data;
}
