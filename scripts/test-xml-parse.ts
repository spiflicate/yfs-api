#!/usr/bin/env bun

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYahooXML } from '../src/utils/xmlParser.js';

// Resolve xmlPath relative to this script file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xmlPath = path.join(__dirname, '../tests/fixtures/xml/');

async function readAllXmlFiles(dir: string) {
   const names = await readdir(dir);
   const xmlNames = names.filter((n) => n.endsWith('.xml'));
   const contents = await Promise.all(
      xmlNames.map(async (name) => ({
         name: name,
         data: await readFile(path.join(dir, name), 'utf8'),
      })),
   );
   return contents;
}

(async () => {
   try {
      const xmlStrings = await readAllXmlFiles(xmlPath);
      console.log('Read XML files:', xmlStrings.length);

      // Parse each XML string and show structure
      for (const xmlString of xmlStrings) {
         console.log(`\n=== Parsing ${xmlString.name} ===`);
         try {
            const parsed = parseYahooXML(xmlString.data);
            console.log('Parsed successfully');

            if (parsed && typeof parsed === 'object') {
               console.log('Top-level keys:', Object.keys(parsed));
               // Show a preview of the structure
               console.log(
                  'Structure preview:',
                  JSON.stringify(parsed, null, 2).substring(0, 500),
               );
            }
         } catch (err) {
            console.error(`Error parsing ${xmlString.name}:`, err);
         }
      }
   } catch (err) {
      console.error('Error reading XML files:', err);
      process.exit(1);
   }
})();
