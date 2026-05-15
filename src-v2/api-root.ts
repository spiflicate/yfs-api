import type { GameKeyLike } from '../../src/types/request';
import type { Transport } from './core/transport';
import { GameResource, GamesCollection } from './resources/game';

// temporary types
abstract class UsersCollection {}
abstract class LeagueResource {}
abstract class LeaguesCollection {}
abstract class TeamResource {}
abstract class TeamsCollection {}
abstract class PlayerResource {}
abstract class PlayersCollection {}
// end temporary types

export class YahooFantasySportsApi {
   constructor(private readonly transport: Transport) {}

   users(): UsersCollection {
      return UsersCollection.create(this.transport);
   }
   game(key: GameKeyLike): GameResource {
      return GameResource.create(this.transport, key);
   }
   games(keys?: GameKeyLike[]): GamesCollection {
      return GamesCollection.create(this.transport, keys || []);
   }
   league(key: LeagueKeyLike): LeagueResource {
      return LeagueResource.create(this.transport, key);
   }
   leagues(keys?: LeagueKeyLike[]): LeaguesCollection {
      return LeaguesCollection.create(this.transport, keys || []);
   }
   team(key: TeamKeyLike): TeamResource {
      return TeamResource.create(this.transport, key);
   }
   teams(keys?: TeamKeyLike[]): TeamsCollection {
      return TeamsCollection.create(this.transport, keys || []);
   }
   player(key: PlayerKeyLike): PlayerResource {
      return PlayerResource.create(this.transport, key);
   }
   players(keys?: PlayerKeyLike[]): PlayersCollection {
      return PlayersCollection.create(this.transport, keys || []);
   }
}
