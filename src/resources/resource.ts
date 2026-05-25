import type { HttpClient as Transport } from '../client/http';

type ResourceName = 'game' | 'league' | 'team' | 'player' | 'transaction';

type CollectionName =
   | 'users'
   | 'games'
   | 'leagues'
   | 'teams'
   | 'players'
   | 'transactions';

type SubResourceName = 'roster' | 'stats' | 'matchups';

type ResponseScopeName = ResourceName | CollectionName | SubResourceName;

type KeysParam<T extends string> = T extends `${infer Stem}s`
   ? `${Stem}_keys`
   : `${T}_keys`;

/**
 * Parameters for addressing a single Yahoo Fantasy resource instance.
 */
export type ResourceParams<
   TSubResource extends string = string,
   TKey extends string = string,
> = {
   kind: 'resource';
   name: ResourceName;
   key: TKey;
   out: TSubResource[];
};

/**
 * Parameters for addressing a Yahoo Fantasy resource collection.
 */
export type CollectionParams<
   TSubResource extends string = string,
   TKey extends string = string,
   TKeyName extends CollectionName = CollectionName,
> = {
   kind: 'collection';
   name: CollectionName;
   out: TSubResource[];
} & Partial<
   TKeyName extends 'users'
      ? Record<'use_login', '1'>
      : Record<KeysParam<TKeyName>, TKey[]>
>;

export type SubResourceParams<
   TSubResourceName extends SubResourceName = SubResourceName,
> = {
   kind: 'subResource';
   name: TSubResourceName;
};

/**
 * Immutable request state accumulated while building a resource path.
 */
export interface RequestState {
   segments: string[];
   responseScope?: ResponseScopeName[];
}

type Scalar = string | number | boolean;
type PathValue = Scalar | null | undefined | readonly Scalar[];
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Base abstraction for a Yahoo Fantasy API resource path builder.
 *
 * It stores the current path state, supports adding sub-resources, and
 * serializes resource parameters into Yahoo's semicolon-delimited path format.
 */
export abstract class Resource<
   TParams extends ResourceParams | CollectionParams | SubResourceParams,
> {
   protected constructor(
      protected readonly _transport: Transport,
      protected readonly _state: RequestState,
      protected readonly _params: TParams,
   ) {}

   protected clone(params: TParams): this {
      return new (
         this.constructor as new (
            transport: Transport,
            state: RequestState,
            params: TParams,
         ) => Resource<TParams>
      )(this._transport, this._state, params) as this;
   }

   /**
    * Returns the full request path for the current resource state.
    */
   toPath(): string {
      return [this._state.segments.join('/'), this.serialize()]
         .filter(Boolean)
         .join('/');
   }

   /**
    * Returns the parameter state after applying a partial update.
    */
   params(params: Partial<TParams>): this {
      return this.cloneWith(params);
   }

   protected cloneWith(patch: Partial<TParams>): this {
      return this.clone({
         ...this._params,
         ...patch,
      });
   }

   protected createChildState(): RequestState {
      return {
         ...this._state,
         segments: [...this._state.segments, this.serialize()],
         responseScope: this.getResponseScope(),
      };
   }

   protected getResponseScope(): ResponseScopeName[] {
      return [...(this._state.responseScope ?? []), this._params.name];
   }

   protected resolveResponseScope<TResult>(response: unknown): TResult {
      const responseScope = this.getResponseScope();
      const terminalScope = responseScope.at(-1);

      if (!terminalScope) {
         return response as TResult;
      }

      const resolved = findScopedValue(response, responseScope);

      if (resolved === undefined) {
         return response as TResult;
      }

      return {
         [terminalScope]: resolved,
      } as TResult;
   }

   async get(): Promise<unknown> {
      return this.performRequest('get');
   }

   async post(body?: Record<string, unknown> | string): Promise<unknown> {
      return this.performRequest('post', body);
   }

   async put(body?: Record<string, unknown> | string): Promise<unknown> {
      return this.performRequest('put', body);
   }

   async delete(): Promise<unknown> {
      return this.performRequest('delete');
   }

   protected async request<TResult>(
      method: HttpMethod,
      body?: Record<string, unknown> | string,
   ): Promise<TResult> {
      return this.performRequest<TResult>(method, body);
   }

   private async performRequest<TResult>(
      method: HttpMethod,
      body?: Record<string, unknown> | string,
   ): Promise<TResult> {
      const path = this.toPath();

      switch (method) {
         case 'get':
            return this.resolveResponseScope<TResult>(
               await this._transport.get(path),
            );
         case 'post':
            return this.resolveResponseScope<TResult>(
               await this._transport.post(path, body),
            );
         case 'put':
            return this.resolveResponseScope<TResult>(
               await this._transport.put(path, body),
            );
         case 'delete':
            return this.resolveResponseScope<TResult>(
               await this._transport.delete(path),
            );
      }
   }

   /**
    * Serializes the current resource identifier and any path parameters.
    */
   protected serialize(): string {
      let resourcePart = '';
      if (this._params.kind === 'resource') {
         resourcePart = `${this._params.name}/${encodeURIComponent(String(this._params.key))}`;
      } else if (
         this._params.kind === 'collection' ||
         this._params.kind === 'subResource'
      ) {
         resourcePart = `${this._params.name}`;
      }

      const paramPart = this.serializeParams(this._params);

      return resourcePart + paramPart;
   }

   /**
    * Serializes all non-structural params into Yahoo path segments.
    */
   protected serializeParams(params: Record<string, PathValue>): string {
      return Object.entries(params)
         .filter(([key]) => !['kind', 'name', 'key'].includes(key))
         .filter(([, value]) => value !== undefined)
         .map(([key, value]) => this.serializeParam(key, value))
         .join('');
   }

   /**
    * Serializes a single parameter using Yahoo's semicolon-delimited syntax.
    */
   protected serializeParam(key: string, value: PathValue): string {
      const enc = (value: unknown): string =>
         encodeURIComponent(String(value));

      if (
         value === undefined ||
         value === null ||
         value === '' ||
         (Array.isArray(value) && value.length === 0)
      ) {
         return '';
      }

      if (Array.isArray(value)) {
         return `;${enc(key)}=${[...new Set(value)].map((item) => enc(item)).join(',')}`;
      }

      return `;${enc(key)}=${enc(value)}`;
   }
}

function findScopedValue(
   value: unknown,
   scope: readonly string[],
): unknown {
   if (scope.length === 0) {
      return value;
   }

   if (Array.isArray(value)) {
      for (const item of value) {
         const resolved = findScopedValue(item, scope);
         if (resolved !== undefined) {
            return resolved;
         }
      }
      return undefined;
   }

   if (!isRecord(value)) {
      return undefined;
   }

   const [current, ...rest] = scope;

   if (!current) {
      return value;
   }

   if (current in value) {
      const resolved = findScopedValue(value[current], rest);
      if (resolved !== undefined) {
         return resolved;
      }
   }

   for (const nestedValue of Object.values(value)) {
      const resolved = findScopedValue(nestedValue, scope);
      if (resolved !== undefined) {
         return resolved;
      }
   }

   return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null;
}
