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
 *   clientId: process.env.YAHOO_CLIENT_ID!,
 *   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
 *   redirectUri: 'https://example.com/callback',
 * });
 *
 * // Step 1: Get authorization URL
 * const authUrl = client.getAuthUrl();
 * console.log('Visit this URL and authorize:', authUrl);
 *
 * // Step 2: User authorizes and gets redirected with code
 * // (Alternatively, ask the user to input the code manually)
 * const code = '...'; // User authorization code from yahoo
 *
 * // Step 3: Exchange code for tokens
 * await client.authenticate(code);
 *
 * // Make API calls
 * const leagues = await client.league.get('423.l.12345');
 * const roster = await client.team.getRoster('423.l.12345.t.1');
 * ```
 */

import { GameResource } from '../resources/GameResource.js';
import { LeagueResource } from '../resources/LeagueResource.js';
import { PlayerResource } from '../resources/PlayerResource.js';
import { TeamResource } from '../resources/TeamResource.js';
import { TransactionResource } from '../resources/TransactionResource.js';
import { UserResource } from '../resources/UserResource.js';
import type { Config } from '../types/index.js';
import { ConfigError } from '../types/index.js';
import { HttpClient } from './HttpClient.js';
import { OAuth1Client } from './OAuth1Client.js';
import { OAuth2Client, type OAuth2Tokens } from './OAuth2Client.js';

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
 * Provides access to all fantasy sports resources through a fluent, resource-based API.
 * Each resource (league, team, player, etc.) is accessed via properties on this client.
 *
 * @example
 * ```typescript
 * const client = new YahooFantasyClient({
 *   clientId: 'your-client-id',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://example.com/callback',
 * });
 *
 * // Step 1: Get authorization URL
 * const authUrl = client.getAuthUrl();
 * console.log('Visit this URL and authorize:', authUrl);
 *
 * // Step 2: User authorizes and gets redirected with code
 * // Extract code from redirect: ?code=AUTHORIZATION_CODE
 *
 * // Step 3: Complete authentication
 * await client.authenticate(code);
 *
 * // Use resource clients
 * const league = await client.league.get('423.l.12345');
 * const teams = await client.user.getTeams({ gameCode: 'nhl' });
 * ```
 */
export class YahooFantasyClient {
   private config: Config & {
      debug: boolean;
      rawXml: boolean;
      timeout: number;
      maxRetries: number;
   };

   private oauth2Client?: OAuth2Client;
   private oauth1Client?: OAuth1Client;
   private httpClient: HttpClient;
   private tokenStorage?: TokenStorage;
   private tokens?: OAuth2Tokens;

   /**
    * User resource client
    *
    * Access user-related operations
    *
    * @example
    * ```typescript
    * // Get current user
    * const user = await client.user.getCurrentUser();
    *
    * // Get user's teams
    * const teams = await client.user.getTeams({ gameCode: 'nhl' });
    * ```
    */
   public readonly user!: UserResource;

   /**
    * League resource client
    *
    * Access league-related operations
    *
    * @example
    * ```typescript
    * // Get league info
    * const league = await client.league.get('423.l.12345');
    *
    * // Get league standings
    * const standings = await client.league.getStandings('423.l.12345');
    *
    * // Get league scoreboard
    * const scoreboard = await client.league.getScoreboard('423.l.12345');
    * ```
    */
   public readonly league!: LeagueResource;

   /**
    * Team resource client
    *
    * Access team-related operations
    *
    * @example
    * ```typescript
    * // Get team info
    * const team = await client.team.get('423.l.12345.t.1');
    *
    * // Get team roster
    * const roster = await client.team.getRoster('423.l.12345.t.1');
    *
    * // Update roster positions
    * await client.team.updateRoster('423.l.12345.t.1', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    *   players: [
    *     { playerKey: '423.p.8888', position: 'C' },
    *     { playerKey: '423.p.7777', position: 'LW' },
    *   ],
    * });
    * ```
    */
   public readonly team!: TeamResource;

   /**
    * Player resource client
    *
    * Access player-related operations
    *
    * @example
    * ```typescript
    * // Search for players
    * const results = await client.player.search('423.l.12345', {
    *   search: 'McDavid',
    * });
    *
    * // Get free agents
    * const freeAgents = await client.player.search('423.l.12345', {
    *   status: 'FA',
    *   position: 'C',
    *   sort: '60',
    *   count: 25,
    * });
    *
    * // Get player details
    * const player = await client.player.get('423.p.8888', {
    *   includeStats: true,
    * });
    * ```
    */
   public readonly player!: PlayerResource;

   /**
    * Transaction resource client
    *
    * Access transaction operations (add/drop, waivers, trades)
    *
    * @example
    * ```typescript
    * // Add a free agent
    * await client.transaction.addPlayer({
    *   teamKey: '423.l.12345.t.1',
    *   addPlayerKey: '423.p.8888',
    * });
    *
    * // Add/drop with FAAB bid
    * await client.transaction.addDropPlayer({
    *   teamKey: '423.l.12345.t.1',
    *   addPlayerKey: '423.p.8888',
    *   dropPlayerKey: '423.p.7777',
    *   faabBid: 15,
    * });
    *
    * // View league transactions
    * const transactions = await client.transaction.getLeagueTransactions('423.l.12345');
    * ```
    */
   public readonly transaction!: TransactionResource;

   /**
    * Game resource client
    *
    * Access game-related operations
    *
    * @example
    * ```typescript
    * // Get game info
    * const game = await client.game.get('423');
    *
    * // Get available games
    * const games = await client.game.getGames({ isAvailable: true });
    *
    * // Search for players in a game
    * const players = await client.game.searchPlayers('423', {
    *   search: 'McDavid',
    *   position: 'C',
    * });
    * ```
    */
   public readonly game!: GameResource;

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
    * const client = new YahooFantasyClient(config, storage);
    *
    * // Try to load existing tokens
    * await client.loadTokens();
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
         rawXml: config.rawXml ?? false,
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
         this.tokens,
         async () => {
            if (!this.oauth2Client) {
               throw new ConfigError(
                  'OAuth 2.0 client is not available in public mode',
               );
            }
            if (!this.tokens?.refreshToken) {
               throw new ConfigError('No refresh token available');
            }
            const newTokens = await this.oauth2Client.refreshAccessToken(
               this.tokens.refreshToken,
            );
            await this.setTokens(newTokens);
            return newTokens;
         },
         {
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries,
            debug: this.config.debug,
            rawXml: this.config.rawXml,
            oauth1Client: this.oauth1Client,
         },
      );

      // Initialize resource clients
      this.user = new UserResource(this.httpClient);
      this.league = new LeagueResource(this.httpClient);
      this.team = new TeamResource(this.httpClient);
      this.player = new PlayerResource(this.httpClient);
      this.transaction = new TransactionResource(this.httpClient);
      this.game = new GameResource(this.httpClient);
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
    * @throws {ConfigError} If called in public mode
    *
    * @example
    * ```typescript
    * const authUrl = client.getAuthUrl('random-state-string');
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

   /**
    * Completes authentication with the authorization code
    *
    * Step 2 of the OAuth flow. After the user authorizes and is redirected with a code,
    * call this method to exchange it for access and refresh tokens.
    *
    * @param code - Authorization code from Yahoo OAuth redirect
    * @throws {AuthenticationError} If authentication fails
    *
    * @example
    * ```typescript
    * const authUrl = client.getAuthUrl();
    * console.log('Visit:', authUrl);
    *
    * // After user authorizes and is redirected to:
    * // https://your-redirect-uri?code=AUTHORIZATION_CODE
    *
    * const code = '...'; // Extract from redirect URL
    * await client.authenticate(code);
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
    * @throws {AuthenticationError} If authentication fails
    * @throws {ConfigError} If called in public mode
    *
    * @example
    * ```typescript
    * const authUrl = client.getAuthUrl();
    * console.log('Visit:', authUrl);
    *
    * // After user authorizes and is redirected to:
    * // https://your-redirect-uri?code=AUTHORIZATION_CODE
    *
    * const code = '...'; // Extract from redirect URL
    * await client.authenticate(code);
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
    * const client = new YahooFantasyClient(config, storage);
    *
    * if (await client.loadTokens()) {
    *   console.log('Using saved tokens');
    * } else {
    *   console.log('No saved tokens, need to authenticate');
    *   const authUrl = client.getAuthUrl();
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
    * @throws {AuthenticationError} If refresh fails
    * @throws {ConfigError} If no refresh token is available or if called in public mode
    *
    * @example
    * ```typescript
    * try {
    *   await client.refreshToken();
    *   console.log('Token refreshed successfully');
    * } catch (error) {
    *   console.log('Refresh failed, need to re-authenticate');
    *   await client.authenticate(code);
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

      const newTokens = await this.oauth2Client.refreshAccessToken(
         this.tokens.refreshToken,
      );
      await this.setTokens(newTokens);
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
    * if (!client.isAuthenticated()) {
    *   await client.authenticate(code);
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
    * if (client.isTokenExpired()) {
    *   await client.refreshToken();
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
    * const tokens = client.getTokens();
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
    * await client.logout();
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

      this.httpClient.setTokens(tokens);

      // Save to storage if available
      if (this.tokenStorage) {
         await this.tokenStorage.save(tokens);
      }
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
