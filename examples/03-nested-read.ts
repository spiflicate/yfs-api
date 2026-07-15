import { YahooFantasyClient } from 'yfs-api';

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID ?? '',
   clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
   redirectUri: 'https://example.test/oauth/callback',
});

const response = await client.api().users().games(['nhl']).teams([]).get();
for (const user of response.users) {
   for (const game of user.games ?? []) {
      console.log(game.code, game.teams ?? []);
   }
}
