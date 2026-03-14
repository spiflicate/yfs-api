/**
 * Composable Request Builder
 *
 * A type-safe, chainable request builder for the Yahoo Fantasy API.
 *
 * @module
 */

import type { HttpClient, RequestOptions } from '../client/HttpClient.js';
import type { InferResponseType } from '../types/request/context.js';
import type {
   GameKey,
   GetSubResources,
   LeagueKey,
   PlayerKey,
   TeamKey,
   TransactionKey,
} from '../types/request/graph.js';
import type {
   PlayerStatusParam,
   SortParam,
} from '../types/request/params.js';
import type { AllResponseTypes } from '../types/request/responses.js';

interface PathSegment {
   type: 'resource' | 'collection' | 'subResource';
   name: string;
   key?: string;
   params: Record<string, string | string[] | number>;
}

interface RequestState {
   segments: PathSegment[];
   params: Record<string, string | string[] | number>;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

type ParamValue = string | string[] | number;

type RootPath = [];
type GamesPath = ['games'];
type GamePath = ['game', GameKey];
type LeaguePath = ['league', LeagueKey];
type TeamPath = ['team', TeamKey];
type PlayerPath = ['player', PlayerKey];
type TransactionPath = ['transaction', TransactionKey];
type UsersPath = ['users'];
type UsersGamesPath = [...UsersPath, 'games'];
type TeamRosterPath = [...TeamPath, 'roster'];
type LeagueOutValue = Extract<
   GetSubResources<'league'>[number],
   'settings' | 'standings' | 'scoreboard'
>;
type TeamOutValue = Extract<
   GetSubResources<'team'>[number],
   'roster' | 'matchups' | 'stats' | 'standings'
>;
type GameOutValue = Extract<
   GetSubResources<'game'>[number],
   'stat_categories' | 'position_types' | 'game_weeks'
>;
type PlayerOutValue = Extract<
   GetSubResources<'player'>[number],
   'stats' | 'ownership' | 'percent_owned' | 'draft_analysis'
>;

type TerminalMethodNames =
   | 'buildPath'
   | 'execute'
   | 'post'
   | 'put'
   | 'delete'
   | 'toString'
   | '__pathType';
type BaseParameterMethodNames = 'param' | 'params';
type SharedMethodNames = TerminalMethodNames | BaseParameterMethodNames;
type PaginationParamMethodNames = 'count' | 'start';
type GameScopedParamMethodNames = 'gameKeys' | 'out';
type LeagueScopedParamMethodNames = 'leagueKeys' | 'out';
type TeamScopedParamMethodNames = 'teamKeys' | 'out';
type PlayerScopedParamMethodNames =
   | 'playerKeys'
   | 'position'
   | 'status'
   | 'sort'
   | 'search';
type TransactionsCollectionParamMethodNames =
   | 'type'
   | 'types'
   | 'teamKey'
   | 'count'
   | 'start';
type DateScopedParamMethodNames = 'week' | 'date';
type UserScopedParamMethodNames = 'useLogin';
type RootNavigationMethodNames =
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'transaction'
   | 'users'
   | 'games';
type GameNavigationMethodNames =
   | 'leagues'
   | 'players'
   | 'statCategories'
   | 'positionTypes'
   | 'gameWeeks';
type LeagueNavigationMethodNames =
   | 'settings'
   | 'standings'
   | 'scoreboard'
   | 'teams'
   | 'players'
   | 'transactions'
   | 'drafts';
type TeamNavigationMethodNames =
   | 'roster'
   | 'matchups'
   | 'stats'
   | 'standings';
type TeamRosterNavigationMethodNames = 'players';
type PlayerNavigationMethodNames =
   | 'stats'
   | 'ownership'
   | 'percentOwned'
   | 'draftAnalysis';
type UsersNavigationMethodNames = 'games' | 'leagues' | 'teams';
type UsersGamesNavigationMethodNames = 'leagues' | 'teams';

type RootStageMethodNames = SharedMethodNames | RootNavigationMethodNames;
type GameStageMethodNames =
   | SharedMethodNames
   | GameNavigationMethodNames
   | GameScopedParamMethodNames;
type LeagueStageMethodNames =
   | SharedMethodNames
   | LeagueNavigationMethodNames
   | LeagueScopedParamMethodNames;
type TeamStageMethodNames =
   | SharedMethodNames
   | TeamNavigationMethodNames
   | TeamScopedParamMethodNames;
type PlayerStageMethodNames =
   | SharedMethodNames
   | PlayerNavigationMethodNames
   | PlayerScopedParamMethodNames
   | PaginationParamMethodNames;
type UsersStageMethodNames =
   | SharedMethodNames
   | UsersNavigationMethodNames
   | UserScopedParamMethodNames;
type UsersGamesStageMethodNames =
   | SharedMethodNames
   | UsersGamesNavigationMethodNames
   | GameScopedParamMethodNames;
type GamesCollectionStageMethodNames =
   | SharedMethodNames
   | GameScopedParamMethodNames;
type TeamRosterStageMethodNames =
   | SharedMethodNames
   | TeamRosterNavigationMethodNames
   | DateScopedParamMethodNames;
type TransactionsCollectionStageMethodNames =
   | SharedMethodNames
   | TransactionsCollectionParamMethodNames;
type PlayersCollectionStageMethodNames =
   | SharedMethodNames
   | PlayerScopedParamMethodNames
   | PaginationParamMethodNames
   | DateScopedParamMethodNames;
type TeamsCollectionStageMethodNames =
   | SharedMethodNames
   | TeamScopedParamMethodNames;
type LeaguesCollectionStageMethodNames =
   | SharedMethodNames
   | LeagueScopedParamMethodNames;
type WriteRequestOptions = Omit<RequestOptions, 'method' | 'body'>;

type PlayerCollectionParamKey =
   | 'player_keys'
   | 'position'
   | 'status'
   | 'sort'
   | 'count'
   | 'start'
   | 'search'
   | 'week'
   | 'date';

type ParamKeyForPath<TPath extends string[]> = TPath extends UsersPath
   ? 'use_login'
   : TPath extends GamesPath | UsersGamesPath
     ? 'game_keys'
     : TPath extends GamePath
       ? 'game_keys' | 'out'
       : TPath extends [...GamePath, 'leagues']
         ? 'league_keys' | 'out'
         : TPath extends [...GamePath, 'players']
           ? PlayerCollectionParamKey
           : TPath extends LeaguePath
             ? 'league_keys' | 'out'
             : TPath extends [...LeaguePath, 'scoreboard']
               ? 'week' | 'date'
               : TPath extends [...LeaguePath, 'players']
                 ? PlayerCollectionParamKey
                 : TPath extends [...LeaguePath, 'teams']
                   ? 'team_keys' | 'out'
                   : TPath extends [...LeaguePath, 'transactions']
                     ? 'type' | 'types' | 'team_key' | 'count' | 'start'
                     : TPath extends TeamPath
                       ? 'team_keys' | 'out'
                       : TPath extends TeamRosterPath
                         ? 'week' | 'date'
                         : TPath extends [...TeamRosterPath, 'players']
                           ? PlayerCollectionParamKey
                           : TPath extends [...TeamPath, 'matchups']
                             ? 'weeks'
                             : TPath extends [...TeamPath, 'stats']
                               ? 'type' | 'week' | 'date'
                               : TPath extends PlayerPath
                                 ?
                                      | 'player_keys'
                                      | 'position'
                                      | 'status'
                                      | 'sort'
                                      | 'count'
                                      | 'start'
                                      | 'search'
                                      | 'out'
                                 : TPath extends [...PlayerPath, 'stats']
                                   ? 'type' | 'week' | 'date'
                                   : never;

/**
 * Composable Request Builder
 */
export class RequestBuilder<TPath extends string[] = RootPath> {
   readonly __pathType!: TPath;
   protected state: RequestState;
   protected httpClient: HttpClient;

