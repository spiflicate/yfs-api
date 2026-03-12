export interface GameTypes {
    gameKey:                 string;
    gameId:                  number;
    name:                    string;
    code:                    string;
    type:                    "full";
    url:                     string;
    season:                  number;
    isRegistrationOver:      boolean;
    isGameOver:              boolean;
    isOffseason:             boolean;
    alternateStartDeadline?: string;
    players?:                Player[];
    statCategories?:         StatCategories;
    positionTypes?:          PositionType[];
    isLiveDraftLobbyActive?: boolean;
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

export interface EligiblePositions {
    position: string[] | string;
}

export interface Headshot {
    url:  string;
    size: "small";
}

export interface IsKeeper {
    status: string;
    cost:   string;
}

export interface Name {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export type PositionTypeElement = "B" | "P" | "O" | "G" | "DP" | "K" | "DT";

export interface PositionType {
    type:        PositionTypeElement;
    displayName: string;
}

export interface StatCategories {
    stats: Stat[];
}

export interface Stat {
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
