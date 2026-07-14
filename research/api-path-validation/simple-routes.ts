/**
 *
 */
export function gen(
   template: TemplateStringsArray,
   ...args: unknown[]
): string[] {
   const result: string[] = [''];
   for (let i = 0; i < template.length; i++) {
      for (const [index, value] of result.entries()) {
         result[index] = value + template[i];
      }
      if (i < args.length) {
         const arg = args[i];
         if (Array.isArray(arg)) {
            const combinations = [];
            for (const value of arg) {
               for (const prefix of result) {
                  combinations.push(
                     prefix +
                        (Array.isArray(value) ? value.join(',') : value),
                  );
               }
            }
            result.splice(0, result.length, ...combinations);
         } else {
            result.forEach((_, index) => {
               result[index] += String(arg);
            });
         }
      }
   }
   return result;
}
/**
 * Generates all unique combinations of the provided values in an array.
 * @param arrays An array of values to be enumerated to all unique combinations.
 * @returns An array of all combinations of the input values, where each combination is an array of values.
 */
export function comb<T>(arrays: T[]): T[][] {
   const result: Array<{ indices: number[]; values: T[] }> = [];

   const build = (start: number, indices: number[], values: T[]) => {
      if (values.length > 0) {
         result.push({ indices: [...indices], values: [...values] });
      }

      for (let index = start; index < arrays.length; index++) {
         indices.push(index);
         const value = arrays[index];
         if (value === undefined) {
            continue;
         }
         values.push(value);
         build(index + 1, indices, values);
         values.pop();
         indices.pop();
      }
   };

   build(0, [], []);

   return result.map((entry) => entry.values);
}

export type TestData = {
   GAME_CODE: string;
   GAME_KEY: number;
   GAME_KEYS: number[];
   COUNT: number;
   DATE: string;
   LEAGUE_ID: number;
   LEAGUE_KEY: string;
   LEAGUE_IDS: number[];
   LEAGUE_KEYS: string[];
   PLAYER_ID: number;
   PLAYER_KEY: string;
   PLAYER_IDS: number[];
   PLAYER_KEYS: string[];
   PLAYER_POSITION: string;
   PLAYER_SEARCH: string;
   SEASON: string;
   TEAM_ID: number;
   TEAM_KEY: string;
   TEAM_IDS: number[];
   TEAM_KEYS: string[];
   TRANSACTION_ID: number;
   TRANSACTION_KEY: string;
   TRANSACTION_IDS: number[];
   TRANSACTION_KEYS: string[];
   TRANSACTION_TYPE: string;
   WEEK: string;
};

const testData: TestData = {
   GAME_CODE: 'nhl',
   GAME_KEY: 465,
   GAME_KEYS: [465],
   COUNT: 5,
   DATE: '2025-10-26',
   LEAGUE_ID: 121384,
   LEAGUE_KEY: '465.l.121384',
   LEAGUE_IDS: [121384],
   LEAGUE_KEYS: ['465.l.121384'],
   PLAYER_ID: 5431,
   PLAYER_KEY: 'nhl.p.5431',
   PLAYER_IDS: [5431],
   PLAYER_KEYS: ['nhl.p.5431'],
   PLAYER_POSITION: 'C',
   PLAYER_SEARCH: 'mcdavid',
   SEASON: '2025',
   TEAM_ID: 14,
   TEAM_KEY: '465.l.121384.t.14',
   TEAM_IDS: [14],
   TEAM_KEYS: ['465.l.121384.t.14'],
   TRANSACTION_ID: 1334,
   TRANSACTION_KEY: '465.l.121384.tr.1334',
   TRANSACTION_IDS: [1334],
   TRANSACTION_KEYS: ['465.l.121384.tr.1334'],
   TRANSACTION_TYPE: 'waiver',
   WEEK: '1',
};

const dedupe = <T>(array: T[]): T[] => {
   return Array.from(new Set(array));
};

