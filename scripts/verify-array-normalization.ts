#!/usr/bin/env bun

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseYahooXML } from '../src/utils/xmlParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFile(filename: string) {
   const xml = await readFile(
      path.join(__dirname, '../tests/fixtures/xml', filename),
      'utf8',
   );
   // biome-ignore lint/suspicious/noExplicitAny: testing dynamic data structure
   const data = parseYahooXML(xml) as any;

   console.log(`\n=== ${filename} ===`);

   // Check game_weeks
   if (data.game?.game_weeks) {
      console.log('game.game_weeks:');
      console.log('  Type:', typeof data.game.game_weeks);
      console.log('  Is array:', Array.isArray(data.game.game_weeks));
      console.log('  Length:', data.game.game_weeks?.length);
      console.log('  First item week:', data.game.game_weeks?.[0]?.week);
   }

   // Check teams
   if (data.league?.teams) {
      console.log('league.teams:');
      console.log('  Type:', typeof data.league.teams);
      console.log('  Is array:', Array.isArray(data.league.teams));
      console.log('  Length:', data.league.teams?.length);
      console.log('  First team name:', data.league.teams?.[0]?.name);
   }

   // Check team_logos
   if (data.team?.team_logos) {
      console.log('team.team_logos:');
      console.log('  Type:', typeof data.team.team_logos);
      console.log('  Is array:', Array.isArray(data.team.team_logos));
      console.log('  Length:', data.team.team_logos?.length);
   }

   // Check roster
   if (data.team?.roster?.players) {
      console.log('team.roster.players:');
      console.log('  Type:', typeof data.team.roster.players);
      console.log('  Is array:', Array.isArray(data.team.roster.players));
      console.log('  Length:', data.team.roster.players?.length);
      console.log(
         '  First player name:',
         data.team.roster.players?.[0]?.name?.full,
      );
   }
}

(async () => {
   await testFile('game-weeks.xml');
   await testFile('team.xml');
   await testFile('team-roster.xml');
   await testFile('league-teams.xml');
})();
