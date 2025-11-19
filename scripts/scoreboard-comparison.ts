/**
 * Script to fetch Yahoo Fantasy Sports scoreboard data in both XML and JSON formats
 * using only the OAuth1Client, for format comparison.
 *
 * Usage:
 *   bun run scripts/scoreboard-comparison.ts
 *
 * Requires environment variables:
 *   - YAHOO_CLIENT_ID: OAuth consumer key (also accepts YAHOO_CONSUMER_KEY)
 *   - YAHOO_CLIENT_SECRET: OAuth consumer secret (also accepts YAHOO_CONSUMER_SECRET)
 */

import { OAuth1Client } from '../src/client/OAuth1Client.js';

const API_BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2';

/**
 * Fetches data in a specific format using OAuth1
 */
async function fetchInFormat(format: 'json' | 'xml'): Promise<string> {
   const consumerKey =
      process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
   const consumerSecret =
      process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;

   if (!consumerKey || !consumerSecret) {
      throw new Error(
         'Yahoo OAuth credentials not set in environment variables. ' +
            'Please set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET, ' +
            'or YAHOO_CONSUMER_KEY and YAHOO_CONSUMER_SECRET.',
      );
   }

   // Create OAuth1 client for public mode
   const oauth1 = new OAuth1Client(consumerKey, consumerSecret);

   try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Fetching scoreboard in ${format.toUpperCase()} format`);
      console.log(`${'='.repeat(60)}\n`);

      // Path to scoreboard endpoint
      // Using a hockey league (you can modify this league key)
      const leagueKey = '465.l.121384'; // NHL league
      const path = `/league/${leagueKey}/scoreboard`;

      // Make the request
      // Note: We need to bypass the JSON parsing and handle raw response
      // So we'll construct the URL manually and fetch directly
      const method = 'GET';
      const url = `${API_BASE_URL}${path}?format=${format}`;

      // Sign the URL with OAuth1
      const signedUrl = oauth1.signRequest(method, url);

      console.log(`League Key: ${leagueKey}`);
      console.log(`Method: ${method}`);
      console.log(`Signed URL: ${signedUrl}\n`);

      // Make the raw fetch request
      const response = await fetch(signedUrl, {
         method,
         headers: {
            'User-Agent': 'YahooFantasyAPI/1.0',
         },
      });

      if (!response.ok) {
         const errorBody = await response.text();
         throw new Error(
            `API request failed with status ${response.status}: ${errorBody}`,
         );
      }

      // Get raw response as text
      const rawData = await response.text();

      // Save to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `scoreboard-${format}-${timestamp}.${format}`;
      await Bun.write(filename, rawData);

      console.log(`Response saved to: ${filename}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${rawData.length} bytes\n`);

      // Print first 1000 characters for preview
      console.log(`Preview (first 1000 characters):`);
      console.log('-'.repeat(60));
      console.log(rawData.substring(0, 1000));
      if (rawData.length > 1000) {
         console.log('\n... (truncated)');
      }
      console.log('-'.repeat(60));

      return rawData;
   } catch (error) {
      const message =
         error instanceof Error ? error.message : String(error);
      console.error(`Failed to fetch ${format} format: ${message}`);
      throw error;
   }
}

/**
 * Main function
 */
async function main() {
   console.log('Yahoo Fantasy Sports Scoreboard Comparison');
   console.log('Using OAuth1Client + HttpClient\n');

   try {
      // Fetch both formats
      const jsonData = await fetchInFormat('json');
      const xmlData = await fetchInFormat('xml');

      // Summary
      console.log(`\n${'='.repeat(60)}`);
      console.log('SUMMARY');
      console.log(`${'='.repeat(60)}`);
      console.log(`JSON response size: ${jsonData.length} bytes`);
      console.log(`XML response size: ${xmlData.length} bytes`);
      console.log(
         `Difference: ${Math.abs(jsonData.length - xmlData.length)} bytes`,
      );
      console.log(
         `\nBoth formats have been saved to files for comparison.\n`,
      );
   } catch (error) {
      console.error('Error:', error);
      process.exit(1);
   }
}

// Run main function
await main();
