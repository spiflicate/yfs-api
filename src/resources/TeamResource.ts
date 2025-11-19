/**
 * Team resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { ResourceKey } from '../types/common.js';
import type {
   GetTeamMatchupsParams,
   GetTeamParams,
   GetTeamRosterParams,
   GetTeamStatsParams,
   RosterChangeRequest,
   RosterChangeResponse,
   RosterPlayer,
   Team,
   TeamManager,
   TeamRoster,
   TeamStandings,
   TeamStats,
} from '../types/resources/team.js';
import { ensureArray, getBoolean, getInteger } from '../utils/xmlParser.js';

/**
 * Team resource client
 *
 * Provides methods to interact with Yahoo Fantasy team data
 *
 * @example
 * ```typescript
 * const teamClient = new TeamResource(httpClient);
 *
 * // Get team metadata
 * const team = await teamClient.get('423.l.12345.t.1');
 *
 * // Get team roster
 * const roster = await teamClient.getRoster('423.l.12345.t.1');
 *
 * // Update roster positions
 * await teamClient.updateRoster('423.l.12345.t.1', {
 *   coverageType: 'date',
 *   date: '2024-11-20',
 *   players: [
 *     { playerKey: '423.p.8888', position: 'C' },
 *     { playerKey: '423.p.7777', position: 'LW' },
 *   ],
 * });
 * ```
 */
export class TeamResource {
   private http: HttpClient;

