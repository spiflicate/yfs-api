import { describe, expect, it } from 'bun:test';
import { QueryBuilder, query } from '../../src/client/QueryBuilder';

describe('QueryBuilder', () => {
   describe('resource()', () => {
      it('should create a simple resource path', () => {
         const builder = new QueryBuilder();
         const path = builder.resource('game', 'nfl').build();
         expect(path).toBe('/game/nfl');
      });

      it('should create a resource without a key', () => {
         const builder = new QueryBuilder();
         const path = builder.resource('users').build();
         expect(path).toBe('/users');
      });
   });

   describe('collection()', () => {
      it('should create a collection path', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .collection('teams')
            .build();
         expect(path).toBe('/league/423.l.12345/teams');
      });
   });

   describe('param()', () => {
      it('should add a single parameter', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('users')
            .param('use_login', '1')
            .build();
         expect(path).toBe('/users;use_login=1');
      });

      it('should add multiple parameters', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .collection('players')
            .param('position', 'QB')
            .param('status', 'A')
            .build();
         expect(path).toBe(
            '/league/423.l.12345/players;position=QB;status=A',
         );
      });

      it('should handle array parameter values', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .param('out', ['settings', 'standings'])
            .build();
         expect(path).toBe('/league/423.l.12345;out=settings,standings');
      });

      it('should throw error when adding param without resource', () => {
         const builder = new QueryBuilder();
         expect(() => builder.param('key', 'value')).toThrow(
            'Cannot add parameters without a resource or collection',
         );
      });
   });

   describe('params()', () => {
      it('should add multiple parameters from object', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .collection('players')
            .params({
               position: 'QB',
               status: 'A',
               count: '25',
            })
            .build();
         expect(path).toBe(
            '/league/423.l.12345/players;position=QB;status=A;count=25',
         );
      });
   });

   describe('out()', () => {
      it('should add out parameter with single value', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .out('settings')
            .build();
         expect(path).toBe('/league/423.l.12345;out=settings');
      });

      it('should add out parameter with array', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .out(['settings', 'standings', 'scoreboard'])
            .build();
         expect(path).toBe(
            '/league/423.l.12345;out=settings,standings,scoreboard',
         );
      });
   });

   describe('complex queries', () => {
      it('should build user games leagues chain', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('users')
            .param('use_login', '1')
            .collection('games')
            .param('game_keys', 'nfl')
            .collection('leagues')
            .build();
         expect(path).toBe(
            '/users;use_login=1/games;game_keys=nfl/leagues',
         );
      });

      it('should build team roster with week', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('team', '423.l.12345.t.1')
            .collection('roster')
            .param('week', '10')
            .collection('players')
            .build();
         expect(path).toBe('/team/423.l.12345.t.1/roster;week=10/players');
      });

      it('should build filtered players collection', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .collection('players')
            .params({
               position: 'QB',
               status: 'A',
               sort: 'AR',
               count: '25',
            })
            .build();
         expect(path).toBe(
            '/league/423.l.12345/players;position=QB;status=A;sort=AR;count=25',
         );
      });

      it('should build league with out and teams filter', () => {
         const builder = new QueryBuilder();
         const path = builder
            .resource('league', '423.l.12345')
            .out('settings')
            .collection('teams')
            .param('team_keys', 't.1,t.2')
            .build();
         expect(path).toBe(
            '/league/423.l.12345;out=settings/teams;team_keys=t.1,t.2',
         );
      });
   });

   describe('reset()', () => {
      it('should clear all segments', () => {
         const builder = new QueryBuilder();
         builder.resource('league', '423.l.12345').collection('teams');
         builder.reset();
         expect(() => builder.build()).toThrow('Cannot build empty query');
      });

      it('should allow building new query after reset', () => {
         const builder = new QueryBuilder();
         builder.resource('league', '423.l.12345').build();
         builder.reset();
         const path = builder.resource('game', 'nfl').build();
         expect(path).toBe('/game/nfl');
      });
   });

   describe('toString()', () => {
      it('should return built path', () => {
         const builder = new QueryBuilder();
         builder.resource('league', '423.l.12345');
         expect(builder.toString()).toBe('/league/423.l.12345');
      });

      it('should return placeholder for incomplete query', () => {
         const builder = new QueryBuilder();
         expect(builder.toString()).toBe('<incomplete query>');
      });
   });

   describe('query() helper', () => {
      it('should create new QueryBuilder instance', () => {
         const builder = query();
         expect(builder).toBeInstanceOf(QueryBuilder);
      });

      it('should work with chaining', () => {
         const path = query()
            .resource('league', '423.l.12345')
            .collection('teams')
            .build();
         expect(path).toBe('/league/423.l.12345/teams');
      });
   });

   describe('error handling', () => {
      it('should throw when building without segments', () => {
         const builder = new QueryBuilder();
         expect(() => builder.build()).toThrow('Cannot build empty query');
      });
   });
});
