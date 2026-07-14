type ResponseKey = string | number | symbol;

/** A bounded path through a normalized Yahoo response envelope. */
export type ResponsePath =
   | readonly [ResponseKey]
   | readonly [ResponseKey, ResponseKey]
   | readonly [ResponseKey, ResponseKey, ResponseKey]
   | readonly [ResponseKey, ResponseKey, ResponseKey, ResponseKey]
   | readonly [
        ResponseKey,
        ResponseKey,
        ResponseKey,
        ResponseKey,
        ResponseKey,
     ]
   | readonly [
        ResponseKey,
        ResponseKey,
        ResponseKey,
        ResponseKey,
        ResponseKey,
        ResponseKey,
     ];

type RequireOnePath<
   TValue,
   TPath extends ResponsePath,
> = TPath extends readonly [infer TKey extends ResponseKey, ...infer TRest]
   ? NonNullable<TValue> extends readonly (infer TItem)[]
      ? NonNullable<TValue> extends unknown[]
         ? Array<RequireOnePath<TItem, TPath>>
         : ReadonlyArray<RequireOnePath<TItem, TPath>>
      : TKey extends keyof NonNullable<TValue>
        ? Omit<NonNullable<TValue>, TKey> & {
             [TRequiredKey in TKey]-?: TRest extends ResponsePath
                ? RequireOnePath<NonNullable<TValue>[TRequiredKey], TRest>
                : NonNullable<NonNullable<TValue>[TRequiredKey]>;
          }
        : never
   : NonNullable<TValue>;

type UnionToIntersection<TValue> = (
   TValue extends TValue
      ? (value: TValue) => void
      : never
) extends (value: infer TIntersection) => void
   ? TIntersection
   : never;

/**
 * Requires one or more known paths while retaining the complete root envelope.
 * A union of paths is expanded as an intersection, supporting multi-include calls.
 */
export type RequireResponsePath<
   TRoot,
   TPath extends ResponsePath,
> = UnionToIntersection<
   TPath extends TPath ? RequireOnePath<TRoot, TPath> : never
>;

export type AppendResponsePath<
   TPath extends ResponsePath,
   TKey extends ResponseKey,
> = TPath extends TPath
   ? readonly [...TPath, TKey] extends ResponsePath
      ? readonly [...TPath, TKey]
      : never
   : never;
