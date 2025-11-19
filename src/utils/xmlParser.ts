/**
 * XML parsing utilities for Yahoo Fantasy Sports API
 *
 * Yahoo's XML API returns cleaner, more consistent data than JSON:
 * - No numeric string keys ("0", "1", "2")
 * - No redundant wrapper objects
 * - Direct hierarchical structure
 * - 3.7x smaller response size
 *
 * @module
 */

import { XMLParser } from 'fast-xml-parser';

/**
 * Configured XML parser for Yahoo Fantasy Sports API
 *
 * Settings optimized for Yahoo's XML structure:
 * - Preserves attributes (e.g., count="7")
 * - Auto-converts numbers and booleans
 * - Removes namespace prefixes (yahoo:uri -> uri)
 * - Trims whitespace
 */
export const yahooXMLParser = new XMLParser({
   ignoreAttributes: false,
   attributeNamePrefix: '@_',
   textNodeName: '#text',
   parseTagValue: true, // Convert "1" to 1, "true" to true
   parseAttributeValue: true,
   trimValues: true,
   removeNSPrefix: true, // Remove "yahoo:" prefix
   numberParseOptions: {
      leadingZeros: false,
      hex: false,
      skipLike: /^\d+\.\w+\./, // Don't parse keys like "465.l.121384"
   },
});

/**
 * Ensures a value is an array
 *
 * XML parsers return arrays for multiple elements but single objects for one element.
 * This helper normalizes both cases to always return an array.
 *
 * @param value - Value that might be a single object, array, or undefined
 * @returns Array of values
 *
 * @example
 * ```typescript
 * // XML with multiple teams
 * <teams><team>...</team><team>...</team></teams>
 * // Parses to: { teams: { team: [{...}, {...}] } }
 * const teams = ensureArray(data.teams?.team); // [{...}, {...}]
 *
 * // XML with single team
 * <teams><team>...</team></teams>
 * // Parses to: { teams: { team: {...} } }
 * const teams = ensureArray(data.teams?.team); // [{...}]
 *
 * // XML with no teams
 * <teams/>
 * // Parses to: { teams: '' }
 * const teams = ensureArray(data.teams?.team); // []
 * ```
 */
export function ensureArray<T>(
   value: T | T[] | undefined | null | '',
): T[] {
   if (!value || value === '') return [];
   return Array.isArray(value) ? value : [value];
}

/**
 * Parses Yahoo Fantasy Sports API XML response
 *
 * Handles the fantasy_content wrapper and provides error handling.
 *
 * @param xml - Raw XML string from API
 * @returns Parsed data object
 * @throws {Error} If XML is invalid or missing fantasy_content wrapper
 *
 * @example
 * ```typescript
 * const xmlString = await response.text();
 * const data = parseYahooXML(xmlString);
 *
 * // Access league data
 * const league = data.league;
 * ```
 */
export function parseYahooXML<T = unknown>(xml: string): T {
   try {
      const parsed = yahooXMLParser.parse(xml);

      // Yahoo API wraps all responses in fantasy_content
      if (parsed.fantasy_content) {
         return parsed.fantasy_content as T;
      }

      // If no wrapper, might be an error response
      if (parsed.error) {
         throw new Error(
            `Yahoo API error: ${parsed.error.description || 'Unknown error'}`,
         );
      }

      throw new Error(
         'Invalid Yahoo API response: missing fantasy_content wrapper',
      );
   } catch (error) {
      if (error instanceof Error) {
         throw error;
      }
      throw new Error(`Failed to parse XML response: ${String(error)}`);
   }
}

/**
 * Safely gets a numeric value from XML data
 *
 * XML parsers may return numbers as strings if they contain special characters.
 * This helper ensures consistent numeric conversion.
 *
 * @param value - Value that might be a number or string
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default
 *
 * @example
 * ```typescript
 * const statId = getNumber(stat.stat_id, 0);
 * const points = getNumber(team.team_points.total, 0);
 * ```
 */
export function getNumber(value: unknown, defaultValue = 0): number {
   if (typeof value === 'number') return value;
   if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
   }
   return defaultValue;
}

/**
 * Safely gets an integer value from XML data
 *
 * @param value - Value that might be an integer or string
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer or default
 *
 * @example
 * ```typescript
 * const week = getInteger(scoreboard.week, 1);
 * const teamId = getInteger(team.team_id);
 * ```
 */
export function getInteger(value: unknown, defaultValue = 0): number {
   if (typeof value === 'number') return Math.floor(value);
   if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? defaultValue : parsed;
   }
   return defaultValue;
}

/**
 * Safely gets a boolean value from XML data
 *
 * Yahoo API returns booleans as "0"/"1" or "true"/"false" strings.
 *
 * @param value - Value that might be a boolean, number, or string
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed boolean or default
 *
 * @example
 * ```typescript
 * const isPlayoffs = getBoolean(matchup.is_playoffs);
 * const enabled = getBoolean(stat.enabled);
 * ```
 */
export function getBoolean(value: unknown, defaultValue = false): boolean {
   if (typeof value === 'boolean') return value;
   if (typeof value === 'number') return value !== 0;
   if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
   }
   return defaultValue;
}

/**
 * Safely gets a string value from XML data
 *
 * @param value - Value that might be a string or other type
 * @param defaultValue - Default value if undefined
 * @returns String value or default
 *
 * @example
 * ```typescript
 * const name = getString(team.name, 'Unknown');
 * const key = getString(league.league_key);
 * ```
 */
export function getString(value: unknown, defaultValue = ''): string {
   if (typeof value === 'string') return value;
   if (value === null || value === undefined) return defaultValue;
   return String(value);
}
