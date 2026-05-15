import type {
   AllResponseTypes,
   ExpandedStageResponse,
} from './responses.js';
import type { OutValueForStage, RouteStage } from './schema.js';

export type InferResponseType<
   TStage extends RouteStage,
   TOut extends OutValueForStage<TStage> = never,
> = [ExpandedStageResponse<TStage, TOut>] extends [never]
   ? AllResponseTypes
   : ExpandedStageResponse<TStage, TOut>;
