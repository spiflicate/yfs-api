export interface TypesNoEnumElement {
    gameKey:                 number;
    gameId:                  number;
    name:                    string;
    code:                    string;
    type:                    string;
    url:                     string;
    season:                  number;
    isRegistrationOver:      boolean;
    isGameOver:              boolean;
    isOffseason:             boolean;
    isLiveDraftLobbyActive?: boolean;
    alternateStartDeadline?: string;
}

export interface PurpleTypesNoEnum {
    gameKey?:                  number;
    gameId?:                   number;
    name:                      NameClass | NameNameEnum;
    code?:                     string;
    type?:                     string;
    url:                       string;
    season?:                   number;
    isRegistrationOver?:       boolean;
    isGameOver?:               boolean;
    isOffseason?:              boolean;
    isLiveDraftLobbyActive?:   boolean;
    positionTypes?:            PositionType[];
    statCategories?:           TypesNoEnumStatCategories;
    gameWeeks?:                GameWeeks;
    leagueKey?:                string;
    leagueId?:                 number;
    logoUrl?:                  string;
    draftStatus?:              string;
    numTeams?:                 number;
    editKey?:                  string;
    weeklyDeadline?:           string;
    rosterType?:               "date";
    leagueUpdateTimestamp?:    number;
    scoringType?:              "headpoint";
    leagueType?:               string;
    renew?:                    string;
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
    gameCode?:                 string;
    scoreboard?:               Scoreboard;
    settings?:                 Settings;
    standings?:                Standings;
    teams?:                    StandingsTeam[];
    players?:                  TypesNoEnumPlayers;
    playerKey?:                string;
    playerId?:                 number;
    editorialPlayerKey?:       string;
    editorialTeamKey?:         string;
    editorialTeamFullName?:    string;
    editorialTeamAbbr?:        string;
    editorialTeamUrl?:         string;
    isKeeper?:                 TypesNoEnumIsKeeper;
    uniformNumber?:            number;
    displayPosition?:          DisplayPositionElement;
    headshot?:                 Headshot;
    imageUrl?:                 string;
    isUndroppable?:            boolean;
    positionType?:             PositionTypeElement;
    eligiblePositions?:        TypesNoEnumEligiblePositions;
    eligiblePositionsToAdd?:   string;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    playerStats?:              PlayerStats;
    playerAdvancedStats?:      Stats;
    teamKey?:                  TeamKey;
    teamId?:                   number;
    teamLogos?:                TeamLogos;
    waiverPriority?:           number;
    faabBalance?:              number;
    numberOfMoves?:            number;
    numberOfTrades?:           number;
    rosterAdds?:               RosterAdds;
    leagueScoringType?:        "headpoint";
    hasDraftGrade?:            boolean;
    managers?:                 ManagersClass;
    matchups?:                 Matchup[];
    roster?:                   Roster;
    teamStandings?:            TeamStandings;
    teamStats?:                Stats;
    teamPoints?:               TypesNoEnumTeamPoints;
    transactions?:             Transaction[];
}

export type DisplayPositionElement = "C" | "Util" | "LW" | "RW" | "D" | "IR+" | "G" | "BN";

export interface TypesNoEnumEligiblePositions {
    position: DisplayPositionElement;
}

export type FeloTier = "platinum" | "diamond" | "gold";

export interface GameWeeks {
    gameWeek: GameWeek[];
}

export interface GameWeek {
    week:        number;
    displayName: number;
    start:       string;
    end:         string;
    current:     string;
}

export interface Headshot {
    url:  string;
    size: Size;
}

export type Size = "small" | "large";

export interface TypesNoEnumIsKeeper {
    status: string;
    cost:   string;
}

export interface ManagersClass {
    manager: PurpleManager;
}

export interface PurpleManager {
    managerId: number;
    nickname:  "--hidden--";
    guid:      string;
    feloScore: number;
    feloTier:  FeloTier;
}

export interface Matchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             MatchupStatus;
    isPlayoffs:         boolean;
    isConsolation:      boolean;
    isMatchupOfTheWeek: boolean;
    isTied?:            boolean;
    winnerTeamKey?:     TeamKey;
    statWinners?:       StatWinner[];
    teams:              MatchupTeam[];
}

export interface StatWinner {
    statId:         number;
    winnerTeamKey?: TeamKey;
    isTied?:        boolean;
}

