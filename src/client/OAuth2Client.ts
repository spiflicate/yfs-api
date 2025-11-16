/**
 * OAuth 2.0 client for Yahoo Fantasy Sports API
 * @module
 */

import { AuthenticationError, ConfigError } from '../types/errors.js';

/**
 * OAuth 2.0 endpoints for Yahoo
 */
export const OAUTH2_ENDPOINTS = {
   /**
    * Authorization URL (user must visit this)
    */
   AUTHORIZE: 'https://api.login.yahoo.com/oauth2/request_auth',

   /**
    * Token endpoint (for getting and refreshing tokens)
    */
   TOKEN: 'https://api.login.yahoo.com/oauth2/get_token',
} as const;

/**
 * OAuth 2.0 tokens
 */
export interface OAuth2Tokens {
   /**
    * OAuth 2.0 access token (Bearer token)
    */
   accessToken: string;

   /**
    * Token type (always "bearer")
    */
   tokenType: string;

   /**
    * Access token lifetime in seconds (usually 3600 = 1 hour)
    */
   expiresIn: number;

   /**
    * Refresh token for getting new access tokens
    */
   refreshToken: string;

   /**
    * Calculated timestamp when the token expires
    */
   expiresAt: number;

   /**
    * Yahoo user GUID (optional, deprecated)
    */
   yahooGuid?: string;
}

/**
 * Token response from Yahoo OAuth 2.0 API
 */
interface TokenResponse {
   access_token: string;
   token_type: string;
   expires_in: number;
   refresh_token: string;
   xoauth_yahoo_guid?: string;
}

/**
 * OAuth 2.0 client for Yahoo authentication
 *
 * Implements the Authorization Code Grant flow:
 * 1. Get authorization URL
 * 2. User authorizes and gets redirected with code
 * 3. Exchange code for access token and refresh token
 * 4. Refresh access token when it expires
 *
 * @example
 * ```typescript
 * const oauth2 = new OAuth2Client(
 *   clientId,
 *   clientSecret,
 *   'https://example.com/callback'
 * );
 *
 * // Step 1: Get auth URL
 * const authUrl = oauth2.getAuthorizationUrl();
 *
 * // Step 2: User visits URL and gets redirected
 * // Extract code from redirect: ?code=AUTHORIZATION_CODE
 *
 * // Step 3: Exchange code for tokens
 * const tokens = await oauth2.exchangeCodeForToken(code);
 *
 * // Step 4: Refresh when needed
 * const newTokens = await oauth2.refreshAccessToken(tokens.refreshToken);
 * ```
 */
export class OAuth2Client {
   private clientId: string;
   private clientSecret: string;
   private redirectUri: string;

   /**
    * Creates a new OAuth 2.0 client
    *
    * @param clientId - OAuth client ID (Consumer Key) from Yahoo Developer
    * @param clientSecret - OAuth client secret (Consumer Secret) from Yahoo Developer
    * @param redirectUri - Redirect URI registered in Yahoo Developer app
    */
   constructor(
      clientId: string,
      clientSecret: string,
      redirectUri: string,
   ) {
      if (!clientId) {
         throw new ConfigError('OAuth client ID is required');
      }
      if (!clientSecret) {
         throw new ConfigError('OAuth client secret is required');
      }
      if (!redirectUri) {
         throw new ConfigError('OAuth redirect URI is required');
      }

      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.redirectUri = redirectUri;
   }

   /**
    * Generates the authorization URL for the user to visit
    *
    * @param state - Optional state parameter for CSRF protection
    * @param language - Optional language code (default: 'en-us')
    * @returns Authorization URL to redirect user to
    *
    * @example
    * ```typescript
    * const authUrl = oauth2.getAuthorizationUrl('random-state-string');
    * console.log('Visit:', authUrl);
    * ```
    */
   getAuthorizationUrl(state?: string, language = 'en-us'): string {
      const params = new URLSearchParams({
         client_id: this.clientId,
         redirect_uri: this.redirectUri,
         response_type: 'code',
         language,
      });

      if (state) {
         params.set('state', state);
      }

      return `${OAUTH2_ENDPOINTS.AUTHORIZE}?${params.toString()}`;
   }

