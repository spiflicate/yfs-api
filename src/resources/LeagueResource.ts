/**
 * League resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   League,
   LeagueSettings,
   RosterPosition,
   StatCategory,
   StatModifier,
   LeagueStandings,
   StandingsTeam,
   LeagueScoreboard,
   Matchup,
   MatchupTeam,
   GetLeagueParams,
   GetLeagueStandingsParams,
   GetLeagueScoreboardParams,
   GetLeagueTeamsParams,
} from '../types/resources/league.js';
import type {
   ResourceKey,
   GameCode,
   ScoringType,
   DraftStatus,
} from '../types/common.js';
import type { Team } from '../types/resources/team.js';

/**
 * League resource client
 *
 * Provides methods to interact with Yahoo Fantasy league data
 *
 * @example
 * ```typescript
 * const leagueClient = new LeagueResource(httpClient);
 *
 * // Get league metadata
 * const league = await leagueClient.get('423.l.12345');
 *
 * // Get league standings
 * const standings = await leagueClient.getStandings('423.l.12345');
 *
 * // Get league scoreboard
 * const scoreboard = await leagueClient.getScoreboard('423.l.12345');
 * ```
 */
export class LeagueResource {
   private http: HttpClient;

   /**
    * Creates a new League resource client
    *
    * @param httpClient - HTTP client instance
    */
   constructor(httpClient: HttpClient) {
      this.http = httpClient;
   }

   /**
    * Get league metadata and optionally settings, standings, or scoreboard
    *
    * @param leagueKey - League key (e.g., "423.l.12345")
    * @param params - Optional parameters
    * @returns League information
    *
    * @example
    * ```typescript
    * // Get basic league info
    * const league = await leagueClient.get('423.l.12345');
    *
    * // Get league with settings
    * const leagueWithSettings = await leagueClient.get('423.l.12345', {
    *   includeSettings: true,
    * });
    *
    * // Get league with standings and scoreboard
    * const fullLeague = await leagueClient.get('423.l.12345', {
    *   includeSettings: true,
    *   includeStandings: true,
    *   includeScoreboard: true,
    * });
    * ```
    */
   async get(
      leagueKey: ResourceKey,
      params?: GetLeagueParams,
   ): Promise<League> {
      let path = `/league/${leagueKey}`;

      // Build sub-resources to include
      const subResources: string[] = [];
      if (params?.includeSettings) {
         subResources.push('settings');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }
      if (params?.includeScoreboard) {
         subResources.push('scoreboard');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         fantasy_content: { league: Array<unknown> };
      }>(path);

      return this.parseLeague(response.fantasy_content.league);
   }

   /**
    * Get league settings
    *
    * @param leagueKey - League key
    * @returns League settings
    *
    * @example
    * ```typescript
    * const settings = await leagueClient.getSettings('423.l.12345');
    * console.log(settings.rosterPositions);
    * console.log(settings.statCategories);
    * ```
    */
   async getSettings(leagueKey: ResourceKey): Promise<LeagueSettings> {
      const response = await this.http.get<{
         fantasy_content: { league: Array<unknown> };
      }>(`/league/${leagueKey}/settings`);

      const leagueData = response.fantasy_content.league;
      const settingsObj = leagueData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'settings' in item,
      );

      if (!settingsObj || !('settings' in settingsObj)) {
         throw new Error('Settings not found in response');
      }

