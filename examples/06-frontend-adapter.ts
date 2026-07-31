import {
   type FrontendV2Response,
   type FrontendV3Response,
   YahooFrontendApiClient,
} from 'yfs-api';

// Internal repository tooling. This module is not included in the published package.
import {
   cookieHeaderForUrl,
   loadStorageState,
} from '../research/yahoo-browser-cookie-tooling/browser-cookie-client.js';

async function publicFrontendRead(): Promise<void> {
   const client = new YahooFrontendApiClient();

   // v2 defaults to the XML response and the existing XML normalizer.
   const game = await client.get<
      FrontendV2Response<{ game: { name: string } }>
   >('/fantasy/v2/game/nhl');
   console.log(`Public game: ${game.game.name}`);

   // v3 returns the observed JSON service envelope.
   const crumb = await client.get<FrontendV3Response<{ crumb: string }>>(
      '/fantasy/v3/getCrumb',
   );
   console.log(`Crumb available: ${Boolean(crumb.service.crumb)}`);
}

async function privateFrontendRead(
   storageStatePath: string,
): Promise<void> {
   const storageState = await loadStorageState(storageStatePath);
   const apiUrl = new URL(
      'https://pub-api-ro.fantasysports.yahoo.com/fantasy/v2/league/223.l.12345',
   );
   const cookieHeader = cookieHeaderForUrl(storageState, apiUrl);
   if (!cookieHeader) {
      throw new Error('Storage state has no cookie for the Yahoo API host');
   }

   const client = new YahooFrontendApiClient({
      authentication: 'browser-session',
      session: { cookieHeader },
   });
   const league = await client.get('/fantasy/v2/league/223.l.12345', {
      access: 'private',
   });
   console.log('Private league response:', league);
}

if (import.meta.main) {
   await publicFrontendRead();

   const storageStatePath = process.env.YAHOO_STORAGE_STATE;
   if (storageStatePath) await privateFrontendRead(storageStatePath);
}
