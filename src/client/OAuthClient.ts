/**
 * OAuth 1.0a client for Yahoo Fantasy Sports API
 * @module
 */

import { AuthenticationError, ConfigError } from '../types/errors.js';
import {
   OAUTH_ENDPOINTS,
   OAUTH_SIGNATURE_METHOD,
   OAUTH_VERSION,
} from '../utils/constants.js';

/**
 * OAuth tokens
 */
export interface OAuthTokens {
   /**
    * OAuth access token
    */
   accessToken: string;

   /**
    * OAuth access token secret
    */
   accessTokenSecret: string;

   /**
    * Session handle for token refresh (optional)
    */
   sessionHandle?: string;

   /**
    * Token expiration timestamp (optional)
    */
   expiresAt?: number;
}

/**
 * Request token response
 */
interface RequestTokenResponse {
   oauthToken: string;
   oauthTokenSecret: string;
   oauthCallbackConfirmed: string;
}

/**
 * Access token response
 */
interface AccessTokenResponse {
   oauthToken: string;
   oauthTokenSecret: string;
   oauthSessionHandle?: string;
   oauthExpiresIn?: string;
}

/**
 * OAuth 1.0a client for Yahoo authentication
 *
 * Handles the three-legged OAuth flow:
 * 1. Get request token
 * 2. User authorizes
 * 3. Exchange for access token
 *
 * @example
 * ```typescript
 * const oauth = new OAuthClient(consumerKey, consumerSecret);
 *
 * // Step 1: Get auth URL
 * const { url, tokenSecret } = await oauth.getAuthorizationUrl('oob');
 *
 * // Step 2: User visits URL and gets verifier
 * console.log('Visit:', url);
 * const verifier = prompt('Enter verifier:');
 *
 * // Step 3: Get access tokens
 * const tokens = await oauth.getAccessToken(token, tokenSecret, verifier);
 * ```
 */
export class OAuthClient {
   private consumerKey: string;
   private consumerSecret: string;

   /**
    * Creates a new OAuth client
    *
    * @param consumerKey - OAuth consumer key from Yahoo Developer
    * @param consumerSecret - OAuth consumer secret from Yahoo Developer
    */
   constructor(consumerKey: string, consumerSecret: string) {
      if (!consumerKey) {
         throw new ConfigError('OAuth consumer key is required');
      }
      if (!consumerSecret) {
         throw new ConfigError('OAuth consumer secret is required');
      }

      this.consumerKey = consumerKey;
      this.consumerSecret = consumerSecret;
   }

   /**
    * Gets the authorization URL for the user to visit
    *
    * @param callback - Callback URL ('oob' for out-of-band / manual entry)
    * @returns Authorization URL and token secret (save this for step 3)
    * @throws {AuthenticationError} If request token request fails
    *
    * @example
    * ```typescript
    * const { url, tokenSecret } = await oauth.getAuthorizationUrl('oob');
    * console.log('Visit this URL:', url);
    * // Save tokenSecret for later
    * ```
    */
   async getAuthorizationUrl(
      callback = 'oob',
   ): Promise<{ url: string; token: string; tokenSecret: string }> {
      // Step 1: Get request token
      const requestTokenData = await this.getRequestToken(callback);

      // Step 2: Build authorization URL
      const authUrl = `${OAUTH_ENDPOINTS.AUTHORIZE}?oauth_token=${requestTokenData.oauthToken}`;

      return {
         url: authUrl,
         token: requestTokenData.oauthToken,
         tokenSecret: requestTokenData.oauthTokenSecret,
      };
   }