   /**
    * Creates a new Team resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get team metadata and optionally stats, standings, or roster
    *
    * @param teamKey - Team key (e.g., "423.l.12345.t.1")
    * @param params - Optional parameters
    * @returns Team information
    *
    * @example
    * ```typescript
    * // Get basic team info
    * const team = await teamClient.get('423.l.12345.t.1');
    *
    * // Get team with roster
    * const teamWithRoster = await teamClient.get('423.l.12345.t.1', {
    *   includeRoster: true,
    * });
    *
    * // Get team with stats and standings
    * const fullTeam = await teamClient.get('423.l.12345.t.1', {
    *   includeStats: true,
    *   includeStandings: true,
    * });
    * ```
    */
   async get(teamKey: ResourceKey, params?: GetTeamParams): Promise<Team> {
      let path = `/team/${teamKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }
      if (params?.includeRoster) {
         subResources.push('roster');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         team: unknown;
      }>(path);

      return this.parseTeam(response.team);
   }

   /**
    * Get team roster for a specific date or week
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Team roster
    *
    * @example
    * ```typescript
    * // Get current roster
    * const roster = await teamClient.getRoster('423.l.12345.t.1');
    *
    * // Get roster for specific date (NHL)
    * const dateRoster = await teamClient.getRoster('423.l.12345.t.1', {
    *   date: '2024-11-20',
    * });
    *
    * // Get roster for specific week (NFL)
    * const weekRoster = await teamClient.getRoster('423.l.12345.t.1', {
    *   week: 10,
    * });
    *
    * // Get roster with player stats
    * const rosterWithStats = await teamClient.getRoster('423.l.12345.t.1', {
    *   includeStats: true,
    * });
    * ```
    */
   async getRoster(
      teamKey: ResourceKey,
      params?: GetTeamRosterParams,
   ): Promise<TeamRoster> {
      let path = `/team/${teamKey}/roster`;

      // Add date or week if specified
      if (params?.date) {
         path += `;date=${params.date}`;
      } else if (params?.week) {
         path += `;week=${params.week}`;
      }

      // Include player stats if requested
      if (params?.includeStats) {
         path += ';out=stats';
      }

      const response = await this.http.get<{
         team: { roster?: unknown };
      }>(path);

      if (!response.team.roster) {
         throw new Error('Roster not found in response');
      }

      return this.parseRoster(
         response.team.roster as Record<string, unknown>,
      );
   }

   /**
    * Get team stats
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Team stats
    *
    * @example
    * ```typescript
    * // Get season stats
    * const stats = await teamClient.getStats('423.l.12345.t.1');
    *
    * // Get stats for specific date
    * const dateStats = await teamClient.getStats('423.l.12345.t.1', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    * });
    *
    * // Get stats for specific week
    * const weekStats = await teamClient.getStats('423.l.12345.t.1', {
    *   coverageType: 'week',
    *   week: 10,
    * });
    * ```
    */
   async getStats(
      teamKey: ResourceKey,
      params?: GetTeamStatsParams,
   ): Promise<TeamStats> {
      let path = `/team/${teamKey}/stats`;

      if (params?.coverageType) {
         path += `;type=${params.coverageType}`;
      }

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      if (params?.date) {
         path += `;date=${params.date}`;
      }

      const response = await this.http.get<{
         team: { team_stats?: unknown };
      }>(path);

      if (!response.team.team_stats) {
         throw new Error('Stats not found in response');
      }

      return this.parseStats(
         response.team.team_stats as Record<string, unknown>,
      );
   }

   /**
    * Get team matchups
    *
    * @param teamKey - Team key
    * @param params - Optional parameters
    * @returns Array of matchups
    *
    * @example
    * ```typescript
    * // Get all matchups
    * const matchups = await teamClient.getMatchups('423.l.12345.t.1');
    *
    * // Get specific week matchup
    * const weekMatchup = await teamClient.getMatchups('423.l.12345.t.1', {
    *   weeks: 10,
    * });
    *
    * // Get multiple weeks
    * const multiWeek = await teamClient.getMatchups('423.l.12345.t.1', {
    *   weeks: [10, 11, 12],
    * });
    * ```
    */
   async getMatchups(
      teamKey: ResourceKey,
      params?: GetTeamMatchupsParams,
   ): Promise<unknown[]> {
      let path = `/team/${teamKey}/matchups`;

      if (params?.weeks) {
         const weeks = Array.isArray(params.weeks)
            ? params.weeks.join(',')
            : params.weeks;
         path += `;weeks=${weeks}`;
      }

      const response = await this.http.get<{
         team: { matchups?: unknown };
      }>(path);

      if (!response.team.matchups) {
         return [];
      }

      // TODO: Parse matchups properly
      return response.team.matchups as unknown[];
   }

   /**
    * Update team roster positions
    *
    * @param teamKey - Team key
    * @param request - Roster change request
    * @returns Roster change response
    *
    * @example
    * ```typescript
    * // Update roster for today (NHL)
    * await teamClient.updateRoster('423.l.12345.t.1', {
    *   coverageType: 'date',
    *   date: '2024-11-20',
    *   players: [
    *     { playerKey: '423.p.8888', position: 'C' },
    *     { playerKey: '423.p.7777', position: 'LW' },
    *     { playerKey: '423.p.6666', position: 'BN' },
    *   ],
    * });
    *
    * // Update roster for a week (NFL)
    * await teamClient.updateRoster('423.l.12345.t.1', {
    *   coverageType: 'week',
    *   week: 10,
    *   players: [
    *     { playerKey: '423.p.5555', position: 'QB' },
    *     { playerKey: '423.p.4444', position: 'RB' },
    *   ],
    * });
    * ```
    */
   async updateRoster(
      teamKey: ResourceKey,
      request: RosterChangeRequest,
   ): Promise<RosterChangeResponse> {
      let path = `/team/${teamKey}/roster`;

      // Add coverage type
      if (request.date) {
         path += `;date=${request.date}`;
      } else if (request.week) {
         path += `;week=${request.week}`;
      }

      // Build XML payload for roster changes
      const playersXml = request.players
         .map(
            (p) => `
			<player>
				<player_key>${p.playerKey}</player_key>
				<position>${p.position}</position>
			</player>`,
         )
         .join('');

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
	<roster>
		<coverage_type>${request.coverageType}</coverage_type>
		${request.date ? `<date>${request.date}</date>` : ''}
		${request.week ? `<week>${request.week}</week>` : ''}
		<players>
			${playersXml}
		</players>
	</roster>
</fantasy_content>`;

      try {
         const response = await this.http.put<{
            team: { roster?: unknown };
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const roster = response.team.roster
            ? this.parseRoster(
                 response.team.roster as Record<string, unknown>,
              )
            : undefined;

         return {
            success: true,
            teamKey,
            roster,
         };
      } catch (error) {
         return {
            success: false,
            teamKey,
            error: error instanceof Error ? error.message : 'Unknown error',
         };
      }
   }

