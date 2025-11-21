/**
 * Team resource types
 * @module
 */

/**
 * Represents a team in the Yahoo Fantasy Sports system.
 *
 * @interface Team
 * @description Contains team information including managers, roster, standings,
 * and performance metrics within a fantasy league.
 */
export interface Team {
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
   /** Team matchups (optional) */
   matchups?: Matchup[];
   /** Team roster (optional) */
   roster?: Roster;
   /** Team standings position and record (optional) */
   teamStandings?: TeamStandings;
   /** Team's season statistics (optional) */
   teamStats?: SeasonTeamStats;
   /** Team's season points (optional) */
   teamPoints?: SeasonTeamPoints;
}

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
   /** Status of the matchup (e.g., "preevent", "midevent", "postevent") */
   status: Status;
   /** Whether this matchup is in playoff rounds */
   isPlayoffs: boolean;
   /** Whether this is a consolation bracket matchup */
   isConsolation: boolean;
   /** Whether this is the "Matchup of the Week" */
   isMatchupOfTheWeek: boolean;
   /** Whether matchup is tied */
   isTied?: boolean;
   /** Team key of the matchup winner (if completed) */
   winnerTeamKey?: string;
   /** Individual stat winners for this matchup */
   statWinners?: StatWinner[];
   /** Teams competing in this matchup */
   teams: TeamElement[];
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
 * Matchup status type
 */
export type Status = 'postevent' | 'midevent' | 'preevent';

/**
 * Represents a team's data within a matchup.
 *
 * @interface TeamElement
 * @description Contains all team information, players' stats, projections,
 * and manager details for a team in a specific matchup.
 */
export interface TeamElement {
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
   /** Remaining FAAB balance */
   faabBalance: number;
   /** Number of roster moves made */
   numberOfMoves: number;
   /** Number of trades completed */
   numberOfTrades: number;
   /** Roster additions data */
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
   coverageType: string;
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
   coverageType: string;
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
   size: Size;
   /** URL to the logo image */
   url: string;
}

/**
 * Logo size type
 */
export type Size = 'large' | 'small';

/**
 * Represents remaining games for a team.
 *
 * @interface TeamRemainingGames
 * @description Tracks games yet to be played by the team's roster.
 */
