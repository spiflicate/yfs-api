/**
 * Represents a Yahoo Fantasy League with all its metadata and configuration.
 *
 * @interface League
 * @description Contains core league information including settings, standings,
 * and optional scoreboard data. This is the primary interface for league-level data
 * in the Yahoo Fantasy Sports API.
 *
 * @example
 * ```typescript
 * const league: League = {
 *   leagueKey: "394.l.123456",
 *   leagueId: 123456,
 *   name: "My League",
 *   season: 2024,
 *   numTeams: 12,
 *   // ... other properties
 * };
 * ```
 */
export interface League {
   /** Unique identifier for the league in format "gameId.l.leagueId" */
   leagueKey: string;
   /** Numeric league identifier */
   leagueId: number;
   /** Display name of the league */
   name: string;
   /** URL to access the league on Yahoo Fantasy Sports */
   url: string;
   /** URL to the league's logo image */
   logoUrl: string;
   /** Current draft status (e.g., "predraft", "in_progress", "finished") */
   draftStatus: string;
   /** Total number of teams in the league */
   numTeams: number;
   /** Key for editing league settings */
   editKey: string;
   /** Weekly deadline for roster moves (typically day of week like "Wednesday") */
   weeklyDeadline: string;
   /** Type of roster (e.g., "continuous", "week") */
   rosterType: string;
   /** Unix timestamp of the last league update */
   leagueUpdateTimestamp: number;
   /** Scoring format used (e.g., "PPR", "standard", "headpoint") */
   scoringType: string;
   /** Type of league (e.g., "private", "public") */
   leagueType: string;
   /** Renewal status (e.g., "enabled", "disabled") */
   renew: string;
   /** Whether the league was renewed from a previous season */
   renewed: string;
   /** Elo rating tier for competitive leagues */
   feloTier: FeloTier;
   /** Whether the league uses head-to-head high score scoring */
   isHighscore: string;
   /** Current week number for matchups */
   matchupWeek: number;
   /** Iris group chat ID for league communications */
   irisGroupChatId: string;
   /** Whether players can be added to DL from extra positions */
   allowAddToDlExtraPos: boolean;
   /** Whether this is a professional league */
   isProLeague: boolean;
   /** Whether this is a cash league */
   isCashLeague: boolean;
   /** Current week of the league season */
   currentWeek: number;
   /** Week the league season starts */
   startWeek: number;
   /** Date the league season starts */
   startDate: string;
   /** Week the league season ends */
   endWeek: number;
   /** Date the league season ends */
   endDate: string;
   /** Current date according to the league/API */
   currentDate: string;
   /** Whether this is a Plus league (Yahoo subscription feature) */
   isPlusLeague: boolean;
   /** Game code identifier (e.g., "nhl" for hockey) */
   gameCode: string;
   /** The season/year of the league */
   season: number;
   /** Current scoreboard with matchups (optional) */
   scoreboard?: Scoreboard;
   /** League settings and configuration (optional) */
   settings?: Settings;
   /** League standings information (optional) */
   standings?: Standings;
   /** Array of teams in the league (optional) */
   teams?: StandingsTeam[];
}

/** Supported scoring types in fantasy leagues */
export type ScoringType = 'headpoint' | (string & {});

/** Coverage period types for statistics and roster moves */
export type CoverageType = 'date' | 'week' | 'season' | (string & {});

/**
 * Elo rating tiers for competitive fantasy leagues.
 * Higher tiers indicate more competitive/experienced players.
 *
 * @type {FeloTier}
 * @enum {string}
 */
export type FeloTier =
   | 'platinum'
   | 'diamond'
   | 'gold'
   | 'silver'
   | 'bronze';

/**
 * Represents a weekly scoreboard with all matchups.
 *
 * @interface Scoreboard
 * @description Contains matchups for a specific week, showing head-to-head
 * results and team performance data.
 */
export interface Scoreboard {
   /** Week number this scoreboard represents */
   week: number;
   /** Array of matchups for this week */
   matchups: Matchup[];
}

/**
 * Represents a single matchup (head-to-head competition) between two teams.
 *
 * @interface Matchup
 * @description Contains detailed information about a matchup including teams,
 * scores, and stat-by-stat winners.
 */
export interface Matchup {
   /** Week number for this matchup */
   week: number;
   /** Start date of the week */
   weekStart: string;
   /** End date of the week */
   weekEnd: string;
   /** Status of the matchup (e.g., "mid", "final") */
   status: string;
   /** Whether this matchup is in playoff rounds */
   isPlayoffs: boolean;
   /** Whether this is a consolation bracket matchup */
   isConsolation: boolean;
   /** Whether this is the "Matchup of the Week" */
   isMatchupOfTheWeek: boolean;
   /** Individual stat winners for this matchup */
   statWinners: StatWinner[];
   /** Teams competing in this matchup */
   teams: MatchupTeam[];
}

