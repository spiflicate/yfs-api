export interface PlyrType {
    guid:   string;
    games?: Game[];
}

export interface Game {
    gameKey:                 string;
    gameId:                  number;
    name:                    NameEnum;
    code:                    Code;
    type:                    "full";
    url:                     string;
    season:                  number;
    isRegistrationOver:      boolean;
    isGameOver:              boolean;
    isOffseason:             boolean;
    isLiveDraftLobbyActive?: boolean;
    teams?:                  GameTeam[];
}

export type Code = "nhl" | "nba";

export type NameEnum = "Hockey" | "Basketball";

export interface GameTeam {
    teamKey:                 string;
    teamId:                  number;
    name:                    string;
    isOwnedByCurrentLogin:   number;
    url:                     string;
    teamLogos:               Headshot[];
    previousSeasonTeamRank?: number;
    divisionId?:             number;
    waiverPriority:          number;
    numberOfMoves:           number;
    numberOfTrades:          number;
    rosterAdds:              RosterAdds;
    leagueScoringType:       ScoringType;
    draftPosition?:          number;
    hasDraftGrade:           boolean;
    managers:                TeamManager[];
    "index-1":               string;
    clinchedPlayoffs?:       number;
    faabBalance?:            number;
}

export type ScoringType = "headpoint" | "head" | "headone";

export interface TeamManager {
    managerId:       number;
    nickname:        string;
    guid:            string;
    isCommissioner?: boolean;
    isCurrentLogin?: number;
    email?:          string;
    imageUrl?:       string;
    feloScore?:      number;
    feloTier?:       FeloTier;
    isComanager?:    boolean;
}

export type FeloTier = "platinum" | "bronze" | "silver" | "diamond" | "gold";

export interface RosterAdds {
    coverageType:  "week";
    coverageValue: number;
    value:         number;
}

export interface Headshot {
    size: Size;
    url:  string;
}

export type Size = "large" | "small";

export interface PlyrTypesClass {
    gameKey?:                  string;
    gameId?:                   number;
    name:                      NameClass | string;
    code?:                     string;
    type?:                     "full";
    url:                       string;
    season?:                   number;
    isRegistrationOver?:       boolean;
    isGameOver?:               boolean;
    isOffseason?:              boolean;
    alternateStartDeadline?:   string;
    players?:                  PlyrTypesPlayer[];
    statCategories?:           PlyrTypesStatCategories;
    positionTypes?:            PositionType[];
    isLiveDraftLobbyActive?:   boolean;
    leagueKey?:                LeagueKey;
    leagueId?:                 number;
    logoUrl?:                  string;
    draftStatus?:              "postdraft";
    numTeams?:                 number;
    editKey?:                  string;
    weeklyDeadline?:           "intraday";
    rosterType?:               "date";
    leagueUpdateTimestamp?:    number;
    scoringType?:              ScoringType;
    leagueType?:               "private";
    renew?:                    Renew;
    renewed?:                  string;
    feloTier?:                 FeloTier;
    isHighscore?:              string;
    matchupWeek?:              number;
    irisGroupChatId?:          string;
    allowAddToDlExtraPos?:     boolean;
    isProLeague?:              boolean;
    isCashLeague?:             boolean;
    currentWeek?:              number;
    startWeek?:                number;
    startDate?:                string;
    endWeek?:                  number;
    endDate?:                  string;
    currentDate?:              string;
    isPlusLeague?:             boolean;
    gameCode?:                 Code;
    scoreboard?:               Scoreboard;
    settings?:                 Settings;
    standings?:                Standings;
    teams?:                    MatchupTeam[];
    transactions?:             Transaction[];
    playerKey?:                string;
    playerId?:                 number;
    editorialPlayerKey?:       string;
    editorialTeamKey?:         string;
    editorialTeamFullName?:    string;
    editorialTeamAbbr?:        EditorialTeamAbbr;
    editorialTeamUrl?:         string;
    isKeeper?:                 PlyrTypesIsKeeper;
    uniformNumber?:            number;
    displayPosition?:          YPosition;
    headshot?:                 Headshot;
    imageUrl?:                 string;
    isUndroppable?:            boolean;
    positionType?:             PositionTypeElement;
    eligiblePositions?:        EligiblePositions;
    eligiblePositionsToAdd?:   string;
    hasPlayerNotes?:           boolean;
    hasRecentPlayerNotes?:     boolean;
    playerNotesLastTimestamp?: number;
    ownership?:                string;
    playerStats?:              PlayerStats;
    playerAdvancedStats?:      Stats;
    teamKey?:                  string;
    teamId?:                   number;
    isOwnedByCurrentLogin?:    number;
    teamLogos?:                Headshot[];
    previousSeasonTeamRank?:   number;
    waiverPriority?:           number;
    numberOfMoves?:            number;
    numberOfTrades?:           number;
    rosterAdds?:               RosterAdds;
    leagueScoringType?:        ScoringType;
    hasDraftGrade?:            boolean;
    managers?:                 PlyrTypesManager[];
    matchups?:                 PlyrTypesMatchup[];
    roster?:                   Roster;
    teamStats?:                Stats;
    teamPoints?:               PlyrTypesTeamPoints;
    faabBalance?:              number;
}

