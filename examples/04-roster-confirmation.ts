import {
   RosterMoveBuilder,
   YahooFantasyClient,
   type YahooRosterUpdateConfirmationDto,
} from 'yfs-api';

const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID ?? '',
   clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
   redirectUri: 'https://example.test/oauth/callback',
});

const moves = new RosterMoveBuilder().week(1).movePlayer('1.p.2', 'BN');
const confirmation: YahooRosterUpdateConfirmationDto | undefined =
   await client.api().team('1.l.2.t.3').roster().update(moves);

console.log(confirmation?.confirmation.status ?? 'no response body');
