/**
 * Unit tests for XML parser utilities
 */

import { describe, expect, test } from 'bun:test';
import {
   detectArrayPatterns,
   ensureArray,
   normalizeArrays,
   parseYahooXML,
} from './xmlParser.js';

describe('xmlParser', () => {
   describe('parseYahooXML', () => {
      test('should parse Yahoo XML and normalize known collection wrappers', () => {
         const xml = `
				<fantasy_content>
					<league>
						<league_key>423.l.12345</league_key>
						<teams>
							<team>
								<team_key>423.l.12345.t.1</team_key>
								<name>Alpha</name>
								<is_commissioner>1</is_commissioner>
							</team>
						</teams>
						<players></players>
						<week_has_enough_qualifying_days>
							<week-1>1</week-1>
							<week-12>0</week-12>
						</week_has_enough_qualifying_days>
					</league>
				</fantasy_content>
			`;

         const result = parseYahooXML<{
            league: {
               leagueKey: string;
               teams: Array<{
                  teamKey: string;
                  name: string;
                  isCommissioner: boolean;
               }>;
               players: unknown[];
               weekHasEnoughQualifyingDays: Record<string, boolean>;
            };
         }>(xml);

         expect(result).toEqual({
            league: {
               leagueKey: '423.l.12345',
               teams: [
                  {
                     teamKey: '423.l.12345.t.1',
                     name: 'Alpha',
                     isCommissioner: true,
                  },
               ],
               players: [],
               weekHasEnoughQualifyingDays: {
                  week01: true,
                  week12: false,
               },
            },
         });
      });

      test('should preserve gameKey as a string', () => {
         const xml = `
				<fantasy_content>
					<game>
						<game_key>406</game_key>
					</game>
				</fantasy_content>
			`;

         const result = parseYahooXML<{ game: { gameKey: string } }>(xml);

         expect(result.game.gameKey).toBe('406');
      });

      test('should unwrap repeated items into arrays', () => {
         const xml = `
				<fantasy_content>
					<league>
						<teams>
							<team>
								<team_key>423.l.12345.t.1</team_key>
							</team>
							<team>
								<team_key>423.l.12345.t.2</team_key>
							</team>
						</teams>
					</league>
				</fantasy_content>
			`;

         const result = parseYahooXML<{
            league: {
               teams: Array<{ teamKey: string }>;
            };
         }>(xml);

         expect(result.league.teams).toEqual([
            { teamKey: '423.l.12345.t.1' },
            { teamKey: '423.l.12345.t.2' },
         ]);
      });

      test('should throw Yahoo API errors from error payloads', () => {
         const xml = `
				<error>
					<description>Bad OAuth token</description>
				</error>
			`;

         expect(() => parseYahooXML(xml)).toThrow(
            'Yahoo API error: Bad OAuth token',
         );
      });

      test('should reject responses without fantasy_content wrapper', () => {
         const xml =
            '<league><league_key>423.l.12345</league_key></league>';

         expect(() => parseYahooXML(xml)).toThrow(
            'Invalid Yahoo API response: missing fantasy_content wrapper',
         );
      });
   });

   describe('ensureArray', () => {
      test('should normalize scalar values into arrays', () => {
         expect(ensureArray('value')).toEqual(['value']);
         expect(ensureArray(1)).toEqual([1]);
      });

      test('should return arrays unchanged', () => {
         expect(ensureArray(['a', 'b'])).toEqual(['a', 'b']);
      });

      test('should convert empty-like values to empty arrays', () => {
         expect(ensureArray(undefined)).toEqual([]);
         expect(ensureArray(null)).toEqual([]);
         expect(ensureArray('')).toEqual([]);
      });
   });

   describe('detectArrayPatterns', () => {
      test('should detect plural container and singular child patterns', () => {
         const xml = `
				<league>
					<teams>
						<team><team_key>1</team_key></team>
					</teams>
					<players>
						<player><player_key>2</player_key></player>
					</players>
					<metadata>
						<player><player_key>3</player_key></player>
					</metadata>
				</league>
			`;

         const patterns = detectArrayPatterns(xml);

         expect(patterns.get('teams')).toBe('team');
         expect(patterns.get('players')).toBe('player');
         expect(patterns.has('metadata')).toBe(false);
      });
   });

   describe('normalizeArrays', () => {
      test('should normalize nested singular wrapper objects recursively', () => {
         const result = normalizeArrays({
            league: {
               teams: {
                  team: {
                     teamKey: '423.l.12345.t.1',
                     managers: {
                        manager: {
                           nickname: 'Commish',
                        },
                     },
                  },
               },
            },
         });

         expect(result).toEqual({
            league: {
               teams: [
                  {
                     teamKey: '423.l.12345.t.1',
                     managers: [{ nickname: 'Commish' }],
                  },
               ],
            },
         });
      });

      test('should convert known empty collection strings into arrays', () => {
         const result = normalizeArrays({
            league: {
               players: '',
               teams: '',
            },
         });

         expect(result).toEqual({
            league: {
               players: [],
               teams: [],
            },
         });
      });
   });
});