export type YPosition = "C" | "LW" | "D" | "G" | "RW" | "LW,RW" | "C,RW" | "C,LW" | "C,LW,RW";

export type EditorialTeamAbbr = "CHI" | "NJ" | "DET" | "PHI" | "SEA" | "FLA" | "VAN" | "NYI" | "CAR" | "BOS" | "NSH" | "STL" | "VGK" | "CBJ" | "COL" | "WPG" | "DAL" | "UTA" | "MIN" | "BUF" | "TB" | "MTL" | "PIT" | "TOR" | "ANA" | "SJ" | "EDM" | "NYR" | "WSH" | "LA" | "CGY" | "OTT";

export interface EligiblePositions {
    position: string[] | string;
}

export interface PlyrTypesIsKeeper {
    status: string;
    cost:   string;
}

export type LeagueKey = "465.l.30702" | "465.l.121384";

export interface PlyrTypesManager {
    managerId:      number;
    nickname:       string;
    guid:           string;
    isCurrentLogin: number;
    imageUrl:       string;
    feloScore:      number;
    feloTier:       FeloTier;
}

export interface PlyrTypesMatchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             MatchupStatus;
    isPlayoffs:         boolean;
    isConsolation:      boolean;
    isMatchupOfTheWeek: boolean;
    isTied?:            boolean;
    winnerTeamKey?:     string;
    statWinners?:       PurpleStatWinner[];
    teams:              MatchupTeam[];
}

export interface PurpleStatWinner {
    statId:         number;
    winnerTeamKey?: string;
    isTied?:        boolean;
}

export type MatchupStatus = "postevent" | "midevent" | "preevent";

export interface MatchupTeam {
    teamKey:                  string;
    teamId:                   number;
    name:                     string;
    isOwnedByCurrentLogin?:   number;
    url:                      string;
    teamLogos:                Headshot[];
    previousSeasonTeamRank?:  number;
    waiverPriority:           number;
    numberOfMoves:            number;
    numberOfTrades:           number;
    rosterAdds:               RosterAdds;
    leagueScoringType:        ScoringType;
    hasDraftGrade:            boolean;
    managers:                 TeamManager[];
    teamStats?:               TeamStats;
    teamPoints?:              TeamPoints;
    teamRemainingGames?:      TeamRemainingGames;
    faabBalance?:             number;
    teamLiveProjectedPoints?: TeamPoints;
    teamProjectedPoints?:     TeamPoints;
}

export interface TeamPoints {
    coverageType: "week";
    week:         number;
    total:        number;
}

export interface TeamRemainingGames {
    coverageType: "week";
    week:         number;
    total:        Total;
}

export interface Total {
    remainingGames: number;
    liveGames:      number;
    completedGames: number;
}

export interface TeamStats {
    coverageType: "week";
    week:         number;
    stats:        PlayerStatsStat[];
}

export interface PlayerStatsStat {
    statId: number;
    value:  number | ValueEnum;
}

export type ValueEnum = "" | "-" | "20:31" | "18:09" | "17:51" | "18:25" | "20:02";

