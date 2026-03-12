export interface LeagueTypes {
   leagueKey: string;
   leagueId: number;
   name: string;
   url: string;
   logoUrl: string;
   draftStatus: 'postdraft';
   numTeams: number;
   editKey: string;
   weeklyDeadline: 'intraday';
   rosterType: 'date';
   leagueUpdateTimestamp: number;
   scoringType: ScoringType;
   leagueType: 'private';
   renew: string;
   renewed: string;
   feloTier: FeloTier;
   isHighscore: string;
   matchupWeek: number;
   irisGroupChatId: string;
   allowAddToDlExtraPos: boolean;
   isProLeague: boolean;
   isCashLeague: boolean;
   currentWeek: number;
   startWeek: number;
   startDate: string;
   endWeek: number;
   endDate: string;
   currentDate: string;
   isPlusLeague: boolean;
   gameCode: 'nhl';
   season: number;
   scoreboard?: Scoreboard;
   settings?: Settings;
   standings?: Standings;
   teams?: MatchupTeam[];
   transactions?: Transaction[];
}

export type FeloTier =
   | 'gold'
   | 'platinum'
   | 'diamond'
   | 'silver'
   | 'bronze';

export interface Scoreboard {
   week: number;
   matchups: Matchup[];
}

export interface Matchup {
   week: number;
   weekStart: string;
   weekEnd: string;
   status: 'midevent';
   isPlayoffs: boolean;
   isConsolation: boolean;
   isMatchupOfTheWeek: boolean;
   statWinners: StatWinner[];
   teams: MatchupTeam[];
}

export interface StatWinner {
   statId: number;
   isTied: boolean;
}

export interface MatchupTeam {
   teamKey: string;
   teamId: number;
   name: string;
   url: string;
   teamLogos: TeamLogo[];
   previousSeasonTeamRank?: number;
   waiverPriority: number;
   numberOfMoves: number;
   numberOfTrades: number;
   rosterAdds: RosterAdds;
   leagueScoringType: ScoringType;
   hasDraftGrade: boolean;
   managers: Manager[];
   teamStats?: PurpleTeamStats;
   teamPoints?: TeamPoints;
   teamRemainingGames?: TeamRemainingGames;
   isOwnedByCurrentLogin?: number;
   faabBalance?: number;
   teamLiveProjectedPoints?: TeamPoints;
   teamProjectedPoints?: TeamPoints;
}

export type ScoringType = 'head' | 'headpoint';

export interface Manager {
   managerId: number;
   nickname: string;
   guid: string;
   isCommissioner?: boolean;
   email?: string;
   imageUrl: string;
   feloScore: number;
   feloTier: FeloTier;
   isCurrentLogin?: number;
   isComanager?: boolean;
}

export interface RosterAdds {
   coverageType: 'week';
   coverageValue: number;
   value: number;
}

export interface TeamPoints {
   coverageType: 'week';
   week: number;
   total: number;
}

export interface TeamLogo {
   size: 'large';
   url: string;
}

export interface TeamRemainingGames {
   coverageType: 'week';
   week: number;
   total: Total;
}

export interface Total {
   remainingGames: number;
   liveGames: number;
   completedGames: number;
}

export interface PurpleTeamStats {
   coverageType: 'week';
   week: number;
   stats: PurpleStat[];
}

export interface PurpleStat {
   statId: number;
   value: number | string;
}

export interface Settings {
   draftType: string;
   isAuctionDraft: boolean;
   scoringType: ScoringType;
   isHighscore: string;
   invitePermission: string;
   persistentUrl: string;
   usesPlayoff: boolean;
   hasPlayoffConsolationGames: boolean;
   playoffStartWeek: number;
   usesPlayoffReseeding: boolean;
   usesLockEliminatedTeams: boolean;
   numPlayoffTeams: number;
   numPlayoffConsolationTeams: number;
   hasMultiweekChampionship: boolean;
   usesRosterImport?: number;
   rosterImportDeadline?: string;
   waiverType: string;
   waiverRule: string;
   usesFaab: boolean;
   draftTime: number;
   draftPickTime: number;
   postDraftPlayers: string;
   maxTeams: number;
   waiverTime: boolean;
   tradeEndDate: string;
   tradeRatifyType: Type;
   tradeRejectTime: boolean;
   playerPool: string;
   cantCutList: string;
   draftTogether: boolean;
   canTradeDraftPicks?: number;
   sendbirdChannelUrl: string;
   rosterPositions: RosterPosition[];
   statCategories: StatCategories;
   maxWeeklyAdds: number;
   usesMedianScore: string;
   leaguePremiumFeatures: string;
   minGamesPlayed: number | string;
   weekHasEnoughQualifyingDays: { [key: string]: boolean };
   isPubliclyViewable?: boolean;
   statModifiers?: StatModifiers;
}

