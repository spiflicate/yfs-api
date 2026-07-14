import type { ImageSource, StatValue } from './common';

/** Mechanically normalized metadata for a Yahoo fantasy game (sport and season). */
export interface YahooGameDto {
   /** Yahoo game key. The parser preserves numeric-looking keys as strings. */
   gameKey: string;
   /** Numeric identifier for this sport-season game. */
   gameId: number;
   /** Yahoo display name for the sport, such as `Hockey`. */
   name: string;
   /** Yahoo sport code; fixtures cover `nhl`, `nfl`, `mlb`, and `nba`. */
   code: string;
   /** Yahoo game variant, observed as `full` in captured core-sport fixtures. */
   type: string;
   /** Browser URL for the fantasy game. */
   url: string;
   /** Season start year. */
   season: number;
   /** Whether Yahoo has closed new league registration for this game. */
   isRegistrationOver: boolean;
   /** Whether the sport-season fantasy game has ended. */
   isGameOver: boolean;
   /** Whether Yahoo considers this game to be in its offseason. */
   isOffseason: boolean;
   /** Present when Yahoo reports live-draft-lobby availability. */
   isLiveDraftLobbyActive?: boolean;
   /** Alternate registration deadline, observed in `YYYY-MM-DD` form. */
   alternateStartDeadline?: string;
   /** Players included by a players subresource/expansion. */
   players?: YahooPlayerDto[];
   /** Stat definitions included by the stat-categories subresource. */
   statCategories?: YahooGameStatCategoriesDto;
   /** Sport-specific position groups included by the position-types subresource. */
   positionTypes?: YahooPositionTypeDto[];
   /** Schedule periods included by the game-weeks subresource. */
   gameWeeks?: YahooGameWeekDto[];
   /** User or endpoint-selected teams when Yahoo nests them on a game. */
   teams?: YahooTeamDto[];
   /** Leagues included by a league traversal from the game. */
   leagues?: YahooLeagueDto[];
}

/** Normalized singular-game wrapper retained for resource response typing. */
export interface YahooGameResponseDto {
   game: YahooGameDto;
}

/** Normalized game collection after plural/singular wrapper normalization. */
export interface YahooGamesResponseDto {
   games: YahooGameDto[];
}

/** A Yahoo game week or scoring period. This shape is not fixture-covered here. */
export interface YahooGameWeekDto {
   /** One-based Yahoo week number. */
   week: number;
   /** Yahoo's display label; historical responses may parse it as text or number. */
   displayName: string | number;
   /** Period start supplied by Yahoo, generally a date string. */
   start: string;
   /** Period end supplied by Yahoo, generally a date string. */
   end: string;
   /** Yahoo current-period marker; scalar representation varies by response. */
   current: string | number | boolean;
}

/** A sport-specific position group exposed by game metadata. */
export interface YahooPositionTypeDto {
   /** Yahoo position-type code, such as `P`, `G`, `O`, or `B`. */
   type: string;
   /** Human-readable Yahoo label for the group. */
   displayName: string;
}

/** Stat definitions returned by a game's stat-categories subresource. */
export interface YahooGameStatCategoriesDto {
   stats: YahooGameStatDto[];
}

/** A Yahoo stat definition; available fields vary by sport and stat kind. */
export interface YahooGameStatDto {
   /** Numeric Yahoo stat identifier, meaningful within the game. */
   statId: number;
   /** Full Yahoo stat name. */
   name: string;
   /** Compact label used in Yahoo fantasy displays. */
   displayName: string;
   /** Parser-normalized Yahoo sort-direction flag. */
   sortOrder: boolean;
   /** Position groups to which the stat applies, when Yahoo supplies them. */
   positionTypes?: string[];
   /** True when Yahoo derives the stat from other stat identifiers. */
   isCompositeStat?: boolean;
   /** Input stat identifiers for a composite stat. */
   baseStats?: Array<{ statId: number }>;
}

