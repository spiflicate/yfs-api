import type { OAuth2Tokens } from '../../src/auth/oauth2.js';
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
   routeContext: Record<
      'public' | 'private',
      Partial<{
         ALT_WEEK: string;
         COUNT_SMALL: string;
         DATE: string;
         GAME_CODE: string;
         GAME_KEYS: string;
         GAME_KEY: string;
         LEAGUE_KEYS: string;
         LEAGUE_KEY: string;
         PLAYER_KEYS: string;
         PLAYER_KEY: string;
         PLAYER_POSITION: string;
         PLAYER_SEARCH: string;
         SEASON: string;
         TEAM_KEYS: string;
         TEAM_KEY: string;
         TRANSACTION_KEYS: string;
         TRANSACTION_KEY: string;
         TRANSACTION_TYPE: string;
         WEEK: string;
      }>
   >;
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
      public: {
         GAME_CODE: 'nhl',
         GAME_KEY: '465',
         LEAGUE_KEY: '465.l.121384',
         PLAYER_KEY: 'nhl.p.5431',
         SEASON: '2025',
         TEAM_KEY: '465.l.121384.t.14',
         WEEK: '1',
      },
      private: {
         ALT_WEEK: '2',
         COUNT_SMALL: '5',
         DATE: '2025-10-26',
         GAME_CODE: 'nhl',
         GAME_KEYS: '465',
         GAME_KEY: '465',
         LEAGUE_KEYS: '465.l.30702',
         LEAGUE_KEY: '465.l.30702',
         PLAYER_KEYS: 'nhl.p.8284,nhl.p.5431',
         PLAYER_KEY: 'nhl.p.5431',
         PLAYER_POSITION: 'C',
         PLAYER_SEARCH: 'mcdavid',
         SEASON: '2025',
         TEAM_KEYS: '465.l.30702.t.9',
         TEAM_KEY: '465.l.30702.t.9',
         TRANSACTION_KEYS: '465.l.30702.tr.1326,465.l.30702.tr.1334',
         TRANSACTION_KEY: '465.l.30702.tr.1334',
         TRANSACTION_TYPE: 'waiver',
         WEEK: '1',
      },
   },
   request: {
      timeoutMs: 30000,
   },
   output: {
      reportFilePath:
         'research/api-path-validation/actionable-route-report.md',
      responseDumpDirPath: 'research/api-path-validation/tmp',
      shapePreviewLines: 14,
   },
};
