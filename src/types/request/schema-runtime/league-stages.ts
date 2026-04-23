import type { StageSpec } from './shared.js';
import {
   leagueOutValues,
   playerCollectionParams,
   playerOutValues,
   scoreboardParams,
   teamOutValues,
   teamRootParams,
   transactionCollectionParams,
   transactionOutValues,
   transactionTraversalParams,
} from './shared.js';

export const leagueStages = {
   'league.settings': { confidence: 'explicit' },
   'league.standings': { confidence: 'explicit' },
   'league.scoreboard': {
      params: scoreboardParams,
      confidence: 'explicit',
   },
   'league.teams': {
      params: teamRootParams,
      next: {
         roster: 'league.teams.roster',
         matchups: 'league.teams.matchups',
         stats: 'league.teams.stats',
         standings: 'league.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'league.players': {
      params: playerCollectionParams,
      next: {
         stats: 'league.players.stats',
         ownership: 'league.players.ownership',
         percentOwned: 'league.players.percent_owned',
         draftAnalysis: 'league.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'league.transactions': {
      params: transactionCollectionParams,
      next: {
         players: 'league.transactions.players',
      },
      outValues: transactionOutValues,
      writeMethods: ['create', 'edit', 'cancel'],
      serializeObjectBodyAsYahooXml: true,
      confidence: 'explicit',
   },
   'league.transactions.players': {
      params: transactionTraversalParams,
      confidence: 'explicit',
   },
   'league.drafts': { confidence: 'experimental' },
   'leagues.settings': { confidence: 'explicit' },
   'leagues.standings': { confidence: 'explicit' },
   'leagues.scoreboard': {
      params: scoreboardParams,
      confidence: 'explicit',
   },
   'leagues.teams': {
      params: teamRootParams,
      next: {
         roster: 'leagues.teams.roster',
         matchups: 'leagues.teams.matchups',
         stats: 'leagues.teams.stats',
         standings: 'leagues.teams.standings',
      },
      outValues: teamOutValues,
      confidence: 'explicit',
   },
   'leagues.players': {
      params: playerCollectionParams,
      next: {
         stats: 'leagues.players.stats',
         ownership: 'leagues.players.ownership',
         percentOwned: 'leagues.players.percent_owned',
         draftAnalysis: 'leagues.players.draft_analysis',
      },
      outValues: playerOutValues,
      confidence: 'explicit',
   },
   'leagues.transactions': {
      params: transactionCollectionParams,
      next: {
         players: 'leagues.transactions.players',
      },
      outValues: transactionOutValues,
      confidence: 'explicit',
   },
   'leagues.transactions.players': {
      params: transactionTraversalParams,
      confidence: 'explicit',
   },
   'leagues.drafts': { confidence: 'experimental' },
   'league.players.stats': {
      params: scoreboardParams,
      confidence: 'composed',
   },
   'league.players.ownership': { confidence: 'composed' },
   'league.players.percent_owned': { confidence: 'composed' },
   'league.players.draft_analysis': { confidence: 'experimental' },
   'leagues.players.stats': {
      params: scoreboardParams,
      confidence: 'composed',
   },
   'leagues.players.ownership': { confidence: 'composed' },
   'leagues.players.percent_owned': { confidence: 'composed' },
   'leagues.players.draft_analysis': { confidence: 'experimental' },
} as const satisfies Record<string, StageSpec>;
