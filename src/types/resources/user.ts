/**
 * User resource types
 * @module
 */

import type { BaseMetadata, GameCode, ResourceKey } from '../common';

export interface UserResourceResponse {
   users: User;
}

export interface UsersResourceResponse {
   users: User[];
}

/**
 * Yahoo user GUID
 */
export type UserGUID = string;

/**
 * User information
 */
export interface User extends BaseMetadata {
   /** User's unique GUID */
   guid: UserGUID;
   /** Games the user has participated in */
   games?: UserGame[];
}

/**
 * User's game information
 */
export interface UserGame {
   /** Game key */
   gameKey: string;
   /** Game ID */
   gameId: string;
   /** Game code (sport) */
   gameCode: GameCode;
   /** Season year */
   season: number;
   /** User's teams in this game */
   teams?: UserTeam[];
}

/**
 * User's team summary
 */
export interface UserTeam {
   /** Team key */
   teamKey: ResourceKey;
   /** Team ID */
   teamId: string;
   /** Team name */
   name: string;
   /** Team logo URL */
   teamLogoUrl?: string;
   /** Waiver priority */
   waiverPriority?: number;
   /** FAAB balance */
   faabBalance?: number;
   /** Number of moves made */
   numberOfMoves?: number;
   /** Number of trades made */
   numberOfTrades?: number;
   /** League the team belongs to */
   league: {
      /** League key */
      leagueKey: ResourceKey;
      /** League ID */
      leagueId: string;
      /** League name */
      name: string;
      /** URL to league page */
      url: string;
   };
   /** URL to team page */
   url: string;
}

/**
 * Parameters for getting user's games
 */
export interface GetUserGamesParams {
   /** Filter by game codes */
   gameCodes?: GameCode[];
   /** Filter by seasons */
   seasons?: number[];
   /** Include user's teams */
   includeTeams?: boolean;
}

/**
 * Parameters for getting user's teams
 */
export interface GetUserTeamsParams {
   /** Filter by game code */
   gameCode?: GameCode;
   /** Filter by season */
   season?: number;
}