/** Mechanically normalized league metadata, with requested subresources nested. */
export interface YahooLeagueDto {
   /** Yahoo league key in `{game_key}.l.{league_id}` form. */
   leagueKey: string;
   /** Numeric component of `leagueKey`. */
   leagueId: number;
   /** League display name. */
   name: string;
   /** Browser URL for the league. */
   url: string;
   /** League-logo URL; Yahoo may provide a custom or default image. */
   logoUrl: string;
   /** Yahoo draft lifecycle value, observed as `postdraft` in fixtures. */
   draftStatus: string;
   /** Number of teams configured in the league. */
   numTeams: number;
   /** Yahoo date/key controlling when league edits apply. */
   editKey: string;
   /** Roster transaction deadline cadence, such as `intraday`. */
   weeklyDeadline: string;
   /** Yahoo roster period model, such as date- or week-based. */
   rosterType: string;
   /** Last league update as Unix seconds. */
   leagueUpdateTimestamp: number;
   /** Yahoo scoring mode code, which is league dependent. */
   scoringType: string;
   /** Yahoo visibility/ownership category, such as `private`. */
   leagueType: string;
   /** Source league renewal reference; observed as `''` when absent. */
   renew: string;
   /** Next-season renewal reference; observed as `''` when absent. */
   renewed: string;
   /** Yahoo fantasy competition tier label. */
   feloTier: string;
   /** High-score mode marker; Yahoo may represent an unset value as `''`. */
   isHighscore: string | boolean;
   /** Week used by Yahoo for the current/completed matchup context. */
   matchupWeek: number;
   /** Yahoo chat-group identifier; observed as `''` when unavailable. */
   irisGroupChatId: string;
   /** Whether extra eligible positions may be used for disabled-list moves. */
   allowAddToDlExtraPos: boolean;
   /** Whether Yahoo classifies the league as a pro league. */
   isProLeague: boolean;
   /** Whether Yahoo classifies the league as a cash league. */
   isCashLeague: boolean;
   /** Current league scoring week. */
   currentWeek: number;
   /** First scoring week in the league season. */
   startWeek: number;
   /** League start date in `YYYY-MM-DD` form. */
   startDate: string;
   /** Final scoring week in the league season. */
   endWeek: number;
   /** League end date in `YYYY-MM-DD` form. */
   endDate: string;
   /** Yahoo's league-context date in `YYYY-MM-DD` form. */
   currentDate: string;
   /** Whether the league uses Yahoo Plus features. */
   isPlusLeague: boolean;
   /** Sport code associated with the league. */
   gameCode: string;
   /** Season start year. */
   season: number;
   /** Present when the settings subresource was requested. */
   settings?: YahooLeagueSettingsDto;
   /** Present when the standings subresource was requested. */
   standings?: YahooLeagueStandingsDto;
   /** Present when the scoreboard subresource was requested. */
   scoreboard?: YahooLeagueScoreboardDto;
   /** Present for a teams traversal/expansion. */
   teams?: YahooTeamDto[];
   /** Present for a players traversal/expansion. */
   players?: YahooPlayerDto[];
   /** Present for a transactions traversal/expansion. */
   transactions?: YahooTransactionDto[];
}

/** Normalized singular-league wrapper retained for resource response typing. */
export interface YahooLeagueResponseDto {
   league: YahooLeagueDto;
}

/** Normalized league collection after wrapper normalization. */
export interface YahooLeaguesResponseDto {
   leagues: YahooLeagueDto[];
}

/** League variant with the requested settings nested on the league. */
export interface YahooLeagueWithSettingsDto extends YahooLeagueDto {
   settings: YahooLeagueSettingsDto;
}

/** League variant with the requested standings nested on the league. */
export interface YahooLeagueWithStandingsDto extends YahooLeagueDto {
   standings: YahooLeagueStandingsDto;
}

/** League variant with the requested scoreboard nested on the league. */
export interface YahooLeagueWithScoreboardDto extends YahooLeagueDto {
   scoreboard: YahooLeagueScoreboardDto;
}

