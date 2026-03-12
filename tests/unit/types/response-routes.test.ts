import { describe, expect, test } from 'bun:test';
import type {
   MatchResponseType,
   SerializePath,
} from '../../../src/types/query/response-routes.ts';
import type {
   GamesCollectionResponse,
   LeagueSettingsResponse,
   TeamRosterPlayersResponse,
   UserGameLeaguesResponse,
   UsersCollectionResponse,
   UserTeamsResponse,
} from '../../../src/types/query/responses.js';

type Assert<T extends true> = T;
type IsEqual<A, B> =
   (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
      ? true
      : false;

type LeagueSettingsPath = SerializePath<
   ['league', '423.l.12345', 'settings']
>;
type LeagueSettingsPathAssertion = Assert<
   IsEqual<LeagueSettingsPath, 'league/:key/settings'>
>;
const leagueSettingsPathAssertion: LeagueSettingsPathAssertion = true;
void leagueSettingsPathAssertion;

type TeamRosterPlayersPath = SerializePath<
   ['team', '423.l.12345.t.1', 'roster', 'players']
>;
type TeamRosterPlayersPathAssertion = Assert<
   IsEqual<TeamRosterPlayersPath, 'team/:key/roster/players'>
>;
const teamRosterPlayersPathAssertion: TeamRosterPlayersPathAssertion = true;
void teamRosterPlayersPathAssertion;

type UserGamesTeamsPath = SerializePath<['users', 'games', 'teams']>;
type UserGamesTeamsPathAssertion = Assert<
   IsEqual<UserGamesTeamsPath, 'users/games/teams'>
>;
const userGamesTeamsPathAssertion: UserGamesTeamsPathAssertion = true;
void userGamesTeamsPathAssertion;

type GamesPath = SerializePath<['games']>;
type GamesPathAssertion = Assert<IsEqual<GamesPath, 'games'>>;
const gamesPathAssertion: GamesPathAssertion = true;
void gamesPathAssertion;

type UsersPath = SerializePath<['users']>;
type UsersPathAssertion = Assert<IsEqual<UsersPath, 'users'>>;
const usersPathAssertion: UsersPathAssertion = true;
void usersPathAssertion;

type UserGamesLeaguesPath = SerializePath<['users', 'games', 'leagues']>;
type UserGamesLeaguesPathAssertion = Assert<
   IsEqual<UserGamesLeaguesPath, 'users/games/leagues'>
>;
const userGamesLeaguesPathAssertion: UserGamesLeaguesPathAssertion = true;
void userGamesLeaguesPathAssertion;

type LeagueSettingsMatch = MatchResponseType<
   ['league', '423.l.12345', 'settings']
>;
type LeagueSettingsMatchAssertion = Assert<
   IsEqual<LeagueSettingsMatch, LeagueSettingsResponse>
>;
const leagueSettingsMatchAssertion: LeagueSettingsMatchAssertion = true;
void leagueSettingsMatchAssertion;

type TeamRosterPlayersMatch = MatchResponseType<
   ['team', '423.l.12345.t.1', 'roster', 'players']
>;
type TeamRosterPlayersMatchAssertion = Assert<
   IsEqual<TeamRosterPlayersMatch, TeamRosterPlayersResponse>
>;
const teamRosterPlayersMatchAssertion: TeamRosterPlayersMatchAssertion = true;
void teamRosterPlayersMatchAssertion;

type UserTeamsMatch = MatchResponseType<['users', 'games', 'teams']>;
type UserTeamsMatchAssertion = Assert<
   IsEqual<UserTeamsMatch, UserTeamsResponse>
>;
const userTeamsMatchAssertion: UserTeamsMatchAssertion = true;
void userTeamsMatchAssertion;

type GamesMatch = MatchResponseType<['games']>;
type GamesMatchAssertion = Assert<
   IsEqual<GamesMatch, GamesCollectionResponse>
>;
const gamesMatchAssertion: GamesMatchAssertion = true;
void gamesMatchAssertion;

type UsersMatch = MatchResponseType<['users']>;
type UsersMatchAssertion = Assert<
   IsEqual<UsersMatch, UsersCollectionResponse>
>;
const usersMatchAssertion: UsersMatchAssertion = true;
void usersMatchAssertion;

type UserGameLeaguesMatch = MatchResponseType<
   ['users', 'games', 'leagues']
>;
type UserGameLeaguesMatchAssertion = Assert<
   IsEqual<UserGameLeaguesMatch, UserGameLeaguesResponse>
>;
const userGameLeaguesMatchAssertion: UserGameLeaguesMatchAssertion = true;
void userGameLeaguesMatchAssertion;

type UnknownMatch = MatchResponseType<['users', 'not-a-real-route']>;
type UnknownMatchAssertion = Assert<IsEqual<UnknownMatch, never>>;
const unknownMatchAssertion: UnknownMatchAssertion = true;
void unknownMatchAssertion;

const keyedResources = new Set([
   'game',
   'league',
   'team',
   'player',
   'transaction',
]);

function serializePathRuntime(path: string[]): string {
   if (path.length === 0) {
      return '';
   }

   const [resource, , ...tail] = path;

   if (resource && path.length >= 2 && keyedResources.has(resource)) {
      return tail.length === 0
         ? `${resource}/:key`
         : `${resource}/:key/${tail.join('/')}`;
   }

   return path.join('/');
}

describe('response route type helpers', () => {
   test('normalizes keyed resource paths at runtime', () => {
      expect(
         serializePathRuntime([
            'team',
            '423.l.12345.t.1',
            'roster',
            'players',
         ]),
      ).toBe('team/:key/roster/players');
      expect(
         serializePathRuntime(['transaction', '423.l.12345.tr.7']),
      ).toBe('transaction/:key');
   });

   test('preserves literal collection paths at runtime', () => {
      expect(serializePathRuntime(['games'])).toBe('games');
      expect(serializePathRuntime(['users', 'games', 'teams'])).toBe(
         'users/games/teams',
      );
      expect(serializePathRuntime(['users'])).toBe('users');
      expect(serializePathRuntime([])).toBe('');
   });
});
