export interface League {
    leagueKey:             string;
    leagueId:              number;
    name:                  string;
    url:                   string;
    logoUrl:               string;
    draftStatus:           string;
    numTeams:              number;
    editKey:               string;
    weeklyDeadline:        string;
    rosterType:            string;
    leagueUpdateTimestamp: number;
    scoringType:           string;
    leagueType:            string;
    renew:                 string;
    renewed:               string;
    feloTier:              string;
    isHighscore:           string;
    matchupWeek:           number;
    irisGroupChatId:       string;
    allowAddToDlExtraPos:  boolean;
    isProLeague:           boolean;
    isCashLeague:          boolean;
    currentWeek:           number;
    startWeek:             number;
    startDate:             string;
    endWeek:               number;
    endDate:               string;
    currentDate:           string;
    isPlusLeague:          boolean;
    gameCode:              string;
    season:                number;
    scoreboard?:           Scoreboard;
    settings?:             Settings;
    standings?:            Standings;
    teams?:                StandingsTeam[];
}

export interface Scoreboard {
    week:     number;
    matchups: Matchup[];
}

export interface Matchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             string;
    isPlayoffs:         boolean;
    isConsolation:      boolean;
    isMatchupOfTheWeek: boolean;
    statWinners:        StatWinner[];
    teams:              MatchupTeam[];
}

export interface StatWinner {
    statId:         number;
    winnerTeamKey?: string;
    isTied?:        boolean;
}

export interface MatchupTeam {
    teamKey:                 string;
    teamId:                  number;
    name:                    string;
    url:                     string;
    teamLogos:               TeamLogos;
    waiverPriority:          number;
    faabBalance:             number;
    numberOfMoves:           number;
    numberOfTrades:          number;
    rosterAdds:              RosterAdds;
    leagueScoringType:       string;
    hasDraftGrade:           boolean;
    managers:                ManagerElement[] | ManagersClass;
    teamStats:               PurpleTeamStats;
    teamPoints:              TeamPoints;
    teamRemainingGames:      TeamRemainingGames;
    teamLiveProjectedPoints: TeamPoints;
    teamProjectedPoints:     TeamPoints;
}

export interface ManagerElement {
    managerId:       number;
    nickname:        string;
    guid:            string;
    feloScore:       number;
    feloTier:        string;
    isCommissioner?: boolean;
    isComanager?:    boolean;
}

export interface ManagersClass {
    manager: PurpleManager;
}

export interface PurpleManager {
    managerId: number;
    nickname:  string;
    guid:      string;
    feloScore: number;
    feloTier:  string;
}

export interface RosterAdds {
    coverageType:  string;
    coverageValue: number;
    value:         number;
}

export interface TeamPoints {
    coverageType: string;
    week:         number;
    total:        number;
}

export interface TeamLogos {
    teamLogo: TeamLogo;
}

export interface TeamLogo {
    size: string;
    url:  string;
}

export interface TeamRemainingGames {
    coverageType: string;
    week:         number;
    total:        Total;
}

export interface Total {
    remainingGames: number;
    liveGames:      number;
    completedGames: number;
}

export interface PurpleTeamStats {
    coverageType: string;
    week:         number;
    stats:        TeamStatsStat[];
}

export interface TeamStatsStat {
    statId: number;
    value:  number;
}

export interface Settings {
    draftType:                   string;
    isAuctionDraft:              boolean;
    scoringType:                 string;
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
    tradeRatifyType:             string;
    tradeRejectTime:             boolean;
    playerPool:                  string;
    cantCutList:                 string;
    draftTogether:               boolean;
    isPubliclyViewable:          boolean;
    sendbirdChannelUrl:          string;
    rosterPositions:             RosterPosition[];
    statCategories:              StatCategories;
    statModifiers:               StatModifiers;
    maxWeeklyAdds:               number;
    usesMedianScore:             string;
    leaguePremiumFeatures:       string;
    minGamesPlayed:              string;
    weekHasEnoughQualifyingDays: { [key: string]: number };
}

export interface RosterPosition {
    position:           string;
    positionType?:      string;
    count:              number;
    isStartingPosition: boolean;
}

export interface StatCategories {
    stats:  StatCategoriesStat[];
    groups: Group[];
}

export interface Group {
    groupName:        string;
    groupDisplayName: string;
    groupAbbr:        string;
}

export interface StatCategoriesStat {
    statId:            number;
    enabled:           boolean;
    name:              string;
    displayName:       string;
    group:             string;
    abbr:              string;
    sortOrder:         boolean;
    positionType:      string;
    statPositionTypes: StatPositionTypes;
}

export interface StatPositionTypes {
    statPositionType: StatPositionType;
}

export interface StatPositionType {
    positionType: string;
}

export interface StatModifiers {
    stats: TeamStatsStat[];
}

export interface Standings {
    teams: StandingsTeam[];
}

export interface StandingsTeam {
    teamKey:           string;
    teamId:            number;
    name:              string;
    url:               string;
    teamLogos:         TeamLogos;
    waiverPriority:    number;
    faabBalance:       number;
    numberOfMoves:     number;
    numberOfTrades:    number;
    rosterAdds:        RosterAdds;
    leagueScoringType: string;
    hasDraftGrade:     boolean;
    managers:          ManagerElement[] | ManagersClass;
    teamStats?:        FluffyTeamStats;
    teamPoints?:       PurpleTeamPoints;
    teamStandings?:    TeamStandings;
}

export interface PurpleTeamPoints {
    coverageType: string;
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

export interface FluffyTeamStats {
    coverageType: string;
    season:       number;
    stats:        TeamStatsStat[];
}
