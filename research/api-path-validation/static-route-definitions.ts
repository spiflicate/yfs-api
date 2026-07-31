export type SportCode = 'nfl' | 'mlb' | 'nba' | 'nhl';
export type RouteMode = 'public' | 'private';
export type RouteSet = RouteMode | 'invalid';
export type RouteConfidence = 'explicit' | 'composed' | 'provisional';
export type RouteProvenance =
   | 'documented-claim'
   | 'documented-runtime-discrepancy'
   | 'observed-only';
export type FailureKind =
   | 'auth-or-scope'
   | 'empty-data'
   | 'fixture-invalid'
   | 'parser-failure'
   | 'rate-limited-or-transient'
   | 'response-mismatch'
   | 'unknown-failure'
   | 'unsupported-route';

export type ExpectedValueType =
   | 'array'
   | 'boolean'
   | 'number'
   | 'object'
   | 'string';
export type KeyFact =
   | 'gameKey'
   | 'leagueKey'
   | 'playerKey'
   | 'teamKey'
   | 'transactionKey';
export type KeyFixture =
   | 'GAME_KEY'
   | 'LEAGUE_KEY'
   | 'LEAGUE_KEYS'
   | 'PLAYER_KEY'
   | 'PLAYER_KEYS'
   | 'TEAM_KEY'
   | 'TEAM_KEYS'
   | 'TRANSACTION_KEY'
   | 'TRANSACTION_KEYS';

export interface RouteExpectation {
   keyFixtures?: Partial<Record<KeyFact, KeyFixture>>;
   nonEmptyArrays?: readonly string[];
   requiredPaths?: readonly string[];
   typedPaths?: Readonly<Record<string, ExpectedValueType>>;
}

export interface RouteDefinition {
   allowEmpty?: boolean;
   confidence: RouteConfidence;
   description: string;
   expectations?: RouteExpectation;
   expectedFailureKinds?: readonly FailureKind[];
   id: string;
   label: string;
   mode: RouteMode;
   pathTemplate: string;
   provenance: RouteProvenance;
   sports?: readonly SportCode[];
}

interface RouteOptions {
   allowEmpty?: boolean;
   confidence?: RouteConfidence;
   expectations?: RouteExpectation;
   expectedFailureKinds?: readonly FailureKind[];
   provenance?: RouteProvenance;
   sports?: readonly SportCode[];
}

function route(
   id: string,
   label: string,
   mode: RouteMode,
   pathTemplate: string,
   description: string,
   options: RouteOptions = {},
): RouteDefinition {
   return {
      id,
      label,
      mode,
      pathTemplate,
      description,
      confidence: options.confidence ?? 'explicit',
      provenance: options.provenance ?? 'documented-claim',
      ...options,
   };
}

const gameExpectation: RouteExpectation = {
   requiredPaths: ['game.gameKey', 'game.code', 'game.season'],
   typedPaths: {
      'game.code': 'string',
      'game.gameKey': 'string',
      'game.season': 'number',
   },
};

function gameChildExpectation(
   path: string,
   type: ExpectedValueType,
): RouteExpectation {
   return {
      ...gameExpectation,
      requiredPaths: [...(gameExpectation.requiredPaths ?? []), path],
      typedPaths: { ...gameExpectation.typedPaths, [path]: type },
   };
}

const leagueExpectation: RouteExpectation = {
   keyFixtures: { leagueKey: 'LEAGUE_KEY' },
   requiredPaths: ['league.leagueKey'],
   typedPaths: { 'league.leagueKey': 'string' },
};

const usersExpectation: RouteExpectation = {
   requiredPaths: ['users'],
   typedPaths: { users: 'array' },
};

const teamExpectation: RouteExpectation = {
   keyFixtures: { teamKey: 'TEAM_KEY' },
   requiredPaths: ['team.teamKey'],
   typedPaths: { 'team.teamKey': 'string' },
};

