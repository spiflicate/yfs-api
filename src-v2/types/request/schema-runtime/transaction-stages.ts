import type { StageSpec } from './shared.js';

export const transactionStages = {
   'transaction.players': { confidence: 'explicit' },
} as const satisfies Record<string, StageSpec>;
