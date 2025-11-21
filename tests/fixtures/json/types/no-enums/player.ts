export interface Player {
    leagueKey?:                string;
    leagueId?:                 number;
    name:                      NameClass | string;
    url:                       string;
    logoUrl?:                  string;
    draftStatus?:              string;
    numTeams?:                 number;
    editKey?:                  string;
    weeklyDeadline?:           string;
    rosterType?:               string;
    leagueUpdateTimestamp?:    number;
    scoringType?:              string;
    leagueType?:               string;
    renew?:                    string;
    renewed?:                  string;
    feloTier?:                 string;
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
    season?:                   number;
    players?:                  Players;
    playerKey?:                string;
    playerId?:                 number;
    editorialPlayerKey?:       string;
    editorialTeamKey?:         string;
    editorialTeamFullName?:    string;
    editorialTeamAbbr?:        string;
    editorialTeamUrl?:         string;
    isKeeper?:                 PurpleIsKeeper;
    uniformNumber?:            number;
    displayPosition?:          string;
    headshot?:                 Headshot;
    imageUrl?:                 string;
    isUndroppable?:            boolean;
    positionType?:             string;
    eligiblePositions?:        EligiblePositions;
    eligiblePositionsToAdd?:   string;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    playerStats?:              PlayerStats;
    playerAdvancedStats?:      PlayerAdvancedStats;
}

export interface EligiblePositions {
    position: string;
}

export interface Headshot {
    url:  string;
    size: string;
}

export interface PurpleIsKeeper {
    status: string;
    cost:   string;
}

export interface NameClass {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export interface PlayerAdvancedStats {
    coverageType: string;
    season:       number;
    stats:        PlayerAdvancedStatsStat[];
}

export interface PlayerAdvancedStatsStat {
    statId: number;
    value:  number;
}

export interface PlayerStats {
    coverageType: string;
    season:       number;
    stats:        PlayerStatsStat[];
}

export interface PlayerStatsStat {
    statId: number;
    value:  number | string;
}

export interface Players {
    player: PlayerClass;
}

export interface PlayerClass {
    playerKey:                string;
    playerId:                 number;
    name:                     NameClass;
    url:                      string;
    editorialPlayerKey:       string;
    editorialTeamKey:         string;
    editorialTeamFullName:    string;
    editorialTeamAbbr:        string;
    editorialTeamUrl:         string;
    isKeeper:                 FluffyIsKeeper;
    uniformNumber:            number;
    displayPosition:          string;
    headshot:                 Headshot;
    imageUrl:                 string;
    isUndroppable:            boolean;
    positionType:             string;
    primaryPosition:          string;
    eligiblePositions:        EligiblePositionsToAddClass;
    eligiblePositionsToAdd:   EligiblePositionsToAddClass;
    hasPlayerNotes:           boolean;
    playerNotesLastTimestamp: number;
}

export interface EligiblePositionsToAddClass {
    position: string[];
}

export interface FluffyIsKeeper {
    status: string;
    cost:   string;
    kept:   string;
}
