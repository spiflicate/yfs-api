import type { StageSpec } from './shared.js';
import { statsCoverageParams } from './shared.js';

export const playerStages = {
   'player.stats': {
      params: statsCoverageParams,
      confidence: 'explicit',
   },
   'player.ownership': { confidence: 'explicit' },
   'player.percent_owned': { confidence: 'explicit' },
   'player.draft_analysis': { confidence: 'experimental' },
   'players.stats': {
      params: statsCoverageParams,
      confidence: 'explicit',
   },
   'players.ownership': { confidence: 'composed' },
   'players.percent_owned': { confidence: 'composed' },
   'players.draft_analysis': { confidence: 'experimental' },
} as const satisfies Record<string, StageSpec>;