export interface TeamRemainingGames {
   /** Coverage period type */
   coverageType: string;
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
   coverageType: string;
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
 * Represents a team's roster.
 *
 * @interface Roster
 * @description Contains all players on a team's roster for a specific period.
 */
export interface Roster {
   /** Coverage period type */
   coverageType: string;
   /** Date of the roster */
   date: string;
   /** Whether roster is in prescoring period */
   isPrescoring: boolean;
   /** Whether roster is editable */
   isEditable: boolean;
   /** Players on the roster */
   players: Player[];
   /** Minimum games requirement */
   minimumGames: RosterAdds;
}

/**
 * Represents a player on a team's roster.
 *
 * @interface Player
 * @description Contains player information including name, position, team affiliation,
 * keeper status, and performance metrics.
 */
export interface Player {
   /** Unique identifier for the player in format "gameId.p.playerId" */
   playerKey: string;
   /** Numeric player identifier */
   playerId: number;
   /** Player's full name and components */
   name: Name;
   /** URL to the player on Yahoo Fantasy Sports */
   url: string;
   /** Editorial player key from Yahoo */
   editorialPlayerKey: string;
   /** Editorial team key the player belongs to */
   editorialTeamKey: string;
   /** Full name of the real-world team */
   editorialTeamFullName: string;
   /** Abbreviation of the real-world team */
   editorialTeamAbbr: string;
   /** URL to the real-world team */
   editorialTeamUrl: string;
   /** Keeper status and information */
   isKeeper: IsKeeper;
   /** Uniform number for the player */
   uniformNumber: number;
   /** Display position (e.g., "C", "LW", "RW", "D", "G") */
   displayPosition: string;
   /** Player headshot image */
   headshot: TeamLogo;
   /** URL to player image */
   imageUrl: string;
   /** Whether this player cannot be dropped */
   isUndroppable: boolean;
   /** Position type (P for player positions, G for goalie) */
   positionType: PositionType;
   /** Primary position of the player */
   primaryPosition: PrimaryPositionElement;
   /** Positions this player is eligible for */
   eligiblePositions: EligiblePositions;
   /** Positions this player can be added to */
   eligiblePositionsToAdd: EligiblePositionsToAddClass | string;
   /** Whether this player has notes */
   hasPlayerNotes?: boolean;
   /** Unix timestamp of the last player note */
   playerNotesLastTimestamp?: number;
   /** Selected position for this player in roster */
   selectedPosition: SelectedPosition;
   /** Whether this player has recent notes */
   hasRecentPlayerNotes?: boolean;
   /** Starting status for current period */
   startingStatus?: StartingStatus;
   /** Player status (e.g., injury status) */
   status?: string;
   /** Full status description */
   statusFull?: string;
   /** Injury note or other status information */
   injuryNote?: string;
   /** Whether player is on disabled list */
   onDisabledList?: boolean;
}

/**
 * Container for eligible positions.
 *
 * @interface EligiblePositions
 * @description Wraps an array of position codes.
 */
export interface EligiblePositions {
   /** Array of position codes */
   position: PrimaryPositionElement[] | PrimaryPositionElement;
}

/**
 * Position element types for hockey.
 */
export type PrimaryPositionElement =
   | 'C'
   | 'LW'
   | 'RW'
   | 'D'
   | 'Util'
   | 'G'
   | 'BN'
   | 'IR+';

/**
 * Container for eligible positions to add.
 *
 * @interface EligiblePositionsToAddClass
 * @description Wraps an array of position codes that can be added.
 */
export interface EligiblePositionsToAddClass {
   /** Array of position codes */
   position: PrimaryPositionElement[];
}

/**
 * Represents keeper status information for a player.
 *
 * @interface IsKeeper
 * @description Contains keeper eligibility, cost, and historical keeper data.
 */
export interface IsKeeper {
   /** Keeper status (e.g., "eligible", "ineligible") */
   status: string;
   /** Cost to keep the player */
   cost: string;
   /** Whether player was kept */
   kept: string;
}

/**
 * Represents a player's name in various formats.
 *
 * @interface Name
 * @description Contains full name and component parts in ASCII and full character formats.
 */
export interface Name {
   /** Full name of the player */
   full: string;
   /** First name */
   first: string;
   /** Last name */
   last: string;
   /** ASCII version of first name */
   asciiFirst: string;
   /** ASCII version of last name */
   asciiLast: string;
}

/**
 * Position type code
 */
export type PositionType = 'P' | 'G';

/**
 * Represents a player's selected position in roster.
 *
 * @interface SelectedPosition
 * @description Contains the position assigned to a player for a specific period.
 */
export interface SelectedPosition {
   /** Coverage period type */
   coverageType: string;
   /** Date of the roster period */
   date: string;
   /** Position code for this roster period */
   position: PrimaryPositionElement;
   /** Whether position is a flex position */
   isFlex: boolean;
}

/**
 * Represents starting status for a player.
 *
 * @interface StartingStatus
 * @description Indicates if a player is in the starting lineup.
 */
export interface StartingStatus {
   /** Coverage period type */
   coverageType: string;
   /** Date of the roster period */
   date: string;
   /** Whether player is in starting lineup */
   isStarting: boolean;
}

/**
 * Represents a team's season-long points.
 *
 * @interface SeasonTeamPoints
 * @description Contains total points and individual stat values for the season.
 */
export interface SeasonTeamPoints {
   /** Coverage type (season) */
   coverageType: string;
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
   playoffSeed: number;
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
   coverageType: string;
   /** Season year */
   season: number;
   /** Individual stat values */
   stats: TeamStatsStat[];
}