function teamChildExpectation(
   path: string,
   type?: ExpectedValueType,
): RouteExpectation {
   return {
      ...teamExpectation,
      requiredPaths: [...(teamExpectation.requiredPaths ?? []), path],
      typedPaths: {
         ...teamExpectation.typedPaths,
         ...(type ? { [path]: type } : {}),
      },
   };
}

const playerExpectation: RouteExpectation = {
   keyFixtures: { playerKey: 'PLAYER_KEY' },
   requiredPaths: ['player.playerKey'],
   typedPaths: { 'player.playerKey': 'string' },
};

function playerChildExpectation(
   path: string,
   type?: ExpectedValueType,
): RouteExpectation {
   return {
      ...playerExpectation,
      requiredPaths: [...(playerExpectation.requiredPaths ?? []), path],
      typedPaths: {
         ...playerExpectation.typedPaths,
         ...(type ? { [path]: type } : {}),
      },
   };
}

function leagueChildExpectation(
   path: string,
   type: ExpectedValueType,
): RouteExpectation {
   return {
      ...leagueExpectation,
      requiredPaths: [...(leagueExpectation.requiredPaths ?? []), path],
      typedPaths: { ...leagueExpectation.typedPaths, [path]: type },
   };
}

function collectionExpectation(path: string): RouteExpectation {
   return {
      requiredPaths: [path],
      typedPaths: { [path]: 'array' },
   };
}

