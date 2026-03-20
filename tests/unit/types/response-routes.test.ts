import { describe, expect, test } from 'bun:test';
import type { InferResponseType } from '../../../src/types/request/response-routes.ts';
import type {
   AllResponseTypes,
   GamesCollectionResponse,
   LeagueSettingsResponse,
   ResourceResponse,
   TeamRosterPlayersResponse,
   UserGameLeaguesResponse,
   UserTeamsResponse,
} from '../../../src/types/request/responses.js';

type Assert<T extends true> = T;
type IsEqual<A, B> =
   (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
      ? true
      : false;

type LeagueSettingsInference = InferResponseType<'league.settings'>;
type LeagueSettingsInferenceAssertion = Assert<
   IsEqual<LeagueSettingsInference, LeagueSettingsResponse>
>;
const leagueSettingsInferenceAssertion: LeagueSettingsInferenceAssertion = true;
void leagueSettingsInferenceAssertion;

type TeamRosterPlayersInference = InferResponseType<'team.roster.players'>;
type TeamRosterPlayersInferenceAssertion = Assert<
   IsEqual<TeamRosterPlayersInference, TeamRosterPlayersResponse>
>;
const teamRosterPlayersInferenceAssertion: TeamRosterPlayersInferenceAssertion = true;
void teamRosterPlayersInferenceAssertion;

type UserTeamsInference = InferResponseType<'users.games.teams'>;
type UserTeamsInferenceAssertion = Assert<
   IsEqual<UserTeamsInference, UserTeamsResponse>
>;
const userTeamsInferenceAssertion: UserTeamsInferenceAssertion = true;
void userTeamsInferenceAssertion;

type GamesInference = InferResponseType<'games'>;
type GamesInferenceAssertion = Assert<
   IsEqual<GamesInference, GamesCollectionResponse>
>;
const gamesInferenceAssertion: GamesInferenceAssertion = true;
void gamesInferenceAssertion;

type UserGameLeaguesInference = InferResponseType<'users.games.leagues'>;
type UserGameLeaguesInferenceAssertion = Assert<
   IsEqual<UserGameLeaguesInference, UserGameLeaguesResponse>
>;
const userGameLeaguesInferenceAssertion: UserGameLeaguesInferenceAssertion = true;
void userGameLeaguesInferenceAssertion;

type RootInference = InferResponseType<'root'>;
type RootInferenceAssertion = Assert<
   IsEqual<RootInference, AllResponseTypes>
>;
const rootInferenceAssertion: RootInferenceAssertion = true;
void rootInferenceAssertion;

type ExpandedLeagueInference = InferResponseType<
   'league',
   'settings' | 'standings'
>;
type ExpandedLeagueInferenceAssertion = Assert<
   IsEqual<
      ExpandedLeagueInference,
      ResourceResponse<'league', 'settings' | 'standings'>
   >
>;
const expandedLeagueInferenceAssertion: ExpandedLeagueInferenceAssertion = true;
void expandedLeagueInferenceAssertion;

describe('response route type helpers', () => {
   test('keeps schema-based stage inference aligned with expected responses', () => {
      expect(true).toBe(true);
   });
});