export const routes = (d: TestData) => [
   '/games;is_available=1',
   '/games;is_available=1/metadata',
   '/users;use_login=1',
   '/users;use_login=1/games',
   '/users;use_login=1/teams',
   gen`/game/${[d.GAME_CODE, d.GAME_KEY]}${[
      gen`;out=${comb(['players', 'game_weeks'])}`,
      gen`/${['players', 'game_weeks']}`,
      gen`/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
      gen`/leagues;league_keys=${comb(d.LEAGUE_KEYS)}${[
         gen`/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
         gen`/settings`,
         gen`/teams`,
         gen`/transactions;count=${d.COUNT}`,
         gen`/teams;team_keys=${comb(d.TEAM_KEYS)}`,
         '',
      ].flat()}`,
      '',
   ].flat()}`,
   gen`/games${[gen`;game_codes=${d.GAME_CODE}`, gen`;game_keys=${d.GAME_KEYS}`].flat()}${[
      gen`;seasons=${d.SEASON}${[
         gen`/leagues;league_keys=${d.LEAGUE_KEYS}${['/teams', '']}`,
         '',
      ].flat()}`,
      '',
   ].flat()}`,
   gen`/games;game_keys=${d.GAME_KEYS}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}${[
      gen`;out=${['settings', 'standings', 'scoreboard']}`,
      gen`/${['settings', 'standings', 'scoreboard']}`,
      gen`/players;player_keys=${d.PLAYER_KEYS}${['/ownership', '/percent_owned', '/stats', '', `/search=${d.PLAYER_SEARCH};count=${d.COUNT}`].flat()}`,
      `/scoreboard;week=${d.WEEK}`,
      `/teams;team_keys=${d.TEAM_KEYS}`,
      `/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}/players`,
      '',
   ]}`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/ownership`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/percent_owned`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/stats`,
   gen`/league/${d.LEAGUE_KEY}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/players;status=FA;position=${d.PLAYER_POSITION};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/scoreboard;week=${d.WEEK}`,
   gen`/league/${d.LEAGUE_KEY}/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}/players`,
   gen`/league/${d.LEAGUE_KEY}/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}`,
   gen`/league/${d.LEAGUE_KEY}/teams`,
   gen`/league/${d.LEAGUE_KEY}/transactions;count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;type=${d.TRANSACTION_TYPE};team_key=${d.TEAM_KEY};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;types=add,trade;count=${d.COUNT}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS};out=settings,standings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/scoreboard;week=${d.WEEK}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/settings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/standings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams/roster;week=${d.WEEK}/players`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams/roster;week=${d.WEEK}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/transactions;count=${d.COUNT}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}`,
   gen`/player/${d.PLAYER_KEY};out=stats,ownership`,
   gen`/player/${d.PLAYER_KEY}/ownership`,
   gen`/player/${d.PLAYER_KEY}/percent_owned`,
   gen`/player/${d.PLAYER_KEY}/stats;type=season`,
   gen`/player/${d.PLAYER_KEY}`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/ownership`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/percent_owned`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/stats`,
   gen`/players;player_keys=${d.PLAYER_KEYS}`,
   gen`/team/${d.TEAM_KEY};out=roster,stats,matchups`,
   gen`/team/${d.TEAM_KEY};out=standings,stats;type=date;date=${d.DATE}`,
   gen`/team/${d.TEAM_KEY}/matchups;weeks=${d.WEEK},${d.WEEK + 1}`,
   gen`/team/${d.TEAM_KEY}/roster;date=${d.DATE}/players`,
   gen`/team/${d.TEAM_KEY}/roster;week=${d.WEEK}/players`,
   gen`/team/${d.TEAM_KEY}/roster`,
   gen`/team/${d.TEAM_KEY}/stats;type=season`,
   gen`/team/${d.TEAM_KEY}`,
   gen`/teams;team_keys=${d.TEAM_KEYS};out=roster,stats`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/matchups;weeks=${d.WEEK},${d.WEEK + 1}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;date=${d.DATE}/players`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}/players`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/stats;type=date;date=${d.DATE}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/stats;type=season`,
   gen`/teams;team_keys=${d.TEAM_KEYS}`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS};out=leagues,teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/settings`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/teams/roster`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}`,
];
const originalRoutes = (d: TestData) => [
   '/games;is_available=1',
   '/games;is_available=1/metadata',
   '/users;use_login=1',
   '/users;use_login=1/games',
   '/users;use_login=1/teams',
   gen`/game/${d.GAME_CODE};out=${comb(['players', 'game_weeks'])}`,
   gen`/game/${d.GAME_CODE}/${['players', 'game_weeks']}`,
   gen`/game/${d.GAME_CODE}/leagues;league_keys=${d.LEAGUE_KEYS}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/game/${d.GAME_CODE}/leagues;league_keys=${d.LEAGUE_KEYS}/teams`,
   gen`/game/${d.GAME_CODE}/leagues;league_keys=${d.LEAGUE_KEYS}/transactions;count=${d.COUNT}`,
   gen`/game/${d.GAME_CODE}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/game/${d.GAME_KEY}/leagues;league_keys=${d.LEAGUE_KEYS}`,
   gen`/game/${d.GAME_KEY}`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON}/leagues;league_keys=${d.LEAGUE_KEYS}/teams`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON}/leagues;league_keys=${d.LEAGUE_KEYS}`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON}`,
   gen`/games;game_keys=${d.GAME_KEYS}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY};out=settings,standings,scoreboard`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/ownership`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/percent_owned`,
   gen`/league/${d.LEAGUE_KEY}/players;player_keys=${d.PLAYER_KEYS}/stats`,
   gen`/league/${d.LEAGUE_KEY}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/players;status=FA;position=${d.PLAYER_POSITION};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/scoreboard;week=${d.WEEK}`,
   gen`/league/${d.LEAGUE_KEY}/settings`,
   gen`/league/${d.LEAGUE_KEY}/standings`,
   gen`/league/${d.LEAGUE_KEY}/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}/players`,
   gen`/league/${d.LEAGUE_KEY}/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}`,
   gen`/league/${d.LEAGUE_KEY}/teams`,
   gen`/league/${d.LEAGUE_KEY}/transactions;count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;type=${d.TRANSACTION_TYPE};team_key=${d.TEAM_KEY};count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;types=add,trade;count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS};out=settings,standings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/scoreboard;week=${d.WEEK}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/settings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/standings`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams/roster;week=${d.WEEK}/players`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams/roster;week=${d.WEEK}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/teams`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}/transactions;count=${d.COUNT}`,
   gen`/leagues;league_keys=${d.LEAGUE_KEYS}`,
   gen`/player/${d.PLAYER_KEY};out=stats,ownership`,
   gen`/player/${d.PLAYER_KEY}/ownership`,
   gen`/player/${d.PLAYER_KEY}/percent_owned`,
   gen`/player/${d.PLAYER_KEY}/stats;type=season`,
   gen`/player/${d.PLAYER_KEY}`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/ownership`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/percent_owned`,
   gen`/players;player_keys=${d.PLAYER_KEYS}/stats`,
   gen`/players;player_keys=${d.PLAYER_KEYS}`,
   gen`/team/${d.TEAM_KEY};out=roster,stats,matchups`,
   gen`/team/${d.TEAM_KEY};out=standings,stats;type=date;date=${d.DATE}`,
   gen`/team/${d.TEAM_KEY}/matchups;weeks=${d.WEEK},${d.WEEK + 1}`,
   gen`/team/${d.TEAM_KEY}/roster;date=${d.DATE}/players`,
   gen`/team/${d.TEAM_KEY}/roster;week=${d.WEEK}/players`,
   gen`/team/${d.TEAM_KEY}/roster`,
   gen`/team/${d.TEAM_KEY}/stats;type=season`,
   gen`/team/${d.TEAM_KEY}`,
   gen`/teams;team_keys=${d.TEAM_KEYS};out=roster,stats`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/matchups;weeks=${d.WEEK},${d.WEEK + 1}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;date=${d.DATE}/players`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}/players`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/roster;week=${d.WEEK}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/stats;type=date;date=${d.DATE}`,
   gen`/teams;team_keys=${d.TEAM_KEYS}/stats;type=season`,
   gen`/teams;team_keys=${d.TEAM_KEYS}`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS};out=leagues,teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/settings`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues/teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/leagues`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/teams/roster`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}/teams`,
   gen`/users;use_login=1/games;game_keys=${d.GAME_KEYS}`,
];

