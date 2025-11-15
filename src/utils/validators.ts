/**
 * Validation utilities for input validation
 * @module
 */

import { ValidationError } from '../types/errors.js';
import type { GameCode } from '../types/common.js';

/**
 * Validates a resource key format
 *
 * Resource keys follow the format: {game_id}.{resource_type}.{id}
 * Examples:
 * - League: "423.l.12345"
 * - Team: "423.l.12345.t.1"
 * - Player: "423.p.8888"
 *
 * @param key - The resource key to validate
 * @param resourceType - Optional resource type to validate against ('l', 't', 'p', etc.)
 * @throws {ValidationError} If the key format is invalid
 *
 * @example
 * ```typescript
 * validateResourceKey('423.l.12345', 'l'); // Valid
 * validateResourceKey('invalid-key'); // Throws ValidationError
 * ```
 */
export function validateResourceKey(
   key: string,
   resourceType?: string,
): void {
   if (!key || typeof key !== 'string') {
      throw new ValidationError(
         'Resource key must be a non-empty string',
         'resourceKey',
         'string',
         key,
      );
   }

   const parts = key.split('.');

   if (parts.length < 3) {
      throw new ValidationError(
         `Invalid resource key format. Expected format: {game_id}.{resource_type}.{id}`,
         'resourceKey',
         '{game_id}.{resource_type}.{id}',
         key,
      );
   }

   const [gameId, type] = parts;

   // Validate game ID is numeric
   if (!/^\d+$/.test(gameId ?? '')) {
      throw new ValidationError(
         'Game ID must be numeric',
         'resourceKey.gameId',
         'numeric string',
         gameId,
      );
   }

   // Validate resource type if specified
   if (resourceType && type !== resourceType) {
      throw new ValidationError(
         `Expected resource type '${resourceType}' but got '${type}'`,
         'resourceKey.type',
         resourceType,
         type,
      );
   }
}

/**
 * Validates a league key format
 *
 * @param key - The league key to validate
 * @throws {ValidationError} If the key is not a valid league key
 *
 * @example
 * ```typescript
 * validateLeagueKey('423.l.12345'); // Valid
 * validateLeagueKey('423.t.1'); // Throws - not a league key
 * ```
 */
export function validateLeagueKey(key: string): void {
   validateResourceKey(key, 'l');
}

/**
 * Validates a team key format
 *
 * @param key - The team key to validate
 * @throws {ValidationError} If the key is not a valid team key
 *
 * @example
 * ```typescript
 * validateTeamKey('423.l.12345.t.1'); // Valid
 * validateTeamKey('423.l.12345'); // Throws - not a team key
 * ```
 */
export function validateTeamKey(key: string): void {
   if (!key || typeof key !== 'string') {
      throw new ValidationError(
         'Team key must be a non-empty string',
         'teamKey',
         'string',
         key,
      );
   }

   const parts = key.split('.');

   if (parts.length < 5) {
      throw new ValidationError(
         `Invalid team key format. Expected format: {game_id}.l.{league_id}.t.{team_id}`,
         'teamKey',
         '{game_id}.l.{league_id}.t.{team_id}',
         key,
      );
   }

   const [gameId, leagueType, , teamType] = parts;

   // Validate game ID is numeric
   if (!/^\d+$/.test(gameId ?? '')) {
      throw new ValidationError(
         'Game ID must be numeric',
         'teamKey.gameId',
         'numeric string',
         gameId,
      );
   }

   // Validate league type
   if (leagueType !== 'l') {
      throw new ValidationError(
         `Expected league type 'l' but got '${leagueType}'`,
         'teamKey.leagueType',
         'l',
         leagueType,
      );
   }

   // Validate team type
   if (teamType !== 't') {
      throw new ValidationError(
         `Expected team type 't' but got '${teamType}'`,
         'teamKey.teamType',
         't',
         teamType,
      );
   }
}

/**
 * Validates a player key format
 *
 * @param key - The player key to validate
 * @throws {ValidationError} If the key is not a valid player key
 *
 * @example
 * ```typescript
 * validatePlayerKey('423.p.8888'); // Valid
 * validatePlayerKey('423.l.12345'); // Throws - not a player key
 * ```
 */
export function validatePlayerKey(key: string): void {
   validateResourceKey(key, 'p');
}

/**
 * Validates a game code
 *
 * @param code - The game code to validate
 * @throws {ValidationError} If the code is not a valid game code
 *
 * @example
 * ```typescript
 * validateGameCode('nhl'); // Valid
 * validateGameCode('invalid'); // Throws
 * ```
 */