/** Captured league configuration returned by the settings subresource. */
export interface YahooLeagueSettingsDto {
   /** Yahoo draft mode code, such as self-managed or live draft. */
   draftType: string;
   /** Whether the league uses auction drafting. */
   isAuctionDraft: boolean;
   /** League scoring mode code. */
   scoringType: string;
   /** High-score mode marker; unset values may remain `''`. */
   isHighscore: string | boolean;
   /** Role allowed to invite teams. */
   invitePermission: string;
   /** Persistent browser URL chosen for the league. */
   persistentUrl: string;
   /** Whether postseason playoffs are enabled. */
   usesPlayoff: boolean;
   /** Whether Yahoo schedules consolation playoff games. */
   hasPlayoffConsolationGames: boolean;
   /** Week in which league playoffs begin. */
   playoffStartWeek: number;
   /** Whether Yahoo reseeds teams between playoff rounds. */
   usesPlayoffReseeding: boolean;
   /** Whether eliminated teams are prevented from roster changes. */
   usesLockEliminatedTeams: boolean;
   /** Number of playoff qualifiers. */
   numPlayoffTeams: number;
   /** Number of teams in the consolation bracket. */
   numPlayoffConsolationTeams: number;
   /** Whether the championship spans multiple scoring weeks. */
   hasMultiweekChampionship: boolean;
   /** Yahoo waiver processing mode code. */
   waiverType: string;
   /** Yahoo waiver ordering/availability rule code. */
   waiverRule: string;
   /** Whether free-agent acquisition budget bidding is enabled. */
   usesFaab: boolean;
   /** Scheduled draft start as Unix seconds. */
   draftTime: number;
   /** Time allowed per draft pick, in seconds. */
   draftPickTime: number;
   /** Yahoo status assigned to undrafted players. */
   postDraftPlayers: string;
   /** Maximum teams allowed in the league. */
   maxTeams: number;
   /** Parser-normalized waiver-time setting from Yahoo's numeric flag. */
   waiverTime: boolean;
   /** Last trade date in `YYYY-MM-DD` form. */
   tradeEndDate: string;
   /** Trade approval/ratification mode code. */
   tradeRatifyType: string;
   /** Parser-normalized trade rejection-period setting. */
   tradeRejectTime: boolean;
   /** Yahoo player-pool scope code. */
   playerPool: string;
   /** Yahoo cannot-cut-list mode. */
   cantCutList: string;
   /** Whether all managers draft in the same draft session. */
   draftTogether: boolean;
   /** Whether non-members can view the league. */
   isPubliclyViewable: boolean;
   /** Yahoo chat channel identifier; may be empty in other leagues. */
   sendbirdChannelUrl: string;
   /** Ordered roster slots and configured counts. */
   rosterPositions: YahooRosterPositionDto[];
   /** Scoring stat definitions and Yahoo group labels. */
   statCategories: YahooLeagueStatCategoriesDto;
   /** Point multipliers keyed by Yahoo stat identifier. */
   statModifiers: { stats: YahooStatValueDto[] };
   /** Maximum roster additions allowed per week. */
   maxWeeklyAdds: number;
   /** Median-score marker; captured Yahoo payload uses `''` when disabled/unset. */
   usesMedianScore: string | boolean;
   /** Premium-feature marker; observed as `''` when none are enabled. */
   leaguePremiumFeatures: string;
   /** Minimum-games rule; observed as `''` when not configured. */
   minGamesPlayed: string | number;
   /** Week flags normalized from Yahoo's indexed XML keys (`week01`, etc.). */
   weekHasEnoughQualifyingDays: Record<string, boolean>;
}

/** A configured league roster slot. */
export interface YahooRosterPositionDto {
   /** Yahoo roster position code, such as `C`, `G`, `BN`, or `IR+`. */
   position: string;
   /** Broad sport position group; omitted for non-playing slots. */
   positionType?: string;
   /** Number of slots configured for this position. */
   count: number;
   /** Whether players in this slot count as starters. */
   isStartingPosition: boolean;
}

/** League-enabled stat definitions and their Yahoo display groups. */
export interface YahooLeagueStatCategoriesDto {
   /** Stats enabled for league scoring. */
   stats: Array<{
      /** Numeric Yahoo stat identifier. */
      statId: number;
      /** Whether the stat contributes to this league's scoring. */
      enabled: boolean;
      /** Full Yahoo stat name. */
      name: string;
      /** Compact Yahoo display label. */
      displayName: string;
      /** Yahoo group key, which is sport dependent. */
      group: string;
      /** Stat abbreviation shown in league views. */
      abbr: string;
      /** Parser-normalized Yahoo sort-direction flag. */
      sortOrder: boolean;
      /** Primary position group scored by this definition. */
      positionType: string;
      /** Position groups Yahoo associates with the stat. */
      statPositionTypes: Array<{ positionType: string }>;
   }>;
   /** Display metadata for the stat groups used by this league. */
   groups: Array<{
      groupName: string;
      groupDisplayName: string;
      groupAbbr: string;
   }>;
}

/** Standings subresource after teams wrapper normalization. */
export interface YahooLeagueStandingsDto {
   /** Teams in Yahoo's returned standings order. */
   teams: YahooStandingsTeamDto[];
}

