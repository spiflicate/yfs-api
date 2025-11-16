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
const team = teams?.[0];
console.log('teamKey length:', team?.teamKey?.length);
console.log('teamKey value:', JSON.stringify(team?.teamKey));
console.log('teamId:', team?.teamId);
console.log('name length:', team?.name?.length);
console.log('name value:', JSON.stringify(team?.name));
console.log('Full team:', team);
