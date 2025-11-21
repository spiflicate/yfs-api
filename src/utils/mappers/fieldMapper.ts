/**
 * Field mapping utilities for transforming API responses
 *
 * Provides declarative field mapping with automatic type inference,
 * recursive depth support for nested objects, and built-in transforms.
 *
 * @module
 */

/**
 * Configuration for a single field mapping
 *
 * @template T - The TypeScript type of the transformed value
 */
export interface FieldConfig<T = unknown> {
   /**
    * The API field name (usually snake_case)
    */
   apiName: string;

   /**
    * Whether this field is required in the API response
    * If false (default), field is optional in result
    */
   required?: boolean;

   /**
    * Function to transform the raw API value
    * If not provided, value is used as-is (with type assertion)
    */
   transform?: (value: unknown) => T;

   /**
    * Nested mapping configuration
    * If provided, the API value is treated as an object and recursively mapped
    * This allows handling nested objects at any depth
    */
   nested?: MappingConfig;

   /**
    * Default value if field is missing and not required
    * Only used if field is not present in API response
    */
   defaultValue?: T;
}

/**
 * Complete mapping configuration for an object
 * Maps TypeScript field names to their API configuration
 */
export type MappingConfig = Record<string, FieldConfig>;

/**
 * Type inference utility that derives TypeScript types from mapping config
 *
 * For each field in the mapping:
 * - If transform exists, uses return type of transform function
 * - If nested exists, recursively infers nested object type
 * - If required is true, field is required; otherwise optional
 * - Defaults to unknown if neither transform nor nested provided
 *
 * @template T - The mapping configuration object
 */
export type InferFromMapping<T extends MappingConfig> = {
   [K in keyof T]-?: T[K] extends FieldConfig<infer U>
      ? T[K] extends { required: true }
         ? U
         : U | undefined
      : T[K] extends { nested: infer N }
        ? N extends MappingConfig
           ? T[K] extends { required: true }
              ? InferFromMapping<N>
              : InferFromMapping<N> | undefined
           : unknown
        : T[K] extends { required: true }
          ? unknown
          : unknown | undefined;
};

/**
 * Recursively maps API response data to typed objects using mapping configuration
 *
 * Handles:
 * - Field name transformation (snake_case → camelCase)
 * - Type transforms (string → number via getInteger, etc.)
 * - Nested object mapping at any depth
 * - Required vs optional fields
 * - Default values for missing optional fields
 * - Single-element arrays (extracts the element before mapping)
 *
 * @template T - The mapping configuration type
 * @param data - Raw API response data
 * @param mapping - Field mapping configuration
 * @returns Transformed and typed object
 * @throws Error if required field is missing
 *
 * @example
 * ```typescript
 * const mapping = {
 *   gameKey: { apiName: 'game_key', required: true },
 *   season: { apiName: 'season', transform: getInteger, required: true },
 *   isAvailable: { apiName: 'is_available', transform: getBoolean },
 * };
 *
 * const game = mapApiResponse(apiResponse, mapping);
 * // Result: { gameKey: string, season: number, isAvailable?: boolean }
 * ```
 */
export function mapApiResponse<T extends MappingConfig>(
   data: unknown,
   mapping: T,
): InferFromMapping<T> {
   // Extract single element from array if needed
   let obj = data as Record<string, unknown>;
   if (Array.isArray(data) && data.length === 1) {
      obj = data[0] as Record<string, unknown>;
   }

   const result: Record<string, unknown> = {};

   for (const [tsField, fieldConfig] of Object.entries(mapping)) {
      const apiValue = obj[fieldConfig.apiName];

      // Handle missing values
      if (apiValue === undefined || apiValue === null) {
         if (fieldConfig.required) {
            throw new Error(
               `Missing required field: ${fieldConfig.apiName}`,
            );
         }

         // Use default value if provided, otherwise skip field
         if (fieldConfig.defaultValue !== undefined) {
            result[tsField] = fieldConfig.defaultValue;
         }
         continue;
      }

      // Handle nested object mapping
      if (fieldConfig.nested) {
         result[tsField] = mapApiResponse(apiValue, fieldConfig.nested);
      }
      // Handle transformed values
      else if (fieldConfig.transform) {
         result[tsField] = fieldConfig.transform(apiValue);
      }
      // Handle direct passthrough
      else {
         result[tsField] = apiValue;
      }
   }

   return result as InferFromMapping<T>;
}
