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
const teams = await client.user.getTeams({ gameCode: 'nhl' });
console.log('Raw first team:', JSON.stringify(teams?.[0], null, 2));
console.log('\nTeam keys:', Object.keys(teams?.[0] || {}));
