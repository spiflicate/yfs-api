import { describe, expect, it } from 'bun:test';
import { createApi } from './api.js';
import {
   PlayerOwnershipResource,
   PlayerPercentOwnedResource,
   PlayerResource,
   PlayerStatsResource,
   PlayersCollection,
} from './player.js';

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
         'player/nfl.p.1/percent_owned',
      );
      expect(resource.ownership()).toBeInstanceOf(PlayerOwnershipResource);
      expect(resource.ownership().toPath()).toBe(
         'player/nfl.p.1/ownership',
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

   it('builds ownership children for root and league-nested collections', () => {
      const api = createApi(transport);
      const rootOwnership = api.players(['nfl.p.1']).ownership();
      const rootPercentOwned = api.players(['nfl.p.1']).percentOwned();
      const leagueOwnership = api
         .league('nfl.l.123')
         .players(['nfl.p.1'])
         .ownership();
      const leaguePercentOwned = api
         .league('nfl.l.123')
         .players(['nfl.p.1'])
         .percentOwned();

      expect(rootOwnership).toBeInstanceOf(PlayerOwnershipResource);
      expect(rootPercentOwned).toBeInstanceOf(PlayerPercentOwnedResource);
      expect(rootOwnership.toPath()).toBe(
         'players;player_keys=nfl.p.1/ownership',
      );
      expect(rootPercentOwned.toPath()).toBe(
         'players;player_keys=nfl.p.1/percent_owned',
      );
      expect(leagueOwnership.toPath()).toBe(
         'league/nfl.l.123/players;player_keys=nfl.p.1/ownership',
      );
      expect(leaguePercentOwned.toPath()).toBe(
         'league/nfl.l.123/players;player_keys=nfl.p.1/percent_owned',
      );
   });
});
