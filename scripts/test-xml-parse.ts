#!/usr/bin/env bun

import { parseYahooXML } from '../src/utils/xmlParser.js';

const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<fantasy_content>
 <team>
  <team_key>465.l.121384.t.1</team_key>
  <team_id>1</team_id>
  <name>Test Team</name>
  <url>https://hockey.fantasysports.yahoo.com/hockey/121384/1</url>
  <waiver_priority>11</waiver_priority>
  <faab_balance>97</faab_balance>
  <league>
   <league_key>465.l.121384</league_key>
   <league_id>121384</league_id>
   <name>Test League</name>
   <url>https://hockey.fantasysports.yahoo.com/hockey/121384</url>
  </league>
 </team>
</fantasy_content>`;

const parsed = parseYahooXML(xmlString);
console.log('Parsed structure:');
console.log(JSON.stringify(parsed, null, 2));