const publicRoutes: RouteDefinition[] = [
   route(
      'game',
      'Game metadata by sport code',
      'public',
      '/game/{{SPORT_CODE}}',
      'Current game metadata for each sport.',
      { expectations: gameExpectation },
   ),
   route(
      'game-metadata',
      'Game metadata child',
      'public',
      '/game/{{SPORT_CODE}}/metadata',
      'Explicit metadata child for each sport.',
      { expectations: gameExpectation },
   ),
   route(
      'game-players',
      'Game player search',
      'public',
      '/game/{{SPORT_CODE}}/players;search={{PLAYER_SEARCH}};count={{COUNT_SMALL}}',
      'Player collection with a sport-specific search fixture.',
      {
         allowEmpty: true,
         expectations: gameChildExpectation('game.players', 'array'),
         provenance: 'observed-only',
      },
   ),
   route(
      'game-players-by-key',
      'Game players by key',
      'public',
      '/game/{{SPORT_CODE}}/players;player_keys={{PLAYER_KEYS}}',
      'Documented keyed player collection beneath a game.',
      {
         expectations: {
            ...gameChildExpectation('game.players', 'array'),
            keyFixtures: { playerKey: 'PLAYER_KEYS' },
         },
      },
   ),
   route(
      'game-dates',
      'Game dates',
      'public',
      '/game/{{SPORT_CODE}}/dates',
      'Official key dates subresource added in the current Yahoo docs.',
      { expectations: gameChildExpectation('game.dates', 'object') },
   ),
   route(
      'game-weeks',
      'Game weeks',
      'public',
      '/game/{{SPORT_CODE}}/game_weeks',
      'Week boundaries exposed by each game.',
      {
         allowEmpty: true,
         expectations: gameChildExpectation('game.gameWeeks', 'array'),
      },
   ),
   route(
      'game-stat-categories',
      'Game stat categories',
      'public',
      '/game/{{SPORT_CODE}}/stat_categories',
      'Official stat category definitions.',
      {
         expectations: gameChildExpectation(
            'game.statCategories',
            'object',
         ),
      },
   ),
   route(
      'game-position-types',
      'Game position types',
      'public',
      '/game/{{SPORT_CODE}}/position_types',
      'Official player position type definitions.',
      {
         expectations: gameChildExpectation('game.positionTypes', 'array'),
      },
   ),
   route(
      'game-roster-positions',
      'Game roster positions',
      'public',
      '/game/{{SPORT_CODE}}/roster_positions',
      'Official fantasy roster position definitions.',
      {
         expectations: gameChildExpectation(
            'game.rosterPositions',
            'array',
         ),
      },
   ),
   route(
      'game-out',
      'Game out expansion',
      'public',
      '/game/{{SPORT_CODE}};out=stat_categories,position_types,game_weeks',
      'One-level game expansion used by the SDK request schema.',
      {
         expectations: {
            ...gameExpectation,
            requiredPaths: [
               ...(gameExpectation.requiredPaths ?? []),
               'game.statCategories',
               'game.positionTypes',
               'game.gameWeeks',
            ],
         },
      },
   ),
   route(
      'games-by-code',
      'Games collection by sport code',
      'public',
      '/games;game_codes={{SPORT_CODE}}',
      'All available seasons for a sport code.',
      {
         expectations: {
            requiredPaths: ['games'],
            typedPaths: { games: 'array' },
         },
      },
   ),
   route(
      'games-by-code-season',
      'Games collection by sport and season',
      'public',
      '/games;game_codes={{SPORT_CODE}};seasons={{SEASON}}',
      'Specific season when a profile supplies a discovered or fixed season.',
      {
         expectations: {
            requiredPaths: ['games'],
            typedPaths: { games: 'array' },
         },
      },
   ),
   route(
      'games-by-key',
      'Games collection by key',
      'public',
      '/games;game_keys={{GAME_KEY}}',
      'Documented root Games collection key filter.',
      {
         expectations: {
            ...collectionExpectation('games'),
            keyFixtures: { gameKey: 'GAME_KEY' },
         },
      },
   ),
   route(
      'games-available-by-code',
      'Available games by sport code',
      'public',
      '/games;game_codes={{SPORT_CODE}};is_available=1',
      'Documented Games availability filter combined with sport code.',
      {
         allowEmpty: true,
         expectations: collectionExpectation('games'),
      },
   ),
   route(
      'players-by-key',
      'Players collection by key',
      'public',
      '/players;player_keys={{PLAYER_KEYS}}',
      'Documented root Players collection key filter.',
      {
         expectations: {
            ...collectionExpectation('players'),
            keyFixtures: { playerKey: 'PLAYER_KEYS' },
         },
      },
   ),
   route(
      'game-league-by-key',
      'Game league by key',
      'public',
      '/game/{{SPORT_CODE}}/leagues;league_keys={{LEAGUE_KEY}}',
      'Public league fixture scoped to the matching sport.',
      {
         expectations: {
            ...gameChildExpectation('game.leagues', 'array'),
            keyFixtures: { leagueKey: 'LEAGUE_KEY' },
         },
      },
   ),
   route(
      'game-league-teams',
      'Game league teams',
      'public',
      '/game/{{SPORT_CODE}}/leagues;league_keys={{LEAGUE_KEY}}/teams',
      'Validated composed public league chain.',
      {
         confidence: 'composed',
         expectations: {
            ...gameChildExpectation('game.leagues.0.teams', 'array'),
            keyFixtures: { leagueKey: 'LEAGUE_KEY' },
         },
      },
   ),
   route(
      'game-league-players',
      'Game league players',
      'public',
      '/game/{{SPORT_CODE}}/leagues;league_keys={{LEAGUE_KEY}}/players;search={{PLAYER_SEARCH}};count={{COUNT_SMALL}}',
      'Validated composed league-context player chain.',
      {
         confidence: 'composed',
         allowEmpty: true,
         expectations: {
            ...gameChildExpectation('game.leagues.0.players', 'array'),
            keyFixtures: { leagueKey: 'LEAGUE_KEY' },
         },
      },
   ),
   route(
      'league',
      'Public league metadata',
      'public',
      '/league/{{LEAGUE_KEY}}',
      'Public league metadata fixture.',
      { expectations: leagueExpectation },
   ),
   route(
      'leagues-by-key',
      'Leagues collection by key',
      'public',
      '/leagues;league_keys={{LEAGUE_KEYS}}',
      'Documented root Leagues collection key filter.',
      {
         expectations: {
            ...collectionExpectation('leagues'),
            keyFixtures: { leagueKey: 'LEAGUE_KEYS' },
         },
      },
   ),
   route(
      'league-settings',
      'Public league settings',
      'public',
      '/league/{{LEAGUE_KEY}}/settings',
      'League rules and scoring configuration.',
      {
         expectations: leagueChildExpectation('league.settings', 'object'),
      },
   ),
   route(
      'league-standings',
      'Public league standings',
      'public',
      '/league/{{LEAGUE_KEY}}/standings',
      'League standings.',
      {
         expectations: leagueChildExpectation('league.standings', 'object'),
      },
   ),
   route(
      'league-scoreboard',
      'Public league scoreboard',
      'public',
      '/league/{{LEAGUE_KEY}}/scoreboard;week={{WEEK}}',
      'League matchup week.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.scoreboard',
            'object',
         ),
      },
   ),
   route(
      'league-scoreboard-current',
      'Public league current scoreboard',
      'public',
      '/league/{{LEAGUE_KEY}}/scoreboard',
      'Documented scoreboard form that defaults to the current week.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.scoreboard',
            'object',
         ),
      },
   ),
   route(
      'league-teams',
      'Public league teams',
      'public',
      '/league/{{LEAGUE_KEY}}/teams',
      'Documented Teams collection beneath a league.',
      {
         expectations: leagueChildExpectation('league.teams', 'array'),
      },
   ),
   route(
      'leagues-teams',
      'Leagues collection teams',
      'public',
      '/leagues;league_keys={{LEAGUE_KEYS}}/teams',
      'Documented Teams collection beneath keyed leagues.',
      {
         expectations: {
            ...collectionExpectation('leagues.0.teams'),
            keyFixtures: { leagueKey: 'LEAGUE_KEYS' },
         },
      },
   ),
   route(
      'teams-by-key',
      'Teams collection by key',
      'public',
      '/teams;team_keys={{TEAM_KEYS}}',
      'Documented root Teams collection key filter.',
      {
         expectations: {
            ...collectionExpectation('teams'),
            keyFixtures: { teamKey: 'TEAM_KEYS' },
         },
      },
   ),
   route(
      'team-players',
      'Public team players',
      'public',
      '/team/{{TEAM_KEY}}/players',
      'Documented Players collection directly beneath a team.',
      {
         expectations: {
            ...teamChildExpectation('team.players', 'array'),
            keyFixtures: { teamKey: 'TEAM_KEY' },
         },
      },
   ),
   route(
      'league-draftresults',
      'Public league draft results',
      'public',
      '/league/{{LEAGUE_KEY}}/draftresults',
      'Official route added by the documentation audit.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.draftResults',
            'object',
         ),
      },
   ),
   route(
      'league-transactions',
      'Public league transactions',
      'public',
      '/league/{{LEAGUE_KEY}}/transactions;count={{COUNT_SMALL}}',
      'Completed public league transactions.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.transactions',
            'array',
         ),
      },
   ),
];

