/**
 * Field mapping and transformation utilities
 *
 * Provides declarative API response mapping with automatic type inference
 * and recursive support for nested objects.
 *
 * @module
 */

export {
   type FieldConfig,
   type InferFromMapping,
   type MappingConfig,
   mapApiResponse,
} from './fieldMapper.js';
export {
   conditional,
   toBoolean,
   toInteger,
   toNumber,
   toStr,
} from './transforms.js';
