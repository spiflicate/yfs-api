import type { StageSpec } from './shared.js';
import {
   gamesCollectionParams,
   leagueOutValues,
   leagueRootParams,
   matchupParams,
   playerCollectionParamKeys,
   rosterCoverageParams,
   scoreboardParams,
   statsCoverageParams,
   teamOutValues,
   teamRootParams,
   transactionCollectionParams,
   transactionOutValues,
   usersGamesOutValues,
} from './shared.js';

export const userStages = {
   'users.games': {
      params: gamesCollectionParams,
      next: {
         leagues: 'users.games.leagues',
         teams: 'users.games.teams',
      },
      outValues: usersGamesOutValues,
      confidence: 'explicit',
   },
   'users.games.leagues': {
      params: leagueRootParams,
      next: {
         settings: 'users.games.leagues.settings',
         standings: 'users.games.leagues.standings',
         scoreboard: 'users.games.leagues.scoreboard',
         teams: 'users.games.leagues.teams',
         players: 'users.games.leagues.players',
         transactions: 'users.games.leagues.transactions',
         drafts: 'users.games.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'composed',
   },
   'users.games.teams': {
      params: teamRootParams,
      next: {
         roster: 'users.games.teams.roster',
         matchups: 'users.games.teams.matchups',
         stats: 'users.games.teams.stats',
         standings: 'users.games.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.leagues': {
      params: leagueRootParams,
      next: {
         settings: 'users.leagues.settings',
         standings: 'users.leagues.standings',
         scoreboard: 'users.leagues.scoreboard',
         teams: 'users.leagues.teams',
         players: 'users.leagues.players',
         transactions: 'users.leagues.transactions',
         drafts: 'users.leagues.drafts',
      },
      outValues: leagueOutValues,
      confidence: 'explicit',
   },
   'users.teams': {
      params: teamRootParams,
      next: {
         roster: 'users.teams.roster',
         matchups: 'users.teams.matchups',
         stats: 'users.teams.stats',
         standings: 'users.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'users.games.leagues.settings': { confidence: 'composed' },
   'users.games.leagues.standings': { confidence: 'composed' },
   'users.games.leagues.scoreboard': {
      params: scoreboardParams,
      confidence: 'composed',
   },
   'users.games.leagues.teams': {
      params: teamRootParams,
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.games.leagues.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'users.games.leagues.transactions': {
      params: transactionCollectionParams,
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'users.games.leagues.drafts': { confidence: 'experimental' },
   'users.games.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'users.games.teams.roster.players',
      },
      confidence: 'composed',
   },
   'users.games.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'users.games.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'users.games.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'users.games.teams.standings': { confidence: 'experimental' },
   'users.leagues.settings': { confidence: 'composed' },
   'users.leagues.standings': { confidence: 'composed' },
   'users.leagues.scoreboard': {
      params: scoreboardParams,
      confidence: 'composed',
   },
   'users.leagues.teams': {
      params: teamRootParams,
      outValues: teamOutValues,
      confidence: 'composed',
   },
   'users.leagues.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'users.leagues.transactions': {
      params: transactionCollectionParams,
      outValues: transactionOutValues,
      confidence: 'composed',
   },
   'users.leagues.drafts': { confidence: 'experimental' },
   'users.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'users.teams.roster.players',
      },
      confidence: 'composed',
   },
   'users.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'users.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'users.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'users.teams.standings': { confidence: 'experimental' },
} as const satisfies Record<string, StageSpec>;
