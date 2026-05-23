import { describe, expect, it } from 'bun:test';
import { RosterMoveBuilder } from './roster-move-builder.js';

describe('RosterMoveBuilder', () => {
   it('builds a weekly roster payload', () => {
      const payload = new RosterMoveBuilder()
         .week(13)
         .movePlayer('461.p.8332', 'WR')
         .movePlayer('461.p.1423', 'BN')
         .toPayload();

      expect(payload).toEqual({
         roster: {
            coverage_type: 'week',
            week: '13',
            players: {
               player: [
                  {
                     player_key: '461.p.8332',
                     position: 'WR',
                  },
                  {
                     player_key: '461.p.1423',
                     position: 'BN',
                  },
               ],
            },
         },
      });
   });

   it('builds a daily roster payload', () => {
      const payload = new RosterMoveBuilder()
         .date('2019-05-01')
         .movePlayer('388.p.8332', '1B')
         .movePlayer('388.p.1423', 'BN')
         .toPayload();

      expect(payload).toEqual({
         roster: {
            coverage_type: 'date',
            date: '2019-05-01',
            players: {
               player: [
                  {
                     player_key: '388.p.8332',
                     position: '1B',
                  },
                  {
                     player_key: '388.p.1423',
                     position: 'BN',
                  },
               ],
            },
         },
      });
   });

   it('serializes roster moves to XML', () => {
      const xml = new RosterMoveBuilder()
         .date('2019-05-01')
         .movePlayer('388.p.8332', '1B')
         .movePlayer('388.p.1423', 'BN')
         .toXml();

      expect(xml).toContain('<fantasy_content>');
      expect(xml).toContain('<roster>');
      expect(xml).toContain('<coverage_type>date</coverage_type>');
      expect(xml).toContain('<date>2019-05-01</date>');
      expect(xml).toContain('<player_key>388.p.8332</player_key>');
      expect(xml).toContain('<position>1B</position>');
      expect(xml).toContain('<player_key>388.p.1423</player_key>');
      expect(xml).toContain('<position>BN</position>');
   });

   it('copies player arrays passed into players()', () => {
      const players = [
         { playerKey: '388.p.8332', position: '1B' },
         { playerKey: '388.p.1423', position: 'BN' },
      ];

      const builder = new RosterMoveBuilder().week(13).players(players);

      const mutablePlayers = [...players];
      mutablePlayers.push({ playerKey: '388.p.9999', position: 'UTIL' });

      expect(builder.toPayload()).toEqual({
         roster: {
            coverage_type: 'week',
            week: '13',
            players: {
               player: [
                  {
                     player_key: '388.p.8332',
                     position: '1B',
                  },
                  {
                     player_key: '388.p.1423',
                     position: 'BN',
                  },
               ],
            },
         },
      });
   });

   it('uses default roster coverage when builder coverage is omitted', () => {
      const payload = new RosterMoveBuilder()
         .movePlayer('461.p.8332', 'WR')
         .toPayload({ week: 13 });

      expect(payload).toEqual({
         roster: {
            coverage_type: 'week',
            week: '13',
            players: {
               player: [
                  {
                     player_key: '461.p.8332',
                     position: 'WR',
                  },
               ],
            },
         },
      });
   });

   it('throws when coverage is missing', () => {
      expect(() =>
         new RosterMoveBuilder().movePlayer('461.p.8332', 'WR').toPayload(),
      ).toThrow('Roster coverage is required. Use week() or date().');
   });

   it('throws when no players are provided', () => {
      expect(() => new RosterMoveBuilder().week(13).toPayload()).toThrow(
         'At least one roster move is required. Use movePlayer() or players().',
      );
   });

   it('throws when explicit coverage conflicts with defaults', () => {
      expect(() =>
         new RosterMoveBuilder()
            .date('2019-05-01')
            .movePlayer('388.p.8332', '1B')
            .toPayload({ week: 13 }),
      ).toThrow(
         'Roster coverage conflict: builder uses date() but defaults specify week.',
      );
   });
});
