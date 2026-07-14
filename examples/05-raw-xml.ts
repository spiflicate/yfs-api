import { YahooFantasyClient } from 'yfs-api';

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID ?? '',
   clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
   publicMode: true,
});

const xml = await client.requestRawXml('game/nhl');
console.log(xml);
