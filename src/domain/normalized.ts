import type { ImageSource, StatValue } from './common';

/** Mechanically normalized game metadata returned by Yahoo. */
export interface YahooGameDto {
   gameKey: string;
   gameId: number;
   name: string;
   code: string;
   type: string;
   url: string;
   season: number;
   isRegistrationOver: boolean;
   isGameOver: boolean;
   isOffseason: boolean;
   isLiveDraftLobbyActive?: boolean;
   alternateStartDeadline?: string;
   players?: YahooPlayerDto[];
   statCategories?: YahooGameStatCategoriesDto;
   positionTypes?: YahooPositionTypeDto[];
   gameWeeks?: YahooGameWeekDto[];
   teams?: YahooTeamDto[];
   leagues?: YahooLeagueDto[];
}

export interface YahooGameResponseDto {
   game: YahooGameDto;
}

export interface YahooGamesResponseDto {
   games: YahooGameDto[];
}

export interface YahooGameWeekDto {
   week: number;
   displayName: string | number;
   start: string;
   end: string;
   current: string | number | boolean;
}

export interface YahooPositionTypeDto {
   type: string;
   displayName: string;
}

export interface YahooGameStatCategoriesDto {
   stats: YahooGameStatDto[];
}

export interface YahooGameStatDto {
   statId: number;
   name: string;
   displayName: string;
   sortOrder: boolean;
   positionTypes?: string[];
   isCompositeStat?: boolean;
   baseStats?: Array<{ statId: number }>;
}

/** Mechanically normalized league metadata, with requested subresources nested. */
export interface YahooLeagueDto {
   leagueKey: string;
   leagueId: number;
   name: string;
   url: string;
   logoUrl: string;
   draftStatus: string;
   numTeams: number;
   editKey: string;
   weeklyDeadline: string;
   rosterType: string;
   leagueUpdateTimestamp: number;
   scoringType: string;
   leagueType: string;
   renew: string;
   renewed: string;
   feloTier: string;
   isHighscore: string | boolean;
   matchupWeek: number;
   irisGroupChatId: string;
   allowAddToDlExtraPos: boolean;
   isProLeague: boolean;
   isCashLeague: boolean;
   currentWeek: number;
   startWeek: number;
   startDate: string;
   endWeek: number;
   endDate: string;
   currentDate: string;
   isPlusLeague: boolean;
   gameCode: string;
   season: number;
   settings?: YahooLeagueSettingsDto;
   standings?: YahooLeagueStandingsDto;
   scoreboard?: YahooLeagueScoreboardDto;
   teams?: YahooTeamDto[];
   players?: YahooPlayerDto[];
   transactions?: YahooTransactionDto[];
}

export interface YahooLeagueResponseDto {
   league: YahooLeagueDto;
}

export interface YahooLeaguesResponseDto {
   leagues: YahooLeagueDto[];
}

export interface YahooLeagueSettingsResponseDto extends YahooLeagueDto {
   settings: YahooLeagueSettingsDto;
}

export interface YahooLeagueStandingsResponseDto extends YahooLeagueDto {
   standings: YahooLeagueStandingsDto;
}

export interface YahooLeagueScoreboardResponseDto extends YahooLeagueDto {
   scoreboard: YahooLeagueScoreboardDto;
}

export interface YahooLeagueSettingsDto {
   draftType: string;
   isAuctionDraft: boolean;
   scoringType: string;
   isHighscore: string | boolean;
   invitePermission: string;
   persistentUrl: string;
   usesPlayoff: boolean;
   hasPlayoffConsolationGames: boolean;
   playoffStartWeek: number;
   usesPlayoffReseeding: boolean;
   usesLockEliminatedTeams: boolean;
   numPlayoffTeams: number;
   numPlayoffConsolationTeams: number;
   hasMultiweekChampionship: boolean;
   waiverType: string;
   waiverRule: string;
   usesFaab: boolean;
   draftTime: number;
   draftPickTime: number;
   postDraftPlayers: string;
   maxTeams: number;
   waiverTime: boolean;
   tradeEndDate: string;
   tradeRatifyType: string;
   tradeRejectTime: boolean;
   playerPool: string;
   cantCutList: string;
   draftTogether: boolean;
   isPubliclyViewable: boolean;
   sendbirdChannelUrl: string;
   rosterPositions: YahooRosterPositionDto[];
   statCategories: YahooLeagueStatCategoriesDto;
   statModifiers: { stats: YahooStatValueDto[] };
   maxWeeklyAdds: number;
   usesMedianScore: string | boolean;
   leaguePremiumFeatures: string;
   minGamesPlayed: string | number;
   weekHasEnoughQualifyingDays: Record<string, boolean>;
}

export interface YahooRosterPositionDto {
   position: string;
   positionType?: string;
   count: number;
   isStartingPosition: boolean;
}