   /**
    * Exchanges verifier for access tokens
    *
    * @param token - OAuth token from step 1
    * @param tokenSecret - OAuth token secret from step 1
    * @param verifier - Verifier code from user authorization
    * @returns OAuth access tokens
    * @throws {AuthenticationError} If token exchange fails
    *
    * @example
    * ```typescript
    * const tokens = await oauth.getAccessToken(token, tokenSecret, verifier);
    * // Save these tokens for API requests
    * ```
    */
   async getAccessToken(
      token: string,
      tokenSecret: string,
      verifier: string,
   ): Promise<OAuthTokens> {
      const params: Record<string, string> = {
         oauth_consumer_key: this.consumerKey,
         oauth_nonce: this.generateNonce(),
         oauth_signature_method: OAUTH_SIGNATURE_METHOD,
         oauth_timestamp: this.getTimestamp(),
         oauth_token: token,
         oauth_verifier: verifier,
         oauth_version: OAUTH_VERSION,
      };

      // Generate signature
      const signature = await this.generateSignature(
         'POST',
         OAUTH_ENDPOINTS.ACCESS_TOKEN,
         params,
         tokenSecret,
      );

      params.oauth_signature = signature;

      // Make request
      const response = await fetch(OAUTH_ENDPOINTS.ACCESS_TOKEN, {
         method: 'POST',
         headers: {
            Authorization: this.buildAuthHeader(params),
            'Content-Type': 'application/x-www-form-urlencoded',
         },
      });

      if (!response.ok) {
         const error = await response.text();
         throw new AuthenticationError(
            `Failed to get access token: ${response.statusText}`,
            error,
         );
      }

      const body = await response.text();
      const data = this.parseOAuthResponse(
         body,
      ) as unknown as AccessTokenResponse;

      if (!data.oauthToken || !data.oauthTokenSecret) {
         throw new AuthenticationError('Invalid access token response');
      }

      return {
         accessToken: data.oauthToken,
         accessTokenSecret: data.oauthTokenSecret,
         sessionHandle: data.oauthSessionHandle,
         expiresAt: data.oauthExpiresIn
            ? Date.now() + Number.parseInt(data.oauthExpiresIn, 10) * 1000
            : undefined,
      };
   }

   /**
    * Refreshes access tokens using session handle
    *
    * @param accessToken - Current access token
    * @param accessTokenSecret - Current access token secret
    * @param sessionHandle - Session handle from initial auth
    * @returns New OAuth tokens
    * @throws {AuthenticationError} If refresh fails
    *
    * @example
    * ```typescript
    * const newTokens = await oauth.refreshAccessToken(
    *   oldTokens.accessToken,
    *   oldTokens.accessTokenSecret,
    *   oldTokens.sessionHandle!
    * );
    * ```
    */
   async refreshAccessToken(
      accessToken: string,
      accessTokenSecret: string,
      sessionHandle: string,
   ): Promise<OAuthTokens> {
      const params: Record<string, string> = {
         oauth_consumer_key: this.consumerKey,
         oauth_nonce: this.generateNonce(),
         oauth_signature_method: OAUTH_SIGNATURE_METHOD,
         oauth_timestamp: this.getTimestamp(),
         oauth_token: accessToken,
         oauth_session_handle: sessionHandle,
         oauth_version: OAUTH_VERSION,
      };

      // Generate signature
      const signature = await this.generateSignature(
         'POST',
         OAUTH_ENDPOINTS.ACCESS_TOKEN,
         params,
         accessTokenSecret,
      );

      params.oauth_signature = signature;

      // Make request
      const response = await fetch(OAUTH_ENDPOINTS.ACCESS_TOKEN, {
         method: 'POST',
         headers: {
            Authorization: this.buildAuthHeader(params),
            'Content-Type': 'application/x-www-form-urlencoded',
         },
      });

      if (!response.ok) {
         const error = await response.text();
         throw new AuthenticationError(
            `Failed to refresh access token: ${response.statusText}`,
            error,
         );
      }

      const body = await response.text();
      const data = this.parseOAuthResponse(
         body,
      ) as unknown as AccessTokenResponse;

      if (!data.oauthToken || !data.oauthTokenSecret) {
         throw new AuthenticationError('Invalid refresh token response');
      }

      return {
         accessToken: data.oauthToken,
         accessTokenSecret: data.oauthTokenSecret,
         sessionHandle: data.oauthSessionHandle,
         expiresAt: data.oauthExpiresIn
            ? Date.now() + Number.parseInt(data.oauthExpiresIn, 10) * 1000
            : undefined,
      };
   }

   /**
    * Generates an OAuth authorization header for API requests
    *
    * @param method - HTTP method
    * @param url - Request URL
    * @param accessToken - OAuth access token
    * @param accessTokenSecret - OAuth access token secret
    * @param additionalParams - Additional query/body parameters
    * @returns Authorization header value
    *
    * @example
    * ```typescript
    * const authHeader = await oauth.getAuthHeader(
    *   'GET',
    *   'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games',
    *   tokens.accessToken,
    *   tokens.accessTokenSecret
    * );
    * ```
    */
   async getAuthHeader(
      method: string,
      url: string,
      accessToken: string,
      accessTokenSecret: string,
      additionalParams?: Record<string, string>,
   ): Promise<string> {
      const params: Record<string, string> = {
         oauth_consumer_key: this.consumerKey,
         oauth_nonce: this.generateNonce(),
         oauth_signature_method: OAUTH_SIGNATURE_METHOD,
         oauth_timestamp: this.getTimestamp(),
         oauth_token: accessToken,
         oauth_version: OAUTH_VERSION,
         ...additionalParams,
      };

      const signature = await this.generateSignature(
         method,
         url,
         params,
         accessTokenSecret,
      );

      params.oauth_signature = signature;

      return this.buildAuthHeader(params);
   }

