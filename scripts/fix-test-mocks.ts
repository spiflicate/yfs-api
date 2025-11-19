#!/usr/bin/env bun

/**
 * Script to remove fantasy_content wrappers from test mocks
 * The HttpClient parser unwraps fantasy_content, so mocks should return unwrapped data
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const testFiles = [
   'tests/unit/resources/GameResource.test.ts',
   'tests/unit/resources/TransactionResource.test.ts',
   'tests/unit/resources/LeagueResource.test.ts',
   'tests/unit/resources/UserResource.test.ts',
   'tests/unit/resources/PlayerResource.test.ts',
];

for (const file of testFiles) {
   const filePath = resolve(process.cwd(), file);
   console.log(`Processing ${file}...`);

   let content = readFileSync(filePath, 'utf-8');

   // Count how many fantasy_content wrappers we're removing
   const matches = content.match(/fantasy_content:\s*{/g);
   const count = matches ? matches.length : 0;

   if (count === 0) {
      console.log(`  No fantasy_content wrappers found`);
      continue;
   }

   // Replace pattern: fantasy_content: { ... }
   // We need to carefully remove the wrapper while preserving the inner content

   // This regex finds mockResponse = { fantasy_content: { content } }
   // and replaces it with mockResponse = { content }
   content = content.replace(
      /const mockResponse = \{\s*fantasy_content:\s*\{/g,
      'const mockResponse = {',
   );

   // Now we need to remove the closing braces
   // Find patterns like:
   // },
   // };
   // And replace with just:
   // };
   // But only when they're closing the fantasy_content wrapper

   // Split by lines to handle line by line
   const lines = content.split('\n');
   const result: string[] = [];
   let inMockResponse = false;
   let braceDepth = 0;
   let removedOuterBrace = false;

   for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';

      // Check if we're entering a mockResponse
      if (line.includes('const mockResponse = {')) {
         inMockResponse = true;
         braceDepth = 1; // We've opened the mockResponse brace
         removedOuterBrace = false;
         result.push(line);
         continue;
      }

      if (inMockResponse) {
         // Count braces
         const openBraces = (line.match(/\{/g) || []).length;
         const closeBraces = (line.match(/\}/g) || []).length;
         braceDepth += openBraces - closeBraces;

         // If we hit depth 0, we're closing mockResponse
         if (braceDepth === 0) {
            inMockResponse = false;
         }

         // If line is just "}, " or "},\t" and we haven't removed the outer brace yet
         // and we're at depth 1, skip it (it's the fantasy_content closing brace)
         if (
            braceDepth === 1 &&
            !removedOuterBrace &&
            /^\s*\},\s*$/.test(line)
         ) {
            removedOuterBrace = true;
            continue; // Skip this line
         }
      }

      result.push(line);
   }

   const newContent = result.join('\n');
   writeFileSync(filePath, newContent);
   console.log(`  Removed ${count} fantasy_content wrappers`);
}

console.log('Done!');
