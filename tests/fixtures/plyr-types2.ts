export interface PlyrTypes2 {
    league: League;
}

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
    scoringType:           "headpoint";
    leagueType:            string;
    renew:                 string;
    renewed:               string;
    feloTier:              FeloTier;
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
    players:               Player[];
}

export type FeloTier = "diamond" | "platinum" | "gold" | "bronze";

export interface Player {
    playerKey:                 string;
    playerId:                  number;
    name:                      NameClass;
    url:                       string;
    status?:                   Status;
    statusFull?:               StatusFull;
    editorialPlayerKey:        string;
    editorialTeamKey:          EditorialTeamKey;
    editorialTeamFullName:     EditorialTeamFullName;
    editorialTeamAbbr:         EditorialTeamAbbr;
    editorialTeamUrl:          string;
    isKeeper:                  IsKeeper;
    uniformNumber:             number | string;
    displayPosition:           DisplayPositionEnum;
    headshot:                  Headshot;
    imageUrl:                  string;
    isUndroppable:             boolean;
    positionType:              PositionType;
    primaryPosition:           DisplayPositionEnum;
    eligiblePositions:         EligiblePositions;
    eligiblePositionsToAdd:    EligiblePositions | string;
    ownership:                 Ownership;
    hasPlayerNotes?:           boolean;
    playerNotesLastTimestamp?: number;
    hasRecentPlayerNotes?:     boolean;
    injuryNote?:               string;
    onDisabledList?:           boolean;
}

export type DisplayPositionEnum = "D" | "RW" | "LW,RW" | "C,LW" | "C" | "G" | "LW" | "C,LW,RW" | "C,RW";

export type EditorialTeamAbbr = "STL" | "COL" | "LA" | "WSH" | "PIT" | "MIN" | "SJ" | "CAR" | "WPG" | "BUF" | "OTT" | "NYI" | "CHI" | "NYR" | "DET" | "TB" | "UTA" | "TOR" | "CGY" | "CBJ" | "FLA" | "NSH" | "VGK" | "VAN" | "SEA" | "DAL" | "NJ" | "PHI" | "ANA" | "MTL" | "EDM" | "BOS";

export type EditorialTeamFullName = "St. Louis Blues" | "Colorado Avalanche" | "Los Angeles Kings" | "Washington Capitals" | "Pittsburgh Penguins" | "Minnesota Wild" | "San Jose Sharks" | "Carolina Hurricanes" | "Winnipeg Jets" | "Buffalo Sabres" | "Ottawa Senators" | "New York Islanders" | "Chicago Blackhawks" | "New York Rangers" | "Detroit Red Wings" | "Tampa Bay Lightning" | "Utah Mammoth" | "Toronto Maple Leafs" | "Calgary Flames" | "Columbus Blue Jackets" | "Florida Panthers" | "Nashville Predators" | "Vegas Golden Knights" | "Vancouver Canucks" | "Seattle Kraken" | "Dallas Stars" | "New Jersey Devils" | "Philadelphia Flyers" | "Anaheim Ducks" | "Montreal Canadiens" | "Edmonton Oilers" | "Boston Bruins";

export type EditorialTeamKey = "nhl.t.19" | "nhl.t.17" | "nhl.t.8" | "nhl.t.23" | "nhl.t.16" | "nhl.t.30" | "nhl.t.18" | "nhl.t.7" | "nhl.t.28" | "nhl.t.2" | "nhl.t.14" | "nhl.t.12" | "nhl.t.4" | "nhl.t.13" | "nhl.t.5" | "nhl.t.20" | "nhl.t.60" | "nhl.t.21" | "nhl.t.3" | "nhl.t.29" | "nhl.t.26" | "nhl.t.27" | "nhl.t.58" | "nhl.t.22" | "nhl.t.59" | "nhl.t.9" | "nhl.t.11" | "nhl.t.15" | "nhl.t.25" | "nhl.t.10" | "nhl.t.6" | "nhl.t.1";

export interface EligiblePositions {
    position: PositionElement[] | DisplayPositionEnum;
}

export type PositionElement = "D" | "Util" | "RW" | "LW" | "C" | "IR+" | "G";

export interface Headshot {
    url:  string;
    size: Size;
}

