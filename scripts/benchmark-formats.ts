/**
 * Benchmark script to compare two methods of retrieving Yahoo Fantasy API data:
 * 1. Fetch XML and parse to JSON
 * 2. Fetch JSON directly with format=json
 *
 * Usage:
 *   bun run scripts/benchmark-formats.ts
 *
 * Requires environment variables:
 *   - YAHOO_CLIENT_ID: OAuth consumer key
 *   - YAHOO_CLIENT_SECRET: OAuth consumer secret
 */

import { XMLParser } from 'fast-xml-parser';
import { OAuth1Client } from '../src/client/OAuth1Client.js';

const API_BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2';

/**
 * Benchmark configuration
 */
interface BenchmarkConfig {
   iterations: number;
   warmupIterations: number;
   endpoint: string;
}

/**
 * Normalized matchup team structure
 */
interface NormalizedMatchupTeam {
   teamKey: string;
   teamId: string;
   name: string;
   points?: number;
   projectedPoints?: number;
}

/**
 * Normalized matchup structure
 */
interface NormalizedMatchup {
   week: number;
   weekStart: string;
   weekEnd: string;
   status: string;
   teams: NormalizedMatchupTeam[];
}

/**
 * Normalized scoreboard structure
 */
interface NormalizedScoreboard {
   week: number;
   matchups: NormalizedMatchup[];
}

/**
 * Parse Yahoo's bizarre JSON structure into normalized format
 * This mimics what the library does to make the data usable
 */
function normalizeYahooJson(
   data: Record<string, unknown>,
): NormalizedScoreboard {
   const fantasyContent = data.fantasy_content as Record<string, unknown>;
   const league = Array.isArray(fantasyContent.league)
      ? fantasyContent.league
      : [fantasyContent.league];

   // Find scoreboard object in the league array
   const scoreboardObj = league.find(
      (item: unknown) =>
         item && typeof item === 'object' && 'scoreboard' in item,
   );

   if (!scoreboardObj || !('scoreboard' in scoreboardObj)) {
      throw new Error('No scoreboard data found');
   }

   const scoreboard = scoreboardObj.scoreboard as Record<string, unknown>;
   const week = Number.parseInt(scoreboard.week as string);

   const normalized: NormalizedScoreboard = {
      week,
      matchups: [],
   };

   // Parse matchups - Yahoo wraps them in numeric keys
   const matchupsWrapper =
      (scoreboard['0'] as Record<string, unknown>) || scoreboard;
   const matchupsData = matchupsWrapper.matchups as Record<string, unknown>;

   for (const key in matchupsData) {
      if (key === 'count') continue;

      const matchupEntry = matchupsData[key];
      if (
         matchupEntry &&
         typeof matchupEntry === 'object' &&
         'matchup' in matchupEntry
      ) {
         const matchupData = (matchupEntry as Record<string, unknown>)
            .matchup as Record<string, unknown>;

         const matchup: NormalizedMatchup = {
            week: Number.parseInt(matchupData.week as string),
            weekStart: matchupData.week_start as string,
            weekEnd: matchupData.week_end as string,
            status: matchupData.status as string,
            teams: [],
         };

         // Parse teams - also in bizarre numeric-key structure
         const teamsWrapper =
            (matchupData['0'] as Record<string, unknown>) || matchupData;
         const teamsData = teamsWrapper.teams as Record<string, unknown>;

         for (const teamKey in teamsData) {
            if (teamKey === 'count') continue;

            const teamEntry = teamsData[teamKey];
            if (
               teamEntry &&
               typeof teamEntry === 'object' &&
               'team' in teamEntry
            ) {
               const teamArray = (teamEntry as Record<string, unknown>)
                  .team as Array<unknown>;

               // Team data is an array of objects that need to be merged
               const teamObj: Record<string, unknown> = {};
               for (const item of teamArray) {
                  if (item && typeof item === 'object') {
                     Object.assign(teamObj, item);
                  }
               }

               const team: NormalizedMatchupTeam = {
                  teamKey: teamObj.team_key as string,
                  teamId: teamObj.team_id as string,
                  name: teamObj.name as string,
               };

               if (teamObj.team_points) {
                  team.points = Number.parseFloat(
                     (teamObj.team_points as Record<string, unknown>)
                        .total as string,
                  );
               }

               if (teamObj.team_projected_points) {
                  team.projectedPoints = Number.parseFloat(
                     (
                        teamObj.team_projected_points as Record<
                           string,
                           unknown
                        >
                     ).total as string,
                  );
               }

               matchup.teams.push(team);
            }
         }

         normalized.matchups.push(matchup);
      }
   }

   return normalized;
}

