/**
 * Yahoo Fantasy Sports API Client
 *
 * Main entry point for the Yahoo Fantasy Sports API wrapper.
 * Provides access to all fantasy sports resources with full TypeScript support.
 *
 * @module
 *
 * @example
 * ```typescript
 * import { YahooFantasySportsClient } from 'yfs-api';
 *
 * const yfs = new YahooFantasySportsClient({
 *   clientId: process.env.YAHOO_CLIENT_ID!,
 *   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
 *   redirectUri: 'https://example.com/callback', // or 'oob'
 * });
 *
 * // Step 1: Get authorization URL
 * const authUrl = yfs.getAuthUrl();
 * console.log('Visit this URL and authorize:', authUrl);
 *
 * // Step 2: User authorizes and gets redirected with code
 * // (Alternatively, ask the user to input the code manually)
 * const code = '...'; // User authorization code from yahoo
 *
 * // Step 3: Exchange code for tokens
 * await yfs.authenticate(code);
 *
 * // Make API calls
 * const league = await yfs.api().league('423.l.12345').get();
 * const roster = await yfs.api().team('423.l.12345.t.1').roster().get();
 * ```
 */

import { OAuth1Client } from '../auth/oauth1.js';
import {
   type OAuth2AuthorizationRequest,
   OAuth2Client,
   type OAuth2Tokens,
} from '../auth/oauth2.js';
import { type ApiRoot, createApi } from '../resources/api.js';
import { ConfigError } from './errors.js';
import { HttpClient, type RequestOptions } from './http.js';

/**
 * Configuration options for Yahoo Fantasy Sports API client
 *
 * Supports two authentication modes:
 * 1. User Authentication (OAuth 2.0) - Full access to all endpoints
 * 2. Public Mode (OAuth 1.0) - Access to public endpoints only
 */
export interface Config {
   /**
    * OAuth client ID (Consumer Key) from Yahoo Developer
    */
   clientId: string;

   /**
    * OAuth client secret (Consumer Secret) from Yahoo Developer
    */
   clientSecret: string;

   /**
    * Enable public mode (OAuth 1.0 2-legged authentication)
    *
    * When true:
    * - Uses OAuth 1.0 with HMAC-SHA1 signing
    * - No user authorization required
    * - Access limited to public endpoints only
    * - redirectUri is not required
    *
    * When false (default):
    * - Uses OAuth 2.0 Authorization Code Grant
    * - Requires user authorization
    * - Full access to all endpoints
    * - redirectUri is required
    *
    * @default false
    */
   publicMode?: boolean;

   /**
    * Redirect URI for OAuth 2.0 flow
    * Must match the URI configured in Yahoo Developer app
    *
    * Required when publicMode is false (default)
    * Not used when publicMode is true
    */
   redirectUri?: string;

   /**
    * Optional: Access token if already authenticated
    * Only used in user authentication mode (publicMode: false)
    */
   accessToken?: string;

   /**
    * Optional: Refresh token for getting new access tokens
    * Only used in user authentication mode (publicMode: false)
    */
   refreshToken?: string;

   /**
    * Optional: Token expiration timestamp (milliseconds since epoch)
    * Only used in user authentication mode (publicMode: false)
    */
   expiresAt?: number;

   /**
    * Optional: Enable debug logging
    * @default false
    */
   debug?: boolean;

   /**
    * Optional: Request timeout in milliseconds
    * @default 30000
    */
   timeout?: number;

   /**
    * Optional: Maximum retry attempts
    * @default 3
    */
   maxRetries?: number;
}

/**
 * Callback interface for storing and retrieving OAuth 2.0 tokens
 * Implement this to persist tokens between sessions
 */
export interface TokenStorage {
   /**
    * Save tokens
    */
   save(tokens: OAuth2Tokens): Promise<void> | void;

   /**
    * Load saved tokens
    */
   load(): Promise<OAuth2Tokens | null> | OAuth2Tokens | null;

