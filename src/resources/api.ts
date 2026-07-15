import type { HttpClient as Transport } from '../client/http.js';
import { GameResource, GamesCollection } from './game.js';
import { LeagueResource, LeaguesCollection } from './league.js';
import { PlayerResource, PlayersCollection } from './player.js';
import { copyKeys, type RequestState } from './resource.js';
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

   games(keys: readonly [GameKeyLike, ...GameKeyLike[]]): GamesCollection {
      return GamesCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('game', keys),
      );
   }

   league(key: LeagueKeyLike): LeagueResource {
      return LeagueResource.create(this.transport, createRootState(), key);
   }

   leagues(
      keys: readonly [LeagueKeyLike, ...LeagueKeyLike[]],
   ): LeaguesCollection {
      return LeaguesCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('league', keys),
      );
   }

   team(key: TeamKeyLike): TeamResource {
      return TeamResource.create(this.transport, createRootState(), key);
   }

   teams(keys: readonly [TeamKeyLike, ...TeamKeyLike[]]): TeamsCollection {
      return TeamsCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('team', keys),
      );
   }

   player(key: PlayerKeyLike): PlayerResource {
      return PlayerResource.create(this.transport, createRootState(), key);
   }

   players(
      keys: readonly [PlayerKeyLike, ...PlayerKeyLike[]],
   ): PlayersCollection {
      return PlayersCollection.create(
         this.transport,
         createRootState(),
         requireRootKeys('player', keys),
      );
   }
}

function requireRootKeys<T>(
   resource: string,
   keys: readonly T[] | undefined,
): [T, ...T[]] {
   if (keys === undefined || keys.length === 0) {
      throw new TypeError(`At least one ${resource} key is required.`);
   }

   return copyKeys(keys) as [T, ...T[]];
}

export function createApi(transport: Transport): ApiRoot {
   return new ApiRoot(transport);
}
