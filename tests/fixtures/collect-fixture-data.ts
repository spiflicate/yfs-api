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

/**
 * Collection configuration flags
 */
const config = {
   users: true,
   games: true,
   leagues: true,
   teams: true,
   players: true,
};

/**
 * Test data configuration
 *
 * Set specific values to use for data collection. When a value is provided,
 * it will be used directly. When null or empty, the script will auto-discover
 * values from the API.
 *
 * Example:
 *   gameCodes: ['nhl', 'nba']        // Collect data for these games
 *   leagueKeys: ['419.l.12345']      // Collect data for these leagues
 *   teamKeys: ['419.l.12345.t.1']    // Collect data for these teams
 *   playerKeys: ['419.p.1234']       // Collect data for these players
 */
const testData = {
   /**
    * Specific game codes to collect (e.g., 'nhl', 'nba', 'nfl', 'mlb')
    * If empty, auto-discover from user's games
    */
   gameCodes: ['nhl', 'nba', 'nfl', 'mlb'] as string[],

   /**
    * Specific league keys to collect
    * Format: 'GAME_ID.l.LEAGUE_ID' (e.g., '419.l.12345')
    * If empty, auto-discover from user's teams
    */
   leagueKeys: ['nhl.l.121384', '465.l.30702'] as string[],

   /**
    * Specific team keys to collect
    * Format: 'GAME_ID.l.LEAGUE_ID.t.TEAM_ID' (e.g., '419.l.12345.t.1')
    * If empty, auto-discover from user's teams
    */
   teamKeys: ['nhl.l.121384.t.14', '465.l.30702.t.9'] as string[],

   /**
    * Specific player keys to collect
    * Format: 'GAME_ID.p.PLAYER_ID' (e.g., '419.p.1234')
    * If empty, auto-discover from rosters
    */
   playerKeys: [] as string[],

   /**
    * Maximum number of items to collect per category (auto-discovery only)
    * Used when specific keys are not provided above
    */
   limits: {
      leagueKeys: 2,
      teamKeys: 2,
      playerKeys: 5,
   },
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

   // User-level data
   if (config.users) {
      await collect('user-current.json', () =>
         client.request().users().useLogin().execute(),
      );
      await collect('user-games.json', () =>
         client
            .request()
            .users()
            .useLogin()
            .games()
            .gameKeys(context.gameCodes)
            .execute(),
      );
      await collect('user-teams.json', () =>
         client
            .request()
            .users()
            .useLogin()
            .games()
            .gameKeys(context.gameCodes)
            .teams()
            .execute(),
      );
   }

   // Game-level data
   if (config.games) {
      for (const gameCode of context.gameCodes) {
         await collect(`game-${gameCode}.json`, () =>
            client.request().game(gameCode).execute(),
         );
         await collect(`game-${gameCode}-players.json`, () =>
            client
               .request()
               .game(gameCode)
               .players()
               .start(0)
               .count(25)
               .execute(),
         );
         await collect(`game-${gameCode}-stat-categories.json`, () =>
            client.request().game(gameCode).statCategories().execute(),
         );
         await collect(`game-${gameCode}-multiple.json`, () =>
            client
               .request()
               .game(gameCode)
               .out(['position_types', 'stat_categories'])
               .players()
               .execute(),
         );
      }
   }

   // League-level data
   if (config.leagues) {
      for (const leagueKey of context.leagueKeys) {
         await collect(`league-${sanitizeKey(leagueKey)}.json`, () =>
            client.request().league(leagueKey).execute(),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-settings.json`,
            () => client.request().league(leagueKey).settings().execute(),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-standings.json`,
            () => client.request().league(leagueKey).standings().execute(),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-scoreboard.json`,
            () => client.request().league(leagueKey).scoreboard().execute(),
         );
         await collect(`league-${sanitizeKey(leagueKey)}-teams.json`, () =>
            client.request().league(leagueKey).teams().execute(),
         );
         await collect(
            `league-${sanitizeKey(leagueKey)}-transactions.json`,
            () =>
               client.request().league(leagueKey).transactions().execute(),
         );
      }
   }

   // Team-level data
   if (config.teams) {
      for (const teamKey of context.teamKeys) {
         await collect(`team-${sanitizeKey(teamKey)}.json`, () =>
            client.request().team(teamKey).execute(),
         );
         await collect(`team-${sanitizeKey(teamKey)}-roster.json`, () =>
            client.request().team(teamKey).roster().execute(),
         );
         await collect(
            `team-${sanitizeKey(teamKey)}-stats.json`,
            async () => {
               try {
                  return await client
                     .request()
                     .team(teamKey)
                     .stats()
                     .execute();
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
            client.request().team(teamKey).matchups().execute(),
         );
      }
   }

   // Player-level data
   if (config.players) {
      for (const playerKey of context.playerKeys) {
         await collect(`player-${sanitizeKey(playerKey)}.json`, () =>
            client.request().player(playerKey).execute(),
         );
         await collect(`player-${sanitizeKey(playerKey)}-stats.json`, () =>
            client.request().player(playerKey).stats().execute(),
         );
         await collect(
            `player-${sanitizeKey(playerKey)}-ownership.json`,
            () => client.request().player(playerKey).ownership().execute(),
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
   // Start with provided test data
   const gameCodes = new Set<string>(testData.gameCodes);
   const leagueKeys = new Set<string>(testData.leagueKeys);
   const teamKeys = new Set<string>(testData.teamKeys);
   const playerKeys = new Set<string>(testData.playerKeys);

   // If player keys are already provided, return early
   if (playerKeys.size > 0) {
      return {
         gameCodes: Array.from(gameCodes),
         leagueKeys: Array.from(leagueKeys),
         teamKeys: Array.from(teamKeys),
         playerKeys: Array.from(playerKeys),
      };
   }

   // If team keys are not provided, auto-discover from API
   if (teamKeys.size === 0) {
      // Auto-discover from API
      // Start from the logged-in user's teams response to discover
      // realistic keys for games, leagues, and teams. The response shape is:
      // { users: [{ guid: string, games: [...] }] }
      // Each game has a `teams` array (see tests/fixtures/data/user-teams.json).
      const response = (await client
         .request()
         .users()
         .useLogin()
         .games()
         .execute()) as Record<string, unknown>;
      const gamesWithTeams = (response?.[0] as Record<string, unknown>)
         ?.games;

      // First pass: discover game codes, league keys, and team keys
      for (const game of (gamesWithTeams as Record<string, unknown>[]) ??
         []) {
         if (game.code) gameCodes.add(game.code as string);

         const teams = (game.teams as Record<string, unknown>[]) ?? [];
         for (const team of teams) {
            if (team.teamKey) {
               teamKeys.add(team.teamKey as string);

               // Derive league key from team key: 419.l.5634.t.2 -> 419.l.5634
               const parts = String(team.teamKey).split('.');
               if (parts.length >= 3) {
                  leagueKeys.add(`${parts[0]}.${parts[1]}.${parts[2]}`);
               }
            }
         }
      }

      // Fallbacks if discovery yields nothing
      if (gameCodes.size === 0) {
         gameCodes.add('nhl');
      }

      // Apply limits to auto-discovered values
      const limitedTeamKeys = Array.from(teamKeys).slice(
         0,
         testData.limits.teamKeys,
      );
      teamKeys.clear();
      for (const k of limitedTeamKeys) {
         teamKeys.add(k);
      }
   }

   // Second pass: fetch rosters to discover player keys
   for (const teamKey of teamKeys) {
      try {
         const rosterResponse = (await client
            .request()
            .team(teamKey)
            .roster()
            .execute()) as Record<string, unknown>;

         // Try multiple possible roster response structures
         let rosterPlayers: Record<string, unknown>[] = [];

         // Structure 1: Direct roster.players (flat response)
         if (Array.isArray(rosterResponse.roster)) {
            // Roster is an array itself
            rosterPlayers = (
               rosterResponse.roster as Record<string, unknown>[]
            ).flatMap((r) =>
               Array.isArray((r as Record<string, unknown>).players)
                  ? ((r as Record<string, unknown>).players as Record<
                       string,
                       unknown
                    >[])
                  : [],
            );
         } else if (
            rosterResponse.roster &&
            Array.isArray(
               (rosterResponse.roster as Record<string, unknown>).players,
            )
         ) {
            // Structure: { roster: { players: [...] } }
            rosterPlayers = (
               rosterResponse.roster as Record<string, unknown>
            ).players as Record<string, unknown>[];
         }

         // Structure 2: { team: { roster: { players: [...] } } }
         if (rosterPlayers.length === 0) {
            const teamData = rosterResponse.team as Record<string, unknown>;
            if (teamData) {
               const roster = teamData.roster as Record<string, unknown>;
               if (roster && Array.isArray(roster.players)) {
                  rosterPlayers = roster.players as Record<
                     string,
                     unknown
                  >[];
               }
            }
         }

         // Structure 3: { teams: [{ roster: { players: [...] } }] }
         if (rosterPlayers.length === 0) {
            const teams = rosterResponse.teams as Record<string, unknown>[];
            if (Array.isArray(teams) && teams.length > 0) {
               const firstTeam = teams[0] as Record<string, unknown>;
               const roster = firstTeam.roster as Record<string, unknown>;
               if (roster && Array.isArray(roster.players)) {
                  rosterPlayers = roster.players as Record<
                     string,
                     unknown
                  >[];
               }
            }
         }

         for (const player of rosterPlayers) {
            if (player.playerKey) {
               playerKeys.add(player.playerKey as string);
            }
         }
      } catch (err) {
         const msg = err instanceof Error ? err.message : String(err);
         console.warn(
            `Skipping player discovery for team ${teamKey}: ${msg}`,
         );
      }
   }

   return {
      gameCodes: Array.from(gameCodes).slice(0, testData.limits.leagueKeys),
      leagueKeys: Array.from(leagueKeys).slice(
         0,
         testData.limits.leagueKeys,
      ),
      teamKeys: Array.from(teamKeys),
      playerKeys: Array.from(playerKeys).slice(
         0,
         testData.limits.playerKeys,
      ),
   };
}

await main();
