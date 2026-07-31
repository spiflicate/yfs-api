import { fileURLToPath } from 'node:url';
import type { OAuth2Tokens } from '../../src/auth/oauth2.js';
import type { SportProfile } from './route-model.js';
import type { RouteMode, SportCode } from './static-route-definitions.js';

const researchDirectory = fileURLToPath(new URL('.', import.meta.url));

export interface StaticRouteVerifierConfig {
   auth: {
      private: {
         clientId: string;
         clientSecret: string;
         redirectUri: string;
         seedTokens?: OAuth2Tokens;
         tokenFilePath: string;
      };
      public: {
         clientId: string;
         clientSecret: string;
      };
   };
   output: {
      latestReportFilePath: string;
      responseDumpDirPath: string;
      shapePreviewLines: number;
   };
   profiles: SportProfile[];
   request: {
      delayMs: number;
      timeoutMs: number;
   };
   selection: {
      mode: RouteMode | 'all';
      routeIds?: string[];
      sports: SportCode[];
   };
}

const profileDefaults: Record<SportCode, Pick<SportProfile, 'context'>> = {
   nfl: {
      context: {
         ALT_WEEK: '2',
         PLAYER_POSITION: 'QB',
         PLAYER_SEARCH: 'mahomes',
         WEEK: '1',
      },
   },
   mlb: {
      context: {
         ALT_WEEK: '2',
         PLAYER_POSITION: 'OF',
         PLAYER_SEARCH: 'judge',
         WEEK: '1',
      },
   },
   nba: {
      context: {
         ALT_WEEK: '2',
         PLAYER_POSITION: 'PG',
         PLAYER_SEARCH: 'james',
         WEEK: '1',
      },
   },
   nhl: {
      context: {
         ALT_WEEK: '2',
         PLAYER_POSITION: 'C',
         PLAYER_SEARCH: 'mcdavid',
         WEEK: '1',
      },
   },
};

function loadProfileOverrides(): Partial<Record<SportCode, SportProfile>> {
   const raw = process.env.YAHOO_ROUTE_PROFILES_JSON;
   if (!raw) {
      return {};
   }

   const parsed = JSON.parse(raw) as Partial<
      Record<SportCode, SportProfile>
   >;
   return parsed;
}

const overrides = loadProfileOverrides();

const profiles: SportProfile[] = (
   ['nfl', 'mlb', 'nba', 'nhl'] as const
).map((code) => ({
   code,
   context: {
      ...profileDefaults[code].context,
      ...overrides[code]?.context,
   },
   privateContext: overrides[code]?.privateContext,
   publicContext: overrides[code]?.publicContext,
}));

const nhlProfile = profiles.find((profile) => profile.code === 'nhl');
if (nhlProfile && !nhlProfile.publicContext?.LEAGUE_KEY) {
   nhlProfile.publicContext = {
      ...nhlProfile.publicContext,
      LEAGUE_KEY: '465.l.121384',
   };
}

export const staticRouteVerifierConfig: StaticRouteVerifierConfig = {
   selection: {
      mode: 'all',
      routeIds: undefined,
      sports: ['nfl', 'mlb', 'nba', 'nhl'],
   },
   auth: {
      public: {
         clientId: process.env.YAHOO_CLIENT_ID || '',
         clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
      },
      private: {
         clientId: process.env.YAHOO_CLIENT_ID || '',
         clientSecret: process.env.YAHOO_CLIENT_SECRET || '',
         redirectUri: 'oob',
         tokenFilePath: fileURLToPath(
            new URL('.oauth2-tokens.json', import.meta.url),
         ),
         seedTokens: undefined,
      },
   },
   profiles,
   request: {
      delayMs: 100,
      timeoutMs: 30000,
   },
   output: {
      latestReportFilePath: `${researchDirectory}actionable-route-report.md`,
      responseDumpDirPath: `${researchDirectory}tmp`,
      shapePreviewLines: 14,
   },
};
