import type {
   YahooGameDto,
   YahooLeagueDto,
   YahooLoggedInUserDto,
   YahooPlayerDto,
   YahooTeamDto,
   YahooTransactionDto,
} from './normalized';

/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface GameResponse {
   game: YahooGameDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface GamesResponse {
   games: YahooGameDto[];
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface LeagueResponse {
   league: YahooLeagueDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface LeaguesResponse {
   leagues: YahooLeagueDto[];
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface PlayerResponse {
   player: YahooPlayerDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface PlayersResponse {
   players: YahooPlayerDto[];
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface TeamResponse {
   team: YahooTeamDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface TeamsResponse {
   teams: YahooTeamDto[];
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface TransactionResponse {
   transaction: YahooTransactionDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface TransactionsResponse {
   transactions: YahooTransactionDto[];
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface UserResponse {
   user: YahooLoggedInUserDto;
}
/** Legacy resource typing; exact endpoint narrowing is deferred. */
export interface UsersResponse {
   users: YahooLoggedInUserDto[];
}