/** League scoreboard for a Yahoo scoring week. */
export interface YahooLeagueScoreboardDto {
   /** Scoring week represented by this scoreboard. */
   week: number;
   /** Head-to-head matchups returned for the week. */
   matchups: YahooMatchupDto[];
}

/** Mechanically normalized fantasy-team metadata. */
export interface YahooTeamDto {
   /** Yahoo team key in `{league_key}.t.{team_id}` form. */
   teamKey: string;
   /** Numeric team component of `teamKey`. */
   teamId: number;
   /** Fantasy-team display name. */
   name: string;
   /** Browser URL for the fantasy team. */
   url: string;
   /** Team logos normalized to an array even when Yahoo returns one logo. */
   teamLogos: ImageSource[];
   /** Current waiver priority; absent in some historical/user-team records. */
   waiverPriority?: number;
   /** Remaining free-agent acquisition budget; absent when FAAB is not represented. */
   faabBalance?: number;
   /** Season-to-date roster move count. */
   numberOfMoves: number;
   /** Season-to-date completed trade count. */
   numberOfTrades: number;
   /** Roster additions for Yahoo's reported coverage period. */
   rosterAdds: YahooCoverageValueDto;
   /** Scoring mode inherited from the team’s league. */
   leagueScoringType: string;
   /** Whether Yahoo reports a draft grade for the team. */
   hasDraftGrade: boolean;
   /** Managers normalized from Yahoo's manager wrapper to an array. */
   managers: YahooManagerDto[];
   /** Yahoo login ownership marker; historical payloads may retain numeric `1`. */
   isOwnedByCurrentLogin?: number | boolean;
   /** Prior-season rank when Yahoo includes historical context. */
   previousSeasonTeamRank?: number;
   /** League division identifier when divisions are configured. */
   divisionId?: number;
   /** Team's slot/order in the league draft. */
   draftPosition?: number;
   /** Yahoo playoff-clinch marker; may be numeric in historical payloads. */
   clinchedPlayoffs?: number | boolean;
   /** Present when the roster subresource was requested. */
   roster?: YahooTeamRosterDto;
   /** Present when team stats were requested. */
   teamStats?: YahooTeamStatsDto;
   /** Present with point-scoring team stats. */
   teamPoints?: YahooTeamPointsDto;
   /** Present in standings responses. */
   teamStandings?: YahooTeamStandingsDto;
   /** Present when team matchups were requested. */
   matchups?: YahooMatchupDto[];
}

/** Normalized singular-team wrapper retained for resource response typing. */
export interface YahooTeamResponseDto {
   team: YahooTeamDto;
}

/** Normalized team collection after wrapper normalization. */
export interface YahooTeamsResponseDto {
   teams: YahooTeamDto[];
}

/** Team variant with a requested roster nested on the team. */
export interface YahooTeamWithRosterDto extends YahooTeamDto {
   roster: YahooTeamRosterDto;
}

/** Team variant containing season/date/week stats and optional points. */
export interface YahooTeamWithStatsDto extends YahooTeamDto {
   teamStats: YahooTeamStatsDto;
   teamPoints?: YahooTeamPointsDto;
}

/** Team variant with matchup history/current matchup data. */
export interface YahooTeamWithMatchupsDto extends YahooTeamDto {
   matchups: YahooMatchupDto[];
}

/** A Yahoo count/value scoped to a reported coverage period. */
export interface YahooCoverageValueDto {
   /** Coverage unit, observed as `week` for roster additions/minimum games. */
   coverageType: string;
   /** Period number within the coverage type. */
   coverageValue: number;
   /** Count reported for that period. */
   value: number;
}

/** Yahoo manager profile fields nested on a fantasy team. */
export interface YahooManagerDto {
   /** Manager identifier scoped to the surrounding league/team response. */
   managerId: number;
   /** Yahoo display nickname. */
   nickname: string;
   /** Yahoo global user identifier. */
   guid: string;
   /** Contact field returned in some authenticated team responses. */
   email?: string;
   /** Yahoo profile image URL when available. */
   imageUrl?: string;
   /** Yahoo fantasy Elo-style score when returned. */
   feloScore?: number;
   /** Yahoo fantasy competition tier when returned. */
   feloTier?: string;
   /** Commissioner marker; older payloads may retain numeric `1`. */
   isCommissioner?: boolean | number;
   /** Co-manager marker; older payloads may retain numeric `1`. */
   isComanager?: boolean | number;
   /** Authenticated-user marker; older payloads may retain numeric `1`. */
   isCurrentLogin?: boolean | number;
}