export type TeamKey = "465.l.121384.t.1" | "465.l.121384.t.9" | "465.l.121384.t.4" | "465.l.121384.t.3" | "465.l.121384.t.6" | "465.l.121384.t.5" | "465.l.121384.t.12" | "465.l.121384.t.11" | "465.l.121384.t.14" | "465.l.121384.t.13" | "465.l.121384.t.10" | "465.l.121384.t.8" | "465.l.121384.t.2" | "465.l.121384.t.7";

export type MatchupStatus = "postevent" | "midevent" | "preevent";

export interface MatchupTeam {
    teamKey:                 TeamKey;
    teamId:                  number;
    name:                    DestinationTeamNameEnum;
    url:                     string;
    teamLogos:               TeamLogos;
    waiverPriority:          number;
    faabBalance:             number;
    numberOfMoves:           number;
    numberOfTrades:          number;
    rosterAdds:              RosterAdds;
    leagueScoringType:       "headpoint";
    hasDraftGrade:           boolean;
    managers:                ManagerElement[] | ManagersClass;
    teamStats:               TeamStats;
    teamPoints:              TeamPoints;
    teamRemainingGames:      TeamRemainingGames;
    teamLiveProjectedPoints: TeamPoints;
    teamProjectedPoints:     TeamPoints;
}

export interface ManagerElement {
    managerId:       number;
    nickname:        "--hidden--";
    guid:            string;
    feloScore:       number;
    feloTier:        string;
    isCommissioner?: boolean;
    isComanager?:    boolean;
}

export type DestinationTeamNameEnum = "There's a Kraken My Ass" | "Club de Sausage" | "Bear Force One" | "Jullebest" | "Giant Boy Detective" | "The Flaming Moe’s**" | "Wookies" | "Piggy Puckers" | "Third Row Penalty Box" | "TBay Flyers" | "eddtillimdead" | "ALZ" | "DEZZZ" | "Doc (Aires Tavares)";

export interface RosterAdds {
    coverageType:  "week";
    coverageValue: number;
    value:         number;
}

export interface TeamPoints {
    coverageType: "week";
    week:         number;
    total:        number;
}

export interface TeamLogos {
    teamLogo: Headshot;
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
    stats:        TeamStatsStat[];
}

export interface TeamStatsStat {
    statId: number;
    value:  number;
}

export interface NameClass {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export type NameNameEnum = "Hockey" | "KKUPFL - T4 Jinesjö" | "There's a Kraken My Ass";

export interface Stats {
    coverageType: "season";
    season:       number;
    stats:        TeamStatsStat[];
}

export interface PlayerStats {
    coverageType: "season";
    season:       number;
    stats:        PlayerStatsStat[];
}

export interface PlayerStatsStat {
    statId: number;
    value:  number | string;
}

export interface TypesNoEnumPlayers {
    player: PurplePlayer;
}

export interface PurplePlayer {
    playerKey:                string;
    playerId:                 number;
    name:                     NameClass;
    url:                      string;
    editorialPlayerKey:       string;
    editorialTeamKey:         string;
    editorialTeamFullName:    string;
    editorialTeamAbbr:        string;
    editorialTeamUrl:         string;
    isKeeper:                 PlayerIsKeeper;
    uniformNumber:            number;
    displayPosition:          DisplayPositionElement;
    headshot:                 Headshot;
    imageUrl:                 string;
    isUndroppable:            boolean;
    positionType:             PositionTypeElement;
    primaryPosition:          DisplayPositionElement;
    eligiblePositions:        EligiblePositions;
    eligiblePositionsToAdd:   EligiblePositions;
    hasPlayerNotes:           boolean;
    playerNotesLastTimestamp: number;
}

export interface EligiblePositions {
    position: DisplayPositionElement[];
}

export interface PlayerIsKeeper {
    status: string;
    cost:   string;
    kept:   string;
}

export type PositionTypeElement = "P" | "G";

export interface PositionType {
    type:        PositionTypeElement;
    displayName: string;
}

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
    editorialTeamAbbr:         string;
    editorialTeamUrl:          string;
    isKeeper:                  PlayerIsKeeper;
    uniformNumber:             number;
    displayPosition:           DisplayPosition;
    headshot:                  Headshot;
    imageUrl:                  string;
    isUndroppable:             boolean;
    positionType:              PositionTypeElement;
    primaryPosition:           DisplayPositionElement;
    eligiblePositions:         PurpleEligiblePositions;
    eligiblePositionsToAdd:    EligiblePositions | string;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    selectedPosition:          SelectedPosition;
    hasRecentPlayerNotes?:     boolean;
    startingStatus?:           StartingStatus;
    status?:                   string;
    statusFull?:               string;
    injuryNote?:               string;
    onDisabledList?:           boolean;
}

