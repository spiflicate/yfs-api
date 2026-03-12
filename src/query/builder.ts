/**
 * Composable Query Builder
 *
 * A type-safe, chainable query builder for the Yahoo Fantasy API.
 *
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { AllResponseTypes } from '../types/query/responses.js';

interface PathSegment {
   type: 'resource' | 'collection' | 'subResource';
   name: string;
   key?: string;
   params: Record<string, string | string[] | number>;
}

interface QueryState {
   segments: PathSegment[];
   params: Record<string, string | string[] | number>;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Composable Query Builder
 */
export class QueryBuilder {
   protected state: QueryState;
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

   // ===== Resource Entry Points =====

   game(key: string): this {
      this.addSegment('resource', 'game', key);
      return this;
   }

   league(key: string): this {
      this.addSegment('resource', 'league', key);
      return this;
   }

   team(key: string): this {
      this.addSegment('resource', 'team', key);
      return this;
   }

   player(key: string): this {
      this.addSegment('resource', 'player', key);
      return this;
   }

   users(): this {
      this.addSegment('resource', 'users');
      return this;
   }

   // ===== Sub-Resources =====

   settings(): this {
      this.addSegment('subResource', 'settings');
      return this;
   }

   standings(): this {
      this.addSegment('subResource', 'standings');
      return this;
   }

   scoreboard(): this {
      this.addSegment('subResource', 'scoreboard');
      return this;
   }

   roster(params?: { week?: string; date?: string }): this {
      this.addSegment('subResource', 'roster');
      if (params?.week) this.param('week', params.week);
      if (params?.date) this.param('date', params.date);
      return this;
   }

   matchups(params?: { weeks?: string }): this {
      this.addSegment('subResource', 'matchups');
      if (params?.weeks) this.param('weeks', params.weeks);
      return this;
   }

   stats(params?: { type?: string; week?: string; date?: string }): this {
      this.addSegment('subResource', 'stats');
      if (params?.type) this.param('type', params.type);
      if (params?.week) this.param('week', params.week);
      if (params?.date) this.param('date', params.date);
      return this;
   }

   ownership(): this {
      this.addSegment('subResource', 'ownership');
      return this;
   }

   percentOwned(): this {
      this.addSegment('subResource', 'percent_owned');
      return this;
   }

   draftAnalysis(): this {
      this.addSegment('subResource', 'draft_analysis');
      return this;
   }

   statCategories(): this {
      this.addSegment('subResource', 'stat_categories');
      return this;
   }

   positionTypes(): this {
      this.addSegment('subResource', 'position_types');
      return this;
   }

   gameWeeks(): this {
      this.addSegment('subResource', 'game_weeks');
      return this;
   }

   // ===== Collections =====

   leagues(): this {
      this.addSegment('collection', 'leagues');
      return this;
   }

   teams(): this {
      this.addSegment('collection', 'teams');
      return this;
   }

   players(): this {
      this.addSegment('collection', 'players');
      return this;
   }

   transactions(): this {
      this.addSegment('collection', 'transactions');
      return this;
   }

   drafts(): this {
      this.addSegment('collection', 'drafts');
      return this;
   }

   games(): this {
      this.addSegment('collection', 'games');
      return this;
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

   out(subResources: string | string[]): this {
      return this.param('out', subResources);
   }

   position(pos: string): this {
      return this.param('position', pos);
   }
   status(status: string): this {
      return this.param('status', status);
   }
   sort(sort: string): this {
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
            'Cannot build empty query. Add at least one resource.',
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

   async execute<T = AllResponseTypes>(): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.get<T>(path);
   }

   async post<T = AllResponseTypes>(
      data?: Record<string, unknown>,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.post<T>(path, data);
   }

   async put<T = AllResponseTypes>(
      data?: Record<string, unknown>,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.put<T>(path, data);
   }

   async delete<T = AllResponseTypes>(): Promise<T> {
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

export function createQuery(httpClient: HttpClient): QueryBuilder {
   return new QueryBuilder(httpClient);
}
