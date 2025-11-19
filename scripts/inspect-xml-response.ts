/**
 * Script to demonstrate rawXml mode for debugging/inspection
 *
 * Shows how to use the rawXml config option to get raw XML responses
 * instead of parsed objects for debugging and custom parsing.
 *
 * Usage:
 *   bun run scripts/inspect-xml-response.ts
 */

import { YahooFantasyClient } from '../src/index.js';

const consumerKey =
   process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
const consumerSecret =
   process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;

if (!consumerKey || !consumerSecret) {
   console.error('Error: Missing OAuth credentials');
   console.error('Set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET');
   process.exit(1);
}

console.log('='.repeat(70));
console.log('Raw XML Response Inspection');
console.log('='.repeat(70));
console.log();

// Create two clients: one with rawXml, one without
const clientRaw = new YahooFantasyClient({
   clientId: consumerKey,
   clientSecret: consumerSecret,
   publicMode: true,
   rawXml: true, // Returns raw XML strings
});

const clientParsed = new YahooFantasyClient({
   clientId: consumerKey,
   clientSecret: consumerSecret,
   publicMode: true,
   rawXml: false, // Returns parsed objects (default)
});

try {
   const leagueKey = '465.l.121384';

   console.log(`Fetching league: ${leagueKey}`);
   console.log();

   // Get raw XML
   console.log('-'.repeat(70));
   console.log('RAW XML MODE (rawXml: true)');
   console.log('-'.repeat(70));
   const rawXml = (await clientRaw.league.get(
      leagueKey,
   )) as unknown as string;
   console.log('Type:', typeof rawXml);
   console.log('First 500 characters:');
   console.log(rawXml.substring(0, 500));
   console.log('...');
   console.log();

   // Save to file
   await Bun.write('league-raw.xml', rawXml);
   console.log('✓ Saved full response to: league-raw.xml');
   console.log();

   // Get parsed object
   console.log('-'.repeat(70));
   console.log('PARSED MODE (rawXml: false, default)');
   console.log('-'.repeat(70));
   const parsed = await clientParsed.league.get(leagueKey);
   console.log('Type:', typeof parsed);
   console.log('League Key:', parsed.leagueKey);
   console.log('League Name:', parsed.name);
   console.log('Game Code:', parsed.gameCode);
   console.log('Season:', parsed.season);
   console.log('Number of Teams:', parsed.numberOfTeams);
   console.log();

   // Save to file
   await Bun.write('league-parsed.json', JSON.stringify(parsed, null, 2));
   console.log('✓ Saved parsed response to: league-parsed.json');
   console.log();

   console.log('='.repeat(70));
   console.log('SUMMARY');
   console.log('='.repeat(70));
   console.log(
      'rawXml: true  → Returns raw XML string for inspection/custom parsing',
   );
   console.log(
      'rawXml: false → Returns parsed TypeScript objects (default)',
   );
   console.log();
   console.log('Use rawXml mode to:');
   console.log('  - Debug API responses');
   console.log('  - Inspect exact XML structure');
   console.log('  - Implement custom parsing logic');
   console.log('  - Compare XML vs JSON formats');
} catch (error) {
   console.error('Error:', error);
   process.exit(1);
}
