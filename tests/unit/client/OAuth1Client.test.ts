/**
 * Unit tests for OAuth1Client
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { OAuth1Client } from '../../../src/client/OAuth1Client.js';
import { ConfigError } from '../../../src/types/errors.js';

describe('OAuth1Client', () => {
   const consumerKey = 'test-consumer-key';
   const consumerSecret = 'test-consumer-secret';

   describe('constructor', () => {
      test('should create client with valid credentials', () => {
         const client = new OAuth1Client(consumerKey, consumerSecret);
         expect(client).toBeInstanceOf(OAuth1Client);
      });

      test('should throw ConfigError if consumerKey is missing', () => {
         expect(() => {
            new OAuth1Client('', consumerSecret);
         }).toThrow(ConfigError);
      });

      test('should throw ConfigError if consumerSecret is missing', () => {
         expect(() => {
            new OAuth1Client(consumerKey, '');
         }).toThrow(ConfigError);
      });
   });

   describe('signRequest', () => {
      let client: OAuth1Client;

      beforeEach(() => {
         client = new OAuth1Client(consumerKey, consumerSecret);
      });

      test('should sign a GET request', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl';
         const signedUrl = client.signRequest('GET', url);

         // Should return a URL
         expect(signedUrl).toBeTypeOf('string');
         expect(signedUrl).toContain('https://fantasysports.yahooapis.com');

         // Should include OAuth parameters
         expect(signedUrl).toContain('oauth_consumer_key=');
         expect(signedUrl).toContain('oauth_signature=');
         expect(signedUrl).toContain('oauth_signature_method=HMAC-SHA1');
         expect(signedUrl).toContain('oauth_timestamp=');
         expect(signedUrl).toContain('oauth_nonce=');
         expect(signedUrl).toContain('oauth_version=1.0');
      });

      test('should include consumer key in signed URL', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl';
         const signedUrl = client.signRequest('GET', url);

         expect(signedUrl).toContain(`oauth_consumer_key=${consumerKey}`);
      });

      test('should handle URLs with existing query parameters', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl?format=json';
         const signedUrl = client.signRequest('GET', url);

         // Should preserve existing query params
         expect(signedUrl).toContain('format=json');

         // Should add OAuth params
         expect(signedUrl).toContain('oauth_consumer_key=');
         expect(signedUrl).toContain('oauth_signature=');
      });

      test('should handle POST requests', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/league/123.l.456';
         const signedUrl = client.signRequest('POST', url);

         expect(signedUrl).toContain('oauth_signature=');
         expect(signedUrl).toContain('oauth_consumer_key=');
      });

      test('should include additional parameters in signature', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl';
         const params = { format: 'json', count: '10' };
         const signedUrl = client.signRequest('GET', url, params);

         // Should include additional params
         expect(signedUrl).toContain('format=json');
         expect(signedUrl).toContain('count=10');

         // Should still have OAuth params
         expect(signedUrl).toContain('oauth_signature=');
      });

      test('should generate unique nonces for each request', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl';
         const signedUrl1 = client.signRequest('GET', url);
         const signedUrl2 = client.signRequest('GET', url);

         // Extract nonce values (they should be different)
         const nonce1Match = signedUrl1.match(/oauth_nonce=([^&]+)/);
         const nonce2Match = signedUrl2.match(/oauth_nonce=([^&]+)/);

         expect(nonce1Match).toBeTruthy();
         expect(nonce2Match).toBeTruthy();
         expect(nonce1Match![1]).not.toBe(nonce2Match![1]);
      });

      test('should use PLAINTEXT signature method when specified', () => {
         const url =
            'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl';
         const signedUrl = client.signRequest('GET', url, {}, 'PLAINTEXT');

         expect(signedUrl).toContain('oauth_signature_method=PLAINTEXT');
         expect(signedUrl).toContain('oauth_signature=');
      });
   });

   describe('getDebugInfo', () => {
      test('should return debug information', () => {
         const client = new OAuth1Client(consumerKey, consumerSecret);
         const info = client.getDebugInfo();

         expect(info).toMatchObject({
            consumerKey: consumerKey,
            signatureMethod: 'HMAC-SHA1',
         });
      });
   });
});