/**
 * Represents a winner for a specific stat category in a matchup.
 *
 * @interface StatWinner
 * @description Shows which team won a particular stat category,
 * with support for tied results.
 */
export interface StatWinner {
   /** Stat category ID */
   statId: number;
   /** Team key of the stat winner (omitted if tied) */
   winnerTeamKey?: string;
   /** Whether this stat was tied between teams */
   isTied?: boolean;
}

/**
 * Represents a team's data within a matchup.
 *
 * @interface MatchupTeam
 * @description Contains all team information, players' stats, projections,
 * and manager details for a team in a specific matchup.
 */
export interface MatchupTeam {
   /** Unique identifier for the team in format "gameId.l.leagueId.t.teamId" */
   teamKey: string;
   /** Numeric team identifier */
   teamId: number;
   /** Team name */
   name: string;
   /** URL to the team on Yahoo Fantasy Sports */
   url: string;
   /** Team logo images in different sizes */
   teamLogos: TeamLogo[];
   /** Waiver priority number for this team */
   waiverPriority: number;
   /** Remaining FAAB (Free Agent Acquisition Budget) balance */
   faabBalance: number;
   /** Number of roster moves made (pickup/drops) */
   numberOfMoves: number;
   /** Number of trades completed */
   numberOfTrades: number;
   /** Roster additions data (pickups/drops) */
   rosterAdds: RosterAdds;
   /** Scoring type used in the league for this team */
   leagueScoringType: string;
   /** Whether this team has a draft grade available */
   hasDraftGrade: boolean;
   /** Managers of this team */
   managers: Manager[];
   /** Stats for this team's players */
   teamStats: TeamStats;
   /** Team's current points in this matchup */
   teamPoints: TeamPoints;
   /** Remaining games for team's players */
   teamRemainingGames: TeamRemainingGames;
   /** Projected points based on live scores and remaining games */
   teamLiveProjectedPoints: TeamPoints;
   /** Total projected points for remaining games */
   teamProjectedPoints: TeamPoints;
}

/**
 * Represents a manager (owner) of a fantasy team.
 *
 * @interface Manager
 * @description Contains manager profile information and competitive ratings.
 */
export interface Manager {
   /** Unique manager ID */
   managerId: number;
   /** Display name or nickname */
   nickname: string;
   /** Global unique identifier for the manager */
   guid: string;
   /** Elo rating score for this manager */
   feloScore: number;
   /** Elo rating tier for this manager */
   feloTier: FeloTier;
   /** Whether this manager is the league commissioner */
   isCommissioner?: boolean;
   /** Whether this manager is a co-manager */
   isComanager?: boolean;
}

/**
 * Represents roster additions (pickups and drops) data.
 *
 * @interface RosterAdds
 * @description Tracks the number and timing of roster moves.
 */
export interface RosterAdds {
   /** Coverage period type (day, week, or season) */
   coverageType: CoverageType;
   /** Number of days/weeks in the coverage period */
   coverageValue: number;
   /** Total number of roster additions in the period */
   value: number;
}

/**
 * Represents a team's points total.
 *
 * @interface TeamPoints
 * @description Contains points scored in a specific time period.
 */
export interface TeamPoints {
   /** Coverage period type */
   coverageType: CoverageType;
   /** Week number (if applicable) */
   week: number;
   /** Total points */
   total: number;
}

/**
 * Represents a team logo/image.
 *
 * @interface TeamLogo
 * @description Contains URLs to team logos in different sizes.
 */
export interface TeamLogo {
   /** Size of the logo image */
   size: 'small' | 'large';
   /** URL to the logo image */
   url: string;
}

/**
 * Represents remaining games for a team.
 *
 * @interface TeamRemainingGames
 * @description Tracks games yet to be played by the team's roster.
 */
export interface TeamRemainingGames {
   /** Coverage period type */
   coverageType: CoverageType;
   /** Week number */
   week: number;
   /** Breakdown of game counts */
   total: Total;
}

/**
 * Represents game count totals.
 *
 * @interface Total
 * @description Breaks down remaining, live, and completed game counts.
 */
export interface Total {
   /** Number of games not yet started */
   remainingGames: number;
   /** Number of games currently in progress */
   liveGames: number;
   /** Number of games that have finished */
   completedGames: number;
}

/**
 * Represents a team's statistical performance.
 *
 * @interface TeamStats
 * @description Contains individual stat values for a team in a coverage period.
 */
export interface TeamStats {
   /** Coverage period type */
   coverageType: CoverageType;
   /** Week number */
   week: number;
   /** Array of individual stat values */
   stats: TeamStatsStat[];
}

