/**
 * Formatting utilities for dates, keys, and other values
 * @module
 */

/**
 * Formats a date as YYYY-MM-DD
 *
 * @param date - Date to format
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date('2024-11-15T12:00:00Z')); // "2024-11-15"
 * formatDate(new Date()); // Current date in YYYY-MM-DD format
 * ```
 */
export function formatDate(date: Date): string {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD date string into a Date object
 *
 * @param dateString - Date string to parse
 * @returns Date object
 *
 * @example
 * ```typescript
 * parseDate('2024-11-15'); // Date object for Nov 15, 2024
 * ```
 */
export function parseDate(dateString: string): Date {
   return new Date(dateString);
}

/**
 * Gets today's date in YYYY-MM-DD format
 *
 * @returns Today's date
 *
 * @example
 * ```typescript
 * getToday(); // "2024-11-15" (if today is Nov 15, 2024)
 * ```
 */
export function getToday(): string {
   return formatDate(new Date());
}

/**
 * Extracts the game ID from a resource key
 *
 * @param key - Resource key (e.g., "423.l.12345")
 * @returns Game ID
 *
 * @example
 * ```typescript
 * extractGameId('423.l.12345'); // "423"
 * extractGameId('423.l.12345.t.1'); // "423"
 * ```
 */
export function extractGameId(key: string): string {
   return key.split('.')[0] ?? '';
}

/**
 * Extracts the resource type from a resource key
 *
 * @param key - Resource key (e.g., "423.l.12345")
 * @returns Resource type ('l', 't', 'p', etc.)
 *
 * @example
 * ```typescript
 * extractResourceType('423.l.12345'); // "l"
 * extractResourceType('423.l.12345.t.1'); // "l"
 * extractResourceType('423.p.8888'); // "p"
 * ```
 */
export function extractResourceType(key: string): string {
   return key.split('.')[1] ?? '';
}

/**
 * Extracts the resource ID from a resource key
 *
 * @param key - Resource key (e.g., "423.l.12345")
 * @returns Resource ID
 *
 * @example
 * ```typescript
 * extractResourceId('423.l.12345'); // "12345"
 * extractResourceId('423.p.8888'); // "8888"
 * ```
 */
export function extractResourceId(key: string): string {
   const parts = key.split('.');
   return parts[2] ?? '';
}

/**
 * Extracts the league key from a team key
 *
 * @param teamKey - Team key (e.g., "423.l.12345.t.1")
 * @returns League key
 *
 * @example
 * ```typescript
 * extractLeagueKey('423.l.12345.t.1'); // "423.l.12345"
 * ```
 */
export function extractLeagueKey(teamKey: string): string {
   const parts = teamKey.split('.');
   if (parts.length >= 3) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
   }
   return '';
}

/**
 * Builds a league key from game ID and league ID
 *
 * @param gameId - Game ID
 * @param leagueId - League ID
 * @returns League key
 *
 * @example
 * ```typescript
 * buildLeagueKey('423', '12345'); // "423.l.12345"
 * buildLeagueKey(423, 12345); // "423.l.12345"
 * ```
 */
export function buildLeagueKey(
   gameId: string | number,
   leagueId: string | number,
): string {
   return `${gameId}.l.${leagueId}`;
}

/**
 * Builds a team key from league key and team ID
 *
 * @param leagueKey - League key
 * @param teamId - Team ID
 * @returns Team key
 *
 * @example
 * ```typescript
 * buildTeamKey('423.l.12345', '1'); // "423.l.12345.t.1"
 * buildTeamKey('423.l.12345', 1); // "423.l.12345.t.1"
 * ```
 */
export function buildTeamKey(
   leagueKey: string,
   teamId: string | number,
): string {
   return `${leagueKey}.t.${teamId}`;
}

/**
 * Builds a player key from game ID and player ID
 *
 * @param gameId - Game ID
 * @param playerId - Player ID
 * @returns Player key
 *
 * @example
 * ```typescript
 * buildPlayerKey('423', '8888'); // "423.p.8888"
 * buildPlayerKey(423, 8888); // "423.p.8888"
 * ```
 */
export function buildPlayerKey(
   gameId: string | number,
   playerId: string | number,
): string {
   return `${gameId}.p.${playerId}`;
}

/**
 * Converts a string to URL-safe format
 *
 * @param str - String to encode
 * @returns URL-encoded string
 *
 * @example
 * ```typescript
 * urlEncode('My League Name'); // "My%20League%20Name"
 * ```
 */
export function urlEncode(str: string): string {
   return encodeURIComponent(str);
}

/**
 * Builds a query string from an object
 *
 * @param params - Object with query parameters
 * @returns Query string (without leading ?)
 *
 * @example
 * ```typescript
 * buildQueryString({ status: 'A', sort: 'PTS' }); // "status=A&sort=PTS"
 * buildQueryString({ start: 0, count: 25 }); // "start=0&count=25"
 * ```
 */
export function buildQueryString(
   params: Record<string, string | number | boolean | undefined>,
): string {
   const entries = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
         ([key, value]) => `${urlEncode(key)}=${urlEncode(String(value))}`,
      );

   return entries.join('&');
}

/**
 * Converts snake_case to camelCase
 *
 * @param str - String in snake_case
 * @returns String in camelCase
 *
 * @example
 * ```typescript
 * snakeToCamel('league_key'); // "leagueKey"
 * snakeToCamel('team_id'); // "teamId"
 * ```
 */
export function snakeToCamel(str: string): string {
   return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase to snake_case
 *
 * @param str - String in camelCase
 * @returns String in snake_case
 *
 * @example
 * ```typescript
 * camelToSnake('leagueKey'); // "league_key"
 * camelToSnake('teamId'); // "team_id"
 * ```
 */
export function camelToSnake(str: string): string {
   return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts an object's keys from snake_case to camelCase
 *
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 *
 * @example
 * ```typescript
 * keysToCamel({ league_key: '423.l.12345', team_id: 1 });
 * // { leagueKey: '423.l.12345', teamId: 1 }
 * ```
 */
export function keysToCamel<T extends Record<string, unknown>>(
   obj: T,
): Record<string, unknown> {
   const result: Record<string, unknown> = {};

   for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
         result[camelKey] = keysToCamel(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
         result[camelKey] = value.map((item) =>
            item && typeof item === 'object'
               ? keysToCamel(item as Record<string, unknown>)
               : item,
         );
      } else {
         result[camelKey] = value;
      }
   }

   return result;
}

/**
 * Converts an object's keys from camelCase to snake_case
 *
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 *
 * @example
 * ```typescript
 * keysToSnake({ leagueKey: '423.l.12345', teamId: 1 });
 * // { league_key: '423.l.12345', team_id: 1 }
 * ```
 */
export function keysToSnake<T extends Record<string, unknown>>(
   obj: T,
): Record<string, unknown> {
   const result: Record<string, unknown> = {};

   for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);

      if (value && typeof value === 'object' && !Array.isArray(value)) {
         result[snakeKey] = keysToSnake(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
         result[snakeKey] = value.map((item) =>
            item && typeof item === 'object'
               ? keysToSnake(item as Record<string, unknown>)
               : item,
         );
      } else {
         result[snakeKey] = value;
      }
   }

   return result;
}
