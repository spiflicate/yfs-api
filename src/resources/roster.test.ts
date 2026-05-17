import { describe, expect, it } from 'bun:test';
import { PlayersCollection } from './player';
import { RosterResource, RostersCollection } from './roster';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;

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
});

describe('RostersCollection', () => {
   it('builds collection roster paths', () => {
      const roster = RostersCollection.create(transport, {
         segments: ['teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2'],
      }).date('2025-09-01');

      expect(roster).toBeInstanceOf(RostersCollection);
      expect(roster.toPath()).toBe(
         'teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;date=2025-09-01',
      );
   });
});