/**
 * Represents a single stat value for a team.
 *
 * @interface TeamStatsStat
 * @description A key-value pair for a specific stat category.
 */
export interface TeamStatsStat {
   /** Stat category ID */
   statId: number;
   /** Value for this stat */
   value: number;
}

/**
 * Represents league settings and configuration.
 *
 * @interface Settings
 * @description Comprehensive league configuration including draft settings,
 * scoring rules, waiver/trade rules, and roster constraints.
 */
export interface Settings {
   /** Type of draft (e.g., "snake", "linear") */
   draftType: string;
   /** Whether the draft is an auction draft */
   isAuctionDraft: boolean;
   /** Scoring type for the league */
   scoringType: string;
   /** Whether high score wins (vs head-to-head) */
   isHighscore: string;
   /** Who can invite new teams to the league */
   invitePermission: string;
   /** Persistent URL identifier for the league */
   persistentUrl: string;
   /** Whether the league uses playoffs */
   usesPlayoff: boolean;
   /** Whether playoff consolation brackets are used */
   hasPlayoffConsolationGames: boolean;
   /** Week number when playoffs start */
   playoffStartWeek: number;
   /** Whether playoff seeding is reseeded */
   usesPlayoffReseeding: boolean;
   /** Whether eliminated teams are locked */
   usesLockEliminatedTeams: boolean;
   /** Number of teams that make the playoffs */
   numPlayoffTeams: number;
   /** Number of teams in consolation brackets */
   numPlayoffConsolationTeams: number;
   /** Whether the championship is multi-week matchups */
   hasMultiweekChampionship: boolean;
   /** Waiver type (e.g., "faab", "continuous", "weekly") */
   waiverType: string;
   /** Waiver rule details */
   waiverRule: string;
   /** Whether the league uses FAAB (Free Agent Auction Budget) */
   usesFaab: boolean;
   /** Unix timestamp for the draft start time */
   draftTime: number;
   /** Seconds allowed per draft pick */
   draftPickTime: number;
   /** What happens to undrafted players */
   postDraftPlayers: string;
   /** Maximum number of teams in the league */
   maxTeams: number;
   /** Waiver processing time (false = daily, true = specific time) */
   waiverTime: boolean;
   /** Date when trades can no longer be made */
   tradeEndDate: string;
   /** Trade ratification method (e.g., "majority", "unanimous", "auto") */
   tradeRatifyType: string;
   /** Trade rejection timeout settings */
   tradeRejectTime: boolean;
   /** Which players are available (e.g., "waivers", "free_agents") */
   playerPool: string;
   /** Cannot cut list settings */
   cantCutList: string;
   /** Whether the entire draft happens together (vs staggered) */
   draftTogether: boolean;
   /** Whether the league is publicly viewable */
   isPubliclyViewable: boolean;
   /** Sendbird channel URL for league chat */
   sendbirdChannelUrl: string;
   /** Roster positions and requirements */
   rosterPositions: RosterPosition[];
   /** Available stat categories and groupings */
   statCategories: StatCategories;
   /** Point modifiers for each stat */
   statModifiers: StatModifiers;
   /** Maximum roster additions per week */
   maxWeeklyAdds: number;
   /** Whether median scoring is used */
   usesMedianScore: string;
   /** Premium features enabled for the league */
   leaguePremiumFeatures: string;
   /** Minimum games played requirement for player eligibility */
   minGamesPlayed: string;
   /** Whether each week has enough qualifying days (for daily sports) */
   weekHasEnoughQualifyingDays: { [key: `week${number}`]: boolean };
}

/**
 * Represents a roster position requirement.
 *
 * @interface RosterPosition
 * @description Defines how many players of a specific position must be rostered.
 */
export interface RosterPosition {
   /** Position code (e.g., "C", "LW", "RW", "D", "G", "UTIL") */
   position: string;
   /** Position type (P for players, G for goalies) */
   positionType?: PositionType;
   /** Number of players required for this position */
   count: number;
   /** Whether this is an active starting lineup position */
   isStartingPosition: boolean;
}

/** Position types for hockey: Players (P) and Goalies (G) */
export type PositionType = 'P' | 'G';

/**
 * Represents stat categories and their groupings.
 *
 * @interface StatCategories
 * @description Contains all available stat categories and how they're organized.
 */
export interface StatCategories {
   /** Individual stat definitions */
   stats: StatCategoriesStat[];
   /** Groupings of stats by category */
   groups: GroupElement[];
}

/**
 * Represents a group of related stats.
 *
 * @interface GroupElement
 * @description Organizes stats into logical categories.
 */
export interface GroupElement {
   /** Internal name of the group */
   groupName: GroupName;
   /** Display name for the group */
   groupDisplayName: string;
   /** Abbreviation for the group */
   groupAbbr: string;
}

