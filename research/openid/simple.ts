// test-yahoo-oob.ts
import { request } from 'undici';

const CLIENT_ID = process.env.YAHOO_CLIENT_ID!;
const CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET!;
const CODE = process.env.YAHOO_CODE || '5p37u66'; // set this to the copied code

async function main() {
   const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: CODE,
      redirect_uri: 'https://jbru.dev/yfs-redirect',
      state: 'jbru-test-id',
   });

   const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
      'base64',
   );

   const tokenRes = await request(
      'https://api.login.yahoo.com/oauth2/get_token',
      {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${basicAuth}`,
         },
         body: body.toString(),
      },
   );

   const tokens = (await tokenRes.body.json()) as any;
   console.log('Tokens:', tokens);

   const userinfoRes = await request(
      'https://api.login.yahoo.com/openid/v1/userinfo',
      {
         method: 'GET',
         headers: {
            Authorization: `Bearer ${tokens.access_token}`,
         },
      },
   );

   const userinfo = await userinfoRes.body.json();
   console.log('User info:', userinfo);
}

main().catch(console.error);