export type DisplayPosition = "RW" | "C" | "D" | "LW" | "C,LW,RW" | "G" | "C,RW" | "C,LW" | "LW,RW";

export interface PurpleEligiblePositions {
    position: DisplayPositionElement[] | DisplayPositionElement;
}

export interface SelectedPosition {
    coverageType: "date";
    date:         string;
    position:     DisplayPositionElement;
    isFlex:       boolean;
}

export interface StartingStatus {
    coverageType: "date";
    date:         string;
    isStarting:   boolean;
}

export interface Scoreboard {
    week:     number;
    matchups: Matchup[];
}

export interface Settings {
    draftType:                   string;
    isAuctionDraft:              boolean;
    scoringType:                 "headpoint";
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
    isPubliclyViewable:          boolean;
    sendbirdChannelUrl:          string;
    rosterPositions:             RosterPosition[];
    statCategories:              SettingsStatCategories;
    statModifiers:               StatModifiers;
    maxWeeklyAdds:               number;
    usesMedianScore:             string;
    leaguePremiumFeatures:       string;
    minGamesPlayed:              string;
    weekHasEnoughQualifyingDays: { [key: string]: number };
}

export interface RosterPosition {
    position:           DisplayPositionElement;
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
    statId:            number;
    enabled:           boolean;
    name:              string;
    displayName:       string;
    group:             GroupNameEnum;
    abbr:              string;
    sortOrder:         boolean;
    positionType:      PositionTypeElement;
    statPositionTypes: StatPositionTypes;
}

export interface StatPositionTypes {
    statPositionType: PositionTypes;
}

export interface PositionTypes {
    positionType: PositionTypeElement;
}

export interface StatModifiers {
    stats: TeamStatsStat[];
}

export type TradeRatifyTypeEnum = "add" | "drop" | "add/drop" | "commish";

export interface Standings {
    teams: StandingsTeam[];
}

export interface StandingsTeam {
    teamKey:           TeamKey;
    teamId:            number;
    name:              DestinationTeamNameEnum;
    url:               string;
    teamLogos:         TeamLogos;
    waiverPriority:    number;
    faabBalance:       number;
    numberOfMoves:     number;
    numberOfTrades:    number;
    rosterAdds:        RosterAdds;
    leagueScoringType: "headpoint";
    hasDraftGrade:     boolean;
    managers:          ManagerElement[] | ManagersClass;
    teamStats?:        Stats;
    teamPoints?:       TypesNoEnumTeamPoints;
    teamStandings?:    TeamStandings;
}

export interface TypesNoEnumTeamPoints {
    coverageType: "season";
    season:       number;
    total:        number;
    stats:        TeamPointsStat[];
}

export interface TeamPointsStat {
    statId: number;
    value:  string;
}

export interface TeamStandings {
    rank:          number;
    playoffSeed?:  number;
    outcomeTotals: OutcomeTotals;
    pointsFor:     number;
    pointsAgainst: number;
}

export interface OutcomeTotals {
    wins:       number;
    losses:     number;
    ties:       number;
    percentage: number;
}

export interface TypesNoEnumStatCategories {
    stats: FluffyStat[];
}

export interface FluffyStat {
    statId:           number;
    name:             string;
    displayName:      string;
    sortOrder:        boolean;
    positionTypes:    PositionTypeElement[] | PositionTypes;
    isCompositeStat?: boolean;
    baseStats?:       BaseStats;
}

export interface BaseStats {
    baseStat: BaseStat[];
}

export interface BaseStat {
    statId: number;
}

export interface Transaction {
    transactionKey: string;
    transactionId:  number;
    type:           TradeRatifyTypeEnum;
    status:         "successful";
    timestamp:      number;
    players?:       FluffyPlayer[] | PlayersPlayers;
    faabBid?:       number;
}

export interface FluffyPlayer {
    playerKey:         string;
    playerId:          number;
    name:              NameClass;
    editorialTeamAbbr: string;
    displayPosition:   DisplayPosition;
    positionType:      PositionTypeElement;
    transactionData:   TransactionData;
}

export interface TransactionData {
    type:                 TradeRatifyTypeEnum;
    sourceType:           DestinationTypeEnum;
    destinationType:      DestinationTypeEnum;
    destinationTeamKey?:  TeamKey;
    destinationTeamName?: DestinationTeamNameEnum;
    sourceTeamKey?:       TeamKey;
    sourceTeamName?:      DestinationTeamNameEnum;
}

export type DestinationTypeEnum = "team" | "waivers" | "freeagents";

export interface PlayersPlayers {
    player: FluffyPlayer;
}
