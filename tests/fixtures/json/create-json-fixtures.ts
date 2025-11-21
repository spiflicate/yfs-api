/**
 * Script to convert XML fixtures to JSON using parseYahooXML
 *
 * This script:
 * - Reads all XML files from tests/fixtures/xml/
 * - Parses them using parseYahooXML
 * - Writes JSON output to tests/fixtures/json/
 *
 * Usage: bun run tests/fixtures/json/createJsonFixtures.ts
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import { snakeToCamel } from '../../../dist/utils/formatters.js';
import { normalizeArrayObjects } from '../../../src/utils/xmlParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const XML_FIXTURES_DIR = path.join(__dirname, '../xml');
const JSON_FIXTURES_DIR = __dirname;

/**
 * Convert a filename from XML to JSON format
 * @param xmlFilename - The XML filename (e.g., "game-nhl.xml")
 * @returns JSON filename (e.g., "game-nhl.json")
 */
function getJsonFilename(xmlFilename: string): string {
   return xmlFilename.replace(/\.xml$/, '.json');
}

const yahooXMLParser = new XMLParser({
   ignoreAttributes: true,
   textNodeName: '#text',
   parseTagValue: true, // Convert "1" to 1, "true" to true
   parseAttributeValue: true,
   trimValues: true,
   removeNSPrefix: true, // Remove "yahoo:" prefix
   tagValueProcessor: (tagName: string, tagValue: string) => {
      if (booleanProps.has(tagName)) {
         switch (tagValue) {
            case '1':
               return true;
            case '0':
               return false;
         }
         return undefined;
      }
      if (tagName === 'gameKey') {
         return undefined;
      }
      return tagValue;
   },
   transformTagName: (tagName: string) => snakeToCamel(tagName),
   numberParseOptions: {
      leadingZeros: false,
      hex: false,
   },
   ignoreDeclaration: true,
});

/**
 * Process a single XML fixture file
 * @param xmlFilename - The name of the XML file to process
 */
async function processXmlFixture(xmlFilename: string): Promise<void> {
   const xmlPath = path.join(XML_FIXTURES_DIR, xmlFilename);
   const jsonPath = path.join(
      JSON_FIXTURES_DIR,
      getJsonFilename(xmlFilename),
   );

   try {
      // Read XML file
      const xmlContent = await readFile(xmlPath, 'utf-8');

      // Parse XML to JSON using parseYahooXML
      const jsonData = yahooXMLParser.parse(xmlContent);
      normalizeArrayObjects(jsonData);
      // Write JSON file with pretty formatting
      const dataProp = Object.keys(jsonData.fantasyContent)[0];

      await writeFile(
         jsonPath,
         JSON.stringify(
            dataProp
               ? jsonData.fantasyContent //[dataProp]
               : jsonData.fantasyContent,
            null,
            2,
         ),
         'utf-8',
      );

      console.log(`✓ ${xmlFilename} → ${getJsonFilename(xmlFilename)}`);
   } catch (error) {
      console.error(
         `✗ Failed to process ${xmlFilename}:`,
         error instanceof Error ? error.message : String(error),
      );
      throw error;
   }
}

/**
 * Main function to process all XML fixtures
 */
async function main(): Promise<void> {
   try {
      console.log(`\nReading XML fixtures from: ${XML_FIXTURES_DIR}\n`);

      // Get all XML files
      const files = await readdir(XML_FIXTURES_DIR);
      const xmlFiles = files.filter((f) => f.endsWith('.xml')).sort();

      if (xmlFiles.length === 0) {
         console.log('No XML fixtures found.');
         return;
      }

      console.log(`Found ${xmlFiles.length} XML fixture(s)\n`);

      // Process each XML file
      for (const xmlFile of xmlFiles) {
         await processXmlFixture(xmlFile);
      }

      console.log(
         `\n✓ Successfully converted ${xmlFiles.length} fixture(s)\n`,
      );
   } catch (error) {
      console.error(
         '\n✗ Error during fixture conversion:',
         error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
   }
}

const booleanProps = new Set<string>([
   'allowAddToDlExtraPos',
   'enabled', //(stats league settings?)
   'draftTogether', //(league settings - must indicate online or offline drafting)
   // 'index-##', //(array of boolean indicators for weeks with qualifying number of days?)
   'onDisabledList',
   'sortOrder', //(stats.stat.sortOrder is this 1 or 0 to indicate asc or desc?)
   'tradeRejectTime', //(league settings - true false for if there a time period for rejecting?)
   'waiverTime',
   'hasDraftGrade',
   'hasMultiweekChampionship',
   'hasPlayerNotes',
   'hasPlayoffConsolationGames',
   'hasRecentPlayerNotes',
   'isAuctionDraft',
   'isCashLeague',
   'isComanager',
   'isCommissioner',
   'isCompositeStat',
   'isConsolation',
   'isEditable',
   'isFlex',
   'isGameOver',
   'isHighscore',
   'isLiveDraftLobbyActive',
   'isMatchupOfTheWeek',
   'isOffseason',
   'isPlayoffs',
   'isPlusLeague',
   'isPrescoring',
   'isProLeague',
   'isPubliclyViewable',
   'isRegistrationOver',
   'isStarting',
   'isStartingPosition',
   'isTied',
   'isUndroppable',
   'usesFaab',
   'usesLockEliminatedTeams',
   'usesMedianScore',
   'usesPlayoff',
   'usesPlayoffReseeding',
]);

// Run the script
await main();