   /**
    * Gets a request token (step 1 of OAuth flow)
    */
   private async getRequestToken(
      callback: string,
   ): Promise<RequestTokenResponse> {
      const params: Record<string, string> = {
         oauth_callback: callback,
         oauth_consumer_key: this.consumerKey,
         oauth_nonce: this.generateNonce(),
         oauth_signature_method: OAUTH_SIGNATURE_METHOD,
         oauth_timestamp: this.getTimestamp(),
         oauth_version: OAUTH_VERSION,
      };

      // Generate signature (no token secret for request token)
      const signature = await this.generateSignature(
         'POST',
         OAUTH_ENDPOINTS.REQUEST_TOKEN,
         params,
         '',
      );

      params.oauth_signature = signature;

      // Make request
      const response = await fetch(OAUTH_ENDPOINTS.REQUEST_TOKEN, {
         method: 'POST',
         headers: {
            Authorization: this.buildAuthHeader(params),
            'Content-Type': 'application/x-www-form-urlencoded',
         },
      });

      if (!response.ok) {
         const error = await response.text();
         throw new AuthenticationError(
            `Failed to get request token: ${response.statusText}`,
            error,
         );
      }

      const body = await response.text();
      const parsed = this.parseOAuthResponse(
         body,
      ) as unknown as RequestTokenResponse;

      if (!parsed.oauthToken || !parsed.oauthTokenSecret) {
         throw new AuthenticationError('Invalid request token response');
      }

      return parsed;
   }

   /**
    * Generates an OAuth signature
    */
   private async generateSignature(
      method: string,
      url: string,
      params: Record<string, string>,
      tokenSecret: string,
   ): Promise<string> {
      // Sort parameters
      const sorted = Object.entries(params)
         .sort(([a], [b]) => a.localeCompare(b))
         .map(
            ([key, value]) =>
               `${this.percentEncode(key)}=${this.percentEncode(value)}`,
         )
         .join('&');

      // Build signature base string
      const baseString = [
         method.toUpperCase(),
         this.percentEncode(url.split('?')[0] ?? url), // Remove query params from URL
         this.percentEncode(sorted),
      ].join('&');

      // Build signing key
      const signingKey = `${this.percentEncode(this.consumerSecret)}&${this.percentEncode(tokenSecret)}`;

      // Generate HMAC-SHA1 signature
      const signature = await this.hmacSha1(baseString, signingKey);

      return signature;
   }

   /**
    * HMAC-SHA1 signature generation using Web Crypto API
    */
   private async hmacSha1(message: string, key: string): Promise<string> {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(key);
      const messageData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
         'raw',
         keyData,
         { name: 'HMAC', hash: 'SHA-1' },
         false,
         ['sign'],
      );

      const signature = await crypto.subtle.sign(
         'HMAC',
         cryptoKey,
         messageData,
      );

      // Convert to base64
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
   }

   /**
    * Percent-encodes a string per OAuth spec
    */
   private percentEncode(str: string): string {
      return encodeURIComponent(str)
         .replace(/!/g, '%21')
         .replace(/'/g, '%27')
         .replace(/\(/g, '%28')
         .replace(/\)/g, '%29')
         .replace(/\*/g, '%2A');
   }

   /**
    * Generates a random nonce
    */
   private generateNonce(): string {
      return (
         Math.random().toString(36).substring(2) + Date.now().toString(36)
      );
   }

   /**
    * Gets current timestamp in seconds
    */
   private getTimestamp(): string {
      return Math.floor(Date.now() / 1000).toString();
   }

   /**
    * Builds an OAuth authorization header
    */
   private buildAuthHeader(params: Record<string, string>): string {
      const oauthParams = Object.entries(params)
         .filter(([key]) => key.startsWith('oauth_'))
         .sort(([a], [b]) => a.localeCompare(b))
         .map(
            ([key, value]) =>
               `${this.percentEncode(key)}="${this.percentEncode(value)}"`,
         )
         .join(', ');

      return `OAuth ${oauthParams}`;
   }

   /**
    * Parses OAuth response body (URL-encoded)
    */
   private parseOAuthResponse(body: string): Record<string, string> {
      const params = new URLSearchParams(body);
      const result: Record<string, string> = {};

      for (const [key, value] of params.entries()) {
         // Convert snake_case to camelCase
         const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase(),
         );
         result[camelKey] = value;
      }

      return result;
   }
}