   /**
    * Exchanges an authorization code for access and refresh tokens
    *
    * @param code - Authorization code from the redirect callback
    * @returns OAuth 2.0 tokens
    * @throws {AuthenticationError} If the token exchange fails
    *
    * @example
    * ```typescript
    * // After user authorizes and is redirected to:
    * // https://your-redirect-uri?code=AUTHORIZATION_CODE
    * const tokens = await oauth2.exchangeCodeForToken(code);
    * ```
    */
   async exchangeCodeForToken(code: string): Promise<OAuth2Tokens> {
      if (!code) {
         throw new ConfigError('Authorization code is required');
      }

      const body = new URLSearchParams({
         grant_type: 'authorization_code',
         code,
         redirect_uri: this.redirectUri,
      });

      return this.requestToken(body);
   }

   /**
    * Refreshes the access token using a refresh token
    *
    * @param refreshToken - The refresh token from previous authentication
    * @returns New OAuth 2.0 tokens (includes new refresh token)
    * @throws {AuthenticationError} If the token refresh fails
    *
    * @example
    * ```typescript
    * const newTokens = await oauth2.refreshAccessToken(oldTokens.refreshToken);
    * ```
    */
   async refreshAccessToken(refreshToken: string): Promise<OAuth2Tokens> {
      if (!refreshToken) {
         throw new ConfigError('Refresh token is required');
      }

      const body = new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         redirect_uri: this.redirectUri,
      });

      return this.requestToken(body);
   }

   /**
    * Makes a token request to Yahoo OAuth 2.0 API
    *
    * @param body - URL-encoded request body
    * @returns OAuth 2.0 tokens
    * @throws {AuthenticationError} If the request fails
    * @private
    */
   private async requestToken(
      body: URLSearchParams,
   ): Promise<OAuth2Tokens> {
      // Create Basic Authorization header
      const credentials = `${this.clientId}:${this.clientSecret}`;
      const encodedCredentials = btoa(credentials);

      try {
         const response = await fetch(OAUTH2_ENDPOINTS.TOKEN, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               Authorization: `Basic ${encodedCredentials}`,
            },
            body: body.toString(),
         });

         if (!response.ok) {
            const errorText = await response.text();
            let errorData: any;
            try {
               errorData = JSON.parse(errorText);
            } catch {
               errorData = { error: errorText };
            }

            throw new AuthenticationError(
               `Failed to get OAuth token: ${errorData.error || errorData.error_description || 'Unknown error'}`,
               errorData,
            );
         }

         const data = (await response.json()) as TokenResponse;

         // Calculate expiration timestamp
         const expiresAt = Date.now() + data.expires_in * 1000;

         return {
            accessToken: data.access_token,
            tokenType: data.token_type,
            expiresIn: data.expires_in,
            refreshToken: data.refresh_token,
            expiresAt,
            yahooGuid: data.xoauth_yahoo_guid,
         };
      } catch (error) {
         if (error instanceof AuthenticationError) {
            throw error;
         }
         throw new AuthenticationError(
            `OAuth token request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error,
         );
      }
   }

   /**
    * Checks if an access token is expired or will expire soon
    *
    * @param tokens - The OAuth 2.0 tokens to check
    * @param bufferSeconds - Time buffer in seconds before actual expiration (default: 60)
    * @returns True if the token is expired or will expire within the buffer time
    *
    * @example
    * ```typescript
    * if (oauth2.isTokenExpired(tokens)) {
    *   tokens = await oauth2.refreshAccessToken(tokens.refreshToken);
    * }
    * ```
    */
   isTokenExpired(tokens: OAuth2Tokens, bufferSeconds = 60): boolean {
      const bufferMs = bufferSeconds * 1000;
      return Date.now() + bufferMs >= tokens.expiresAt;
   }

   /**
    * Gets the time until the token expires
    *
    * @param tokens - The OAuth 2.0 tokens to check
    * @returns Time in seconds until expiration (negative if already expired)
    *
    * @example
    * ```typescript
    * const secondsRemaining = oauth2.getTimeUntilExpiration(tokens);
    * console.log(`Token expires in ${secondsRemaining} seconds`);
    * ```
    */
   getTimeUntilExpiration(tokens: OAuth2Tokens): number {
      return Math.floor((tokens.expiresAt - Date.now()) / 1000);
   }
}