   /**
    * Parse team data from API response
    *
    * @private
    */
   private parseTeam(teamData: unknown): Team {
      // XML structure is direct - no array flattening needed
      const data = teamData as Record<string, unknown>;
      const leagueData = (data.league as Record<string, unknown>) || {};

      const team: Team = {
         teamKey: data.team_key as ResourceKey,
         teamId: data.team_id as string,
         name: data.name as string,
         isOwnedByCurrentLogin: data.is_owned_by_current_login
            ? getBoolean(data.is_owned_by_current_login)
            : undefined,
         league: {
            leagueKey: (leagueData.league_key as string) || '',
            leagueId: (leagueData.league_id as string) || '',
            name: (leagueData.name as string) || '',
            url: (leagueData.url as string) || '',
         },
         waiverPriority: data.waiver_priority
            ? getInteger(data.waiver_priority)
            : undefined,
         numberOfMoves: data.number_of_moves
            ? getInteger(data.number_of_moves)
            : undefined,
         numberOfTrades: data.number_of_trades
            ? getInteger(data.number_of_trades)
            : undefined,
         faabBalance: data.faab_balance
            ? getInteger(data.faab_balance)
            : undefined,
         clinchedPlayoffs: data.clinched_playoffs
            ? getBoolean(data.clinched_playoffs)
            : undefined,
         teamLogoUrl: data.team_logo_url as string | undefined,
         url: data.url as string,
      };

      // Parse managers
      if (data.managers) {
         const managersData = data.managers as { manager: unknown };
         const managersArray = ensureArray(managersData.manager);
         team.managers = managersArray.map((mgr) =>
            this.parseManager(mgr as Record<string, unknown>),
         );
      }

      // Parse stats if included
      if (data.team_stats) {
         team.stats = this.parseStats(
            data.team_stats as Record<string, unknown>,
         );
      }

      // Parse standings if included
      if (data.team_standings) {
         team.standings = this.parseStandings(
            data.team_standings as Record<string, unknown>,
         );
      }

      // Parse roster if included
      if (data.roster) {
         team.roster = this.parseRoster(
            data.roster as Record<string, unknown>,
         );
      }

      return team;
   }

   /**
    * Parse manager data from API response
    *
    * @private
    */
   private parseManager(managerData: Record<string, unknown>): TeamManager {
      return {
         guid: managerData.guid as string,
         nickname: managerData.nickname as string,
         email: managerData.email as string | undefined,
         imageUrl: managerData.image_url as string | undefined,
         isCommissioner: managerData.is_commissioner
            ? getBoolean(managerData.is_commissioner)
            : undefined,
         isCurrentLogin: managerData.is_current_login
            ? getBoolean(managerData.is_current_login)
            : undefined,
      };
   }

   /**
    * Parse team stats from API response
    *
    * @private
    */
   private parseStats(statsData: Record<string, unknown>): TeamStats {
      const stats: TeamStats = {
         coverageType:
            (statsData.coverage_type as
               | 'season'
               | 'week'
               | 'date'
               | 'lastweek'
               | 'lastmonth') || 'season',
         stats: {},
      };

      if (statsData.season) {
         stats.season = getInteger(statsData.season);
      }

      if (statsData.week) {
         stats.week = getInteger(statsData.week);
      }

      if (statsData.date) {
         stats.date = statsData.date as string;
      }

      // Parse stats array
      if (statsData.stats) {
         const statsObj = statsData.stats as { stat: unknown };
         const statsArray = ensureArray(statsObj.stat);
         for (const statEntry of statsArray) {
            const statData = statEntry as Record<string, unknown>;
            const statId = getInteger(statData.stat_id);
            stats.stats[statId] = statData.value as string | number;
         }
      }

      return stats;
   }

   /**
    * Parse team standings from API response
    *
    * @private
    */
   private parseStandings(
      standingsData: Record<string, unknown>,
   ): TeamStandings {
      const standings: TeamStandings = {
         rank: getInteger(standingsData.rank),
      };

      if (standingsData.playoff_seed) {
         standings.playoffSeed = getInteger(standingsData.playoff_seed);
      }

      if (standingsData.outcome_totals) {
         const outcomes = standingsData.outcome_totals as Record<
            string,
            unknown
         >;
         standings.outcomeTotals = {
            wins: getInteger(outcomes.wins),
            losses: getInteger(outcomes.losses),
            ties: getInteger(outcomes.ties),
            percentage: Number.parseFloat(outcomes.percentage as string),
         };
      }

      if (standingsData.points_for) {
         standings.points = Number.parseFloat(
            standingsData.points_for as string,
         );
      }

      if (standingsData.points_change) {
         standings.pointsChange = Number.parseFloat(
            standingsData.points_change as string,
         );
      }

      if (standingsData.team_points) {
         const teamPoints = standingsData.team_points as Record<
            string,
            unknown
         >;
         standings.teamPoints = {
            total: Number.parseFloat(teamPoints.total as string),
         };
      }

      if (standingsData.streak) {
         const streak = standingsData.streak as Record<string, unknown>;
         standings.streak = {
            type: streak.type as 'win' | 'loss' | 'tie',
            value: getInteger(streak.value),
         };
      }

      return standings;
   }

