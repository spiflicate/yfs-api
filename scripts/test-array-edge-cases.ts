/**
 * Test edge cases and validation for array pattern detection
 */

import {
   detectArrayPatterns,
   extractArray,
   parseYahooXML,
} from '../src/utils/xmlParser';

console.log('=== Testing Edge Cases for Array Pattern Detection ===\n');

const testCases = [
   {
      name: 'Simple plural with "s"',
      xml: '<teams><team>A</team><team>B</team></teams>',
      expected: new Map([['teams', 'team']]),
   },
   {
      name: 'Plural with "es"',
      xml: '<matches><match>1</match></matches>',
      expected: new Map([['matches', 'match']]),
   },
   {
      name: 'Plural with "ies" (category -> categories)',
      xml: '<categories><category>test</category></categories>',
      expected: new Map([['categories', 'category']]),
   },
   {
      name: 'False positive: status (not array)',
      xml: '<status>active</status>',
      expected: new Map(),
   },
   {
      name: 'False positive: settings containing different children',
      xml: '<settings><draft_type>snake</draft_type><scoring>points</scoring></settings>',
      expected: new Map(),
   },
   {
      name: 'Nested arrays',
      xml: '<teams><team><players><player>1</player></players></team></teams>',
      expected: new Map([
         ['teams', 'team'],
         ['players', 'player'],
      ]),
   },
   {
      name: 'Multiple different containers',
      xml: '<data><teams><team>A</team></teams><players><player>B</player></players></data>',
      expected: new Map([
         ['teams', 'team'],
         ['players', 'player'],
      ]),
   },
   {
      name: 'Container with attributes',
      xml: '<teams count="5"><team id="1">A</team></teams>',
      expected: new Map([['teams', 'team']]),
   },
   {
      name: 'Self-closing empty container',
      xml: '<teams/>',
      expected: new Map(),
   },
   {
      name: 'Underscore-separated tags',
      xml: '<team_logos><team_logo>url</team_logo></team_logos>',
      expected: new Map([['team_logos', 'team_logo']]),
   },
];

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
   const result = detectArrayPatterns(testCase.xml);

   const isMatch =
      result.size === testCase.expected.size &&
      Array.from(testCase.expected.entries()).every(
         ([key, value]) => result.get(key) === value,
      );

   if (isMatch) {
      console.log(`✅ ${testCase.name}`);
      passed++;
   } else {
      console.log(`❌ ${testCase.name}`);
      console.log(
         `   Expected: ${JSON.stringify(Array.from(testCase.expected))}`,
      );
      console.log(`   Got:      ${JSON.stringify(Array.from(result))}`);
      failed++;
   }
}

console.log(`\n=== Testing extractArray Function ===\n`);

// Test extractArray with real data
const testXml = `
<fantasy_content>
   <league>
      <teams count="2">
         <team>
            <team_id>1</team_id>
            <name>Team A</name>
         </team>
         <team>
            <team_id>2</team_id>
            <name>Team B</name>
         </team>
      </teams>
   </league>
</fantasy_content>
`;

const parsedData = parseYahooXML<{ league: Record<string, unknown> }>(
   testXml,
);
const teams = extractArray<Record<string, unknown>>(
   testXml,
   parsedData.league,
   'teams',
);

if (teams && teams.length === 2) {
   console.log('✅ extractArray correctly extracted 2 teams');
   console.log(`   Team 1: ${teams[0]?.name}`);
   console.log(`   Team 2: ${teams[1]?.name}`);
   passed++;
} else {
   console.log(`❌ extractArray failed to extract teams`);
   console.log(`   Expected 2 teams, got: ${teams?.length || 0}`);
   failed++;
}

// Test extractArray with non-array data
const nonArrayData = extractArray<Record<string, unknown>>(
   '<status>active</status>',
   { status: 'active' },
   'status',
);

if (nonArrayData === undefined) {
   console.log(
      '✅ extractArray correctly returns undefined for non-arrays',
   );
   passed++;
} else {
   console.log('❌ extractArray should return undefined for non-arrays');
   failed++;
}

console.log(`\n=== Results ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
   console.log('\n🎉 All tests passed!');
} else {
   console.log(`\n⚠️  ${failed} test(s) failed`);
   process.exit(1);
}
