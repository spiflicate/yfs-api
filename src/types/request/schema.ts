export type PlayerCollectionParamKey =
   | 'player_keys'
   | 'position'
   | 'status'
   | 'sort'
   | 'sort_type'
   | 'sort_season'
   | 'sort_week'
   | 'sort_date'
   | 'count'
   | 'start'
   | 'search'
   | 'week'
   | 'date';

const gameOutValues = [
   'leagues',
   'players',
   'stat_categories',
   'position_types',
   'game_weeks',
] as const;
const leagueOutValues = [
   'settings',
   'standings',
   'scoreboard',
   'teams',
   'players',
   'transactions',
   'drafts',
] as const;
const teamOutValues = ['roster', 'matchups', 'stats', 'standings'] as const;
const playerOutValues = [
   'stats',
   'ownership',
   'percent_owned',
   'draft_analysis',
] as const;
const usersGamesOutValues = ['leagues', 'teams'] as const;
const transactionOutValues = ['players'] as const;

export type GameOutValue = (typeof gameOutValues)[number];
export type LeagueOutValue = (typeof leagueOutValues)[number];
export type TeamOutValue = (typeof teamOutValues)[number];
export type PlayerOutValue = (typeof playerOutValues)[number];
export type UsersGamesOutValue = (typeof usersGamesOutValues)[number];
export type TransactionOutValue = (typeof transactionOutValues)[number];

export type RuntimeWriteMethod =
   | 'create'
   | 'edit'
   | 'cancel'
   | 'updateLineup';

type StageSpec = {
   params?: readonly string[];
   outValues?: readonly string[];
   next?: Readonly<Record<string, string>>;
   writeMethods?: readonly RuntimeWriteMethod[];
   serializeObjectBodyAsYahooXml?: boolean;
   confidence?: 'explicit' | 'composed' | 'experimental';
};

export type RuntimeStageDefinition = StageSpec;

