/**
 * Unit tests for validator utilities
 */

import { describe, test, expect } from 'bun:test';
import {
   validateResourceKey,
   validateLeagueKey,
   validateTeamKey,
   validatePlayerKey,
   validateGameCode,
   validateDate,
   validateWeek,
   validatePagination,
   validateRequired,
   validateEnum,
} from '../../src/utils/validators.js';
import { ValidationError } from '../../src/types/errors.js';

describe('validators', () => {
   describe('validateResourceKey', () => {
      test('should accept valid resource keys', () => {
         expect(() => validateResourceKey('423.l.12345')).not.toThrow();
         expect(() => validateResourceKey('423.l.12345.t.1')).not.toThrow();
         expect(() => validateResourceKey('423.p.8888')).not.toThrow();
      });

      test('should reject invalid keys', () => {
         expect(() => validateResourceKey('')).toThrow(ValidationError);
         expect(() => validateResourceKey('invalid')).toThrow(
            ValidationError,
         );
         expect(() => validateResourceKey('abc.l.123')).toThrow(
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

      test('should reject non-team keys', () => {
         expect(() => validateTeamKey('423.l.12345')).toThrow(
            ValidationError,
         );
         expect(() => validateTeamKey('423.p.8888')).toThrow(
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

      test('should reject invalid date formats', () => {
         expect(() => validateDate('11/15/2024')).toThrow(ValidationError);
         expect(() => validateDate('2024-13-01')).toThrow(ValidationError);
         expect(() => validateDate('2024-11-32')).toThrow(ValidationError);
         expect(() => validateDate('invalid')).toThrow(ValidationError);
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

      test('should reject invalid pagination params', () => {
         expect(() => validatePagination(-1, 25)).toThrow(ValidationError);
         expect(() => validatePagination(0, 0)).toThrow(ValidationError);
         expect(() => validatePagination(1.5, 25)).toThrow(ValidationError);
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
