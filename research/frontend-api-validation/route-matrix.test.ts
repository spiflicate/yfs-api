import { describe, expect, test } from 'bun:test';
import { adapterHost, FRONTEND_PROBE_MATRIX } from './route-matrix.js';

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

   test('probes each route on the host the adapter would select', () => {
      for (const definition of FRONTEND_PROBE_MATRIX) {
         expect(adapterHost(definition.path)).toBe(definition.host);
      }
   });
});
