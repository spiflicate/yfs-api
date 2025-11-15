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
 * import { YahooFantasyClient } from 'yahoo-fantasy-sports';
 *
 * const client = new YahooFantasyClient({
 *   consumerKey: process.env.YAHOO_CONSUMER_KEY!,
 *   consumerSecret: process.env.YAHOO_CONSUMER_SECRET!,
 * });
 *
 * // Authenticate
 * const authUrl = await client.getAuthUrl();
 * console.log('Visit:', authUrl);
 * const verifier = '...'; // Get from user
 * await client.authenticate(verifier);
 *
 * // Access resources (to be implemented in Phase 2)
 * // const myTeams = await client.user.getTeams({ gameCode: 'nhl' });
 * ```
 */

import type { Config } from '../types/index.js';
import { ConfigError } from '../types/index.js';
import { OAuthClient, type OAuthTokens } from './OAuthClient.js';
import { HttpClient } from './HttpClient.js';

/**
 * Callback interface for storing and retrieving tokens
 * Implement this to persist tokens between sessions
 */
export interface TokenStorage {
   /**
    * Save tokens
    */
   save(tokens: OAuthTokens): Promise<void> | void;

   /**
    * Load saved tokens
    */
   load(): Promise<OAuthTokens | null> | OAuthTokens | null;

   /**
    * Clear saved tokens
    */
   clear(): Promise<void> | void;
}

/**
 * OAuth flow state during authentication
 */
interface OAuthState {
   token: string;
   tokenSecret: string;
}

/**
 * Main Yahoo Fantasy Sports API client
 *
 * Provides access to all fantasy sports resources through a fluent, resource-based API.
 * Each resource (league, team, player, etc.) is accessed via properties on this client.
 *
 * @example
 * ```typescript
 * const client = new YahooFantasyClient({
 *   consumerKey: 'your-key',
 *   consumerSecret: 'your-secret',
 * });
 *
 * // Step 1: Get authorization URL
 * const authUrl = await client.getAuthUrl();
 * console.log('Visit this URL and authorize:', authUrl);
 *
 * // Step 2: User authorizes and gets verifier code
 * const verifier = '...'; // From user
 *
 * // Step 3: Complete authentication
 * await client.authenticate(verifier);
 *
 * // Now you can make API calls (resources to be implemented in Phase 2)
 * // const leagues = await client.league.get('423.l.12345');
 * ```
 */
export class YahooFantasyClient {
   private config: Config & {
      debug: boolean;
      timeout: number;
      maxRetries: number;
   };

   private oauthClient: OAuthClient;
   private httpClient: HttpClient;
   private tokenStorage?: TokenStorage;
   private oauthState?: OAuthState;

   /**
    * Creates a new Yahoo Fantasy Sports API client
    *
    * @param config - Configuration options
    * @param tokenStorage - Optional token storage implementation
    * @throws {ConfigError} If required configuration is missing or invalid
    *
    * @example
    * ```typescript
    * const client = new YahooFantasyClient({
    *   consumerKey: process.env.YAHOO_CONSUMER_KEY!,
    *   consumerSecret: process.env.YAHOO_CONSUMER_SECRET!,
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
    * const client = new YahooFantasyClient(config, storage);
    *
    * // Try to load existing tokens
    * await client.loadTokens();
    * ```
    */
   constructor(config: Config, tokenStorage?: TokenStorage) {
      // Validate required config
      if (!config.consumerKey) {
         throw new ConfigError('consumerKey is required');
      }
      if (!config.consumerSecret) {
         throw new ConfigError('consumerSecret is required');
      }

      // Set defaults for optional config
      this.config = {
         consumerKey: config.consumerKey,
         consumerSecret: config.consumerSecret,
         accessToken: config.accessToken,
         accessTokenSecret: config.accessTokenSecret,
         sessionHandle: config.sessionHandle,
         debug: config.debug ?? false,
         timeout: config.timeout ?? 30000,
         maxRetries: config.maxRetries ?? 3,
      };

      this.tokenStorage = tokenStorage;

      // Initialize OAuth client
      this.oauthClient = new OAuthClient(
         this.config.consumerKey,
         this.config.consumerSecret,
      );

      // Initialize HTTP client
      this.httpClient = new HttpClient(
         this.oauthClient,
         this.config.accessToken,
         this.config.accessTokenSecret,
         {
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries,
            debug: this.config.debug,
         },
      );

      // TODO: Initialize resource clients in Phase 2
      // this.user = new UserResource(this.httpClient);
      // this.league = new LeagueResource(this.httpClient);
      // this.team = new TeamResource(this.httpClient);
      // this.player = new PlayerResource(this.httpClient);
      // this.transaction = new TransactionResource(this.httpClient);
   }

   /**
    * Gets the authorization URL for the OAuth flow
    *
    * Step 1 of the OAuth flow. The user must visit this URL and authorize the application.
    * After authorization, Yahoo will provide a verifier code.
    *
    * @param callback - Callback URL (use 'oob' for out-of-band / manual entry)
    * @returns Authorization URL that the user must visit
    * @throws {AuthenticationError} If request fails
    *
    * @example
    * ```typescript
    * const authUrl = await client.getAuthUrl();
    * console.log('Please visit:', authUrl);
    * console.log('After authorizing, you will receive a verifier code.');
    * ```
    */
   async getAuthUrl(callback = 'oob'): Promise<string> {
      const { url, token, tokenSecret } =
         await this.oauthClient.getAuthorizationUrl(callback);

      // Store state for the next step
      this.oauthState = { token, tokenSecret };

      return url;
   }

   /**
    * Completes authentication with the verifier code
    *
    * Step 2 of the OAuth flow. After the user authorizes and receives a verifier code,
    * call this method to exchange it for access tokens.
    *
    * @param verifier - Verifier code from Yahoo OAuth flow
    * @throws {AuthenticationError} If authentication fails
    * @throws {ConfigError} If getAuthUrl() wasn't called first
    *
    * @example
    * ```typescript
    * const authUrl = await client.getAuthUrl();
    * console.log('Visit:', authUrl);
    *
    * const verifier = '...'; // Get this from the user after they authorize
    * await client.authenticate(verifier);
    *
    * console.log('Authenticated successfully!');
    * ```
    */
   async authenticate(verifier: string): Promise<void> {
      if (!this.oauthState) {
         throw new ConfigError(
            'Must call getAuthUrl() first to initiate OAuth flow',
         );
      }

      const tokens = await this.oauthClient.getAccessToken(
         this.oauthState.token,
         this.oauthState.tokenSecret,
         verifier,
      );

      // Save tokens
      this.setTokens(tokens);

      // Clear OAuth state
      this.oauthState = undefined;

      // Save to storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.save(tokens);
      }
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
    * const client = new YahooFantasyClient(config, storage);
    *
    * if (await client.loadTokens()) {
    *   console.log('Using saved tokens');
    * } else {
    *   console.log('No saved tokens, need to authenticate');
    *   const authUrl = await client.getAuthUrl();
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
         this.setTokens(tokens);
         return true;
      }

      return false;
   }

   /**
    * Refreshes the access token using the session handle
    *
    * Yahoo access tokens expire after some time. If a session handle was provided
    * during authentication, you can use it to get new tokens without re-authenticating.
    *
    * @throws {AuthenticationError} If refresh fails
    * @throws {ConfigError} If no session handle is available
    *
    * @example
    * ```typescript
    * try {
    *   await client.refreshToken();
    *   console.log('Token refreshed successfully');
    * } catch (error) {
    *   console.log('Refresh failed, need to re-authenticate');
    *   await client.authenticate(verifier);
    * }
    * ```
    */
   async refreshToken(): Promise<void> {
      if (!this.config.accessToken || !this.config.accessTokenSecret) {
         throw new ConfigError('No access tokens available to refresh');
      }

      if (!this.config.sessionHandle) {
         throw new ConfigError(
            'No session handle available. Cannot refresh without re-authenticating.',
         );
      }

      const tokens = await this.oauthClient.refreshAccessToken(
         this.config.accessToken,
         this.config.accessTokenSecret,
         this.config.sessionHandle,
      );

      this.setTokens(tokens);

      // Save to storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.save(tokens);
      }
   }

   /**
    * Checks if the client is currently authenticated
    *
    * @returns True if the client has valid access tokens
    *
    * @example
    * ```typescript
    * if (!client.isAuthenticated()) {
    *   await client.authenticate(verifier);
    * }
    * ```
    */
   isAuthenticated(): boolean {
      return !!this.config.accessToken && !!this.config.accessTokenSecret;
   }

   /**
    * Gets the current OAuth tokens
    *
    * @returns Current tokens or null if not authenticated
    *
    * @example
    * ```typescript
    * const tokens = client.getTokens();
    * if (tokens) {
    *   // Save tokens for later use
    *   await saveToDatabase(tokens);
    * }
    * ```
    */
   getTokens(): OAuthTokens | null {
      if (!this.config.accessToken || !this.config.accessTokenSecret) {
         return null;
      }

      return {
         accessToken: this.config.accessToken,
         accessTokenSecret: this.config.accessTokenSecret,
         sessionHandle: this.config.sessionHandle,
      };
   }

   /**
    * Clears stored authentication tokens
    *
    * @example
    * ```typescript
    * client.logout();
    * console.log('Logged out successfully');
    * ```
    */
   async logout(): Promise<void> {
      this.config.accessToken = undefined;
      this.config.accessTokenSecret = undefined;
      this.config.sessionHandle = undefined;
      this.httpClient.setTokens('', '');

      // Clear from storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.clear();
      }
   }

   /**
    * Sets OAuth tokens (internal method)
    */
   private setTokens(tokens: OAuthTokens): void {
      this.config.accessToken = tokens.accessToken;
      this.config.accessTokenSecret = tokens.accessTokenSecret;
      this.config.sessionHandle = tokens.sessionHandle;

      this.httpClient.setTokens(
         tokens.accessToken,
         tokens.accessTokenSecret,
      );
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
