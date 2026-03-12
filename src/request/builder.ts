/**
 * Composable Request Builder
 *
 * A type-safe, chainable request builder for the Yahoo Fantasy API.
 *
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { InferResponseType } from '../types/query/context.js';
import type {
   GameKey,
   GetSubResources,
   LeagueKey,
   PlayerKey,
   TeamKey,
} from '../types/query/graph.js';
import type {
   PlayerStatusParam,
   SortParam,
} from '../types/query/params.js';
import type { AllResponseTypes } from '../types/query/responses.js';

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

type RootPath = [];
type GamesPath = ['games'];
type GamePath = ['game', GameKey];
type LeaguePath = ['league', LeagueKey];
type TeamPath = ['team', TeamKey];
type PlayerPath = ['player', PlayerKey];
type UsersPath = ['users'];
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

/**
 * Composable Request Builder
 */
export class RequestBuilder<TPath extends string[] = RootPath> {
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

   private as<TNextPath extends string[]>(): RequestBuilder<TNextPath> {
      return this as unknown as RequestBuilder<TNextPath>;
   }

   // ===== Resource Entry Points =====

   game(
      this: RequestBuilder<RootPath>,
      key: GameKey,
   ): RequestBuilder<GamePath> {
      this.addSegment('resource', 'game', key);
      return this.as<GamePath>();
   }

   league(
      this: RequestBuilder<RootPath>,
      key: LeagueKey,
   ): RequestBuilder<LeaguePath> {
      this.addSegment('resource', 'league', key);
      return this.as<LeaguePath>();
   }

   team(
      this: RequestBuilder<RootPath>,
      key: TeamKey,
   ): RequestBuilder<TeamPath> {
      this.addSegment('resource', 'team', key);
      return this.as<TeamPath>();
   }

   player(
      this: RequestBuilder<RootPath>,
      key: PlayerKey,
   ): RequestBuilder<PlayerPath> {
      this.addSegment('resource', 'player', key);
      return this.as<PlayerPath>();
   }

   users(this: RequestBuilder<RootPath>): RequestBuilder<UsersPath> {
      this.addSegment('resource', 'users');
      return this.as<UsersPath>();
   }

   // ===== Sub-Resources =====

   settings(
      this: RequestBuilder<LeaguePath>,
   ): RequestBuilder<[...LeaguePath, 'settings']> {
      this.addSegment('subResource', 'settings');
      return this.as<[...LeaguePath, 'settings']>();
   }

   standings<TPath extends LeaguePath | TeamPath>(
      this: RequestBuilder<TPath>,
   ): RequestBuilder<[...TPath, 'standings']> {
      this.addSegment('subResource', 'standings');
      return this.as<[...TPath, 'standings']>();
   }

   scoreboard(
      this: RequestBuilder<LeaguePath>,
   ): RequestBuilder<[...LeaguePath, 'scoreboard']> {
      this.addSegment('subResource', 'scoreboard');
      return this.as<[...LeaguePath, 'scoreboard']>();
   }

   roster(
      this: RequestBuilder<TeamPath>,
      params?: { week?: string | number; date?: string },
   ): RequestBuilder<[...TeamPath, 'roster']> {
      this.addSegment('subResource', 'roster');
      if (params?.week) this.param('week', String(params.week));
      if (params?.date) this.param('date', params.date);
      return this.as<[...TeamPath, 'roster']>();
   }

   matchups(
      this: RequestBuilder<TeamPath>,
      params?: { weeks?: string },
   ): RequestBuilder<[...TeamPath, 'matchups']> {
      this.addSegment('subResource', 'matchups');
      if (params?.weeks) this.param('weeks', params.weeks);
      return this.as<[...TeamPath, 'matchups']>();
   }

   stats<TPath extends TeamPath | PlayerPath>(
      this: RequestBuilder<TPath>,
      params?: { type?: string; week?: string | number; date?: string },
   ): RequestBuilder<[...TPath, 'stats']> {
      this.addSegment('subResource', 'stats');
      if (params?.type) this.param('type', params.type);
      if (params?.week) this.param('week', String(params.week));
      if (params?.date) this.param('date', params.date);
      return this.as<[...TPath, 'stats']>();
   }

   ownership(
      this: RequestBuilder<PlayerPath>,
   ): RequestBuilder<[...PlayerPath, 'ownership']> {
      this.addSegment('subResource', 'ownership');
      return this.as<[...PlayerPath, 'ownership']>();
   }

   percentOwned(
      this: RequestBuilder<PlayerPath>,
   ): RequestBuilder<[...PlayerPath, 'percent_owned']> {
      this.addSegment('subResource', 'percent_owned');
      return this.as<[...PlayerPath, 'percent_owned']>();
   }

