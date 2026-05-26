/**
 * Example: File-Based Token Storage
 *
 * This example shows how to implement secure file-based token storage
 * with encryption and proper error handling.
 *
 * Features:
 * - Encrypts tokens at rest using AES-256-GCM
 * - Persists an auto-generated recovery key in a sibling .key file
 * - Proper file permissions (readable only by current user)
 * - Atomic writes to prevent corruption
 * - Error handling and logging
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { chmod, readFile, unlink, writeFile } from 'node:fs/promises';
import type { OAuth2Tokens } from '../src/auth/oauth2.js';
import type { TokenStorage } from '../src/client/yahoo.js';

/**
 * Secure file-based token storage with encryption
 */
export class FileTokenStorage implements TokenStorage {
   private readonly filePath: string;
   private readonly keyFilePath: string;
   private readonly encryptionKey: Buffer;
   private readonly debug: boolean;
   private readonly usesGeneratedKey: boolean;

   /**
    * Creates a new file-based token storage
    *
    * @param filePath - Path to store the token file (default: .tokens.enc)
    * @param encryptionKey - 32-byte encryption key as 64 hex characters
    * @param debug - Enable debug logging
    */
   constructor(
      filePath = '.tokens.enc',
      encryptionKey?: string,
      debug = false,
   ) {
      this.filePath = filePath;
      this.keyFilePath = `${filePath}.key`;
      this.debug = debug;

      // Use provided key, reuse a persisted sidecar key, or generate one for first save.
      if (encryptionKey) {
         this.encryptionKey = this.parseEncryptionKey(encryptionKey);
         this.usesGeneratedKey = false;
      } else if (existsSync(this.keyFilePath)) {
         const persistedKey = readFileSync(this.keyFilePath, 'utf8').trim();
         this.encryptionKey = this.parseEncryptionKey(persistedKey);
         this.usesGeneratedKey = true;

         if (this.debug) {
            console.warn(
               `[FileTokenStorage] Loaded encryption key from ${this.keyFilePath}`,
            );
         }
      } else {
         // Generate a random key and persist it next to the token file on first save.
         this.encryptionKey = randomBytes(32);
         this.usesGeneratedKey = true;

         console.warn(
            '[FileTokenStorage] No encryption key provided; a sidecar .key file will be written on first save',
         );
         console.warn(
            `[FileTokenStorage] Store ${this.keyFilePath} safely, then remove it from disk once backed up`,
         );
      }
   }

   /**
    * Saves tokens to encrypted file
    */
   async save(tokens: OAuth2Tokens): Promise<void> {
      try {
         if (this.debug) {
            console.log(
               `[FileTokenStorage] Saving tokens to ${this.filePath}`,
            );
         }

         await this.persistGeneratedKey();

         // Serialize tokens
         const plaintext = JSON.stringify(tokens, null, 2);

         // Encrypt
         const encrypted = this.encrypt(plaintext);

         // Write to temp file first (atomic write)
         const tempPath = `${this.filePath}.tmp`;
         await writeFile(tempPath, encrypted);

         // Set restrictive permissions (owner read/write only)
         await chmod(tempPath, 0o600);

         // Rename to final location (atomic on most filesystems)
         await writeFile(this.filePath, encrypted);
         await chmod(this.filePath, 0o600);

         // Clean up temp file
         try {
            await unlink(tempPath);
         } catch {
            // Ignore if temp file doesn't exist
         }

         if (this.debug) {
            console.log('[FileTokenStorage] Tokens saved successfully');
         }
      } catch (error) {
         console.error('[FileTokenStorage] Failed to save tokens:', error);
         throw error;
      }
   }

   /**
    * Loads tokens from encrypted file
    */
   async load(): Promise<OAuth2Tokens | null> {
      try {
         if (this.debug) {
            console.log(
               `[FileTokenStorage] Loading tokens from ${this.filePath}`,
            );
         }

         // Check if file exists
         if (!existsSync(this.filePath)) {
            if (this.debug) {
               console.log('[FileTokenStorage] No token file found');
            }
            return null;
         }

         // Read encrypted file
         const encrypted = await readFile(this.filePath);

         // Decrypt
         const plaintext = this.decrypt(encrypted);

         // Parse tokens
         const tokens = JSON.parse(plaintext) as OAuth2Tokens;

         if (this.debug) {
            console.log('[FileTokenStorage] Tokens loaded successfully');
         }

         return tokens;
      } catch (error) {
         console.error('[FileTokenStorage] Failed to load tokens:', error);
         return null;
      }
   }

