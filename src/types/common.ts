/**
 * Common types shared across all resources and sports
 * @module
 */

/**
 * Supported fantasy sports
 */
export type Sport = 'nfl' | 'nhl' | 'mlb' | 'nba';

/**
 * Game codes used by Yahoo Fantasy Sports API
 */
export type GameCode = 'nfl' | 'nhl' | 'mlb' | 'nba';

/**
 * Game types used by Yahoo Fantasy Sports API
 */
export type GameType =
   | 'full'
   | 'pickem-team'
   | 'pickem-group'
   | 'pickem-team-list';

/**
 * Resource key format: {game_id}.{resource_type}.{id}
 *
 * @example "423.l.12345" - League key (game 423, league 12345)
 * @example "423.l.12345.t.1" - Team key
 * @example "423.p.8888" - Player key
 */
export type ResourceKey =
   | string
   | GameKey
   | LeagueKey
   | TeamKey
   | PlayerKey
   | TransactionKey
   | WaiverClaimKey
   | PendingTradeKey;

/**
 * Game key format: `{game_id}`
 */
export type GameKey = `${number}`;

/**
 * League key format: `{game_id}.l.{league_id}`
 */
export type LeagueKey = `${number}.l.${number}`;

/**
 * Team key format: `{game_id}.l.{league_id}.t.{team_id}`
 */
export type TeamKey = `${number}.l.${number}.t.${number}`;

/**
 * Player key format: `{game_id}.p.{player_id}`
 */
export type PlayerKey = `${number}.p.${number}`;

/**
 * Transaction key format: `{game_id}.l.{league_id}.tr.{transaction_id}`
 */
export type TransactionKey = `${number}.l.${number}.tr.${number}`;

/**
 * Waiver claim key format: `{game_id}.l.{league_id}.w.c.{claim_id}`
 */
export type WaiverClaimKey = `${number}.l.${number}.w.c.${number}`;

/**
 * Pending trade key format: `{game_id}.l.{league_id}.pt.{pending_trade_id}`
 */
export type PendingTradeKey = `${number}.l.${number}.pt.${number}`;

/**
 * League scoring types
 */
export type ScoringType = 'head' | 'point' | 'roto';

/**
 * Draft status values
 */
export type DraftStatus = 'predraft' | 'drafting' | 'postdraft';

/**
 * Player status in league context
 */
export type PlayerStatus = 'A' | 'FA' | 'W' | 'T' | 'K';

/**
 * Transaction types
 */
export type TransactionType =
   | 'add'
   | 'drop'
   | 'add/drop'
   | 'trade'
   | 'pending_trade'
   | 'waiver'
   | 'commish';

/**
 * Transaction status
 */
export type TransactionStatus =
   | 'successful'
   | 'failed'
   | 'pending'
   | 'proposed'
   | 'accepted'
   | 'rejected'
   | 'cancelled';

/**
 * Coverage type for stats
 */
export type CoverageType =
   | 'season'
   | 'week'
   | 'date'
   | 'lastweek'
   | 'lastmonth';

/**
 * Elo rating tiers for competitive fantasy leagues.
 * Higher tiers indicate more competitive/experienced players.
 */
export type FeloTier =
   | 'platinum'
   | 'diamond'
   | 'gold'
   | 'silver'
   | 'bronze';

/**
 * Position type category
 */
export type PositionType = 'O' | 'D' | 'K' | 'P' | 'B' | 'DT' | 'G';

/**
 * Generic stat value (can be number or string depending on stat)
 */
export type StatValue = string | number;

/**
 * Base metadata common to many resources
 */
export interface BaseMetadata {
   /**
    * URL to the resource on Yahoo Fantasy Sports
    */
   url: string;

   /**
    * Last time this resource was updated (Unix timestamp)
    */
   lastUpdatedTimestamp?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
   /**
    * Starting index (0-based)
    * @default 0
    */
   start?: number;

   /**
    * Number of items to return
    * @default 25
    */
   count?: number;
}

/**
 * Date range parameters
 */
export interface DateRangeParams {
   /**
    * Start date (YYYY-MM-DD)
    */
   startDate?: string;

   /**
    * End date (YYYY-MM-DD)
    */
   endDate?: string;
}

/**
 * Sort parameters
 */
export interface SortParams {
   /**
    * Field to sort by (stat ID or special value)
    */
   sort?: string | number;

   /**
    * Sort direction
    */
   sortOrder?: 'asc' | 'desc';

   /**
    * Type of sort (when applicable)
    */
   sortType?: CoverageType;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
   /**
    * Response data
    */
   data: T;

   /**
    * Response metadata
    */
   meta?: {
      /**
       * Timestamp of the response
       */
      timestamp: number;

      /**
       * API version
       */
      version?: string;
   };
}

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
    * Optional: Return raw XML responses instead of parsed objects
    * Useful for debugging, inspecting response structure, or custom parsing
    * When true, all API methods return raw XML strings instead of typed objects
    * @default false
    */
   rawXml?: boolean;

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
