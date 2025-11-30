import type { Game } from './game.js';
import type { League } from './league.js';
import type { Player } from './player.js';
import type { Team } from './team.js';
import type { Transaction } from './transaction.js';
import type { User } from './user.js';

/**
 * API response wrapper for game data.
 * Wraps the Game object returned from API endpoints.
 */
export interface GameResponse {
   /** The game data */
   game: Game;
}
/**
 * API response wrapper for games data.
 * Wraps the Games array returned from API endpoints.
 */
export interface GamesResponse {
   /** The games data */
   games: Game[];
}

/**
 * API response wrapper for league data.
 * Wraps the League object returned from API endpoints.
 */
export interface LeagueResponse<
   T extends PlayersResponse | unknown = unknown,
> {
   /** The league data */
   league: League & T;
}

/**
 * API response wrapper for leagues data.
 * Wraps the Leagues array returned from API endpoints.
 */
export interface LeaguesResponse {
   /** The leagues data */
   leagues: League[];
}

/**
 * API response wrapper for player data.
 * Wraps the Player object returned from API endpoints.
 */
export interface PlayerResponse {
   /** The player data */
   player: Player;
}
/**
 * API response wrapper for players data.
 * Wraps the Players array returned from API endpoints.
 */
export interface PlayersResponse {
   /** The players data */
   players: Player[];
}

/**
 * API response wrapper for team data.
 * Wraps the Team object returned from API endpoints.
 */
export interface TeamResponse {
   /** The team data */
   team: Team;
}
/**
 * API response wrapper for teams data.
 * Wraps the Teams array returned from API endpoints.
 */
export interface TeamsResponse {
   /** The teams data */
   teams: Team[];
}
/**
 * API response wrapper for transaction data.
 * Wraps the Transaction object returned from API endpoints.
 */
export interface TransactionResponse {
   /** The transaction data */
   transaction: Transaction;
}
/**
 * API response wrapper for transactions data.
 * Wraps the Transactions array returned from API endpoints.
 */
export interface TransactionsResponse {
   /** The transactions data */
   transactions: Transaction[];
}
/**
 * API response wrapper for user data.
 * Wraps the User object returned from API endpoints.
 */
export interface UserResponse {
   /** The user data */
   user: User;
}
/**
 * API response wrapper for users data.
 * Wraps the Users array returned from API endpoints.
 */
export interface UsersResponse {
   /** The users data */
   users: User[];
}

export type TransactionResult =
   | {
        success: true;
        transactionKey: string;
        transaction?: Transaction;
     }
   | {
        success: false;
        error: string;
        errorCode: TransactionErrorCode;
     };

export type TransactionErrorCode =
   | 'TRANSACTION_FAILED'
   | 'TRADE_PROPOSAL_FAILED'
   | 'TRADE_ACCEPT_FAILED'
   | 'TRADE_REJECT_FAILED'
   | 'TRADE_CANCEL_FAILED'
   | 'TRADE_ALLOW_FAILED'
   | 'TRADE_DISALLOW_FAILED'
   | 'TRADE_VOTE_FAILED'
   | 'WAIVER_EDIT_FAILED';