   /**
    * Clears stored tokens
    */
   async clear(): Promise<void> {
      try {
         if (this.debug) {
            console.log(
               `[FileTokenStorage] Clearing tokens from ${this.filePath}`,
            );
         }

         if (existsSync(this.filePath)) {
            await unlink(this.filePath);
         }

         if (this.usesGeneratedKey && existsSync(this.keyFilePath)) {
            await unlink(this.keyFilePath);
         }

         if (this.debug) {
            console.log('[FileTokenStorage] Tokens cleared successfully');
         }
      } catch (error) {
         console.error('[FileTokenStorage] Failed to clear tokens:', error);
         // Don't throw, clearing is best-effort
      }
   }

   /**
    * Encrypts data using AES-256-GCM
    */
   private encrypt(plaintext: string): Buffer {
      // Generate random IV (initialization vector)
      const iv = randomBytes(16);

      // Create cipher
      const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);

      // Encrypt
      const encrypted = Buffer.concat([
         cipher.update(plaintext, 'utf8'),
         cipher.final(),
      ]);

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine: IV (16) + Auth Tag (16) + Encrypted Data
      return Buffer.concat([iv, authTag, encrypted]);
   }

   private parseEncryptionKey(encryptionKey: string): Buffer {
      if (encryptionKey.length !== 64) {
         throw new Error(
            'Encryption key must be 64 hex characters (32 bytes)',
         );
      }

      return Buffer.from(encryptionKey, 'hex');
   }

   private async persistGeneratedKey(): Promise<void> {
      if (!this.usesGeneratedKey || existsSync(this.keyFilePath)) {
         return;
      }

      await writeFile(
         this.keyFilePath,
         `${this.encryptionKey.toString('hex')}\n`,
      );
      await chmod(this.keyFilePath, 0o600);

      console.warn(
         `[FileTokenStorage] Wrote recovery key to ${this.keyFilePath}`,
      );
      console.warn(
         '[FileTokenStorage] Store it safely, then remove the file from disk',
      );
   }

   /**
    * Decrypts data using AES-256-GCM
    */
   private decrypt(encrypted: Buffer): string {
      // Extract components
      const iv = encrypted.subarray(0, 16);
      const authTag = encrypted.subarray(16, 32);
      const data = encrypted.subarray(32);

      // Create decipher
      const decipher = createDecipheriv(
         'aes-256-gcm',
         this.encryptionKey,
         iv,
      );
      decipher.setAuthTag(authTag);

      // Decrypt
      const plaintext = Buffer.concat([
         decipher.update(data),
         decipher.final(),
      ]);

      return plaintext.toString('utf8');
   }
}

/**
 * Simple unencrypted file storage (for development only)
 */
export class SimpleFileTokenStorage implements TokenStorage {
   private readonly filePath: string;
   private readonly debug: boolean;

   constructor(filePath = '.oauth2-tokens.json', debug = false) {
      this.filePath = filePath;
      this.debug = debug;
   }

   async save(tokens: OAuth2Tokens): Promise<void> {
      if (this.debug) {
         console.log(
            `[SimpleFileTokenStorage] Saving tokens to ${this.filePath}`,
         );
      }
      await writeFile(this.filePath, JSON.stringify(tokens, null, 2));
      await chmod(this.filePath, 0o600); // Still set restrictive permissions
   }

   async load(): Promise<OAuth2Tokens | null> {
      try {
         if (this.debug) {
            console.log(
               `[SimpleFileTokenStorage] Loading tokens from ${this.filePath}`,
            );
         }
         if (!existsSync(this.filePath)) {
            return null;
         }
         const content = await readFile(this.filePath, 'utf8');
         return JSON.parse(content) as OAuth2Tokens;
      } catch {
         return null;
      }
   }

   async clear(): Promise<void> {
      if (this.debug) {
         console.log(
            `[SimpleFileTokenStorage] Clearing tokens from ${this.filePath}`,
         );
      }
      try {
         if (existsSync(this.filePath)) {
            await unlink(this.filePath);
         }
      } catch {
         // Ignore errors
      }
   }
}
