/**
 * Transaction resource types
 *
 * ⚠️ **EXPERIMENTAL** - Transaction operations have not been extensively tested
 * in integration environments. Use with caution and please report any issues.
 *
 * @module
 */

import type {
   BaseMetadata,
   PaginationParams,
   ResourceKey,
   TransactionStatus,
   TransactionType,
} from '../common';

/**
 * Represents a transaction in the Yahoo Fantasy Sports system.
 *
 * @interface Transaction
 * @description Contains transaction information including players involved,
 * type (add/drop, waiver, trade), status, and related details.
 */
export interface Transaction extends BaseMetadata {
   /** Unique identifier for the transaction in format "gameId.l.leagueId.tx.transactionId" */
   transactionKey: ResourceKey;
   /** Numeric transaction identifier */
   transactionId: string;
   /** Type of transaction (e.g., "add", "drop", "trade", "waiver") */
   type: TransactionType;
   /** Current status of the transaction (e.g., "pending", "approved", "failed") */
   status: TransactionStatus;
   /** Unix timestamp of when transaction occurred */
   timestamp: number;
   /** Players involved in the transaction (optional) */
   players?: TransactionPlayer[];
   /** Waiver claim details (if waiver transaction) */
   waiver?: WaiverDetails;
   /** Trade details (if trade transaction) */
   trade?: TradeDetails;
   /** FAAB bid amount (if waiver with FAAB) */
   faabBid?: number;
}

/**
 * Represents a player involved in a transaction.
 *
 * @interface TransactionPlayer
 * @description Contains player information and the specific transaction details for that player.
 */
export interface TransactionPlayer {
   /** Unique identifier for the player in format "gameId.p.playerId" */
   playerKey: ResourceKey;
   /** Numeric player identifier */
   playerId: string;
   /** Player's full name and components */
   name: PlayerName;
   /** Transaction action details for this player */
   transactionData: TransactionData;
   /** Abbreviation of the real-world team */
   editorialTeamAbbr?: string;
   /** Display position (e.g., "C", "LW", "RW", "D", "G") */
   displayPosition?: string;
   /** URL to player headshot image */
   headshotUrl?: string;
}

/**
 * Player name in a transaction.
 *
 * @interface PlayerName
 * @description Contains player name components.
 */
export interface PlayerName {
   /** Full name of the player */
   full: string;
   /** First name */
   first: string;
   /** Last name */
   last: string;
}

/**
 * Transaction data for a player.
 *
 * @interface TransactionData
 * @description Specifies the transaction action and source/destination information.
 */
export interface TransactionData {
   /** Transaction action type (add, drop, or trade) */
   type: 'add' | 'drop' | 'trade';
   /** Source type for the action (freeagents, waivers, or team) */
   sourceType?: 'freeagents' | 'waivers' | 'team';
   /** Source team key (if player is from a team) */
   sourceTeamKey?: ResourceKey;
   /** Destination type for the action */
   destinationType?: 'team' | 'waivers' | 'freeagents';
   /** Destination team key (if being added to a team) */
   destinationTeamKey?: ResourceKey;
}

/**
 * Represents waiver claim details.
 *
 * @interface WaiverDetails
 * @description Contains information about a waiver claim including priority and date.
 */
export interface WaiverDetails {
   /** Waiver priority number for this claim */
   waiverPriority?: number;
   /** Unix timestamp of when waiver clears */
   waiverDate?: number;
}

/**
 * Represents trade details.
 *
 * @interface TradeDetails
 * @description Contains information about a proposed or completed trade including teams,
 * notes, voting information, and timestamps.
 */
export interface TradeDetails {
   /** Teams involved in the trade */
   teams: TradeTeam[];
   /** Optional note attached to the trade */
   tradeNote?: string;
   /** Vote totals for the trade (if league votes on trades) */
   votes?: TradeVotes;
   /** Unix timestamp of when trade was proposed */
   tradeProposedTime?: number;
   /** Unix timestamp of when trade was accepted */
   tradeAcceptedTime?: number;
}

/**
 * Represents a team in a trade.
 *
 * @interface TradeTeam
 * @description Contains team information for a team involved in a trade.
 */
export interface TradeTeam {
   /** Unique identifier for the team */
   teamKey: ResourceKey;
   /** Team name */
   teamName: string;
}

/**
 * Represents trade voting information.
 *
 * @interface TradeVotes
 * @description Contains vote counts for trade approval/veto.
 */
export interface TradeVotes {
   /** Number of votes to allow the trade */
   allow: number;
   /** Number of votes to veto the trade */
   veto: number;
   /** Number of votes remaining */
   remaining: number;
}