/**
 * Parse XML-derived JSON into normalized format
 * XML parsing creates a slightly different structure
 */
function normalizeXmlJson(
   data: Record<string, unknown>,
): NormalizedScoreboard {
   const league = (data.fantasy_content as Record<string, unknown>)
      .league as Record<string, unknown>;
   const scoreboard = league.scoreboard as Record<string, unknown>;
   const week = Number.parseInt(scoreboard.week as string);

   const normalized: NormalizedScoreboard = {
      week,
      matchups: [],
   };

   const matchupsObj = scoreboard.matchups as Record<string, unknown>;
   const matchupsArray = Array.isArray(matchupsObj.matchup)
      ? matchupsObj.matchup
      : [matchupsObj.matchup];

   for (const matchupData of matchupsArray) {
      const matchupObj = matchupData as Record<string, unknown>;
      const matchup: NormalizedMatchup = {
         week: Number.parseInt(matchupObj.week as string),
         weekStart: matchupObj.week_start as string,
         weekEnd: matchupObj.week_end as string,
         status: matchupObj.status as string,
         teams: [],
      };

      const teamsObj = matchupObj.teams as Record<string, unknown>;
      const teamsArray = Array.isArray(teamsObj.team)
         ? teamsObj.team
         : [teamsObj.team];

      for (const teamData of teamsArray) {
         const teamObj = teamData as Record<string, unknown>;
         const team: NormalizedMatchupTeam = {
            teamKey: teamObj.team_key as string,
            teamId: teamObj.team_id as string,
            name: teamObj.name as string,
         };

         if (teamObj.team_points) {
            team.points = Number.parseFloat(
               (teamObj.team_points as Record<string, unknown>)
                  .total as string,
            );
         }

         if (teamObj.team_projected_points) {
            team.projectedPoints = Number.parseFloat(
               (teamObj.team_projected_points as Record<string, unknown>)
                  .total as string,
            );
         }

         matchup.teams.push(team);
      }

      normalized.matchups.push(matchup);
   }

   return normalized;
}

/**
 * Benchmark result for a single run
 */
interface BenchmarkRun {
   fetchTime: number;
   parseTime: number;
   normalizeTime: number;
   totalTime: number;
   dataSize: number;
}

/**
 * Aggregated benchmark results
 */
interface BenchmarkResults {
   method: 'xml-to-json' | 'direct-json';
   runs: BenchmarkRun[];
   avg: {
      fetchTime: number;
      parseTime: number;
      normalizeTime: number;
      totalTime: number;
      dataSize: number;
   };
   min: {
      fetchTime: number;
      parseTime: number;
      normalizeTime: number;
      totalTime: number;
   };
   max: {
      fetchTime: number;
      parseTime: number;
      normalizeTime: number;
      totalTime: number;
   };
}

/**
 * Fetch data as XML and parse to JSON
 */
async function fetchAndParseXml(
   oauth1: OAuth1Client,
   endpoint: string,
): Promise<BenchmarkRun> {
   const url = `${API_BASE_URL}${endpoint}?format=xml`;
   const signedUrl = oauth1.signRequest('GET', url);

   // Measure fetch time
   const fetchStart = performance.now();
   const response = await fetch(signedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'YahooFantasyAPI/1.0' },
   });

   if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
   }

   const xmlData = await response.text();
   const fetchEnd = performance.now();
   const fetchTime = fetchEnd - fetchStart;

   // Measure parse time (XML to JSON)
   const parseStart = performance.now();
   const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseTagValue: true,
      parseAttributeValue: true,
      trimValues: true,
   });
   const jsonData = parser.parse(xmlData);
   const parseEnd = performance.now();
   const parseTime = parseEnd - parseStart;

   // Measure normalization time (Yahoo's structure to usable format)
   const normalizeStart = performance.now();
   const _normalized = normalizeXmlJson(jsonData);
   const normalizeEnd = performance.now();
   const normalizeTime = normalizeEnd - normalizeStart;

   return {
      fetchTime,
      parseTime,
      normalizeTime,
      totalTime: fetchTime + parseTime + normalizeTime,
      dataSize: xmlData.length,
   };
}

/**
 * Fetch data directly as JSON
 */