/** Roster subresource for a specific date or week. */
export interface YahooTeamRosterDto {
   /** Yahoo coverage unit, such as `date` or `week`. */
   coverageType: string;
   /** Roster date in `YYYY-MM-DD` form for date-based leagues. */
   date?: string;
   /** Scoring week for week-based roster responses. */
   week?: number;
   /** Whether Yahoo considers this a pre-scoring roster. */
   isPrescoring: boolean;
   /** Whether Yahoo permits changes to this roster period. */
   isEditable: boolean;
   /** Roster players after collection-wrapper normalization. */
   players: YahooPlayerDto[];
   /** Minimum-games requirement for the roster period. */
   minimumGames: YahooCoverageValueDto;
}

/** Yahoo stat identifier paired with its mechanically parsed value. */
export interface YahooStatValueDto {
   /** Numeric Yahoo stat identifier. */
   statId: number;
   /** Number or text exactly as normalized; `''`, `-`, and time strings are valid. */
   value: StatValue;
}

/** Team stat totals for a Yahoo coverage period. */
export interface YahooTeamStatsDto {
   /** Coverage unit such as `season`, `week`, or `date`. */
   coverageType: string;
   /** Season start year for season coverage. */
   season?: number;
   /** Scoring week for week coverage. */
   week?: number;
   /** Date in `YYYY-MM-DD` form for date coverage. */
   date?: string;
   /** Values keyed by Yahoo stat identifier. */
   stats: YahooStatValueDto[];
}

/** Team fantasy-point total for a Yahoo coverage period. */
export interface YahooTeamPointsDto {
   /** Coverage unit such as `season`, `week`, or `date`. */
   coverageType: string;
   /** Season start year for season coverage. */
   season?: number;
   /** Scoring week for week coverage. */
   week?: number;
   /** Date in `YYYY-MM-DD` form for date coverage. */
   date?: string;
   /** Aggregate fantasy points for the period. */
   total: number;
   /** Per-stat point fields when Yahoo supplies the breakdown; values may be `''`. */
   stats?: YahooStatValueDto[];
}

/** Ranking and record fields nested on a standings team. */
export interface YahooTeamStandingsDto {
   /** One-based Yahoo standings rank. */
   rank: number;
   /** Playoff seed when assigned; absent for some lower-ranked teams. */
   playoffSeed?: number;
   /** Win/loss/tie totals and Yahoo's decimal winning percentage. */
   outcomeTotals: {
      wins: number;
      losses: number;
      ties: number;
      percentage: number;
   };
   /** Fantasy points scored by the team. */
   pointsFor: number;
   /** Fantasy points scored against the team. */
   pointsAgainst: number;
}

/** Team shape used specifically inside league standings. */
export interface YahooStandingsTeamDto extends YahooTeamDto {
   /** Season totals included by the standings endpoint. */
   teamStats: YahooTeamStatsDto;
   /** Season fantasy points included by the standings endpoint. */
   teamPoints: YahooTeamPointsDto;
   /** Rank and outcome record included by the standings endpoint. */
   teamStandings: YahooTeamStandingsDto;
}

/** A head-to-head Yahoo matchup and its participating teams. */
export interface YahooMatchupDto {
   /** Scoring week for the matchup. */
   week: number;
   /** Matchup period start in `YYYY-MM-DD` form. */
   weekStart: string;
   /** Matchup period end in `YYYY-MM-DD` form. */
   weekEnd: string;
   /** Yahoo lifecycle code, observed as `preevent`, `midevent`, or `postevent`. */
   status: string;
   /** Whether the matchup is part of the playoff bracket. */
   isPlayoffs: boolean;
   /** Whether the matchup is in the consolation bracket. */
   isConsolation: boolean;
   /** Yahoo's matchup-of-the-week marker. */
   isMatchupOfTheWeek: boolean;
   /** Final tie marker; absent from in-progress captured matchups. */
   isTied?: boolean;
   /** Winning team key after a winner is known. */
   winnerTeamKey?: string;
   /** Category winners; tied categories omit `winnerTeamKey`. */
   statWinners?: Array<{
      statId: number;
      winnerTeamKey?: string;
      isTied?: boolean;
   }>;
   /** Usually two matchup teams, preserved as Yahoo returns them. */
   teams: YahooMatchupTeamDto[];
}

