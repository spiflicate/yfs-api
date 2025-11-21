/**
 * Script to collect comprehensive XML fixtures from Yahoo Fantasy API
 *
 * This script fetches real XML responses for all major endpoint types
 * and saves them as fixtures for testing and development.
 *
 * Usage:
 *   bun run scripts/collect-xml-fixtures.ts
 *
 * Requires environment variables:
 *   - YAHOO_CLIENT_ID
 *   - YAHOO_CLIENT_SECRET
 */

import { YahooFantasyClient } from '../../src/index.js';

async function main() {
   console.log('Yahoo Fantasy Sports API - XML Fixture Collection\n');

   const consumerKey =
      process.env.YAHOO_CLIENT_ID || process.env.YAHOO_CONSUMER_KEY;
   const consumerSecret =
      process.env.YAHOO_CLIENT_SECRET || process.env.YAHOO_CONSUMER_SECRET;
   const tokens = await Bun.file('./.test-tokens.json').json();

   if (!consumerKey || !consumerSecret) {
      console.error('Error: Missing OAuth credentials');
      console.error('Set YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET');
      process.exit(1);
   }
   const yahooClient = new YahooFantasyClient({
      clientId: consumerKey,
      clientSecret: consumerSecret,
      redirectUri: 'oob',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      publicMode: false,
      rawXml: true,
   });

   for (const path of data.game()) {
      await collectXML(yahooClient, path);
   }
   for (const path of data.league()) {
      await collectXML(yahooClient, path);
   }
   for (const path of data.team()) {
      await collectXML(yahooClient, path);
   }
   for (const path of data.player()) {
      await collectXML(yahooClient, path);
   }
   for (const path of data.transactions()) {
      await collectXML(yahooClient, path);
   }

   console.log('\n✅ XML fixture collection complete!');
   console.log(`\nFixtures saved to: tests/fixtures/xml/`);
}

async function collectXML(client: YahooFantasyClient, path: string) {
   const dir = 'tests/fixtures/xml/';
   const filename = path
      .replace(/\//g, '-')
      .replace(/[.;=]/g, '_')
      .replace(/^-/, '')
      .concat('.xml');
   try {
      const http = client.getHttpClient();
      const xmlData = await http.get(path);
      await Bun.write(`${dir}/${filename}`, xmlData as string);
      console.log(`✓ Saved: ${filename}`);
   } catch (error) {
      console.error(
         `\n❌ Error collecting fixtures for ${filename}: `,
         error,
      );
   }
}

const data = {
   leagueIds: [121384, 30702],
   teamIds: Array.from({ length: 8 }, (_, i) => i + 1),
   playerIds: [6743, 6381, 33423],
   playerNames: ['matthews', 'judge', 'mahomes', 'doncic'],
   gameIds: [465],
   gameCodes: ['nhl', 'nba', 'mlb', 'nfl'],
   leagueId: function () {
      return this.leagueIds[
         Math.floor(Math.random() * this.leagueIds.length)
      ] as number;
   },
   teamId: function () {
      return this.teamIds[
         Math.floor(Math.random() * this.teamIds.length)
      ] as number;
   },
   playerId: function () {
      return this.playerIds[
         Math.floor(Math.random() * this.playerIds.length)
      ] as number;
   },
   playerName: function () {
      return this.playerNames[
         Math.floor(Math.random() * this.playerNames.length)
      ] as string;
   },
   gameId: function () {
      return this.gameIds[
         Math.floor(Math.random() * this.gameIds.length)
      ] as number;
   },
   gameCode: function () {
      return this.gameCodes[
         Math.floor(Math.random() * this.gameCodes.length)
      ] as string;
   },
   playerKey: function (gameId?: number, playerId?: number) {
      return `${gameId ?? this.gameId()}.p.${playerId ?? this.playerId()}`;
   },
   teamKey: function (gameId?: number, leagueId?: number, teamId?: number) {
      return `${gameId ?? this.gameId()}.l.${leagueId ?? this.leagueId()}.t.${teamId ?? this.teamId()}`;
   },
   leagueKey: function (gameId?: number, leagueId?: number) {
      return `${gameId ?? this.gameId()}.l.${leagueId ?? this.leagueId()}`;
   },
   gameKey: function (gameId?: number) {
      return `${gameId ?? this.gameId()}`;
   },
   // Game endpoints
   game: function () {
      return [
         `/game/${this.gameCode()}`,
         `/games;game_keys=${this.gameCodes.join(',')}`,
         `/game/${this.gameCode()}/game_weeks`,
         `/game/${this.gameCode()}/stat_categories`,
         `/game/${this.gameCode()}/position_types`,
      ];
   },
   // League endpoints
   league: function () {
      return [
         `/league/${this.leagueKey()}`,
         `/league/${this.leagueKey()}/settings`,
         `/league/${this.leagueKey()}/standings`,
         `/league/${this.leagueKey()}/scoreboard`,
         `/league/${this.leagueKey()}/teams`,
         `/league/${this.leagueKey()}/players;search=${this.playerName()}`,
         `/league/${this.leagueKey()}/players;player_keys=${this.playerKey()}`,
      ];
   },
   // Team endpoints
   team: function () {
      return [
         `/team/${this.teamKey()}`,
         `/team/${this.teamKey()}/roster`,
         `/team/${this.teamKey()}/stats`,
         `/team/${this.teamKey()}/standings`,
         `/team/${this.teamKey()}/matchups`,
      ];
   },
   // Player endpoints
   player: function () {
      return [
         `/player/${this.playerKey()}`,
         `/player/${this.playerKey()}/stats`,
      ];
   },
   // Transaction endpoints
   transactions: function () {
      return [`/league/${this.leagueKey()}/transactions`];
   },
};

await main();
