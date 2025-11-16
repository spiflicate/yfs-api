/**
 * Local HTTP server for OAuth 2.0 callback handling
 * @module
 */

import { AuthenticationError } from '../types/errors.js';

/**
 * Result from OAuth callback server
 */
export interface OAuthCallbackResult {
   /**
    * Authorization code received from OAuth provider
    */
   code: string;

   /**
    * State parameter (if provided)
    */
   state?: string;
}

/**
 * Error received from OAuth callback
 */
export interface OAuthCallbackError {
   /**
    * Error code
    */
   error: string;

   /**
    * Error description
    */
   error_description?: string;
}

/**
 * Options for local OAuth server
 */
export interface LocalOAuthServerOptions {
   /**
    * Port to listen on (default: 3000)
    */
   port?: number;

   /**
    * Timeout in milliseconds (default: 5 minutes)
    */
   timeout?: number;

   /**
    * Path to listen on (default: '/callback')
    */
   path?: string;

   /**
    * Expected state parameter for CSRF protection
    */
   expectedState?: string;

   /**
    * Enable debug logging
    */
   debug?: boolean;
}

/**
 * HTML response shown to user after successful authentication
 */
const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Authentication Successful</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
			margin: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		}
		.container {
			background: white;
			padding: 3rem;
			border-radius: 1rem;
			box-shadow: 0 10px 40px rgba(0,0,0,0.2);
			text-align: center;
			max-width: 500px;
		}
		h1 {
			color: #667eea;
			margin-top: 0;
		}
		.success-icon {
			font-size: 4rem;
			margin-bottom: 1rem;
		}
		p {
			color: #666;
			line-height: 1.6;
		}
		.close-message {
			margin-top: 2rem;
			padding: 1rem;
			background: #f0f0f0;
			border-radius: 0.5rem;
			font-size: 0.9rem;
			color: #666;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="success-icon">✓</div>
		<h1>Authentication Successful!</h1>
		<p>You have successfully authenticated with Yahoo Fantasy Sports.</p>
		<p>You can now close this window and return to your application.</p>
		<div class="close-message">
			This window will close automatically in a few seconds.
		</div>
	</div>
	<script>
		setTimeout(() => window.close(), 3000);
	</script>
</body>
</html>
`;

/**
 * HTML response shown to user when authentication fails
 */
const ERROR_HTML = (error: string, description?: string) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Authentication Failed</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100vh;
			margin: 0;
			background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		}
		.container {
			background: white;
			padding: 3rem;
			border-radius: 1rem;
			box-shadow: 0 10px 40px rgba(0,0,0,0.2);
			text-align: center;
			max-width: 500px;
		}
		h1 {
			color: #f5576c;
			margin-top: 0;
		}
		.error-icon {
			font-size: 4rem;
			margin-bottom: 1rem;
		}
		p {
			color: #666;
			line-height: 1.6;
		}
		.error-details {
			margin-top: 1rem;
			padding: 1rem;
			background: #fff3f3;
			border-left: 4px solid #f5576c;
			text-align: left;
			font-family: monospace;
			font-size: 0.9rem;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="error-icon">✗</div>
		<h1>Authentication Failed</h1>
		<p>There was a problem authenticating with Yahoo Fantasy Sports.</p>
		<div class="error-details">
			<strong>Error:</strong> ${error}<br>
			${description ? `<strong>Description:</strong> ${description}` : ''}
		</div>
		<p style="margin-top: 2rem;">Please close this window and try again.</p>
	</div>
</body>
</html>
`;

/**
 * Starts a temporary local HTTP server to receive OAuth callback
 *
 * This creates a local server that:
 * 1. Listens for the OAuth callback on http://localhost:{port}{path}
 * 2. Extracts the authorization code from the query parameters
 * 3. Shows a success page to the user
 * 4. Shuts down automatically
 *
 * @param options - Server options
 * @returns Promise that resolves with the authorization code
 * @throws {AuthenticationError} If callback fails or times out
 *
 * @example
 * ```typescript
 * // Start server and wait for callback
 * const promise = startLocalOAuthServer({ port: 3000, path: '/callback' });
 *
 * // Open browser to auth URL
 * // User authorizes and is redirected to http://localhost:3000/callback?code=...
 *
 * // Wait for code
 * const result = await promise;
 * console.log('Authorization code:', result.code);
 * ```
 */
export async function startLocalOAuthServer(
   options: LocalOAuthServerOptions = {},
): Promise<OAuthCallbackResult> {
   const {
      port = 3000,
      timeout = 300000, // 5 minutes
      path = '/callback',
      expectedState,
      debug = false,
   } = options;

   return new Promise((resolve, reject) => {
      let server: ReturnType<typeof Bun.serve> | null = null;
      let timeoutHandle: Timer | null = null;

      // Setup timeout
      timeoutHandle = setTimeout(() => {
         if (server) {
            server.stop();
         }
         reject(
            new AuthenticationError(
               'OAuth callback timed out. User did not complete authentication.',
            ),
         );
      }, timeout);

      // Create server
      try {
         server = Bun.serve({
            port,
            fetch(req) {
               const url = new URL(req.url);

               if (debug) {
                  console.log(
                     `[LocalOAuthServer] Request: ${url.pathname}`,
                  );
               }

               // Only handle the callback path
               if (url.pathname !== path) {
                  return new Response('Not Found', { status: 404 });
               }

               // Extract parameters
               const code = url.searchParams.get('code');
               const state = url.searchParams.get('state');
               const error = url.searchParams.get('error');
               const errorDescription =
                  url.searchParams.get('error_description');

               // Handle error callback
               if (error) {
                  if (debug) {
                     console.log(
                        `[LocalOAuthServer] Error callback: ${error} - ${errorDescription}`,
                     );
                  }

                  if (timeoutHandle) {
                     clearTimeout(timeoutHandle);
                  }
                  if (server) {
                     // Delay shutdown to allow response to be sent
                     setTimeout(() => server?.stop(), 500);
                  }

                  reject(
                     new AuthenticationError(
                        `OAuth authentication failed: ${error}`,
                        { error, error_description: errorDescription },
                     ),
                  );

                  return new Response(
                     ERROR_HTML(error, errorDescription || ''),
                     {
                        status: 400,
                        headers: { 'Content-Type': 'text/html' },
                     },
                  );
               }

               // Check for authorization code
               if (!code) {
                  if (debug) {
                     console.log(
                        '[LocalOAuthServer] No authorization code in callback',
                     );
                  }

                  const errorMsg = 'No authorization code received';
                  if (timeoutHandle) {
                     clearTimeout(timeoutHandle);
                  }
                  if (server) {
                     setTimeout(() => server?.stop(), 500);
                  }

                  reject(new AuthenticationError(errorMsg));

                  return new Response(ERROR_HTML(errorMsg), {
                     status: 400,
                     headers: { 'Content-Type': 'text/html' },
                  });
               }

               // Validate state if expected
               if (expectedState && state !== expectedState) {
                  if (debug) {
                     console.log(
                        `[LocalOAuthServer] State mismatch: expected ${expectedState}, got ${state}`,
                     );
                  }

                  const errorMsg =
                     'State parameter mismatch. Possible CSRF attack.';
                  if (timeoutHandle) {
                     clearTimeout(timeoutHandle);
                  }
                  if (server) {
                     setTimeout(() => server?.stop(), 500);
                  }

                  reject(new AuthenticationError(errorMsg));

                  return new Response(ERROR_HTML(errorMsg), {
                     status: 400,
                     headers: { 'Content-Type': 'text/html' },
                  });
               }

               // Success!
               if (debug) {
                  console.log(
                     `[LocalOAuthServer] Authorization code received`,
                  );
               }

               if (timeoutHandle) {
                  clearTimeout(timeoutHandle);
               }

               // Resolve with code and shutdown server
               resolve({ code, state: state || undefined });

               // Delay shutdown to allow response to be sent
               if (server) {
                  setTimeout(() => server?.stop(), 500);
               }

               return new Response(SUCCESS_HTML, {
                  status: 200,
                  headers: { 'Content-Type': 'text/html' },
               });
            },
         });

         if (debug) {
            console.log(
               `[LocalOAuthServer] Listening on http://localhost:${port}${path}`,
            );
         }
      } catch (error) {
         if (timeoutHandle) {
            clearTimeout(timeoutHandle);
         }
         reject(
            new AuthenticationError(
               `Failed to start local OAuth server: ${error instanceof Error ? error.message : 'Unknown error'}`,
               error,
            ),
         );
      }
   });
}

/**
 * Opens a URL in the default browser
 *
 * @param url - URL to open
 * @returns True if successful, false otherwise
 *
 * @example
 * ```typescript
 * await openBrowser('https://example.com/auth');
 * ```
 */
export async function openBrowser(url: string): Promise<boolean> {
   try {
      const process = Bun.spawn(['open', url], {
         stdout: 'ignore',
         stderr: 'ignore',
      });

      const exitCode = await process.exited;
      return exitCode === 0;
   } catch {
      // Try alternative commands for different platforms
      try {
         // Linux
         const process = Bun.spawn(['xdg-open', url], {
            stdout: 'ignore',
            stderr: 'ignore',
         });
         const exitCode = await process.exited;
         return exitCode === 0;
      } catch {
         try {
            // Windows
            const process = Bun.spawn(['start', url], {
               stdout: 'ignore',
               stderr: 'ignore',
            });
            const exitCode = await process.exited;
            return exitCode === 0;
         } catch {
            return false;
         }
      }
   }
}
