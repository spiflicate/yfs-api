import type { HttpClient as Transport } from '../client/http.js';
import { GameResource, GamesCollection } from './game.js';
import { LeagueResource, LeaguesCollection } from './league.js';
import { PlayerResource, PlayersCollection } from './player.js';
import type { RequestState } from './resource.js';
import { TeamResource, TeamsCollection } from './team.js';
import type {
   GameKeyLike,
   LeagueKeyLike,
   PlayerKeyLike,
   TeamKeyLike,
} from './types.js';
import { UsersCollection } from './user.js';

// FIXME: this needs to go somewhere, just here for safe keeping
export const scoreboardParams = ['week', 'date'] as const;
export const rosterCoverageParams = ['week', 'date'] as const;
export const matchupParams = ['weeks'] as const;
export const statsCoverageParams = ['type', 'week', 'date'] as const;

const createRootState = (): RequestState => ({
   segments: [],
});

export class ApiRoot {
   constructor(private readonly transport: Transport) {}

   users(): UsersCollection {
      return UsersCollection.create(this.transport, createRootState());
   }

   game(key: GameKeyLike): GameResource {
      return GameResource.create(this.transport, createRootState(), key);
   }

   games(key: GameKeyLike, ...keys: GameKeyLike[]): GamesCollection;
   games(keys: readonly [GameKeyLike, ...GameKeyLike[]]): GamesCollection;
   games(
      keyOrKeys?: GameKeyLike | readonly GameKeyLike[],
      ...keys: GameKeyLike[]
   ): GamesCollection {
      return GamesCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('game', keyOrKeys, keys),
      );
   }

   league(key: LeagueKeyLike): LeagueResource {
      return LeagueResource.create(this.transport, createRootState(), key);
   }

   leagues(key: LeagueKeyLike, ...keys: LeagueKeyLike[]): LeaguesCollection;
   leagues(
      keys: readonly [LeagueKeyLike, ...LeagueKeyLike[]],
   ): LeaguesCollection;
   leagues(
      keyOrKeys?: LeagueKeyLike | readonly LeagueKeyLike[],
      ...keys: LeagueKeyLike[]
   ): LeaguesCollection {
      return LeaguesCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('league', keyOrKeys, keys),
      );
   }

   team(key: TeamKeyLike): TeamResource {
      return TeamResource.create(this.transport, createRootState(), key);
   }

   teams(key: TeamKeyLike, ...keys: TeamKeyLike[]): TeamsCollection;
   teams(keys: readonly [TeamKeyLike, ...TeamKeyLike[]]): TeamsCollection;
   teams(
      keyOrKeys?: TeamKeyLike | readonly TeamKeyLike[],
      ...keys: TeamKeyLike[]
   ): TeamsCollection {
      return TeamsCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('team', keyOrKeys, keys),
      );
   }

   player(key: PlayerKeyLike): PlayerResource {
      return PlayerResource.create(this.transport, createRootState(), key);
   }

   players(key: PlayerKeyLike, ...keys: PlayerKeyLike[]): PlayersCollection;
   players(
      keys: readonly [PlayerKeyLike, ...PlayerKeyLike[]],
   ): PlayersCollection;
   players(
      keyOrKeys?: PlayerKeyLike | readonly PlayerKeyLike[],
      ...keys: PlayerKeyLike[]
   ): PlayersCollection {
      return PlayersCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('player', keyOrKeys, keys),
      );
   }
}

function requireRootKeys<T>(
   resource: string,
   keyOrKeys: T | readonly T[] | undefined,
   remainingKeys: readonly T[],
): [T, ...T[]] {
   const keys = Array.isArray(keyOrKeys)
      ? [...keyOrKeys]
      : keyOrKeys === undefined
        ? []
        : [keyOrKeys, ...remainingKeys];

   if (keys.length === 0) {
      throw new TypeError(`At least one ${resource} key is required.`);
   }

   return keys as [T, ...T[]];
}

export function createApi(transport: Transport): ApiRoot {
   return new ApiRoot(transport);
}
