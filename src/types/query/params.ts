/**
 * Parameter Types and Enums
 *
 * Defines typed parameters for Yahoo Fantasy API queries.
 * Provides enums for autocomplete while allowing string fallback for ease of use.
 *
 * @module
 */

/**
 * Player status in league context
 */
export enum PlayerStatusParam {
   /** Available */
   Available = 'A',
   /** Free Agent */
   FreeAgent = 'FA',
   /** Waivers */
   Waivers = 'W',
   /** Taken (on a team) */
   Taken = 'T',
   /** Keep - protected from drops */
   Keep = 'K',
}

/**
 * Coverage type for stats
 */
export enum CoverageTypeParam {
   Season = 'season',
   Week = 'week',
   Date = 'date',
   LastWeek = 'lastweek',
   LastMonth = 'lastmonth',
}

/**
 * Sort options for player queries
 * Common stat IDs and special values
 */
export enum SortParam {
   /** Actual Rank */
   ActualRank = 'AR',
   /** Projected Rank */
   ProjectedRank = 'PR',
   /** Points */
   Points = 'PTS',
   /** Percent Owned */
   PercentOwned = 'PO',
   /** Percent Started */
   PercentStarted = 'PS',
   /** Plus/Minus (NHL) */
   PlusMinus = '3',
   /** Goals (NHL/NBA) */
   Goals = '4',
   /** Assists (NHL/NBA) */
   Assists = '5',
   /** Penalty Minutes (NHL) */
   PenaltyMinutes = '7',
   /** Power Play Points (NHL) */
   PowerPlayPoints = '18',
   /** Shots on Goal (NHL) */
   ShotsOnGoal = '2',
   /** Faceoff Wins (NHL) */
   FaceoffWins = '74',
   /** Hits (NHL) */
   Hits = '12',
   /** Blocks (NHL) */
   Blocks = '16',
   /** Passing Yards (NFL) */
   PassingYards = '4',
   /** Passing TDs (NFL) */
   PassingTDs = '5',
   /** Rush Yards (NFL) */
   RushYards = '8',
   /** Rush TDs (NFL) */
   RushTDs = '9',
   /** Receptions (NFL) */
   Receptions = '11',
   /** Receiving Yards (NFL) */
   ReceivingYards = '12',
   /** Receiving TDs (NFL) */
   ReceivingTDs = '13',
   /** QBR (NFL) */
   QBR = '65',
   /** Fantasy Points (NFL) */
   FantasyPoints = '60',
}

/**
 * Transaction type filter
 */
export enum TransactionTypeParam {
   /** Add */
   Add = 'add',
   /** Drop */
   Drop = 'drop',
   /** Add/Drop */
   AddDrop = 'add/drop',
   /** Trade */
   Trade = 'trade',
   /** Pending Trade */
   PendingTrade = 'pending_trade',
   /** Waiver */
   Waiver = 'waiver',
   /** Commissioner */
   Commish = 'commish',
}

/**
 * League sub-resources that can be requested via 'out' parameter
 */
export enum LeagueSubResource {
   Settings = 'settings',
   Standings = 'standings',
   Scoreboard = 'scoreboard',
   Teams = 'teams',
   Players = 'players',
   Transactions = 'transactions',
   Drafts = 'drafts',
}

/**
 * Team sub-resources that can be requested via 'out' parameter
 */
export enum TeamSubResource {
   Roster = 'roster',
   Matchups = 'matchups',
   Stats = 'stats',
   Standings = 'standings',
}

/**
 * Game sub-resources that can be requested via 'out' parameter
 */
export enum GameSubResource {
   Leagues = 'leagues',
   Players = 'players',
   StatCategories = 'stat_categories',
   PositionTypes = 'position_types',
   GameWeeks = 'game_weeks',
}

/**
 * Player sub-resources that can be requested via 'out' parameter
 */
export enum PlayerSubResource {
   Stats = 'stats',
   Ownership = 'ownership',
   PercentOwned = 'percent_owned',
   DraftAnalysis = 'draft_analysis',
}

/**
 * Parameter value that can be either an enum value or a raw string
 * Provides autocomplete from enum while allowing arbitrary strings
 */
export type ParamValue<T extends string> = T | string;

/**
 * Record of parameters for a query
 * Keys are parameter names, values can be strings or arrays
 */
export interface QueryParams {
   [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Common query parameter keys
 */
export type CommonParamKey =
   | 'out'
   | 'sort'
   | 'sort_type'
   | 'sort_season'
   | 'sort_date'
   | 'sort_week'
   | 'league_keys'
   | 'game_keys'
   | 'team_keys'
   | 'player_keys'
   | 'search'
   | 'start'
   | 'count'
   | 'status'
   | 'position'
   | 'type'
   | 'week'
   | 'date'
   | 'is_available'
   | 'season'
   | 'use_login'
   | 'types'
   | 'team_key';

/**
 * Game-specific parameter keys
 */
export type GameParamKey = 'game_keys' | 'is_available' | 'season';

/**
 * League-specific parameter keys
 */
export type LeagueParamKey = 'league_keys' | 'out';

/**
 * Team-specific parameter keys
 */
export type TeamParamKey = 'team_keys' | 'out';

/**
 * Player-specific parameter keys
 */
export type PlayerParamKey =
   | 'player_keys'
   | 'position'
   | 'status'
   | 'sort'
   | 'count'
   | 'start'
   | 'search';

/**
 * Transaction-specific parameter keys
 */
export type TransactionParamKey = 'types' | 'team_key' | 'count' | 'start';

/**
 * All valid parameter keys
 */
export type AllParamKey =
   | CommonParamKey
   | GameParamKey
   | LeagueParamKey
   | TeamParamKey
   | PlayerParamKey
   | TransactionParamKey;
