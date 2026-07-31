import { resolveFrontendRoute } from '../../src/client/frontend.js';

export type ProbeHost = 'readOnly' | 'readWrite' | 'neutral';
export type ProbeAuth = 'public' | 'cookie';

export interface FrontendProbeDefinition {
   id: string;
   description: string;
   host: ProbeHost;
   path: string;
   category: 'current' | 'candidate' | 'negative';
   requires?: readonly string[];
}

const leagueKey = process.env.YAHOO_FRONTEND_LEAGUE_KEY ?? 'nhl.l.example';
const teamKey = process.env.YAHOO_FRONTEND_TEAM_KEY ?? 'nhl.l.example.t.1';
const playerKey = process.env.YAHOO_FRONTEND_PLAYER_KEY ?? 'nhl.p.example';
const transactionKey =
   process.env.YAHOO_FRONTEND_TRANSACTION_KEY ?? 'nhl.l.example.tr.1';

export const FRONTEND_PROBE_MATRIX: readonly FrontendProbeDefinition[] = [
   {
      id: 'current-game',
      description: 'Observed public game resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl',
      category: 'current',
   },
   {
      id: 'current-league-teams',
      description: 'Observed league-to-teams read',
      host: 'readWrite',
      path: `/fantasy/v2/league/${leagueKey}/teams`,
      category: 'current',
      requires: ['YAHOO_FRONTEND_LEAGUE_KEY'],
   },
   {
      id: 'current-v3-crumb',
      description: 'Observed v3 crumb service',
      host: 'neutral',
      path: '/fantasy/v3/getCrumb',
      category: 'current',
   },
   {
      id: 'candidate-games-collection',
      description: 'Root games collection',
      host: 'readOnly',
      path: '/fantasy/v2/games;game_codes=nhl',
      category: 'current',
   },
   {
      id: 'candidate-game-players',
      description: 'Game player collection',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/players;count=1',
      category: 'current',
   },
   {
      id: 'candidate-game-dates',
      description: 'Game dates sub-resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/dates',
      category: 'current',
   },
   {
      id: 'candidate-game-weeks',
      description: 'Game weeks sub-resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/game_weeks',
      category: 'current',
   },
   {
      id: 'candidate-game-stat-categories',
      description: 'Game stat categories sub-resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/stat_categories',
      category: 'current',
   },
   {
      id: 'candidate-game-position-types',
      description: 'Game position types sub-resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/position_types',
      category: 'current',
   },
   {
      id: 'candidate-game-roster-positions',
      description: 'Game roster positions sub-resource',
      host: 'readOnly',
      path: '/fantasy/v2/game/nhl/roster_positions',
      category: 'current',
   },
   {
      id: 'candidate-league-draftresults',
      description: 'League draft results sub-resource',
      host: 'readOnly',
      path: `/fantasy/v2/league/${leagueKey}/draftresults`,
      category: 'candidate',
      requires: ['YAHOO_FRONTEND_LEAGUE_KEY'],
   },
   {
      id: 'candidate-team-standings',
      description: 'Team standings sub-resource',
      host: 'readOnly',
      path: `/fantasy/v2/team/${teamKey}/standings`,
      category: 'candidate',
      requires: ['YAHOO_FRONTEND_TEAM_KEY'],
   },
   {
      id: 'current-league-players',
      description: 'League player collection',
      host: 'readOnly',
      path: `/fantasy/v2/league/${leagueKey}/players;count=1`,
      category: 'current',
      requires: ['YAHOO_FRONTEND_LEAGUE_KEY'],
   },
   {
      id: 'candidate-transactions',
      description: 'Top-level transactions collection',
      host: 'readOnly',
      path: `/fantasy/v2/transactions;transaction_keys=${transactionKey}`,
      category: 'candidate',
      requires: ['YAHOO_FRONTEND_TRANSACTION_KEY'],
   },
   {
      id: 'negative-unknown-child',
      description: 'Unknown child of an observed resource',
      host: 'readOnly',
      path: `/fantasy/v2/team/${teamKey}/not-a-real-child`,
      category: 'negative',
      requires: ['YAHOO_FRONTEND_TEAM_KEY'],
   },
   {
      id: 'negative-v3-write-shaped-path',
      description: 'Unknown v3 write-shaped path, probed as GET',
      host: 'neutral',
      path: '/fantasy/v3/not-a-real-service',
      category: 'negative',
   },
   {
      id: 'current-player',
      description: 'Observed player resource boundary',
      host: 'readOnly',
      path: `/fantasy/v2/player/${playerKey}`,
      category: 'current',
      requires: ['YAHOO_FRONTEND_PLAYER_KEY'],
   },
];

export function localPolicy(path: string): 'allowed' | 'rejected' {
   try {
      resolveFrontendRoute('GET', path);
      return 'allowed';
   } catch {
      return 'rejected';
   }
}

export function missingRequirements(
   definition: FrontendProbeDefinition,
): string[] {
   return (definition.requires ?? []).filter((name) => !process.env[name]);
}
