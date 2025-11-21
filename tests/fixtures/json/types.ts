export interface GameResponse {
   gameKey: number;
   gameId: number;
   name: string;
   code: string;
   type: string;
   url: string;
   season: number;
   isRegistrationOver: boolean;
   isGameOver: boolean;
   isOffseason: boolean;
   isLiveDraftLobbyActive?: boolean;
   alternateStartDeadline?: string;
    positionTypes:
}

export interface TypesClass {
   gameKey?: number;
   gameId?: number;
   name: NameClass | string;
   code?: string;
   type?: string;
   url: string;
   season?: number;
   isRegistrationOver?: boolean;
   isGameOver?: boolean;
   isOffseason?: boolean;
   isLiveDraftLobbyActive?: boolean;
   positionTypes?: TypesPositionTypes;
   statCategories?: TypesStatCategories;
   gameWeeks?: GameWeeks;
   leagueKey?: string;
   leagueId?: number;
   logoUrl?: string;
   draftStatus?: string;
   numTeams?: number;
   editKey?: string;
   weeklyDeadline?: string;
   rosterType?: string;
   leagueUpdateTimestamp?: number;
   scoringType?: string;
   leagueType?: string;
   renew?: string;
   renewed?: string;
   feloTier?: FeloTier;
   isHighscore?: string;
   matchupWeek?: number;
   irisGroupChatId?: string;
   allowAddToDlExtraPos?: boolean;
   isProLeague?: boolean;
   isCashLeague?: boolean;
   currentWeek?: number;
   startWeek?: number;
   startDate?: string;
   endWeek?: number;
   endDate?: string;
   currentDate?: string;
   isPlusLeague?: boolean;
   gameCode?: string;
   scoreboard?: Scoreboard;
   settings?: Settings;
   standings?: Standings;
   teams?: StandingsTeam[];
   players?: TypesPlayers;
   playerKey?: string;
   playerId?: number;
   editorialPlayerKey?: string;
   editorialTeamKey?: string;
   editorialTeamFullName?: string;
   editorialTeamAbbr?: string;
   editorialTeamUrl?: string;
   isKeeper?: TypesIsKeeper;
   uniformNumber?: number;
   displayPosition?: DisplayPositionElement;
   headshot?: Headshot;
   imageUrl?: string;
   isUndroppable?: boolean;
   positionType?: PositionTypeElement;
   eligiblePositions?: TypesEligiblePositions;
   eligiblePositionsToAdd?: string;
   hasPlayerNotes?: boolean;
   playerNotesLastTimestamp?: number;
   playerStats?: PlayerStats;
   playerAdvancedStats?: Stats;
   teamKey?: TeamKey;
   teamId?: number;
   teamLogos?: TeamLogos;
   waiverPriority?: number;
   faabBalance?: number;
   numberOfMoves?: number;
   numberOfTrades?: number;
   rosterAdds?: RosterAdds;
   leagueScoringType?: string;
   hasDraftGrade?: boolean;
   managers?: ManagersClass;
   matchups?: Matchup[];
   roster?: Roster;
   teamStandings?: TeamStandings;
   teamStats?: Stats;
   teamPoints?: TypesTeamPoints;
   transactions?: Transaction[];
}

export type DisplayPositionElement =
   | 'C'
   | 'LW'
   | 'RW'
   | 'D'
   | 'Util'
   | 'G'
   | 'BN'
   | 'IR'
   | 'IR+';

export interface TypesEligiblePositions {
   position: DisplayPositionElement;
}

export type FeloTier =
   | 'platinum'
   | 'diamond'
   | 'gold'
   | 'silver'
   | 'bronze';

export interface GameWeeks {
   gameWeek: GameWeek[];
}

export interface GameWeek {
   week: number;
   displayName: number;
   start: string;
   end: string;
   current: string;
}

export interface Headshot {
   url: string;
   size: Size;
}

export type Size = 'small' | 'large';

export interface TypesIsKeeper {
   status: string;
   cost: string;
}

export interface ManagersClass {
   manager: PurpleManager;
}

export interface PurpleManager {
   managerId: number;
   nickname: string;
   guid: string;
   feloScore: number;
   feloTier: FeloTier;
}

export interface Matchup {
   week: number;
   weekStart: string;
   weekEnd: string;
   status: MatchupStatus;
   isPlayoffs: boolean;
   isConsolation: boolean;
   isMatchupOfTheWeek: boolean;
   isTied?: boolean;
   winnerTeamKey?: TeamKey;
   statWinners?: StatWinners;
   teams: MatchupTeam[];
}

export interface StatWinners {
   statWinner: StatWinner[];
}

export interface StatWinner {
   statId: number;
   winnerTeamKey?: TeamKey;
   isTied?: boolean;
}

export type TeamKey = `${number}.l.${number}.t.${number}`; // e.g., '465.l.121384.t.16'

export type LeagueKey = `${number}.l.${number}`; // e.g., '465.l.121384'

