/**
 * Transaction resource client for Yahoo Fantasy Sports API
 *
 * ⚠️ **EXPERIMENTAL** - Transaction operations have not been extensively tested
 * in integration environments. The API surface is stable, but edge cases and error
 * handling may need refinement. Please report any issues you encounter.
 *
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   ResourceKey,
   TransactionStatus,
   TransactionType,
} from '../types/common.js';
import type {
   AcceptTradeParams,
   AddDropPlayerParams,
   AllowTradeParams,
   CancelTradeParams,
   DisallowTradeParams,
   EditWaiverClaimParams,
   GetTransactionsParams,
   ProposeTradeParams,
   RejectTradeParams,
   Transaction,
   TransactionPlayer,
   TransactionResponse,
   VoteAgainstTradeParams,
   WaiverClaimParams,
} from '../types/resources/transaction.js';

/**
 * Transaction resource client
 *
 * Provides methods to interact with Yahoo Fantasy transaction operations including
 * add/drop, waivers, trades, and commissioner actions.
 *
 * @example
 * ```typescript
 * const transactionClient = new TransactionResource(httpClient);
 *
 * // Get league transactions
 * const transactions = await transactionClient.getLeagueTransactions('423.l.12345');
 *
 * // Add a player from free agency
 * await transactionClient.addPlayer({
 *   teamKey: '423.l.12345.t.1',
 *   addPlayerKey: '423.p.8888',
 * });
 *
 * // Add/drop with FAAB bid
 * await transactionClient.addDropPlayer({
 *   teamKey: '423.l.12345.t.1',
 *   addPlayerKey: '423.p.8888',
 *   dropPlayerKey: '423.p.7777',
 *   faabBid: 15,
 * });
 *
 * // Commissioner approve trade
 * await transactionClient.allowTrade({
 *   transactionKey: '423.l.12345.tr.123',
 * });
 * ```
 */
export class TransactionResource {
   private http: HttpClient;

   /**
    * Creates a new Transaction resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get transactions for a league
    *
    * @param leagueKey - League key (e.g., "423.l.12345")
    * @param params - Optional filter parameters
    * @returns Array of transactions
    *
    * @example
    * ```typescript
    * // Get all transactions
    * const all = await transactionClient.getLeagueTransactions('423.l.12345');
    *
    * // Get only add/drop transactions
    * const addDrops = await transactionClient.getLeagueTransactions('423.l.12345', {
    *   type: 'add/drop',
    * });
    *
    * // Get transactions for specific team
    * const teamTrans = await transactionClient.getLeagueTransactions('423.l.12345', {
    *   teamKey: '423.l.12345.t.1',
    * });
    *
    * // Get recent 25 transactions
    * const recent = await transactionClient.getLeagueTransactions('423.l.12345', {
    *   count: 25,
    * });
    * ```
    */
   async getLeagueTransactions(
      leagueKey: ResourceKey,
      params?: GetTransactionsParams,
   ): Promise<Transaction[]> {
      let path = `/league/${leagueKey}/transactions`;

      const queryParams: string[] = [];

      if (params?.type) {
         const types = Array.isArray(params.type)
            ? params.type.join(',')
            : params.type;
         queryParams.push(`type=${types}`);
      }

      if (params?.teamKey) {
         queryParams.push(`team_key=${params.teamKey}`);
      }

      if (params?.start !== undefined) {
         queryParams.push(`start=${params.start}`);
      }

      if (params?.count !== undefined) {
         queryParams.push(`count=${params.count}`);
      }

      if (queryParams.length > 0) {
         path += `;${queryParams.join(';')}`;
      }

      const response = await this.http.get<{
         league: { transactions?: unknown[] };
      }>(path);

      if (!response.league.transactions) {
         return [];
      }

      return response.league.transactions as Transaction[];
   }

   /**
    * Get a specific transaction
    *
    * @param transactionKey - Transaction key
    * @returns Transaction details
    *
    * @example
    * ```typescript
    * const transaction = await transactionClient.get('423.l.12345.tr.123');
    * ```
    */
   async get(transactionKey: ResourceKey): Promise<Transaction> {
      const response = await this.http.get<{
         transaction: unknown;
      }>(`/transaction/${transactionKey}`);

      return response.transaction as Transaction;
   }

   /**
    * Add a player from free agency (no drop required)
    *
    * @param params - Add player parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Add a free agent
    * const result = await transactionClient.addPlayer({
    *   teamKey: '423.l.12345.t.1',
    *   addPlayerKey: '423.p.8888',
    * });
    *
    * if (result.success) {
    *   console.log('Player added!', result.transactionKey);
    * }
    * ```
    */
   async addPlayer(
      params: Omit<AddDropPlayerParams, 'dropPlayerKey'>,
   ): Promise<TransactionResponse> {
      return this.addDropPlayer(params);
   }

