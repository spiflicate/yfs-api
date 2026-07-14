// yahoo-oauth.ts
import express from 'express';
import { decodeJwt, type JWTPayload } from 'jose';
import { request } from 'undici';

const YAHOO_AUTHORIZATION_ENDPOINT =
   'https://api.login.yahoo.com/oauth2/request_auth';
const YAHOO_TOKEN_ENDPOINT = 'https://api.login.yahoo.com/oauth2/get_token';
const YAHOO_USERINFO_ENDPOINT =
   'https://api.login.yahoo.com/openid/v1/userinfo';

const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID!;
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET!;
const YAHOO_REDIRECT_URI = 'https://your-app.com/auth/yahoo/callback'; // must match app config

// Raw token response from Yahoo
interface YahooTokens {
   access_token: string;
   refresh_token?: string;
   id_token?: string;
   token_type: 'bearer';
   expires_in: number;
}

// Subset of claims Yahoo documents as supported in ID token and userinfo
// (see openid-configuration: claims_supported).[web:22]
interface YahooIdTokenClaims extends JWTPayload {
   sub: string;
   name?: string;
   given_name?: string;
   family_name?: string;
   email?: string;
   email_verified?: boolean;
   locale?: string;
}

// Userinfo response has the same basic OpenID Connect claims.[web:19][web:22]
interface YahooUserInfo {
   sub: string;
   name?: string;
   given_name?: string;
   family_name?: string;
   email?: string;
   email_verified?: boolean;
   locale?: string;
}

// What you’ll typically propagate into your app
interface YahooIdentity {
   yahooSub: string;
   email?: string;
   emailVerified?: boolean;
   name?: string;
   givenName?: string;
   familyName?: string;

   // raw artifacts if you want to inspect / debug
   tokens: YahooTokens;
   idTokenClaims?: YahooIdTokenClaims;
   userInfo?: YahooUserInfo;
}

const app = express();

// You already have a route that redirects to Yahoo’s authorization endpoint.
// It will look something like this (shown for completeness):
app.get('/auth/yahoo', (req, res) => {
   const state = crypto.randomUUID();
   const nonce = crypto.randomUUID();

   // TODO: persist state + nonce in session / cookie

   const params = new URLSearchParams({
      client_id: YAHOO_CLIENT_ID,
      response_type: 'code',
      redirect_uri: YAHOO_REDIRECT_URI,
      scope: 'openid profile email',
      state,
      nonce,
   });

   res.redirect(`${YAHOO_AUTHORIZATION_ENDPOINT}?${params.toString()}`);
});

// This is the important part: callback that wires everything together.
app.get('/auth/yahoo/callback', async (req, res, next) => {
   try {
      const code = req.query.code as string | undefined;
      const state = req.query.state as string | undefined;

      if (!code) {
         res.status(400).send('Missing code');
         return;
      }

      // TODO: validate `state` against what you stored

      // 1) Exchange authorization code for tokens
      const tokenBody = new URLSearchParams({
         grant_type: 'authorization_code',
         code,
         redirect_uri: YAHOO_REDIRECT_URI,
      });

      const basicAuth = Buffer.from(
         `${YAHOO_CLIENT_ID}:${YAHOO_CLIENT_SECRET}`,
      ).toString('base64');

      const tokenRes = await request(YAHOO_TOKEN_ENDPOINT, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
         },
         body: tokenBody.toString(),
      });

      if (tokenRes.statusCode !== 200) {
         const errorText = await tokenRes.body.text();
         console.error(
            'Yahoo token error:',
            tokenRes.statusCode,
            errorText,
         );
         res.status(500).send('Error exchanging code');
         return;
      }

      const tokens = (await tokenRes.body.json()) as YahooTokens;

      // 2) Decode ID token (for demo we just decode; in prod, verify signature
      //    against https://api.login.yahoo.com/openid/v1/certs).[web:22][web:27]
      let idTokenClaims: YahooIdTokenClaims | undefined;
      if (tokens.id_token) {
         idTokenClaims = decodeJwt(tokens.id_token) as YahooIdTokenClaims;
      }

      // 3) Fetch userinfo with the access token
      const userinfoRes = await request(YAHOO_USERINFO_ENDPOINT, {
         method: 'GET',
         headers: {
            Authorization: `Bearer ${tokens.access_token}`,
         },
      });

      if (userinfoRes.statusCode !== 200) {
         const errorText = await userinfoRes.body.text();
         console.error(
            'Yahoo userinfo error:',
            userinfoRes.statusCode,
            errorText,
         );
         // You can still fall back to ID token claims if present
      }

      const userInfo =
         userinfoRes.statusCode === 200
            ? ((await userinfoRes.body.json()) as YahooUserInfo)
            : undefined;

      // 4) Build a normalized identity object with all available info
      const sub = userInfo?.sub ?? idTokenClaims?.sub;
      if (!sub) {
         res.status(500).send('Could not determine Yahoo subject');
         return;
      }

      const identity: YahooIdentity = {
         yahooSub: sub,
         email: userInfo?.email ?? idTokenClaims?.email,
         emailVerified:
            userInfo?.email_verified ?? idTokenClaims?.email_verified,
         name: userInfo?.name ?? idTokenClaims?.name,
         givenName: userInfo?.given_name ?? idTokenClaims?.given_name,
         familyName: userInfo?.family_name ?? idTokenClaims?.family_name,
         tokens,
         idTokenClaims,
         userInfo,
      };

      // 5) At this point, you can:
      //    - Look up / create a local user based on yahooSub (and maybe email)
      //    - Persist tokens (access + refresh + expiry) for future Fantasy API calls
      //    - Issue your own session / JWT
      console.log('Yahoo identity:', JSON.stringify(identity, null, 2));

      // Example: stick identity on the session and redirect
      // (replace with your actual session handling)
      (req as any).yahooIdentity = identity;

      res.send('Logged in with Yahoo, identity printed on server');
   } catch (err) {
      next(err);
   }
});

async function fetchYahooFantasyLeagues(
   accessToken: string,
): Promise<unknown> {
   const url =
      'https://fantasysports.yahooapis.com/' +
      'fantasy/v2/users;use_login=1/games;game_keys=nhl/leagues?format=json';

   const resp = await request(url, {
      method: 'GET',
      headers: {
         Authorization: `Bearer ${accessToken}`,
      },
   });

   if (resp.statusCode !== 200) {
      const text = await resp.body.text();
      throw new Error(`Fantasy API error ${resp.statusCode}: ${text}`);
   }

   return resp.body.json();
}