   /**
    * Clear saved tokens
    */
   clear(): Promise<void> | void;
}

/**
 * Main Yahoo Fantasy Sports API client
 *
 * Provides access to Yahoo Fantasy Sports through a fluent resource API.
 *
 * @example
 * ```typescript
 * const yfs = new YahooFantasySportsClient({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://example.com/callback',
 * });
 *
 * // Step 1: Get authorization URL
 * const authUrl = yfs.getAuthUrl();
 * console.log('Visit this URL and authorize:', authUrl);
 *
 * // Step 2: User authorizes and gets redirected with code
 * // Extract code from redirect: ?code=AUTHORIZATION_CODE
 *
 * // Step 3: Complete authentication
 * await yfs.authenticate(code);
 *
 * // Use the resource builders
 * const league = await yfs.api().league('423.l.12345').get();
 * const teams = await yfs.api().league('423.l.12345').teams([]).get();
 * ```
 */
export class YahooFantasySportsClient {
   private config: Config & {
      debug: boolean;
      timeout: number;
      maxRetries: number;
   };

   private oauth2Client?: OAuth2Client;
   private oauth1Client?: OAuth1Client;
   private httpClient: HttpClient;
   private tokenStorage?: TokenStorage;
   private tokens?: OAuth2Tokens;
   private refreshInFlight?: Promise<OAuth2Tokens>;

   /**
    * Creates a new Yahoo Fantasy Sports API client
    *
    * @param config - Configuration options
    * @param tokenStorage - Optional token storage implementation
    * @throws ConfigError - If required configuration is missing or invalid
    *
    * @example
    * ```typescript
    * const yfs = new YahooFantasySportsClient({
    *   clientId: process.env.YAHOO_CLIENT_ID!,
    *   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
    *   redirectUri: 'https://example.com/callback',
    *   debug: true, // Optional: enable debug logging
    * });
    * ```
    *
    * @example With token storage
    * ```typescript
    * const storage: TokenStorage = {
    *   async save(tokens) {
    *     await fs.writeFile('tokens.json', JSON.stringify(tokens));
    *   },
    *   async load() {
    *     try {
    *       const data = await fs.readFile('tokens.json', 'utf-8');
    *       return JSON.parse(data);
    *     } catch {
    *       return null;
    *     }
    *   },
    *   async clear() {
    *     await fs.unlink('tokens.json');
    *   },
    * };
    *
    * const yfs = new YahooFantasySportsClient(config, storage);
    *
    * // Try to load existing tokens
    * await yfs.loadTokens();
    * ```
    */
   constructor(config: Config, tokenStorage?: TokenStorage) {
      // Validate required config
      if (!config.clientId) {
         throw new ConfigError('clientId is required');
      }
      if (!config.clientSecret) {
         throw new ConfigError('clientSecret is required');
      }

      // Validate mode-specific requirements
      const isPublicMode = config.publicMode ?? false;

      if (!isPublicMode && !config.redirectUri) {
         throw new ConfigError(
            'redirectUri is required for user authentication mode',
         );
      }

      if (isPublicMode && config.redirectUri) {
         console.warn('redirectUri is ignored in public mode');
      }

      // Set defaults for optional config
      this.config = {
         clientId: config.clientId,
         clientSecret: config.clientSecret,
         publicMode: isPublicMode,
         redirectUri: config.redirectUri,
         accessToken: config.accessToken,
         refreshToken: config.refreshToken,
         expiresAt: config.expiresAt,
         debug: config.debug ?? false,
         timeout: config.timeout ?? 30000,
         maxRetries: config.maxRetries ?? 3,
      };

      this.tokenStorage = tokenStorage;

      // Initialize the appropriate OAuth client based on mode
      if (isPublicMode) {
         // Public mode: OAuth 1.0 2-legged authentication
         this.oauth1Client = new OAuth1Client(
            this.config.clientId,
            this.config.clientSecret,
         );
      } else {
         // User auth mode: OAuth 2.0 Authorization Code Grant
         // redirectUri is guaranteed to exist due to validation above
         const redirectUri = this.config.redirectUri || '';
         this.oauth2Client = new OAuth2Client(
            this.config.clientId,
            this.config.clientSecret,
            redirectUri,
            this.config.timeout,
         );

         // Build tokens if available in config
         if (
            config.accessToken &&
            config.refreshToken &&
            config.expiresAt
         ) {
            this.tokens = {
               accessToken: config.accessToken,
               refreshToken: config.refreshToken,
               expiresAt: config.expiresAt,
               tokenType: 'bearer',
               expiresIn: Math.floor(
                  (config.expiresAt - Date.now()) / 1000,
               ),
            };
         }
      }

      // Initialize HTTP client with token refresh callback
      this.httpClient = new HttpClient(
         this.oauth2Client,
         () => this.tokens,
         () => this.refreshTokens(),
         {
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries,
            debug: this.config.debug,
            oauth1Client: this.oauth1Client,
         },
      );
   }