   /**
    * Parse roster from API response
    *
    * @private
    */
   private parseRoster(rosterData: Record<string, unknown>): TeamRoster {
      const roster: TeamRoster = {
         players: [],
      };

      if (rosterData.coverage_type) {
         roster.coverageType = rosterData.coverage_type as
            | 'date'
            | 'week'
            | 'season';
      }

      if (rosterData.date) {
         roster.date = rosterData.date as string;
      }

      if (rosterData.week) {
         roster.week = getInteger(rosterData.week);
      }

      if (rosterData.is_editable !== undefined) {
         roster.isEditable = getBoolean(rosterData.is_editable);
      }

      // Parse players
      if (rosterData.players) {
         const playersData = rosterData.players as { player: unknown };
         const playersArray = ensureArray(playersData.player);
         roster.players = playersArray.map((player) =>
            this.parseRosterPlayer(player),
         );
      }

      return roster;
   }

   /**
    * Parse roster player from API response
    *
    * @private
    */
   private parseRosterPlayer(playerData: unknown): RosterPlayer {
      // XML structure is direct - no array flattening needed
      const data = playerData as Record<string, unknown>;
      const nameData = (data.name as Record<string, unknown>) || {};

      const player: RosterPlayer = {
         playerKey: data.player_key as ResourceKey,
         playerId: data.player_id as string,
         name: {
            full: (nameData.full as string) || '',
            first: (nameData.first as string) || '',
            last: (nameData.last as string) || '',
            ascii: nameData.ascii as string | undefined,
         },
         editorialPlayerKey: data.editorial_player_key as
            | string
            | undefined,
         editorialTeamKey: data.editorial_team_key as string | undefined,
         editorialTeamFullName: data.editorial_team_full_name as
            | string
            | undefined,
         editorialTeamAbbr: data.editorial_team_abbr as string | undefined,
         uniformNumber: data.uniform_number as string | undefined,
         displayPosition: data.display_position as string,
         headshotUrl: data.headshot_url as string | undefined,
         imageUrl: data.image_url as string | undefined,
         isUndroppable: data.is_undroppable
            ? getBoolean(data.is_undroppable)
            : undefined,
         positionType: data.position_type as string | undefined,
         hasPlayerNotes: data.has_player_notes
            ? getBoolean(data.has_player_notes)
            : undefined,
         hasRecentPlayerNotes: data.has_recent_player_notes
            ? getBoolean(data.has_recent_player_notes)
            : undefined,
         selectedPosition: {
            position: '',
         },
         url: data.url as string,
      };

      // Parse eligible positions
      if (data.eligible_positions) {
         const positionsData = data.eligible_positions as {
            position: unknown;
         };
         const positionsArray = ensureArray(positionsData.position);
         player.eligiblePositions = positionsArray.map(
            (pos) => pos as string,
         );
      }

      // Parse selected position
      if (data.selected_position) {
         const selPosData = data.selected_position as Record<
            string,
            unknown
         >;
         player.selectedPosition = {
            position: selPosData.position as string,
            coverageType: selPosData.coverage_type as string | undefined,
            date: selPosData.date as string | undefined,
            week: selPosData.week ? getInteger(selPosData.week) : undefined,
         };
      }

      // Parse player stats if included
      if (data.player_stats) {
         const statsData = data.player_stats as Record<string, unknown>;
         player.stats = {
            coverageType: statsData.coverage_type as string,
            season: statsData.season
               ? getInteger(statsData.season)
               : undefined,
            week: statsData.week ? getInteger(statsData.week) : undefined,
            date: statsData.date as string | undefined,
            stats: {},
         };

         if (statsData.stats) {
            const statsObj = statsData.stats as { stat: unknown };
            const statsArray = ensureArray(statsObj.stat);
            for (const statEntry of statsArray) {
               const statData = statEntry as Record<string, unknown>;
               const statId = getInteger(statData.stat_id);
               player.stats.stats[statId] = statData.value as
                  | string
                  | number;
            }
         }
      }

      return player;
   }
}