      return this.parseSettings(
         (settingsObj.settings as Array<unknown>)[0] as Record<
            string,
            unknown
         >,
      );
   }

   /**
    * Get league standings
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns League standings
    *
    * @example
    * ```typescript
    * const standings = await leagueClient.getStandings('423.l.12345');
    * for (const team of standings.teams) {
    *   console.log(`${team.rank}. ${team.name} - ${team.outcomeTotals?.wins}W ${team.outcomeTotals?.losses}L`);
    * }
    * ```
    */
   async getStandings(
      leagueKey: ResourceKey,
      params?: GetLeagueStandingsParams,
   ): Promise<LeagueStandings> {
      let path = `/league/${leagueKey}/standings`;

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      const response = await this.http.get<{
         fantasy_content: { league: Array<unknown> };
      }>(path);

      const leagueData = response.fantasy_content.league;
      const standingsObj = leagueData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'standings' in item,
      );

      if (!standingsObj || !('standings' in standingsObj)) {
         throw new Error('Standings not found in response');
      }

      return this.parseStandings(
         (standingsObj.standings as Array<unknown>)[0] as Record<
            string,
            unknown
         >,
      );
   }

   /**
    * Get league scoreboard
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns League scoreboard with matchups
    *
    * @example
    * ```typescript
    * const scoreboard = await leagueClient.getScoreboard('423.l.12345');
    * for (const matchup of scoreboard.matchups) {
    *   const team1 = matchup.teams[0];
    *   const team2 = matchup.teams[1];
    *   console.log(`${team1.name} (${team1.points}) vs ${team2.name} (${team2.points})`);
    * }
    * ```
    */
   async getScoreboard(
      leagueKey: ResourceKey,
      params?: GetLeagueScoreboardParams,
   ): Promise<LeagueScoreboard> {
      let path = `/league/${leagueKey}/scoreboard`;

      if (params?.week) {
         path += `;week=${params.week}`;
      }

      const response = await this.http.get<{
         fantasy_content: { league: Array<unknown> };
      }>(path);

      const leagueData = response.fantasy_content.league;
      const scoreboardObj = leagueData.find(
         (item): item is Record<string, unknown> =>
            item !== null &&
            typeof item === 'object' &&
            'scoreboard' in item,
      );

      if (!scoreboardObj || !('scoreboard' in scoreboardObj)) {
         throw new Error('Scoreboard not found in response');
      }

      return this.parseScoreboard(
         (scoreboardObj.scoreboard as Array<unknown>)[0] as Record<
            string,
            unknown
         >,
      );
   }

   /**
    * Get teams in the league
    *
    * @param leagueKey - League key
    * @param params - Optional parameters
    * @returns Array of teams
    *
    * @example
    * ```typescript
    * // Get all teams
    * const teams = await leagueClient.getTeams('423.l.12345');
    *
    * // Get teams with pagination
    * const firstFive = await leagueClient.getTeams('423.l.12345', {
    *   start: 0,
    *   count: 5,
    * });
    * ```
    */
   async getTeams(
      leagueKey: ResourceKey,
      params?: GetLeagueTeamsParams,
   ): Promise<Team[]> {
      let path = `/league/${leagueKey}/teams`;

      const queryParams: string[] = [];
      if (params?.start !== undefined) {
         queryParams.push(`start=${params.start}`);
      }
      if (params?.count !== undefined) {
         queryParams.push(`count=${params.count}`);
      }

      if (queryParams.length > 0) {
         path += `;${queryParams.join(';')}`;
      }

      const subResources: string[] = [];
      if (params?.includeStats) {
         subResources.push('stats');
      }
      if (params?.includeStandings) {
         subResources.push('standings');
      }

      if (subResources.length > 0) {
         path += `;out=${subResources.join(',')}`;
      }

      const response = await this.http.get<{
         fantasy_content: { league: Array<unknown> };
      }>(path);

      const leagueData = response.fantasy_content.league;
      const teamsObj = leagueData.find(
         (item): item is Record<string, unknown> =>
            item !== null && typeof item === 'object' && 'teams' in item,
      );

      if (!teamsObj || !('teams' in teamsObj)) {
         return [];
      }

      const teams: Team[] = [];
      const teamsData = teamsObj.teams as Record<string, unknown>;

      for (const key in teamsData) {
         if (key === 'count') continue;
         const teamEntry = teamsData[key];
         if (
            teamEntry &&
            typeof teamEntry === 'object' &&
            'team' in teamEntry
         ) {
            const team = this.parseTeam(
               (teamEntry as { team: Array<unknown> }).team,
            );
            teams.push(team);
         }
      }

      return teams;
   }

   /**
    * Parse league data from API response
    *
    * @private
    */
   private parseLeague(leagueData: Array<unknown>): League {
      const leagueObj: Record<string, unknown> = {};

      for (const item of leagueData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(leagueObj, item);
         }
      }

      const league: League = {
         leagueKey: leagueObj.league_key as ResourceKey,
         leagueId: leagueObj.league_id as string,
         name: leagueObj.name as string,
         gameKey: leagueObj.game_key as string,
         gameCode: leagueObj.game_code as GameCode,
         season: Number.parseInt(leagueObj.season as string),
         scoringType: leagueObj.scoring_type as ScoringType,
         leagueType: leagueObj.league_type as 'private' | 'public',
         numberOfTeams: Number.parseInt(leagueObj.num_teams as string),
         currentWeek: Number.parseInt(leagueObj.current_week as string),
         startWeek: leagueObj.start_week
            ? Number.parseInt(leagueObj.start_week as string)
            : undefined,
         endWeek: leagueObj.end_week
            ? Number.parseInt(leagueObj.end_week as string)
            : undefined,
         startDate: leagueObj.start_date as string | undefined,
         endDate: leagueObj.end_date as string | undefined,
         draftStatus: leagueObj.draft_status as DraftStatus,
         isFinished: Boolean(Number(leagueObj.is_finished)),
         logoUrl: leagueObj.logo_url as string | undefined,
         password: leagueObj.password as string | undefined,
         renewUrl: leagueObj.renew as string | undefined,
         shortInvitationUrl: leagueObj.short_invitation_url as
            | string
            | undefined,
         isProLeague: leagueObj.is_pro_league
            ? Boolean(Number(leagueObj.is_pro_league))
            : undefined,
         isCashLeague: leagueObj.is_cash_league
            ? Boolean(Number(leagueObj.is_cash_league))
            : undefined,
         url: leagueObj.url as string,
      };

      // Parse settings if included
      if (leagueObj.settings) {
         const settingsData = (leagueObj.settings as Array<unknown>)[0];
         if (settingsData && typeof settingsData === 'object') {
            league.settings = this.parseSettings(
               settingsData as Record<string, unknown>,
            );
         }
      }

      // Parse standings if included
      if (leagueObj.standings) {
         const standingsData = (leagueObj.standings as Array<unknown>)[0];
         if (standingsData && typeof standingsData === 'object') {
            league.standings = this.parseStandings(
               standingsData as Record<string, unknown>,
            );
         }
      }

      // Parse scoreboard if included
      if (leagueObj.scoreboard) {
         const scoreboardData = (leagueObj.scoreboard as Array<unknown>)[0];
         if (scoreboardData && typeof scoreboardData === 'object') {
            league.scoreboard = this.parseScoreboard(
               scoreboardData as Record<string, unknown>,
            );
         }
      }

      return league;
   }

   /**
    * Parse league settings from API response
    *
    * @private
    */
   private parseSettings(
      settingsData: Record<string, unknown>,
   ): LeagueSettings {
      const settings: LeagueSettings = {
         draftType: settingsData.draft_type as
            | 'live'
            | 'offline'
            | 'autopick',
         isAuctionDraft: Boolean(Number(settingsData.is_auction_draft)),
         scoringType: settingsData.scoring_type as ScoringType,
         usesPlayoff: Boolean(Number(settingsData.uses_playoff)),
         usesPlayoffReseeding: settingsData.uses_playoff_reseeding
            ? Boolean(Number(settingsData.uses_playoff_reseeding))
            : undefined,
         usesLockEliminatedTeams: settingsData.uses_lock_eliminated_teams
            ? Boolean(Number(settingsData.uses_lock_eliminated_teams))
            : undefined,
         playoffStartWeek: settingsData.playoff_start_week
            ? Number.parseInt(settingsData.playoff_start_week as string)
            : undefined,
         numberOfPlayoffTeams: settingsData.num_playoff_teams
            ? Number.parseInt(settingsData.num_playoff_teams as string)
            : undefined,
         hasPlayoffConsolationGames:
            settingsData.has_playoff_consolation_games
               ? Boolean(Number(settingsData.has_playoff_consolation_games))
               : undefined,
         maxTeams: Number.parseInt(settingsData.max_teams as string),
         waiverType: settingsData.waiver_type as
            | 'FR'
            | 'FCFS'
            | 'continual'
            | 'gametime',
         waiverRule: settingsData.waiver_rule as
            | 'all'
            | 'gametime'
            | undefined,
         usesFaab: Boolean(Number(settingsData.uses_faab)),
         draftTime: settingsData.draft_time
            ? Number.parseInt(settingsData.draft_time as string)
            : undefined,
         postDraftPlayers: settingsData.post_draft_players as
            | 'W'
            | 'FA'
            | undefined,
         maxWeeklyAdds: settingsData.max_weekly_adds
            ? Number.parseInt(settingsData.max_weekly_adds as string)
            : undefined,
         maxSeasonAdds: settingsData.max_season_adds
            ? Number.parseInt(settingsData.max_season_adds as string)
            : undefined,
         tradeEndDate: settingsData.trade_end_date as string | undefined,
         tradeRatifyType: settingsData.trade_ratify_type as
            | 'commish'
            | 'vote'
            | 'no_review'
            | undefined,
         tradeRejectTime: settingsData.trade_reject_time
            ? Number.parseInt(settingsData.trade_reject_time as string)
            : undefined,
         playerPool: settingsData.player_pool as 'ALL' | 'nhl' | undefined,
         cantCutList: settingsData.cant_cut_list as
            | 'yahoo'
            | 'none'
            | undefined,
      };

      // Parse roster positions
      if (settingsData.roster_positions) {
         const rosterPositions: RosterPosition[] = [];
         const positionsData = settingsData.roster_positions as Record<
            string,
            unknown
         >;

         for (const key in positionsData) {
            if (key === 'count') continue;
            const posEntry = positionsData[key];
            if (
               posEntry &&
               typeof posEntry === 'object' &&
               'roster_position' in posEntry
            ) {
               const posData = (
                  posEntry as { roster_position: Record<string, unknown> }
               ).roster_position;
               rosterPositions.push({
                  position: posData.position as string,
                  positionType: posData.position_type as string,
                  count: Number.parseInt(posData.count as string),
                  displayName: posData.display_name as string | undefined,
                  abbreviation: posData.abbreviation as string | undefined,
               });
            }
         }
         settings.rosterPositions = rosterPositions;
      }

      // Parse stat categories
      if (settingsData.stat_categories) {
         const statCategories: StatCategory[] = [];
         const statsData = (
            settingsData.stat_categories as Record<string, unknown>
         ).stats as Record<string, unknown>;

         for (const key in statsData) {
            if (key === 'count') continue;
            const statEntry = statsData[key];
            if (
               statEntry &&
               typeof statEntry === 'object' &&
               'stat' in statEntry
            ) {
               const statData = (
                  statEntry as { stat: Record<string, unknown> }
               ).stat;
               statCategories.push({
                  statId: Number.parseInt(statData.stat_id as string),
                  enabled: Boolean(Number(statData.enabled)),
                  name: statData.name as string,
                  displayOrder: statData.display_order
                     ? Number.parseInt(statData.display_order as string)
                     : undefined,
                  sortOrder: statData.sort_order
                     ? Number.parseInt(statData.sort_order as string)
                     : undefined,
                  positionType: statData.position_type as
                     | string
                     | undefined,
               });
            }
         }
         settings.statCategories = statCategories;
      }

      // Parse stat modifiers (for points leagues)
      if (settingsData.stat_modifiers) {
         const statModifiers: StatModifier[] = [];
         const modifiersData = (
            settingsData.stat_modifiers as Record<string, unknown>
         ).stats as Record<string, unknown>;

         for (const key in modifiersData) {
            if (key === 'count') continue;
            const modEntry = modifiersData[key];
            if (
               modEntry &&
               typeof modEntry === 'object' &&
               'stat' in modEntry
            ) {
               const modData = (
                  modEntry as { stat: Record<string, unknown> }
               ).stat;
               statModifiers.push({
                  statId: Number.parseInt(modData.stat_id as string),
                  points: Number.parseFloat(modData.value as string),
               });
            }
         }
         settings.statModifiers = statModifiers;
      }

      return settings;
   }

   /**
    * Parse standings from API response
    *
    * @private
    */
   private parseStandings(
      standingsData: Record<string, unknown>,
   ): LeagueStandings {
      const teams: StandingsTeam[] = [];
      const teamsData = standingsData.teams as Record<string, unknown>;

      for (const key in teamsData) {
         if (key === 'count') continue;
         const teamEntry = teamsData[key];
         if (
            teamEntry &&
            typeof teamEntry === 'object' &&
            'team' in teamEntry
         ) {
            const teamData = (teamEntry as { team: Array<unknown> }).team;
            teams.push(this.parseStandingsTeam(teamData));
         }
      }

      return { teams };
   }

   /**
    * Parse standings team from API response
    *
    * @private
    */
   private parseStandingsTeam(teamData: Array<unknown>): StandingsTeam {
      const teamObj: Record<string, unknown> = {};

      for (const item of teamData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(teamObj, item);
         }
      }

      const team: StandingsTeam = {
         teamKey: teamObj.team_key as ResourceKey,
         teamId: teamObj.team_id as string,
         name: teamObj.name as string,
         teamLogoUrl: teamObj.team_logo_url as string | undefined,
         rank: Number.parseInt(
            (teamObj.team_standings as Record<string, unknown>)
               .rank as string,
         ),
         url: teamObj.url as string,
      };

      const standings = teamObj.team_standings as Record<string, unknown>;

      if (standings.playoff_seed) {
         team.playoffSeed = Number.parseInt(
            standings.playoff_seed as string,
         );
      }

      if (standings.outcome_totals) {
         const outcomes = standings.outcome_totals as Record<
            string,
            unknown
         >;
         team.outcomeTotals = {
            wins: Number.parseInt(outcomes.wins as string),
            losses: Number.parseInt(outcomes.losses as string),
            ties: Number.parseInt(outcomes.ties as string),
            percentage: Number.parseFloat(outcomes.percentage as string),
         };
      }

      if (standings.points_for) {
         team.points = Number.parseFloat(standings.points_for as string);
      }

      if (standings.team_points) {
         const teamPoints = standings.team_points as Record<
            string,
            unknown
         >;
         team.teamPoints = {
            total: Number.parseFloat(teamPoints.total as string),
         };
      }

      if (standings.streak) {
         const streak = standings.streak as Record<string, unknown>;
         team.streak = {
            type: streak.type as 'win' | 'loss' | 'tie',
            value: Number.parseInt(streak.value as string),
         };
      }

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
               team.managers.push({
                  guid: managerData.guid as string,
                  nickname: managerData.nickname as string,
               });
            }
         }
      }

      return team;
   }

   /**
    * Parse scoreboard from API response
    *
    * @private
    */
   private parseScoreboard(
      scoreboardData: Record<string, unknown>,
   ): LeagueScoreboard {
      const scoreboard: LeagueScoreboard = {
         week: scoreboardData.week
            ? Number.parseInt(scoreboardData.week as string)
            : undefined,
         matchups: [],
      };

      const matchupsData = scoreboardData.matchups as Record<
         string,
         unknown
      >;

      for (const key in matchupsData) {
         if (key === 'count') continue;
         const matchupEntry = matchupsData[key];
         if (
            matchupEntry &&
            typeof matchupEntry === 'object' &&
            'matchup' in matchupEntry
         ) {
            const matchupData = (
               matchupEntry as { matchup: Record<string, unknown> }
            ).matchup;
            scoreboard.matchups.push(this.parseMatchup(matchupData));
         }
      }

      return scoreboard;
   }

   /**
    * Parse matchup from API response
    *
    * @private
    */
   private parseMatchup(matchupData: Record<string, unknown>): Matchup {
      const matchup: Matchup = {
         week: matchupData.week
            ? Number.parseInt(matchupData.week as string)
            : undefined,
         matchupGrade: matchupData.matchup_grade as string | undefined,
         winnerTeamKey: matchupData.winner_team_key as
            | ResourceKey
            | undefined,
         isTied: matchupData.is_tied
            ? Boolean(Number(matchupData.is_tied))
            : undefined,
         isPlayoffs: matchupData.is_playoffs
            ? Boolean(Number(matchupData.is_playoffs))
            : undefined,
         isConsolation: matchupData.is_consolation
            ? Boolean(Number(matchupData.is_consolation))
            : undefined,
         teams: [],
      };

      const teamsData = matchupData.teams as Record<string, unknown>;

      for (const key in teamsData) {
         if (key === 'count') continue;
         const teamEntry = teamsData[key];
         if (
            teamEntry &&
            typeof teamEntry === 'object' &&
            'team' in teamEntry
         ) {
            const teamData = (teamEntry as { team: Array<unknown> }).team;
            matchup.teams.push(this.parseMatchupTeam(teamData));
         }
      }

      return matchup;
   }

   /**
    * Parse matchup team from API response
    *
    * @private
    */
   private parseMatchupTeam(teamData: Array<unknown>): MatchupTeam {
      const teamObj: Record<string, unknown> = {};

      for (const item of teamData) {
         if (item !== null && typeof item === 'object') {
            Object.assign(teamObj, item);
         }
      }

      const team: MatchupTeam = {
         teamKey: teamObj.team_key as ResourceKey,
         teamId: teamObj.team_id as string,
         name: teamObj.name as string,
         teamLogoUrl: teamObj.team_logo_url as string | undefined,
         url: teamObj.url as string,
      };

      if (teamObj.team_points) {
         const teamPoints = teamObj.team_points as Record<string, unknown>;
         team.points = Number.parseFloat(teamPoints.total as string);
      }

      if (teamObj.team_projected_points) {
         const projectedPoints = teamObj.team_projected_points as Record<
            string,
            unknown
         >;
         team.projectedPoints = Number.parseFloat(
            projectedPoints.total as string,
         );
      }

      if (teamObj.team_stats) {
         team.stats = [];
         const statsData = (teamObj.team_stats as Record<string, unknown>)
            .stats as Record<string, unknown>;

         for (const key in statsData) {
            if (key === 'count') continue;
            const statEntry = statsData[key];
            if (
               statEntry &&
               typeof statEntry === 'object' &&
               'stat' in statEntry
            ) {
               const statData = (
                  statEntry as { stat: Record<string, unknown> }
               ).stat;
               team.stats.push({
                  statId: Number.parseInt(statData.stat_id as string),
                  value: statData.value as string | number,
               });
            }
         }
      }

      return team;
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

      return team;
   }
}