export function validateGameCode(code: string): void {
   const validCodes: GameCode[] = ['nfl', 'nhl', 'mlb', 'nba'];

   if (!validCodes.includes(code as GameCode)) {
      throw new ValidationError(
         `Invalid game code. Must be one of: ${validCodes.join(', ')}`,
         'gameCode',
         validCodes.join(' | '),
         code,
      );
   }
}

/**
 * Validates a date string in YYYY-MM-DD format
 *
 * @param date - The date string to validate
 * @param fieldName - Optional field name for error messages
 * @throws {ValidationError} If the date format is invalid
 *
 * @example
 * ```typescript
 * validateDate('2024-11-15'); // Valid
 * validateDate('2024-13-01'); // Throws - invalid month
 * validateDate('11/15/2024'); // Throws - wrong format
 * ```
 */
export function validateDate(date: string, fieldName = 'date'): void {
   if (!date || typeof date !== 'string') {
      throw new ValidationError(
         `${fieldName} must be a non-empty string`,
         fieldName,
         'string (YYYY-MM-DD)',
         date,
      );
   }

   const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

   if (!dateRegex.test(date)) {
      throw new ValidationError(
         `${fieldName} must be in YYYY-MM-DD format`,
         fieldName,
         'YYYY-MM-DD',
         date,
      );
   }

   // Validate it's a valid date
   const dateObj = new Date(date);
   if (Number.isNaN(dateObj.getTime())) {
      throw new ValidationError(
         `${fieldName} is not a valid date`,
         fieldName,
         'valid date in YYYY-MM-DD format',
         date,
      );
   }

   // Check if the string representation matches (catches invalid dates like 2024-13-01)
   const [year, month, day] = date.split('-');
   const reconstructed = `${year}-${month}-${day}`;
   if (reconstructed !== date) {
      throw new ValidationError(
         `${fieldName} contains invalid values`,
         fieldName,
         'valid date in YYYY-MM-DD format',
         date,
      );
   }
}

/**
 * Validates a week number for NFL
 *
 * @param week - The week number to validate
 * @throws {ValidationError} If the week is invalid
 *
 * @example
 * ```typescript
 * validateWeek(1); // Valid
 * validateWeek(18); // Valid
 * validateWeek(0); // Throws
 * validateWeek(20); // Throws
 * ```
 */
export function validateWeek(week: number): void {
   if (!Number.isInteger(week) || week < 1 || week > 18) {
      throw new ValidationError(
         'Week must be an integer between 1 and 18',
         'week',
         '1-18',
         week,
      );
   }
}

/**
 * Validates pagination parameters
 *
 * @param start - Starting index
 * @param count - Number of items
 * @throws {ValidationError} If parameters are invalid
 *
 * @example
 * ```typescript
 * validatePagination(0, 25); // Valid
 * validatePagination(-1, 25); // Throws
 * validatePagination(0, 0); // Throws
 * ```
 */
export function validatePagination(start?: number, count?: number): void {
   if (start !== undefined) {
      if (!Number.isInteger(start) || start < 0) {
         throw new ValidationError(
            'Start must be a non-negative integer',
            'start',
            'integer >= 0',
            start,
         );
      }
   }

   if (count !== undefined) {
      if (!Number.isInteger(count) || count < 1) {
         throw new ValidationError(
            'Count must be a positive integer',
            'count',
            'integer >= 1',
            count,
         );
      }
   }
}

/**
 * Validates that a required parameter is provided
 *
 * @param value - The value to check
 * @param fieldName - The field name for error messages
 * @throws {ValidationError} If the value is null or undefined
 *
 * @example
 * ```typescript
 * validateRequired('value', 'fieldName'); // Valid
 * validateRequired(null, 'fieldName'); // Throws
 * validateRequired(undefined, 'fieldName'); // Throws
 * ```
 */
export function validateRequired<T>(
   value: T | null | undefined,
   fieldName: string,
): asserts value is T {
   if (value === null || value === undefined) {
      throw new ValidationError(
         `${fieldName} is required`,
         fieldName,
         'non-null value',
         value,
      );
   }
}

/**
 * Validates that a value is one of a set of allowed values
 *
 * @param value - The value to check
 * @param allowedValues - Array of allowed values
 * @param fieldName - The field name for error messages
 * @throws {ValidationError} If the value is not in the allowed set
 *
 * @example
 * ```typescript
 * validateEnum('active', ['active', 'inactive'], 'status'); // Valid
 * validateEnum('pending', ['active', 'inactive'], 'status'); // Throws
 * ```
 */
export function validateEnum<T extends string>(
   value: string,
   allowedValues: readonly T[],
   fieldName: string,
): asserts value is T {
   if (!allowedValues.includes(value as T)) {
      throw new ValidationError(
         `${fieldName} must be one of: ${allowedValues.join(', ')}`,
         fieldName,
         allowedValues.join(' | '),
         value,
      );
   }
}
