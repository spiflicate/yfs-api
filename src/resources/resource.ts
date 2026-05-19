// import type { Transport } from '../core/transport';
import type { HttpClient as Transport } from '../client/http';

type ResourceName =
   | 'game'
   | 'league'
   | 'team'
   | 'player'
   | 'roster'
   | 'transaction';

type CollectionName =
   | 'users'
   | 'games'
   | 'leagues'
   | 'teams'
   | 'players'
   | 'transactions';

type KeysParam<T extends string> = T extends `${infer Stem}s`
   ? `${Stem}_keys`
   : `${T}_keys`;

/**
 * Parameters for addressing a single Yahoo Fantasy resource instance.
 */
export type ResourceParams<
   TSubResource extends string,
   TKey extends string = string,
> = {
   type: 'resource';
   name: ResourceName;
   key: TKey;
   out: TSubResource[];
};

/**
 * Parameters for addressing a Yahoo Fantasy resource collection.
 */
export type CollectionParams<
   TSubResource extends string,
   TKey extends string = string,
   TKeyName extends CollectionName = CollectionName,
> = {
   type: 'collection';
   name: CollectionName;
   out: TSubResource[];
} & Partial<
   TKeyName extends 'users'
      ? Record<'use_login', '1'>
      : Record<KeysParam<TKeyName>, TKey[]>
>;

/**
 * Immutable request state accumulated while building a resource path.
 */
export interface RequestState {
   segments: string[];
   method?: string;
}

type Scalar = string | number | boolean;
type PathValue = Scalar | null | undefined | readonly Scalar[];

/**
 * Base abstraction for a Yahoo Fantasy API resource path builder.
 *
 * It stores the current path state, supports adding sub-resources, and
 * serializes resource parameters into Yahoo's semicolon-delimited path format.
 */
export abstract class Resource<
   TParams extends
      | ResourceParams<TSubResource>
      | CollectionParams<TSubResource>,
   TSubResource extends string,
> {
   protected constructor(
      protected readonly _transport: Transport,
      protected readonly _state: RequestState,
      protected readonly _params: TParams,
   ) {}

   protected abstract clone(params: TParams): this;

   /**
    * Returns the full request path for the current resource state.
    */
   toPath(): string {
      return [this._state.segments.join('/'), this.serialize()]
         .filter(Boolean)
         .join('/');
   }

   /**
    * Appends sub-resources to the current request and returns a cloned builder.
    */
   include(...subResources: readonly TSubResource[]): this {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      } as Partial<TParams>);
      // FIXME: the type assertion is a bit of a workaround, maybe refactor the type construciton
   }

   /**
    * Returns the parameter state after applying a partial update.
    */
   params(params: Partial<TParams>): this {
      return this.cloneWith(params);
   }

   /**
    * Executes a GET request for the serialized resource path.
    */
   async get(): Promise<unknown> {
      const path = this.toPath();
      return this._transport.get(path);
   }

   protected cloneWith(patch: Partial<TParams>): this {
      return this.clone({
         ...this._params,
         ...patch,
      });
   }

   /**
    * Serializes the current resource identifier and any path parameters.
    */
   protected serialize(): string {
      let resourcePart = '';
      if (this._params.type === 'resource') {
         resourcePart = `${this._params.name}/${encodeURIComponent(String(this._params.key))}`;
      } else if (this._params.type === 'collection') {
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
         .filter(([key]) => !['type', 'name', 'key'].includes(key))
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
