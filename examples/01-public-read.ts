import { YahooFantasyClient } from 'yfs-api';

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID ?? '',
   clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
   publicMode: true,
});

const { game } = await client.api().game('nhl').get();
console.log(game.name);
