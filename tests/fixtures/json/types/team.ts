export interface Team {
    teamKey:           string;
    teamId:            number;
    name:              string;
    url:               string;
    teamLogos:         TeamLogo[];
    waiverPriority:    number;
    faabBalance:       number;
    numberOfMoves:     number;
    numberOfTrades:    number;
    rosterAdds:        RosterAdds;
    leagueScoringType: "headpoint";
    hasDraftGrade:     boolean;
    managers:          PurpleManager[];
    matchups?:         Matchup[];
    roster?:           Roster;
    teamStandings?:    TeamStandings;
    teamStats?:        FluffyTeamStats;
    teamPoints?:       PurpleTeamPoints;
}

export interface PurpleManager {
    managerId: number;
    nickname:  "--hidden--";
    guid:      string;
    feloScore: number;
    feloTier:  FeloTier;
}

export type FeloTier = "platinum" | "diamond" | "gold" | "bronze";

export interface Matchup {
    week:               number;
    weekStart:          string;
    weekEnd:            string;
    status:             Status;
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

export type Status = "postevent" | "midevent" | "preevent";

export interface TeamElement {
    teamKey:                 string;
    teamId:                  number;
    name:                    string;
    url:                     string;
    teamLogos:               TeamLogo[];
    waiverPriority:          number;
    faabBalance:             number;
    numberOfMoves:           number;
    numberOfTrades:          number;
    rosterAdds:              RosterAdds;
    leagueScoringType:       "headpoint";
    hasDraftGrade:           boolean;
    managers:                FluffyManager[];
    teamStats:               PurpleTeamStats;
    teamPoints:              TeamPoints;
    teamRemainingGames:      TeamRemainingGames;
    teamLiveProjectedPoints: TeamPoints;
    teamProjectedPoints:     TeamPoints;
}

export interface FluffyManager {
    managerId:       number;
    nickname:        "--hidden--";
    guid:            string;
    feloScore:       number;
    feloTier:        FeloTier;
    isCommissioner?: boolean;
    isComanager?:    boolean;
}

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

export interface TeamLogo {
    size: Size;
    url:  string;
}

export type Size = "large" | "small";

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

export interface PurpleTeamStats {
    coverageType: "week";
    week:         number;
    stats:        TeamStatsStat[];
}

export interface TeamStatsStat {
    statId: number;
    value:  number;
}

export interface Roster {
    coverageType: "date";
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
    positionType:              PositionType;
    primaryPosition:           PrimaryPositionElement;
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
    position: PrimaryPositionElement[] | PrimaryPositionElement;
}

export type PrimaryPositionElement = "C" | "Util" | "LW" | "RW" | "D" | "IR+" | "G" | "BN";

export interface EligiblePositionsToAddClass {
    position: PrimaryPositionElement[];
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

export type PositionType = "P" | "G";

export interface SelectedPosition {
    coverageType: "date";
    date:         string;
    position:     PrimaryPositionElement;
    isFlex:       boolean;
}

export interface StartingStatus {
    coverageType: "date";
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