export type MatchupStatus = 'postevent' | 'midevent' | 'preevent';

export interface MatchupTeam {
   teamKey: TeamKey;
   teamId: number;
   name: string;
   url: string;
   teamLogos: TeamLogos;
   waiverPriority: number;
   faabBalance: number;
   numberOfMoves: number;
   numberOfTrades: number;
   rosterAdds: RosterAdds;
   leagueScoringType: string;
   hasDraftGrade: boolean;
   managers: ManagerElement[] | ManagersClass;
   teamStats: TeamStats;
   teamPoints: TeamPoints;
   teamRemainingGames: TeamRemainingGames;
   teamLiveProjectedPoints: TeamPoints;
   teamProjectedPoints: TeamPoints;
}

export interface ManagerElement {
   managerId: number;
   nickname: string;
   guid: string;
   feloScore: number;
   feloTier: string;
   isCommissioner?: boolean;
   isComanager?: boolean;
}

export type CoverageType = 'week' | 'season' | 'date' | (string & {});
export interface RosterAdds {
   coverageType: CoverageType;
   coverageValue: number;
   value: number;
}

export interface TeamPoints {
   coverageType: CoverageType;
   week: number;
   total: number;
}

export interface TeamLogos {
   teamLogo: Headshot;
}

export interface TeamRemainingGames {
   coverageType: CoverageType;
   week: number;
   total: Total;
}

export interface Total {
   remainingGames: number;
   liveGames: number;
   completedGames: number;
}

export interface TeamStats {
   coverageType: CoverageType;
   week: number;
   stats: TeamStatsStat[];
}

export interface TeamStatsStat {
   statId: number;
   value: number;
}

export interface NameClass {
   full: string;
   first: string;
   last: string;
   asciiFirst: string;
   asciiLast: string;
}

export interface Stats {
   coverageType: CoverageType;
   season: number;
   stats: TeamStatsStat[];
}

export interface PlayerStats {
   coverageType: CoverageType;
   season: number;
   stats: PlayerStatsStat[];
}

export interface PlayerStatsStat {
   statId: number;
   value: number | string;
}

export interface TypesPlayers {
   player: PurplePlayer;
}

export interface PurplePlayer {
   playerKey: string;
   playerId: number;
   name: NameClass;
   url: string;
   editorialPlayerKey: string;
   editorialTeamKey: string;
   editorialTeamFullName: string;
   editorialTeamAbbr: string;
   editorialTeamUrl: string;
   isKeeper: PlayerIsKeeper;
   uniformNumber: number;
   displayPosition: DisplayPositionElement;
   headshot: Headshot;
   imageUrl: string;
   isUndroppable: boolean;
   positionType: PositionTypeElement;
   primaryPosition: DisplayPositionElement;
   eligiblePositions: EligiblePositions;
   eligiblePositionsToAdd: EligiblePositions;
   hasPlayerNotes: boolean;
   playerNotesLastTimestamp: number;
}

export interface EligiblePositions {
   position: DisplayPositionElement[];
}

export interface PlayerIsKeeper {
   status: string;
   cost: string;
   kept: string;
}

export type PositionTypeElement = 'P' | 'G';

export interface TypesPositionTypes {
   positionType: PositionTypeClass[];
}

export interface PositionTypeClass {
   type: PositionTypeElement;
   displayName: string;
}

export interface Roster {
   coverageType: CoverageType;
   date: string;
   isPrescoring: boolean;
   isEditable: boolean;
   players: RosterPlayer[];
   minimumGames: RosterAdds;
}

export interface RosterPlayer {
   playerKey: string;
   playerId: number;
   name: NameClass;
   url: string;
   editorialPlayerKey: string;
   editorialTeamKey: string;
   editorialTeamFullName: string;
   editorialTeamAbbr: string;
   editorialTeamUrl: string;
   isKeeper: PlayerIsKeeper;
   uniformNumber: number;
   displayPosition: DisplayPosition;
   headshot: Headshot;
   imageUrl: string;
   isUndroppable: boolean;
   positionType: PositionTypeElement;
   primaryPosition: DisplayPositionElement;
   eligiblePositions: PurpleEligiblePositions;
   eligiblePositionsToAdd: EligiblePositions | string;
   hasPlayerNotes?: boolean;
   playerNotesLastTimestamp?: number;
   selectedPosition: SelectedPosition;
   hasRecentPlayerNotes?: boolean;
   startingStatus?: StartingStatus;
   status?: string;
   statusFull?: string;
   injuryNote?: string;
   onDisabledList?: boolean;
}

export type DisplayPosition =
   | 'C'
   | 'C,LW'
   | 'C,RW'
   | 'C,LW,RW'
   | 'LW'
   | 'RW'
   | 'LW,RW'
   | 'D'
   | 'G';

export interface PurpleEligiblePositions {
   position: DisplayPositionElement[] | DisplayPositionElement;
}

