import { describe, expect, test } from 'bun:test';
import type { HttpClient } from '../client/http';
import { UsersCollection } from './user';

const transport = {} as HttpClient;

describe('UsersCollection', () => {
   test('exposes only validated direct user traversals', () => {
      const users = UsersCollection.create(transport, { segments: [] });

      expect(users.games().toPath()).toBe('users;use_login=1/games');
      expect(users.teams().toPath()).toBe('users;use_login=1/teams');
      expect(users).not.toHaveProperty('leagues');
      expect(users).not.toHaveProperty('players');
   });
});
