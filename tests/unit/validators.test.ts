/**
 * Unit tests for validator utilities
 */

import { describe, expect, test } from 'bun:test';
import { ValidationError } from '../../src/types/errors.js';
import {
   validateDate,
   validateEnum,
   validateGameCode,
   validateLeagueKey,
   validatePagination,
   validatePlayerKey,
   validateRequired,
   validateResourceKey,
   validateTeamKey,
   validateWeek,
} from '../../src/utils/validators.js';

describe('validators', () => {
   describe('validateResourceKey', () => {
      test('should accept valid resource keys', () => {
         expect(() => validateResourceKey('423.l.12345')).not.toThrow();
         expect(() => validateResourceKey('423.l.12345.t.1')).not.toThrow();
         expect(() => validateResourceKey('423.p.8888')).not.toThrow();
      });

      test('should reject empty or non-string keys', () => {
         expect(() => validateResourceKey('')).toThrow(ValidationError);
         expect(() => validateResourceKey(null as any)).toThrow(
            ValidationError,
         );
         expect(() => validateResourceKey(undefined as any)).toThrow(
            ValidationError,
         );
         expect(() => validateResourceKey(123 as any)).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with insufficient parts', () => {
         expect(() => validateResourceKey('invalid')).toThrow(
            ValidationError,
         );
         expect(() => validateResourceKey('423.l')).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with non-numeric game ID', () => {
         expect(() => validateResourceKey('abc.l.123')).toThrow(
            ValidationError,
         );
         expect(() => validateResourceKey('nfl.l.12345')).toThrow(
            ValidationError,
         );
      });

      test('should validate resource type when specified', () => {
         expect(() =>
            validateResourceKey('423.l.12345', 'l'),
         ).not.toThrow();
         expect(() => validateResourceKey('423.l.12345', 't')).toThrow(
            ValidationError,
         );
      });
   });

   describe('validateLeagueKey', () => {
      test('should accept valid league keys', () => {
         expect(() => validateLeagueKey('423.l.12345')).not.toThrow();
      });

      test('should reject non-league keys', () => {
         expect(() => validateLeagueKey('423.t.1')).toThrow(
            ValidationError,
         );
         expect(() => validateLeagueKey('423.p.8888')).toThrow(
            ValidationError,
         );
      });
   });

   describe('validateTeamKey', () => {
      test('should accept valid team keys', () => {
         expect(() => validateTeamKey('423.l.12345.t.1')).not.toThrow();
      });

      test('should reject empty or non-string keys', () => {
         expect(() => validateTeamKey('')).toThrow(ValidationError);
         expect(() => validateTeamKey(null as any)).toThrow(
            ValidationError,
         );
         expect(() => validateTeamKey(undefined as any)).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with insufficient parts', () => {
         expect(() => validateTeamKey('423.l.12345')).toThrow(
            ValidationError,
         );
         expect(() => validateTeamKey('423.l.12345.t')).toThrow(
            ValidationError,
         );
      });

      test('should reject non-team keys', () => {
         expect(() => validateTeamKey('423.p.8888')).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with non-numeric game ID', () => {
         expect(() => validateTeamKey('abc.l.12345.t.1')).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with wrong league type', () => {
         expect(() => validateTeamKey('423.p.12345.t.1')).toThrow(
            ValidationError,
         );
      });

      test('should reject keys with wrong team type', () => {
         expect(() => validateTeamKey('423.l.12345.p.1')).toThrow(
            ValidationError,
         );
      });
   });

   describe('validatePlayerKey', () => {
      test('should accept valid player keys', () => {
         expect(() => validatePlayerKey('423.p.8888')).not.toThrow();
      });

      test('should reject non-player keys', () => {
         expect(() => validatePlayerKey('423.l.12345')).toThrow(
            ValidationError,
         );
         expect(() => validatePlayerKey('423.t.1')).toThrow(
            ValidationError,
         );
      });
   });

   describe('validateGameCode', () => {
      test('should accept valid game codes', () => {
         expect(() => validateGameCode('nfl')).not.toThrow();
         expect(() => validateGameCode('nhl')).not.toThrow();
         expect(() => validateGameCode('mlb')).not.toThrow();
         expect(() => validateGameCode('nba')).not.toThrow();
      });

      test('should reject invalid game codes', () => {
         expect(() => validateGameCode('invalid')).toThrow(ValidationError);
         expect(() => validateGameCode('NFL')).toThrow(ValidationError);
      });
   });

   describe('validateDate', () => {
      test('should accept valid dates', () => {
         expect(() => validateDate('2024-11-15')).not.toThrow();
         expect(() => validateDate('2024-01-01')).not.toThrow();
         expect(() => validateDate('2024-12-31')).not.toThrow();
      });

      test('should reject empty or non-string dates', () => {
         expect(() => validateDate('')).toThrow(ValidationError);
         expect(() => validateDate(null as any)).toThrow(ValidationError);
         expect(() => validateDate(undefined as any)).toThrow(
            ValidationError,
         );
      });

      test('should reject invalid date formats', () => {
         expect(() => validateDate('11/15/2024')).toThrow(ValidationError);
         expect(() => validateDate('invalid')).toThrow(ValidationError);
         expect(() => validateDate('2024-1-1')).toThrow(ValidationError);
         expect(() => validateDate('24-11-15')).toThrow(ValidationError);
      });

      test('should reject invalid month values', () => {
         expect(() => validateDate('2024-13-01')).toThrow(ValidationError);
         expect(() => validateDate('2024-00-01')).toThrow(ValidationError);
      });

      test('should reject invalid day values', () => {
         expect(() => validateDate('2024-11-32')).toThrow(ValidationError);
         expect(() => validateDate('2024-11-00')).toThrow(ValidationError);
      });

      test('should use custom field name in error message', () => {
         try {
            validateDate('invalid', 'startDate');
            expect.unreachable('Should have thrown');
         } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect((error as ValidationError).field).toBe('startDate');
         }
      });
   });

   describe('validateWeek', () => {
      test('should accept valid weeks', () => {
         expect(() => validateWeek(1)).not.toThrow();
         expect(() => validateWeek(10)).not.toThrow();
         expect(() => validateWeek(18)).not.toThrow();
      });

      test('should reject invalid weeks', () => {
         expect(() => validateWeek(0)).toThrow(ValidationError);
         expect(() => validateWeek(19)).toThrow(ValidationError);
         expect(() => validateWeek(1.5)).toThrow(ValidationError);
      });
   });

   describe('validatePagination', () => {
      test('should accept valid pagination params', () => {
         expect(() => validatePagination(0, 25)).not.toThrow();
         expect(() => validatePagination(100, 50)).not.toThrow();
         expect(() => validatePagination()).not.toThrow();
      });

      test('should accept only start parameter', () => {
         expect(() => validatePagination(0)).not.toThrow();
         expect(() => validatePagination(10)).not.toThrow();
      });

      test('should accept only count parameter', () => {
         expect(() => validatePagination(undefined, 25)).not.toThrow();
         expect(() => validatePagination(undefined, 100)).not.toThrow();
      });

      test('should reject negative start values', () => {
         expect(() => validatePagination(-1, 25)).toThrow(ValidationError);
         expect(() => validatePagination(-10)).toThrow(ValidationError);
      });

      test('should reject zero or negative count values', () => {
         expect(() => validatePagination(0, 0)).toThrow(ValidationError);
         expect(() => validatePagination(0, -1)).toThrow(ValidationError);
      });

      test('should reject non-integer values', () => {
         expect(() => validatePagination(1.5, 25)).toThrow(ValidationError);
         expect(() => validatePagination(0, 10.5)).toThrow(ValidationError);
      });
   });

   describe('validateRequired', () => {
      test('should accept non-null/undefined values', () => {
         expect(() => validateRequired('value', 'field')).not.toThrow();
         expect(() => validateRequired(0, 'field')).not.toThrow();
         expect(() => validateRequired(false, 'field')).not.toThrow();
      });

      test('should reject null/undefined values', () => {
         expect(() => validateRequired(null, 'field')).toThrow(
            ValidationError,
         );
         expect(() => validateRequired(undefined, 'field')).toThrow(
            ValidationError,
         );
      });
   });

   describe('validateEnum', () => {
      test('should accept values in allowed set', () => {
         expect(() =>
            validateEnum('active', ['active', 'inactive'], 'status'),
         ).not.toThrow();
         expect(() =>
            validateEnum('inactive', ['active', 'inactive'], 'status'),
         ).not.toThrow();
      });

      test('should reject values not in allowed set', () => {
         expect(() =>
            validateEnum('pending', ['active', 'inactive'], 'status'),
         ).toThrow(ValidationError);
      });
   });
});
