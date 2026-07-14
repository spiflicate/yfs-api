import { readFile, rm, writeFile } from 'node:fs/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import {
   type OAuth2Tokens,
   type TokenStorage,
   YahooFantasyClient,
} from 'yfs-api';

const clientId = process.env.YAHOO_CLIENT_ID;
const clientSecret = process.env.YAHOO_CLIENT_SECRET;

if (!clientId) {
   throw new Error('YAHOO_CLIENT_ID is required');
}
if (!clientSecret) {
   throw new Error('YAHOO_CLIENT_SECRET is required');
}

// Persist refreshable OAuth tokens locally without exposing them to other users.
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
      clientId,
      clientSecret,
      redirectUri: 'oob',
   },
   storage,
);

// OOB authorization displays a code for manual copying, so there is no callback state to validate.
console.log('Open this Yahoo authorization URL:');
console.log(client.getAuthUrl());

const readline = createInterface({ input, output });
let code: string;
try {
   code = (
      await readline.question('Paste the authorization code: ')
   ).trim();
} finally {
   readline.close();
}

if (!code) {
   throw new Error('Authorization code cannot be empty');
}

// authenticate exchanges the code and saves the resulting tokens via TokenStorage.
await client.authenticate(code);

const response = await client.api().users().games().get();
const games = response.users.flatMap((user) => user.games ?? []);
console.log(`Authenticated. Found ${games.length} fantasy game(s).`);
for (const game of games) {
   console.log(`${game.code} ${game.season}: ${game.name}`);
}
