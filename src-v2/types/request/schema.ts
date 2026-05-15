import { gameStages } from './schema-runtime/game-stages.js';
import { leagueStages } from './schema-runtime/league-stages.js';
import { playerStages } from './schema-runtime/player-stages.js';
import { rootStages } from './schema-runtime/root-stages.js';
import type {
   GameOutValue,
   LeagueOutValue,
   PlayerCollectionParamKey,
   PlayerOutValue,
   RuntimeStageDefinition,
   RuntimeWriteMethod,
   StageSpec,
   TeamOutValue,
   TransactionOutValue,
   UsersGamesOutValue,
} from './schema-runtime/shared.js';
import { teamStages } from './schema-runtime/team-stages.js';
import { transactionStages } from './schema-runtime/transaction-stages.js';
import { userStages } from './schema-runtime/user-stages.js';

export type {
   GameOutValue,
   LeagueOutValue,
   PlayerCollectionParamKey,
   PlayerOutValue,
   RuntimeStageDefinition,
   RuntimeWriteMethod,
   TeamOutValue,
   TransactionOutValue,
   UsersGamesOutValue,
};

export const routeStageRuntime = {
   ...rootStages,
   ...gameStages,
   ...leagueStages,
   ...teamStages,
   ...playerStages,
   ...userStages,
   ...transactionStages,
} as const satisfies Record<string, StageSpec>;

export type RouteStage = keyof typeof routeStageRuntime;

interface ParamHelperMethodKeyMap {
   out: 'out';
   position: 'position';
   status: 'status';
   type: 'type';
   types: 'types';
   teamKey: 'team_key';
   transactionKeys: 'transaction_keys';
   sort: 'sort';
   sortType: 'sort_type';
   sortSeason: 'sort_season';
   sortWeek: 'sort_week';
   sortDate: 'sort_date';
   count: 'count';
   start: 'start';
   search: 'search';
   week: 'week';
   weeks: 'weeks';
   date: 'date';
   gameKeys: 'game_keys';
   isAvailable: 'is_available';
   gameTypes: 'game_types';
   gameCodes: 'game_codes';
   seasons: 'seasons';
   leagueKeys: 'league_keys';
   teamKeys: 'team_keys';
   playerKeys: 'player_keys';
   useLogin: 'use_login';
}

export type ParamHelperMethodName = keyof ParamHelperMethodKeyMap;

type StageConfig<TStage extends RouteStage> =
   (typeof routeStageRuntime)[TStage];

export type ParamKeyForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      params: readonly (infer TParam)[];
   }
      ? Extract<TParam, string>
      : never;

export type FilterKeyForStage<TStage extends RouteStage> = Exclude<
   ParamKeyForStage<TStage>,
   'out'
>;

export type OutValueForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      outValues: readonly (infer TOut)[];
   }
      ? Extract<TOut, string>
      : never;

export type NavigationMethodNamesForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      next: Readonly<Record<string, string>>;
   }
      ? keyof StageConfig<TStage>['next'] & string
      : never;

export type WriteMethodNamesForStage<TStage extends RouteStage> =
   StageConfig<TStage> extends {
      writeMethods: readonly (infer TMethod)[];
   }
      ? Extract<TMethod, string>
      : never;

export type NextStage<TStage extends RouteStage, TMethod extends string> =
   StageConfig<TStage> extends {
      next: Readonly<Record<string, string>>;
   }
      ? TMethod extends keyof StageConfig<TStage>['next']
         ? Extract<StageConfig<TStage>['next'][TMethod], RouteStage>
         : never
      : never;

export type StagesWithNext<TMethod extends string> = {
   [TStage in RouteStage]: TMethod extends NavigationMethodNamesForStage<TStage>
      ? TStage
      : never;
}[RouteStage];

export type ParamHelperMethodsForStage<TStage extends RouteStage> = {
   [TMethod in keyof ParamHelperMethodKeyMap]: ParamHelperMethodKeyMap[TMethod] extends ParamKeyForStage<TStage>
      ? TMethod
      : never;
}[keyof ParamHelperMethodKeyMap];

export type StageResponse<TStage extends RouteStage> =
   TStage extends RouteStage ? unknown : never;