export interface RosterPosition {
   position: string;
   positionType?: PositionType;
   count: number;
   isStartingPosition: boolean;
}

export type PositionType = 'P' | 'G';

export interface StatCategories {
   stats: StatCategoriesStat[];
   groups: GroupElement[];
}

export interface GroupElement {
   groupName: GroupNameEnum;
   groupDisplayName: string;
   groupAbbr: string;
}

export type GroupNameEnum = 'offense' | 'goaltending';

export interface StatCategoriesStat {
   statId: number;
   enabled: boolean;
   name: string;
   displayName: string;
   group: GroupNameEnum;
   abbr: string;
   sortOrder: boolean;
   positionType: PositionType;
   statPositionTypes: StatPositionType[];
   isOnlyDisplayStat?: number;
}

export interface StatPositionType {
   positionType: PositionType;
   isOnlyDisplayStat?: number;
}

export interface StatModifiers {
   stats: StatModifiersStat[];
}

export interface StatModifiersStat {
   statId: number;
   value: number;
}

export type Type = 'drop' | 'add' | 'trade' | 'add/drop' | 'commish';

export interface Standings {
   teams: StandingsTeam[];
}

export interface StandingsTeam {
   teamKey: string;
   teamId: number;
   name: string;
   url: string;
   teamLogos: TeamLogo[];
   previousSeasonTeamRank?: number;
   waiverPriority: number;
   numberOfMoves: number;
   numberOfTrades: number;
   rosterAdds: RosterAdds;
   leagueScoringType: ScoringType;
   hasDraftGrade: boolean;
   managers: Manager[];
   teamStats: FluffyTeamStats;
   teamPoints: PurpleTeamPoints;
   teamStandings: TeamStandings;
   isOwnedByCurrentLogin?: number;
   faabBalance?: number;
}

export interface PurpleTeamPoints {
   coverageType: 'season';
   season: number;
   total: number;
   stats?: TeamPointsStat[];
}

export interface TeamPointsStat {
   statId: number;
   value: string;
}

export interface TeamStandings {
   rank: number;
   playoffSeed?: number;
   outcomeTotals: OutcomeTotals;
   pointsFor?: number;
   pointsAgainst?: number;
}

export interface OutcomeTotals {
   wins: number;
   losses: number;
   ties: number;
   percentage: number;
}

export interface FluffyTeamStats {
   coverageType: 'season';
   season: number;
   stats: StatModifiersStat[];
}

export interface Transaction {
   transactionKey: string;
   transactionId: number;
   type: Type;
   status: TransactionStatus;
   timestamp: number;
   players?: Player[];
   traderTeamKey?: string;
   traderTeamName?: string;
   tradeeTeamKey?: string;
   tradeeTeamName?: string;
   picks?: Picks;
   faabBid?: number;
}

export interface Picks {
   pick: Pick[];
}

export interface Pick {
   sourceTeamKey: string;
   sourceTeamName: string;
   destinationTeamKey: string;
   destinationTeamName: string;
   originalTeamKey: string;
   originalTeamName: string;
   round: number;
}

export interface Player {
   playerKey: string;
   playerId: number;
   name: NameClass;
   editorialTeamAbbr: EditorialTeamAbbr;
   displayPosition: DisplayPosition;
   positionType: PositionType;
   transactionData: TransactionData;
}

export type DisplayPosition =
   | 'LW,RW'
   | 'C,RW'
   | 'C,LW'
   | 'C'
   | 'RW'
   | 'G'
   | 'D'
   | 'C,LW,RW'
   | 'LW';

export type EditorialTeamAbbr =
   | 'CHI'
   | 'NJ'
   | 'DET'
   | 'PHI'
   | 'SEA'
   | 'FLA'
   | 'VAN'
   | 'NYI'
   | 'CAR'
   | 'BOS'
   | 'NSH'
   | 'STL'
   | 'VGK'
   | 'CBJ'
   | 'COL'
   | 'WPG'
   | 'DAL'
   | 'UTA'
   | 'MIN'
   | 'BUF'
   | 'TB'
   | 'MTL'
   | 'PIT'
   | 'TOR'
   | 'ANA'
   | 'SJ'
   | 'EDM'
   | 'NYR'
   | 'WSH'
   | 'LA'
   | 'CGY'
   | 'OTT';

export interface NameClass {
   full: string;
   first: string;
   last: string;
   asciiFirst: string;
   asciiLast: string;
}

export interface TransactionData {
   type: Type;
   sourceType: DestinationTypeEnum;
   sourceTeamKey?: string;
   sourceTeamName?: string;
   destinationType: DestinationTypeEnum;
   destinationTeamKey?: string;
   destinationTeamName?: string;
}

export type DestinationTypeEnum = 'waivers' | 'team' | 'freeagents';

export type TransactionStatus = 'successful' | 'vetoed';
