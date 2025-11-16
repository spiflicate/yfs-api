/**
 * Transaction resource types
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
 * Transaction information
 */
export interface Transaction extends BaseMetadata {
   /**
    * Transaction key
    */
   transactionKey: ResourceKey;

   /**
    * Transaction ID
    */
   transactionId: string;

   /**
    * Transaction type
    */
   type: TransactionType;

   /**
    * Transaction status
    */
   status: TransactionStatus;

   /**
    * Timestamp (Unix timestamp)
    */
   timestamp: number;

   /**
    * Players involved in the transaction
    */
   players?: TransactionPlayer[];

   /**
    * Waiver details (if waiver transaction)
    */
   waiver?: WaiverDetails;

   /**
    * Trade details (if trade transaction)
    */
   trade?: TradeDetails;

   /**
    * FAAB bid (if waiver with FAAB)
    */
   faabBid?: number;
}

/**
 * Player in a transaction
 */
export interface TransactionPlayer {
   /**
    * Player key
    */
   playerKey: ResourceKey;

   /**
    * Player ID
    */
   playerId: string;

   /**
    * Player name
    */
   name: {
      full: string;
      first: string;
      last: string;
   };

   /**
    * Transaction data for this player
    */
   transactionData: {
      /**
       * Type (add, drop, trade)
       */
      type: 'add' | 'drop' | 'trade';

      /**
       * Source type (freeagents, waivers, team)
       */
      sourceType?: 'freeagents' | 'waivers' | 'team';

      /**
       * Source team key (if from team)
       */
      sourceTeamKey?: ResourceKey;

      /**
       * Destination type
       */
      destinationType?: 'team' | 'waivers' | 'freeagents';

      /**
       * Destination team key (if to team)
       */
      destinationTeamKey?: ResourceKey;
   };

   /**
    * Editorial team abbreviation
    */
   editorialTeamAbbr?: string;

   /**
    * Display position
    */
   displayPosition?: string;

   /**
    * Headshot URL
    */
   headshotUrl?: string;
}

/**
 * Waiver details
 */
export interface WaiverDetails {
   /**
    * Waiver priority
    */
   waiverPriority?: number;

   /**
    * Waiver date (Unix timestamp)
    */
   waiverDate?: number;
}

/**
 * Trade details
 */
export interface TradeDetails {
   /**
    * Teams involved in trade
    */
   teams: Array<{
      /**
       * Team key
       */
      teamKey: ResourceKey;

      /**
       * Team name
       */
      teamName: string;
   }>;

   /**
    * Trade note
    */
   tradeNote?: string;

   /**
    * Trade votes
    */
   votes?: {
      /**
       * Votes to allow
       */
      allow: number;

      /**
       * Votes to veto
       */
      veto: number;

      /**
       * Votes remaining
       */
      remaining: number;
   };

   /**
    * Trade proposed time (Unix timestamp)
    */
   tradeProposedTime?: number;

   /**
    * Trade accepted time (Unix timestamp)
    */
   tradeAcceptedTime?: number;
}

/**
 * Parameters for getting transactions
 */
export interface GetTransactionsParams extends PaginationParams {
   /**
    * Filter by transaction type
    */
   type?: TransactionType | TransactionType[];

   /**
    * Filter by team key
    */
   teamKey?: ResourceKey;
}

/**
 * Parameters for add/drop transaction
 */
export interface AddDropPlayerParams {
   /**
    * Team key performing the transaction
    */
   teamKey: ResourceKey;

   /**
    * Player key to add
    */
   addPlayerKey: ResourceKey;

   /**
    * Player key to drop (optional for adds from free agents)
    */
   dropPlayerKey?: ResourceKey;

   /**
    * FAAB bid (if using FAAB waivers)
    */
   faabBid?: number;
}

/**
 * Parameters for waiver claim
 */
export interface WaiverClaimParams {
   /**
    * Team key performing the claim
    */
   teamKey: ResourceKey;

   /**
    * Player key to claim
    */
   claimPlayerKey: ResourceKey;

   /**
    * Player key to drop
    */
   dropPlayerKey: ResourceKey;

   /**
    * FAAB bid (if using FAAB)
    */
   faabBid?: number;

   /**
    * Waiver priority (if applicable)
    */
   waiverPriority?: number;
}

/**
 * Parameters for proposing a trade
 */
export interface ProposeTradeParams {
   /**
    * Team key proposing the trade
    */
   proposingTeamKey: ResourceKey;

   /**
    * Team key receiving the trade offer
    */
   receivingTeamKey: ResourceKey;

   /**
    * Player keys being sent by proposing team
    */
   sendingPlayerKeys: ResourceKey[];

   /**
    * Player keys being received by proposing team
    */
   receivingPlayerKeys: ResourceKey[];

   /**
    * Trade note
    */
   tradeNote?: string;
}

/**
 * Parameters for accepting a trade
 */
export interface AcceptTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;

   /**
    * Team key accepting the trade
    */
   teamKey: ResourceKey;
}

/**
 * Parameters for rejecting a trade
 */
export interface RejectTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;

   /**
    * Team key rejecting the trade
    */
   teamKey: ResourceKey;

   /**
    * Rejection reason
    */
   reason?: string;
}

/**
 * Parameters for canceling a trade
 */
export interface CancelTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;

   /**
    * Team key canceling the trade (must be proposer)
    */
   teamKey: ResourceKey;
}

/**
 * Parameters for commissioner allowing a trade
 */
export interface AllowTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;
}

/**
 * Parameters for commissioner disallowing a trade
 */
export interface DisallowTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;
}

/**
 * Parameters for voting against a trade
 */
export interface VoteAgainstTradeParams {
   /**
    * Transaction key of the trade
    */
   transactionKey: ResourceKey;

   /**
    * Team key voting against the trade
    */
   teamKey: ResourceKey;

   /**
    * Vote note/reason
    */
   note?: string;
}

/**
 * Parameters for editing a waiver claim
 */
export interface EditWaiverClaimParams {
   /**
    * Transaction key of the waiver claim
    */
   transactionKey: ResourceKey;

   /**
    * New FAAB bid (if changing)
    */
   faabBid?: number;

   /**
    * New waiver priority (if changing)
    */
   waiverPriority?: number;
}

/**
 * Transaction response
 */
export interface TransactionResponse {
   /**
    * Success status
    */
   success: boolean;

   /**
    * Transaction key (if successful)
    */
   transactionKey?: ResourceKey;

   /**
    * Transaction details (if successful)
    */
   transaction?: Transaction;

   /**
    * Error message (if failed)
    */
   error?: string;

   /**
    * Error code (if failed)
    */
   errorCode?: string;
}