/** Team performance and projections inside a matchup. */
export interface YahooMatchupTeamDto extends YahooTeamDto {
   /** Team stat totals for the matchup week. */
   teamStats: YahooTeamStatsDto;
   /** Current/final fantasy points for the matchup week. */
   teamPoints: YahooTeamPointsDto;
   /** Remaining, live, and completed real-world game counts. */
   teamRemainingGames: {
      coverageType: string;
      week: number;
      total: {
         remainingGames: number;
         liveGames: number;
         completedGames: number;
      };
   };
   /** Projection incorporating live results at Yahoo's response time. */
   teamLiveProjectedPoints: YahooTeamPointsDto;
   /** Yahoo's projected point total for the matchup period. */
   teamProjectedPoints: YahooTeamPointsDto;
}

/** Mechanically normalized professional-player metadata. */
export interface YahooPlayerDto {
   /** Yahoo player key in `{game_key}.p.{player_id}` form. */
   playerKey: string;
   /** Numeric player component of `playerKey`. */
   playerId: number;
   /** Yahoo's full and component name fields. */
   name: YahooPlayerNameDto;
   /** Browser URL for the professional player. */
   url: string;
   /** Sport-scoped editorial player key. */
   editorialPlayerKey: string;
   /** Sport-scoped real-world team key. */
   editorialTeamKey: string;
   /** Full real-world team name. */
   editorialTeamFullName: string;
   /** Real-world team abbreviation. */
   editorialTeamAbbr: string;
   /** Browser URL for the real-world team. */
   editorialTeamUrl: string;
   /** Keeper status fields; captured non-keeper values are often `''`. */
   isKeeper: { status: string; cost: string; kept?: string };
   /** Uniform number as parsed by Yahoo; zero is a valid number. */
   uniformNumber: number;
   /** Comma-separated Yahoo display positions. */
   displayPosition: string;
   /** Yahoo player headshot metadata. */
   headshot: ImageSource;
   /** Convenience image URL repeated by Yahoo. */
   imageUrl: string;
   /** Whether Yahoo's cannot-cut rules prevent dropping the player. */
   isUndroppable: boolean;
   /** Broad sport position group, such as `P`, `G`, `O`, or `B`. */
   positionType: string;
   /** Primary eligible position when roster context supplies it. */
   primaryPosition?: string;
   /** Eligible positions; Yahoo may emit one string or multiple strings. */
   eligiblePositions: { position: string | string[] };
   /** Additional eligible positions, or `''` when there are none. */
   eligiblePositionsToAdd: string | { position: string | string[] };
   /** NFL bye week metadata; absent for other sports. */
   byeWeeks?: { week: number };
   /** Whether Yahoo currently has a player note. */
   hasPlayerNotes?: boolean;
   /** Whether Yahoo marks the player note as recent. */
   hasRecentPlayerNotes?: boolean;
   /** Last note update as Unix seconds. */
   playerNotesLastTimestamp?: number;
   /** Assigned fantasy roster slot when returned in roster context. */
   selectedPosition?: YahooSelectedPositionDto;
   /** Real-world starting marker when Yahoo supplies it. */
   startingStatus?: YahooStartingStatusDto;
   /** Whether this player assignment is editable in roster context. */
   isEditable?: boolean;
   /** Compact Yahoo availability/injury status code. */
   status?: string;
   /** Human-readable status label. */
   statusFull?: string;
   /** Yahoo injury/status note when present. */
   injuryNote?: string;
   /** Parser-normalized disabled/injured-list marker. */
   onDisabledList?: boolean;
   /** Present when standard stats were requested. */
   playerStats?: YahooPlayerStatsDto;
   /** Present when Yahoo includes advanced stats with a stats response. */
   playerAdvancedStats?: YahooPlayerStatsDto;
   /** Ownership object, or `''` when Yahoo returns an empty ownership element. */
   ownership?: string | YahooPlayerOwnershipDto;
   /** Provisional percent-owned subresource; not covered by captured fixtures. */
   percentOwned?: YahooPlayerPercentOwnedDto;
   /** Provisional draft-analysis subresource; not covered by captured fixtures. */
   draftAnalysis?: YahooPlayerDraftAnalysisDto;
}

