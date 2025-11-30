export type NHLPlayerPosition =
   | 'C' // Center
   | 'LW' // Left Wing
   | 'RW' // Right Wing
   | 'D' // Defense
   | 'G';

/**
 * Create all non-empty comma-separated permutations from a union of string literals.
 * Example:
 *   type U = 'A' | 'B' | 'C';
 *   type R = CommaSeparatedPermutations<U>;
 *   // R = 'A' | 'B' | 'C' | 'A,B' | 'A,C' | 'B,A' | 'B,C' | 'C,A' | 'C,B' |
 *   //     'A,B,C' | 'A,C,B' | 'B,A,C' | 'B,C,A' | 'C,A,B' | 'C,B,A'
 */
export type CommaSeparatedPermutations<U extends string> = [U] extends [
   never,
]
   ? never
   :
        | U
        | {
             [K in U]: `${K},${CommaSeparatedPermutations<Exclude<U, K>>}`;
          }[U];

/**
 * Create order-insensitive comma-separated combinations from a union of string literals.
 * No duplicate orderings are produced.
 */
type UnionToIntersection<U> = (
   U extends unknown
      ? (x: U) => unknown
      : never
) extends (x: infer I) => unknown
   ? I
   : never;

type LastOf<U extends string> = UnionToIntersection<
   U extends unknown ? (x: U) => unknown : never
> extends (x: infer L) => unknown
   ? L & string
   : never;

type UnionToTuple<
   U extends string,
   T extends readonly string[] = [],
   L extends string = LastOf<U>,
> = [U] extends [never] ? T : UnionToTuple<Exclude<U, L>, [L, ...T]>;

type JoinComma<T extends readonly string[]> = T extends [
   infer H extends string,
   ...infer R extends string[],
]
   ? R['length'] extends 0
      ? H
      : `${H},${JoinComma<R>}`
   : never;

type Subsets<T extends readonly string[]> = T extends [
   infer H extends string,
   ...infer R extends string[],
]
   ?
        | JoinComma<[H]>
        | (Subsets<R> extends never ? never : `${H},${Subsets<R>}`)
        | Subsets<R>
   : never;

export type CommaSeparatedCombinations<U extends string> = Subsets<
   UnionToTuple<U>
>;

/**
 * Order-preserving combinations from an explicit canonical tuple.
 * This guarantees the output uses the tuple's left-to-right order.
 */
type TupleSubsets<T extends readonly string[]> = T extends [
   infer H extends string,
   ...infer R extends string[],
]
   ?
        | JoinComma<[H]>
        | (TupleSubsets<R> extends never
             ? never
             : `${H},${TupleSubsets<R>}`)
        | TupleSubsets<R>
   : never;

export type CommaSeparatedCombinationsFromTuple<
   T extends readonly string[],
> = TupleSubsets<T>;

// Example: build combos from NHLPlayerPosition literals
// Canonical NHL player position order for combinations
export type NHLPlayerPositionOrder = ['C', 'LW', 'RW'];

export type NHLPlayerPositionCombos =
   CommaSeparatedCombinationsFromTuple<NHLPlayerPositionOrder>;
