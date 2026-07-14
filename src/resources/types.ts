import type {
   GameCode,
   GameKey,
   LeagueKey,
   PendingTradeKey,
   PlayerKey,
   TeamKey,
   TransactionKey,
   WaiverClaimKey,
} from '../domain/common.js';

export type TypeLike<T extends string> = T | (string & {});

export type GameKeyLike = TypeLike<GameKey | GameCode>;

export type LeagueKeyLike = TypeLike<LeagueKey>;

export type TeamKeyLike = TypeLike<TeamKey>;

export type PlayerKeyLike = TypeLike<PlayerKey>;

export type TransactionKeyLike = TypeLike<
   TransactionKey | WaiverClaimKey | PendingTradeKey
>;
