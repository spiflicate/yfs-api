import type {
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

export type PlayerCollectionParamKey =
   | 'player_keys'
   | 'position'
   | 'status'
   | 'sort'
   | 'count'
   | 'start'
   | 'search'
   | 'week'
   | 'date';

const gameOutValues = [
   'stat_categories',
   'position_types',
   'game_weeks',
] as const;
const leagueOutValues = [
   'settings',
   'standings',
   'scoreboard',
   'drafts',
] as const;
const teamOutValues = ['roster', 'matchups', 'stats', 'standings'] as const;
const playerOutValues = [
   'stats',
   'ownership',
   'percent_owned',
   'draft_analysis',
] as const;

export type GameOutValue = (typeof gameOutValues)[number];
export type LeagueOutValue = (typeof leagueOutValues)[number];
export type TeamOutValue = (typeof teamOutValues)[number];
export type PlayerOutValue = (typeof playerOutValues)[number];

type NoNext = Record<never, never>;

type StageDefinition<
   TResponse,
   TParamKeys extends string = never,
   TOutValues extends string = never,
   TNext extends Partial<Record<string, RouteStage>> = NoNext,
   TWriteMethods extends string = never,
> = {
   response: TResponse;
   paramKeys: TParamKeys;
   outValues: TOutValues;
   next: TNext;
   writeMethods: TWriteMethods;
};

export type RouteStage =
   | 'root'
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'transaction'
   | 'users'
   | 'games'
   | 'game.leagues'
   | 'game.players'
   | 'game.stat_categories'
   | 'game.position_types'
   | 'game.game_weeks'
   | 'league.settings'
   | 'league.standings'
   | 'league.scoreboard'
   | 'league.teams'
   | 'league.players'
   | 'league.transactions'
   | 'league.drafts'
   | 'team.roster'
   | 'team.roster.players'
   | 'team.matchups'
   | 'team.stats'
   | 'team.standings'
   | 'player.stats'
   | 'player.ownership'
   | 'player.percent_owned'
   | 'player.draft_analysis'
   | 'users.games'
   | 'users.leagues'
   | 'users.teams'
   | 'users.games.leagues'
   | 'users.games.teams';

export interface RouteSchema {
   root: StageDefinition<
      never,
      never,
      never,
      {
         game: 'game';
         league: 'league';
         team: 'team';
         player: 'player';
         transaction: 'transaction';
         users: 'users';
         games: 'games';
      }
   >;
   game: StageDefinition<
      GameResourceResponse,
      'game_keys' | 'out',
      GameOutValue,
      {
         leagues: 'game.leagues';
         players: 'game.players';
         statCategories: 'game.stat_categories';
         positionTypes: 'game.position_types';
         gameWeeks: 'game.game_weeks';
      }
   >;
   league: StageDefinition<
      LeagueResourceResponse,
      'league_keys' | 'out',
      LeagueOutValue,
      {
         settings: 'league.settings';
         standings: 'league.standings';
         scoreboard: 'league.scoreboard';
         teams: 'league.teams';
         players: 'league.players';
         transactions: 'league.transactions';
         drafts: 'league.drafts';
      }
   >;
   team: StageDefinition<
      TeamResourceResponse,
      'team_keys' | 'out',
      TeamOutValue,
      {
         roster: 'team.roster';
         matchups: 'team.matchups';
         stats: 'team.stats';
         standings: 'team.standings';
      }
   >;
   player: StageDefinition<
      PlayerResourceResponse,
      PlayerCollectionParamKey | 'out',
      PlayerOutValue,
      {
         stats: 'player.stats';
         ownership: 'player.ownership';
         percentOwned: 'player.percent_owned';
         draftAnalysis: 'player.draft_analysis';
      }
   >;
   transaction: StageDefinition<
      TransactionResourceResponse,
      never,
      never,
      NoNext,
      'edit' | 'cancel'
   >;
   users: StageDefinition<
      UsersCollectionResponse,
      'use_login',
      never,
      {
         games: 'users.games';
         leagues: 'users.leagues';
         teams: 'users.teams';
      }
   >;
   games: StageDefinition<
      GamesCollectionResponse,
      | 'game_keys'
      | 'out'
      | 'is_available'
      | 'game_types'
      | 'game_codes'
      | 'seasons',
      GameOutValue
   >;
   'game.leagues': StageDefinition<
      GameLeaguesResponse,
      'league_keys' | 'out',
      LeagueOutValue
   >;
   'game.players': StageDefinition<
      GamePlayersResponse,
      PlayerCollectionParamKey
   >;
   'game.stat_categories': StageDefinition<GameStatCategoriesResponse>;
   'game.position_types': StageDefinition<GamePositionTypesResponse>;
   'game.game_weeks': StageDefinition<GameGameWeeksResponse>;
   'league.settings': StageDefinition<LeagueSettingsResponse>;
   'league.standings': StageDefinition<LeagueStandingsResponse>;
   'league.scoreboard': StageDefinition<
      LeagueScoreboardResponse,
      'week' | 'date'
   >;
   'league.teams': StageDefinition<
      LeagueTeamsResponse,
      'team_keys' | 'out',
      TeamOutValue
   >;
   'league.players': StageDefinition<
      LeaguePlayersResponse,
      PlayerCollectionParamKey
   >;
   'league.transactions': StageDefinition<
      LeagueTransactionsResponse,
      'type' | 'types' | 'team_key' | 'count' | 'start',
      never,
      NoNext,
      'create' | 'edit' | 'cancel'
   >;
   'league.drafts': StageDefinition<LeagueDraftsResponse>;
   'team.roster': StageDefinition<
      TeamRosterResponse,
      'week' | 'date',
      never,
      {
         players: 'team.roster.players';
      },
      'updateLineup'
   >;
   'team.roster.players': StageDefinition<
      TeamRosterPlayersResponse,
      PlayerCollectionParamKey
   >;
   'team.matchups': StageDefinition<TeamMatchupsResponse, 'weeks'>;
   'team.stats': StageDefinition<
      TeamStatsResponse,
      'type' | 'week' | 'date'
   >;
   'team.standings': StageDefinition<TeamStandingsResponse>;
   'player.stats': StageDefinition<
      PlayerStatsResponse,
      'type' | 'week' | 'date'
   >;
   'player.ownership': StageDefinition<PlayerOwnershipResponse>;
   'player.percent_owned': StageDefinition<PlayerPercentOwnedResponse>;
   'player.draft_analysis': StageDefinition<PlayerDraftAnalysisResponse>;
   'users.games': StageDefinition<
      UserGamesResponse,
      | 'game_keys'
      | 'is_available'
      | 'game_types'
      | 'game_codes'
      | 'seasons',
      never,
      {
         leagues: 'users.games.leagues';
         teams: 'users.games.teams';
      }
   >;
   'users.leagues': StageDefinition<
      UserLeaguesResponse,
      'league_keys' | 'out',
      LeagueOutValue
   >;
   'users.teams': StageDefinition<
      UserTeamsResponse,
      'team_keys' | 'out',
      TeamOutValue
   >;
   'users.games.leagues': StageDefinition<
      UserGameLeaguesResponse,
      'league_keys' | 'out',
      LeagueOutValue
   >;
   'users.games.teams': StageDefinition<
      UserTeamsResponse,
      'team_keys' | 'out',
      TeamOutValue
   >;
}

export type RuntimeWriteMethod =
   | 'create'
   | 'edit'
   | 'cancel'
   | 'updateLineup';

type RuntimeStageDefinition = {
   next?: Partial<Record<string, RouteStage>>;
   outValues?: readonly string[];
   writeMethods?: readonly RuntimeWriteMethod[];
   serializeObjectBodyAsYahooXml?: boolean;
};

export const routeStageRuntime: Record<RouteStage, RuntimeStageDefinition> =
   {
      root: {
         next: {
            game: 'game',
            league: 'league',
            team: 'team',
            player: 'player',
            transaction: 'transaction',
            users: 'users',
            games: 'games',
         },
      },
      game: {
         next: {
            leagues: 'game.leagues',
            players: 'game.players',
            statCategories: 'game.stat_categories',
            positionTypes: 'game.position_types',
            gameWeeks: 'game.game_weeks',
         },
         outValues: gameOutValues,
      },
      league: {
         next: {
            settings: 'league.settings',
            standings: 'league.standings',
            scoreboard: 'league.scoreboard',
            teams: 'league.teams',
            players: 'league.players',
            transactions: 'league.transactions',
            drafts: 'league.drafts',
         },
         outValues: leagueOutValues,
      },
      team: {
         next: {
            roster: 'team.roster',
            matchups: 'team.matchups',
            stats: 'team.stats',
            standings: 'team.standings',
         },
         outValues: teamOutValues,
      },
      player: {
         next: {
            stats: 'player.stats',
            ownership: 'player.ownership',
            percentOwned: 'player.percent_owned',
            draftAnalysis: 'player.draft_analysis',
         },
         outValues: playerOutValues,
      },
      transaction: {
         writeMethods: ['edit', 'cancel'],
         serializeObjectBodyAsYahooXml: true,
      },
      users: {
         next: {
            games: 'users.games',
            leagues: 'users.leagues',
            teams: 'users.teams',
         },
      },
      games: {
         outValues: gameOutValues,
      },
      'game.leagues': {
         outValues: leagueOutValues,
      },
      'game.players': {},
      'game.stat_categories': {},
      'game.position_types': {},
      'game.game_weeks': {},
      'league.settings': {},
      'league.standings': {},
      'league.scoreboard': {},
      'league.teams': {
         outValues: teamOutValues,
      },
      'league.players': {},
      'league.transactions': {
         writeMethods: ['create', 'edit', 'cancel'],
         serializeObjectBodyAsYahooXml: true,
      },
      'league.drafts': {},
      'team.roster': {
         next: {
            players: 'team.roster.players',
         },
         writeMethods: ['updateLineup'],
         serializeObjectBodyAsYahooXml: true,
      },
      'team.roster.players': {},
      'team.matchups': {},
      'team.stats': {},
      'team.standings': {},
      'player.stats': {},
      'player.ownership': {},
      'player.percent_owned': {},
      'player.draft_analysis': {},
      'users.games': {
         next: {
            leagues: 'users.games.leagues',
            teams: 'users.games.teams',
         },
      },
      'users.leagues': {
         outValues: leagueOutValues,
      },
      'users.teams': {
         outValues: teamOutValues,
      },
      'users.games.leagues': {
         outValues: leagueOutValues,
      },
      'users.games.teams': {
         outValues: teamOutValues,
      },
   };

interface ParamHelperMethodKeyMap {
   out: 'out';
   position: 'position';
   status: 'status';
   type: 'type';
   types: 'types';
   teamKey: 'team_key';
   sort: 'sort';
   count: 'count';
   start: 'start';
   search: 'search';
   week: 'week';
   date: 'date';
   gameKeys: 'game_keys';
   isAvailable: 'is_available';
   gameTypes: 'game_types';
   gameCodes: 'game_codes';
   seasons: 'seasons';
   leagueKeys: 'league_keys';
   teamKeys: 'team_keys';
   playerKeys: 'player_keys';
   useLogin: 'use_login';
}

export type ParamHelperMethodName = keyof ParamHelperMethodKeyMap;

export type ParamKeyForStage<TStage extends RouteStage> =
   RouteSchema[TStage]['paramKeys'];

export type FilterKeyForStage<TStage extends RouteStage> = Exclude<
   ParamKeyForStage<TStage>,
   'out'
>;

export type OutValueForStage<TStage extends RouteStage> =
   RouteSchema[TStage]['outValues'];

export type NavigationMethodNamesForStage<TStage extends RouteStage> =
   Extract<keyof RouteSchema[TStage]['next'], string>;

export type WriteMethodNamesForStage<TStage extends RouteStage> =
   RouteSchema[TStage]['writeMethods'];

export type NextStage<
   TStage extends RouteStage,
   TMethod extends string,
> = Extract<
   TMethod extends keyof RouteSchema[TStage]['next']
      ? RouteSchema[TStage]['next'][TMethod]
      : never,
   RouteStage
>;

export type StagesWithNext<TMethod extends string> = {
   [TStage in RouteStage]: TMethod extends keyof RouteSchema[TStage]['next']
      ? TStage
      : never;
}[RouteStage];

export type ParamHelperMethodsForStage<TStage extends RouteStage> = {
   [TMethod in keyof ParamHelperMethodKeyMap]: ParamHelperMethodKeyMap[TMethod] extends ParamKeyForStage<TStage>
      ? TMethod
      : never;
}[keyof ParamHelperMethodKeyMap];

export type StageResponse<TStage extends RouteStage> =
   RouteSchema[TStage]['response'];