/**
 * Parameters for retrieving transactions.
 *
 * @interface GetTransactionsParams
 * @description Optional filters for transaction retrieval.
 */
export interface GetTransactionsParams extends PaginationParams {
   /** Filter by one or more transaction types (optional) */
   type?: TransactionType | TransactionType[];
   /** Filter by team key (optional) */
   teamKey?: ResourceKey;
}

/**
 * Parameters for executing an add/drop transaction.
 *
 * @interface AddDropPlayerParams
 * @description Required and optional fields for adding and dropping players.
 */
export interface AddDropPlayerParams {
   /** Team key performing the transaction */
   teamKey: ResourceKey;
   /** Player key to add to the team */
   addPlayerKey: ResourceKey;
   /** Player key to drop from the team (optional for adds from free agents) */
   dropPlayerKey?: ResourceKey;
   /** FAAB bid amount (if using FAAB waivers) */
   faabBid?: number;
}

/**
 * Parameters for placing a waiver claim.
 *
 * @interface WaiverClaimParams
 * @description Required and optional fields for waiver claim transactions.
 */
export interface WaiverClaimParams {
   /** Team key placing the waiver claim */
   teamKey: ResourceKey;
   /** Player key to claim on waivers */
   claimPlayerKey: ResourceKey;
   /** Player key to drop from roster */
   dropPlayerKey: ResourceKey;
   /** FAAB bid amount (if using FAAB) */
   faabBid?: number;
   /** Waiver priority override (if applicable) */
   waiverPriority?: number;
}

/**
 * Parameters for proposing a trade.
 *
 * @interface ProposeTradeParams
 * @description Required and optional fields for trade proposals.
 */
export interface ProposeTradeParams {
   /** Team key proposing the trade */
   proposingTeamKey: ResourceKey;
   /** Team key receiving the trade proposal */
   receivingTeamKey: ResourceKey;
   /** Player keys being sent by proposing team */
   sendingPlayerKeys: ResourceKey[];
   /** Player keys being received by proposing team */
   receivingPlayerKeys: ResourceKey[];
   /** Optional note for the trade proposal */
   tradeNote?: string;
}

/**
 * Parameters for accepting a trade proposal.
 *
 * @interface AcceptTradeParams
 * @description Required fields for accepting a trade.
 */
export interface AcceptTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
   /** Team key accepting the trade */
   teamKey: ResourceKey;
}

/**
 * Parameters for rejecting a trade proposal.
 *
 * @interface RejectTradeParams
 * @description Required and optional fields for rejecting a trade.
 */
export interface RejectTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
   /** Team key rejecting the trade */
   teamKey: ResourceKey;
   /** Optional reason for rejection */
   reason?: string;
}

/**
 * Parameters for canceling a trade proposal.
 *
 * @interface CancelTradeParams
 * @description Required fields for canceling a trade (must be proposer).
 */
export interface CancelTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
   /** Team key canceling the trade (must be the proposing team) */
   teamKey: ResourceKey;
}

/**
 * Parameters for commissioner allowing a trade.
 *
 * @interface AllowTradeParams
 * @description Required fields for commissioner trade approval.
 */
export interface AllowTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
}

/**
 * Parameters for commissioner disallowing a trade.
 *
 * @interface DisallowTradeParams
 * @description Required fields for commissioner trade rejection.
 */
export interface DisallowTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
}

/**
 * Parameters for voting against a trade.
 *
 * @interface VoteAgainstTradeParams
 * @description Required and optional fields for trade voting.
 */
export interface VoteAgainstTradeParams {
   /** Transaction key of the trade proposal */
   transactionKey: ResourceKey;
   /** Team key voting against the trade */
   teamKey: ResourceKey;
   /** Optional note or reason for the vote */
   note?: string;
}

/**
 * Parameters for editing a waiver claim.
 *
 * @interface EditWaiverClaimParams
 * @description Optional fields that can be modified for a waiver claim.
 */
export interface EditWaiverClaimParams {
   /** Transaction key of the waiver claim */
   transactionKey: ResourceKey;
   /** New FAAB bid amount (if changing) */
   faabBid?: number;
   /** New waiver priority (if changing) */
   waiverPriority?: number;
}

/**
 * Represents a transaction response from the API.
 *
 * @interface TransactionResponse
 * @description Contains success/failure status and transaction details or error information.
 */
export interface TransactionResponse {
   /** Whether the transaction was successful */
   success: boolean;
   /** Transaction key (if successful) */
   transactionKey?: ResourceKey;
   /** Transaction details (if successful) */
   transaction?: Transaction;
   /** Error message (if failed) */
   error?: string;
   /** Error code (if failed) */
   errorCode?: string;
}
