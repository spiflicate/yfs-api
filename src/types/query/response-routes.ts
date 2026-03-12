import type {
   AllResponseTypes,
   GameGameWeeksResponse,
   GameLeaguesResponse,
   GamePlayersResponse,
   GamePositionTypesResponse,
   GameResourceResponse,
   GameStatCategoriesResponse,
   GamesCollectionResponse,
   LeagueDraftsResponse,
   LeaguePlayersResponse,
   LeagueResourceResponse,
   LeagueScoreboardResponse,
   LeagueSettingsResponse,
   LeagueStandingsResponse,
   LeagueTeamsResponse,
   LeagueTransactionsResponse,
   PlayerDraftAnalysisResponse,
   PlayerOwnershipResponse,
   PlayerPercentOwnedResponse,
   PlayerResourceResponse,
   PlayerStatsResponse,
   TeamMatchupsResponse,
   TeamResourceResponse,
   TeamRosterPlayersResponse,
   TeamRosterResponse,
   TeamStandingsResponse,
   TeamStatsResponse,
   TransactionResourceResponse,
   UserGameLeaguesResponse,
   UserGamesResponse,
   UserLeaguesResponse,
   UsersCollectionResponse,
   UserTeamsResponse,
} from './responses.js';

type ResponseTypeByPath = {
   'game/:key': GameResourceResponse;
   'game/:key/leagues': GameLeaguesResponse;
   'game/:key/players': GamePlayersResponse;
   'game/:key/stat_categories': GameStatCategoriesResponse;
   'game/:key/position_types': GamePositionTypesResponse;
   'game/:key/game_weeks': GameGameWeeksResponse;
   games: GamesCollectionResponse;
   'league/:key': LeagueResourceResponse;
   'league/:key/settings': LeagueSettingsResponse;
   'league/:key/standings': LeagueStandingsResponse;
   'league/:key/scoreboard': LeagueScoreboardResponse;
   'league/:key/teams': LeagueTeamsResponse;
   'league/:key/players': LeaguePlayersResponse;
   'league/:key/transactions': LeagueTransactionsResponse;
   'league/:key/drafts': LeagueDraftsResponse;
   'team/:key': TeamResourceResponse;
   'team/:key/roster': TeamRosterResponse;
   'team/:key/roster/players': TeamRosterPlayersResponse;
   'team/:key/matchups': TeamMatchupsResponse;
   'team/:key/standings': TeamStandingsResponse;
   'team/:key/stats': TeamStatsResponse;
   'player/:key': PlayerResourceResponse;
   'player/:key/stats': PlayerStatsResponse;
   'player/:key/ownership': PlayerOwnershipResponse;
   'player/:key/percent_owned': PlayerPercentOwnedResponse;
   'player/:key/draft_analysis': PlayerDraftAnalysisResponse;
   users: UsersCollectionResponse;
   'users/games': UserGamesResponse;
   'users/games/leagues': UserGameLeaguesResponse;
   'users/leagues': UserLeaguesResponse;
   'users/games/teams': UserTeamsResponse;
   'users/teams': UserTeamsResponse;
   'transaction/:key': TransactionResourceResponse;
};

type KeyedResourceName =
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'transaction';

type JoinPath<TSegments extends string[]> = TSegments extends []
   ? ''
   : TSegments extends [infer THead extends string]
     ? THead
     : TSegments extends [
            infer THead extends string,
            ...infer TTail extends string[],
         ]
       ? `${THead}/${JoinPath<TTail>}`
       : never;

export type SerializePath<TPath extends string[]> = TPath extends [
   infer TResource extends KeyedResourceName,
   string,
   ...infer TTail extends string[],
]
   ? TTail extends []
      ? `${TResource}/:key`
      : `${TResource}/:key/${JoinPath<TTail>}`
   : JoinPath<TPath>;

export type MatchResponseType<TPath extends string[]> =
   SerializePath<TPath> extends keyof ResponseTypeByPath
      ? ResponseTypeByPath[SerializePath<TPath>]
      : never;

export type InferResponseType<TPath extends string[]> = [
   MatchResponseType<TPath>,
] extends [never]
   ? AllResponseTypes
   : MatchResponseType<TPath>;
