/**
 * Team resource types
 * @module
 */

import type { FeloTier, ImageSource } from '../common.js';
import type { Player } from './player.js';

/**
 * Represents a team in the Yahoo Fantasy Sports system.
 * Contains team information including managers, roster, standings,
 * and performance metrics within a fantasy league.
 */
export interface BaseTeam {
   /** Unique identifier for the team in format "gameId.l.leagueId.t.teamId" */
   teamKey: string;

   /** Numeric team identifier */
   teamId: number;

   /** Team name */
   name: string;

   /** URL to the team on Yahoo Fantasy Sports */
   url: string;

   /** Team logo images in different sizes */
   teamLogos: ImageSource[];

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
}

/**
 * Represents a fantasy team with extended data.
 * Extends BaseTeam with optional detailed sub-resources
 * like matchups, roster, standings, and stats.
 */
export interface Team extends BaseTeam {
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
 * Represents a single matchup (head-to-head competition) between two teams.
 * Contains detailed information about a matchup including teams,
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
   status: MatchupStatus;

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
   teams: MatchupTeam[];
}

/**
 * Represents a winner for a specific stat category in a matchup.
 * Shows which team won a particular stat category,
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
export type MatchupStatus = 'postevent' | 'midevent' | 'preevent';

/**
 * Represents a team's data within a matchup.
 * Contains all team information, players' stats, projections,
 * and manager details for a team in a specific matchup.
 */
export interface MatchupTeam extends BaseTeam {
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
 * Contains manager profile information and competitive ratings.
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
 * Tracks the number and timing of roster moves.
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
 * Contains points scored in a specific time period.
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
 * Represents remaining games for a team.
 * Tracks games yet to be played by the team's roster.
 */
export interface TeamRemainingGames {
   /** Coverage period type */
   coverageType: string;

   /** Week number */
   week: number;

   /** Breakdown of game counts */
   total: TotalGamesBreakdown;
}

/**
 * Represents game count totals.
 * Breaks down remaining, live, and completed game counts.
 */
export interface TotalGamesBreakdown {
   /** Number of games not yet started */
   remainingGames: number;

   /** Number of games currently in progress */
   liveGames: number;

   /** Number of games that have finished */
   completedGames: number;
}

/**
 * Represents a team's statistical performance.
 * Contains individual stat values for a team in a coverage period.
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
 * A key-value pair for a specific stat category.
 */
export interface TeamStatsStat {
   /** Stat category ID */
   statId: number;

   /** Value for this stat */
   value: number;
}

/**
 * Represents a team's roster.
 * Contains all players on a team's roster for a specific period.
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
 * Represents keeper status information for a player.
 * Contains keeper eligibility, cost, and historical keeper data.
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
 * Represents a team's season-long points.
 * Contains total points and individual stat values for the season.
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
 * A stat category with its point value.
 */
export interface TeamPointsStat {
   /** Stat category ID */
   statId: number;

   /** Points earned in this stat */
   value: string;
}

/**
 * Represents a team's standings position and record.
 * Contains ranking, playoff information, and head-to-head record.
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
 * Summarizes a team's competitive record.
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
 * Contains individual stat values accumulated over the season.
 */
export interface SeasonTeamStats {
   /** Coverage type (season) */
   coverageType: string;

   /** Season year */
   season: number;

   /** Individual stat values */
   stats: TeamStatsStat[];
}
