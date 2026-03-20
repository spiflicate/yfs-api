/**
 * Composable Request Builder
 *
 * A type-safe, chainable request builder for the Yahoo Fantasy API.
 *
 * @module
 */

import { XMLBuilder } from 'fast-xml-parser';
import type { HttpClient, RequestOptions } from '../client/HttpClient.js';
import type {
   CollectionName,
   GameKeyLike,
   LeagueKeyLike,
   PendingTradeKeyLike,
   PlayerKeyLike,
   ResourceName,
   SubResourceName,
   TeamKeyLike,
   TransactionKeyLike,
   WaiverClaimKeyLike,
} from '../types/request/graph.js';
import type {
   PlayerStatusParam,
   SortParam,
} from '../types/request/params.js';
import type { InferResponseType } from '../types/request/response-routes.js';
import type { AllResponseTypes } from '../types/request/responses.js';
import type {
   FilterKeyForStage,
   NavigationMethodNamesForStage,
   NextStage,
   OutValueForStage,
   ParamHelperMethodsForStage,
   RouteStage,
   RuntimeWriteMethod,
   StagesWithNext,
   WriteMethodNamesForStage,
} from '../types/request/schema.js';
import { routeStageRuntime } from '../types/request/schema.js';
import type { RosterChangeRequest } from '../types/resources/team.js';
import { formatDate } from '../utils/formatters.js';
import { validateDate } from '../utils/validators.js';
import type { TransactionBuilder } from './transaction.js';

/**
 * Path segment type used internally to build request paths.
 * There are two possible types of segments:
 *    - `/{resource}/{resource_key}[;out={sub_resource}[,{multi_sub_resource},...]][;{key}={value}]`
 *    - `/{collection};{resource}_keys={key}[,{key2},...][;out={sub_resource}[,{multi_sub_resource},...]][;{key}={value}]`
 */
export type PathSegment = (
   | {
        type: 'resource';
        key: string;
     }
   | {
        type: 'collection';
        keys?: string | string[];
     }
) & {
   name: string;
   out?: SubResourceName[];
   filters?: Record<string, string | string[] | number>;
};

interface RequestState {
   stage: RouteStage;
   segments: PathSegment[];
   method: 'GET' | 'POST' | 'PUT' | 'DELETE';
   body?: Record<string, unknown> | string;
   options?: WriteRequestOptions;
   dispatchPath?: string;
   hasExecutedWriteRequest: boolean;
}

type ParamValue = string | string[] | number;

type TerminalMethodNames =
   | 'buildPath'
   | 'execute'
   | 'post'
   | 'put'
   | 'delete'
   | 'toString'
   | '__pathType'
   | '__outType';
type BaseFilterMethodNames = 'filters';
type SharedMethodNames = TerminalMethodNames | BaseFilterMethodNames;
type WriteRequestOptions = Omit<RequestOptions, 'method' | 'body'>;
type DateParamInput = string | Date;

type SplitCommaSeparated<TValue extends string> =
   TValue extends `${infer THead},${infer TTail}`
      ? THead | SplitCommaSeparated<TTail>
      : TValue;

type SelectedOutFromValue<TValue> = TValue extends readonly (infer TItem)[]
   ? Extract<TItem, string>
   : TValue extends string
     ? SplitCommaSeparated<TValue>
     : never;

type MergeSelectedOut<
   TStage extends RouteStage,
   TCurrentOut extends string,
   TValue,
> = Extract<
   TCurrentOut | SelectedOutFromValue<TValue>,
   OutValueForStage<TStage>
>;

type StageMethodNames<TStage extends RouteStage> =
   | SharedMethodNames
   | NavigationMethodNamesForStage<TStage>
   | ParamHelperMethodsForStage<TStage>
   | WriteMethodNamesForStage<TStage>;

type StageView<
   TStage extends RouteStage,
   TSelectedOut extends OutValueForStage<TStage> = never,
> = Pick<
   RequestBuilder<TStage, TSelectedOut>,
   Extract<
      StageMethodNames<TStage>,
      keyof RequestBuilder<TStage, TSelectedOut>
   >
>;

/**
 * Composable Request Builder
 */
export class RequestBuilder<
   TStage extends RouteStage = 'root',
   TSelectedOut extends OutValueForStage<TStage> = never,
