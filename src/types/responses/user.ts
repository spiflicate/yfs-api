/**
 * User resource types
 * @module
 */

import type { BaseMetadata, GameCode, ResourceKey } from '../common';

/**
 * Yahoo user GUID
 */
export type UserGUID = string;

/**
 * Represents a Yahoo user in the Fantasy Sports system.
 *
 * @interface User
 * @description Contains user profile information and their games and teams.
 */
export interface User extends BaseMetadata {
   /** User's unique global identifier (GUID) */
   guid: UserGUID;
   /** Games the user has participated in (optional) */
   games?: UserGame[];
}

/**
 * Represents a user's participation in a specific game.
 *
 * @interface UserGame
 * @description Contains game information and teams for that game.
 */
export interface UserGame {
   /** Unique identifier for the game in format "gameId" */
   gameKey: string;
   /** Numeric game identifier */
   gameId: string;
   /** Game code identifier (e.g., "nhl" for hockey) */
   gameCode: GameCode;
   /** The season/year of the game */
   season: number;
   /** User's teams in this game (optional) */
   teams?: UserTeam[];
}

/**
 * Represents a user's team summary.
 *
 * @interface UserTeam
 * @description Contains basic team information and league affiliation.
 */
export interface UserTeam {
   /** Unique identifier for the team */
   teamKey: ResourceKey;
   /** Numeric team identifier */
   teamId: string;
   /** Team name */
   name: string;
   /** URL to the team logo image (optional) */
   teamLogoUrl?: string;
   /** Waiver priority number for this team (optional) */
   waiverPriority?: number;
   /** Remaining FAAB balance (optional) */
   faabBalance?: number;
   /** Number of roster moves made (optional) */
   numberOfMoves?: number;
   /** Number of trades completed (optional) */
   numberOfTrades?: number;
   /** League the team belongs to */
   league: LeagueReference;
   /** URL to the team on Yahoo Fantasy Sports */
   url: string;
}

/**
 * Represents a reference to a league.
 *
 * @interface LeagueReference
 * @description Contains basic league information for context.
 */
export interface LeagueReference {
   /** Unique identifier for the league in format "gameId.l.leagueId" */
   leagueKey: ResourceKey;
   /** Numeric league identifier */
   leagueId: string;
   /** Display name of the league */
   name: string;
   /** URL to access the league on Yahoo Fantasy Sports */
   url: string;
}

/**
 * Parameters for retrieving user's games.
 *
 * @interface GetUserGamesParams
 * @description Optional filters for game retrieval.
 */
export interface GetUserGamesParams {
   /** Filter by one or more game codes (optional) */
   gameCodes?: GameCode[];
   /** Filter by one or more seasons (optional) */
   seasons?: number[];
   /** Include user's teams in response (optional) */
   includeTeams?: boolean;
}

/**
 * Parameters for retrieving user's teams.
 *
 * @interface GetUserTeamsParams
 * @description Optional filters for team retrieval.
 */
export interface GetUserTeamsParams {
   /** Filter by specific game code (optional) */
   gameCode?: GameCode;
   /** Filter by specific season (optional) */
   season?: number;
}
