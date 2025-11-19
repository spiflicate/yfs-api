import { YahooFantasyClient } from '../src/index.js';

// import sample from './scoreboard-response.json' with { type: 'json' };

// console.log('Sample data:', JSON.stringify(sample, null, 2));

const yfsClient = setupYahooClient();
const scoreboard = await yfsClient.league.getScoreboard('465.l.121384');

console.log('Scoreboard data:', JSON.stringify(scoreboard, null, 2));
Bun.write('scoreboard-response.json', JSON.stringify(scoreboard, null, 2));

function setupYahooClient(): YahooFantasyClient {
   const clientId = process.env.YAHOO_CLIENT_ID;
   const clientSecret = process.env.YAHOO_CLIENT_SECRET;

   if (!clientId || !clientSecret) {
      throw new Error(
         'Yahoo API credentials are not properly set in environment variables.',
      );
   }

   return new YahooFantasyClient({
      clientId,
      clientSecret,
      publicMode: true,
   });
}