export const routeStageRuntime = {
   root: {
      next: {
         game: 'game',
         league: 'league',
         team: 'team',
         player: 'player',
         transaction: 'transaction',
         users: 'users',
         games: 'games',
         leagues: 'leagues',
         teams: 'teams',
         players: 'players',
      },
      confidence: 'explicit',
   },
   game: {
      params: ['game_keys', 'out'],
      next: {
         leagues: 'game.leagues',
         players: 'game.players',
         statCategories: 'game.stat_categories',
         positionTypes: 'game.position_types',
         gameWeeks: 'game.game_weeks',
      },
      outValues: gameOutValues,
      confidence: 'explicit',
   },
   league: {
      params: ['league_keys', 'out'],
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
      confidence: 'explicit',
   },
   team: {
      params: ['team_keys', 'out'],
      next: {
         roster: 'team.roster',
         matchups: 'team.matchups',
         stats: 'team.stats',
         standings: 'team.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   player: {
      params: ['player_keys', 'out'],
      next: {
         stats: 'player.stats',
         ownership: 'player.ownership',
         percentOwned: 'player.percent_owned',
         draftAnalysis: 'player.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   transaction: {
      next: {
         players: 'transaction.players',
      },
      outValues: transactionOutValues,
      writeMethods: ['edit', 'cancel'],
      serializeObjectBodyAsYahooXml: true,
      confidence: 'explicit',
   },
   users: {
      params: ['use_login'],
      next: {
         games: 'users.games',
         leagues: 'users.leagues',
         teams: 'users.teams',
      },
      confidence: 'explicit',
   },
   games: {
      params: [
         'game_keys',
         'out',
         'is_available',
         'game_types',
         'game_codes',
         'seasons',
      ],
      next: {
         leagues: 'games.leagues',
         players: 'games.players',
         gameWeeks: 'games.game_weeks',
      },
      outValues: gameOutValues,
      confidence: 'explicit',
   },
   leagues: {
      params: ['league_keys', 'out'],
      next: {
         settings: 'leagues.settings',
         standings: 'leagues.standings',
         scoreboard: 'leagues.scoreboard',
         teams: 'leagues.teams',
         players: 'leagues.players',
         transactions: 'leagues.transactions',
         drafts: 'leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'explicit',
   },
   teams: {
      params: ['team_keys', 'out'],
      next: {
         roster: 'teams.roster',
         matchups: 'teams.matchups',
         stats: 'teams.stats',
         standings: 'teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   players: {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
         'out',
      ],
      next: {
         stats: 'players.stats',
         ownership: 'players.ownership',
         percentOwned: 'players.percent_owned',
         draftAnalysis: 'players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'game.leagues': {
      params: ['league_keys', 'out'],
      next: {
         settings: 'game.leagues.settings',
         standings: 'game.leagues.standings',
         scoreboard: 'game.leagues.scoreboard',
         teams: 'game.leagues.teams',
         players: 'game.leagues.players',
         transactions: 'game.leagues.transactions',
         drafts: 'game.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'composed',
   },
   'game.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
         'out',
      ],
      next: {
         stats: 'game.players.stats',
         ownership: 'game.players.ownership',
         percentOwned: 'game.players.percent_owned',
         draftAnalysis: 'game.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'game.stat_categories': { confidence: 'experimental' },
   'game.position_types': { confidence: 'experimental' },
   'game.game_weeks': { confidence: 'explicit' },
   'games.leagues': {
      params: ['league_keys', 'out'],
      next: {
         settings: 'games.leagues.settings',
         standings: 'games.leagues.standings',
         scoreboard: 'games.leagues.scoreboard',
         teams: 'games.leagues.teams',
         players: 'games.leagues.players',
         transactions: 'games.leagues.transactions',
         drafts: 'games.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'composed',
   },
   'games.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
         'out',
      ],
      next: {
         stats: 'games.players.stats',
         ownership: 'games.players.ownership',
         percentOwned: 'games.players.percent_owned',
         draftAnalysis: 'games.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'composed',
   },
   'games.game_weeks': { confidence: 'composed' },
   'league.settings': { confidence: 'explicit' },
   'league.standings': { confidence: 'explicit' },
   'league.scoreboard': {
      params: ['week', 'date'],
      confidence: 'explicit',
   },
   'league.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'league.teams.roster',
         matchups: 'league.teams.matchups',
         stats: 'league.teams.stats',
         standings: 'league.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'league.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
         'out',
      ],
      next: {
         stats: 'league.players.stats',
         ownership: 'league.players.ownership',
         percentOwned: 'league.players.percent_owned',
         draftAnalysis: 'league.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'league.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      next: {
         players: 'league.transactions.players',
      },
      outValues: transactionOutValues,
      writeMethods: ['create', 'edit', 'cancel'],
      serializeObjectBodyAsYahooXml: true,
      confidence: 'explicit',
   },
   'league.transactions.players': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
      ],
      confidence: 'explicit',
   },
   'league.drafts': { confidence: 'experimental' },
   'leagues.settings': { confidence: 'explicit' },
   'leagues.standings': { confidence: 'explicit' },
   'leagues.scoreboard': {
      params: ['week', 'date'],
      confidence: 'explicit',
   },
   'leagues.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'leagues.teams.roster',
         matchups: 'leagues.teams.matchups',
         stats: 'leagues.teams.stats',
         standings: 'leagues.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'leagues.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
         'out',
      ],
      next: {
         stats: 'leagues.players.stats',
         ownership: 'leagues.players.ownership',
         percentOwned: 'leagues.players.percent_owned',
         draftAnalysis: 'leagues.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'leagues.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      next: {
         players: 'leagues.transactions.players',
      },
      outValues: transactionOutValues,
      confidence: 'explicit',
   },
   'leagues.transactions.players': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
      ],
      confidence: 'explicit',
   },
   'leagues.drafts': { confidence: 'experimental' },
   'team.roster': {
      params: ['week', 'date'],
      next: {
         players: 'team.roster.players',
      },
      writeMethods: ['updateLineup'],
      serializeObjectBodyAsYahooXml: true,
      confidence: 'explicit',
   },
   'team.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'explicit',
   },
   'team.matchups': {
      params: ['weeks'],
      confidence: 'explicit',
   },
   'team.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'explicit',
   },
   'team.standings': { confidence: 'experimental' },
   'teams.roster': {
      params: ['week', 'date'],
      next: {
         players: 'teams.roster.players',
      },
      confidence: 'explicit',
   },
   'teams.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'explicit',
   },
   'teams.matchups': {
      params: ['weeks'],
      confidence: 'explicit',
   },
   'teams.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'explicit',
   },
   'teams.standings': { confidence: 'experimental' },
   'player.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'explicit',
   },
   'player.ownership': { confidence: 'explicit' },
   'player.percent_owned': { confidence: 'explicit' },
   'player.draft_analysis': { confidence: 'experimental' },
   'players.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'explicit',
   },
   'players.ownership': { confidence: 'composed' },
   'players.percent_owned': { confidence: 'composed' },
   'players.draft_analysis': { confidence: 'experimental' },
   'game.leagues.settings': { confidence: 'composed' },
   'game.leagues.standings': { confidence: 'composed' },
   'game.leagues.scoreboard': {
      params: ['week', 'date'],
      confidence: 'composed',
   },
   'game.leagues.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'game.leagues.teams.roster',
         matchups: 'game.leagues.teams.matchups',
         stats: 'game.leagues.teams.stats',
         standings: 'game.leagues.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'game.leagues.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'game.leagues.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'game.leagues.drafts': { confidence: 'experimental' },
   'games.leagues.settings': { confidence: 'composed' },
   'games.leagues.standings': { confidence: 'composed' },
   'games.leagues.scoreboard': {
      params: ['week', 'date'],
      confidence: 'composed',
   },
   'games.leagues.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'games.leagues.teams.roster',
         matchups: 'games.leagues.teams.matchups',
         stats: 'games.leagues.teams.stats',
         standings: 'games.leagues.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'games.leagues.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'games.leagues.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'games.leagues.drafts': { confidence: 'experimental' },
   'game.players.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'game.players.ownership': { confidence: 'composed' },
   'game.players.percent_owned': { confidence: 'composed' },
   'game.players.draft_analysis': { confidence: 'experimental' },
   'games.players.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'games.players.ownership': { confidence: 'composed' },
   'games.players.percent_owned': { confidence: 'composed' },
   'games.players.draft_analysis': { confidence: 'experimental' },
   'league.players.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'league.players.ownership': { confidence: 'composed' },
   'league.players.percent_owned': { confidence: 'composed' },
   'league.players.draft_analysis': { confidence: 'experimental' },
   'leagues.players.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'leagues.players.ownership': { confidence: 'composed' },
   'leagues.players.percent_owned': { confidence: 'composed' },
   'leagues.players.draft_analysis': { confidence: 'experimental' },
   'league.teams.roster': {
      params: ['week', 'date'],
      next: {
         players: 'league.teams.roster.players',
      },
      confidence: 'composed',
   },
   'league.teams.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'league.teams.matchups': {
      params: ['weeks'],
      confidence: 'composed',
   },
   'league.teams.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'league.teams.standings': { confidence: 'experimental' },
   'leagues.teams.roster': {
      params: ['week', 'date'],
      next: {
         players: 'leagues.teams.roster.players',
      },
      confidence: 'composed',
   },
   'leagues.teams.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'leagues.teams.matchups': {
      params: ['weeks'],
      confidence: 'composed',
   },
   'leagues.teams.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'leagues.teams.standings': { confidence: 'experimental' },
   'users.games': {
      params: [
         'game_keys',
         'is_available',
         'game_types',
         'game_codes',
         'seasons',
         'out',
      ],
      next: {
         leagues: 'users.games.leagues',
         teams: 'users.games.teams',
      },
      outValues: usersGamesOutValues,
      confidence: 'explicit',
   },
   'users.games.leagues': {
      params: ['league_keys', 'out'],
      next: {
         settings: 'users.games.leagues.settings',
         standings: 'users.games.leagues.standings',
         scoreboard: 'users.games.leagues.scoreboard',
         teams: 'users.games.leagues.teams',
         players: 'users.games.leagues.players',
         transactions: 'users.games.leagues.transactions',
         drafts: 'users.games.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'composed',
   },
   'users.games.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'users.games.teams.roster',
         matchups: 'users.games.teams.matchups',
         stats: 'users.games.teams.stats',
         standings: 'users.games.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.leagues': {
      params: ['league_keys', 'out'],
      next: {
         settings: 'users.leagues.settings',
         standings: 'users.leagues.standings',
         scoreboard: 'users.leagues.scoreboard',
         teams: 'users.leagues.teams',
         players: 'users.leagues.players',
         transactions: 'users.leagues.transactions',
         drafts: 'users.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'explicit',
   },
   'users.teams': {
      params: ['team_keys', 'out'],
      next: {
         roster: 'users.teams.roster',
         matchups: 'users.teams.matchups',
         stats: 'users.teams.stats',
         standings: 'users.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'users.games.leagues.settings': { confidence: 'composed' },
   'users.games.leagues.standings': { confidence: 'composed' },
   'users.games.leagues.scoreboard': {
      params: ['week', 'date'],
      confidence: 'composed',
   },
   'users.games.leagues.teams': {
      params: ['team_keys', 'out'],
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.games.leagues.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'users.games.leagues.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'users.games.leagues.drafts': { confidence: 'experimental' },
   'users.games.teams.roster': {
      params: ['week', 'date'],
      next: {
         players: 'users.games.teams.roster.players',
      },
      confidence: 'composed',
   },
   'users.games.teams.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'users.games.teams.matchups': {
      params: ['weeks'],
      confidence: 'composed',
   },
   'users.games.teams.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'users.games.teams.standings': { confidence: 'experimental' },
   'users.leagues.settings': { confidence: 'composed' },
   'users.leagues.standings': { confidence: 'composed' },
   'users.leagues.scoreboard': {
      params: ['week', 'date'],
      confidence: 'composed',
   },
   'users.leagues.teams': {
      params: ['team_keys', 'out'],
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.leagues.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'users.leagues.transactions': {
      params: [
         'transaction_keys',
         'type',
         'types',
         'team_key',
         'count',
         'start',
         'out',
      ],
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'users.leagues.drafts': { confidence: 'experimental' },
   'users.teams.roster': {
      params: ['week', 'date'],
      next: {
         players: 'users.teams.roster.players',
      },
      confidence: 'composed',
   },
   'users.teams.roster.players': {
      params: [
         'player_keys',
         'position',
         'status',
         'sort',
         'sort_type',
         'sort_season',
         'sort_week',
         'sort_date',
         'count',
         'start',
         'search',
         'week',
         'date',
      ],
      confidence: 'composed',
   },
   'users.teams.matchups': {
      params: ['weeks'],
      confidence: 'composed',
   },
   'users.teams.stats': {
      params: ['type', 'week', 'date'],
      confidence: 'composed',
   },
   'users.teams.standings': { confidence: 'experimental' },
   'transaction.players': { confidence: 'explicit' },
} as const satisfies Record<string, StageSpec>;

export type RouteStage = keyof typeof routeStageRuntime;

interface ParamHelperMethodKeyMap {
   out: 'out';
   position: 'position';
   status: 'status';
   type: 'type';
   types: 'types';
   teamKey: 'team_key';
   transactionKeys: 'transaction_keys';
   sort: 'sort';
   sortType: 'sort_type';
   sortSeason: 'sort_season';
   sortWeek: 'sort_week';
   sortDate: 'sort_date';
   count: 'count';
   start: 'start';
   search: 'search';
   week: 'week';
   weeks: 'weeks';
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

type StageConfig<TStage extends RouteStage> =
   (typeof routeStageRuntime)[TStage];

export type ParamKeyForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      params: readonly (infer TParam)[];
   }
      ? Extract<TParam, string>
      : never;

export type FilterKeyForStage<TStage extends RouteStage> = Exclude<
   ParamKeyForStage<TStage>,
   'out'
>;

export type OutValueForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      outValues: readonly (infer TOut)[];
   }
      ? Extract<TOut, string>
      : never;

export type NavigationMethodNamesForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      next: Readonly<Record<string, string>>;
   }
      ? keyof StageConfig<TStage>['next'] & string
      : never;

export type WriteMethodNamesForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      writeMethods: readonly (infer TMethod)[];
   }
      ? Extract<TMethod, string>
      : never;

export type NextStage<TStage extends RouteStage, TMethod extends string> =
   StageConfig<TStage> extends {
      next: Readonly<Record<string, string>>;
   }
      ? TMethod extends keyof StageConfig<TStage>['next']
         ? Extract<StageConfig<TStage>['next'][TMethod], RouteStage>
         : never
      : never;

export type StagesWithNext<TMethod extends string> = {
   [TStage in RouteStage]: TMethod extends NavigationMethodNamesForStage<TStage>
      ? TStage
      : never;
}[RouteStage];

export type ParamHelperMethodsForStage<TStage extends RouteStage> = {
   [TMethod in keyof ParamHelperMethodKeyMap]: ParamHelperMethodKeyMap[TMethod] extends ParamKeyForStage<TStage>
      ? TMethod
      : never;
}[keyof ParamHelperMethodKeyMap];

export type StageResponse<TStage extends RouteStage> =
   TStage extends RouteStage ? unknown : never;
