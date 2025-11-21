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
    type:           string;
    status:         string;
    timestamp:      number;
    players?:       Player[] | PlayersClass;
    faabBid?:       number;
}

export interface Player {
    playerKey:         string;
    playerId:          number;
    name:              Name;
    editorialTeamAbbr: string;
    displayPosition:   string;
    positionType:      string;
    transactionData:   TransactionData;
}

export interface Name {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export interface TransactionData {
    type:                 string;
    sourceType:           string;
    destinationType:      string;
    destinationTeamKey?:  string;
    destinationTeamName?: string;
    sourceTeamKey?:       string;
    sourceTeamName?:      string;
}

export interface PlayersClass {
    player: Player;
}
