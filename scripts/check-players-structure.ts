#!/usr/bin/env bun
import { readFileSync } from 'node:fs';
import { parseYahooXML } from '../src/utils/xmlParser.js';

const xml = readFileSync('tests/fixtures/xml/player-search.xml', 'utf-8');
const parsed = parseYahooXML<any>(xml);

console.log('Full players object:');
console.log(JSON.stringify(parsed.league.players, null, 2));
console.log('\nType of players:', typeof parsed.league.players);
console.log('Is array:', Array.isArray(parsed.league.players));
if (parsed.league.players) {
   console.log('Keys:', Object.keys(parsed.league.players));
}