   /**
    * Create a new resource API root
    *
    * A type-safe, chainable API for Yahoo Fantasy resource queries.
    * Provides resource-specific builders with path-safe chaining.
    *
    * @returns A new ApiRoot instance
    *
    * @example Query league settings
    * ```typescript
    * const league = await yfs.api()
    *   .league('423.l.12345')
    *   .include('settings')
    *   .get();
    * ```
    *
    * @example Query players with filters
    * ```typescript
    * const players = await yfs.api()
    *   .league('423.l.12345')
    *   .players([])
    *   .position('C')
    *   .status('FA')
    *   .count(25)
    *   .get();
    * ```
    *
    * @example Query team roster
    * ```typescript
    * const roster = await yfs.api()
    *   .team('423.l.12345.t.1')
    *   .roster()
    *   .week(10)
    *   .get();
    * ```
    *
    * @example Query specific games
    * ```typescript
    * const games = await yfs.api()
    *   .games(['nhl', 'nfl'])
    *   .get();
    * ```
    *
    * @example Query user's games
    * ```typescript
    * const userGames = await yfs.api()
    *   .users()
    *   .games([])
    *   .get();
    * ```
    */
   api(): ApiRoot {
      return createApi(this.httpClient);
   }

   /** Returns an unparsed Yahoo XML response without changing typed API calls. */
   requestRawXml(path: string, options?: RequestOptions): Promise<string> {
      return this.httpClient.requestRawXml(path, options);
   }

   /**
    * Gets the authorization URL for the OAuth 2.0 flow
    *
    * Only available in user authentication mode (not in public mode).
    *
    * Step 1 of the OAuth flow. The user must visit this URL and authorize the application.
    * After authorization, Yahoo will redirect to your redirectUri with a code parameter.
    *
    * @param state - Optional state parameter for CSRF protection
    * @param language - Optional language code (default: 'en-us')
    * @returns Authorization URL that the user must visit
    * @throws ConfigError - If called in public mode
    *
    * @example
    * ```typescript
    * const authUrl = yfs.getAuthUrl('random-state-string');
    * console.log('Please visit:', authUrl);
    * console.log('After authorizing, you will be redirected with a code parameter.');
    * ```
    */
   getAuthUrl(state?: string, language = 'en-us'): string {
      if (!this.oauth2Client) {
         throw new ConfigError(
            'getAuthUrl is not available in public mode',
         );
      }
      return this.oauth2Client.getAuthorizationUrl(state, language);
   }

   createAuthorizationRequest(
      language = 'en-us',
   ): OAuth2AuthorizationRequest {
      if (!this.oauth2Client) {
         throw new ConfigError(
            'createAuthorizationRequest is not available in public mode',
         );
      }
      return this.oauth2Client.createAuthorizationRequest(language);
   }

