/**
 * Unit tests for TransactionResource
 */

import { describe, expect, mock, test } from 'bun:test';
import type { HttpClient } from '../../../src/client/HttpClient.js';
import { TransactionResource } from '../../../src/resources/TransactionResource.js';
import leagueTransactions from '../../fixtures/data/league-465-l-30702-transactions.json';

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
         const mockResponse = { league: leagueTransactions };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result =
            await transactionResource.getLeagueTransactions('465.l.30702');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/transactions',
         );
         // expect(result).toEqual(leagueTransactions);
      });

      test('should filter by transaction type', async () => {
         const mockResponse = { league: leagueTransactions };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.getLeagueTransactions('465.l.30702', {
            type: 'add',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/transactions;type=add',
         );
      });

      test('should filter by team', async () => {
         const mockResponse = { league: leagueTransactions };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.getLeagueTransactions('465.l.30702', {
            teamKey: '465.l.30702.t.9',
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/transactions;team_key=465.l.30702.t.9',
         );
      });

      test('should filter by count', async () => {
         const mockResponse = { league: leagueTransactions };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.getLeagueTransactions('465.l.30702', {
            count: 25,
         });

         expect(httpClient.get).toHaveBeenCalledWith(
            '/league/465.l.30702/transactions;count=25',
         );
      });
   });

   describe('get()', () => {
      test('should fetch a specific transaction', async () => {
         const mockResponse = {
            transaction: leagueTransactions.transactions[0],
         };

         const httpClient = createMockHttpClient();
         (httpClient.get as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         const result = await transactionResource.get('465.l.30702.tr.268');

         expect(httpClient.get).toHaveBeenCalledWith(
            '/transaction/465.l.30702.tr.268',
         );
         // expect(result).toEqual(leagueTransactions.transactions[0]);
      });
   });

   describe('addPlayer()', () => {
      test('should add a player from free agency', async () => {
         const mockResponse = {
            transaction: { transactionKey: '465.l.30702.tr.999' },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.addPlayer({
            teamKey: '465.l.30702.t.9',
            addPlayerKey: '465.p.32763',
         });

         expect(httpClient.post).toHaveBeenCalled();
         const call = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0];
         expect(call?.[0]).toBe('/league/465.l.30702/transactions');
      });
   });

   describe('addDropPlayer()', () => {
      test('should add and drop a player', async () => {
         const mockResponse = {
            transaction: { transactionKey: '465.l.30702.tr.999' },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.addDropPlayer({
            teamKey: '465.l.30702.t.9',
            addPlayerKey: '465.p.32763',
            dropPlayerKey: '465.p.6055',
         });

         expect(httpClient.post).toHaveBeenCalled();
         const call = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0];
         expect(call?.[0]).toBe('/league/465.l.30702/transactions');
      });

      test('should include FAAB bid when provided', async () => {
         const mockResponse = {
            transaction: { transactionKey: '465.l.30702.tr.999' },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.addDropPlayer({
            teamKey: '465.l.30702.t.9',
            addPlayerKey: '465.p.32763',
            dropPlayerKey: '465.p.6055',
            faabBid: 15,
         });

         expect(httpClient.post).toHaveBeenCalled();
         const call = (httpClient.post as ReturnType<typeof mock>).mock
            .calls[0];
         expect(call?.[0]).toBe('/league/465.l.30702/transactions');
         const options = call?.[2] as { body?: string };
         expect(options?.body).toContain('<faab_bid>15</faab_bid>');
      });
   });

   describe('dropPlayer()', () => {
      test('should drop a player', async () => {
         const mockResponse = {
            transaction: { transactionKey: '465.l.30702.tr.999' },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.dropPlayer(
            '465.l.30702.t.9',
            '465.p.6055',
         );

         expect(httpClient.post).toHaveBeenCalled();
      });
   });

   describe('proposeTrade()', () => {
      test('should propose a trade', async () => {
         const mockResponse = {
            transaction: { transactionKey: '465.l.30702.tr.999' },
         };

         const httpClient = createMockHttpClient();
         (httpClient.post as ReturnType<typeof mock>).mockResolvedValue(
            mockResponse,
         );

         const transactionResource = new TransactionResource(httpClient);
         await transactionResource.proposeTrade({
            tradeNote: 'Fair trade!',
            proposingTeamKey: '465.l.30702.t.9',
            receivingTeamKey: '465.l.30702.t.1',
            sendingPlayerKeys: ['465.p.32763'],
            receivingPlayerKeys: ['465.p.6055'],
         });

         expect(httpClient.post).toHaveBeenCalled();
      });
   });
});
