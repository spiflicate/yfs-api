/**
 * Query Builder for constructing complex Yahoo Fantasy API URLs
 *
 * @module QueryBuilder
 *
 * @example
 * ```typescript
 * // Simple query
 * const url = new QueryBuilder()
 *   .resource('league', '423.l.12345')
 *   .build();
 * // Result: /league/423.l.12345
 *
 * // Complex chain with parameters
 * const url = new QueryBuilder()
 *   .resource('users')
 *   .param('use_login', '1')
 *   .collection('games')
 *   .param('game_keys', 'nfl')
 *   .collection('leagues')
 *   .param('out', ['settings', 'standings'])
 *   .build();
 * // Result: /users;use_login=1/games;game_keys=nfl/leagues;out=settings,standings
 *
 * // Team roster with week filter
 * const url = new QueryBuilder()
 *   .resource('team', '423.l.12345.t.1')
 *   .collection('roster')
 *   .param('week', '10')
 *   .collection('players')
 *   .build();
 * // Result: /team/423.l.12345.t.1/roster;week=10/players
 * ```
 */

/**
 * Represents a segment in the URL path (resource or collection)
 */
interface PathSegment {
   type: 'resource' | 'collection';
   name: string;
   key?: string;
   params: Map<string, string[]>;
}

/**
 * Query builder for constructing Yahoo Fantasy API URLs
 */
export class QueryBuilder {
   private segments: PathSegment[] = [];

   /**
    * Add a resource to the query path
    *
    * @param name - Resource name (e.g., 'game', 'league', 'team', 'player')
    * @param key - Optional resource key (e.g., 'nfl', '423.l.12345')
    * @returns The builder instance for chaining
    *
    * @example
    * ```typescript
    * builder.resource('game', 'nfl')
    * builder.resource('league', '423.l.12345')
    * builder.resource('users') // No key needed for users
    * ```
    */
   resource(name: ResourceName, key?: string): this {
      this.segments.push({
         type: 'resource',
         name,
         key,
         params: new Map(),
      });
      return this;
   }

   /**
    * Add a collection to the query path
    *
    * @param name - Collection name (e.g., 'games', 'leagues', 'teams', 'players')
    * @returns The builder instance for chaining
    *
    * @example
    * ```typescript
    * builder.collection('leagues')
    * builder.collection('players')
    * ```
    */
   collection(name: CollectionName): this {
      this.segments.push({
         type: 'collection',
         name,
         params: new Map(),
      });
      return this;
   }

   /**
    * Add a parameter to the most recent segment
    * Parameters are added as semicolon-delimited key=value pairs
    *
    * @param key - Parameter key
    * @param value - Parameter value(s), can be string or array
    * @returns The builder instance for chaining
    *
    * @example
    * ```typescript
    * builder.param('out', 'settings')
    * builder.param('out', ['settings', 'standings'])
    * builder.param('week', '10')
    * builder.param('position', 'QB')
    * ```
    */
   param(key: ParamKey, value: string | string[]): this {
      if (this.segments.length === 0) {
         throw new Error(
            'Cannot add parameters without a resource or collection. Call resource() or collection() first.',
         );
      }

      const currentSegment = this.segments[this.segments.length - 1];
      if (!currentSegment) {
         throw new Error('No current segment available');
      }
      const values = Array.isArray(value) ? value : [value];
      currentSegment.params.set(key, values);

      return this;
   }

   /**
    * Add multiple parameters at once to the most recent segment
    *
    * @param params - Object with parameter key-value pairs
    * @returns The builder instance for chaining
    *
    * @example
    * ```typescript
    * builder.params({
    *   position: 'QB',
    *   status: 'A',
    *   count: '25'
    * })
    * ```
    */
   params(params: Record<ParamKey, string | string[]>): this {
      for (const [key, value] of Object.entries(params)) {
         this.param(key, value);
      }
      return this;
   }

   /**
    * Add the 'out' parameter for including sub-resources
    * This is a convenience method for the common 'out' parameter
    *
    * @param subResources - Sub-resource name(s) to include
    * @returns The builder instance for chaining
    *
    * @example
    * ```typescript
    * builder.out('settings')
    * builder.out(['settings', 'standings', 'scoreboard'])
    * ```
    */
   out(subResources: SubResourceName | SubResourceName[]): this {
      return this.param('out', subResources);
   }

   /**
    * Build the final URL path
    * Does not include the base URL or API version prefix
    *
    * @returns The constructed URL path
    *
    * @example
    * ```typescript
    * const path = builder.build();
    * // Returns: /league/423.l.12345;out=settings/teams
    * ```
    */
   build(): string {
      if (this.segments.length === 0) {
         throw new Error(
            'Cannot build empty query. Add at least one resource or collection.',
         );
      }

      const parts: string[] = [];

      for (const segment of this.segments) {
         // Build the segment path
         let segmentPath = segment.name;
         if (segment.key) {
            segmentPath += `/${segment.key}`;
         }

         // Add parameters if present
         if (segment.params.size > 0) {
            const paramPairs = Array.from(segment.params.entries()).map(
               ([key, values]) => `${key}=${values.join(',')}`,
            );
            segmentPath += `;${paramPairs.join(';')}`;
         }

         parts.push(segmentPath);
      }

      return `/${parts.join('/')}`;
   }

   /**
    * Reset the builder to start a new query
    *
    * @returns The builder instance for chaining
    */
   reset(): this {
      this.segments = [];
      return this;
   }

   /**
    * Get a string representation of the current query
    * Useful for debugging
    *
    * @returns The current query path
    */
   toString(): string {
      try {
         return this.build();
      } catch {
         return '<incomplete query>';
      }
   }
}

/**
 * Helper function to create a new query builder
 * Provides a functional interface as an alternative to `new QueryBuilder()`
 *
 * @returns A new QueryBuilder instance
 *
 * @example
 * ```typescript
 * import { query } from './QueryBuilder';
 *
 * const url = query()
 *   .resource('league', '423.l.12345')
 *   .collection('teams')
 *   .build();
 * ```
 */
export function query(): QueryBuilder {
   return new QueryBuilder();
}

type ResourceName = 'game' | 'league' | 'team' | 'player' | (string & {});
type CollectionName =
   | 'games'
   | 'leagues'
   | 'teams'
   | 'players'
   | 'stats'
   | 'transactions'
   | 'drafts'
   | (string & {});
type SubResourceName =
   | 'settings'
   | 'standings'
   | 'scoreboard'
   | 'roster'
   | 'ownership'
   | 'draftresults'
   | (string & {});
type ParamKey =
   | 'out'
   | 'sort'
   | 'sort_type'
   | 'sort_season'
   | 'sort_date'
   | 'sort_week'
   | 'league_keys'
   | 'game_keys'
   | 'team_keys'
   | 'player_keys'
   | 'search'
   | 'start'
   | 'count'
   | 'status'
   | 'position'
   | (string & {});
