import { describe, expect, it } from 'bun:test';
import { YahooApiError } from '../client/errors.js';
import type { HttpClient as Transport } from '../client/http.js';
import { RosterMoveBuilder } from './builders/roster-move-builder.js';
import { PlayersCollection } from './player.js';
import { RosterResource } from './roster.js';

const putRequests: Array<{ path: string; body: unknown }> = [];
const confirmation = { confirmation: { status: 'success' as const } };

const transport = {
   put(path: string, body: unknown) {
      putRequests.push({ path, body });
      return Promise.resolve(confirmation);
   },
} as unknown as Transport;

describe('RosterResource', () => {
   it('builds week and date scoped roster paths', () => {
      const roster = RosterResource.create(transport, {
         segments: ['team', 'nfl.l.123.t.1'],
      });

      expect(roster.week(7).toPath()).toBe(
         'team/nfl.l.123.t.1/roster;week=7',
      );
      expect(roster.date('2025-09-01').toPath()).toBe(
         'team/nfl.l.123.t.1/roster;date=2025-09-01',
      );
   });

   it('creates nested players collections from the roster path', () => {
      const players = RosterResource.create(transport, {
         segments: ['team', 'nfl.l.123.t.1'],
      })
         .week(10)
         .players(['nfl.p.1']);

      expect(players).toBeInstanceOf(PlayersCollection);
      expect(players.toPath()).toBe(
         'team/nfl.l.123.t.1/roster;week=10/players;player_keys=nfl.p.1',
      );
   });

   it('serializes roster move builders for PUT requests using roster coverage defaults', async () => {
      putRequests.length = 0;

      const roster = RosterResource.create(transport, {
         segments: ['team', 'nfl.l.123.t.1'],
      }).week(13);

      await expect(
         roster.put(new RosterMoveBuilder().movePlayer('461.p.8332', 'WR')),
      ).resolves.toBe(confirmation);

      expect(putRequests).toHaveLength(1);
      expect(putRequests[0]?.path).toBe(
         'team/nfl.l.123.t.1/roster;week=13',
      );
      expect(putRequests[0]?.body).toContain('<week>13</week>');
      expect(putRequests[0]?.body).toContain(
         '<player_key>461.p.8332</player_key>',
      );
      expect(putRequests[0]?.body).toContain('<position>WR</position>');
   });

   it('propagates roster update HTTP errors', async () => {
      const error = new YahooApiError('Roster update failed', 400);
      const failingTransport = {
         put: () => Promise.reject(error),
      } as unknown as Transport;
      const roster = RosterResource.create(failingTransport, {
         segments: ['team', 'nfl.l.123.t.1'],
      }).week(13);

      await expect(
         roster.put(new RosterMoveBuilder().movePlayer('461.p.8332', 'WR')),
      ).rejects.toBe(error);
   });

   it('propagates empty write success without manufacturing confirmation', async () => {
      let calls = 0;
      const emptyTransport = {
         put: () => {
            calls++;
            return Promise.resolve(undefined);
         },
      } as unknown as Transport;
      const roster = RosterResource.create(emptyTransport, {
         segments: ['team', 'nfl.l.123.t.1'],
      }).week(13);

      await expect(
         roster.update(
            new RosterMoveBuilder().movePlayer('461.p.8332', 'WR'),
         ),
      ).resolves.toBeUndefined();
      expect(calls).toBe(1);
   });
});
