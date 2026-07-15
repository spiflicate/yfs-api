import type {
   RouteDefinition,
   RouteMode,
   RouteSet,
   SportCode,
} from './static-route-definitions.js';

export const SPORT_CODES = ['nfl', 'mlb', 'nba', 'nhl'] as const;

export type PlaceholderName =
   | 'ALT_WEEK'
   | 'COUNT_SMALL'
   | 'DATE'
   | 'GAME_KEY'
   | 'LEAGUE_KEYS'
   | 'LEAGUE_KEY'
   | 'PLAYER_KEYS'
   | 'PLAYER_KEY'
   | 'PLAYER_POSITION'
   | 'PLAYER_SEARCH'
   | 'SEASON'
   | 'SPORT_CODE'
   | 'TEAM_KEYS'
   | 'TEAM_KEY'
   | 'TRANSACTION_KEYS'
   | 'TRANSACTION_KEY'
   | 'TRANSACTION_TYPE'
   | 'WEEK';

export type RouteContext = Partial<Record<PlaceholderName, string>>;

export interface SportProfile {
   code: SportCode;
   context: RouteContext;
   privateContext?: RouteContext;
   publicContext?: RouteContext;
}

export interface SelectedRoute {
   route: RouteDefinition;
   routeSet: RouteSet;
}

export interface RouteScenario {
   id: string;
   context: RouteContext;
   missingFixtures: PlaceholderName[];
   path?: string;
   route: RouteDefinition;
   routeSet: RouteSet;
   sport: SportCode;
}

const PLACEHOLDER_PATTERN = /\{\{([A-Z0-9_]+)\}\}/g;

const PLACEHOLDER_NAMES = new Set<PlaceholderName>([
   'ALT_WEEK',
   'COUNT_SMALL',
   'DATE',
   'GAME_KEY',
   'LEAGUE_KEYS',
   'LEAGUE_KEY',
   'PLAYER_KEYS',
   'PLAYER_KEY',
   'PLAYER_POSITION',
   'PLAYER_SEARCH',
   'SEASON',
   'SPORT_CODE',
   'TEAM_KEYS',
   'TEAM_KEY',
   'TRANSACTION_KEYS',
   'TRANSACTION_KEY',
   'TRANSACTION_TYPE',
   'WEEK',
]);

export function extractPlaceholders(template: string): string[] {
   return [
      ...new Set(
         [...template.matchAll(PLACEHOLDER_PATTERN)].map(
            (match) => match[1] ?? '',
         ),
      ),
   ].filter(Boolean);
}

export function requiredFixturesForSport(
   selectedRoutes: readonly SelectedRoute[],
   sport: SportCode,
): Set<PlaceholderName> {
   return new Set(
      selectedRoutes
         .filter(
            ({ route }) => !route.sports || route.sports.includes(sport),
         )
         .flatMap(({ route }) => extractPlaceholders(route.pathTemplate))
         .filter((placeholder): placeholder is PlaceholderName =>
            PLACEHOLDER_NAMES.has(placeholder as PlaceholderName),
         ),
   );
}

export function validateRouteDefinitions(
   routes: readonly RouteDefinition[],
): string[] {
   const errors: string[] = [];
   const ids = new Set<string>();

   for (const route of routes) {
      if (ids.has(route.id)) {
         errors.push(`duplicate route id: ${route.id}`);
      }
      ids.add(route.id);

      for (const placeholder of extractPlaceholders(route.pathTemplate)) {
         if (!PLACEHOLDER_NAMES.has(placeholder as PlaceholderName)) {
            errors.push(
               `${route.id} uses unknown placeholder ${placeholder}`,
            );
         }
      }
   }

   return errors;
}

export function resolveTemplate(
   template: string,
   context: RouteContext,
): { missing: PlaceholderName[]; path?: string } {
   const missing = new Set<PlaceholderName>();
   const path = template.replaceAll(
      PLACEHOLDER_PATTERN,
      (_match, rawKey: string) => {
         const key = rawKey as PlaceholderName;
         const value = context[key];
         if (!value) {
            missing.add(key);
            return `{{${key}}}`;
         }
         return value;
      },
   );

   return missing.size
      ? { missing: [...missing].sort() }
      : { missing: [], path };
}

export function buildScenarioContext(
   profile: SportProfile,
   mode: RouteMode,
): RouteContext {
   const context: RouteContext = {
      COUNT_SMALL: '5',
      SPORT_CODE: profile.code,
      ...profile.context,
      ...(mode === 'public'
         ? profile.publicContext
         : profile.privateContext),
   };
   for (const [singular, plural] of [
      ['LEAGUE_KEY', 'LEAGUE_KEYS'],
      ['PLAYER_KEY', 'PLAYER_KEYS'],
      ['TEAM_KEY', 'TEAM_KEYS'],
      ['TRANSACTION_KEY', 'TRANSACTION_KEYS'],
   ] as const) {
      if (context[singular] && !context[plural]) {
         context[plural] = context[singular];
      } else if (context[plural] && !context[singular]) {
         context[singular] = context[plural]?.split(',')[0];
      }
   }
   return context;
}

export function verifyKeyFixtures(
   route: RouteDefinition,
   facts: Record<string, string[]>,
   context: RouteContext,
): string[] {
   const notes: string[] = [];
   for (const [factKey, fixture] of Object.entries(
      route.expectations?.keyFixtures ?? {},
   )) {
      const expected = new Set(
         (context[fixture] ?? '')
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
      );
      const actual = new Set(facts[factKey] ?? []);
      const missing = [...expected].filter((value) => !actual.has(value));
      const unexpected = [...actual].filter(
         (value) => !expected.has(value),
      );
      if (!actual.size || missing.length || unexpected.length) {
         notes.push(
            `${factKey} did not match ${fixture}: missing [${missing.join(', ')}], unexpected [${unexpected.join(', ')}]`,
         );
      }
   }
   return notes;
}

export function instantiateScenarios(
   selectedRoutes: readonly SelectedRoute[],
   profiles: readonly SportProfile[],
): RouteScenario[] {
   const scenarios: RouteScenario[] = [];

   for (const selected of selectedRoutes) {
      for (const profile of profiles) {
         if (
            selected.route.sports &&
            !selected.route.sports.includes(profile.code)
         ) {
            continue;
         }

         const context = buildScenarioContext(profile, selected.route.mode);
         const resolved = resolveTemplate(
            selected.route.pathTemplate,
            context,
         );
         scenarios.push({
            id: `${profile.code}/${selected.route.id}`,
            context,
            missingFixtures: resolved.missing,
            path: resolved.path,
            route: selected.route,
            routeSet: selected.routeSet,
            sport: profile.code,
         });
      }
   }

   return scenarios;
}

export function parseSports(value: string): SportCode[] {
   const sports = value
      .split(',')
      .map((sport) => sport.trim().toLowerCase())
      .filter(Boolean);
   const invalid = sports.filter(
      (sport) => !SPORT_CODES.includes(sport as SportCode),
   );

   if (invalid.length) {
      throw new Error(
         `Unsupported sports: ${invalid.join(', ')}. Use nfl, mlb, nba, or nhl.`,
      );
   }

   if (!sports.length) {
      throw new Error('At least one sport is required');
   }

   return [...new Set(sports)] as SportCode[];
}