const privateRoutes: RouteDefinition[] = [
   route(
      'user',
      'Authorized user metadata',
      'private',
      '/users;use_login=1',
      'Documented logged-in Users collection entry point.',
      { expectations: usersExpectation },
   ),
   route(
      'user-teams',
      'Authorized user teams directly',
      'private',
      '/users;use_login=1/teams',
      'Documented direct logged-in user Teams collection.',
      { allowEmpty: true, expectations: usersExpectation },
   ),
   route(
      'user-games',
      'Authorized user games',
      'private',
      '/users;use_login=1/games;game_keys={{SPORT_CODE}}',
      'Whether the authorized account participates in the sport.',
      { allowEmpty: true, expectations: usersExpectation },
   ),
   route(
      'user-game-leagues',
      'Authorized user leagues',
      'private',
      '/users;use_login=1/games;game_keys={{SPORT_CODE}}/leagues',
      'League discovery through the required games segment.',
      { allowEmpty: true, expectations: usersExpectation },
   ),
   route(
      'user-game-teams',
      'Authorized user teams',
      'private',
      '/users;use_login=1/games;game_keys={{SPORT_CODE}}/teams',
      'Team discovery for a sport.',
      { allowEmpty: true, expectations: usersExpectation },
   ),
   route(
      'private-league',
      'Private league metadata',
      'private',
      '/league/{{LEAGUE_KEY}}',
      'Private league fixture.',
      { expectations: leagueExpectation },
   ),
   route(
      'private-league-settings',
      'Private league settings',
      'private',
      '/league/{{LEAGUE_KEY}}/settings',
      'Private league rules.',
      {
         expectations: leagueChildExpectation('league.settings', 'object'),
      },
   ),
   route(
      'private-league-standings',
      'Private league standings',
      'private',
      '/league/{{LEAGUE_KEY}}/standings',
      'Private league standings.',
      {
         expectations: leagueChildExpectation('league.standings', 'object'),
      },
   ),
   route(
      'private-league-scoreboard',
      'Private league scoreboard',
      'private',
      '/league/{{LEAGUE_KEY}}/scoreboard;week={{WEEK}}',
      'Private league matchup week.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.scoreboard',
            'object',
         ),
      },
   ),
   route(
      'private-league-players',
      'Private league player filters',
      'private',
      '/league/{{LEAGUE_KEY}}/players;status=FA;position={{PLAYER_POSITION}};count={{COUNT_SMALL}}',
      'Sport-specific availability and position filter.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation('league.players', 'array'),
      },
   ),
   route(
      'private-league-draftresults',
      'Private league draft results',
      'private',
      '/league/{{LEAGUE_KEY}}/draftresults',
      'Official draft results route.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.draftResults',
            'object',
         ),
      },
   ),
   route(
      'private-league-transactions',
      'Private league transactions',
      'private',
      '/league/{{LEAGUE_KEY}}/transactions;count={{COUNT_SMALL}}',
      'Completed private league transactions.',
      {
         allowEmpty: true,
         expectations: leagueChildExpectation(
            'league.transactions',
            'array',
         ),
      },
   ),
   route(
      'private-team',
      'Private team metadata',
      'private',
      '/team/{{TEAM_KEY}}',
      'Private team fixture.',
      { expectations: teamExpectation },
   ),
   route(
      'private-team-standings',
      'Private team standings',
      'private',
      '/team/{{TEAM_KEY}}/standings',
      'Official team standings route added by the audit.',
      {
         expectations: teamChildExpectation('team.teamStandings', 'object'),
      },
   ),
   route(
      'private-team-draftresults',
      'Private team draft results',
      'private',
      '/team/{{TEAM_KEY}}/draftresults',
      'Official team draft results route added by the audit.',
      {
         allowEmpty: true,
         expectations: teamChildExpectation('team.draftResults', 'object'),
      },
   ),
   route(
      'private-team-matchups',
      'Private team matchups',
      'private',
      '/team/{{TEAM_KEY}}/matchups;weeks={{WEEK}},{{ALT_WEEK}}',
      'Team matchup weeks.',
      {
         allowEmpty: true,
         expectations: teamChildExpectation('team.matchups', 'array'),
      },
   ),
   route(
      'private-team-stats-season',
      'Private team season stats',
      'private',
      '/team/{{TEAM_KEY}}/stats;type=season',
      'Season stats for every sport.',
      {
         expectations: teamChildExpectation('team.teamStats', 'object'),
      },
   ),
   route(
      'private-team-roster-week',
      'Private NFL roster by week',
      'private',
      '/team/{{TEAM_KEY}}/roster;week={{WEEK}}/players',
      'NFL weekly roster coverage.',
      {
         sports: ['nfl'],
         expectations: teamChildExpectation('team.roster.players', 'array'),
      },
   ),
   route(
      'private-team-stats-week',
      'Private NFL team stats by week',
      'private',
      '/team/{{TEAM_KEY}}/stats;type=week;week={{WEEK}}',
      'NFL weekly stats coverage.',
      {
         sports: ['nfl'],
         allowEmpty: true,
         expectations: teamChildExpectation('team.teamStats', 'object'),
      },
   ),
   route(
      'private-team-roster-date',
      'Private daily roster by date',
      'private',
      '/team/{{TEAM_KEY}}/roster;date={{DATE}}/players',
      'MLB, NBA, and NHL daily roster coverage.',
      {
         sports: ['mlb', 'nba', 'nhl'],
         expectations: teamChildExpectation('team.roster.players', 'array'),
      },
   ),
   route(
      'private-team-stats-date',
      'Private daily team stats by date',
      'private',
      '/team/{{TEAM_KEY}}/stats;type=date;date={{DATE}}',
      'MLB, NBA, and NHL daily stats coverage.',
      {
         sports: ['mlb', 'nba', 'nhl'],
         allowEmpty: true,
         expectations: teamChildExpectation('team.teamStats', 'object'),
      },
   ),
   route(
      'private-player',
      'Private player metadata',
      'private',
      '/player/{{PLAYER_KEY}}',
      'Player fixture for the sport.',
      { expectations: playerExpectation },
   ),
   route(
      'private-player-stats',
      'Private player season stats',
      'private',
      '/player/{{PLAYER_KEY}}/stats;type=season',
      'Player season stats.',
      {
         expectations: playerChildExpectation(
            'player.playerStats',
            'object',
         ),
      },
   ),
   route(
      'private-player-percent-owned',
      'Private player percent owned',
      'private',
      '/player/{{PLAYER_KEY}}/percent_owned',
      'Game-wide ownership prevalence.',
      {
         expectations: playerChildExpectation(
            'player.percentOwned',
            'object',
         ),
      },
   ),
   route(
      'private-player-draft-analysis',
      'Private player draft analysis',
      'private',
      '/player/{{PLAYER_KEY}}/draft_analysis',
      'Official draft analysis route added by the audit.',
      {
         allowEmpty: true,
         expectations: playerChildExpectation(
            'player.draftAnalysis',
            'object',
         ),
      },
   ),
   route(
      'private-player-ownership',
      'League-context player ownership',
      'private',
      '/league/{{LEAGUE_KEY}}/players;player_keys={{PLAYER_KEY}}/ownership',
      'Ownership state in a league.',
      {
         expectations: leagueChildExpectation('league.players', 'array'),
      },
   ),
   route(
      'private-transactions-by-key',
      'Transactions collection by key',
      'private',
      '/transactions;transaction_keys={{TRANSACTION_KEYS}}',
      'Official top-level keyed transaction collection.',
      {
         allowEmpty: true,
         expectations: {
            keyFixtures: { transactionKey: 'TRANSACTION_KEYS' },
            requiredPaths: ['transactions'],
            typedPaths: { transactions: 'array' },
         },
      },
   ),
   route(
      'private-transaction',
      'Transaction metadata',
      'private',
      '/transaction/{{TRANSACTION_KEY}}',
      'Official direct transaction route.',
      {
         expectations: {
            keyFixtures: { transactionKey: 'TRANSACTION_KEY' },
            requiredPaths: ['transaction.transactionKey'],
            typedPaths: { 'transaction.transactionKey': 'string' },
         },
      },
   ),
];

const invalidRoutes: RouteDefinition[] = [
   route(
      'invalid-user-leagues',
      'Unsupported direct user leagues',
      'private',
      '/users;use_login=1/leagues',
      'Known structural rejection retained for regression evidence.',
      {
         confidence: 'provisional',
         expectedFailureKinds: ['unsupported-route'],
         provenance: 'observed-only',
      },
   ),
   route(
      'invalid-games-out-leagues',
      'Provisional games leagues expansion',
      'public',
      '/games;game_codes={{SPORT_CODE}};out=leagues,players',
      'Official generic composition that has failed in prior probes.',
      {
         confidence: 'provisional',
         expectedFailureKinds: ['fixture-invalid', 'unsupported-route'],
         provenance: 'documented-runtime-discrepancy',
      },
   ),
];

export const STATIC_ROUTE_SETS: Record<RouteSet, RouteDefinition[]> = {
   public: publicRoutes,
   private: privateRoutes,
   invalid: invalidRoutes,
};

export const ALL_ROUTE_DEFINITIONS = [
   ...publicRoutes,
   ...privateRoutes,
   ...invalidRoutes,
];