   constructor(httpClient: HttpClient) {
      this.httpClient = httpClient;
      this.state = {
         segments: [],
         params: {},
         method: 'GET',
      };
   }

   private addSegment(
      type: 'resource' | 'collection' | 'subResource',
      name: string,
      key?: string,
   ): void {
      this.state.segments.push({ type, name, key, params: {} });
   }

   private getCurrentSegment(): PathSegment | undefined {
      return this.state.segments[this.state.segments.length - 1];
   }

   private setParam(key: string, value: ParamValue): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         segment.params[key] = value;
      }
      return this;
   }

   private setParams(params: Record<string, ParamValue>): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         Object.assign(segment.params, params);
      }
      return this;
   }

   private asStage<
      TNextPath extends string[],
      TNextMethods extends keyof RequestBuilder<TNextPath> = never,
   >(): Pick<RequestBuilder<TNextPath>, SharedMethodNames | TNextMethods> {
      return this as unknown as Pick<
         RequestBuilder<TNextPath>,
         SharedMethodNames | TNextMethods
      >;
   }

   // ===== Resource Entry Points =====

   game(
      key: GameKey,
   ): Pick<RequestBuilder<GamePath>, GameStageMethodNames> {
      this.addSegment('resource', 'game', key);
      return this.asStage<GamePath, GameStageMethodNames>();
   }

   league(
      key: LeagueKey,
   ): Pick<RequestBuilder<LeaguePath>, LeagueStageMethodNames> {
      this.addSegment('resource', 'league', key);
      return this.asStage<LeaguePath, LeagueStageMethodNames>();
   }

   team(
      key: TeamKey,
   ): Pick<RequestBuilder<TeamPath>, TeamStageMethodNames> {
      this.addSegment('resource', 'team', key);
      return this.asStage<TeamPath, TeamStageMethodNames>();
   }

   player(
      key: PlayerKey,
   ): Pick<RequestBuilder<PlayerPath>, PlayerStageMethodNames> {
      this.addSegment('resource', 'player', key);
      return this.asStage<PlayerPath, PlayerStageMethodNames>();
   }

   transaction(
      key: TransactionKey,
   ): Pick<RequestBuilder<TransactionPath>, SharedMethodNames> {
      this.addSegment('resource', 'transaction', key);
      return this.asStage<TransactionPath>();
   }

   users(): Pick<RequestBuilder<UsersPath>, UsersStageMethodNames> {
      this.addSegment('resource', 'users');
      return this.asStage<UsersPath, UsersStageMethodNames>();
   }

   // ===== Sub-Resources =====

   settings(): Pick<
      RequestBuilder<[...LeaguePath, 'settings']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'settings');
      return this.asStage<[...LeaguePath, 'settings']>();
   }

   standings(): TPath extends LeaguePath
      ? Pick<
           RequestBuilder<[...LeaguePath, 'standings']>,
           SharedMethodNames
        >
      : TPath extends TeamPath
        ? Pick<
             RequestBuilder<[...TeamPath, 'standings']>,
             SharedMethodNames
          >
        : never {
      this.addSegment('subResource', 'standings');
      return this.asStage<string[]>() as never;
   }

   scoreboard(): Pick<
      RequestBuilder<[...LeaguePath, 'scoreboard']>,
      SharedMethodNames | DateScopedParamMethodNames
   > {
      this.addSegment('subResource', 'scoreboard');
      return this.asStage<
         [...LeaguePath, 'scoreboard'],
         DateScopedParamMethodNames
      >();
   }

   roster(params?: {
      week?: string | number;
      date?: string;
   }): Pick<
      RequestBuilder<[...TeamPath, 'roster']>,
      TeamRosterStageMethodNames
   > {
      this.addSegment('subResource', 'roster');
      if (params?.week) this.setParam('week', String(params.week));
      if (params?.date) this.setParam('date', params.date);
      return this.asStage<
         [...TeamPath, 'roster'],
         TeamRosterStageMethodNames
      >();
   }

   matchups(params?: {
      weeks?: string;
   }): Pick<RequestBuilder<[...TeamPath, 'matchups']>, SharedMethodNames> {
      this.addSegment('subResource', 'matchups');
      if (params?.weeks) this.setParam('weeks', params.weeks);
      return this.asStage<[...TeamPath, 'matchups']>();
   }

   stats(params?: {
      type?: string;
      week?: string | number;
      date?: string;
   }): TPath extends TeamPath
      ? Pick<
           RequestBuilder<[...TeamPath, 'stats']>,
           SharedMethodNames | DateScopedParamMethodNames
        >
      : TPath extends PlayerPath
        ? Pick<
             RequestBuilder<[...PlayerPath, 'stats']>,
             SharedMethodNames | DateScopedParamMethodNames
          >
        : never {
      this.addSegment('subResource', 'stats');
      if (params?.type) this.setParam('type', params.type);
      if (params?.week) this.setParam('week', String(params.week));
      if (params?.date) this.setParam('date', params.date);
      return this.asStage<string[]>() as never;
   }

   ownership(): Pick<
      RequestBuilder<[...PlayerPath, 'ownership']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'ownership');
      return this.asStage<[...PlayerPath, 'ownership']>();
   }

   percentOwned(): Pick<
      RequestBuilder<[...PlayerPath, 'percent_owned']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'percent_owned');
      return this.asStage<[...PlayerPath, 'percent_owned']>();
   }

   draftAnalysis(): Pick<
      RequestBuilder<[...PlayerPath, 'draft_analysis']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'draft_analysis');
      return this.asStage<[...PlayerPath, 'draft_analysis']>();
   }

   statCategories(): Pick<
      RequestBuilder<[...GamePath, 'stat_categories']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'stat_categories');
      return this.asStage<[...GamePath, 'stat_categories']>();
   }

   positionTypes(): Pick<
      RequestBuilder<[...GamePath, 'position_types']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'position_types');
      return this.asStage<[...GamePath, 'position_types']>();
   }

   gameWeeks(): Pick<
      RequestBuilder<[...GamePath, 'game_weeks']>,
      SharedMethodNames
   > {
      this.addSegment('subResource', 'game_weeks');
      return this.asStage<[...GamePath, 'game_weeks']>();
   }

   // ===== Collections =====

   leagues(): TPath extends GamePath
      ? Pick<
           RequestBuilder<[...GamePath, 'leagues']>,
           LeaguesCollectionStageMethodNames
        >
      : TPath extends UsersPath
        ? Pick<
             RequestBuilder<[...UsersPath, 'leagues']>,
             LeaguesCollectionStageMethodNames
          >
        : TPath extends UsersGamesPath
          ? Pick<
               RequestBuilder<[...UsersGamesPath, 'leagues']>,
               LeaguesCollectionStageMethodNames
            >
          : never {
      this.addSegment('collection', 'leagues');
      return this.asStage<string[]>() as never;
   }

   teams(): TPath extends LeaguePath
      ? Pick<
           RequestBuilder<[...LeaguePath, 'teams']>,
           TeamsCollectionStageMethodNames
        >
      : TPath extends UsersPath
        ? Pick<
             RequestBuilder<[...UsersPath, 'teams']>,
             TeamsCollectionStageMethodNames
          >
        : TPath extends UsersGamesPath
          ? Pick<
               RequestBuilder<[...UsersGamesPath, 'teams']>,
               TeamsCollectionStageMethodNames
            >
          : never {
      this.addSegment('collection', 'teams');
      return this.asStage<string[]>() as never;
   }

   players(): TPath extends GamePath
      ? Pick<
           RequestBuilder<[...GamePath, 'players']>,
           PlayersCollectionStageMethodNames
        >
      : TPath extends LeaguePath
        ? Pick<
             RequestBuilder<[...LeaguePath, 'players']>,
             PlayersCollectionStageMethodNames
          >
        : TPath extends TeamRosterPath
          ? Pick<
               RequestBuilder<[...TeamRosterPath, 'players']>,
               PlayersCollectionStageMethodNames
            >
          : never {
      this.addSegment('collection', 'players');
      return this.asStage<string[]>() as never;
   }

   transactions(): Pick<
      RequestBuilder<[...LeaguePath, 'transactions']>,
      TransactionsCollectionStageMethodNames
   > {
      this.addSegment('collection', 'transactions');
      return this.asStage<
         [...LeaguePath, 'transactions'],
         TransactionsCollectionStageMethodNames
      >();
   }

   drafts(): Pick<
      RequestBuilder<[...LeaguePath, 'drafts']>,
      SharedMethodNames
   > {
      this.addSegment('collection', 'drafts');
      return this.asStage<[...LeaguePath, 'drafts']>();
   }

   games(): TPath extends RootPath
      ? Pick<RequestBuilder<GamesPath>, GamesCollectionStageMethodNames>
      : TPath extends UsersPath
        ? Pick<RequestBuilder<UsersGamesPath>, UsersGamesStageMethodNames>
        : never {
      this.addSegment('collection', 'games');
      return this.asStage<string[]>() as never;
   }

   // ===== Parameters =====

   param(key: ParamKeyForPath<TPath>, value: ParamValue): this {
      return this.setParam(key, value);
   }

   params(
      params: Partial<Record<ParamKeyForPath<TPath>, ParamValue>>,
   ): this {
      return this.setParams(params as Record<string, ParamValue>);
   }

   out(
      subResources:
         | (TPath extends GamePath
              ? GameOutValue
              : TPath extends LeaguePath
                ? LeagueOutValue
                : TPath extends TeamPath
                  ? TeamOutValue
                  : PlayerOutValue)
         | Array<
              TPath extends GamePath
                 ? GameOutValue
                 : TPath extends LeaguePath
                   ? LeagueOutValue
                   : TPath extends TeamPath
                     ? TeamOutValue
                     : PlayerOutValue
           >,
   ): this {
      return this.setParam('out', subResources);
   }

   position(pos: string): this {
      return this.setParam('position', pos);
   }
   status(status: PlayerStatusParam | string): this {
      return this.setParam('status', status);
   }
   type(value: string): this {
      return this.setParam('type', value);
   }
   types(values: string | string[]): this {
      return this.setParam('types', values);
   }
   teamKey(key: TeamKey): this {
      return this.setParam('team_key', key);
   }
   sort(sort: SortParam | string): this {
      return this.setParam('sort', sort);
   }
   count(n: number): this {
      return this.setParam('count', String(n));
   }
   start(n: number): this {
      return this.setParam('start', String(n));
   }
   search(q: string): this {
      return this.setParam('search', q);
   }
   week(w: number | string): this {
      return this.setParam('week', String(w));
   }
   date(d: string): this {
      return this.setParam('date', d);
   }
   gameKeys(keys: string | string[]): this {
      return this.setParam('game_keys', keys);
   }
   leagueKeys(keys: string | string[]): this {
      return this.setParam('league_keys', keys);
   }
   teamKeys(keys: string | string[]): this {
      return this.setParam('team_keys', keys);
   }
   playerKeys(keys: string | string[]): this {
      return this.setParam('player_keys', keys);
   }
   useLogin(): this {
      return this.setParam('use_login', '1');
   }

   // ===== Execute =====

   buildPath(): string {
      if (this.state.segments.length === 0) {
         throw new Error(
            'Cannot build empty request. Add at least one resource.',
         );
      }

      const parts: string[] = [];

      for (const seg of this.state.segments) {
         let part = seg.name;
         if (seg.key) {
            part += `/${seg.key}`;
         }

         if (Object.keys(seg.params).length > 0) {
            const paramPairs = Object.entries(seg.params)
               .filter(([, v]) => v !== undefined)
               .map(([k, v]) => `${k}=${this.formatValue(v)}`);
            part += `;${paramPairs.join(';')}`;
         }

         parts.push(part);
      }

      return `/${parts.join('/')}`;
   }

   async execute<
      T = InferResponseType<TPath> extends never
         ? AllResponseTypes
         : InferResponseType<TPath>,
   >(): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.get<T>(path);
   }

   async post<
      T = InferResponseType<TPath> extends never
         ? AllResponseTypes
         : InferResponseType<TPath>,
   >(
      data?: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.post<T>(path, data, options);
   }

   async put<
      T = InferResponseType<TPath> extends never
         ? AllResponseTypes
         : InferResponseType<TPath>,
   >(
      data?: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.put<T>(path, data, options);
   }

   async delete<
      T = InferResponseType<TPath> extends never
         ? AllResponseTypes
         : InferResponseType<TPath>,
   >(): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.delete<T>(path);
   }

   toString(): string {
      try {
         return this.buildPath();
      } catch {
         return '<incomplete request>';
      }
   }

   protected formatValue(value: string | string[] | number): string {
      if (Array.isArray(value)) {
         return value.join(',');
      }
      return String(value);
   }
}

export type RootRequestBuilder = Pick<RequestBuilder, RootStageMethodNames>;

export function createRequest(httpClient: HttpClient): RootRequestBuilder {
   return new RequestBuilder(httpClient) as RootRequestBuilder;
}