export type Size = "small" | "large";

export interface IsKeeper {
    status: string;
    cost:   string;
    kept:   string;
}

export interface NameClass {
    full:       string;
    first:      string;
    last:       string;
    asciiFirst: string;
    asciiLast:  string;
}

export interface Ownership {
    ownershipType:  OwnershipType;
    ownerTeamKey?:  TeamKey;
    ownerTeamName?: OwnerTeamNameEnum;
    teams?:         Team[];
    waiverDate?:    string;
    displayDate?:   string;
}

export type TeamKey = "465.l.50894.t.1" | "465.l.50894.t.16" | "465.l.50894.t.15" | "465.l.50894.t.7" | "465.l.50894.t.12" | "465.l.50894.t.8" | "465.l.50894.t.6" | "465.l.50894.t.4" | "465.l.50894.t.5" | "465.l.50894.t.2" | "465.l.50894.t.9" | "465.l.50894.t.14" | "465.l.50894.t.10" | "465.l.50894.t.13" | "465.l.50894.t.11" | "465.l.50894.t.3";

export type OwnerTeamNameEnum = "Hughes Jugs (of Seider)" | "A&G - Nate" | "Dream Warriors (Ian F)" | "popi" | "The Donkey" | "NolanM" | "MStone" | "RedLampDistrict" | "Tavar Wars Atk of the Stromes" | "The Blazing Turtles" | "Memeory" | "Sasquatch Snipers" | "Bedsy's Bunch of Beauts" | "Schaef and Sound" | "Frozen Paddles" | "Seabass";

export type OwnershipType = "freeagents" | "team" | "waivers";

export interface Team {
    teamKey:            TeamKey;
    teamId:             number;
    name:               OwnerTeamNameEnum;
    url:                string;
    teamLogos:          Headshot[];
    waiverPriority:     number;
    faabBalance:        number;
    numberOfMoves:      number;
    numberOfTrades:     number;
    rosterAdds:         RosterAdds;
    leagueScoringType:  "headpoint";
    hasDraftGrade:      boolean;
    auctionBudgetTotal: number;
    auctionBudgetSpent: number;
    managers:           Manager[];
}

export interface Manager {
    managerId:       number;
    nickname:        "--hidden--";
    guid:            GUID;
    feloScore:       number;
    feloTier:        FeloTier;
    isComanager?:    boolean;
    isCommissioner?: boolean;
}

export type GUID = "FVO6XZXJW4VZCKYLA5DPGKKAYI" | "F75BAG4WIRKSCVQXDCP43VFURQ" | "BUN2QI2CHGILAS5Z5QLJ3Y6QFQ" | "AHQYUHDWHTQMAKM3ITPKWVWD7U" | "Z5AC4XA4GU3D6D7FQK2ORKKTEQ" | "RFIDYLHB4UYPE4NEYQDZAMAMZ4" | "WZP5DO43PH7MKA6VB5HDZGZCLM" | "5FBZCGMJGEMAB7QGJPQNUE5YOM" | "NEDMOZVXBX7HE2JSEX2CMAFI3M" | "EPYQJNM7QFQ52CAIPCW7TAPBFA" | "45N6IRRVM5DORIA3YGY52DAUJM" | "HYTNGPFD2UKNDBVRABNQS6W3DA" | "DXCPVZMBD7OQL7AQA62LPYHQS4" | "ETEV54H3IOVFANCCZZTFIOIRLQ" | "NG4MBJII3YT337HO737DGSDPOM" | "U6VNS2TK4EN2YOURKJSAEQX5NM" | "MBGN34M47VN62UEJF3C75ID62A" | "BAZ3SUPWEUTNGPTYLWLG6KCPVY" | "WOTAUBGQRUZABJDWKMMDMD4JOM" | "VPFW2FQREPWM4NR4OHX4WKZCYM";

export interface RosterAdds {
    coverageType:  "week";
    coverageValue: number;
    value:         number;
}

export type PositionType = "P" | "G";

export type Status = "NA" | "DTD" | "IR" | "IR-LT" | "O" | "IR-NR";

export type StatusFull = "Not Active" | "Day-to-Day" | "Injured Reserve" | "Out";
