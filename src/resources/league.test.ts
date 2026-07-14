import { describe, expect, it } from 'bun:test';
import { LeagueResource, LeaguesCollection } from './league.js';
import { PlayersCollection } from './player.js';
import { TeamsCollection } from './team.js';
import { TransactionsCollection } from './transaction.js';

// biome-ignore lint/suspicious/noExplicitAny: transport is not being tested here
const transport = {} as any;
const emptyState = { segments: [] };

describe('LeagueResource', () => {
   it('creates a teams collection from a league resource', () => {
      const resource = LeagueResource.create(
         transport,
         emptyState,
         'nfl.l.123',
      );
      const teams = resource.teams(['nfl.l.123.t.1']);

      expect(teams).toBeInstanceOf(TeamsCollection);
      expect(teams.toPath()).toBe(
         'league/nfl.l.123/teams;team_keys=nfl.l.123.t.1',
      );
   });

   it('creates a players collection from a league resource', () => {
      const resource = LeagueResource.create(
         transport,
         emptyState,
         'nfl.l.123',
      );
      const players = resource.players(['nfl.p.1']);

      expect(players).toBeInstanceOf(PlayersCollection);
      expect(players.toPath()).toBe(
         'league/nfl.l.123/players;player_keys=nfl.p.1',
      );
   });

   it('creates a transactions collection from a league resource', () => {
      const resource = LeagueResource.create(
         transport,
         emptyState,
         'nfl.l.123',
      );
      const transactions = resource.transactions(['nfl.l.123.tr.9']);

      expect(transactions).toBeInstanceOf(TransactionsCollection);
      expect(transactions.toPath()).toBe(
         'league/nfl.l.123/transactions;transaction_keys=nfl.l.123.tr.9',
      );
   });
});

describe('LeaguesCollection', () => {
   it('creates nested collections from a leagues collection', () => {
      const leagues = LeaguesCollection.create(transport, emptyState, [
         'nfl.l.123',
         'nfl.l.456',
      ]);

      expect(leagues.teams(['nfl.l.123.t.1']).toPath()).toBe(
         'leagues;league_keys=nfl.l.123,nfl.l.456/teams;team_keys=nfl.l.123.t.1',
      );
      expect(leagues.players(['nfl.p.1']).toPath()).toBe(
         'leagues;league_keys=nfl.l.123,nfl.l.456/players;player_keys=nfl.p.1',
      );
      expect(leagues.transactions(['nfl.l.123.tr.9']).toPath()).toBe(
         'leagues;league_keys=nfl.l.123,nfl.l.456/transactions;transaction_keys=nfl.l.123.tr.9',
      );
   });
});