export interface YahooLeagueStatCategoriesDto {
   stats: Array<{
      statId: number;
      enabled: boolean;
      name: string;
      displayName: string;
      group: string;
      abbr: string;
      sortOrder: boolean;
      positionType: string;
      statPositionTypes: Array<{ positionType: string }>;
   }>;
   groups: Array<{
      groupName: string;
      groupDisplayName: string;
      groupAbbr: string;
   }>;
}

export interface YahooLeagueStandingsDto {
   teams: YahooStandingsTeamDto[];
}

export interface YahooLeagueScoreboardDto {
   week: number;
   matchups: YahooMatchupDto[];
}

/** Mechanically normalized fantasy-team metadata. */
export interface YahooTeamDto {
   teamKey: string;
   teamId: number;
   name: string;
   url: string;
   teamLogos: ImageSource[];
   waiverPriority?: number;
   faabBalance?: number;
   numberOfMoves: number;
   numberOfTrades: number;
   rosterAdds: YahooCoverageValueDto;
   leagueScoringType: string;
   hasDraftGrade: boolean;
   managers: YahooManagerDto[];
   isOwnedByCurrentLogin?: number | boolean;
   previousSeasonTeamRank?: number;
   divisionId?: number;
   draftPosition?: number;
   clinchedPlayoffs?: number | boolean;
   roster?: YahooTeamRosterDto;
   teamStats?: YahooTeamStatsDto;
   teamPoints?: YahooTeamPointsDto;
   teamStandings?: YahooTeamStandingsDto;
   matchups?: YahooMatchupDto[];
}

export interface YahooTeamResponseDto {
   team: YahooTeamDto;
}

export interface YahooTeamsResponseDto {
   teams: YahooTeamDto[];
}

export interface YahooTeamRosterResponseDto extends YahooTeamDto {
   roster: YahooTeamRosterDto;
}

export interface YahooTeamStatsResponseDto extends YahooTeamDto {
   teamStats: YahooTeamStatsDto;
   teamPoints: YahooTeamPointsDto;
}

export interface YahooTeamMatchupsResponseDto extends YahooTeamDto {
   matchups: YahooMatchupDto[];
}

export interface YahooCoverageValueDto {
   coverageType: string;
   coverageValue: number;
   value: number;
}

export interface YahooManagerDto {
   managerId: number;
   nickname: string;
   guid: string;
   email?: string;
   imageUrl?: string;
   feloScore?: number;
   feloTier?: string;
   isCommissioner?: boolean | number;
   isComanager?: boolean | number;
   isCurrentLogin?: boolean | number;
}

export interface YahooTeamRosterDto {
   coverageType: string;
   date?: string;
   week?: number;
   isPrescoring: boolean;
   isEditable: boolean;
   players: YahooPlayerDto[];
   minimumGames: YahooCoverageValueDto;
}

export interface YahooStatValueDto {
   statId: number;
   value: StatValue;
}

export interface YahooTeamStatsDto {
   coverageType: string;
   season?: number;
   week?: number;
   date?: string;
   stats: YahooStatValueDto[];
}

export interface YahooTeamPointsDto {
   coverageType: string;
   season?: number;
   week?: number;
   date?: string;
   total: number;
   stats?: YahooStatValueDto[];
}

export interface YahooTeamStandingsDto {
   rank: number;
   playoffSeed?: number;
   outcomeTotals: {
      wins: number;
      losses: number;
      ties: number;
      percentage: number;
   };
   pointsFor: number;
   pointsAgainst: number;
}

export interface YahooStandingsTeamDto extends YahooTeamDto {
   teamStats: YahooTeamStatsDto;
   teamPoints: YahooTeamPointsDto;
   teamStandings: YahooTeamStandingsDto;
}

export interface YahooMatchupDto {
   week: number;
   weekStart: string;
   weekEnd: string;
   status: string;
   isPlayoffs: boolean;
   isConsolation: boolean;
   isMatchupOfTheWeek: boolean;
   isTied?: boolean;
   winnerTeamKey?: string;
   statWinners?: Array<{
      statId: number;
      winnerTeamKey?: string;
      isTied?: boolean;
   }>;
   teams: YahooMatchupTeamDto[];
}

export interface YahooMatchupTeamDto extends YahooTeamDto {
   teamStats: YahooTeamStatsDto;
   teamPoints: YahooTeamPointsDto;
   teamRemainingGames: {
      coverageType: string;
      week: number;
      total: {
         remainingGames: number;
         liveGames: number;
         completedGames: number;
      };
   };
   teamLiveProjectedPoints: YahooTeamPointsDto;
   teamProjectedPoints: YahooTeamPointsDto;
}

