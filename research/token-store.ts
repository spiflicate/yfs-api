export interface TokenStore {
   getAccessToken(): Promise<string | null>;
   getRefreshToken(): Promise<string | null>;
   setAccessToken(token: string, expiresAt: Date): Promise<void>;
   setRefreshToken(token: string): Promise<void>;
}

export class MemoryTokenStore implements TokenStore {
   #accessToken: string | null = null;
   #refreshToken: string | null = null;
   #expiresAt: Date | null = null;

   async getAccessToken(): Promise<string | null> {
      if (this.#expiresAt && new Date() > this.#expiresAt) {
         return null;
      }
      return this.#accessToken;
   }

   async getRefreshToken(): Promise<string | null> {
      return this.#refreshToken;
   }

   async setAccessToken(token: string, expiresAt: Date): Promise<void> {
      this.#accessToken = token;
      this.#expiresAt = expiresAt;
   }

   async setRefreshToken(token: string): Promise<void> {
      this.#refreshToken = token;
   }
}
