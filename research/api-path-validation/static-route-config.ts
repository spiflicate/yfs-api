import type { OAuth2Tokens } from '../../src/client/OAuth2Client.js';
import type { RouteMode } from './static-route-definitions.js';

export interface StaticRouteVerifierConfig {
   selection: {
      mode: RouteMode | 'all';
      routeIds?: string[];
   };
   auth: {
      public: {
         clientId: string;
         clientSecret: string;
      };
      private: {
         clientId: string;
         clientSecret: string;
         redirectUri: string;
         tokenFilePath: string;
         seedTokens?: OAuth2Tokens;
      };
   };
   routeContext: {
      ALT_WEEK?: string;
      COUNT_SMALL: string;
      DATE: string;
      GAME_KEY_FILTER: string;
      PRIVATE_LEAGUE_KEY?: string;
      PRIVATE_LEAGUE_KEYS?: string;
      PRIVATE_PLAYER_KEY?: string;
      PRIVATE_PLAYER_KEYS?: string;
      PRIVATE_PLAYER_POSITION: string;
      PRIVATE_PLAYER_SEARCH: string;
      PRIVATE_TEAM_KEY?: string;
      PRIVATE_TEAM_KEYS?: string;
      PRIVATE_TRANSACTION_KEY?: string;
      PRIVATE_TRANSACTION_KEYS?: string;
      PRIVATE_TRANSACTION_TYPE: string;
      PUBLIC_GAME_CODE: string;
      PUBLIC_GAME_KEY: string;
      PUBLIC_LEAGUE_KEY?: string;
      PUBLIC_PLAYER_SEARCH: string;
      SEASON: string;
      WEEK: string;
   };
   request: {
      timeoutMs: number;
   };
   output: {
      reportFilePath: string;
      responseDumpDirPath: string;
      shapePreviewLines: number;
   };
}

export const staticRouteVerifierConfig: StaticRouteVerifierConfig = {
   selection: {
      mode: 'all',
      routeIds: undefined,
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
         tokenFilePath: new URL('.oauth2-tokens.json', import.meta.url)
            .pathname,
         seedTokens: undefined,
      },
   },
   routeContext: {
      ALT_WEEK: '2',
      COUNT_SMALL: '5',
      DATE: '2025-11-24',
      GAME_KEY_FILTER: 'nhl',
      PRIVATE_LEAGUE_KEY: '465.l.30702',
      PRIVATE_LEAGUE_KEYS: '465.l.30702',
      PRIVATE_PLAYER_KEY: 'nhl.p.5431',
      PRIVATE_PLAYER_KEYS: 'nhl.p.8284,nhl.p.5431',
      PRIVATE_PLAYER_POSITION: 'C',
      PRIVATE_PLAYER_SEARCH: 'mcdavid',
      PRIVATE_TEAM_KEY: '465.l.30702.t.9',
      PRIVATE_TEAM_KEYS: '465.l.30702.t.9',
      PRIVATE_TRANSACTION_KEY: '465.l.30702.tr.1334',
      PRIVATE_TRANSACTION_KEYS: '465.l.30702.tr.1326,465.l.30702.tr.1334',
      PRIVATE_TRANSACTION_TYPE: 'waiver',
      PUBLIC_GAME_CODE: 'nhl',
      PUBLIC_GAME_KEY: '465',
      PUBLIC_LEAGUE_KEY: '465.l.121384',
      PUBLIC_PLAYER_SEARCH: 'mcdavid',
      SEASON: '2025',
      WEEK: '1',
   },
   request: {
      timeoutMs: 30000,
   },
   output: {
      reportFilePath: 'research/api-path-validation/actionable-route-report.md',
      responseDumpDirPath: 'research/api-path-validation/tmp',
      shapePreviewLines: 14,
   },
};