async function fetchDirectJson(
   oauth1: OAuth1Client,
   endpoint: string,
): Promise<BenchmarkRun> {
   const url = `${API_BASE_URL}${endpoint}?format=json`;
   const signedUrl = oauth1.signRequest('GET', url);

   // Measure fetch time
   const fetchStart = performance.now();
   const response = await fetch(signedUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'YahooFantasyAPI/1.0' },
   });

   if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
   }

   const rawData = await response.text();
   const fetchEnd = performance.now();
   const fetchTime = fetchEnd - fetchStart;

   // Measure parse time (JSON.parse)
   const parseStart = performance.now();
   const jsonData = JSON.parse(rawData);
   const parseEnd = performance.now();
   const parseTime = parseEnd - parseStart;

   // Measure normalization time (Yahoo's bizarre structure to usable format)
   const normalizeStart = performance.now();
   const _normalized = normalizeYahooJson(jsonData);
   const normalizeEnd = performance.now();
   const normalizeTime = normalizeEnd - normalizeStart;

   return {
      fetchTime,
      parseTime,
      normalizeTime,
      totalTime: fetchTime + parseTime + normalizeTime,
      dataSize: rawData.length,
   };
}

/**
 * Run benchmark for a specific method
 */
async function runBenchmark(
   method: 'xml-to-json' | 'direct-json',
   oauth1: OAuth1Client,
   config: BenchmarkConfig,
): Promise<BenchmarkResults> {
   const runs: BenchmarkRun[] = [];

   console.log(`\nRunning ${method} benchmark...`);
   console.log(`  Warmup: ${config.warmupIterations} iterations`);
   console.log(`  Test: ${config.iterations} iterations`);

   // Warmup
   for (let i = 0; i < config.warmupIterations; i++) {
      if (method === 'xml-to-json') {
         await fetchAndParseXml(oauth1, config.endpoint);
      } else {
         await fetchDirectJson(oauth1, config.endpoint);
      }
      process.stdout.write(
         `\r  Warmup progress: ${i + 1}/${config.warmupIterations}`,
      );
   }
   console.log('\n  Warmup complete!');

   // Actual benchmark runs
   for (let i = 0; i < config.iterations; i++) {
      const run =
         method === 'xml-to-json'
            ? await fetchAndParseXml(oauth1, config.endpoint)
            : await fetchDirectJson(oauth1, config.endpoint);

      runs.push(run);
      process.stdout.write(`\r  Progress: ${i + 1}/${config.iterations}`);

      // Small delay between requests to be respectful to API
      await new Promise((resolve) => setTimeout(resolve, 100));
   }
   console.log('\n  Benchmark complete!');

   // Calculate statistics
   const avgFetchTime =
      runs.reduce((sum, run) => sum + run.fetchTime, 0) / runs.length;
   const avgParseTime =
      runs.reduce((sum, run) => sum + run.parseTime, 0) / runs.length;
   const avgNormalizeTime =
      runs.reduce((sum, run) => sum + run.normalizeTime, 0) / runs.length;
   const avgTotalTime =
      runs.reduce((sum, run) => sum + run.totalTime, 0) / runs.length;
   const avgDataSize =
      runs.reduce((sum, run) => sum + run.dataSize, 0) / runs.length;

   const fetchTimes = runs.map((r) => r.fetchTime);
   const parseTimes = runs.map((r) => r.parseTime);
   const normalizeTimes = runs.map((r) => r.normalizeTime);
   const totalTimes = runs.map((r) => r.totalTime);

   return {
      method,
      runs,
      avg: {
         fetchTime: avgFetchTime,
         parseTime: avgParseTime,
         normalizeTime: avgNormalizeTime,
         totalTime: avgTotalTime,
         dataSize: avgDataSize,
      },
      min: {
         fetchTime: Math.min(...fetchTimes),
         parseTime: Math.min(...parseTimes),
         normalizeTime: Math.min(...normalizeTimes),
         totalTime: Math.min(...totalTimes),
      },
      max: {
         fetchTime: Math.max(...fetchTimes),
         parseTime: Math.max(...parseTimes),
         normalizeTime: Math.max(...normalizeTimes),
         totalTime: Math.max(...totalTimes),
      },
   };
}

/**
 * Format number with fixed decimals
 */
function fmt(num: number, decimals = 2): string {
   return num.toFixed(decimals);
}

/**
 * Calculate percentage difference
 */
function percentDiff(val1: number, val2: number): string {
   const diff = ((val1 - val2) / val2) * 100;
   const sign = diff > 0 ? '+' : '';
   return `${sign}${fmt(diff, 1)}%`;
}

/**
 * Print comparison table
 */
