/**
 * Script to collect comprehensive fixture data from Yahoo Fantasy API
 * using the high-level yfs-api client (resource methods instead of raw
 * path strings).
 *
 * Usage:
 *   bun run tests/fixtures/collect-fixture-data.ts
 *
 * Requires environment variables:
 *   - YAHOO_CLIENT_ID
 *   - YAHOO_CLIENT_SECRET
 *   - ./.test-tokens.json (see docs/TOKEN_FILE_GUIDE.md)
 */

import { YahooFantasyClient } from '../../src/index.js';

const FIXTURE_DIR = 'tests/fixtures/data';

const config = {
   users: true,
   games: true,
   leagues: true,
   teams: true,
   players: true,
};

async function main() {
   console.log('Yahoo Fantasy Sports API - Fixture Data Collection\n');

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

   const client = new YahooFantasyClient({
      clientId: consumerKey,
      clientSecret: consumerSecret,
      redirectUri: 'oob',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      publicMode: false,
      rawXml: false,
   });

   await ensureDir(FIXTURE_DIR);

   const context = await buildContext(client);

   const http = client.getHttpClient();
   await collect('test-data.json', () =>
      http.get(
         '/league/465.l.121384;out=settings/teams;team_keys=465.l.121384.t.10,465.l.121384.t.14',
      ),
   );

   // User-level data
   if (config.users) {
      await collect('user-current.json', () =>
         client.user.getCurrentUser(),
      );
      await collect('user-games.json', () =>
         client.user.getGames({ gameCodes: context.gameCodes as any }),
      );
      await collect('user-teams.json', () => client.user.getTeams({}));
   }

   // Game-level data
   if (config.games) {
      for (const gameCode of context.gameCodes) {
         await collect(`game-${gameCode}.json`, () =>
            client.game.get(gameCode),
         );
         await collect(`game-${gameCode}-players.json`, () =>
            client.game.searchPlayers(gameCode, { start: 0, count: 25 }),
         );
         await collect(`game-${gameCode}-stat-categories.json`, () =>
            client.game.getStatCategories(gameCode),
         );
         await collect(`game-${gameCode}-multiple.json`, () =>
            client.game.get(gameCode, {
               includePlayers: true,
               includePositionTypes: true,
               includeStatCategories: true,
            }),
         );
      }
   }

   // League-level data
   if (config.leagues) {
      for (const leagueKey of context.leagueKeys) {
         await collect(`league-${sanitizeKey(leagueKey)}.json`, () =>
            client.league.get(leagueKey),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-settings.json`,
            () => client.league.getSettings(leagueKey),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-standings.json`,
            () => client.league.getStandings(leagueKey),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-scoreboard.json`,
            () => client.league.getScoreboard(leagueKey),
         );
         await collect(`league-${sanitizeKey(leagueKey)}-teams.json`, () =>
            client.league.getTeams(leagueKey),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-transactions.json`,
            () => client.transaction.getLeagueTransactions(leagueKey),
         );
      }
   }

   // Team-level data
   if (config.teams) {
      for (const teamKey of context.teamKeys) {
         await collect(`team-${sanitizeKey(teamKey)}.json`, () =>
            client.team.get(teamKey),
         );
         await collect(`team-${sanitizeKey(teamKey)}-roster.json`, () =>
            client.team.getRoster(teamKey),
         );
         await collect(
            `team-${sanitizeKey(teamKey)}-stats.json`,
            async () => {
               try {
                  return await client.team.getStats(teamKey);
               } catch (err) {
                  const msg =
                     err instanceof Error ? err.message : String(err);
                  if (msg.includes('Stats not found in response')) {
                     console.warn(
                        `No stats available for team ${teamKey}; saving placeholder.`,
                     );
                     return { teamKey, statsAvailable: false };
                  }
                  throw err;
               }
            },
         );
         await collect(`team-${sanitizeKey(teamKey)}-matchups.json`, () =>
            client.team.getMatchups(teamKey),
         );
      }
   }

   // Player-level data
   if (config.players) {
      for (const playerKey of context.playerKeys) {
         await collect(`player-${sanitizeKey(playerKey)}.json`, () =>
            client.player.get(playerKey),
         );
         await collect(`player-${sanitizeKey(playerKey)}-stats.json`, () =>
            client.player.getStats(playerKey, {
               coverageType: 'season',
            }),
         );
         await collect(
            `player-${sanitizeKey(playerKey)}-ownership.json`,
            () => client.player.getOwnership(playerKey),
         );
      }
   }

   console.log('\n✅ Fixture data collection complete!');
   console.log(`\nFixtures saved to: ${FIXTURE_DIR}/`);
}

async function collect(filename: string, fn: () => Promise<unknown>) {
   const path = `${FIXTURE_DIR}/${filename}`;
   try {
      const data = await fn();
      await Bun.write(path, JSON.stringify(data, null, 2));
      console.log(`✓ Saved: ${filename}`);
   } catch (error) {
      const errorMessage =
         error instanceof Error ? error.toString() : String(error);
      console.error(`\n❌ Error collecting ${filename}: ${errorMessage}`);
   }
}

async function ensureDir(dir: string) {
   try {
      await Bun.file(`${dir}/.keep`).text();
   } catch {
      await Bun.write(`${dir}/.keep`, '');
   }
}

function sanitizeKey(key: string) {
   return key.replace(/[.:]/g, '-');
}

async function buildContext(client: YahooFantasyClient) {
   // Start from the logged-in user's teams response to discover
   // realistic keys for games, leagues, and teams. The response shape is:
   // { users: [{ guid: string, games: [...] }] }
   // Each game has a `teams` array (see tests/fixtures/data/user-teams.json).
   const response = (await client.user.getTeams({})) as any;
   const gamesWithTeams = response?.users?.[0]?.games;

   const gameCodes = new Set<string>();
   const leagueKeys = new Set<string>();
   const teamKeys = new Set<string>();
   const playerKeys = new Set<string>();

   // First pass: discover game codes, league keys, and team keys
   for (const game of gamesWithTeams ?? []) {
      if (game.code) gameCodes.add(game.code);

      const teams = game.teams ?? [];
      for (const team of teams) {
         if (team.teamKey) {
            teamKeys.add(team.teamKey);

            // Derive league key from team key: 419.l.5634.t.2 -> 419.l.5634
            const parts = String(team.teamKey).split('.');
            if (parts.length >= 3) {
               leagueKeys.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
            }
         }
      }
   }

   // Second pass: fetch rosters to discover player keys
   for (const teamKey of teamKeys) {
      try {
         const rosterResponse = (await client.team.getRoster(
            teamKey,
         )) as any;
         const rosterPlayers = rosterResponse.team?.roster?.players ?? [];
         for (const player of rosterPlayers) {
            if (player.playerKey) {
               playerKeys.add(player.playerKey);
            }
         }
      } catch (err) {
         const msg = err instanceof Error ? err.message : String(err);
         console.warn(
            `Skipping player discovery for team ${teamKey}: ${msg}`,
         );
      }
   }

   // Fallbacks if discovery yields nothing
   if (gameCodes.size === 0) {
      gameCodes.add('nhl');
   }

   return {
      gameCodes: Array.from(gameCodes),
      leagueKeys: Array.from(leagueKeys).slice(0, 2),
      teamKeys: Array.from(teamKeys).slice(0, 2),
      playerKeys: Array.from(playerKeys).slice(0, 25),
   };
}

await main();
