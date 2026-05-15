import type { GameCode, GameKey, LeagueKey } from './common.types';

export type TypeLike<T extends string> = T | (string & {});

export type GameKeyLike = TypeLike<GameKey | GameCode>;

export type LeagueKeyLike = TypeLike<LeagueKey>;
