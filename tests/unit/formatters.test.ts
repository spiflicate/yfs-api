/**
 * Unit tests for formatter utilities
 */

import { describe, test, expect } from 'bun:test';
import {
   formatDate,
   parseDate,
   getToday,
   extractGameId,
   extractResourceType,
   extractResourceId,
   extractLeagueKey,
   buildLeagueKey,
   buildTeamKey,
   buildPlayerKey,
   urlEncode,
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

      test('formatDate should pad single digit months and days', () => {
         const date = new Date('2024-01-05T12:00:00Z');
         expect(formatDate(date)).toBe('2024-01-05');
      });

      test('parseDate should parse YYYY-MM-DD to Date', () => {
         const date = parseDate('2024-11-15');
         expect(date).toBeInstanceOf(Date);
         expect(date.getFullYear()).toBe(2024);
         expect(date.getMonth()).toBe(10); // 0-indexed
         expect(date.getDate()).toBe(15);
      });

      test('getToday should return current date in YYYY-MM-DD format', () => {
         const today = getToday();
         expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

         // Verify it's actually today
         const todayDate = new Date();
         expect(today).toBe(formatDate(todayDate));
      });

      test('urlEncode should URL encode strings', () => {
         expect(urlEncode('My League')).toBe('My%20League');
         expect(urlEncode('Tom Brady')).toBe('Tom%20Brady');
         expect(urlEncode('test&value=123')).toBe('test%26value%3D123');
      });
   });

   describe('resource key extraction', () => {
      test('extractGameId should extract game ID from key', () => {
         expect(extractGameId('423.l.12345')).toBe('423');
         expect(extractGameId('423.l.12345.t.1')).toBe('423');
         expect(extractGameId('423.p.8888')).toBe('423');
      });

      test('extractGameId should handle empty keys', () => {
         expect(extractGameId('')).toBe('');
         expect(extractGameId('.')).toBe('');
      });

      test('extractResourceType should extract resource type from key', () => {
         expect(extractResourceType('423.l.12345')).toBe('l');
         expect(extractResourceType('423.l.12345.t.1')).toBe('l');
         expect(extractResourceType('423.p.8888')).toBe('p');
      });

      test('extractResourceType should handle empty keys', () => {
         expect(extractResourceType('')).toBe('');
         expect(extractResourceType('423')).toBe('');
      });

      test('extractResourceId should extract resource ID from key', () => {
         expect(extractResourceId('423.l.12345')).toBe('12345');
         expect(extractResourceId('423.p.8888')).toBe('8888');
      });

      test('extractResourceId should handle keys without ID', () => {
         expect(extractResourceId('')).toBe('');
         expect(extractResourceId('423.l')).toBe('');
      });

      test('extractLeagueKey should extract league key from team key', () => {
         expect(extractLeagueKey('423.l.12345.t.1')).toBe('423.l.12345');
      });

      test('extractLeagueKey should handle incomplete keys', () => {
         expect(extractLeagueKey('')).toBe('');
         expect(extractLeagueKey('423.l')).toBe('');
         expect(extractLeagueKey('423')).toBe('');
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

      test('buildQueryString should skip null values', () => {
         const result = buildQueryString({
            status: 'A',
            sort: null as any,
         });
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

      test('buildQueryString should URL encode special characters', () => {
         const result = buildQueryString({
            name: 'My League',
            search: 'Tom Brady',
         });
         expect(result).toBe('name=My%20League&search=Tom%20Brady');
      });

      test('buildQueryString should handle empty objects', () => {
         const result = buildQueryString({});
         expect(result).toBe('');
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

      test('keysToCamel should handle arrays with objects', () => {
         const result = keysToCamel({
            league_key: '423.l.12345',
            team_list: [
               { team_key: '423.l.12345.t.1', team_name: 'Team 1' },
               { team_key: '423.l.12345.t.2', team_name: 'Team 2' },
            ],
         });

         expect(result).toEqual({
            leagueKey: '423.l.12345',
            teamList: [
               { teamKey: '423.l.12345.t.1', teamName: 'Team 1' },
               { teamKey: '423.l.12345.t.2', teamName: 'Team 2' },
            ],
         });
      });

      test('keysToCamel should handle arrays with primitive values', () => {
         const result = keysToCamel({
            league_key: '423.l.12345',
            team_ids: [1, 2, 3],
         });

         expect(result).toEqual({
            leagueKey: '423.l.12345',
            teamIds: [1, 2, 3],
         });
      });

      test('keysToCamel should handle null and undefined in arrays', () => {
         const result = keysToCamel({
            data_list: [null, undefined, 'value', 0, false],
         });

         expect(result).toEqual({
            dataList: [null, undefined, 'value', 0, false],
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

      test('keysToSnake should handle nested objects', () => {
         const result = keysToSnake({
            leagueKey: '423.l.12345',
            leagueSettings: {
               scoringType: 'head',
               maxTeams: 12,
            },
         });

         expect(result).toEqual({
            league_key: '423.l.12345',
            league_settings: {
               scoring_type: 'head',
               max_teams: 12,
            },
         });
      });

      test('keysToSnake should handle arrays with objects', () => {
         const result = keysToSnake({
            leagueKey: '423.l.12345',
            teamList: [
               { teamKey: '423.l.12345.t.1', teamName: 'Team 1' },
               { teamKey: '423.l.12345.t.2', teamName: 'Team 2' },
            ],
         });

         expect(result).toEqual({
            league_key: '423.l.12345',
            team_list: [
               { team_key: '423.l.12345.t.1', team_name: 'Team 1' },
               { team_key: '423.l.12345.t.2', team_name: 'Team 2' },
            ],
         });
      });

      test('keysToSnake should handle arrays with primitive values', () => {
         const result = keysToSnake({
            leagueKey: '423.l.12345',
            teamIds: [1, 2, 3],
         });

         expect(result).toEqual({
            league_key: '423.l.12345',
            team_ids: [1, 2, 3],
         });
      });

      test('keysToSnake should handle null and undefined in arrays', () => {
         const result = keysToSnake({
            dataList: [null, undefined, 'value', 0, false],
         });

         expect(result).toEqual({
            data_list: [null, undefined, 'value', 0, false],
         });
      });
   });
});