function contains(set: string[], superset: string[]): boolean {
   const setSorted = set.toSorted();
   const supersetSorted = superset.toSorted();
   let i = 0;
   let j = 0;
   while (i < setSorted.length && j < supersetSorted.length) {
      const a = setSorted[i];
      const b = supersetSorted[j];
      if (a === undefined || b === undefined) {
         break;
      }
      if (a === b) {
         i++;
         j++;
      } else if (a > b) {
         j++;
      } else {
         return false;
      }
   }
   return i === setSorted.length;
}

console.log(
   'Arrays match? ',
   contains(originalRoutes(testData).flat(), routes(testData).flat()),
);
console.log(
   'Duplicated lines: ',
   routes(testData)
      .flat()
      .filter((route, index, self) => {
         return self.indexOf(route) !== index;
      }),
);

Bun.write(
   new URL('simple-routes.json', import.meta.url),
   JSON.stringify(routes(testData).flat().sort(), null, 2),
);
Bun.write(
   new URL('simple-routes-orig.json', import.meta.url),
   JSON.stringify(originalRoutes(testData).flat().sort(), null, 2),
);

const invalid = (d: TestData) => [
   gen`/game/${d.GAME_CODE}/leagues`,
   gen`/game/${d.GAME_CODE}/leagues/teams`,
   gen`/game/${d.GAME_CODE}/leagues/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/game/${d.GAME_CODE}/leagues/transactions;count=${d.COUNT}`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON}/leagues`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON};out=leagues,players`,
   gen`/games;game_keys=${d.GAME_KEYS};out=leagues`,
   gen`/games;game_keys=${d.GAME_KEYS};out=leagues,players`,
   gen`/games;game_codes=${d.GAME_CODE};seasons=${d.SEASON}/leagues/teams`,
   gen`/games;game_codes=${d.GAME_CODE}/leagues/players;search=${d.PLAYER_SEARCH};count=${d.COUNT}`,
   gen`/games;game_codes=${d.GAME_CODE}/leagues/transactions;count=${d.COUNT}`,
   '/users;use_login=1/leagues',
   '/users;use_login=1;out=leagues',
   gen`/league/${d.LEAGUE_KEY}/players;status=FA;position=${d.PLAYER_POSITION};sort=PTS;sort_type=season;sort_season=${d.SEASON};start=0;count=${d.COUNT}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;transaction_keys=${d.TRANSACTION_KEYS}`,
   gen`/league/${d.LEAGUE_KEY}/transactions;transaction_keys=${d.TRANSACTION_KEYS};out=players`,
   gen`/league/${d.LEAGUE_KEY}/transactions;transaction_keys=${d.TRANSACTION_KEYS}/players`,
   gen`/transaction/${d.TRANSACTION_KEY}`,
   gen`/transaction/${d.TRANSACTION_KEY}/players`,
];
