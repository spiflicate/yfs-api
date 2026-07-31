import { createFrontendApi, YahooFrontendApiClient } from 'yfs-api';

// Repository tooling for the operator's own browser session. This module is
// not included in the published package and must not authenticate other users.
import {
   cookieHeaderForUrl,
   loadStorageState,
} from '../tools/yahoo-browser-cookie/browser-cookie-client.js';

async function publicResourceRead(): Promise<void> {
   const api = createFrontendApi(new YahooFrontendApiClient(), {
      access: 'public',
   });

   const game = await api.game('nhl').get();
   console.log(`Public game: ${game.game?.name}`);
}

async function privateResourceRead(
   storageStatePath: string,
   leagueKey: string,
): Promise<void> {
   const storageState = await loadStorageState(storageStatePath);
   const apiUrl = new URL(
      `https://pub-api-rw.fantasysports.yahoo.com/fantasy/v2/league/${leagueKey}/teams`,
   );
   const cookieHeader = cookieHeaderForUrl(storageState, apiUrl);
   if (!cookieHeader) {
      throw new Error('Storage state has no cookie for the Yahoo API host');
   }

   const api = createFrontendApi(
      new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader },
      }),
      { access: 'private' },
   );

   const league = await api.league(leagueKey).teams([]).get();
   console.log('Private league teams:', league.league?.teams ?? []);
}

async function privateResourceReadWithCookieHeader(
   cookieHeader: string,
   leagueKey: string,
): Promise<void> {
   // Copy the Cookie request header from a Yahoo API request in browser
   // developer tools, including or excluding the "Cookie:" header name.
   const api = createFrontendApi(
      new YahooFrontendApiClient({
         authentication: 'browser-session',
         session: { cookieHeader },
      }),
      { access: 'private' },
   );

   const league = await api.league(leagueKey).teams([]).get();
   console.log('Private league teams:', league.league?.teams ?? []);
}

if (import.meta.main) {
   await publicResourceRead();

   const storageStatePath = process.env.YAHOO_STORAGE_STATE;
   const cookieHeader = process.env.YAHOO_COOKIE_HEADER;
   const leagueKey = process.env.YAHOO_LEAGUE_KEY;
   if (!storageStatePath && !cookieHeader) {
      console.log(
         'Skipping private read: set YAHOO_COOKIE_HEADER or YAHOO_STORAGE_STATE',
      );
   }
   if (leagueKey && storageStatePath) {
      await privateResourceRead(storageStatePath, leagueKey);
   }
   if (leagueKey && cookieHeader) {
      await privateResourceReadWithCookieHeader(cookieHeader, leagueKey);
   }
}
