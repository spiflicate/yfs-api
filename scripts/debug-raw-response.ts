/**
 * Debug Raw API Response by adding logging to HTTP client temporarily
 */

import { YahooFantasyClient } from '../src/index.js';

const tokens = JSON.parse(await Bun.file('.oauth2-tokens.json').text());

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID!,
   clientSecret: process.env.YAHOO_CLIENT_SECRET!,
   redirectUri: 'oob',
   accessToken: tokens.accessToken,
   refreshToken: tokens.refreshToken,
   expiresAt: tokens.expiresAt,
});

console.log('🔍 Fetching teams...\n');

// Monkey patch the http client's get method to see raw responses
const originalGet = (client as any).http.get.bind((client as any).http);
(client as any).http.get = async function (path: string) {
   const response = await originalGet(path);

   if (path.includes('/teams')) {
      console.log('\n📦 RAW API RESPONSE:');
      console.log('Path:', path);
      console.log('\nFull response:');
      console.log(JSON.stringify(response, null, 2));

      const userData = response.fantasy_content?.users?.[0]?.user;
      if (userData) {
         console.log('\n📋 USER DATA ARRAY:');
         for (let i = 0; i < userData.length; i++) {
            console.log(`\n[${i}]:`, JSON.stringify(userData[i], null, 2));
         }

         const gamesData = userData.find(
            (item: any) =>
               item && typeof item === 'object' && 'games' in item,
         );

         if (gamesData?.games) {
            console.log('\n🎮 GAMES DATA:');
            console.log(JSON.stringify(gamesData.games, null, 2));

            const firstGame = gamesData.games['0'];
            if (firstGame?.game) {
               console.log('\n🎯 FIRST GAME ARRAY:');
               for (let i = 0; i < firstGame.game.length; i++) {
                  console.log(
                     `\n[${i}]:`,
                     JSON.stringify(firstGame.game[i], null, 2),
                  );
               }

               const teamsInGame = firstGame.game.find(
                  (item: any) =>
                     item && typeof item === 'object' && 'teams' in item,
               );

               if (teamsInGame?.teams) {
                  console.log('\n👥 TEAMS DATA:');
                  console.log(JSON.stringify(teamsInGame.teams, null, 2));

                  const firstTeam = teamsInGame.teams['0'];
                  if (firstTeam?.team) {
                     console.log('\n🏆 FIRST TEAM ARRAY:');
                     for (let i = 0; i < firstTeam.team.length; i++) {
                        console.log(
                           `\n[${i}]:`,
                           JSON.stringify(firstTeam.team[i], null, 2),
                        );
                     }
                  }
               }
            }
         }
      }
   }

   return response;
};

const teams = await client.user.getTeams({ gameCode: 'nhl' });

console.log('\n\n✨ PARSED RESULT:');
console.log('Number of teams:', teams.length);
if (teams.length > 0) {
   console.log('\nFirst team object:');
   console.log(JSON.stringify(teams[0], null, 2));
}