   validateAuthorizationState(
      expected: string,
      received: string | null | undefined,
   ): void {
      if (!this.oauth2Client) {
         throw new ConfigError(
            'validateAuthorizationState is not available in public mode',
         );
      }
      this.oauth2Client.validateAuthorizationState(expected, received);
   }

   /**
    * Completes authentication with the authorization code
    *
    * Step 2 of the OAuth flow. After the user authorizes and is redirected with a code,
    * call this method to exchange it for access and refresh tokens.
    *
    * @param code - Authorization code from Yahoo OAuth redirect
    * @throws AuthenticationError - If authentication fails
    *
    * @example
    * ```typescript
    * const authUrl = yfs.getAuthUrl();
    * console.log('Visit:', authUrl);
    *
    * // After user authorizes and is redirected to:
    * // https://your-redirect-uri?code=AUTHORIZATION_CODE
    *
    * const code = '...'; // Extract from redirect URL
    * await yfs.authenticate(code);
    *
    * console.log('Authenticated successfully!');
    * ```
    */
   /**
    * Completes authentication with the authorization code
    *
    * Only available in user authentication mode (not in public mode).
    *
    * Step 2 of the OAuth flow. After the user authorizes and is redirected with a code,
    * call this method to exchange it for access and refresh tokens.
    *
    * @param code - Authorization code from Yahoo OAuth redirect
    * @throws AuthenticationError - If authentication fails
    * @throws ConfigError - If called in public mode
    *
    * @example
    * ```typescript
    * const authUrl = yfs.getAuthUrl();
    * console.log('Visit:', authUrl);
    *
    * // After user authorizes and is redirected to:
    * // https://your-redirect-uri?code=AUTHORIZATION_CODE
    *
    * const code = '...'; // Extract from redirect URL
    * await yfs.authenticate(code);
    *
    * console.log('Authenticated successfully!');
    * ```
    */
   async authenticate(code: string): Promise<void> {
      if (!this.oauth2Client) {
         throw new ConfigError(
            'authenticate is not available in public mode',
         );
      }
      const tokens = await this.oauth2Client.exchangeCodeForToken(code);
      await this.setTokens(tokens);
   }

   /**
    * Loads tokens from storage
    *
    * If a TokenStorage implementation was provided, this loads previously saved tokens.
    *
    * @returns True if tokens were loaded, false otherwise
    *
    * @example
    * ```typescript
    * const yfs = new YahooFantasySportsClient(config, storage);
    *
    * if (await yfs.loadTokens()) {
    *   console.log('Using saved tokens');
    * } else {
    *   console.log('No saved tokens, need to authenticate');
    *   const authUrl = yfs.getAuthUrl();
    *   // ... authenticate
    * }
    * ```
    */
   async loadTokens(): Promise<boolean> {
      if (!this.tokenStorage) {
         return false;
      }

      const tokens = await this.tokenStorage.load();
      if (tokens) {
         await this.setTokens(tokens);
         return true;
      }

      return false;
   }

   /**
    * Refreshes the access token using the refresh token
    *
    * Only available in user authentication mode (not in public mode).
    *
    * OAuth 2.0 access tokens expire after 1 hour. Use this method to get a new access token
    * without requiring the user to re-authenticate.
    *
    * Note: The HttpClient automatically refreshes tokens before making requests,
    * so you typically don't need to call this manually.
    *
    * @throws AuthenticationError - If refresh fails
    * @throws ConfigError - If no refresh token is available or if called in public mode
    *
    * @example
    * ```typescript
    * try {
    *   await yfs.refreshToken();
    *   console.log('Token refreshed successfully');
    * } catch (error) {
    *   console.log('Refresh failed, need to re-authenticate');
    *   await yfs.authenticate(code);
    * }
    * ```
    */
   async refreshToken(): Promise<void> {
      if (!this.oauth2Client) {
         throw new ConfigError(
            'refreshToken is not available in public mode',
         );
      }
      if (!this.tokens?.refreshToken) {
         throw new ConfigError(
            'No refresh token available. Cannot refresh without re-authenticating.',
         );
      }

      await this.refreshTokens();
   }

