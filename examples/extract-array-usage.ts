/**
 * Example demonstrating array pattern detection in Yahoo Fantasy XML responses
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
   detectArrayPatterns,
   extractArray,
   parseYahooXML,
} from '../src/utils/xmlParser';

// Read sample XML fixture
const xmlPath = join(__dirname, '../tests/fixtures/xml/league-teams.xml');
const xml = readFileSync(xmlPath, 'utf-8');

console.log('=== Detecting Array Patterns in Yahoo Fantasy XML ===\n');

// Detect all array patterns in the XML
const patterns = detectArrayPatterns(xml);

console.log('Found array patterns:');
for (const [plural, singular] of patterns) {
   console.log(`  ${plural} -> ${singular}`);
}

console.log('\n=== Using extractArray to get data ===\n');

// Parse the XML
const data = parseYahooXML<{
   league: Record<string, unknown>;
}>(xml);

// Extract teams array using detected patterns
const teams = extractArray(xml, data.league, 'teams');
console.log(`Teams extracted: ${teams?.length || 0} teams found`);

if (teams && teams.length > 0) {
   const firstTeam = teams[0] as Record<string, unknown>;
   console.log(`First team: ${firstTeam.name}`);

   // Teams might have managers - try to extract those too
   const managersXml = xml.substring(
      xml.indexOf('<managers>'),
      xml.indexOf('</managers>') + 11,
   );

   if (managersXml) {
      const managerPatterns = detectArrayPatterns(managersXml);
      console.log('\nManager patterns found:');
      for (const [plural, singular] of managerPatterns) {
         console.log(`  ${plural} -> ${singular}`);
      }
   }
}

console.log('\n=== Testing with different XML structures ===\n');

// Test with various XML patterns
const testCases = [
   {
      name: 'Players',
      xml: '<players count="5"><player><player_id>1</player_id></player></players>',
   },
   {
      name: 'Matches',
      xml: '<matches><match><match_id>1</match_id></match></matches>',
   },
   {
      name: 'Categories',
      xml: '<categories><category><name>Test</name></category></categories>',
   },
   {
      name: 'Stats (nested)',
      xml: '<stats><stat><stat_id>1</stat_id></stat></stats>',
   },
   {
      name: 'Not an array (status)',
      xml: '<status>active</status>',
   },
   {
      name: 'Not an array (settings)',
      xml: '<settings><draft_type>snake</draft_type></settings>',
   },
];

for (const testCase of testCases) {
   const testPatterns = detectArrayPatterns(testCase.xml);
   const patternsStr = Array.from(testPatterns.entries())
      .map(([p, s]) => `${p}->${s}`)
      .join(', ');

   console.log(
      `${testCase.name}: ${patternsStr || 'No array patterns detected'}`,
   );
}

console.log('\n✅ Array pattern detection complete!');
