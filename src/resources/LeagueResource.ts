/**
 * League resource client for Yahoo Fantasy Sports API
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type {
   DraftStatus,
   GameCode,
   ResourceKey,
   ScoringType,
} from '../types/common.js';
import type {
   GetLeagueParams,
   GetLeagueScoreboardParams,
   GetLeagueStandingsParams,
   GetLeagueTeamsParams,
   League,
   LeagueScoreboard,
   LeagueSettings,
   LeagueStandings,
   Matchup,
   MatchupTeam,
   StandingsTeam,
} from '../types/resources/league.js';
import type { Team } from '../types/resources/team.js';
import { ensureArray, getBoolean, getInteger } from '../utils/xmlParser.js';

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
         league: unknown;
      }>(path);

      return this.parseLeague(response.league);
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
         league: { settings?: unknown };
      }>(`/league/${leagueKey}/settings`);

      if (!response.league.settings) {
         throw new Error('Settings not found in response');
      }

      return this.parseSettings(
         response.league.settings as Record<string, unknown>,
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
         league: { standings?: unknown };
      }>(path);

      if (!response.league.standings) {
         throw new Error('Standings not found in response');
      }

      return this.parseStandings(
         response.league.standings as Record<string, unknown>,
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
         league: { scoreboard?: unknown };
      }>(path);

      if (!response.league.scoreboard) {
         throw new Error('Scoreboard not found in response');
      }

      return this.parseScoreboard(
         response.league.scoreboard as Record<string, unknown>,
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
         league: { teams?: { team: unknown } };
      }>(path);

      if (!response.league.teams?.team) {
         return [];
      }

      const teamsArray = ensureArray(response.league.teams.team);
      return teamsArray.map((team) => this.parseTeam(team));
   }

   /**
    * Parse league data from API response
    *
    * @private
    */
   private parseLeague(leagueData: unknown): League {
      // XML structure is direct - no array flattening needed
      const data = leagueData as Record<string, unknown>;

      const league: League = {
         leagueKey: data.league_key as ResourceKey,
         leagueId: data.league_id as string,
         name: data.name as string,
         gameKey: data.game_key as string,
         gameCode: data.game_code as GameCode,
         season: getInteger(data.season),
         scoringType: data.scoring_type as ScoringType,
         leagueType: data.league_type as 'private' | 'public',
         numberOfTeams: getInteger(data.num_teams),
         currentWeek: getInteger(data.current_week),
         startWeek: data.start_week
            ? getInteger(data.start_week)
            : undefined,
         endWeek: data.end_week ? getInteger(data.end_week) : undefined,
         startDate: data.start_date as string | undefined,
         endDate: data.end_date as string | undefined,
         draftStatus: data.draft_status as DraftStatus,
         isFinished: getBoolean(data.is_finished),
         logoUrl: data.logo_url as string | undefined,
         password: data.password as string | undefined,
         renewUrl: data.renew as string | undefined,
         shortInvitationUrl: data.short_invitation_url as
            | string
            | undefined,
         isProLeague: data.is_pro_league
            ? getBoolean(data.is_pro_league)
            : undefined,
         isCashLeague: data.is_cash_league
            ? getBoolean(data.is_cash_league)
            : undefined,
         url: data.url as string,
      };

      // Parse settings if included
      if (data.settings) {
         league.settings = this.parseSettings(
            data.settings as Record<string, unknown>,
         );
      }

      // Parse standings if included
      if (data.standings) {
         league.standings = this.parseStandings(
            data.standings as Record<string, unknown>,
         );
      }

      // Parse scoreboard if included
      if (data.scoreboard) {
         league.scoreboard = this.parseScoreboard(
            data.scoreboard as Record<string, unknown>,
         );
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
         isAuctionDraft: getBoolean(settingsData.is_auction_draft),
         scoringType: settingsData.scoring_type as ScoringType,
         usesPlayoff: getBoolean(settingsData.uses_playoff),
         usesPlayoffReseeding: settingsData.uses_playoff_reseeding
            ? getBoolean(settingsData.uses_playoff_reseeding)
            : undefined,
         usesLockEliminatedTeams: settingsData.uses_lock_eliminated_teams
            ? getBoolean(settingsData.uses_lock_eliminated_teams)
            : undefined,
         playoffStartWeek: settingsData.playoff_start_week
            ? getInteger(settingsData.playoff_start_week)
            : undefined,
         numberOfPlayoffTeams: settingsData.num_playoff_teams
            ? getInteger(settingsData.num_playoff_teams)
            : undefined,
         hasPlayoffConsolationGames:
            settingsData.has_playoff_consolation_games
               ? getBoolean(settingsData.has_playoff_consolation_games)
               : undefined,
         maxTeams: getInteger(settingsData.max_teams),
         waiverType: settingsData.waiver_type as
            | 'FR'
            | 'FCFS'
            | 'continual'
            | 'gametime',
         waiverRule: settingsData.waiver_rule as
            | 'all'
            | 'gametime'
            | undefined,
         usesFaab: getBoolean(settingsData.uses_faab),
         draftTime: settingsData.draft_time
            ? getInteger(settingsData.draft_time)
            : undefined,
         postDraftPlayers: settingsData.post_draft_players as
            | 'W'
            | 'FA'
            | undefined,
         maxWeeklyAdds: settingsData.max_weekly_adds
            ? getInteger(settingsData.max_weekly_adds)
            : undefined,
         maxSeasonAdds: settingsData.max_season_adds
            ? getInteger(settingsData.max_season_adds)
            : undefined,
         tradeEndDate: settingsData.trade_end_date as string | undefined,
         tradeRatifyType: settingsData.trade_ratify_type as
            | 'commish'
            | 'vote'
            | 'no_review'
            | undefined,
         tradeRejectTime: settingsData.trade_reject_time
            ? getInteger(settingsData.trade_reject_time)
            : undefined,
         playerPool: settingsData.player_pool as 'ALL' | 'nhl' | undefined,
         cantCutList: settingsData.cant_cut_list as
            | 'yahoo'
            | 'none'
            | undefined,
      };

      // Parse roster positions
      if (settingsData.roster_positions) {
         const positionsData = settingsData.roster_positions as {
            roster_position: unknown;
         };
         const positionsArray = ensureArray(positionsData.roster_position);
         settings.rosterPositions = positionsArray.map(
            (posEntry: unknown) => {
               const posData = posEntry as Record<string, unknown>;
               return {
                  position: posData.position as string,
                  positionType: posData.position_type as string,
                  count: getInteger(posData.count),
                  displayName: posData.display_name as string | undefined,
                  abbreviation: posData.abbreviation as string | undefined,
               };
            },
         );
      }

      // Parse stat categories
      if (settingsData.stat_categories) {
         const statsObj = (
            settingsData.stat_categories as Record<string, unknown>
         ).stats as { stat: unknown };
         const statsArray = ensureArray(statsObj.stat);
         settings.statCategories = statsArray.map((statEntry: unknown) => {
            const statData = statEntry as Record<string, unknown>;
            return {
               statId: getInteger(statData.stat_id),
               enabled: getBoolean(statData.enabled),
               name: statData.name as string,
               displayOrder: statData.display_order
                  ? getInteger(statData.display_order)
                  : undefined,
               sortOrder: statData.sort_order
                  ? getInteger(statData.sort_order)
                  : undefined,
               positionType: statData.position_type as string | undefined,
            };
         });
      }

      // Parse stat modifiers (for points leagues)
      if (settingsData.stat_modifiers) {
         const modsObj = (
            settingsData.stat_modifiers as Record<string, unknown>
         ).stats as { stat: unknown };
         const modsArray = ensureArray(modsObj.stat);
         settings.statModifiers = modsArray.map((modEntry: unknown) => {
            const modData = modEntry as Record<string, unknown>;
            return {
               statId: getInteger(modData.stat_id),
               points: Number.parseFloat(modData.value as string),
            };
         });
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
      const teamsData = standingsData.teams as { team: unknown };
      const teamsArray = ensureArray(teamsData.team);
      const teams = teamsArray.map((team) => this.parseStandingsTeam(team));

      return { teams };
   }

   /**
    * Parse standings team from API response
    *
    * @private
    */
   private parseStandingsTeam(teamData: unknown): StandingsTeam {
      // XML structure is direct - no array flattening needed
      const data = teamData as Record<string, unknown>;
      const standings = data.team_standings as Record<string, unknown>;

      const team: StandingsTeam = {
         teamKey: data.team_key as ResourceKey,
         teamId: data.team_id as string,
         name: data.name as string,
         teamLogoUrl: data.team_logo_url as string | undefined,
         rank: getInteger(standings.rank),
         url: data.url as string,
      };

      if (standings.playoff_seed) {
         team.playoffSeed = getInteger(standings.playoff_seed);
      }

      if (standings.outcome_totals) {
         const outcomes = standings.outcome_totals as Record<
            string,
            unknown
         >;
         team.outcomeTotals = {
            wins: getInteger(outcomes.wins),
            losses: getInteger(outcomes.losses),
            ties: getInteger(outcomes.ties),
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
            value: getInteger(streak.value),
         };
      }

      if (data.managers) {
         const managersData = data.managers as { manager: unknown };
         const managersArray = ensureArray(managersData.manager);
         team.managers = managersArray.map((mgr: unknown) => {
            const managerData = mgr as Record<string, unknown>;
            return {
               guid: managerData.guid as string,
               nickname: managerData.nickname as string,
            };
         });
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
            ? getInteger(scoreboardData.week)
            : undefined,
         matchups: [],
      };

      const matchupsData = scoreboardData.matchups as { matchup: unknown };
      const matchupsArray = ensureArray(matchupsData.matchup);
      scoreboard.matchups = matchupsArray.map((matchup) =>
         this.parseMatchup(matchup as Record<string, unknown>),
      );

      return scoreboard;
   }

   /**
    * Parse matchup from API response
    *
    * @private
    */
   private parseMatchup(matchupData: Record<string, unknown>): Matchup {
      const matchup: Matchup = {
         week: matchupData.week ? getInteger(matchupData.week) : undefined,
         matchupGrade: matchupData.matchup_grade as string | undefined,
         winnerTeamKey: matchupData.winner_team_key as
            | ResourceKey
            | undefined,
         isTied: matchupData.is_tied
            ? getBoolean(matchupData.is_tied)
            : undefined,
         isPlayoffs: matchupData.is_playoffs
            ? getBoolean(matchupData.is_playoffs)
            : undefined,
         isConsolation: matchupData.is_consolation
            ? getBoolean(matchupData.is_consolation)
            : undefined,
         teams: [],
      };

      const teamsData = matchupData.teams as { team: unknown };
      const teamsArray = ensureArray(teamsData.team);
      matchup.teams = teamsArray.map((team) => this.parseMatchupTeam(team));

      return matchup;
   }

   /**
    * Parse matchup team from API response
    *
    * @private
    */
   private parseMatchupTeam(teamData: unknown): MatchupTeam {
      // XML structure is direct - no array flattening needed
      const data = teamData as Record<string, unknown>;

      const team: MatchupTeam = {
         teamKey: data.team_key as ResourceKey,
         teamId: data.team_id as string,
         name: data.name as string,
         teamLogoUrl: data.team_logo_url as string | undefined,
         url: data.url as string,
      };

      if (data.team_points) {
         const teamPoints = data.team_points as Record<string, unknown>;
         team.points = Number.parseFloat(teamPoints.total as string);
      }

      if (data.team_projected_points) {
         const projectedPoints = data.team_projected_points as Record<
            string,
            unknown
         >;
         team.projectedPoints = Number.parseFloat(
            projectedPoints.total as string,
         );
      }

      if (data.team_stats) {
         const statsObj = (data.team_stats as Record<string, unknown>)
            .stats as { stat: unknown };
         const statsArray = ensureArray(statsObj.stat);
         team.stats = statsArray.map((statEntry: unknown) => {
            const statData = statEntry as Record<string, unknown>;
            return {
               statId: getInteger(statData.stat_id),
               value: statData.value as string | number,
            };
         });
      }

      return team;
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

      return team;
   }
}
