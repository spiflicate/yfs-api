import { describe, expect, test } from 'bun:test';
import { FRONTEND_PROBE_MATRIX, localPolicy } from './route-matrix.js';

describe('frontend verification matrix', () => {
   test('has unique ids and only GET-safe probe definitions', () => {
      const ids = FRONTEND_PROBE_MATRIX.map((definition) => definition.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(
         FRONTEND_PROBE_MATRIX.every((definition) =>
            definition.path.startsWith('/'),
         ),
      ).toBe(true);
   });

   test('marks current adapter coverage as locally allowed', () => {
      for (const definition of FRONTEND_PROBE_MATRIX.filter(
         ({ category }) => category === 'current',
      )) {
         expect(localPolicy(definition.path)).toBe('allowed');
      }
   });

   test('keeps candidate and negative routes outside the current allowlist', () => {
      for (const definition of FRONTEND_PROBE_MATRIX.filter(
         ({ category }) => category !== 'current',
      )) {
         expect(localPolicy(definition.path)).toBe('rejected');
      }
   });
});
