import { describe, expect, it } from 'bun:test';
import { HttpClient as Transport } from '../client/http';
import { GameResource, GamesCollection } from './game';
import { LeagueResource } from './league';

describe('GameResource', () => {
   it('should create a GameResource with the correct parameters', () => {
      const transport = {} as any;
      const state = { segments: [] };
      const key = 'nfl';

      const gameResource = GameResource.create(transport, state, key);

      expect(gameResource).toBeInstanceOf(GameResource);
      expect(gameResource.toPath()).toBe('game/nfl');
   });

   it('should clone a GameResource with new parameters', () => {
      const transport = {} as any;
      const state = { segments: [] };
      const key = 'nfl';

      const gameResource = GameResource.create(transport, state, key);
      const clonedResource = gameResource.clone({
         type: 'resource',
         name: 'game',
         key: 'mlb',
         out: ['metadata'],
      });

      expect(clonedResource).toBeInstanceOf(GameResource);
      expect(clonedResource.toPath()).toBe('game/mlb;out=metadata');
      expect(clonedResource).not.toBe(gameResource);
   });

   it('should create a LeagueResource from a GameResource', () => {
      const transport = {} as any;
      const state = { segments: [] };
      const gameKey = 'nfl';
      const leagueKey = 'nfl.l.12345';

      const gameResource = GameResource.create(transport, state, gameKey);
      const leagueResource = gameResource.league(leagueKey);

      expect(leagueResource).toBeInstanceOf(LeagueResource);
      expect(leagueResource.toPath()).toBe('game/nfl/league/nfl.l.12345');
   });
});

describe('GamesCollection', () => {
   it('should create a GamesCollection with the correct parameters', () => {
      const transport = {} as any;
      const state = { segments: [] };

      const gamesCollection = GamesCollection.create(transport, state);

      expect(gamesCollection).toBeInstanceOf(GamesCollection);
      expect(gamesCollection.toPath()).toBe('games');
   });

   it('should clone a GamesCollection with new parameters', () => {
      const transport = {} as any;
      const state = { segments: [] };

      const gamesCollection = GamesCollection.create(transport, state);
      const clonedCollection = gamesCollection.clone({
         type: 'collection',
         name: 'games',
         out: ['metadata'],
         game_keys: ['nfl', 'mlb'],
      });

      expect(clonedCollection).toBeInstanceOf(GamesCollection);
      expect(clonedCollection.toPath()).toBe(
         'games;out=metadata;game_keys=nfl,mlb',
      );
      expect(clonedCollection).not.toBe(gamesCollection);
   });
});
