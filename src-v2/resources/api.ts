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

   games(keys?: GameKeyLike[]): GamesCollection {
      return GamesCollection.create(
         this.transport,
         createRootState(),
         keys,
      );
   }

   league(key: LeagueKeyLike): LeagueResource {
      return LeagueResource.create(this.transport, createRootState(), key);
   }

   leagues(keys?: LeagueKeyLike[]): LeaguesCollection {
      return LeaguesCollection.create(
         this.transport,
         createRootState(),
         keys,
      );
   }

   team(key: TeamKeyLike): TeamResource {
      return TeamResource.create(this.transport, createRootState(), key);
   }

   teams(keys?: TeamKeyLike[]): TeamsCollection {
      return TeamsCollection.create(
         this.transport,
         createRootState(),
         keys,
      );
   }

   player(key: PlayerKeyLike): PlayerResource {
      return PlayerResource.create(this.transport, createRootState(), key);
   }

   players(keys?: PlayerKeyLike[]): PlayersCollection {
      return PlayersCollection.create(
         this.transport,
         createRootState(),
         keys,
      );
   }
}

export function createApi(transport: Transport): ApiRoot {
   return new ApiRoot(transport);
}