/** Stat group categories */
export type GroupName = 'offense' | 'goaltending';

/**
 * Represents a single stat category definition.
 *
 * @interface StatCategoriesStat
 * @description Defines properties and scoring for a stat category.
 */
export interface StatCategoriesStat {
   /** Unique stat identifier */
   statId: number;
   /** Whether this stat is enabled in scoring */
   enabled: boolean;
   /** Internal name of the stat */
   name: string;
   /** Display name shown to users */
   displayName: string;
   /** Which group this stat belongs to */
   group: GroupName;
   /** Abbreviation for the stat */
   abbr: string;
   /** Sort order for this stat in displays */
   sortOrder: boolean;
   /** Position type this stat applies to */
   positionType: PositionType;
   /** Which position types can score this stat */
   statPositionTypes: StatPositionType[];
}

/**
 * Represents which position type(s) can score a stat.
 *
 * @interface StatPositionType
 * @description Maps a stat to the position types that score it.
 */
export interface StatPositionType {
   /** Position type that can score this stat */
   positionType: PositionType;
}

/**
 * Represents point modifiers for stats.
 *
 * @interface StatModifiers
 * @description Defines how stat values are multiplied or modified for scoring.
 */
export interface StatModifiers {
   /** Point values/modifiers for each stat */
   stats: TeamStatsStat[];
}

/**
 * Represents league standings.
 *
 * @interface Standings
 * @description Contains all teams ranked by their standings position.
 */
export interface Standings {
   /** Array of teams in standings order */
   teams: StandingsTeam[];
}

/**
 * Represents a team in the standings.
 *
 * @interface StandingsTeam
 * @description Contains team information with season-long statistics
 * and standings position.
 */
export interface StandingsTeam {
   /** Unique identifier for the team */
   teamKey: string;
   /** Numeric team identifier */
   teamId: number;
   /** Team name */
   name: string;
   /** URL to the team on Yahoo Fantasy Sports */
   url: string;
   /** Team logo images */
   teamLogos: TeamLogo[];
   /** Waiver priority for this team */
   waiverPriority: number;
   /** FAAB balance remaining */
   faabBalance: number;
   /** Number of roster moves made */
   numberOfMoves: number;
   /** Number of trades completed */
   numberOfTrades: number;
   /** Roster additions data */
   rosterAdds: RosterAdds;
   /** Scoring type for the league */
   leagueScoringType: string;
   /** Whether team has a draft grade */
   hasDraftGrade: boolean;
   /** Team managers */
   managers: Manager[];
   /** Season-long team stats (optional) */
   teamStats?: SeasonTeamStats;
   /** Season-long team points (optional) */
   teamPoints?: SeasonTeamPoints;
   /** Team's standings position and record (optional) */
   teamStandings?: TeamStandings;
}

/**
 * Represents a team's season-long points.
 *
 * @interface SeasonTeamPoints
 * @description Contains total points and individual stat values for the season.
 */
export interface SeasonTeamPoints {
   /** Coverage type (season) */
   coverageType: CoverageType;
   /** Season year */
   season: number;
   /** Total points for the season */
   total: number;
   /** Breakdown of points by stat category */
   stats: TeamPointsStat[];
}

/**
 * Represents points for a specific stat.
 *
 * @interface TeamPointsStat
 * @description A stat category with its point value.
 */
export interface TeamPointsStat {
   /** Stat category ID */
   statId: number;
   /** Points earned in this stat */
   value: string;
}

/**
 * Represents a team's standings position and record.
 *
 * @interface TeamStandings
 * @description Contains ranking, playoff information, and head-to-head record.
 */
export interface TeamStandings {
   /** Standing rank (1 = first place) */
   rank: number;
   /** Playoff seed if applicable */
   playoffSeed?: number;
   /** Win-loss-tie record summary */
   outcomeTotals: OutcomeTotals;
   /** Total points scored for the season */
   pointsFor: number;
   /** Total points allowed against */
   pointsAgainst: number;
}

/**
 * Represents a team's win-loss-tie record.
 *
 * @interface OutcomeTotals
 * @description Summarizes a team's competitive record.
 */
export interface OutcomeTotals {
   /** Number of wins */
   wins: number;
   /** Number of losses */
   losses: number;
   /** Number of tied matchups */
   ties: number;
   /** Win percentage (0-1 decimal) */
   percentage: number;
}

/**
 * Represents a team's season-long statistics.
 *
 * @interface SeasonTeamStats
 * @description Contains individual stat values accumulated over the season.
 */
export interface SeasonTeamStats {
   /** Coverage type (season) */
   coverageType: CoverageType;
   /** Season year */
   season: number;
   /** Individual stat values */
   stats: TeamStatsStat[];
}
