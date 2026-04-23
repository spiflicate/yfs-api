import type { StageSpec } from './shared.js';
import {
   matchupParams,
   playerCollectionParamKeys,
   rosterCoverageParams,
   statsCoverageParams,
} from './shared.js';

export const teamStages = {
   'team.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'team.roster.players',
      },
      writeMethods: ['updateLineup'],
      serializeObjectBodyAsYahooXml: true,
      confidence: 'explicit',
   },
   'team.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'explicit',
   },
   'team.matchups': {
      params: matchupParams,
      confidence: 'explicit',
   },
   'team.stats': {
      params: statsCoverageParams,
      confidence: 'explicit',
   },
   'team.standings': { confidence: 'experimental' },
   'teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'teams.roster.players',
      },
      confidence: 'explicit',
   },
   'teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'explicit',
   },
   'teams.matchups': {
      params: matchupParams,
      confidence: 'explicit',
   },
   'teams.stats': {
      params: statsCoverageParams,
      confidence: 'explicit',
   },
   'teams.standings': { confidence: 'experimental' },
   'league.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'league.teams.roster.players',
      },
      confidence: 'composed',
   },
   'league.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'league.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'league.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'league.teams.standings': { confidence: 'experimental' },
   'leagues.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'leagues.teams.roster.players',
      },
      confidence: 'composed',
   },
   'leagues.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'leagues.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'leagues.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'leagues.teams.standings': { confidence: 'experimental' },
   'game.leagues.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'game.leagues.teams.roster.players',
      },
      confidence: 'composed',
   },
   'game.leagues.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'game.leagues.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'game.leagues.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'game.leagues.teams.standings': { confidence: 'experimental' },
   'games.leagues.teams.roster': {
      params: rosterCoverageParams,
      next: {
         players: 'games.leagues.teams.roster.players',
      },
      confidence: 'composed',
   },
   'games.leagues.teams.roster.players': {
      params: playerCollectionParamKeys,
      confidence: 'composed',
   },
   'games.leagues.teams.matchups': {
      params: matchupParams,
      confidence: 'composed',
   },
   'games.leagues.teams.stats': {
      params: statsCoverageParams,
      confidence: 'composed',
   },
   'games.leagues.teams.standings': { confidence: 'experimental' },
} as const satisfies Record<string, StageSpec>;
