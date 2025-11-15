/**
 * Error types for the Yahoo Fantasy Sports API wrapper
 * @module
 */

/**
 * Base error class for all Yahoo Fantasy Sports API errors
 */
export class YahooFantasyError extends Error {
   constructor(message: string) {
      super(message);
      this.name = this.constructor.name;
      Object.setPrototypeOf(this, new.target.prototype);
   }
}

/**
 * Error thrown when an API request fails
 */
export class YahooApiError extends YahooFantasyError {
   /**
    * HTTP status code
    */
   public readonly statusCode: number;

   /**
    * Raw response body
    */
   public readonly response?: unknown;

   /**
    * Yahoo API error code if available
    */
   public readonly errorCode?: string;

   constructor(
      message: string,
      statusCode: number,
      response?: unknown,
      errorCode?: string,
   ) {
      super(message);
      this.statusCode = statusCode;
      this.response = response;
      this.errorCode = errorCode;
   }
}

/**
 * Error thrown when authentication fails or token is invalid
 */
export class AuthenticationError extends YahooApiError {
   constructor(message: string, response?: unknown) {
      super(message, 401, response, 'AUTH_ERROR');
   }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends YahooApiError {
   /**
    * Time in seconds until rate limit resets
    */
   public readonly retryAfter?: number;

   constructor(message: string, retryAfter?: number, response?: unknown) {
      super(message, 429, response, 'RATE_LIMIT');
      this.retryAfter = retryAfter;
   }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends YahooApiError {
   constructor(message: string, response?: unknown) {
      super(message, 404, response, 'NOT_FOUND');
   }
}

/**
 * Error thrown when the request is invalid
 */
export class ValidationError extends YahooFantasyError {
   /**
    * Field that failed validation
    */
   public readonly field?: string;

   /**
    * Expected value or format
    */
   public readonly expected?: string;

   /**
    * Actual value provided
    */
   public readonly actual?: unknown;

   constructor(
      message: string,
      field?: string,
      expected?: string,
      actual?: unknown,
   ) {
      super(message);
      this.field = field;
      this.expected = expected;
      this.actual = actual;
   }
}

/**
 * Error thrown when a network request fails
 */
export class NetworkError extends YahooFantasyError {
   /**
    * Original error that caused the failure
    */
   public override readonly cause?: Error;

   constructor(message: string, cause?: Error) {
      super(message);
      this.cause = cause;
   }
}

/**
 * Error thrown when XML parsing fails
 */
export class ParseError extends YahooFantasyError {
   /**
    * Raw content that failed to parse
    */
   public readonly content?: string;

   constructor(message: string, content?: string) {
      super(message);
      this.content = content;
   }
}

/**
 * Error thrown when a configuration is invalid
 */
export class ConfigError extends YahooFantasyError {
   constructor(message: string) {
      super(message);
   }
}

/**
 * Type guard to check if an error is a YahooFantasyError
 */
export function isYahooFantasyError(
   error: unknown,
): error is YahooFantasyError {
   return error instanceof YahooFantasyError;
}

/**
 * Type guard to check if an error is a YahooApiError
 */
export function isYahooApiError(error: unknown): error is YahooApiError {
   return error instanceof YahooApiError;
}

/**
 * Type guard to check if an error is an AuthenticationError
 */
export function isAuthenticationError(
   error: unknown,
): error is AuthenticationError {
   return error instanceof AuthenticationError;
}

/**
 * Type guard to check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
   return error instanceof RateLimitError;
}

/**
 * Type guard to check if an error is a ValidationError
 */
export function isValidationError(
   error: unknown,
): error is ValidationError {
   return error instanceof ValidationError;
}