   /**
    * Checks if the client is currently authenticated
    *
    * In public mode (OAuth 1.0), always returns true since no user auth is needed.
    * In user auth mode (OAuth 2.0), returns true if valid access tokens exist.
    *
    * @returns True if the client can make authenticated requests
    *
    * @example
    * ```typescript
    * if (!yfs.isAuthenticated()) {
    *   await yfs.authenticate(code);
    * }
    * ```
    */
   isAuthenticated(): boolean {
      // In public mode, we're always "authenticated" (no user auth needed)
      if (this.oauth1Client) {
         return true;
      }
      // In user auth mode, check for access token
      return !!this.tokens?.accessToken;
   }

   /**
    * Checks if the access token is expired or will expire soon
    *
    * Only applicable in user authentication mode (OAuth 2.0).
    * In public mode (OAuth 1.0), always returns false (tokens don't expire).
    *
    * @param bufferSeconds - Time buffer in seconds before actual expiration (default: 60)
    * @returns True if the token is expired or will expire within the buffer time
    *
    * @example
    * ```typescript
    * if (yfs.isTokenExpired()) {
    *   await yfs.refreshToken();
    * }
    * ```
    */
   isTokenExpired(bufferSeconds = 60): boolean {
      // In public mode, tokens don't expire
      if (this.oauth1Client) {
         return false;
      }
      // In user auth mode, check token expiration
      if (!this.tokens || !this.oauth2Client) {
         return true;
      }
      return this.oauth2Client.isTokenExpired(this.tokens, bufferSeconds);
   }

   /**
    * Gets the current OAuth 2.0 tokens
    *
    * @returns Current tokens or null if not authenticated
    *
    * @example
    * ```typescript
    * const tokens = yfs.getTokens();
    * if (tokens) {
    *   // Save tokens for later use
    *   await saveToDatabase(tokens);
    * }
    * ```
    */
   getTokens(): OAuth2Tokens | null {
      return this.tokens ?? null;
   }

   /**
    * Clears stored authentication tokens
    *
    * @example
    * ```typescript
    * await yfs.logout();
    * console.log('Logged out successfully');
    * ```
    */
   async logout(): Promise<void> {
      this.tokens = undefined;
      this.config.accessToken = undefined;
      this.config.refreshToken = undefined;
      this.config.expiresAt = undefined;

      // Clear from storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.clear();
      }
   }

   /**
    * Sets OAuth tokens (internal method)
    */
   private async setTokens(tokens: OAuth2Tokens): Promise<void> {
      this.tokens = tokens;
      this.config.accessToken = tokens.accessToken;
      this.config.refreshToken = tokens.refreshToken;
      this.config.expiresAt = tokens.expiresAt;

      // Save to storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.save(tokens);
      }
   }

   private refreshTokens(): Promise<OAuth2Tokens> {
      const oauth2Client = this.oauth2Client;
      const refreshToken = this.tokens?.refreshToken;
      if (!oauth2Client) {
         return Promise.reject(
            new ConfigError(
               'OAuth 2.0 client is not available in public mode',
            ),
         );
      }
      if (!refreshToken) {
         return Promise.reject(
            new ConfigError('No refresh token available'),
         );
      }
      if (!this.refreshInFlight) {
         this.refreshInFlight = (async () => {
            try {
               const newTokens =
                  await oauth2Client.refreshAccessToken(refreshToken);
               await this.setTokens(newTokens);
               return newTokens;
            } finally {
               this.refreshInFlight = undefined;
            }
         })();
      }
      return this.refreshInFlight;
   }

   /**
    * Gets the HTTP client (for advanced use cases)
    *
    * @internal
    */
   getHttpClient(): HttpClient {
      return this.httpClient;
   }
}