/** Normalized singular-player wrapper retained for resource response typing. */
export interface YahooPlayerResponseDto {
   player: YahooPlayerDto;
}

/** Normalized player collection after wrapper normalization. */
export interface YahooPlayersResponseDto {
   players: YahooPlayerDto[];
}

/** Player variant with requested standard and optional advanced stats. */
export interface YahooPlayerWithStatsDto extends YahooPlayerDto {
   playerStats: YahooPlayerStatsDto;
   playerAdvancedStats?: YahooPlayerStatsDto;
}

/** Player variant with ownership; captured Yahoo response may contain `''`. */
export interface YahooPlayerWithOwnershipDto extends YahooPlayerDto {
   ownership: string | YahooPlayerOwnershipDto;
}

/**
 * Provisional player percent-owned endpoint variant.
 * No captured fixture currently verifies this shape or field availability.
 */
export interface YahooPlayerWithPercentOwnedDto extends YahooPlayerDto {
   percentOwned: YahooPlayerPercentOwnedDto;
}

/**
 * Provisional player draft-analysis endpoint variant.
 * No captured fixture currently verifies this shape or field availability.
 */
export interface YahooPlayerWithDraftAnalysisDto extends YahooPlayerDto {
   draftAnalysis: YahooPlayerDraftAnalysisDto;
}

/** Yahoo player name in display, component, and ASCII-normalized forms. */
export interface YahooPlayerNameDto {
   /** Full Yahoo display name. */
   full: string;
   /** Given-name component. */
   first: string;
   /** Family-name component, including suffix when supplied. */
   last: string;
   /** Yahoo's ASCII-normalized given name; captured data may still contain Unicode. */
   asciiFirst: string;
   /** Yahoo's ASCII-normalized family name; captured data may still contain Unicode. */
   asciiLast: string;
}

/** Fantasy roster slot selected for a player in a date/week context. */
export interface YahooSelectedPositionDto {
   /** Coverage unit, observed as `date` in captured roster data. */
   coverageType: string;
   /** Roster date in `YYYY-MM-DD` form. */
   date?: string;
   /** Scoring week for week-based assignments. */
   week?: number;
   /** Yahoo roster slot code, including bench/injury slots. */
   position: string;
   /** Whether Yahoo marks the assignment as a flex slot. */
   isFlex: boolean;
}

/** Real-world starting status scoped to a Yahoo date/week. */
export interface YahooStartingStatusDto {
   /** Coverage unit, observed as `date` in captured roster data. */
   coverageType: string;
   /** Status date in `YYYY-MM-DD` form. */
   date?: string;
   /** Scoring week for week-based status. */
   week?: number;
   /** Whether Yahoo reports the player as starting. */
   isStarting: boolean;
}

/** Player stat values for a season, week, or date coverage period. */
export interface YahooPlayerStatsDto {
   /** Coverage unit such as `season`, `week`, or `date`. */
   coverageType: string;
   /** Season start year for season coverage. */
   season?: number;
   /** Scoring week for week coverage. */
   week?: number;
   /** Date in `YYYY-MM-DD` form for date coverage. */
   date?: string;
   /** Values keyed by Yahoo stat identifier; text values are valid. */
   stats: YahooStatValueDto[];
}

/**
 * Structured player ownership details when Yahoo does not return an empty element.
 * Captured ownership fixtures currently contain only `''`, so fields remain provisional.
 */
export interface YahooPlayerOwnershipDto {
   /** Yahoo ownership category, for example owned, waivers, or free agent. */
   ownershipType: string;
   /** Owning fantasy-team key when the player is rostered. */
   ownerTeamKey?: string;
   /** Owning fantasy-team display name when supplied. */
   ownerTeamName?: string;
   /** Yahoo waiver-period value; exact unit is not fixture-verified. */
   waPeriod?: number;
   /** FAAB value returned with ownership context, when supplied. */
   faabBalance?: number;
}

/**
 * Experimental percent-owned metrics.
 * This contract is not backed by a captured fixture; endpoint variants may differ.
 */
