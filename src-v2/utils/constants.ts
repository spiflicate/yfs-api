/**
 * Constants used throughout the Yahoo Fantasy Sports API wrapper
 * @module
 */

/**
 * Yahoo Fantasy Sports API base URL
 */
export const API_BASE_URL =
   'https://fantasysports.yahooapis.com/fantasy/v2';

/**
 * Yahoo OAuth endpoints
 */
export const OAUTH_ENDPOINTS = {
   /**
    * Request token endpoint
    */
   REQUEST_TOKEN: 'https://api.login.yahoo.com/oauth/v2/get_request_token',

   /**
    * Authorization URL (user must visit this)
    */
   AUTHORIZE: 'https://api.login.yahoo.com/oauth/v2/request_auth',

   /**
    * Access token endpoint
    */
   ACCESS_TOKEN: 'https://api.login.yahoo.com/oauth/v2/get_token',
} as const;

/**
 * OAuth signature method
 */
export const OAUTH_SIGNATURE_METHOD = 'HMAC-SHA1';

/**
 * OAuth version
 */
export const OAUTH_VERSION = '1.0';

/**
 * Default request timeout in milliseconds
 */
export const DEFAULT_TIMEOUT = 30000;

/**
 * Default maximum retry attempts
 */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Default retry delay in milliseconds
 */
export const DEFAULT_RETRY_DELAY = 1000;

/**
 * Maximum retry delay in milliseconds (for exponential backoff)
 */
export const MAX_RETRY_DELAY = 32000;

/**
 * Rate limit window in milliseconds
 */
export const RATE_LIMIT_WINDOW = 1000;

/**
 * Maximum requests per rate limit window
 */
export const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Game codes for each sport
 */
export const GAME_CODES = {
   NFL: 'nfl',
   NHL: 'nhl',
   MLB: 'mlb',
   NBA: 'nba',
} as const;

/**
 * Game IDs by season (these change each year)
 * Note: These will need to be updated for each new season
 */
export const GAME_IDS = {
   NHL_2024: '449',
   NFL_2024: '449',
   MLB_2024: '431',
   NBA_2024: '449',
} as const;

/**
 * Player status values
 */
export const PLAYER_STATUS = {
   /** All players */
   ALL: 'A',
   /** Free agents */
   FREE_AGENT: 'FA',
   /** On waivers */
   WAIVERS: 'W',
   /** Taken (on a team) */
   TAKEN: 'T',
   /** Keepers */
   KEEPER: 'K',
} as const;

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
   ADD: 'add',
   DROP: 'drop',
   ADD_DROP: 'add/drop',
   TRADE: 'trade',
   PENDING_TRADE: 'pending_trade',
   WAIVER: 'waiver',
   COMMISSIONER: 'commish',
} as const;

/**
 * Coverage types for stats
 */
export const COVERAGE_TYPES = {
   SEASON: 'season',
   WEEK: 'week',
   DATE: 'date',
   LAST_WEEK: 'lastweek',
   LAST_MONTH: 'lastmonth',
} as const;

/**
 * Scoring types
 */
export const SCORING_TYPES = {
   /** Head-to-head each category */
   HEAD_TO_HEAD: 'head',
   /** Head-to-head points */
   POINTS: 'point',
   /** Rotisserie */
   ROTISSERIE: 'roto',
} as const;

/**
 * Draft statuses
 */
export const DRAFT_STATUSES = {
   PRE_DRAFT: 'predraft',
   POST_DRAFT: 'postdraft',
} as const;

/**
 * Position types by sport
 */
export const POSITIONS = {
   NHL: {
      CENTER: 'C',
      LEFT_WING: 'LW',
      RIGHT_WING: 'RW',
      WING: 'W',
      DEFENSE: 'D',
      GOALIE: 'G',
      BENCH: 'BN',
      INJURED_RESERVE: 'IR',
      INJURED_RESERVE_PLUS: 'IR+',
      UTILITY: 'Util',
   },
   NFL: {
      QUARTERBACK: 'QB',
      RUNNING_BACK: 'RB',
      WIDE_RECEIVER: 'WR',
      TIGHT_END: 'TE',
      KICKER: 'K',
      DEFENSE: 'DEF',
      FLEX_WR_RB: 'W/R',
      FLEX_WR_TE: 'W/T',
      FLEX_WR_RB_TE: 'W/R/T',
      BENCH: 'BN',
      INJURED_RESERVE: 'IR',
   },
   MLB: {
      CATCHER: 'C',
      FIRST_BASE: '1B',
      SECOND_BASE: '2B',
      THIRD_BASE: '3B',
      SHORTSTOP: 'SS',
      OUTFIELD: 'OF',
      STARTING_PITCHER: 'SP',
      RELIEF_PITCHER: 'RP',
      PITCHER: 'P',
      UTILITY: 'Util',
      BENCH: 'BN',
      DISABLED_LIST: 'DL',
   },
   NBA: {
      POINT_GUARD: 'PG',
      SHOOTING_GUARD: 'SG',
      SMALL_FORWARD: 'SF',
      POWER_FORWARD: 'PF',
      CENTER: 'C',
      GUARD: 'G',
      FORWARD: 'F',
      UTILITY: 'Util',
      BENCH: 'BN',
      INJURED_LIST: 'IL',
   },
} as const;

/**
 * NHL skater stat IDs used by Yahoo
 */
export const NHLSkaterStatEnum = {
   GamesPlayed: 0,
   Goals: 1,
   Assists: 2,
   Points: 3,
   PlusMinus: 4,
   PenaltyMinutes: 5,
   PowerPlayGoals: 6,
   PowerPlayAssists: 7,
   PowerPlayPoints: 8,
   ShorthandedGoals: 9,
   ShorthandedAssists: 10,
   ShorthandedPoints: 11,
   GameWinningGoals: 12,
   Shots: 13,
   ShootingPercentage: 14,
   FaceoffsWon: 15,
   FaceoffsLost: 16,
   Hits: 17,
   Blocks: 18,
} as const;

/**
 * NHL goalie stat IDs used by Yahoo
 */
export const NHLGoalieStatEnum = {
   GamesPlayed: 0,
   GamesStarted: 19,
   Wins: 20,
   Losses: 21,
   OvertimeLosses: 22,
   Shutouts: 23,
   GoalsAgainst: 24,
   GoalsAgainstAverage: 25,
   Saves: 26,
   SavePercentage: 27,
   ShotsAgainst: 28,
} as const;

/**
 * HTTP status codes we handle specifically
 */
export const HTTP_STATUS = {
   OK: 200,
   CREATED: 201,
   NO_CONTENT: 204,
   BAD_REQUEST: 400,
   UNAUTHORIZED: 401,
   FORBIDDEN: 403,
   NOT_FOUND: 404,
   TOO_MANY_REQUESTS: 429,
   INTERNAL_SERVER_ERROR: 500,
   BAD_GATEWAY: 502,
   SERVICE_UNAVAILABLE: 503,
   GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Retryable HTTP status codes
 */
export const RETRYABLE_STATUS_CODES = [
   HTTP_STATUS.TOO_MANY_REQUESTS,
   HTTP_STATUS.INTERNAL_SERVER_ERROR,
   HTTP_STATUS.BAD_GATEWAY,
   HTTP_STATUS.SERVICE_UNAVAILABLE,
   HTTP_STATUS.GATEWAY_TIMEOUT,
] as const;