function printComparison(
   xmlResults: BenchmarkResults,
   jsonResults: BenchmarkResults,
) {
   console.log('\n' + '='.repeat(80));
   console.log('BENCHMARK RESULTS COMPARISON');
   console.log('='.repeat(80));

   console.log('\n📊 AVERAGE TIMES (lower is better)');
   console.log('-'.repeat(80));
   console.log(
      `${'Metric'.padEnd(25)} | ${'XML→JSON'.padEnd(15)} | ${'Direct JSON'.padEnd(15)} | Difference`,
   );
   console.log('-'.repeat(80));

   console.log(
      `${'Fetch Time'.padEnd(25)} | ${fmt(xmlResults.avg.fetchTime).padEnd(13)}ms | ${fmt(jsonResults.avg.fetchTime).padEnd(13)}ms | ${percentDiff(xmlResults.avg.fetchTime, jsonResults.avg.fetchTime)}`,
   );
   console.log(
      `${'Parse Time'.padEnd(25)} | ${fmt(xmlResults.avg.parseTime).padEnd(13)}ms | ${fmt(jsonResults.avg.parseTime).padEnd(13)}ms | ${percentDiff(xmlResults.avg.parseTime, jsonResults.avg.parseTime)}`,
   );
   console.log(
      `${'Normalize Time'.padEnd(25)} | ${fmt(xmlResults.avg.normalizeTime).padEnd(13)}ms | ${fmt(jsonResults.avg.normalizeTime).padEnd(13)}ms | ${percentDiff(xmlResults.avg.normalizeTime, jsonResults.avg.normalizeTime)}`,
   );
   console.log(
      `${'Total Time'.padEnd(25)} | ${fmt(xmlResults.avg.totalTime).padEnd(13)}ms | ${fmt(jsonResults.avg.totalTime).padEnd(13)}ms | ${percentDiff(xmlResults.avg.totalTime, jsonResults.avg.totalTime)}`,
   );
   console.log(
      `${'Data Size'.padEnd(25)} | ${Math.round(xmlResults.avg.dataSize).toString().padEnd(13)}B | ${Math.round(jsonResults.avg.dataSize).toString().padEnd(13)}B | ${percentDiff(xmlResults.avg.dataSize, jsonResults.avg.dataSize)}`,
   );

   console.log('\n📈 MIN/MAX TIMES');
   console.log('-'.repeat(80));
   console.log(`${''.padEnd(25)} | ${'XML→JSON'.padEnd(15)} | Direct JSON`);
   console.log('-'.repeat(80));
   console.log(
      `${'Min Total Time'.padEnd(25)} | ${fmt(xmlResults.min.totalTime).padEnd(13)}ms | ${fmt(jsonResults.min.totalTime)}ms`,
   );
   console.log(
      `${'Max Total Time'.padEnd(25)} | ${fmt(xmlResults.max.totalTime).padEnd(13)}ms | ${fmt(jsonResults.max.totalTime)}ms`,
   );

   console.log('\n🏆 WINNER');
   console.log('-'.repeat(80));
   const winner =
      xmlResults.avg.totalTime < jsonResults.avg.totalTime
         ? 'XML→JSON'
         : 'Direct JSON';
   const speedup =
      xmlResults.avg.totalTime < jsonResults.avg.totalTime
         ? ((jsonResults.avg.totalTime - xmlResults.avg.totalTime) /
              jsonResults.avg.totalTime) *
           100
         : ((xmlResults.avg.totalTime - jsonResults.avg.totalTime) /
              xmlResults.avg.totalTime) *
           100;

   console.log(`Winner: ${winner} (${fmt(speedup, 1)}% faster)`);

   console.log('\n💡 INSIGHTS');
   console.log('-'.repeat(80));

   // Network overhead comparison
   const xmlNetworkOverhead = xmlResults.avg.fetchTime;
   const jsonNetworkOverhead = jsonResults.avg.fetchTime;
   console.log(
      `Network Transfer: ${xmlNetworkOverhead > jsonNetworkOverhead ? 'JSON is faster' : 'XML is faster'} (${percentDiff(xmlNetworkOverhead, jsonNetworkOverhead)})`,
   );

   // Parsing overhead comparison
   const xmlParseOverhead = xmlResults.avg.parseTime;
   const jsonParseOverhead = jsonResults.avg.parseTime;
   console.log(
      `Parsing Speed: ${xmlParseOverhead > jsonParseOverhead ? 'JSON is faster' : 'XML is faster'} (${percentDiff(xmlParseOverhead, jsonParseOverhead)})`,
   );

   // Normalization overhead comparison
   const xmlNormalizeOverhead = xmlResults.avg.normalizeTime;
   const jsonNormalizeOverhead = jsonResults.avg.normalizeTime;
   console.log(
      `Normalization Speed: ${xmlNormalizeOverhead > jsonNormalizeOverhead ? 'JSON is faster' : 'XML is faster'} (${percentDiff(xmlNormalizeOverhead, jsonNormalizeOverhead)})`,
   );

   // Data size comparison
   const dataSizeRatio = xmlResults.avg.dataSize / jsonResults.avg.dataSize;
   console.log(
      `Data Size Ratio: XML is ${fmt(dataSizeRatio, 2)}x ${dataSizeRatio > 1 ? 'larger' : 'smaller'} than JSON`,
   );

   // Processing pipeline breakdown
   console.log('\n📋 PROCESSING BREAKDOWN');
   console.log('-'.repeat(80));
   const xmlFetchPct =
      (xmlResults.avg.fetchTime / xmlResults.avg.totalTime) * 100;
   const xmlParsePct =
      (xmlResults.avg.parseTime / xmlResults.avg.totalTime) * 100;
   const xmlNormalizePct =
      (xmlResults.avg.normalizeTime / xmlResults.avg.totalTime) * 100;

   const jsonFetchPct =
      (jsonResults.avg.fetchTime / jsonResults.avg.totalTime) * 100;
   const jsonParsePct =
      (jsonResults.avg.parseTime / jsonResults.avg.totalTime) * 100;
   const jsonNormalizePct =
      (jsonResults.avg.normalizeTime / jsonResults.avg.totalTime) * 100;

   console.log('XML→JSON Pipeline:');
   console.log(
      `  Fetch:      ${fmt(xmlFetchPct)}% (${fmt(xmlResults.avg.fetchTime)}ms)`,
   );
   console.log(
      `  Parse:      ${fmt(xmlParsePct)}% (${fmt(xmlResults.avg.parseTime)}ms)`,
   );
   console.log(
      `  Normalize:  ${fmt(xmlNormalizePct)}% (${fmt(xmlResults.avg.normalizeTime)}ms)`,
   );

   console.log('\nDirect JSON Pipeline:');
   console.log(
      `  Fetch:      ${fmt(jsonFetchPct)}% (${fmt(jsonResults.avg.fetchTime)}ms)`,
   );
   console.log(
      `  Parse:      ${fmt(jsonParsePct)}% (${fmt(jsonResults.avg.parseTime)}ms)`,
   );
   console.log(
      `  Normalize:  ${fmt(jsonNormalizePct)}% (${fmt(jsonResults.avg.normalizeTime)}ms)`,
   );

   console.log('\n' + '='.repeat(80));
}

