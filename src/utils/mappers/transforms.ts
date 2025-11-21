/**
 * Reusable transform functions for field mapping
 *
 * These functions handle common type conversions needed when
 * transforming API responses (usually from XML parser)
 *
 * @module
 */

import {
   getBoolean,
   getInteger,
   getNumber,
   getString,
} from '../xmlParser.js';

/**
 * Transform string or number to integer
 *
 * @param value - Value that might be a number or string
 * @returns Parsed integer, or 0 if parsing fails
 */
export function toInteger(value: unknown): number {
   return getInteger(value);
}

/**
 * Transform value to boolean
 *
 * Handles Yahoo's "0"/"1" and "true"/"false" string formats
 *
 * @param value - Value that might be boolean, number, or string
 * @returns Parsed boolean, or false if parsing fails
 */
export function toBoolean(value: unknown): boolean {
   return getBoolean(value);
}

/**
 * Transform value to number (float)
 *
 * @param value - Value that might be a number or string
 * @returns Parsed number, or 0 if parsing fails
 */
export function toNumber(value: unknown): number {
   return getNumber(value);
}

/**
 * Transform value to string
 *
 * @param value - Value to convert to string
 * @returns String value, or empty string if null/undefined
 */
export function toStr(value: unknown): string {
   return getString(value);
}

/**
 * Conditional transform wrapper
 *
 * Applies transform only if value is not null/undefined.
 * Used for optional fields that need transformation.
 *
 * @template T - The return type of the transform function
 * @param transform - Function to apply if value exists
 * @param value - Value to potentially transform
 * @returns Transformed value or undefined if value was null/undefined
 *
 * @example
 * ```typescript
 * const mapping = {
 *   season: { apiName: 'season', transform: toInteger, required: true },
 *   byeWeek: {
 *     apiName: 'bye_week',
 *     transform: (val) => conditional(toInteger, val)
 *   },
 * };
 * ```
 */
export function conditional<T>(
   transform: (value: unknown) => T,
   value: unknown,
): T | undefined {
   if (value === null || value === undefined) {
      return undefined;
   }
   return transform(value);
}
