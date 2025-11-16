/**
 * OAuth 1.0 client for Yahoo Fantasy Sports API public requests
 *
 * Implements 2-legged OAuth 1.0 with HMAC-SHA1 signing for accessing
 * public endpoints without user authorization.
 *
 * @module
 */

import { ConfigError } from '../types/errors.js';

/**
 * OAuth 1.0 signature method
 */
export type OAuth1SignatureMethod = 'HMAC-SHA1' | 'PLAINTEXT';

/**
 * OAuth 1.0 parameters for request signing
 */
export interface OAuth1Params {
   oauth_consumer_key: string;
   oauth_nonce: string;
   oauth_signature_method: string;
   oauth_timestamp: number;
   oauth_version: string;
   oauth_signature?: string;
}

/**
 * OAuth 1.0 client for 2-legged authentication (public mode)
 *
 * This client implements OAuth 1.0 request signing for accessing Yahoo's
 * public Fantasy Sports API endpoints without requiring user authorization.
 *
 * According to Yahoo's documentation, public requests use 2-legged OAuth,
 * which means signing requests with your consumer key/secret but without
 * an access token.
 *
 * @example
 * ```typescript
 * const oauth1 = new OAuth1Client(
 *   'your-consumer-key',
 *   'your-consumer-secret'
 * );
 *
 * // Sign a request
 * const signedUrl = oauth1.signRequest(
 *   'GET',
 *   'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl'
 * );
 *
 * // Make the request
 * const response = await fetch(signedUrl);
 * ```
 */
export class OAuth1Client {
   private consumerKey: string;
   private consumerSecret: string;

   /**
    * Creates a new OAuth 1.0 client for public API access
    *
    * @param consumerKey - OAuth consumer key (Client ID) from Yahoo Developer
    * @param consumerSecret - OAuth consumer secret (Client Secret) from Yahoo Developer
    * @throws {ConfigError} If consumer key or secret is missing
    */
   constructor(consumerKey: string, consumerSecret: string) {
      if (!consumerKey) {
         throw new ConfigError('OAuth consumer key is required');
      }
      if (!consumerSecret) {
         throw new ConfigError('OAuth consumer secret is required');
      }

      this.consumerKey = consumerKey;
      this.consumerSecret = consumerSecret;
   }

   /**
    * Signs a request URL using OAuth 1.0 HMAC-SHA1 signature
    *
    * This implements 2-legged OAuth (no user token) for public endpoints.
    * The signed URL can be used directly with fetch() or other HTTP clients.
    *
    * @param method - HTTP method (GET, POST, PUT, DELETE)
    * @param url - Full URL to sign (without query parameters if using params object)
    * @param params - Optional additional parameters to include in signature
    * @param signatureMethod - Signature method (default: HMAC-SHA1)
    * @returns Signed URL with OAuth parameters appended
    *
    * @example
    * ```typescript
    * const signedUrl = oauth1.signRequest(
    *   'GET',
    *   'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl'
    * );
    * ```
    */
   signRequest(
      method: string,
      url: string,
      params: Record<string, string> = {},
      signatureMethod: OAuth1SignatureMethod = 'HMAC-SHA1',
   ): string {
      // Parse URL to separate base URL from query params
      const urlObj = new URL(url);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

      // Combine query params with additional params
      const allParams: Record<string, string> = { ...params };
      urlObj.searchParams.forEach((value, key) => {
         allParams[key] = value;
      });

      // Generate OAuth parameters
      const oauthParams: OAuth1Params = {
         oauth_consumer_key: this.consumerKey,
         oauth_nonce: this.generateNonce(),
         oauth_signature_method: signatureMethod,
         oauth_timestamp: Math.floor(Date.now() / 1000),
         oauth_version: '1.0',
      };

      // Combine all parameters for signing
      const signingParams = {
         ...allParams,
         ...oauthParams,
      };

      // Generate signature
      const signature = this.generateSignature(
         method,
         baseUrl,
         signingParams,
         signatureMethod,
      );

      // Add signature to OAuth params
      oauthParams.oauth_signature = signature;

      // Build final URL with OAuth parameters
      const finalParams = new URLSearchParams();

      // Add all original params
      Object.entries(allParams).forEach(([key, value]) => {
         finalParams.append(key, value);
      });

      // Add OAuth params
      Object.entries(oauthParams).forEach(([key, value]) => {
         finalParams.append(key, String(value));
      });

      return `${baseUrl}?${finalParams.toString()}`;
   }

   /**
    * Generates OAuth signature for request
    *
    * @param method - HTTP method
    * @param baseUrl - Base URL without query parameters
    * @param params - All parameters to include in signature
    * @param signatureMethod - Signature method
    * @returns OAuth signature
    */
   private generateSignature(
      method: string,
      baseUrl: string,
      params: Record<string, string | number>,
      signatureMethod: OAuth1SignatureMethod,
   ): string {
      if (signatureMethod === 'PLAINTEXT') {
         // PLAINTEXT signature is just the consumer secret
         return `${encodeURIComponent(this.consumerSecret)}&`;
      }

      // HMAC-SHA1 signature
      // Step 1: Sort parameters by key
      const sortedKeys = Object.keys(params).sort();

      // Step 2: Create parameter string
      const paramString = sortedKeys
         .map(
            (key) =>
               `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`,
         )
         .join('&');

      // Step 3: Create signature base string
      const baseString = [
         method.toUpperCase(),
         encodeURIComponent(baseUrl),
         encodeURIComponent(paramString),
      ].join('&');

      // Step 4: Create signing key (consumer_secret&token_secret)
      // For 2-legged OAuth (public mode), token_secret is empty
      const signingKey = `${encodeURIComponent(this.consumerSecret)}&`;

      // Step 5: Generate HMAC-SHA1 signature
      const signature = this.hmacSha1(baseString, signingKey);

      return signature;
   }

   /**
    * Generates a random nonce for OAuth request
    *
    * @returns Random nonce string
    */
   private generateNonce(): string {
      return (
         Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
      );
   }

   /**
    * Generates HMAC-SHA1 signature
    *
    * Uses the Web Crypto API (available in Node.js 15+ and browsers)
    *
    * @param data - Data to sign
    * @param key - Signing key
    * @returns Base64-encoded signature
    */
   private hmacSha1(data: string, key: string): string {
      // Use Node.js crypto module for HMAC-SHA1
      // This is available in both Node.js and Bun
      const crypto = require('node:crypto');
      const hmac = crypto.createHmac('sha1', key);
      hmac.update(data);
      return hmac.digest('base64');
   }

   /**
    * Gets the OAuth parameters for debugging
    *
    * @returns Object containing consumer key and signature method
    */
   getDebugInfo(): { consumerKey: string; signatureMethod: string } {
      return {
         consumerKey: this.consumerKey,
         signatureMethod: 'HMAC-SHA1',
      };
   }
}
