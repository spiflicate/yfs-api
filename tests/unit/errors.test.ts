/**
 * Unit tests for error types
 */

import { describe, test, expect } from 'bun:test';
import {
   YahooFantasyError,
   YahooApiError,
   AuthenticationError,
   RateLimitError,
   NotFoundError,
   ValidationError,
   NetworkError,
   ParseError,
   ConfigError,
   isYahooFantasyError,
   isYahooApiError,
   isAuthenticationError,
   isRateLimitError,
   isValidationError,
} from '../../src/types/errors.js';

describe('Error Types', () => {
   describe('YahooFantasyError', () => {
      test('should create error with message', () => {
         const error = new YahooFantasyError('Test error');

         expect(error).toBeInstanceOf(Error);
         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error.message).toBe('Test error');
         expect(error.name).toBe('YahooFantasyError');
      });

      test('should maintain prototype chain', () => {
         const error = new YahooFantasyError('Test error');

         expect(error instanceof YahooFantasyError).toBe(true);
         expect(error instanceof Error).toBe(true);
      });

      test('should have stack trace', () => {
         const error = new YahooFantasyError('Test error');

         expect(error.stack).toBeDefined();
      });
   });

   describe('YahooApiError', () => {
      test('should create error with status code', () => {
         const error = new YahooApiError('API error', 500);

         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error).toBeInstanceOf(YahooApiError);
         expect(error.message).toBe('API error');
         expect(error.statusCode).toBe(500);
         expect(error.name).toBe('YahooApiError');
      });

      test('should accept optional response data', () => {
         const response = { error: 'Internal server error' };
         const error = new YahooApiError('API error', 500, response);

         expect(error.response).toEqual(response);
      });

      test('should accept optional error code', () => {
         const error = new YahooApiError(
            'API error',
            500,
            undefined,
            'INTERNAL_ERROR',
         );

         expect(error.errorCode).toBe('INTERNAL_ERROR');
      });

      test('should accept all parameters', () => {
         const response = { error: 'Bad request' };
         const error = new YahooApiError(
            'Validation failed',
            400,
            response,
            'VALIDATION_ERROR',
         );

         expect(error.message).toBe('Validation failed');
         expect(error.statusCode).toBe(400);
         expect(error.response).toEqual(response);
         expect(error.errorCode).toBe('VALIDATION_ERROR');
      });
   });

   describe('AuthenticationError', () => {
      test('should create error with 401 status', () => {
         const error = new AuthenticationError('Invalid token');

         expect(error).toBeInstanceOf(YahooApiError);
         expect(error).toBeInstanceOf(AuthenticationError);
         expect(error.message).toBe('Invalid token');
         expect(error.statusCode).toBe(401);
         expect(error.errorCode).toBe('AUTH_ERROR');
         expect(error.name).toBe('AuthenticationError');
      });

      test('should accept optional response data', () => {
         const response = { error: 'Token expired' };
         const error = new AuthenticationError('Token expired', response);

         expect(error.response).toEqual(response);
      });
   });

   describe('RateLimitError', () => {
      test('should create error with 429 status', () => {
         const error = new RateLimitError('Rate limit exceeded');

         expect(error).toBeInstanceOf(YahooApiError);
         expect(error).toBeInstanceOf(RateLimitError);
         expect(error.message).toBe('Rate limit exceeded');
         expect(error.statusCode).toBe(429);
         expect(error.errorCode).toBe('RATE_LIMIT');
         expect(error.name).toBe('RateLimitError');
      });

      test('should accept retry after value', () => {
         const error = new RateLimitError('Rate limit exceeded', 60);

         expect(error.retryAfter).toBe(60);
      });

      test('should accept optional response data', () => {
         const response = { retryAfter: 120 };
         const error = new RateLimitError(
            'Rate limit exceeded',
            120,
            response,
         );

         expect(error.retryAfter).toBe(120);
         expect(error.response).toEqual(response);
      });

      test('should handle undefined retry after', () => {
         const error = new RateLimitError('Rate limit exceeded', undefined);

         expect(error.retryAfter).toBeUndefined();
      });
   });

   describe('NotFoundError', () => {
      test('should create error with 404 status', () => {
         const error = new NotFoundError('Resource not found');

         expect(error).toBeInstanceOf(YahooApiError);
         expect(error).toBeInstanceOf(NotFoundError);
         expect(error.message).toBe('Resource not found');
         expect(error.statusCode).toBe(404);
         expect(error.errorCode).toBe('NOT_FOUND');
         expect(error.name).toBe('NotFoundError');
      });

      test('should accept optional response data', () => {
         const response = { error: 'League not found' };
         const error = new NotFoundError('League not found', response);

         expect(error.response).toEqual(response);
      });
   });

   describe('ValidationError', () => {
      test('should create error with message', () => {
         const error = new ValidationError('Invalid input');

         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error).toBeInstanceOf(ValidationError);
         expect(error.message).toBe('Invalid input');
         expect(error.name).toBe('ValidationError');
      });

      test('should accept optional field name', () => {
         const error = new ValidationError('Invalid input', 'username');

         expect(error.field).toBe('username');
      });

      test('should accept expected value', () => {
         const error = new ValidationError(
            'Invalid input',
            'age',
            'number >= 0',
         );

         expect(error.field).toBe('age');
         expect(error.expected).toBe('number >= 0');
      });

      test('should accept actual value', () => {
         const error = new ValidationError(
            'Invalid input',
            'age',
            'number >= 0',
            -5,
         );

         expect(error.field).toBe('age');
         expect(error.expected).toBe('number >= 0');
         expect(error.actual).toBe(-5);
      });

      test('should handle complex actual values', () => {
         const actual = { invalid: 'data' };
         const error = new ValidationError(
            'Invalid input',
            'body',
            'valid object',
            actual,
         );

         expect(error.actual).toEqual(actual);
      });
   });

   describe('NetworkError', () => {
      test('should create error with message', () => {
         const error = new NetworkError('Connection failed');

         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error).toBeInstanceOf(NetworkError);
         expect(error.message).toBe('Connection failed');
         expect(error.name).toBe('NetworkError');
      });

      test('should accept cause error', () => {
         const cause = new Error('ECONNREFUSED');
         const error = new NetworkError('Connection failed', cause);

         expect(error.cause).toBe(cause);
         expect(error.cause?.message).toBe('ECONNREFUSED');
      });

      test('should handle undefined cause', () => {
         const error = new NetworkError('Connection failed', undefined);

         expect(error.cause).toBeUndefined();
      });
   });

   describe('ParseError', () => {
      test('should create error with message', () => {
         const error = new ParseError('Failed to parse XML');

         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error).toBeInstanceOf(ParseError);
         expect(error.message).toBe('Failed to parse XML');
         expect(error.name).toBe('ParseError');
      });

      test('should accept optional content', () => {
         const content = '<invalid>xml</broken>';
         const error = new ParseError('Failed to parse XML', content);

         expect(error.content).toBe(content);
      });

      test('should handle undefined content', () => {
         const error = new ParseError('Failed to parse XML', undefined);

         expect(error.content).toBeUndefined();
      });
   });

   describe('ConfigError', () => {
      test('should create error with message', () => {
         const error = new ConfigError('Invalid configuration');

         expect(error).toBeInstanceOf(YahooFantasyError);
         expect(error).toBeInstanceOf(ConfigError);
         expect(error.message).toBe('Invalid configuration');
         expect(error.name).toBe('ConfigError');
      });
   });

   describe('Type Guards', () => {
      describe('isYahooFantasyError', () => {
         test('should return true for YahooFantasyError', () => {
            const error = new YahooFantasyError('Test');
            expect(isYahooFantasyError(error)).toBe(true);
         });

         test('should return true for subclasses', () => {
            const apiError = new YahooApiError('Test', 500);
            const authError = new AuthenticationError('Test');
            const validationError = new ValidationError('Test');

            expect(isYahooFantasyError(apiError)).toBe(true);
            expect(isYahooFantasyError(authError)).toBe(true);
            expect(isYahooFantasyError(validationError)).toBe(true);
         });

         test('should return false for non-YahooFantasyError', () => {
            const error = new Error('Regular error');
            const notError = { message: 'Not an error' };

            expect(isYahooFantasyError(error)).toBe(false);
            expect(isYahooFantasyError(notError)).toBe(false);
            expect(isYahooFantasyError(null)).toBe(false);
            expect(isYahooFantasyError(undefined)).toBe(false);
         });
      });

      describe('isYahooApiError', () => {
         test('should return true for YahooApiError', () => {
            const error = new YahooApiError('Test', 500);
            expect(isYahooApiError(error)).toBe(true);
         });

         test('should return true for subclasses', () => {
            const authError = new AuthenticationError('Test');
            const rateError = new RateLimitError('Test');
            const notFoundError = new NotFoundError('Test');

            expect(isYahooApiError(authError)).toBe(true);
            expect(isYahooApiError(rateError)).toBe(true);
            expect(isYahooApiError(notFoundError)).toBe(true);
         });

         test('should return false for other errors', () => {
            const validationError = new ValidationError('Test');
            const networkError = new NetworkError('Test');
            const regularError = new Error('Test');

            expect(isYahooApiError(validationError)).toBe(false);
            expect(isYahooApiError(networkError)).toBe(false);
            expect(isYahooApiError(regularError)).toBe(false);
         });
      });

      describe('isAuthenticationError', () => {
         test('should return true for AuthenticationError', () => {
            const error = new AuthenticationError('Test');
            expect(isAuthenticationError(error)).toBe(true);
         });

         test('should return false for other errors', () => {
            const apiError = new YahooApiError('Test', 500);
            const rateError = new RateLimitError('Test');

            expect(isAuthenticationError(apiError)).toBe(false);
            expect(isAuthenticationError(rateError)).toBe(false);
         });
      });

      describe('isRateLimitError', () => {
         test('should return true for RateLimitError', () => {
            const error = new RateLimitError('Test');
            expect(isRateLimitError(error)).toBe(true);
         });

         test('should return false for other errors', () => {
            const apiError = new YahooApiError('Test', 429);
            const authError = new AuthenticationError('Test');

            expect(isRateLimitError(apiError)).toBe(false);
            expect(isRateLimitError(authError)).toBe(false);
         });
      });

      describe('isValidationError', () => {
         test('should return true for ValidationError', () => {
            const error = new ValidationError('Test');
            expect(isValidationError(error)).toBe(true);
         });

         test('should return false for other errors', () => {
            const apiError = new YahooApiError('Test', 400);
            const authError = new AuthenticationError('Test');

            expect(isValidationError(apiError)).toBe(false);
            expect(isValidationError(authError)).toBe(false);
         });
      });
   });
});
