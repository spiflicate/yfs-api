/**
 * Test script to verify array pattern detection across all XML fixtures
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { detectArrayPatterns } from '../src/utils/xmlParser';

const fixturesDir = join(__dirname, '../tests/fixtures/xml');
const xmlFiles = readdirSync(fixturesDir).filter((f) => f.endsWith('.xml'));

console.log(
   '=== Testing Array Pattern Detection Across All Fixtures ===\n',
);

const allPatterns = new Map<string, Set<string>>();

for (const file of xmlFiles) {
   const xml = readFileSync(join(fixturesDir, file), 'utf-8');
   const patterns = detectArrayPatterns(xml);

   if (patterns.size > 0) {
      console.log(`📄 ${file}:`);
      for (const [plural, singular] of patterns) {
         console.log(`   ${plural} -> ${singular}`);

         // Track unique patterns across all files
         if (!allPatterns.has(plural)) {
            allPatterns.set(plural, new Set());
         }
         allPatterns.get(plural)?.add(singular);
      }
      console.log();
   }
}

console.log('=== Summary of All Array Patterns ===\n');
console.log('Unique patterns found across all fixtures:');

const sortedPatterns = Array.from(allPatterns.entries()).sort((a, b) =>
   a[0].localeCompare(b[0]),
);

for (const [plural, singulars] of sortedPatterns) {
   const singularList = Array.from(singulars).join(', ');
   console.log(`  ${plural} -> ${singularList}`);
}

console.log(`\nTotal unique plural containers: ${allPatterns.size}`);

// Verify consistency - each plural should map to exactly one singular
const inconsistencies: string[] = [];
for (const [plural, singulars] of allPatterns) {
   if (singulars.size > 1) {
      inconsistencies.push(
         `${plural} maps to multiple singulars: ${Array.from(singulars).join(', ')}`,
      );
   }
}

if (inconsistencies.length > 0) {
   console.log('\n⚠️  Inconsistencies found:');
   for (const issue of inconsistencies) {
      console.log(`  - ${issue}`);
   }
} else {
   console.log('\n✅ All patterns are consistent!');
}
