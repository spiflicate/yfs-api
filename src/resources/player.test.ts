import { describe, expect, it } from 'bun:test';
import {
   PlayerResource,
   PlayerStatsResource,
   PlayersCollection,
} from './player';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

describe('PlayerResource', () => {
   it('creates a player resource and builds child paths', () => {
      const resource = PlayerResource.create(
         transport,
         emptyState,
         'nfl.p.1',
      );

      expect(resource.toPath()).toBe('player/nfl.p.1');
      expect(resource.stats()).toBeInstanceOf(PlayerStatsResource);
      expect(resource.stats().week(10).toPath()).toBe(
         'player/nfl.p.1/stats;type=week;week=10',
      );
      expect(resource.percentOwned().toPath()).toBe(
         'player/nfl.p.1;out=percent_owned',
      );
   });
});

describe('PlayersCollection', () => {
   it('serializes collection filters and out params', () => {
      const collection = PlayersCollection.create(transport, emptyState, [
         'nfl.p.1',
         'nfl.p.2',
      ])
         .status('A')
         .position('QB')
         .sort('PTS')
         .sortType('season')
         .sortSeason(2025)
         .start(25)
         .count(25)
         .include('ownership');

      expect(collection.toPath()).toBe(
         'players;out=ownership;player_keys=nfl.p.1,nfl.p.2;status=A;position=QB;sort=PTS;sort_type=season;sort_season=2025;start=25;count=25',
      );
   });

   it('creates a stats child path from the collection', () => {
      const collection = PlayersCollection.create(transport, emptyState, [
         'nfl.p.1',
         'nfl.p.2',
      ])
         .stats()
         .date('2025-09-01');

      expect(collection).toBeInstanceOf(PlayerStatsResource);
      expect(collection.toPath()).toBe(
         'players;player_keys=nfl.p.1,nfl.p.2/stats;type=date;date=2025-09-01',
      );
   });
});