/**
 * Main function
 */
async function main() {
   console.log('Yahoo Fantasy API Format Benchmark');
   console.log('Comparing XML→JSON vs Direct JSON retrieval\n');

   // Validate credentials
   const consumerKey =
      process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
   const consumerSecret =
      process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;

   if (!consumerKey || !consumerSecret) {
      throw new Error(
         'Yahoo OAuth credentials not set. Please set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET.',
      );
   }

   // Create OAuth1 client
   const oauth1 = new OAuth1Client(consumerKey, consumerSecret);

   // Benchmark configuration
   const config: BenchmarkConfig = {
      iterations: 10,
      warmupIterations: 2,
      endpoint: '/league/465.l.121384/scoreboard', // NHL league scoreboard
   };

   console.log('Configuration:');
   console.log(`  Endpoint: ${config.endpoint}`);
   console.log(`  Iterations: ${config.iterations}`);
   console.log(`  Warmup: ${config.warmupIterations}`);

   try {
      // Run benchmarks
      const xmlResults = await runBenchmark('xml-to-json', oauth1, config);
      const jsonResults = await runBenchmark('direct-json', oauth1, config);

      // Print comparison
      printComparison(xmlResults, jsonResults);

      // Save detailed results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = `benchmark-results-${timestamp}.json`;
      await Bun.write(
         resultsFile,
         JSON.stringify(
            {
               config,
               timestamp: new Date().toISOString(),
               results: {
                  xmlToJson: xmlResults,
                  directJson: jsonResults,
               },
            },
            null,
            2,
         ),
      );

      console.log(`\nDetailed results saved to: ${resultsFile}\n`);
   } catch (error) {
      console.error('Benchmark failed:', error);
      process.exit(1);
   }
}

// Run main function
await main();
