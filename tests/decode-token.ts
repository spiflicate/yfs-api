type JwtSections = {
   header: unknown;
   payload: unknown;
   signature: string;
};

function base64UrlDecode(input: string): string {
   const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
   const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
   return Buffer.from(normalized + padding, 'base64').toString('utf8');
}

function tryParseJson(raw: string): unknown {
   try {
      return JSON.parse(raw);
   } catch {
      return raw;
   }
}

function decodeJwtLikeToken(token: string): JwtSections | null {
   const parts = token.split('.');
   if (parts.length !== 3) {
      return null;
   }

   const [rawHeader, rawPayload, signature] = parts;

   try {
      const headerText = base64UrlDecode(rawHeader);
      const payloadText = base64UrlDecode(rawPayload);

      return {
         header: tryParseJson(headerText),
         payload: tryParseJson(payloadText),
         signature,
      };
   } catch {
      return null;
   }
}

function redactToken(token: string): string {
   if (token.length <= 20) {
      return token;
   }

   return `${token.slice(0, 10)}...${token.slice(-10)}`;
}

async function readTokenFromFile(): Promise<string | null> {
   const file = Bun.file(new URL('.oauth2-tokens.json', import.meta.url));
   if (!(await file.exists())) {
      return null;
   }

   const content = await file.text();
   if (!content.trim()) {
      return null;
   }

   const parsed = JSON.parse(content) as { accessToken?: unknown };
   return typeof parsed.accessToken === 'string'
      ? parsed.accessToken
      : null;
}

async function main() {
   const cliToken = process.argv[2];
   const token = cliToken || (await readTokenFromFile());

   if (!token) {
      console.error('No token found.');
      console.error('Usage: bun run tests/decode-token.ts <token>');
      console.error('Or place an accessToken in tests/.oauth2-tokens.json');
      process.exit(1);
   }

   console.log(`Token (redacted): ${redactToken(token)}`);

   const decoded = decodeJwtLikeToken(token);
   if (!decoded) {
      console.log(
         'Result: token is not JWT-formatted (not 3 dot-separated parts).',
      );
      return;
   }

   console.log('Result: token is JWT-formatted. Decoded sections:');
   console.log('\nHeader:');
   console.dir(decoded.header, { depth: null });
   console.log('\nPayload:');
   console.dir(decoded.payload, { depth: null });
   console.log('\nSignature (redacted):');
   console.log(redactToken(decoded.signature));
}

main().catch((error) => {
   console.error('Failed to decode token:', error);
   process.exit(1);
});
