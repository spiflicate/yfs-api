/**
 * Unit tests for formatter utilities
 */

import { describe, test, expect } from 'bun:test';
import {
   formatDate,
   parseDate,
   extractGameId,
   extractResourceType,
   extractResourceId,
   extractLeagueKey,
   buildLeagueKey,
   buildTeamKey,
   buildPlayerKey,
   buildQueryString,
   snakeToCamel,
   camelToSnake,
   keysToCamel,
   keysToSnake,
} from '../../src/utils/formatters.js';

describe('formatters', () => {
   describe('date formatting', () => {
      test('formatDate should format date as YYYY-MM-DD', () => {
         const date = new Date('2024-11-15T12:00:00Z');
         expect(formatDate(date)).toBe('2024-11-15');
      });

      test('parseDate should parse YYYY-MM-DD to Date', () => {
         const date = parseDate('2024-11-15');
         expect(date).toBeInstanceOf(Date);
         expect(date.getFullYear()).toBe(2024);
         expect(date.getMonth()).toBe(10); // 0-indexed
         expect(date.getDate()).toBe(15);
      });
   });

   describe('resource key extraction', () => {
      test('extractGameId should extract game ID from key', () => {
         expect(extractGameId('423.l.12345')).toBe('423');
         expect(extractGameId('423.l.12345.t.1')).toBe('423');
         expect(extractGameId('423.p.8888')).toBe('423');
      });

      test('extractResourceType should extract resource type from key', () => {
         expect(extractResourceType('423.l.12345')).toBe('l');
         expect(extractResourceType('423.l.12345.t.1')).toBe('l');
         expect(extractResourceType('423.p.8888')).toBe('p');
      });

      test('extractResourceId should extract resource ID from key', () => {
         expect(extractResourceId('423.l.12345')).toBe('12345');
         expect(extractResourceId('423.p.8888')).toBe('8888');
      });

      test('extractLeagueKey should extract league key from team key', () => {
         expect(extractLeagueKey('423.l.12345.t.1')).toBe('423.l.12345');
      });
   });

   describe('resource key building', () => {
      test('buildLeagueKey should build valid league key', () => {
         expect(buildLeagueKey('423', '12345')).toBe('423.l.12345');
         expect(buildLeagueKey(423, 12345)).toBe('423.l.12345');
      });

      test('buildTeamKey should build valid team key', () => {
         expect(buildTeamKey('423.l.12345', '1')).toBe('423.l.12345.t.1');
         expect(buildTeamKey('423.l.12345', 1)).toBe('423.l.12345.t.1');
      });

      test('buildPlayerKey should build valid player key', () => {
         expect(buildPlayerKey('423', '8888')).toBe('423.p.8888');
         expect(buildPlayerKey(423, 8888)).toBe('423.p.8888');
      });
   });

   describe('query string building', () => {
      test('buildQueryString should build query string from object', () => {
         const result = buildQueryString({ status: 'A', sort: 'PTS' });
         expect(result).toBe('status=A&sort=PTS');
      });

      test('buildQueryString should skip undefined values', () => {
         const result = buildQueryString({ status: 'A', sort: undefined });
         expect(result).toBe('status=A');
      });

      test('buildQueryString should handle numbers and booleans', () => {
         const result = buildQueryString({
            start: 0,
            count: 25,
            active: true,
         });
         expect(result).toBe('start=0&count=25&active=true');
      });
   });

   describe('case conversion', () => {
      test('snakeToCamel should convert snake_case to camelCase', () => {
         expect(snakeToCamel('league_key')).toBe('leagueKey');
         expect(snakeToCamel('team_id')).toBe('teamId');
         expect(snakeToCamel('oauth_token_secret')).toBe(
            'oauthTokenSecret',
         );
      });

      test('camelToSnake should convert camelCase to snake_case', () => {
         expect(camelToSnake('leagueKey')).toBe('league_key');
         expect(camelToSnake('teamId')).toBe('team_id');
         expect(camelToSnake('oauthTokenSecret')).toBe(
            'oauth_token_secret',
         );
      });

      test('keysToCamel should convert object keys to camelCase', () => {
         const result = keysToCamel({
            league_key: '423.l.12345',
            team_id: 1,
            is_active: true,
         });

         expect(result).toEqual({
            leagueKey: '423.l.12345',
            teamId: 1,
            isActive: true,
         });
      });

      test('keysToCamel should handle nested objects', () => {
         const result = keysToCamel({
            league_key: '423.l.12345',
            league_settings: {
               scoring_type: 'head',
               max_teams: 12,
            },
         });

         expect(result).toEqual({
            leagueKey: '423.l.12345',
            leagueSettings: {
               scoringType: 'head',
               maxTeams: 12,
            },
         });
      });

      test('keysToSnake should convert object keys to snake_case', () => {
         const result = keysToSnake({
            leagueKey: '423.l.12345',
            teamId: 1,
            isActive: true,
         });

         expect(result).toEqual({
            league_key: '423.l.12345',
            team_id: 1,
            is_active: true,
         });
      });
   });
});
