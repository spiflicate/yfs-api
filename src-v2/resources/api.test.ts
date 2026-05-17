import { describe, expect, it } from 'bun:test';
import { ApiRoot, createApi } from './api';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;

describe('ApiRoot', () => {
   it('creates a root api instance', () => {
      expect(createApi(transport)).toBeInstanceOf(ApiRoot);
   });

   it('starts top-level resource paths from the root', () => {
      const api = createApi(transport);

      expect(api.users().toPath()).toBe('users;use_login=1');
      expect(api.game('nfl').toPath()).toBe('game/nfl');
      expect(api.games(['nfl']).toPath()).toBe('games;game_keys=nfl');
      expect(api.league('nfl.l.123').toPath()).toBe('league/nfl.l.123');
      expect(api.team('nfl.l.123.t.1').toPath()).toBe('team/nfl.l.123.t.1');
      expect(api.player('nfl.p.1').toPath()).toBe('player/nfl.p.1');
   });
});
