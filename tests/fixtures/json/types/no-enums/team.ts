export interface Team {
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
    managers:          ManagersClass;
    matchups?:         Matchup[];
    roster?:           Roster;
    teamStandings?:    TeamStandings;
    teamStats?:        FluffyTeamStats;
    teamPoints?:       PurpleTeamPoints;
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

export interface Matchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             string;
    isPlayoffs:         boolean;
    isConsolation:      boolean;
    isMatchupOfTheWeek: boolean;
    isTied?:            boolean;
    winnerTeamKey?:     string;
    statWinners?:       StatWinner[];
    teams:              TeamElement[];
}

export interface StatWinner {
    statId:         number;
    winnerTeamKey?: string;
    isTied?:        boolean;
}

export interface TeamElement {
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

export interface Roster {
    coverageType: string;
    date:         string;
    isPrescoring: boolean;
    isEditable:   boolean;
    players:      Player[];
    minimumGames: RosterAdds;
}

export interface Player {
    playerKey:                 string;
    playerId:                  number;
    name:                      Name;
    url:                       string;
    editorialPlayerKey:        string;
    editorialTeamKey:          string;
    editorialTeamFullName:     string;
    editorialTeamAbbr:         string;
    editorialTeamUrl:          string;
    isKeeper:                  IsKeeper;
    uniformNumber:             number;
    displayPosition:           string;
    headshot:                  TeamLogo;
    imageUrl:                  string;
    isUndroppable:             boolean;
    positionType:              string;
    primaryPosition:           string;
    eligiblePositions:         EligiblePositions;
    eligiblePositionsToAdd:    EligiblePositionsToAddClass | string;
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

export interface EligiblePositions {
    position: string[] | string;
}

export interface EligiblePositionsToAddClass {
    position: string[];
}

export interface IsKeeper {
    status: string;
    cost:   string;
    kept:   string;
}

export interface Name {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export interface SelectedPosition {
    coverageType: string;
    date:         string;
    position:     string;
    isFlex:       boolean;
}

export interface StartingStatus {
    coverageType: string;
    date:         string;
    isStarting:   boolean;
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
    playoffSeed:   number;
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
