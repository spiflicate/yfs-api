/**
 * Advanced query interface for complex Yahoo Fantasy API requests
 *
 * This module provides a high-level interface that combines QueryBuilder
 * with the HTTP client to execute advanced queries.
 *
 * @module AdvancedQuery
 */

import type { HttpClient } from './HttpClient.js';
import { QueryBuilder } from './QueryBuilder.js';

/**
 * Advanced query executor that combines query building with HTTP execution
 *
 * @example
 * ```typescript
 * const client = new YahooFantasyClient(httpClient);
 *
 * // Execute a complex query
 * const result = await client.advanced()
 *   .resource('users')
 *   .param('use_login', '1')
 *   .collection('games')
 *   .param('game_keys', 'nfl')
 *   .collection('leagues')
 *   .execute();
 *
 * // With typed response
 * const leagues = await client.advanced<LeaguesResponse>()
 *   .resource('league', '423.l.12345')
 *   .out(['settings', 'standings'])
 *   .execute();
 * ```
 */
export class AdvancedQuery<T = unknown> extends QueryBuilder {
   constructor(private http: HttpClient) {
      super();
   }

   /**
    * Execute the query as a GET request
    *
    * @returns Promise resolving to the API response
    * @throws Error if the request fails
    */
   async execute(): Promise<T> {
      const path = this.build();
      return this.http.get<T>(path);
   }

   /**
    * Execute the query as a POST request
    *
    * @param data - Data to send in the request body
    * @returns Promise resolving to the API response
    * @throws Error if the request fails
    */
   async post(data?: Record<string, unknown>): Promise<T> {
      const path = this.build();
      return this.http.post<T>(path, data);
   }

   /**
    * Execute the query as a PUT request
    *
    * @param data - Data to send in the request body
    * @returns Promise resolving to the API response
    * @throws Error if the request fails
    */
   async put(data?: Record<string, unknown>): Promise<T> {
      const path = this.build();
      return this.http.put<T>(path, data);
   }

   /**
    * Execute the query as a DELETE request
    *
    * @returns Promise resolving to the API response
    * @throws Error if the request fails
    */
   async delete(): Promise<T> {
      const path = this.build();
      return this.http.delete<T>(path);
   }
}

// Alternative implementation using composition instead of inheritance
// export class AdvancedQuery<T = unknown> {
//    private builder: QueryBuilder;

//    constructor(private http: HttpClient) {
//       this.builder = new QueryBuilder();
//    }

//    /**
//     * Add a resource to the query path
//     *
//     * @param name - Resource name
//     * @param key - Optional resource key
//     * @returns The query instance for chaining
//     */
//    resource(name: string, key?: string): this {
//       this.builder.resource(name, key);
//       return this;
//    }

//    /**
//     * Add a collection to the query path
//     *
//     * @param name - Collection name
//     * @returns The query instance for chaining
//     */
//    collection(name: string): this {
//       this.builder.collection(name);
//       return this;
//    }

//    /**
//     * Add a parameter to the most recent segment
//     *
//     * @param key - Parameter key
//     * @param value - Parameter value(s)
//     * @returns The query instance for chaining
//     */
//    param(key: string, value: string | string[]): this {
//       this.builder.param(key, value);
//       return this;
//    }

//    /**
//     * Add multiple parameters at once
//     *
//     * @param params - Object with parameter key-value pairs
//     * @returns The query instance for chaining
//     */
//    params(params: Record<string, string | string[]>): this {
//       this.builder.params(params);
//       return this;
//    }

//    /**
//     * Add the 'out' parameter for including sub-resources
//     *
//     * @param subResources - Sub-resource name(s) to include
//     * @returns The query instance for chaining
//     */
//    out(subResources: string | string[]): this {
//       this.builder.out(subResources);
//       return this;
//    }

//    /**
//     * Build the query path without executing
//     * Useful for debugging or manual execution
//     *
//     * @returns The constructed URL path
//     */
//    buildPath(): string {
//       return this.builder.build();
//    }

//    /**
//     * Execute the query as a GET request
//     *
//     * @returns Promise resolving to the API response
//     * @throws Error if the request fails
//     */
//    async execute(): Promise<T> {
//       const path = this.builder.build();
//       return this.http.get<T>(path);
//    }

//    /**
//     * Execute the query as a POST request
//     *
//     * @param data - Data to send in the request body
//     * @returns Promise resolving to the API response
//     * @throws Error if the request fails
//     */
//    async post(data?: Record<string, unknown>): Promise<T> {
//       const path = this.builder.build();
//       return this.http.post<T>(path, data);
//    }

//    /**
//     * Execute the query as a PUT request
//     *
//     * @param data - Data to send in the request body
//     * @returns Promise resolving to the API response
//     * @throws Error if the request fails
//     */
//    async put(data?: Record<string, unknown>): Promise<T> {
//       const path = this.builder.build();
//       return this.http.put<T>(path, data);
//    }

//    /**
//     * Execute the query as a DELETE request
//     *
//     * @returns Promise resolving to the API response
//     * @throws Error if the request fails
//     */
//    async delete(): Promise<T> {
//       const path = this.builder.build();
//       return this.http.delete<T>(path);
//    }

//    /**
//     * Get a string representation of the query
//     *
//     * @returns The current query path
//     */
//    toString(): string {
//       return this.builder.toString();
//    }
// }
