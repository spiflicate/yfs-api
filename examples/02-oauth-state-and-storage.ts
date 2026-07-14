import { readFile, rm, writeFile } from 'node:fs/promises';
import {
   type OAuth2Tokens,
   type TokenStorage,
   YahooFantasyClient,
} from 'yfs-api';

const tokenFile = '.yfs-tokens.json';
const storage: TokenStorage = {
   async save(tokens) {
      await writeFile(tokenFile, JSON.stringify(tokens), { mode: 0o600 });
   },
   async load() {
      try {
         return JSON.parse(
            await readFile(tokenFile, 'utf8'),
         ) as OAuth2Tokens;
      } catch {
         return null;
      }
   },
   async clear() {
      await rm(tokenFile, { force: true });
   },
};

const client = new YahooFantasyClient(
   {
      clientId: process.env.YAHOO_CLIENT_ID ?? '',
      clientSecret: process.env.YAHOO_CLIENT_SECRET ?? '',
      redirectUri: 'https://example.test/oauth/callback',
   },
   storage,
);

const authorization = client.createAuthorizationRequest();
console.log(authorization.url);
client.validateAuthorizationState(authorization.state, authorization.state);