   /**
    * Add/drop a player (swap)
    *
    * @param params - Add/drop parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Simple add/drop from free agency
    * const result = await transactionClient.addDropPlayer({
    *   teamKey: '423.l.12345.t.1',
    *   addPlayerKey: '423.p.8888',
    *   dropPlayerKey: '423.p.7777',
    * });
    *
    * // Add/drop with FAAB bid (for waiver claims)
    * const waiverResult = await transactionClient.addDropPlayer({
    *   teamKey: '423.l.12345.t.1',
    *   addPlayerKey: '423.p.8888',
    *   dropPlayerKey: '423.p.7777',
    *   faabBid: 15,
    * });
    * ```
    */
   async addDropPlayer(
      params: AddDropPlayerParams,
   ): Promise<TransactionResponse> {
      const path = `/league/${this.extractLeagueKey(params.teamKey)}/transactions`;

      // Build XML for add/drop transaction
      const playersXml = `
			<player>
				<player_key>${params.addPlayerKey}</player_key>
				<transaction_data>
					<type>add</type>
					<source_type>freeagents</source_type>
					<destination_type>team</destination_type>
					<destination_team_key>${params.teamKey}</destination_team_key>
				</transaction_data>
			</player>
			${
            params.dropPlayerKey
               ? `
			<player>
				<player_key>${params.dropPlayerKey}</player_key>
				<transaction_data>
					<type>drop</type>
					<source_type>team</source_type>
					<source_team_key>${params.teamKey}</source_team_key>
				</transaction_data>
			</player>`
               : ''
         }`;

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<transaction>
		<type>${params.dropPlayerKey ? 'add/drop' : 'add'}</type>
		${params.faabBid !== undefined ? `<faab_bid>${params.faabBid}</faab_bid>` : ''}
		<players>
			${playersXml}
		</players>
	</transaction>
</fantasy_content>`;

      try {
         const response = await this.http.post<{
            fantasy_content: { transaction: Record<string, unknown> };
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const transaction = this.parseTransaction(
            response.fantasy_content.transaction,
         );

         return {
            success: true,
            transactionKey: transaction.transactionKey,
            transaction,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRANSACTION_FAILED',
         };
      }
   }

   /**
    * Submit a waiver claim
    *
    * @param params - Waiver claim parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Claim a player on waivers with FAAB
    * const result = await transactionClient.claimWaiver({
    *   teamKey: '423.l.12345.t.1',
    *   claimPlayerKey: '423.p.8888',
    *   dropPlayerKey: '423.p.7777',
    *   faabBid: 25,
    * });
    * ```
    */
   async claimWaiver(
      params: WaiverClaimParams,
   ): Promise<TransactionResponse> {
      // Waiver claims use the same add/drop mechanism
      return this.addDropPlayer({
         teamKey: params.teamKey,
         addPlayerKey: params.claimPlayerKey,
         dropPlayerKey: params.dropPlayerKey,
         faabBid: params.faabBid,
      });
   }

   /**
    * Drop a player (no add)
    *
    * @param teamKey - Team key
    * @param playerKey - Player key to drop
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * const result = await transactionClient.dropPlayer(
    *   '423.l.12345.t.1',
    *   '423.p.7777'
    * );
    * ```
    */
   async dropPlayer(
      teamKey: ResourceKey,
      playerKey: ResourceKey,
   ): Promise<TransactionResponse> {
      const path = `/league/${this.extractLeagueKey(teamKey)}/transactions`;

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<transaction>
		<type>drop</type>
		<players>
			<player>
				<player_key>${playerKey}</player_key>
				<transaction_data>
					<type>drop</type>
					<source_type>team</source_type>
					<source_team_key>${teamKey}</source_team_key>
				</transaction_data>
			</player>
		</players>
	</transaction>
</fantasy_content>`;

      try {
         const response = await this.http.post<{
            fantasy_content: { transaction: Record<string, unknown> };
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const transaction = this.parseTransaction(
            response.fantasy_content.transaction,
         );

         return {
            success: true,
            transactionKey: transaction.transactionKey,
            transaction,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRANSACTION_FAILED',
         };
      }
   }

   /**
    * Propose a trade
    *
    * @param params - Trade proposal parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * const result = await transactionClient.proposeTrade({
    *   proposingTeamKey: '423.l.12345.t.1',
    *   receivingTeamKey: '423.l.12345.t.2',
    *   sendingPlayerKeys: ['423.p.8888', '423.p.7777'],
    *   receivingPlayerKeys: ['423.p.6666'],
    *   tradeNote: 'Fair trade for both teams',
    * });
    * ```
    */
   async proposeTrade(
      params: ProposeTradeParams,
   ): Promise<TransactionResponse> {
      const path = `/league/${this.extractLeagueKey(params.proposingTeamKey)}/transactions`;

      // Build players XML
      const sendingPlayersXml = params.sendingPlayerKeys
         .map(
            (playerKey) => `
			<player>
				<player_key>${playerKey}</player_key>
				<transaction_data>
					<type>trade</type>
					<source_type>team</source_type>
					<source_team_key>${params.proposingTeamKey}</source_team_key>
					<destination_type>team</destination_type>
					<destination_team_key>${params.receivingTeamKey}</destination_team_key>
				</transaction_data>
			</player>`,
         )
         .join('');

      const receivingPlayersXml = params.receivingPlayerKeys
         .map(
            (playerKey) => `
			<player>
				<player_key>${playerKey}</player_key>
				<transaction_data>
					<type>trade</type>
					<source_type>team</source_type>
					<source_team_key>${params.receivingTeamKey}</source_team_key>
					<destination_type>team</destination_type>
					<destination_team_key>${params.proposingTeamKey}</destination_team_key>
				</transaction_data>
			</player>`,
         )
         .join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<transaction>
		<type>pending_trade</type>
		${params.tradeNote ? `<trade_note>${this.escapeXml(params.tradeNote)}</trade_note>` : ''}
		<trader_team_key>${params.proposingTeamKey}</trader_team_key>
		<tradee_team_key>${params.receivingTeamKey}</tradee_team_key>
		<players>
			${sendingPlayersXml}
			${receivingPlayersXml}
		</players>
	</transaction>
</fantasy_content>`;

      try {
         const response = await this.http.post<{
            transaction: unknown;
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const transaction = this.parseTransaction(
            response.transaction as Record<string, unknown>,
         );

         return {
            success: true,
            transactionKey: transaction.transactionKey,
            transaction,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_PROPOSAL_FAILED',
         };
      }
   }

   /**
    * Accept a trade
    *
    * @param params - Accept trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * const result = await transactionClient.acceptTrade({
    *   transactionKey: '423.l.12345.tr.123',
    *   teamKey: '423.l.12345.t.2',
    * });
    * ```
    */
   async acceptTrade(
      params: AcceptTradeParams,
   ): Promise<TransactionResponse> {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<transaction>
		<transaction_key>${params.transactionKey}</transaction_key>
		<type>pending_trade</type>
		<action>accept</action>
		<tradee_team_key>${params.teamKey}</tradee_team_key>
	</transaction>
</fantasy_content>`;

      try {
         const response = await this.http.put<{
            transaction: unknown;
         }>(`/transaction/${params.transactionKey}`, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const transaction = this.parseTransaction(
            response.transaction as Record<string, unknown>,
         );

         return {
            success: true,
            transactionKey: transaction.transactionKey,
            transaction,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_ACCEPT_FAILED',
         };
      }
   }

   /**
    * Reject a trade
    *
    * @param params - Reject trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * const result = await transactionClient.rejectTrade({
    *   transactionKey: '423.l.12345.tr.123',
    *   teamKey: '423.l.12345.t.2',
    *   reason: 'Not interested',
    * });
    * ```
    */
   async rejectTrade(
      params: RejectTradeParams,
   ): Promise<TransactionResponse> {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<transaction>
		<transaction_key>${params.transactionKey}</transaction_key>
		<type>pending_trade</type>
		<action>reject</action>
		<tradee_team_key>${params.teamKey}</tradee_team_key>
		${params.reason ? `<reject_reason>${this.escapeXml(params.reason)}</reject_reason>` : ''}
	</transaction>
</fantasy_content>`;

      try {
         const response = await this.http.put<{
            transaction: unknown;
         }>(`/transaction/${params.transactionKey}`, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const transaction = this.parseTransaction(
            response.transaction as Record<string, unknown>,
         );

         return {
            success: true,
            transactionKey: transaction.transactionKey,
            transaction,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_REJECT_FAILED',
         };
      }
   }

   /**
    * Cancel a trade proposal (must be trade proposer)
    *
    * @param params - Cancel trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * const result = await transactionClient.cancelTrade({
    *   transactionKey: '423.l.12345.tr.123',
    *   teamKey: '423.l.12345.t.1',
    * });
    * ```
    */
   async cancelTrade(
      params: CancelTradeParams,
   ): Promise<TransactionResponse> {
      try {
         await this.http.delete(`/transaction/${params.transactionKey}`);

         return {
            success: true,
            transactionKey: params.transactionKey,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_CANCEL_FAILED',
         };
      }
   }

   /**
    * Commissioner action: Allow a pending trade
    *
    * @param params - Allow trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Commissioner approves a trade in commissioner review mode
    * const result = await transactionClient.allowTrade({
    *   transactionKey: '423.l.12345.tr.123',
    * });
    * ```
    */
   async allowTrade(
      params: AllowTradeParams,
   ): Promise<TransactionResponse> {
      try {
         const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
  <transaction>
    <transaction_key>${this.escapeXml(params.transactionKey)}</transaction_key>
    <action>allow</action>
  </transaction>
</fantasy_content>`;

         await this.http.put(
            `/transaction/${params.transactionKey}`,
            undefined,
            {
               body: xmlBody,
               headers: {
                  'Content-Type': 'application/xml',
               },
            },
         );

         return {
            success: true,
            transactionKey: params.transactionKey,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_ALLOW_FAILED',
         };
      }
   }

   /**
    * Commissioner action: Disallow a pending trade
    *
    * @param params - Disallow trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Commissioner rejects a trade in commissioner review mode
    * const result = await transactionClient.disallowTrade({
    *   transactionKey: '423.l.12345.tr.123',
    * });
    * ```
    */
   async disallowTrade(
      params: DisallowTradeParams,
   ): Promise<TransactionResponse> {
      try {
         const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
  <transaction>
    <transaction_key>${this.escapeXml(params.transactionKey)}</transaction_key>
    <action>disallow</action>
  </transaction>
</fantasy_content>`;

         await this.http.put(
            `/transaction/${params.transactionKey}`,
            undefined,
            {
               body: xmlBody,
               headers: {
                  'Content-Type': 'application/xml',
               },
            },
         );

         return {
            success: true,
            transactionKey: params.transactionKey,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_DISALLOW_FAILED',
         };
      }
   }

   /**
    * Vote against a pending trade (league member vote)
    *
    * @param params - Vote against trade parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // League member votes to veto a trade
    * const result = await transactionClient.voteAgainstTrade({
    *   transactionKey: '423.l.12345.tr.123',
    *   teamKey: '423.l.12345.t.1',
    *   note: 'Unfair trade',
    * });
    * ```
    */
   async voteAgainstTrade(
      params: VoteAgainstTradeParams,
   ): Promise<TransactionResponse> {
      try {
         const noteXml = params.note
            ? `<trade_note>${this.escapeXml(params.note)}</trade_note>`
            : '';

         const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
  <transaction>
    <transaction_key>${this.escapeXml(params.transactionKey)}</transaction_key>
    <action>vote_against</action>
    <voter_team_key>${this.escapeXml(params.teamKey)}</voter_team_key>
    ${noteXml}
  </transaction>
</fantasy_content>`;

         await this.http.put(
            `/transaction/${params.transactionKey}`,
            undefined,
            {
               body: xmlBody,
               headers: {
                  'Content-Type': 'application/xml',
               },
            },
         );

         return {
            success: true,
            transactionKey: params.transactionKey,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'TRADE_VOTE_FAILED',
         };
      }
   }

   /**
    * Edit a pending waiver claim
    *
    * @param params - Edit waiver claim parameters
    * @returns Transaction response
    *
    * @example
    * ```typescript
    * // Update FAAB bid on a pending waiver claim
    * const result = await transactionClient.editWaiverClaim({
    *   transactionKey: '423.l.12345.tr.123',
    *   faabBid: 25,
    * });
    * ```
    */
   async editWaiverClaim(
      params: EditWaiverClaimParams,
   ): Promise<TransactionResponse> {
      try {
         const faabXml =
            params.faabBid !== undefined
               ? `<faab_bid>${params.faabBid}</faab_bid>`
               : '';
         const priorityXml =
            params.waiverPriority !== undefined
               ? `<waiver_priority>${params.waiverPriority}</waiver_priority>`
               : '';

         const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
  <transaction>
    <transaction_key>${this.escapeXml(params.transactionKey)}</transaction_key>
    ${faabXml}
    ${priorityXml}
  </transaction>
</fantasy_content>`;

         await this.http.put(
            `/transaction/${params.transactionKey}`,
            undefined,
            {
               body: xmlBody,
               headers: {
                  'Content-Type': 'application/xml',
               },
            },
         );

         return {
            success: true,
            transactionKey: params.transactionKey,
         };
      } catch (error) {
         return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'WAIVER_EDIT_FAILED',
         };
      }
   }
   /**
    * Extract league key from team key
    *
    * @private
    */
   private extractLeagueKey(teamKey: ResourceKey): string {
      // Team key format: "423.l.12345.t.1"
      // League key format: "423.l.12345"
      const parts = teamKey.split('.');
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
   }

   /**
    * Escape XML special characters
    *
    * @private
    */
   private escapeXml(text: string): string {
      return text
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&apos;');
   }
}