export interface NameClass {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export interface Stats {
    coverageType: "season";
    season:       number;
    stats:        PlayerAdvancedStatsStat[];
}

export interface PlayerAdvancedStatsStat {
    statId: number;
    value:  number;
}

export interface PlayerStats {
    coverageType: "season";
    season:       number;
    stats:        PlayerStatsStat[];
}

export interface PlyrTypesPlayer {
    playerKey:                 string;
    playerId:                  number;
    name:                      NameClass;
    url:                       string;
    editorialPlayerKey:        string;
    editorialTeamKey:          string;
    editorialTeamFullName:     string;
    editorialTeamAbbr:         string;
    editorialTeamUrl:          string;
    isKeeper:                  PlyrTypesIsKeeper;
    uniformNumber:             number;
    displayPosition:           string;
    headshot:                  Headshot;
    imageUrl:                  string;
    isUndroppable:             boolean;
    positionType:              PositionTypeElement;
    eligiblePositions:         EligiblePositions;
    eligiblePositionsToAdd:    string;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    status?:                   string;
    statusFull?:               string;
    injuryNote?:               string;
    onDisabledList?:           boolean;
    hasRecentPlayerNotes?:     boolean;
    byeWeeks?:                 ByeWeeks;
}

export interface ByeWeeks {
    week: number;
}

export type PositionTypeElement = "B" | "P" | "O" | "G" | "DP" | "K" | "DT";

export interface PositionType {
    type:        PositionTypeElement;
    displayName: string;
}

export type Renew = "453_13803" | "";

export interface Roster {
    coverageType: "date";
    date:         string;
    isPrescoring: boolean;
    isEditable:   boolean;
    players:      RosterPlayer[];
    minimumGames: RosterAdds;
}

export interface RosterPlayer {
    playerKey:                 string;
    playerId:                  number;
    name:                      NameClass;
    url:                       string;
    editorialPlayerKey:        string;
    editorialTeamKey:          string;
    editorialTeamFullName:     string;
    editorialTeamAbbr:         EditorialTeamAbbr;
    editorialTeamUrl:          string;
    isKeeper:                  PurpleIsKeeper;
    uniformNumber:             number | string;
    displayPosition:           YPosition;
    headshot:                  Headshot;
    imageUrl:                  string;
    isUndroppable:             boolean;
    positionType:              PositionTypeElement;
    primaryPosition:           YPosition;
    eligiblePositions:         EligiblePositions;
    eligiblePositionsToAdd:    EligiblePositions | string;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    selectedPosition:          SelectedPosition;
    isEditable:                boolean;
    startingStatus?:           StartingStatus;
    hasRecentPlayerNotes?:     boolean;
    status?:                   string;
    statusFull?:               string;
    injuryNote?:               string;
    onDisabledList?:           boolean;
}

export interface PurpleIsKeeper {
    status: number | string;
    cost:   string;
    kept:   number | string;
}

export interface SelectedPosition {
    coverageType: "date";
    date:         string;
    position:     string;
    isFlex:       boolean;
}

export interface StartingStatus {
    coverageType: "date";
    date:         string;
    isStarting:   boolean;
}

export interface Scoreboard {
    week:     number;
    matchups: ScoreboardMatchup[];
}

export interface ScoreboardMatchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             MatchupStatus;
    isPlayoffs:         boolean;
    isConsolation:      boolean;
    isMatchupOfTheWeek: boolean;
    statWinners:        FluffyStatWinner[];
    teams:              MatchupTeam[];
}

export interface FluffyStatWinner {
    statId: number;
    isTied: boolean;
}

export interface Settings {
    draftType:                   string;
    isAuctionDraft:              boolean;
    scoringType:                 ScoringType;
    isHighscore:                 string;
    invitePermission:            string;
    persistentUrl:               string;
    usesPlayoff:                 boolean;
    hasPlayoffConsolationGames:  boolean;
    playoffStartWeek:            number;
    usesPlayoffReseeding:        boolean;
    usesLockEliminatedTeams:     boolean;
    numPlayoffTeams:             number;
    numPlayoffConsolationTeams:  number;
    hasMultiweekChampionship:    boolean;
    usesRosterImport?:           number;
    rosterImportDeadline?:       string;
    waiverType:                  string;
    waiverRule:                  string;
    usesFaab:                    boolean;
    draftTime:                   number;
    draftPickTime:               number;
    postDraftPlayers:            string;
    maxTeams:                    number;
    waiverTime:                  boolean;
    tradeEndDate:                string;
    tradeRatifyType:             TradeRatifyTypeEnum;
    tradeRejectTime:             boolean;
    playerPool:                  string;
    cantCutList:                 string;
    draftTogether:               boolean;
    canTradeDraftPicks?:         number;
    sendbirdChannelUrl:          string;
    rosterPositions:             RosterPosition[];
    statCategories:              SettingsStatCategories;
    maxWeeklyAdds:               number;
    usesMedianScore:             string;
    leaguePremiumFeatures:       string;
    minGamesPlayed:              number | string;
    weekHasEnoughQualifyingDays: { [key: string]: boolean };
    isPubliclyViewable?:         boolean;
    statModifiers?:              StatModifiers;
}

