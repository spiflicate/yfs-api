import type { Transport } from '../core/transport';

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

export type BaseParams<
   TType extends 'resource' | 'collection',
   TSubResource extends string,
   TKey extends string = string,
> = TType extends 'resource'
   ? {
        type: 'resource';
        name: ResourceName;
        key: TKey;
        out: TSubResource[];
     }
   : {
        type: 'collection';
        name: CollectionName;
        out: TSubResource[];
     };

export interface RequestState {
   segments: string[];
   method?: string;
}

export interface BaseSegment {
   resource: string;
}

type Scalar = string | number | boolean;
type PathValue = Scalar | null | undefined | readonly Scalar[];

export abstract class BaseResource<
   TParams extends BaseParams<TType, TSubResource>,
   TSubResource extends string,
   TType extends 'resource' | 'collection' = 'resource',
> {
   protected constructor(
      protected readonly transport: Transport,
      protected readonly state: RequestState,
      protected readonly params: TParams,
   ) {}

   toPath(): string {
      return [this.state.segments.join('/'), this.serialize()]
         .filter(Boolean)
         .join('/');
   }

   include(...subResources: readonly TSubResource[]): this {
      return this.cloneWith({
         out: [...this.params.out, ...subResources],
      } as Partial<TParams>);
      // FIXME: the type assertion is a bit of a workaround, maybe refactor the type construciton
   }

   protected cloneWith(patch: Partial<TParams>): this {
      return this.clone({
         ...this.params,
         ...patch,
      });
   }

   protected serialize(): string {
      let resourcePart = '';
      if (this.params.type === 'resource') {
         resourcePart = `${this.params.name}/${encodeURIComponent(String(this.params.key))}`;
      } else if (this.params.type === 'collection') {
         resourcePart = `${this.params.name}`;
      }

      const paramPart = this.serializeParams(this.params);

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

      if (value === undefined) {
         return '';
      }
      // FIXME: decide whether we want to include params with null values
      if (value === null) {
         return `;${enc(key)}=`;
      }

      if (Array.isArray(value)) {
         return `;${enc(key)}=${value.map((item) => enc(item)).join(',')}`;
      }

      return `;${enc(key)}=${enc(value)}`;
   }

   protected abstract clone(params: TParams): this;
}
