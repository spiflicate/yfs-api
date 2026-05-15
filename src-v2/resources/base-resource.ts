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

export type ResourceParams<
   TSubResource extends string,
   TKey extends string = string,
> = {
   type: 'resource';
   name: ResourceName;
   key: TKey;
   out: TSubResource[];
};
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
      ? Record<'use_login', boolean>
      : Record<KeysParam<TKeyName>, TKey[]>
>;

export interface RequestState {
   segments: string[];
   method?: string;
}

type Scalar = string | number | boolean;
type PathValue = Scalar | null | undefined | readonly Scalar[];

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

   toPath(): string {
      return [this._state.segments.join('/'), this.serialize()]
         .filter(Boolean)
         .join('/');
   }

   include(...subResources: readonly TSubResource[]): this {
      return this.cloneWith({
         out: [...this._params.out, ...subResources],
      } as Partial<TParams>);
      // FIXME: the type assertion is a bit of a workaround, maybe refactor the type construciton
   }

   params(params: Partial<TParams>): TParams {
      return this.cloneWith(params)._params;
   }

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

   protected serializeParams(params: Record<string, PathValue>): string {
      return Object.entries(params)
         .filter(([key]) => !['type', 'name', 'key'].includes(key))
         .filter(([, value]) => value !== undefined)
         .map(([key, value]) => this.serializeParam(key, value))
         .join('');
   }

   protected serializeParam(key: string, value: PathValue): string {
      const enc = (value: unknown): string =>
         encodeURIComponent(String(value));

      if (
         value === undefined ||
         value === '' ||
         (Array.isArray(value) && value.length === 0)
      ) {
         return '';
      }
      // FIXME: decide whether we want to include params with null values
      if (value === null) {
         return ''; //`;${enc(key)}=`;
      }

      if (Array.isArray(value)) {
         return `;${enc(key)}=${value.map((item) => enc(item)).join(',')}`;
      }

      return `;${enc(key)}=${enc(value)}`;
   }
}

export abstract class Collection<
   TParams extends CollectionParams<TSubResource>,
   TSubResource extends string,
> extends Resource<TParams, TSubResource> {}