export interface RosterPosition {
    position:           string;
    positionType?:      PositionTypeElement;
    count:              number;
    isStartingPosition: boolean;
}

export interface SettingsStatCategories {
    stats:  PurpleStat[];
    groups: GroupElement[];
}

export interface GroupElement {
    groupName:        GroupNameEnum;
    groupDisplayName: string;
    groupAbbr:        string;
}

export type GroupNameEnum = "offense" | "goaltending";

export interface PurpleStat {
    statId:             number;
    enabled:            boolean;
    name:               string;
    displayName:        string;
    group:              GroupNameEnum;
    abbr:               string;
    sortOrder:          boolean;
    positionType:       PositionTypeElement;
    statPositionTypes:  StatPositionType[];
    isOnlyDisplayStat?: number;
}

export interface StatPositionType {
    positionType:       PositionTypeElement;
    isOnlyDisplayStat?: number;
}

export interface StatModifiers {
    stats: PlayerAdvancedStatsStat[];
}

export type TradeRatifyTypeEnum = "drop" | "add" | "trade" | "add/drop" | "commish";

export interface Standings {
    teams: StandingsTeam[];
}

export interface StandingsTeam {
    teamKey:                 string;
    teamId:                  number;
    name:                    string;
    url:                     string;
    teamLogos:               Headshot[];
    previousSeasonTeamRank?: number;
    waiverPriority:          number;
    numberOfMoves:           number;
    numberOfTrades:          number;
    rosterAdds:              RosterAdds;
    leagueScoringType:       ScoringType;
    hasDraftGrade:           boolean;
    managers:                TeamManager[];
    teamStats:               Stats;
    teamPoints:              PlyrTypesTeamPoints;
    teamStandings:           TeamStandings;
    isOwnedByCurrentLogin?:  number;
    faabBalance?:            number;
}

export interface PlyrTypesTeamPoints {
    coverageType: "season";
    season:       number;
    total:        number;
    stats?:       TeamPointsStat[];
}

export interface TeamPointsStat {
    statId: number;
    value:  string;
}

export interface TeamStandings {
    rank:           number;
    playoffSeed?:   number;
    outcomeTotals:  OutcomeTotals;
    pointsFor?:     number;
    pointsAgainst?: number;
}

export interface OutcomeTotals {
    wins:       number;
    losses:     number;
    ties:       number;
    percentage: number;
}

export interface PlyrTypesStatCategories {
    stats: FluffyStat[];
}

export interface FluffyStat {
    statId:           number;
    name:             string;
    displayName:      string;
    sortOrder:        boolean;
    positionTypes?:   PositionTypeElement[];
    isCompositeStat?: boolean;
    baseStats?:       BaseStat[];
}

export interface BaseStat {
    statId: number;
}

export interface Transaction {
    transactionKey:  string;
    transactionId:   number;
    type:            TradeRatifyTypeEnum;
    status:          TransactionStatus;
    timestamp:       number;
    players?:        TransactionPlayer[];
    traderTeamKey?:  string;
    traderTeamName?: string;
    tradeeTeamKey?:  string;
    tradeeTeamName?: string;
    picks?:          Picks;
    faabBid?:        number;
}

export interface Picks {
    pick: Pick[];
}

export interface Pick {
    sourceTeamKey:       string;
    sourceTeamName:      string;
    destinationTeamKey:  string;
    destinationTeamName: string;
    originalTeamKey:     string;
    originalTeamName:    string;
    round:               number;
}

export interface TransactionPlayer {
    playerKey:         string;
    playerId:          number;
    name:              NameClass;
    editorialTeamAbbr: EditorialTeamAbbr;
    displayPosition:   YPosition;
    positionType:      PositionTypeElement;
    transactionData:   TransactionData;
}

export interface TransactionData {
    type:                 TradeRatifyTypeEnum;
    sourceType:           DestinationTypeEnum;
    sourceTeamKey?:       string;
    sourceTeamName?:      string;
    destinationType:      DestinationTypeEnum;
    destinationTeamKey?:  string;
    destinationTeamName?: string;
}

export type DestinationTypeEnum = "waivers" | "team" | "freeagents";

export type TransactionStatus = "successful" | "vetoed";
