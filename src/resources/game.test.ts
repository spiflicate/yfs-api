import { describe, expect, it } from 'bun:test';
import { GameResource, GamesCollection } from './game';
import { LeaguesCollection } from './league';
import { PlayersCollection } from './player';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

describe('GameResource', () => {
   it('should create a GameResource with the correct parameters', () => {
      const key = 'nfl';

      const gameResource = GameResource.create(transport, emptyState, key);

      expect(gameResource).toBeInstanceOf(GameResource);
      expect(gameResource.toPath()).toBe('game/nfl');
   });

   it('should return a new GameResource with the included sub-resource', () => {
      const key = 'nfl';

      const gameResource = GameResource.create(transport, emptyState, key);
      const includedResource = gameResource.include(
         'metadata',
         'game_weeks',
      );

      expect(includedResource).toBeInstanceOf(GameResource);
      expect(includedResource.toPath()).toBe(
         'game/nfl;out=metadata,game_weeks',
      );
      expect(includedResource).not.toBe(gameResource);
   });

   it('should return a new GameResource with the "game_weeks" sub-resource included', () => {
      const key = 'nfl';

      const gameResource = GameResource.create(transport, emptyState, key);
      const includedResource = gameResource.gameWeeks();

      expect(includedResource).toBeInstanceOf(GameResource);
      expect(includedResource.toPath()).toBe('game/nfl;out=game_weeks');
      expect(includedResource).not.toBe(gameResource);
   });

   it('should create a LeaguesCollection from a GameResource', () => {
      const gameKey = 'nfl';
      const leagueKeys = ['nfl.l.12345', 'nfl.l.67890'];

      const gameResource = GameResource.create(
         transport,
         emptyState,
         gameKey,
      );
      const leaguesCollection = gameResource.leagues(leagueKeys);

      expect(leaguesCollection).toBeInstanceOf(LeaguesCollection);
      expect(leaguesCollection.toPath()).toBe(
         'game/nfl/leagues;league_keys=nfl.l.12345,nfl.l.67890',
      );
   });

   it('should create a PlayersCollection from a GameResource', () => {
      const gameResource = GameResource.create(
         transport,
         emptyState,
         'nfl',
      );
      const playersCollection = gameResource.players(['nfl.p.1']);

      expect(playersCollection).toBeInstanceOf(PlayersCollection);
      expect(playersCollection.toPath()).toBe(
         'game/nfl/players;player_keys=nfl.p.1',
      );
   });
});

describe('GamesCollection', () => {
   it('should create a GamesCollection with the correct parameters', () => {
      const gamesCollection = GamesCollection.create(transport, emptyState);

      expect(gamesCollection).toBeInstanceOf(GamesCollection);
      expect(gamesCollection.toPath()).toBe('games');
   });

   it('should create a PlayersCollection from a GamesCollection', () => {
      const gamesCollection = GamesCollection.create(
         transport,
         emptyState,
         ['nfl'],
      );
      const playersCollection = gamesCollection.players(['nfl.p.1']);

      expect(playersCollection).toBeInstanceOf(PlayersCollection);
      expect(playersCollection.toPath()).toBe(
         'games;game_keys=nfl/players;player_keys=nfl.p.1',
      );
   });
});
