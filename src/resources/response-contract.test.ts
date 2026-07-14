import { describe, expect, test } from 'bun:test';
import type {
   YahooLeagueDto,
   YahooLeagueResponseDto,
   YahooLeaguesResponseDto,
   YahooLoggedInUsersResponseDto,
   YahooTeamDto,
   YahooTeamRosterDto,
} from '../domain/normalized';
import type { RequireResponsePath } from './response-contract';

type Assert<TValue extends true> = TValue;
type Equal<TLeft, TRight> = [TLeft] extends [TRight]
   ? [TRight] extends [TLeft]
      ? true
      : false
   : false;

type LeagueTeams = RequireResponsePath<
   YahooLeagueResponseDto,
   readonly ['league', 'teams']
>;
type ExpectedLeagueTeams = {
   league: YahooLeagueDto & { teams: YahooTeamDto[] };
};
type _LeagueTeamsEqual = Assert<Equal<LeagueTeams, ExpectedLeagueTeams>>;

type LeaguesTeamRosters = RequireResponsePath<
   YahooLeaguesResponseDto,
   readonly ['leagues', 'teams', 'roster']
>;
const assertLeaguesRoot = (
   value: LeaguesTeamRosters,
): YahooLeaguesResponseDto => value;
type _RosterRequired = Assert<
   Equal<
      LeaguesTeamRosters['leagues'][number]['teams'][number]['roster'],
      YahooTeamRosterDto
   >
>;

type UserGameTeams = RequireResponsePath<
   YahooLoggedInUsersResponseDto,
   readonly ['users', 'games', 'teams']
>;
const assertUsersRoot = (
   value: UserGameTeams,
): YahooLoggedInUsersResponseDto => value;
type _UserGameTeamsRequired = Assert<
   Equal<
      UserGameTeams['users'][number]['games'][number]['teams'],
      YahooTeamDto[]
   >
>;

describe('RequireResponsePath', () => {
   test('has compile-time coverage for nested singular and array parents', () => {
      expect(true).toBe(true);
      expect(assertLeaguesRoot).toBeFunction();
      expect(assertUsersRoot).toBeFunction();
   });
});
