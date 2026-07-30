/**
 * Probe Yahoo's observed frontend API routes without mutating account state.
 *
 * Optional environment variables:
 * - YAHOO_ACCESS_TOKEN: OAuth2 bearer token to test
 * - YAHOO_SESSION_COOKIE: manually captured browser Cookie header to test
 * - YAHOO_V3_TEAM_KEY and YAHOO_V3_ROSTER_KEY: fixture for suggested_players
 * - YAHOO_V2_LEAGUE_KEY and YAHOO_V2_TEAM_KEY: private v2 fixtures to test
 *
 * Credentials are used only in request headers and are never printed or saved.
 */

const V2_HOSTS = [
   'https://pub-api-ro.fantasysports.yahoo.com',
   'https://pub-api-rw.fantasysports.yahoo.com',
] as const;
const V3_HOST = 'https://pub-api.fantasysports.yahoo.com';
const timeoutMs = 20_000;

type ProbeAuth = 'none' | 'bearer' | 'cookie';
type ProbeStatus =
   | 'success'
   | 'api-error'
   | 'auth-required'
   | 'invalid-request-or-fixture'
   | 'network-error';

interface ProbeResult {
   auth: ProbeAuth;
   host: string;
   method: 'GET';
   route: string;
   status?: number;
   classification: ProbeStatus;
   contentType?: string;
   responseKeys?: string[];
   serviceKeys?: string[];
   errorDescription?: string;
}

interface ProbeRequest {
   auth: ProbeAuth;
   host: string;
   route: string;
   reportRoute?: string;
}

function authHeaders(auth: ProbeAuth): Record<string, string> {
   if (auth === 'bearer') {
      const token = process.env.YAHOO_ACCESS_TOKEN;
      if (!token) return {};
      return { Authorization: `Bearer ${token}` };
   }
   if (auth === 'cookie') {
      const cookie = process.env.YAHOO_SESSION_COOKIE;
      if (!cookie) return {};
      return { Cookie: cookie };
   }
   return {};
}

function classify(status: number, body: unknown): ProbeStatus {
   if (status === 401 || status === 403) return 'auth-required';
   if (status === 400) return 'invalid-request-or-fixture';
   if (body && typeof body === 'object' && 'error' in body) {
      return 'api-error';
   }
   return status >= 200 && status < 300 ? 'success' : 'api-error';
}

function bodyShape(
   body: unknown,
): Pick<ProbeResult, 'responseKeys' | 'serviceKeys' | 'errorDescription'> {
   if (!body || typeof body !== 'object') return {};
   const record = body as Record<string, unknown>;
   const service = record.service;
   const error = record.error;
   return {
      responseKeys: Object.keys(record).sort(),
      serviceKeys:
         service && typeof service === 'object'
            ? Object.keys(service).sort()
            : undefined,
      errorDescription:
         error && typeof error === 'object' && 'description' in error
            ? String(error.description)
            : undefined,
   };
}

async function probe(request: ProbeRequest): Promise<ProbeResult> {
   const url = new URL(`${request.host}${request.route}`);
   try {
      const response = await fetch(url, {
         method: 'GET',
         headers: {
            Accept: 'application/json',
            ...authHeaders(request.auth),
         },
         signal: AbortSignal.timeout(timeoutMs),
      });
      const contentType = response.headers.get('content-type') ?? undefined;
      const text = await response.text();
      let body: unknown;
      try {
         body = JSON.parse(text);
      } catch {
         body = undefined;
      }
      return {
         method: 'GET',
         host: request.host,
         route: request.reportRoute ?? request.route,
         auth: request.auth,
         status: response.status,
         classification: classify(response.status, body),
         contentType,
         ...bodyShape(body),
      };
   } catch (error) {
      return {
         method: 'GET',
         host: request.host,
         route: request.reportRoute ?? request.route,
         auth: request.auth,
         classification: 'network-error',
         errorDescription:
            error instanceof Error ? error.message : String(error),
      };
   }
}

function requests(): ProbeRequest[] {
   const authModes: ProbeAuth[] = ['none'];
   if (process.env.YAHOO_ACCESS_TOKEN) authModes.push('bearer');
   if (process.env.YAHOO_SESSION_COOKIE) authModes.push('cookie');
   const probes: ProbeRequest[] = V2_HOSTS.flatMap((host) =>
      authModes.map((auth) => ({
         auth,
         host,
         route: '/fantasy/v2/game/nhl?format=json',
      })),
   );

   const leagueKey = process.env.YAHOO_V2_LEAGUE_KEY;
   const privateTeamKey = process.env.YAHOO_V2_TEAM_KEY;
   if (leagueKey && privateTeamKey) {
      const privateRoutes = [
         [
            `/fantasy/v2/league/${leagueKey}?format=json`,
            '/fantasy/v2/league/{league_key}?format=json',
         ],
         [
            `/fantasy/v2/team/${privateTeamKey}?format=json`,
            '/fantasy/v2/team/{team_key}?format=json',
         ],
         [
            `/fantasy/v2/league/${leagueKey}/transactions;count=5?format=json`,
            '/fantasy/v2/league/{league_key}/transactions;count=5?format=json',
         ],
      ] as const;
      for (const host of V2_HOSTS) {
         for (const auth of authModes) {
            for (const [route, reportRoute] of privateRoutes) {
               probes.push({ auth, host, route, reportRoute });
            }
         }
      }
   }

   for (const auth of authModes) {
      probes.push(
         {
            auth,
            host: V3_HOST,
            route: '/fantasy/v3/getCrumb?format=json_f',
         },
         {
            auth,
            host: V3_HOST,
            route: '/fantasy/v3/user/subscriptions?format=json',
         },
      );
   }

   const teamKey = process.env.YAHOO_V3_TEAM_KEY;
   const rosterKey = process.env.YAHOO_V3_ROSTER_KEY;
   if (teamKey && rosterKey) {
      for (const auth of authModes) {
         for (const context of ['add-drop', 'sit-start']) {
            probes.push({
               auth,
               host: V3_HOST,
               route: `/fantasy/v3/suggested_players?format=json&context=${context}&roster_key=${encodeURIComponent(rosterKey)}&team_key=${encodeURIComponent(teamKey)}`,
            });
         }
      }
   }
   return probes;
}

if (import.meta.main) {
   const results = await Promise.all(requests().map(probe));
   console.log(
      JSON.stringify({ run: new Date().toISOString(), results }, null, 2),
   );
}