export interface YahooPlayerPercentOwnedDto {
   /** Yahoo coverage unit for the metric. */
   coverageType: string;
   /** Scoring week when week coverage is returned. */
   week?: number;
   /** Date in `YYYY-MM-DD` form when date coverage is returned. */
   date?: string;
   /** Reported ownership percentage; scale is not fixture-verified. */
   percentOwned: number;
   /** Reported started percentage, when returned. */
   percentStarted?: number;
   /** Reported recommendation percentage, when returned. */
   percentRecommended?: number;
   /** Change from Yahoo's comparison period, when returned. */
   delta?: number;
}

/**
 * Experimental Yahoo draft-analysis metrics.
 * This contract is not backed by a captured fixture; fields and units may vary.
 */
export interface YahooPlayerDraftAnalysisDto {
   /** Average overall pick, when returned. */
   averagePick?: number;
   /** Average draft round, when returned. */
   averageRound?: number;
   /** Average auction cost; currency/unit is not fixture-verified. */
   averageCost?: number;
   /** Current Yahoo cost value; currency/unit is not fixture-verified. */
   cost?: number;
   /** Draft-analysis ownership percentage, when returned. */
   percentageOwned?: number;
   /** Draft-analysis started percentage, when returned. */
   percentageStarted?: number;
}

/** The logged-in Yahoo user collection returned by `use_login=1`. */
export interface YahooLoggedInUserDto {
   /** Yahoo global user identifier. */
   guid: string;
   /** Games returned by a logged-in-user games traversal. */
   games?: YahooGameDto[];
   /** Teams returned by the validated direct logged-in-user traversal. */
   teams?: YahooTeamDto[];
}

/** Logged-in users wrapper after Yahoo's collection normalization. */
export interface YahooLoggedInUsersResponseDto {
   users: YahooLoggedInUserDto[];
}

/** Mechanically normalized transaction read data. */
export interface YahooTransactionDto {
   /** Yahoo transaction key in `{league_key}.tr.{transaction_id}` form. */
   transactionKey: string;
   /** Numeric transaction component of `transactionKey`. */
   transactionId: number;
   /** Yahoo transaction kind, such as `add`, `drop`, or `add/drop`. */
   type: string;
   /** Yahoo lifecycle status, observed as `successful` in captured reads. */
   status: string;
   /** Transaction time as Unix seconds. */
   timestamp: number;
   /** Players and their source/destination actions when included. */
   players?: YahooTransactionPlayerDto[];
   /** Free-agent acquisition budget bid when Yahoo includes one. */
   faabBid?: number;
}

/** A player entry and movement details inside a transaction read. */
export interface YahooTransactionPlayerDto {
   /** Yahoo player key. */
   playerKey: string;
   /** Numeric player identifier. */
   playerId: number;
   /** Yahoo player name fields. */
   name: YahooPlayerNameDto;
   /** Real-world team abbreviation when supplied. */
   editorialTeamAbbr?: string;
   /** Comma-separated fantasy display positions when supplied. */
   displayPosition?: string;
   /** Broad sport position group when supplied. */
   positionType?: string;
   /** Action plus optional source/destination fantasy-team context. */
   transactionData: {
      /** Per-player action, observed as `add` or `drop`. */
      type: string;
      /** Yahoo source category, such as team or free agents. */
      sourceType?: string;
      /** Source fantasy-team key for drops/trades. */
      sourceTeamKey?: string;
      /** Source fantasy-team name when supplied. */
      sourceTeamName?: string;
      /** Yahoo destination category, such as team or waivers. */
      destinationType?: string;
      /** Destination fantasy-team key for additions/trades. */
      destinationTeamKey?: string;
      /** Destination fantasy-team name when supplied. */
      destinationTeamName?: string;
   };
}

/** Provisional singular-transaction root envelope; root routes are not stable. */
export interface YahooTransactionResponseDto {
   transaction: YahooTransactionDto;
}

/** Provisional transaction-collection root envelope; root routes are not stable. */
export interface YahooTransactionsResponseDto {
   transactions: YahooTransactionDto[];
}

/** League variant with transaction reads nested on league metadata. */
export interface YahooLeagueWithTransactionsDto extends YahooLeagueDto {
   transactions: YahooTransactionDto[];
}

/**
 * Mechanically normalized success payload observed from a live roster PUT probe.
 * Failed updates are HTTP errors (for example, an occupied-position conflict),
 * not this DTO with a failure status. Later probes may reveal more success variants.
 */
export interface YahooRosterUpdateConfirmationDto {
   confirmation: {
      /** Literal status observed in the successful live-probe response. */
      status: 'success';
   };
}
