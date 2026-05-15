export const playerCollectionParamKeys = [
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
] as const;

export type PlayerCollectionParamKey =
   (typeof playerCollectionParamKeys)[number];

export const playerCollectionParams = [
   ...playerCollectionParamKeys,
   'out',
] as const;

export const gameSubResourceValues = [
   'leagues',
   'players',
   'stat_categories',
   'position_types',
   'game_weeks',
] as const;

export const leagueSubResourceValues = [
   'settings',
   'standings',
   'scoreboard',
   'teams',
   'players',
   'transactions',
   'drafts',
] as const;

export const teamSubResourceValues = [
   'roster',
   'matchups',
   'stats',
   'standings',
] as const;

export const playerSubResourceValues = [
   'stats',
   'ownership',
   'percent_owned',
   'draft_analysis',
] as const;

export const usersGamesSubResourceValues = ['leagues', 'teams'] as const;
export const transactionSubResourceValues = ['players'] as const;

export type GameSubResourceValue = (typeof gameSubResourceValues)[number];
export type LeagueSubResourceValue =
   (typeof leagueSubResourceValues)[number];
export type TeamSubResourceValue = (typeof teamSubResourceValues)[number];
export type PlayerSubResourceValue =
   (typeof playerSubResourceValues)[number];
export type UsersGamesSubResourceValue =
   (typeof usersGamesSubResourceValues)[number];
export type TransactionSubResourceValue =
   (typeof transactionSubResourceValues)[number];

export type RuntimeWriteMethod =
   | 'create'
   | 'edit'
   | 'cancel'
   | 'updateLineup';

export type StageSpec = {
   params?: readonly string[];
   outValues?: readonly string[];
   next?: Readonly<Record<string, string>>;
   writeMethods?: readonly RuntimeWriteMethod[];
   serializeObjectBodyAsYahooXml?: boolean;
   confidence?: 'explicit' | 'composed' | 'experimental';
};

export type RuntimeStageDefinition = StageSpec;

export const gameRootParams = ['game_keys', 'out'] as const;
export const leagueRootParams = ['league_keys', 'out'] as const;
export const teamRootParams = ['team_keys', 'out'] as const;
export const playerRootParams = ['player_keys', 'out'] as const;
export const usersRootParams = ['use_login'] as const;

export const gamesCollectionParams = [
   'game_keys',
   'out',
   'is_available',
   'game_types',
   'game_codes',
   'seasons',
] as const;

export const scoreboardParams = ['week', 'date'] as const;
export const rosterCoverageParams = ['week', 'date'] as const;
export const matchupParams = ['weeks'] as const;
export const statsCoverageParams = ['type', 'week', 'date'] as const;

export const transactionCollectionParams = [
   'transaction_keys',
   'type',
   'types',
   'team_key',
   'count',
   'start',
   'out',
] as const;

export const transactionTraversalParams = [
   'transaction_keys',
   'type',
   'types',
   'team_key',
   'count',
   'start',
] as const;