   draftAnalysis(
      this: RequestBuilder<PlayerPath>,
   ): RequestBuilder<[...PlayerPath, 'draft_analysis']> {
      this.addSegment('subResource', 'draft_analysis');
      return this.as<[...PlayerPath, 'draft_analysis']>();
   }

   statCategories(
      this: RequestBuilder<GamePath>,
   ): RequestBuilder<[...GamePath, 'stat_categories']> {
      this.addSegment('subResource', 'stat_categories');
      return this.as<[...GamePath, 'stat_categories']>();
   }

   positionTypes(
      this: RequestBuilder<GamePath>,
   ): RequestBuilder<[...GamePath, 'position_types']> {
      this.addSegment('subResource', 'position_types');
      return this.as<[...GamePath, 'position_types']>();
   }

   gameWeeks(
      this: RequestBuilder<GamePath>,
   ): RequestBuilder<[...GamePath, 'game_weeks']> {
      this.addSegment('subResource', 'game_weeks');
      return this.as<[...GamePath, 'game_weeks']>();
   }

   // ===== Collections =====

   leagues<TPath extends GamePath | UsersPath | [...UsersPath, 'games']>(
      this: RequestBuilder<TPath>,
   ): RequestBuilder<[...TPath, 'leagues']> {
      this.addSegment('collection', 'leagues');
      return this.as<[...TPath, 'leagues']>();
   }

   teams<TPath extends LeaguePath | UsersPath | [...UsersPath, 'games']>(
      this: RequestBuilder<TPath>,
   ): RequestBuilder<[...TPath, 'teams']> {
      this.addSegment('collection', 'teams');
      return this.as<[...TPath, 'teams']>();
   }

   players<TPath extends GamePath | LeaguePath | [...TeamPath, 'roster']>(
      this: RequestBuilder<TPath>,
   ): RequestBuilder<[...TPath, 'players']> {
      this.addSegment('collection', 'players');
      return this.as<[...TPath, 'players']>();
   }

   transactions(
      this: RequestBuilder<LeaguePath>,
   ): RequestBuilder<[...LeaguePath, 'transactions']> {
      this.addSegment('collection', 'transactions');
      return this.as<[...LeaguePath, 'transactions']>();
   }

   drafts(
      this: RequestBuilder<LeaguePath>,
   ): RequestBuilder<[...LeaguePath, 'drafts']> {
      this.addSegment('collection', 'drafts');
      return this.as<[...LeaguePath, 'drafts']>();
   }

   games<TThisPath extends RootPath | UsersPath>(
      this: RequestBuilder<TThisPath>,
   ): RequestBuilder<
      TThisPath extends RootPath ? GamesPath : [...UsersPath, 'games']
   > {
      this.addSegment('collection', 'games');
      return this.as<
         TThisPath extends RootPath ? GamesPath : [...UsersPath, 'games']
      >();
   }

   // ===== Parameters =====

   param(key: string, value: string | string[] | number): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         segment.params[key] = value;
      }
      return this;
   }

   params(params: Record<string, string | string[] | number>): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         Object.assign(segment.params, params);
      }
      return this;
   }

   out<TPath extends GamePath | LeaguePath | TeamPath | PlayerPath>(
      this: RequestBuilder<TPath>,
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
      return this.param('out', subResources) as this;
   }

   position(pos: string): this {
      return this.param('position', pos);
   }
   status(status: PlayerStatusParam | string): this {
      return this.param('status', status);
   }
   sort(sort: SortParam | string): this {
      return this.param('sort', sort);
   }
   count(n: number): this {
      return this.param('count', String(n));
   }
   start(n: number): this {
      return this.param('start', String(n));
   }
   search(q: string): this {
      return this.param('search', q);
   }
   week(w: number | string): this {
      return this.param('week', String(w));
   }
   date(d: string): this {
      return this.param('date', d);
   }
   gameKeys(keys: string | string[]): this {
      return this.param('game_keys', keys);
   }
   leagueKeys(keys: string | string[]): this {
      return this.param('league_keys', keys);
   }
   teamKeys(keys: string | string[]): this {
      return this.param('team_keys', keys);
   }
   playerKeys(keys: string | string[]): this {
      return this.param('player_keys', keys);
   }
   useLogin(): this {
      return this.param('use_login', '1');
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
   >(data?: Record<string, unknown>): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.post<T>(path, data);
   }

   async put<
      T = InferResponseType<TPath> extends never
         ? AllResponseTypes
         : InferResponseType<TPath>,
   >(data?: Record<string, unknown>): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.put<T>(path, data);
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
         return '<incomplete query>';
      }
   }

   protected formatValue(value: string | string[] | number): string {
      if (Array.isArray(value)) {
         return value.join(',');
      }
      return String(value);
   }
}

export function createRequest(httpClient: HttpClient): RequestBuilder {
   return new RequestBuilder(httpClient);
}
