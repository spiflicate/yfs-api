// import { describe, expect, it } from 'bun:test';
import {
   type OAuth2Tokens,
   RosterMoveBuilder,
   YahooFantasyClient,
} from '../src/index';

async function main() {
   const yfs = await setup().catch((error) => {
      console.error('An error occurred during setup:', error);
      throw error; // re-throw to prevent further execution
   });
   try {
      // Example API call to verify authentication works
      // const user = await yfs.api().users().get();
      // const game = await yfs.api().games('nfl').teams().get();
      // const team = await yfs.api().game('nfl').leagues('').teams().get();

      // console.log('Authenticated user info:', user);
      // console.log('Game info:', game);
      // console.log('Team info:', team);
      // cal raleigh C - 11531
      // trea turner SS - 10056
      // jazz chisholm 2B,3B - 10839
      const rosterMove = new RosterMoveBuilder()
         .date('2026-05-26')
         .movePlayer('mlb.p.10839', '2B');
      // .movePlayer('mlb.p.10056', 'SS');
      console.dir(rosterMove.toPayload(), { depth: 10 });
      const teamInfo = await yfs
         .api()
         .team('mlb.l.230332.t.4')
         .roster()
         .update(rosterMove);
      console.log('Updated team roster:', teamInfo);
      // Save result to tmp folder
      const outputPath = new URL(
         'tmp/updated-team-roster.json',
         import.meta.url,
      );
      await Bun.write(outputPath, JSON.stringify(teamInfo, null, 2));
   } catch (error) {
      console.error('Error fetching user info:', error);
   }
}

main().catch((error) => {
   console.error('An unexpected error occurred:', error);
   process.exit(1);
});

//------------------------------------------------------------------------------

class ResearchTokenStorage {
   constructor(private readonly tokenPath = '.oauth2-tokens.json') {}

   async save(tokens: OAuth2Tokens): Promise<void> {
      await Bun.write(this.tokenPath, JSON.stringify(tokens, null, 2));
   }

   async load(): Promise<OAuth2Tokens | null> {
      try {
         const file = Bun.file(this.tokenPath);
         if (!(await file.exists())) {
            return null;
         }

         const content = await file.text();
         if (!content.trim()) {
            return null;
         }

         return JSON.parse(content) as OAuth2Tokens;
      } catch {
         return null;
      }
   }

   async clear(): Promise<void> {
      // no-op since this is just a research implementation
   }
}

async function setup() {
   const tokenStorage = new ResearchTokenStorage(
      new URL('.oauth2-tokens.json', import.meta.url).pathname,
   );

   if (!process.env.YAHOO_CLIENT_ID || !process.env.YAHOO_CLIENT_SECRET) {
      throw new Error('Missing required environment variables.');
   }

   const yfs = new YahooFantasyClient(
      {
         clientId: process.env.YAHOO_CLIENT_ID,
         clientSecret: process.env.YAHOO_CLIENT_SECRET,
         redirectUri: 'oob',
      },
      tokenStorage,
   );

   if (await yfs.loadTokens()) {
      console.log('Loaded existing tokens from storage.');
   } else {
      const authUrl = yfs.getAuthUrl();
      console.log('Open this URL in your browser to authenticate:');
      console.log(authUrl);

      const code = prompt('Enter the authorization code:') || '';
      await yfs.authenticate(code);
      console.log('Authentication successful, tokens saved to storage.');
   }

   if (yfs.isAuthenticated()) {
      console.log(
         'Successfully authenticated with Yahoo Fantasy Sports API!',
      );
   } else {
      console.error('Failed to authenticate.');
   }
   return yfs;
}