> {
   readonly __pathType!: TStage;
   readonly __outType!: TSelectedOut;
   protected state: RequestState;
   protected httpClient: HttpClient;

   constructor(httpClient: HttpClient) {
      this.httpClient = httpClient;
      this.state = {
         stage: 'root',
         segments: [],
         method: 'GET',
         hasExecutedWriteRequest: false,
      };
   }

   private getCurrentStageConfig() {
      return routeStageRuntime[this.state.stage];
   }

   private getNextRuntimeStage(methodName: string): RouteStage {
      const nextStage = this.getCurrentStageConfig().next?.[methodName];

      if (!nextStage) {
         throw new Error(
            `${methodName} is not valid for the current request stage ${this.state.stage}.`,
         );
      }

      return nextStage;
   }

   private stageAllowsWriteMethod(methodName: RuntimeWriteMethod): boolean {
      return (
         this.getCurrentStageConfig().writeMethods?.includes(methodName) ??
         false
      );
   }

   private assertWriteMethodAllowed(
      methodName: RuntimeWriteMethod,
      message: string,
   ): void {
      if (!this.stageAllowsWriteMethod(methodName)) {
         throw new Error(message);
      }
   }

   private stageSerializesObjectBodyAsYahooXml(): boolean {
      return (
         this.getCurrentStageConfig().serializeObjectBodyAsYahooXml ?? false
      );
   }

   private assertOutValuesAllowed(
      values: SubResourceName | SubResourceName[],
   ): void {
      const allowedValues = this.getCurrentStageConfig().outValues;

      if (!allowedValues) {
         throw new Error(
            `out is not valid for the current request stage ${this.state.stage}.`,
         );
      }

      const normalizedValues = Array.isArray(values) ? values : [values];
      const invalidValue = normalizedValues.find(
         (value) => !allowedValues.includes(value),
      );

      if (invalidValue) {
         throw new Error(
            `out=${invalidValue} is not valid for the current request stage ${this.state.stage}.`,
         );
      }
   }

   private addSegment(
      type: 'resource' | 'collection',
      name: ResourceName | CollectionName,
      key?: string,
   ): void {
      if (type === 'resource') {
         if (!key) {
            throw new Error(`Resource segment ${name} requires a key.`);
         }

         this.state.segments.push({ type, name, key, filters: {} });
         return;
      }

      this.state.segments.push({ type, name, filters: {} });
   }

   private getCurrentSegment(): PathSegment | undefined {
      return this.state.segments[this.state.segments.length - 1];
   }

   private setOutValue(value: SubResourceName | SubResourceName[]): this {
      this.assertOutValuesAllowed(value);
      const segment = this.getCurrentSegment();
      if (segment) {
         segment.out = Array.isArray(value) ? value : [value];
      }
      return this;
   }

   private normalizeOutParam(value: ParamValue): SubResourceName[] {
      if (Array.isArray(value)) {
         return value.map((entry) => entry as SubResourceName);
      }

      return String(value)
         .split(',')
         .map((entry) => entry.trim())
         .filter(Boolean) as SubResourceName[];
   }

   private setFilter(key: string, value: ParamValue): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         if (key === 'out') {
            segment.out = this.normalizeOutParam(value);
         } else {
            segment.filters ??= {};
            segment.filters[key] = value;
         }
      }
      return this;
   }

   private setFilters(filters: Record<string, ParamValue>): this {
      const segment = this.getCurrentSegment();
      if (segment) {
         if ('out' in filters) {
            throw new Error('out must be set with out(), not filters().');
         }

         segment.filters ??= {};
         Object.assign(segment.filters, filters);
      }
      return this;
   }

   private normalizeDateParam(date: DateParamInput): string {
      const normalized = date instanceof Date ? formatDate(date) : date;
      validateDate(normalized);
      return normalized;
   }

   private serializeToYahooXml(data: Record<string, unknown>): string {
      const xmlBuilder = new XMLBuilder({
         ignoreAttributes: false,
         format: false,
      });

      const wrappedBody =
         'fantasy_content' in data ? data : { fantasy_content: data };

      return `<?xml version="1.0" encoding="UTF-8"?>${xmlBuilder.build(wrappedBody)}`;
   }

   private normalizeWriteBody(
      data?: Record<string, unknown> | string,
   ): Record<string, unknown> | string | undefined {
      if (
         data &&
         typeof data === 'object' &&
         !Array.isArray(data) &&
         this.stageSerializesObjectBodyAsYahooXml()
      ) {
         return this.serializeToYahooXml(data);
      }

      return data;
   }

   private assertTransactionsCollectionPath(methodName: string): void {
      if (this.state.stage !== 'league.transactions') {
         throw new Error(
            `${methodName} can only be used on a league transactions collection request.`,
         );
      }
   }

   private isTransactionResourcePath(): boolean {
      return this.state.stage === 'transaction';
   }

   private assertTransactionWritePath(methodName: string): void {
      this.assertWriteMethodAllowed(
         methodName as Extract<RuntimeWriteMethod, 'edit' | 'cancel'>,
         `${methodName} can only be used on a transaction resource or league transactions collection request.`,
      );
   }

   private assertTeamRosterPath(methodName: string): void {
      this.assertWriteMethodAllowed(
         'updateLineup',
         `${methodName} can only be used on a team roster request.`,
      );
   }

   private buildRosterChangePayload(
      payload: RosterChangeRequest,
   ): Record<string, unknown> {
      const roster: Record<string, unknown> = {
         coverage_type: payload.coverageType,
         players: {
            player: payload.players.map((player) => ({
               player_key: player.playerKey,
               position: player.position,
            })),
         },
      };

      if (payload.coverageType === 'week') {
         if (payload.week === undefined) {
            throw new Error(
               'updateLineup requires week when coverageType is week.',
            );
         }

         roster.week = payload.week;
      }

      if (payload.coverageType === 'date') {
         if (!payload.date) {
            throw new Error(
               'updateLineup requires date when coverageType is date.',
            );
         }

         roster.date = this.normalizeDateParam(payload.date);
      }

      return { roster };
   }

   private setPendingWriteRequest(
      method: 'POST' | 'PUT' | 'DELETE',
      body?: Record<string, unknown> | string,
      options?: WriteRequestOptions,
      dispatchPath?: string,
   ): this {
      this.state.method = method;
      this.state.body = body;
      this.state.options = options;
      this.state.dispatchPath = dispatchPath;
      this.state.hasExecutedWriteRequest = false;
      return this;
   }

   private clearPendingWriteRequest(): void {
      this.state.method = 'GET';
      this.state.body = undefined;
      this.state.options = undefined;
      this.state.dispatchPath = undefined;
      this.state.hasExecutedWriteRequest = true;
   }

   private asStage<TNextStage extends RouteStage>(
      nextStage: TNextStage,
   ): StageView<TNextStage> {
      this.state.stage = nextStage;
      return this as unknown as StageView<TNextStage>;
   }

   // ===== Resource Entry Points =====

   game(key: GameKeyLike): StageView<'game'> {
      this.addSegment('resource', 'game', key);
      return this.asStage('game');
   }

   league(key: LeagueKeyLike): StageView<'league'> {
      this.addSegment('resource', 'league', key);
      return this.asStage('league');
   }

   team(key: TeamKeyLike): StageView<'team'> {
      this.addSegment('resource', 'team', key);
      return this.asStage('team');
   }

   player(key: PlayerKeyLike): StageView<'player'> {
      this.addSegment('resource', 'player', key);
      return this.asStage('player');
   }

   transaction(
      key: TransactionKeyLike | WaiverClaimKeyLike | PendingTradeKeyLike,
   ): StageView<'transaction'> {
      this.addSegment('resource', 'transaction', key);
      return this.asStage('transaction');
   }

   users(): StageView<'users'> {
      this.addSegment('collection', 'users');
      return this.asStage('users');
   }

   // ===== Sub-Resources =====

   settings(): TStage extends StagesWithNext<'settings'>
      ? StageView<NextStage<TStage, 'settings'>>
      : never {
      const nextStage = this.getNextRuntimeStage('settings') as NextStage<
         TStage,
         'settings'
      >;
      this.setOutValue('settings');
      return this.asStage<NextStage<TStage, 'settings'>>(
         nextStage,
      ) as never;
   }

   standings(): TStage extends StagesWithNext<'standings'>
      ? StageView<NextStage<TStage, 'standings'>>
      : never {
      const nextStage = this.getNextRuntimeStage('standings') as NextStage<
         TStage,
         'standings'
      >;
      this.setOutValue('standings');
      return this.asStage<NextStage<TStage, 'standings'>>(
         nextStage,
      ) as never;
   }

   scoreboard(): TStage extends StagesWithNext<'scoreboard'>
      ? StageView<NextStage<TStage, 'scoreboard'>>
      : never {
      const nextStage = this.getNextRuntimeStage('scoreboard') as NextStage<
         TStage,
         'scoreboard'
      >;
      this.setOutValue('scoreboard');
      return this.asStage<NextStage<TStage, 'scoreboard'>>(
         nextStage,
      ) as never;
   }

   roster(params?: {
      week?: string | number;
      date?: DateParamInput;
   }): TStage extends StagesWithNext<'roster'>
      ? StageView<NextStage<TStage, 'roster'>>
      : never {
      const nextStage = this.getNextRuntimeStage('roster') as NextStage<
         TStage,
         'roster'
      >;
      this.setOutValue('roster');
      if (params?.week) this.setFilter('week', String(params.week));
      if (params?.date) {
         this.setFilter('date', this.normalizeDateParam(params.date));
      }
      return this.asStage<NextStage<TStage, 'roster'>>(nextStage) as never;
   }

   matchups(params?: {
      weeks?: string;
   }): TStage extends StagesWithNext<'matchups'>
      ? StageView<NextStage<TStage, 'matchups'>>
      : never {
      const nextStage = this.getNextRuntimeStage('matchups') as NextStage<
         TStage,
         'matchups'
      >;
      this.setOutValue('matchups');
      if (params?.weeks) this.setFilter('weeks', params.weeks);
      return this.asStage<NextStage<TStage, 'matchups'>>(
         nextStage,
      ) as never;
   }

   stats(params?: {
      type?: string;
      week?: string | number;
      date?: DateParamInput;
   }): TStage extends StagesWithNext<'stats'>
      ? StageView<NextStage<TStage, 'stats'>>
      : never {
      const nextStage = this.getNextRuntimeStage('stats') as NextStage<
         TStage,
         'stats'
      >;
      this.setOutValue('stats');
      if (params?.type) this.setFilter('type', params.type);
      if (params?.week) this.setFilter('week', String(params.week));
      if (params?.date) {
         this.setFilter('date', this.normalizeDateParam(params.date));
      }
      return this.asStage<NextStage<TStage, 'stats'>>(nextStage) as never;
   }

   ownership(): TStage extends StagesWithNext<'ownership'>
      ? StageView<NextStage<TStage, 'ownership'>>
      : never {
      const nextStage = this.getNextRuntimeStage('ownership') as NextStage<
         TStage,
         'ownership'
      >;
      this.setOutValue('ownership');
      return this.asStage<NextStage<TStage, 'ownership'>>(
         nextStage,
      ) as never;
   }

   percentOwned(): TStage extends StagesWithNext<'percentOwned'>
      ? StageView<NextStage<TStage, 'percentOwned'>>
      : never {
      const nextStage = this.getNextRuntimeStage(
         'percentOwned',
      ) as NextStage<TStage, 'percentOwned'>;
      this.setOutValue('percent_owned');
      return this.asStage<NextStage<TStage, 'percentOwned'>>(
         nextStage,
      ) as never;
   }

   draftAnalysis(): TStage extends StagesWithNext<'draftAnalysis'>
      ? StageView<NextStage<TStage, 'draftAnalysis'>>
      : never {
      const nextStage = this.getNextRuntimeStage(
         'draftAnalysis',
      ) as NextStage<TStage, 'draftAnalysis'>;
      this.setOutValue('draft_analysis');
      return this.asStage<NextStage<TStage, 'draftAnalysis'>>(
         nextStage,
      ) as never;
   }

   statCategories(): TStage extends StagesWithNext<'statCategories'>
      ? StageView<NextStage<TStage, 'statCategories'>>
      : never {
      const nextStage = this.getNextRuntimeStage(
         'statCategories',
      ) as NextStage<TStage, 'statCategories'>;
      this.setOutValue('stat_categories');
      return this.asStage<NextStage<TStage, 'statCategories'>>(
         nextStage,
      ) as never;
   }

   positionTypes(): TStage extends StagesWithNext<'positionTypes'>
      ? StageView<NextStage<TStage, 'positionTypes'>>
      : never {
      const nextStage = this.getNextRuntimeStage(
         'positionTypes',
      ) as NextStage<TStage, 'positionTypes'>;
      this.setOutValue('position_types');
      return this.asStage<NextStage<TStage, 'positionTypes'>>(
         nextStage,
      ) as never;
   }

   gameWeeks(): TStage extends StagesWithNext<'gameWeeks'>
      ? StageView<NextStage<TStage, 'gameWeeks'>>
      : never {
      const nextStage = this.getNextRuntimeStage('gameWeeks') as NextStage<
         TStage,
         'gameWeeks'
      >;
      this.setOutValue('game_weeks');
      return this.asStage<NextStage<TStage, 'gameWeeks'>>(
         nextStage,
      ) as never;
   }

   // ===== Collections =====

   leagues(): TStage extends StagesWithNext<'leagues'>
      ? StageView<NextStage<TStage, 'leagues'>>
      : never {
      const nextStage = this.getNextRuntimeStage('leagues') as NextStage<
         TStage,
         'leagues'
      >;
      this.addSegment('collection', 'leagues');
      return this.asStage<NextStage<TStage, 'leagues'>>(nextStage) as never;
   }

   teams(): TStage extends StagesWithNext<'teams'>
      ? StageView<NextStage<TStage, 'teams'>>
      : never {
      const nextStage = this.getNextRuntimeStage('teams') as NextStage<
         TStage,
         'teams'
      >;
      this.addSegment('collection', 'teams');
      return this.asStage<NextStage<TStage, 'teams'>>(nextStage) as never;
   }

   players(): TStage extends StagesWithNext<'players'>
      ? StageView<NextStage<TStage, 'players'>>
      : never {
      const nextStage = this.getNextRuntimeStage('players') as NextStage<
         TStage,
         'players'
      >;
      this.addSegment('collection', 'players');
      return this.asStage<NextStage<TStage, 'players'>>(nextStage) as never;
   }

   transactions(): TStage extends StagesWithNext<'transactions'>
      ? StageView<NextStage<TStage, 'transactions'>>
      : never {
      const nextStage = this.getNextRuntimeStage(
         'transactions',
      ) as NextStage<TStage, 'transactions'>;
      this.addSegment('collection', 'transactions');
      return this.asStage<NextStage<TStage, 'transactions'>>(
         nextStage,
      ) as never;
   }

   create(
      transaction: TransactionBuilder,
      options?: WriteRequestOptions,
   ): this {
      this.assertTransactionsCollectionPath('create');
      return this.setPendingWriteRequest(
         'POST',
         transaction.toPayload(),
         options,
      );
   }

   /**
    * Stages a PUT request to edit a transaction.
    *
    * When called on a transaction resource (via `.transaction(key)`):
    * `@example`
    * request.transaction('248.l.55438.pt.11').edit({ transaction: { action: 'accept' } })
    *
    * When called on a transactions collection (via `.league(key).transactions()`):
    * `@example`
    * request.league('248.l.55438').transactions().edit('248.l.55438.w.c.2_6093', { transaction: { ... } })
    */
   edit(
      transactionKey:
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike,
      payload: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): this;
   edit(
      transactionKey:
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike,
      payload: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): this;
   edit(
      payload: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): this;
   edit(
      transactionKeyOrPayload:
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike
         | Record<string, unknown>
         | string,
      payloadOrOptions?:
         | Record<string, unknown>
         | string
         | WriteRequestOptions,
      options?: WriteRequestOptions,
   ): this {
      this.assertTransactionWritePath('edit');

      if (this.isTransactionResourcePath()) {
         return this.setPendingWriteRequest(
            'PUT',
            transactionKeyOrPayload as Record<string, unknown> | string,
            payloadOrOptions as WriteRequestOptions | undefined,
         );
      }

      const transactionKey = transactionKeyOrPayload as
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike;
      const payload = payloadOrOptions as Record<string, unknown> | string;

      if (!payload) {
         throw new Error(
            'edit requires a payload when used on a league transactions collection request.',
         );
      }

      return this.setPendingWriteRequest(
         'PUT',
         payload,
         options,
         `/transaction/${transactionKey}`,
      );
   }

   cancel(
      transactionKey:
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike,
      options?: WriteRequestOptions,
   ): this;
   cancel(options?: WriteRequestOptions): this;
   cancel(
      transactionKeyOrOptions?:
         | TransactionKeyLike
         | WaiverClaimKeyLike
         | PendingTradeKeyLike
         | WriteRequestOptions,
      options?: WriteRequestOptions,
   ): this {
      this.assertTransactionWritePath('cancel');

      if (this.isTransactionResourcePath()) {
         return this.setPendingWriteRequest(
            'DELETE',
            undefined,
            transactionKeyOrOptions as WriteRequestOptions | undefined,
         );
      }

      if (
         !transactionKeyOrOptions ||
         typeof transactionKeyOrOptions !== 'string'
      ) {
         throw new Error(
            'cancel requires a transaction key when used on a league transactions collection request.',
         );
      }

      return this.setPendingWriteRequest(
         'DELETE',
         undefined,
         options,
         `/transaction/${transactionKeyOrOptions}`,
      );
   }

   updateLineup(
      payload: RosterChangeRequest,
      options?: WriteRequestOptions,
   ): this {
      this.assertTeamRosterPath('updateLineup');
      return this.setPendingWriteRequest(
         'PUT',
         this.buildRosterChangePayload(payload),
         options,
      );
   }

   drafts(): TStage extends StagesWithNext<'drafts'>
      ? StageView<NextStage<TStage, 'drafts'>>
      : never {
      const nextStage = this.getNextRuntimeStage('drafts') as NextStage<
         TStage,
         'drafts'
      >;
      this.setOutValue('drafts');
      return this.asStage<NextStage<TStage, 'drafts'>>(nextStage) as never;
   }

   games(): TStage extends StagesWithNext<'games'>
      ? StageView<NextStage<TStage, 'games'>>
      : never {
      const nextStage = this.getNextRuntimeStage('games') as NextStage<
         TStage,
         'games'
      >;
      this.addSegment('collection', 'games');
      return this.asStage<NextStage<TStage, 'games'>>(nextStage) as never;
   }

   // ===== Parameters =====

   filters<
      TFilters extends Partial<
         Record<FilterKeyForStage<TStage>, ParamValue>
      >,
   >(filters: TFilters): this {
      this.setFilters(filters as Record<string, ParamValue>);
      return this;
   }

   out<
      TValue extends
         | OutValueForStage<TStage>
         | readonly OutValueForStage<TStage>[],
   >(
      subResources: TValue,
   ): StageView<TStage, MergeSelectedOut<TStage, TSelectedOut, TValue>> {
      this.setFilter('out', subResources as ParamValue);
      return this as never;
   }

   position(pos: string): this {
      return this.setFilter('position', pos);
   }
   status(status: PlayerStatusParam | string): this {
      return this.setFilter('status', status);
   }
   type(value: string): this {
      return this.setFilter('type', value);
   }
   types(values: string | string[]): this {
      return this.setFilter('types', values);
   }
   teamKey(key: TeamKeyLike): this {
      return this.setFilter('team_key', key);
   }
   sort(sort: SortParam | string): this {
      return this.setFilter('sort', sort);
   }
   count(n: number): this {
      return this.setFilter('count', String(n));
   }
   start(n: number): this {
      return this.setFilter('start', String(n));
   }
   search(q: string): this {
      return this.setFilter('search', q);
   }
   week(w: number | string): this {
      return this.setFilter('week', String(w));
   }
   date(d: DateParamInput): this {
      return this.setFilter('date', this.normalizeDateParam(d));
   }
   gameKeys(keys: string | string[]): this {
      return this.setFilter('game_keys', keys);
   }
   isAvailable(value: boolean | 0 | 1 | '0' | '1' = true): this {
      const normalized =
         typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
      return this.setFilter('is_available', normalized);
   }
   gameTypes(types: string | string[]): this {
      return this.setFilter('game_types', types);
   }
   gameCodes(codes: string | string[]): this {
      return this.setFilter('game_codes', codes);
   }
   seasons(values: number | string | Array<number | string>): this {
      if (Array.isArray(values)) {
         return this.setFilter(
            'seasons',
            values.map((value) => String(value)),
         );
      }

      return this.setFilter('seasons', String(values));
   }
   leagueKeys(keys: string | string[]): this {
      return this.setFilter('league_keys', keys);
   }
   teamKeys(keys: string | string[]): this {
      return this.setFilter('team_keys', keys);
   }
   playerKeys(keys: string | string[]): this {
      return this.setFilter('player_keys', keys);
   }
   useLogin(): this {
      return this.setFilter('use_login', '1');
   }

   // ===== Execute =====

   buildPath(): string {
      if (this.state.segments.length === 0) {
         throw new Error(
            'Cannot build empty request. Add at least one resource.',
         );
      }

      const parts: string[] = [];

      for (const seg of this.state.segments) {
         let part = seg.name;

         if (seg.type === 'resource') {
            part += `/${seg.key}`;
         }

         const qualifiers: string[] = [];

         if (seg.type === 'collection' && seg.keys) {
            qualifiers.push(
               `${seg.name.slice(0, -1)}_keys=${this.formatValue(seg.keys)}`,
            );
         }

         const collectionKeyFilterName =
            seg.type === 'collection'
               ? `${seg.name.slice(0, -1)}_keys`
               : null;

         if (
            collectionKeyFilterName &&
            seg.filters?.[collectionKeyFilterName] !== undefined
         ) {
            qualifiers.push(
               `${collectionKeyFilterName}=${this.formatValue(
                  seg.filters[collectionKeyFilterName],
               )}`,
            );
         }

         if (seg.out && seg.out.length > 0) {
            qualifiers.push(`out=${this.formatValue(seg.out)}`);
         }

         const filterPairs = Object.entries(seg.filters ?? {})
            .filter(
               ([key, value]) =>
                  value !== undefined && key !== collectionKeyFilterName,
            )
            .map(([key, value]) => `${key}=${this.formatValue(value)}`);

         qualifiers.push(...filterPairs);

         if (qualifiers.length > 0) {
            part += `;${qualifiers.join(';')}`;
         }

         parts.push(part);
      }

      return `/${parts.join('/')}`;
   }

   async execute<
      T = InferResponseType<TStage, TSelectedOut> extends never
         ? AllResponseTypes
         : InferResponseType<TStage, TSelectedOut>,
   >(): Promise<T> {
      if (
         this.state.method === 'GET' &&
         this.state.hasExecutedWriteRequest
      ) {
         throw new Error(
            'Cannot call execute() again after a staged write request has already been sent. Stage a new write request with create(), edit(), or cancel() before re-executing.',
         );
      }

      if (this.state.method === 'POST') {
         const response = await this.post<T>(
            this.state.body,
            this.state.options,
         );
         this.clearPendingWriteRequest();
         return response;
      }

      if (this.state.method === 'PUT') {
         const response = await this.put<T>(
            this.state.body,
            this.state.options,
         );
         this.clearPendingWriteRequest();
         return response;
      }

      if (this.state.method === 'DELETE') {
         const response = await this.delete<T>(this.state.options);
         this.clearPendingWriteRequest();
         return response;
      }

      const path = this.buildPath();
      return this.httpClient.get<T>(path);
   }

   async post<
      T = InferResponseType<TStage, TSelectedOut> extends never
         ? AllResponseTypes
         : InferResponseType<TStage, TSelectedOut>,
   >(
      data?: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): Promise<T> {
      const path = this.state.dispatchPath ?? this.buildPath();
      const normalizedBody = this.normalizeWriteBody(data);
      return this.httpClient.post<T>(path, normalizedBody, options);
   }

   async put<
      T = InferResponseType<TStage, TSelectedOut> extends never
         ? AllResponseTypes
         : InferResponseType<TStage, TSelectedOut>,
   >(
      data?: Record<string, unknown> | string,
      options?: WriteRequestOptions,
   ): Promise<T> {
      const path = this.state.dispatchPath ?? this.buildPath();
      const normalizedBody = this.normalizeWriteBody(data);
      return this.httpClient.put<T>(path, normalizedBody, options);
   }

   async delete<
      T = InferResponseType<TStage, TSelectedOut> extends never
         ? AllResponseTypes
         : InferResponseType<TStage, TSelectedOut>,
   >(options?: WriteRequestOptions): Promise<T> {
      const path = this.state.dispatchPath ?? this.buildPath();
      return this.httpClient.delete<T>(path, options);
   }

   toString(): string {
      try {
         return this.buildPath();
      } catch {
         return '<incomplete request>';
      }
   }

   protected formatValue(value: string | string[] | number): string {
      if (Array.isArray(value)) {
         return value.join(',');
      }
      return String(value);
   }
}

export type RootRequestBuilder = StageView<'root'>;

export function createRequest(httpClient: HttpClient): RootRequestBuilder {
   return new RequestBuilder(httpClient) as RootRequestBuilder;
}
