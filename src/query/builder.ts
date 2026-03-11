/**
 * Composable Query Builder
 *
 * A type-safe, chainable query builder for the Yahoo Fantasy API.
 * Provides autocomplete and type inference based on the query path.
 *
 * @module
 */

import type { HttpClient } from '../client/HttpClient.js';
import type { QueryParams } from '../types/query/params.js';
import type { AllResponseTypes } from '../types/query/responses.js';

/**
 * Internal segment types for path building
 */
type SegmentType = 'resource' | 'collection' | 'subResource';

interface PathSegment {
   type: SegmentType;
   name: string;
   key?: string;
}

/**
 * Query state
 */
interface QueryState {
   segments: PathSegment[];
   params: QueryParams;
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Composable Query Builder
 *
 * A fluent, chainable API for building Yahoo Fantasy API queries.
 *
 * @example
 * ```typescript
 * const client = new YahooFantasyClient(config);
 *
 * // Simple query
 * const league = await client.q()
 *   .game('nhl')
 *   .league('423.l.12345')
 *   .settings()
 *   .execute();
 *
 * // Query with filters
 * const players = await client.q()
 *   .league('423.l.12345')
 *   .players()
 *   .filter({ position: 'C', status: 'FA' })
 *   .sort('AR')
 *   .limit(25)
 *   .execute();
 * ```
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

   // ===== Resource Entry Points =====

   /**
    * Start with a game resource
    *
    * @param key - Game key (e.g., 'nfl', '423', 'nhl')
    * @returns QueryBuilder with game context
    *
    * @example
    * ```typescript
    * client.q().game('nfl')
    * client.q().game('423')
    * ```
    */
   game(key: string): this {
      this.state.segments.push({ type: 'resource', name: 'game', key });
      return this;
   }

   /**
    * Start with a league resource
    *
    * @param key - League key (e.g., '423.l.12345')
    * @returns QueryBuilder with league context
    */
   league(key: string): this {
      this.state.segments.push({ type: 'resource', name: 'league', key });
      return this;
   }

   /**
    * Start with a team resource
    *
    * @param key - Team key (e.g., '423.l.12345.t.1')
    * @returns QueryBuilder with team context
    */
   team(key: string): this {
      this.state.segments.push({ type: 'resource', name: 'team', key });
      return this;
   }

   /**
    * Start with a player resource
    *
    * @param key - Player key (e.g., '423.p.8261')
    * @returns QueryBuilder with player context
    */
   player(key: string): this {
      this.state.segments.push({ type: 'resource', name: 'player', key });
      return this;
   }

   /**
    * Start with users collection
    *
    * @returns QueryBuilder with users context
    */
   users(): this {
      this.state.segments.push({
         type: 'resource',
         name: 'users',
         key: 'current',
      });
      return this;
   }

   // ===== Sub-Resources =====

   /**
    * Access settings sub-resource (league)
    */
   settings(): this {
      this.state.segments.push({ type: 'subResource', name: 'settings' });
      return this;
   }

   /**
    * Access standings sub-resource
    */
   standings(): this {
      this.state.segments.push({ type: 'subResource', name: 'standings' });
      return this;
   }

   /**
    * Access scoreboard sub-resource (league)
    */
   scoreboard(): this {
      this.state.segments.push({ type: 'subResource', name: 'scoreboard' });
      return this;
   }

   /**
    * Access roster sub-resource (team)
    */
   roster(params?: { week?: string; date?: string }): this {
      this.state.segments.push({ type: 'subResource', name: 'roster' });
      if (params?.week) this.param('week', String(params.week));
      if (params?.date) this.param('date', params.date);
      return this;
   }

   /**
    * Access matchups sub-resource (team)
    */
   matchups(params?: { weeks?: string }): this {
      this.state.segments.push({ type: 'subResource', name: 'matchups' });
      if (params?.weeks) this.param('weeks', params.weeks);
      return this;
   }

   /**
    * Access stats sub-resource
    */
   stats(params?: { type?: string; week?: string; date?: string }): this {
      this.state.segments.push({ type: 'subResource', name: 'stats' });
      if (params?.type) this.param('type', params.type);
      if (params?.week) this.param('week', params.week);
      if (params?.date) this.param('date', params.date);
      return this;
   }

   /**
    * Access ownership sub-resource (player)
    */
   ownership(): this {
      this.state.segments.push({ type: 'subResource', name: 'ownership' });
      return this;
   }

   /**
    * Access percent_owned sub-resource (player)
    */
   percentOwned(): this {
      this.state.segments.push({
         type: 'subResource',
         name: 'percent_owned',
      });
      return this;
   }

   /**
    * Access draft_analysis sub-resource (player)
    */
   draftAnalysis(): this {
      this.state.segments.push({
         type: 'subResource',
         name: 'draft_analysis',
      });
      return this;
   }

   /**
    * Access stat_categories sub-resource (game)
    */
   statCategories(): this {
      this.state.segments.push({
         type: 'subResource',
         name: 'stat_categories',
      });
      return this;
   }

   /**
    * Access position_types sub-resource (game)
    */
   positionTypes(): this {
      this.state.segments.push({
         type: 'subResource',
         name: 'position_types',
      });
      return this;
   }

