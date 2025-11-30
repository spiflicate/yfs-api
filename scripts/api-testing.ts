import { YahooFantasyClient } from '../src';

if (!process.env.YAHOO_CLIENT_ID || !process.env.YAHOO_CLIENT_SECRET) {
   throw new Error(
      'Please set YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, YAHOO_ACCESS_TOKEN, and YAHOO_REFRESH_TOKEN environment variables.',
   );
}

const tokens = await Bun.file('./.test-tokens.json').json();
if (!tokens.accessToken || !tokens.refreshToken) {
   throw new Error('Invalid test-tokens.json file.');
}
const client = new YahooFantasyClient({
   clientId: process.env.YAHOO_CLIENT_ID,
   clientSecret: process.env.YAHOO_CLIENT_SECRET,
   accessToken: tokens.accessToken,
   refreshToken: tokens.refreshToken,
   expiresAt: tokens.expiresAt,
   redirectUri: 'oob',
});

const leagues = [
   '465.l.50894',
   '465.l.50896',
   '465.l.50897',
   '465.l.50900',
   '465.l.50902',
   '465.l.120714',
   '465.l.120729',
   '465.l.120740',
   '465.l.120744',
   '465.l.120749',
   '465.l.120753',
   '465.l.120757',
   '465.l.120761',
   '465.l.120767',
   '465.l.120788',
   '465.l.120790',
   '465.l.120792',
   '465.l.120793',
   '465.l.120797',
   '465.l.120801',
   '465.l.120802',
   '465.l.120818',
   '465.l.120824',
   '465.l.120828',
   '465.l.120834',
   '465.l.120836',
   '465.l.120840',
   '465.l.120843',
   '465.l.120879',
   '465.l.120882',
   '465.l.120885',
   '465.l.120887',
   '465.l.120891',
   '465.l.120901',
   '465.l.120903',
   '465.l.120906',
   '465.l.121339',
   '465.l.121343',
   '465.l.121345',
   '465.l.121350',
   '465.l.121356',
   '465.l.121358',
   '465.l.121365',
   '465.l.121368',
   '465.l.121373',
   '465.l.121376',
   '465.l.121378',
   '465.l.121380',
   '465.l.121384',
   '465.l.121387',
   '465.l.121389',
];

client
   .advanced()
   .resource('league', leagues[0])
   .resource('player', '465.p.8895')
   // .param('player_keys', '465.p.8895')
   // .param('sort_type', 'date')
   // .param('sort_date', '2025-10-07')
   .resource('ownership')
   .execute()
   .then((response) => {
      Bun.write(
         './scripts/wallstedt.json',
         JSON.stringify(response, null, 2),
      );
      // console.log(JSON.stringify(response, null, 2));
   })
   .catch((error) => {
      console.error('Error fetching data:', error);
   });