export interface SelectedPosition {
   coverageType: CoverageType;
   date: string;
   position: DisplayPositionElement;
   isFlex: boolean;
}

export interface StartingStatus {
   coverageType: CoverageType;
   date: string;
   isStarting: boolean;
}

export interface Scoreboard {
   week: number;
   matchups: Matchup[];
}

export type ScoringType = 'headpoint' | (string & {});

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
   waiverType: string;
   waiverRule: string;
   usesFaab: boolean;
   draftTime: number;
   draftPickTime: number;
   postDraftPlayers: string;
   maxTeams: number;
   waiverTime: boolean;
   tradeEndDate: string;
   tradeRatifyType: TradeRatifyTypeEnum;
   tradeRejectTime: boolean;
   playerPool: string;
   cantCutList: string;
   draftTogether: boolean;
   isPubliclyViewable: boolean;
   sendbirdChannelUrl: string;
   rosterPositions: RosterPositions;
   statCategories: SettingsStatCategories;
   statModifiers: StatModifiers;
   maxWeeklyAdds: number;
   usesMedianScore: string;
   leaguePremiumFeatures: string;
   minGamesPlayed: string;
   weekHasEnoughQualifyingDays: { [key: string]: number };
}

export interface RosterPositions {
   rosterPosition: RosterPosition[];
}

export interface RosterPosition {
   position: DisplayPositionElement;
   positionType?: PositionTypeElement;
   count: number;
   isStartingPosition: boolean;
}

export interface SettingsStatCategories {
   stats: PurpleStat[];
   groups: GroupElement[];
}

export interface GroupElement {
   groupName: GroupNameEnum;
   groupDisplayName: string;
   groupAbbr: string;
}

export type GroupNameEnum = 'offense' | 'goaltending';

export interface PurpleStat {
   statId: number;
   enabled: boolean;
   name: string;
   displayName: string;
   group: GroupNameEnum;
   abbr: string;
   sortOrder: boolean;
   positionType: PositionTypeElement;
   statPositionTypes: StatPositionTypesClass;
}

export interface StatPositionTypesClass {
   statPositionType: StatPositionType;
}

export interface StatPositionType {
   positionType: PositionTypeElement;
}

export interface StatModifiers {
   stats: TeamStatsStat[];
}

export type TradeRatifyTypeEnum = 'add' | 'drop' | 'add/drop' | 'commish';

export interface Standings {
   teams: StandingsTeam[];
}

export interface StandingsTeam {
   teamKey: TeamKey;
   teamId: number;
   name: string;
   url: string;
   teamLogos: TeamLogos;
   waiverPriority: number;
   faabBalance: number;
   numberOfMoves: number;
   numberOfTrades: number;
   rosterAdds: RosterAdds;
   leagueScoringType: ScoringType;
   hasDraftGrade: boolean;
   managers: ManagerElement[] | ManagersClass;
   teamStats?: Stats;
   teamPoints?: TypesTeamPoints;
   teamStandings?: TeamStandings;
}

export interface TypesTeamPoints {
   coverageType: CoverageType;
   season: number;
   total: number;
   stats: TeamPointsStat[];
}

export interface TeamPointsStat {
   statId: number;
   value: string;
}

export interface TeamStandings {
   rank: number;
   playoffSeed?: number;
   outcomeTotals: OutcomeTotals;
   pointsFor: number;
   pointsAgainst: number;
}

export interface OutcomeTotals {
   wins: number;
   losses: number;
   ties: number;
   percentage: number;
}

export interface TypesStatCategories {
   stats: FluffyStat[];
}

export interface FluffyStat {
   statId: number;
   name: string;
   displayName: string;
   sortOrder: boolean;
   positionTypes: StatPositionTypes;
   isCompositeStat?: boolean;
   baseStats?: BaseStats;
}

export interface BaseStats {
   baseStat: BaseStat[];
}

export interface BaseStat {
   statId: number;
}

export interface StatPositionTypes {
   positionType: PositionTypeElement[] | PositionTypeElement;
}

export interface Transaction {
   transactionKey: string;
   transactionId: number;
   type: TradeRatifyTypeEnum;
   status: string;
   timestamp: number;
   players?: FluffyPlayer[] | PlayersPlayers;
   faabBid?: number;
}

export interface FluffyPlayer {
   playerKey: string;
   playerId: number;
   name: NameClass;
   editorialTeamAbbr: string;
   displayPosition: DisplayPosition;
   positionType: PositionTypeElement;
   transactionData: TransactionData;
}

export interface TransactionData {
   type: TradeRatifyTypeEnum;
   sourceType: DestinationTypeEnum;
   destinationType: DestinationTypeEnum;
   destinationTeamKey?: TeamKey;
   destinationTeamName?: string;
   sourceTeamKey?: TeamKey;
   sourceTeamName?: string;
}

export type DestinationTypeEnum = 'team' | 'waivers' | 'freeagents';

export interface PlayersPlayers {
   player: FluffyPlayer;
}