/** Mechanically normalized professional-player metadata. */
export interface YahooPlayerDto {
   playerKey: string;
   playerId: number;
   name: YahooPlayerNameDto;
   url: string;
   editorialPlayerKey: string;
   editorialTeamKey: string;
   editorialTeamFullName: string;
   editorialTeamAbbr: string;
   editorialTeamUrl: string;
   isKeeper: { status: string; cost: string; kept?: string };
   uniformNumber: number;
   displayPosition: string;
   headshot: ImageSource;
   imageUrl: string;
   isUndroppable: boolean;
   positionType: string;
   primaryPosition?: string;
   eligiblePositions: { position: string | string[] };
   eligiblePositionsToAdd: string | { position: string | string[] };
   byeWeeks?: { week: number };
   hasPlayerNotes?: boolean;
   hasRecentPlayerNotes?: boolean;
   playerNotesLastTimestamp?: number;
   selectedPosition?: YahooSelectedPositionDto;
   startingStatus?: YahooStartingStatusDto;
   isEditable?: boolean;
   status?: string;
   statusFull?: string;
   injuryNote?: string;
   onDisabledList?: boolean;
   playerStats?: YahooPlayerStatsDto;
   playerAdvancedStats?: YahooPlayerStatsDto;
   ownership?: string | YahooPlayerOwnershipDto;
   percentOwned?: YahooPlayerPercentOwnedDto;
   draftAnalysis?: YahooPlayerDraftAnalysisDto;
}

export interface YahooPlayerResponseDto {
   player: YahooPlayerDto;
}

export interface YahooPlayersResponseDto {
   players: YahooPlayerDto[];
}

export interface YahooPlayerStatsResponseDto extends YahooPlayerDto {
   playerStats: YahooPlayerStatsDto;
   playerAdvancedStats?: YahooPlayerStatsDto;
}

export interface YahooPlayerOwnershipResponseDto extends YahooPlayerDto {
   ownership: string | YahooPlayerOwnershipDto;
}

export interface YahooPlayerPercentOwnedResponseDto extends YahooPlayerDto {
   percentOwned: YahooPlayerPercentOwnedDto;
}

export interface YahooPlayerDraftAnalysisResponseDto
   extends YahooPlayerDto {
   draftAnalysis: YahooPlayerDraftAnalysisDto;
}

export interface YahooPlayerNameDto {
   full: string;
   first: string;
   last: string;
   asciiFirst: string;
   asciiLast: string;
}

export interface YahooSelectedPositionDto {
   coverageType: string;
   date?: string;
   week?: number;
   position: string;
   isFlex: boolean;
}

export interface YahooStartingStatusDto {
   coverageType: string;
   date?: string;
   week?: number;
   isStarting: boolean;
}

export interface YahooPlayerStatsDto {
   coverageType: string;
   season?: number;
   week?: number;
   date?: string;
   stats: YahooStatValueDto[];
}

export interface YahooPlayerOwnershipDto {
   ownershipType: string;
   ownerTeamKey?: string;
   ownerTeamName?: string;
   waPeriod?: number;
   faabBalance?: number;
}

export interface YahooPlayerPercentOwnedDto {
   coverageType: string;
   week?: number;
   date?: string;
   percentOwned: number;
   percentStarted?: number;
   percentRecommended?: number;
   delta?: number;
}

export interface YahooPlayerDraftAnalysisDto {
   averagePick?: number;
   averageRound?: number;
   averageCost?: number;
   cost?: number;
   percentageOwned?: number;
   percentageStarted?: number;
}

/** The logged-in Yahoo user collection returned by `use_login=1`. */
export interface YahooLoggedInUserDto {
   guid: string;
   games?: YahooGameDto[];
   teams?: YahooTeamDto[];
   leagues?: YahooLeagueDto[];
}

export interface YahooLoggedInUsersResponseDto {
   users: YahooLoggedInUserDto[];
}

/** Mechanically normalized transaction read data. */
export interface YahooTransactionDto {
   transactionKey: string;
   transactionId: number;
   type: string;
   status: string;
   timestamp: number;
   players?: YahooTransactionPlayerDto[];
   faabBid?: number;
}

export interface YahooTransactionPlayerDto {
   playerKey: string;
   playerId: number;
   name: YahooPlayerNameDto;
   editorialTeamAbbr?: string;
   displayPosition?: string;
   positionType?: string;
   transactionData: {
      type: string;
      sourceType?: string;
      sourceTeamKey?: string;
      sourceTeamName?: string;
      destinationType?: string;
      destinationTeamKey?: string;
      destinationTeamName?: string;
   };
}

export interface YahooTransactionResponseDto {
   transaction: YahooTransactionDto;
}

export interface YahooTransactionsResponseDto {
   transactions: YahooTransactionDto[];
}

export interface YahooLeagueTransactionsResponseDto extends YahooLeagueDto {
   transactions: YahooTransactionDto[];
}

/** Yahoo's normalized confirmation payload after a roster update. */
export interface YahooRosterUpdateConfirmationDto {
   team: YahooTeamDto;
}
