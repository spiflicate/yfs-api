/**
 * Team resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   Team,
   TeamManager,
   TeamStats,
   TeamStandings,
   TeamRoster,
   RosterPlayer,
   GetTeamParams,
   GetTeamRosterParams,
   GetTeamStatsParams,
   GetTeamMatchupsParams,
   RosterChangeRequest,
   RosterChangeResponse,
} from '../types/resources/team.js';
import type { ResourceKey } from '../types/common.js';

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
         fantasy_content: { team: Array<unknown> };
      }>(path);

      return this.parseTeam(response.fantasy_content.team);
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
         fantasy_content: { team: Array<unknown> };
      }>(path);

      const teamData = response.fantasy_content.team;
      const rosterObj = teamData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'roster' in item,
      );

      if (!rosterObj || !('roster' in rosterObj)) {
         throw new Error('Roster not found in response');
      }

      return this.parseRoster(
         (rosterObj.roster as Array<unknown>)[0] as Record<string, unknown>,
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
         fantasy_content: { team: Array<unknown> };
      }>(path);

      const teamData = response.fantasy_content.team;
      const statsObj = teamData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'team_stats' in item,
      );

      if (!statsObj || !('team_stats' in statsObj)) {
         throw new Error('Stats not found in response');
      }

      return this.parseStats(
         statsObj.team_stats as Record<string, unknown>,
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
         fantasy_content: { team: Array<unknown> };
      }>(path);

      const teamData = response.fantasy_content.team;
      const matchupsObj = teamData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'matchups' in item,
      );

      if (!matchupsObj || !('matchups' in matchupsObj)) {
         return [];
      }

      // TODO: Parse matchups properly
      return matchupsObj.matchups as unknown[];
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
            fantasy_content: { team: Array<unknown> };
         }>(path, undefined, {
            body: xml,
            headers: {
               'Content-Type': 'application/xml',
            },
         });

         const teamData = response.fantasy_content.team;
         const rosterObj = teamData.find(
            (item): item is Record<string, unknown> =>
               item !== null &&
               typeof item === 'object' &&
               'roster' in item,
         );

         const roster = rosterObj
            ? this.parseRoster(
                 (rosterObj.roster as Array<unknown>)[0] as Record<
                    string,
                    unknown
                 >,
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
   private parseTeam(teamData: Array<unknown>): Team {
      const teamObj: Record<string, unknown> = {};

      for (const item of teamData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(teamObj, item);
         }
      }

      const team: Team = {
         teamKey: teamObj.team_key as ResourceKey,
         teamId: teamObj.team_id as string,
         name: teamObj.name as string,
         isOwnedByCurrentLogin: teamObj.is_owned_by_current_login
            ? Boolean(Number(teamObj.is_owned_by_current_login))
            : undefined,
         league: {
            leagueKey:
               ((teamObj.league as Record<string, unknown>)
                  ?.league_key as string) || '',
            leagueId:
               ((teamObj.league as Record<string, unknown>)
                  ?.league_id as string) || '',
            name:
               ((teamObj.league as Record<string, unknown>)
                  ?.name as string) || '',
            url:
               ((teamObj.league as Record<string, unknown>)
                  ?.url as string) || '',
         },
         waiverPriority: teamObj.waiver_priority
            ? Number.parseInt(teamObj.waiver_priority as string)
            : undefined,
         numberOfMoves: teamObj.number_of_moves
            ? Number.parseInt(teamObj.number_of_moves as string)
            : undefined,
         numberOfTrades: teamObj.number_of_trades
            ? Number.parseInt(teamObj.number_of_trades as string)
            : undefined,
         faabBalance: teamObj.faab_balance
            ? Number.parseInt(teamObj.faab_balance as string)
            : undefined,
         clinchedPlayoffs: teamObj.clinched_playoffs
            ? Boolean(Number(teamObj.clinched_playoffs))
            : undefined,
         teamLogoUrl: teamObj.team_logo_url as string | undefined,
         url: teamObj.url as string,
      };

      // Parse managers
      if (teamObj.managers) {
         team.managers = [];
         const managersData = teamObj.managers as Record<string, unknown>;
         for (const key in managersData) {
            if (key === 'count') continue;
            const managerEntry = managersData[key];
            if (
               managerEntry &&
               typeof managerEntry === 'object' &&
               'manager' in managerEntry
            ) {
               const managerData = (
                  managerEntry as { manager: Record<string, unknown> }
               ).manager;
               team.managers.push(this.parseManager(managerData));
            }
         }
      }

      // Parse stats if included
      if (teamObj.team_stats) {
         team.stats = this.parseStats(
            teamObj.team_stats as Record<string, unknown>,
         );
      }

      // Parse standings if included
      if (teamObj.team_standings) {
         team.standings = this.parseStandings(
            teamObj.team_standings as Record<string, unknown>,
         );
      }

      // Parse roster if included
      if (teamObj.roster) {
         const rosterData = (teamObj.roster as Array<unknown>)[0];
         if (rosterData && typeof rosterData === 'object') {
            team.roster = this.parseRoster(
               rosterData as Record<string, unknown>,
            );
         }
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
            ? Boolean(Number(managerData.is_commissioner))
            : undefined,
         isCurrentLogin: managerData.is_current_login
            ? Boolean(Number(managerData.is_current_login))
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
         stats.season = Number.parseInt(statsData.season as string);
      }

      if (statsData.week) {
         stats.week = Number.parseInt(statsData.week as string);
      }

      if (statsData.date) {
         stats.date = statsData.date as string;
      }

      // Parse stats array
      if (statsData.stats) {
         const statsArray = statsData.stats as Record<string, unknown>;
         for (const key in statsArray) {
            if (key === 'count') continue;
            const statEntry = statsArray[key];
            if (
               statEntry &&
               typeof statEntry === 'object' &&
               'stat' in statEntry
            ) {
               const statData = (
                  statEntry as { stat: Record<string, unknown> }
               ).stat;
               const statId = Number.parseInt(statData.stat_id as string);
               stats.stats[statId] = statData.value as string | number;
            }
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
         rank: Number.parseInt(standingsData.rank as string),
      };

      if (standingsData.playoff_seed) {
         standings.playoffSeed = Number.parseInt(
            standingsData.playoff_seed as string,
         );
      }

      if (standingsData.outcome_totals) {
         const outcomes = standingsData.outcome_totals as Record<
            string,
            unknown
         >;
         standings.outcomeTotals = {
            wins: Number.parseInt(outcomes.wins as string),
            losses: Number.parseInt(outcomes.losses as string),
            ties: Number.parseInt(outcomes.ties as string),
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
            value: Number.parseInt(streak.value as string),
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
         roster.week = Number.parseInt(rosterData.week as string);
      }

      if (rosterData.is_editable !== undefined) {
         roster.isEditable = Boolean(Number(rosterData.is_editable));
      }

      // Parse players
      if (rosterData.players) {
         const playersData = rosterData.players as Record<string, unknown>;
         for (const key in playersData) {
            if (key === 'count') continue;
            const playerEntry = playersData[key];
            if (
               playerEntry &&
               typeof playerEntry === 'object' &&
               'player' in playerEntry
            ) {
               const playerData = (
                  playerEntry as { player: Array<unknown> }
               ).player;
               roster.players.push(this.parseRosterPlayer(playerData));
            }
         }
      }

      return roster;
   }

   /**
    * Parse roster player from API response
    *
    * @private
    */
   private parseRosterPlayer(playerData: Array<unknown>): RosterPlayer {
      const playerObj: Record<string, unknown> = {};

      for (const item of playerData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(playerObj, item);
         }
      }

      const player: RosterPlayer = {
         playerKey: playerObj.player_key as ResourceKey,
         playerId: playerObj.player_id as string,
         name: {
            full: (playerObj.name as Record<string, unknown>)
               .full as string,
            first: (playerObj.name as Record<string, unknown>)
               .first as string,
            last: (playerObj.name as Record<string, unknown>)
               .last as string,
            ascii: (playerObj.name as Record<string, unknown>).ascii as
               | string
               | undefined,
         },
         editorialPlayerKey: playerObj.editorial_player_key as
            | string
            | undefined,
         editorialTeamKey: playerObj.editorial_team_key as
            | string
            | undefined,
         editorialTeamFullName: playerObj.editorial_team_full_name as
            | string
            | undefined,
         editorialTeamAbbr: playerObj.editorial_team_abbr as
            | string
            | undefined,
         uniformNumber: playerObj.uniform_number as string | undefined,
         displayPosition: playerObj.display_position as string,
         headshotUrl: playerObj.headshot_url as string | undefined,
         imageUrl: playerObj.image_url as string | undefined,
         isUndroppable: playerObj.is_undroppable
            ? Boolean(Number(playerObj.is_undroppable))
            : undefined,
         positionType: playerObj.position_type as string | undefined,
         hasPlayerNotes: playerObj.has_player_notes
            ? Boolean(Number(playerObj.has_player_notes))
            : undefined,
         hasRecentPlayerNotes: playerObj.has_recent_player_notes
            ? Boolean(Number(playerObj.has_recent_player_notes))
            : undefined,
         selectedPosition: {
            position: '',
         },
         url: playerObj.url as string,
      };

      // Parse eligible positions
      if (playerObj.eligible_positions) {
         const positions: string[] = [];
         const positionsData = playerObj.eligible_positions as Record<
            string,
            unknown
         >;
         for (const key in positionsData) {
            if (key === 'count') continue;
            const posEntry = positionsData[key];
            if (
               posEntry &&
               typeof posEntry === 'object' &&
               'position' in posEntry
            ) {
               positions.push((posEntry as { position: string }).position);
            }
         }
         player.eligiblePositions = positions;
      }

      // Parse selected position
      if (playerObj.selected_position) {
         const selPosData = (
            playerObj.selected_position as Array<unknown>
         )[0] as Record<string, unknown>;
         player.selectedPosition = {
            position: selPosData.position as string,
            coverageType: selPosData.coverage_type as string | undefined,
            date: selPosData.date as string | undefined,
            week: selPosData.week
               ? Number.parseInt(selPosData.week as string)
               : undefined,
         };
      }

      // Parse player stats if included
      if (playerObj.player_stats) {
         const statsData = playerObj.player_stats as Record<
            string,
            unknown
         >;
         player.stats = {
            coverageType: statsData.coverage_type as string,
            season: statsData.season
               ? Number.parseInt(statsData.season as string)
               : undefined,
            week: statsData.week
               ? Number.parseInt(statsData.week as string)
               : undefined,
            date: statsData.date as string | undefined,
            stats: {},
         };

         if (statsData.stats) {
            const statsArray = statsData.stats as Record<string, unknown>;
            for (const key in statsArray) {
               if (key === 'count') continue;
               const statEntry = statsArray[key];
               if (
                  statEntry &&
                  typeof statEntry === 'object' &&
                  'stat' in statEntry
               ) {
                  const statData = (
                     statEntry as { stat: Record<string, unknown> }
                  ).stat;
                  const statId = Number.parseInt(
                     statData.stat_id as string,
                  );
                  player.stats.stats[statId] = statData.value as
                     | string
                     | number;
               }
            }
         }
      }

      return player;
   }
}
