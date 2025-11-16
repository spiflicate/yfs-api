/**
 * Unit tests for TransactionResource
 */

import { describe, test, expect, mock } from 'bun:test';
import { TransactionResource } from '../../../src/resources/TransactionResource.js';
import type { HttpClient } from '../../../src/client/HttpClient.js';

describe('TransactionResource', () => {
   const createMockHttpClient = (): HttpClient => {
      return {
         get: mock(() => Promise.resolve({})),
         post: mock(() => Promise.resolve({})),
         put: mock(() => Promise.resolve({})),
         delete: mock(() => Promise.resolve({})),
      } as unknown as HttpClient;
   };

   describe('getLeagueTransactions()', () => {
      test('should fetch league transactions', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     transactions: {
                        0: {
                           transaction: {
                              transaction_key: '423.l.12345.tr.1',
                              transaction_id: '1',
                              type: 'add/drop',
                              status: 'successful',
                              timestamp: '1699900800',
                              url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
                           },
                        },
                        1: {
                           transaction: {
                              transaction_key: '423.l.12345.tr.2',
                              transaction_id: '2',
                              type: 'trade',
                              status: 'successful',
                              timestamp: '1699900900',
                              url: 'https://hockey.fantasysports.yahoo.com/transaction/2',
                           },
                        },
                        count: 2,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const transactions =
            await transactionResource.getLeagueTransactions('423.l.12345');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/transactions',
         );
         expect(transactions.length).toBe(2);
         expect(transactions[0]?.type).toBe('add/drop');
         expect(transactions[1]?.type).toBe('trade');
      });

      test('should filter by transaction type', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     transactions: {
                        count: 0,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.getLeagueTransactions('423.l.12345', {
            type: 'add/drop',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/transactions;type=add/drop',
         );
      });

      test('should filter by team key', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
                  {
                     transactions: {
                        count: 0,
                     },
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.getLeagueTransactions('423.l.12345', {
            teamKey: '423.l.12345.t.1',
            count: 25,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/423.l.12345/transactions;team_key=423.l.12345.t.1;count=25',
         );
      });

      test('should return empty array when no transactions found', async () => {
         const mockResponse = {
            fantasy_content: {
               league: [
                  {
                     league_key: '423.l.12345',
                  },
               ],
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const transactions =
            await transactionResource.getLeagueTransactions('423.l.12345');

         expect(transactions).toEqual([]);
      });
   });

   describe('get()', () => {
      test('should fetch specific transaction', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'add/drop',
                  status: 'successful',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const transaction =
            await transactionResource.get('423.l.12345.tr.1');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/transaction/423.l.12345.tr.1',
         );
         expect(transaction.transactionKey).toBe('423.l.12345.tr.1');
         expect(transaction.type).toBe('add/drop');
         expect(transaction.status).toBe('successful');
      });
   });

   describe('addPlayer()', () => {
      test('should add a player from free agency', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'add',
                  status: 'successful',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.addPlayer({
            teamKey: '423.l.12345.t.1',
            addPlayerKey: '423.p.8888',
         });

         expect(result.success).toBe(true);
         expect(result.transactionKey).toBe('423.l.12345.tr.1');
      });
   });

   describe('addDropPlayer()', () => {
      test('should add and drop a player', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'add/drop',
                  status: 'successful',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.addDropPlayer({
            teamKey: '423.l.12345.t.1',
            addPlayerKey: '423.p.8888',
            dropPlayerKey: '423.p.7777',
         });

         expect(httpClient.post).toHaveBeenCalled();
         expect(result.success).toBe(true);
         expect(result.transactionKey).toBe('423.l.12345.tr.1');
      });

      test('should add/drop with FAAB bid', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'add/drop',
                  status: 'successful',
                  timestamp: '1699900800',
                  faab_bid: '15',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.addDropPlayer({
            teamKey: '423.l.12345.t.1',
            addPlayerKey: '423.p.8888',
            dropPlayerKey: '423.p.7777',
            faabBid: 15,
         });

         expect(result.success).toBe(true);
         expect(result.transaction?.faabBid).toBe(15);
      });

      test('should handle failure', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockRejectedValue(
            new Error('Transaction failed'),
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.addDropPlayer({
            teamKey: '423.l.12345.t.1',
            addPlayerKey: '423.p.8888',
         });

         expect(result.success).toBe(false);
         expect(result.error).toBe('Transaction failed');
      });
   });

   describe('dropPlayer()', () => {
      test('should drop a player', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'drop',
                  status: 'successful',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.dropPlayer(
            '423.l.12345.t.1',
            '423.p.7777',
         );

         expect(result.success).toBe(true);
         expect(result.transactionKey).toBe('423.l.12345.tr.1');
      });
   });

   describe('proposeTrade()', () => {
      test('should propose a trade', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'pending_trade',
                  status: 'proposed',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.proposeTrade({
            proposingTeamKey: '423.l.12345.t.1',
            receivingTeamKey: '423.l.12345.t.2',
            sendingPlayerKeys: ['423.p.8888'],
            receivingPlayerKeys: ['423.p.7777'],
         });

         expect(result.success).toBe(true);
         expect(result.transactionKey).toBe('423.l.12345.tr.1');
      });

      test('should propose trade with note', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'pending_trade',
                  status: 'proposed',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.proposeTrade({
            proposingTeamKey: '423.l.12345.t.1',
            receivingTeamKey: '423.l.12345.t.2',
            sendingPlayerKeys: ['423.p.8888'],
            receivingPlayerKeys: ['423.p.7777'],
            tradeNote: 'Fair trade',
         });

         expect(httpClient.post).toHaveBeenCalled();
      });
   });

   describe('acceptTrade()', () => {
      test('should accept a trade', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'pending_trade',
                  status: 'accepted',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.acceptTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.2',
         });

         expect(httpClient.put).toHaveBeenCalled();
         expect(result.success).toBe(true);
      });
   });

   describe('rejectTrade()', () => {
      test('should reject a trade', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'pending_trade',
                  status: 'rejected',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.rejectTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.2',
         });

         expect(result.success).toBe(true);
      });

      test('should reject trade with reason', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'pending_trade',
                  status: 'rejected',
                  timestamp: '1699900800',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.rejectTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.2',
            reason: 'Not interested',
         });

         expect(httpClient.put).toHaveBeenCalled();
      });
   });

   describe('cancelTrade()', () => {
      test('should cancel a trade', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.delete as ReturnType<typeof mock>).mockResolvedValue(
            {},
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.cancelTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.1',
         });

         expect(httpClient.delete).toHaveBeenCalledWith(
            '/transaction/423.l.12345.tr.1',
         );
         expect(result.success).toBe(true);
      });

      test('should handle cancel failure', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.delete as ReturnType<typeof mock>).mockRejectedValue(
            new Error('Cancel failed'),
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.cancelTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.1',
         });

         expect(result.success).toBe(false);
         expect(result.error).toBe('Cancel failed');
      });
   });

   describe('allowTrade()', () => {
      test('should allow a trade (commissioner action)', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.allowTrade({
            transactionKey: '423.l.12345.tr.1',
         });

         expect(httpClient.put).toHaveBeenCalledWith(
            '/transaction/423.l.12345.tr.1',
            undefined,
            expect.objectContaining({
               headers: { 'Content-Type': 'application/xml' },
            }),
         );
         expect(result.success).toBe(true);
      });
   });

   describe('disallowTrade()', () => {
      test('should disallow a trade (commissioner action)', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.disallowTrade({
            transactionKey: '423.l.12345.tr.1',
         });

         expect(result.success).toBe(true);
      });
   });

   describe('voteAgainstTrade()', () => {
      test('should vote against a trade', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.voteAgainstTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.3',
         });

         expect(result.success).toBe(true);
      });

      test('should vote against trade with note', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.voteAgainstTrade({
            transactionKey: '423.l.12345.tr.1',
            teamKey: '423.l.12345.t.3',
            note: 'Unfair trade',
         });

         expect(httpClient.put).toHaveBeenCalled();
      });
   });

   describe('editWaiverClaim()', () => {
      test('should edit waiver claim FAAB bid', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.editWaiverClaim({
            transactionKey: '423.l.12345.tr.1',
            faabBid: 25,
         });

         expect(result.success).toBe(true);
      });

      test('should edit waiver priority', async () => {
         const httpClient = createMockHttpClient();
         (httpClient.put as ReturnType<typeof mock>).mockResolvedValue({});

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.editWaiverClaim({
            transactionKey: '423.l.12345.tr.1',
            waiverPriority: 3,
         });

         expect(httpClient.put).toHaveBeenCalled();
      });
   });

   describe('claimWaiver()', () => {
      test('should claim a player on waivers', async () => {
         const mockResponse = {
            fantasy_content: {
               transaction: {
                  transaction_key: '423.l.12345.tr.1',
                  transaction_id: '1',
                  type: 'add/drop',
                  status: 'successful',
                  timestamp: '1699900800',
                  faab_bid: '20',
                  url: 'https://hockey.fantasysports.yahoo.com/transaction/1',
               },
            },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.claimWaiver({
            teamKey: '423.l.12345.t.1',
            claimPlayerKey: '423.p.8888',
            dropPlayerKey: '423.p.7777',
            faabBid: 20,
         });

         expect(result.success).toBe(true);
      });
   });
});
