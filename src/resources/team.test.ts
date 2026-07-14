import { describe, expect, it } from 'bun:test';
import { PlayersCollection } from './player.js';
import { RosterResource } from './roster.js';
import {
   TeamMatchupsResource,
   TeamResource,
   TeamStatsResource,
   TeamsCollection,
} from './team.js';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

describe('TeamResource', () => {
   it('creates a roster resource from a team resource', () => {
      const team = TeamResource.create(
         transport,
         emptyState,
         'nfl.l.123.t.1',
      );
      const roster = team.roster().week(10);

      expect(roster).toBeInstanceOf(RosterResource);
      expect(roster.toPath()).toBe('team/nfl.l.123.t.1/roster;week=10');
      expect(roster.players(['nfl.p.1'])).toBeInstanceOf(PlayersCollection);
      expect(roster.players(['nfl.p.1']).toPath()).toBe(
         'team/nfl.l.123.t.1/roster;week=10/players;player_keys=nfl.p.1',
      );
   });

   it('includes stats and matchups on the team resource', () => {
      const team = TeamResource.create(
         transport,
         emptyState,
         'nfl.l.123.t.1',
      );

      expect(team.stats()).toBeInstanceOf(TeamStatsResource);
      expect(team.stats().week(10).toPath()).toBe(
         'team/nfl.l.123.t.1/stats;type=week;week=10',
      );
      expect(team.matchups()).toBeInstanceOf(TeamMatchupsResource);
      expect(team.matchups().weeks([1, 5]).toPath()).toBe(
         'team/nfl.l.123.t.1/matchups;weeks=1,5',
      );
   });
});

describe('TeamsCollection', () => {
   it('creates rosters from a teams collection', () => {
      const teams = TeamsCollection.create(transport, emptyState, [
         'nfl.l.123.t.1',
         'nfl.l.123.t.2',
      ]);
      const rosters = teams.roster().date('2025-09-01');

      expect(rosters).toBeInstanceOf(RosterResource);
      expect(rosters.toPath()).toBe(
         'teams;team_keys=nfl.l.123.t.1,nfl.l.123.t.2/roster;date=2025-09-01',
      );
   });
});
