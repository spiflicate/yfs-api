export interface Transactions {
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
    transactions:          Transaction[];
}

export interface Transaction {
    transactionKey: string;
    transactionId:  number;
    type:           TypeEnum;
    status:         "successful";
    timestamp:      number;
    players?:       Player[];
    faabBid?:       number;
}

export interface Player {
    playerKey:         string;
    playerId:          number;
    name:              Name;
    editorialTeamAbbr: string;
    displayPosition:   DisplayPosition;
    positionType:      PositionType;
    transactionData:   TransactionData;
}

export type DisplayPosition = "RW" | "C" | "D" | "LW" | "C,LW,RW" | "G" | "C,RW" | "C,LW" | "LW,RW";

export interface Name {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export type PositionType = "P" | "G";

export interface TransactionData {
    type:                 TypeEnum;
    sourceType:           Type;
    destinationType:      Type;
    destinationTeamKey?:  TeamKey;
    destinationTeamName?: TeamName;
    sourceTeamKey?:       TeamKey;
    sourceTeamName?:      TeamName;
}

export type TeamKey = "465.l.121384.t.1" | "465.l.121384.t.9" | "465.l.121384.t.4" | "465.l.121384.t.11" | "465.l.121384.t.3" | "465.l.121384.t.5" | "465.l.121384.t.12" | "465.l.121384.t.6" | "465.l.121384.t.2" | "465.l.121384.t.14" | "465.l.121384.t.13" | "465.l.121384.t.10" | "465.l.121384.t.8" | "465.l.121384.t.7";

export type TeamName = "There's a Kraken My Ass" | "Club de Sausage" | "Bear Force One" | "Piggy Puckers" | "Jullebest" | "The Flaming Moe’s**" | "Wookies" | "Giant Boy Detective" | "DEZZZ" | "Third Row Penalty Box" | "TBay Flyers" | "eddtillimdead" | "ALZ" | "Doc (Aires Tavares)";

export type Type = "freeagents" | "team" | "waivers";

export type TypeEnum = "add/drop" | "drop" | "add" | "commish";