   /**
    * Access game_weeks sub-resource (game)
    */
   gameWeeks(): this {
      this.state.segments.push({ type: 'subResource', name: 'game_weeks' });
      return this;
   }

   // ===== Collections =====

   /**
    * Access leagues collection
    */
   leagues(): this {
      this.state.segments.push({ type: 'collection', name: 'leagues' });
      return this;
   }

   /**
    * Access teams collection
    */
   teams(): this {
      this.state.segments.push({ type: 'collection', name: 'teams' });
      return this;
   }

   /**
    * Access players collection
    */
   players(): this {
      this.state.segments.push({ type: 'collection', name: 'players' });
      return this;
   }

   /**
    * Access transactions collection
    */
   transactions(): this {
      this.state.segments.push({
         type: 'collection',
         name: 'transactions',
      });
      return this;
   }

   /**
    * Access drafts collection
    */
   drafts(): this {
      this.state.segments.push({ type: 'collection', name: 'drafts' });
      return this;
   }

   /**
    * Access games collection
    */
   games(): this {
      this.state.segments.push({ type: 'collection', name: 'games' });
      return this;
   }

   // ===== Parameters =====

   /**
    * Add a single parameter
    */
   param(key: string, value: string | string[] | number): this {
      this.state.params[key] = value;
      return this;
   }

   /**
    * Add multiple parameters at once
    */
   params(params: Record<string, string | string[] | number>): this {
      Object.assign(this.state.params, params);
      return this;
   }

   /**
    * Add the 'out' parameter for sub-resources
    */
   out(subResources: string | string[]): this {
      return this.param('out', subResources);
   }

   /**
    * Filter by position (players collection)
    */
   position(pos: string): this {
      return this.param('position', pos);
   }

   /**
    * Filter by status (players collection)
    * A = Available, FA = Free Agent, W = Waivers, T = Taken
    */
   status(status: string): this {
      return this.param('status', status);
   }

   /**
    * Sort by stat or special value
    */
   sort(sort: string): this {
      return this.param('sort', sort);
   }

   /**
    * Limit results
    */
   count(n: number): this {
      return this.param('count', n);
   }

   /**
    * Offset for pagination
    */
   start(n: number): this {
      return this.param('start', n);
   }

   /**
    * Search query
    */
   search(q: string): this {
      return this.param('search', q);
   }

   /**
    * Filter by week
    */
   week(w: number | string): this {
      return this.param('week', String(w));
   }

   /**
    * Filter by date
    */
   date(d: string): this {
      return this.param('date', d);
   }

   /**
    * Filter by game keys
    */
   gameKeys(keys: string | string[]): this {
      return this.param('game_keys', keys);
   }

   /**
    * Filter by league keys
    */
   leagueKeys(keys: string | string[]): this {
      return this.param('league_keys', keys);
   }

   /**
    * Filter by team keys
    */
   teamKeys(keys: string | string[]): this {
      return this.param('team_keys', keys);
   }

   /**
    * Filter by player keys
    */
   playerKeys(keys: string | string[]): this {
      return this.param('player_keys', keys);
   }

   /**
    * Add use_login param for users
    */
   useLogin(): this {
      return this.param('use_login', '1');
   }

   // ===== Execute =====

   /**
    * Build the query path string
    */
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

         // Get params for this segment (simplified - applies all params)
         if (Object.keys(this.state.params).length > 0) {
            const paramPairs = Object.entries(this.state.params)
               .filter(([, v]) => v !== undefined)
               .map(
                  ([k, v]) =>
                     `${k}=${this.formatValue(v as string | string[] | number)}`,
               );
            part += `;${paramPairs.join(';')}`;
         }

         parts.push(part);
      }

      return `/${parts.join('/')}`;
   }

   /**
    * Execute as GET request
    */
   async execute<T = AllResponseTypes>(): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.get<T>(path);
   }

   /**
    * Execute as POST request
    */
   async post<T = AllResponseTypes>(
      data?: Record<string, unknown>,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.post<T>(path, data);
   }

   /**
    * Execute as PUT request
    */
   async put<T = AllResponseTypes>(
      data?: Record<string, unknown>,
   ): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.put<T>(path, data);
   }

   /**
    * Execute as DELETE request
    */
   async delete<T = AllResponseTypes>(): Promise<T> {
      const path = this.buildPath();
      return this.httpClient.delete<T>(path);
   }

   /**
    * String representation
    */
   toString(): string {
      try {
         return this.buildPath();
      } catch {
         return '<incomplete query>';
      }
   }

   // ===== Helpers =====

   protected formatValue(value: string | string[] | number): string {
      if (Array.isArray(value)) {
         return value.join(',');
      }
      return String(value);
   }

   /**
    * Create a clone with new state
    */
   protected clone(): QueryBuilder {
      const builder = new QueryBuilder(this.httpClient);
      builder.state = {
         segments: [...this.state.segments],
         params: { ...this.state.params },
         method: this.state.method,
      };
      return builder;
   }
}

/**
 * Create a new query builder
 */
export function createQuery(httpClient: HttpClient): QueryBuilder {
   return new QueryBuilder(httpClient);
}
