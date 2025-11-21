import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Extracts all properties starting with 'is' or 'has' from nested objects and arrays
 *
 * @param data - The data object to traverse
 * @returns Array of objects with shape { prop: string, values: (string|number)[] }
 *
 * @example
 * ```typescript
 * const result = extractBooleanProps(data);
 * // [
 * //   { prop: 'isActive', values: [true, false, true] },
 * //   { prop: 'hasPermission', values: [true, false] }
 * // ]
 * ```
 */
function extractBooleanProps(
   data: unknown,
): Array<{ prop: string; values: (string | number | boolean)[] }> {
   const propMap = new Map<string, Set<string | number | boolean>>();

   function traverse(obj: unknown): void {
      if (obj === null || typeof obj !== 'object') {
         return;
      }

      if (Array.isArray(obj)) {
         obj.forEach((item) => traverse(item));
         return;
      }

      const record = obj as Record<string, unknown>;

      for (const [key, value] of Object.entries(record)) {
         // Check if key starts with 'is' or 'has'
         if (
            key.startsWith('is') ||
            key.startsWith('has') ||
            key.startsWith('uses')
         ) {
            if (!propMap.has(key)) {
               propMap.set(key, new Set());
            }
            // Add the value to the set (prevents duplicates)
            if (value !== null && value !== undefined) {
               propMap.get(key)!.add(String(value));
            }
         }

         // Recursively traverse nested values
         traverse(value);
      }
   }

   traverse(data);

   // Convert map to array of objects
   return Array.from(propMap.entries()).map(([prop, values]) => ({
      prop,
      values: Array.from(values) as (string | number | boolean)[],
   }));
}

/**
 * Extracts all properties with values of 0 or 1 from nested objects and arrays
 *
 * @param data - The data object to traverse
 * @returns Array of property names that have values of 0 or 1
 *
 * @example
 * ```typescript
 * const result = extractBinaryProps(data);
 * // ['status', 'active', 'flag']
 * ```
 */
function extractBinaryProps(data: unknown): string[] {
   const binaryProps = new Set<string>();

   function traverse(obj: unknown): void {
      if (obj === null || typeof obj !== 'object') {
         return;
      }

      if (Array.isArray(obj)) {
         obj.forEach((item) => traverse(item));
         return;
      }

      const record = obj as Record<string, unknown>;

      for (const [key, value] of Object.entries(record)) {
         if (value === 0 || value === 1) {
            binaryProps.add(key);
         }

         traverse(value);
      }
   }

   traverse(data);
   return Array.from(binaryProps).sort();
}

async function main() {
   // read directory of json files from path and process each file
   const inputJson = [];
   const dirPath = fileURLToPath(
      new URL('../tests/fixtures/json', import.meta.url),
   );
   console.log(`Reading JSON files from: ${dirPath}`);
   const files = await readdir(dirPath);
   for (const file of files) {
      if (path.extname(file) === '.json') {
         const content = await readFile(path.join(dirPath, file), 'utf-8');
         inputJson.push(content);
      }
   }

   const data = inputJson
      .map((content) => JSON.parse(content))
      .reduce((acc, curr) => {
         if (Array.isArray(curr)) {
            return acc.concat(curr);
         }
         acc.push(curr);
         return acc;
      }, [] as unknown[]);

   const result = extractBooleanProps(data);
   result.sort((a, b) => a.prop.localeCompare(b.prop));
   for (const item of result) {
      console.log(
         `Property: ${item.prop}`,
         `Values: ${item.values.join(', ')}`,
      );
   }
   const binaryPropsResult = extractBinaryProps(data);
   for (const prop of binaryPropsResult) {
      if (result.map((r) => r.prop).includes(prop)) {
         continue;
      }
      console.log(`Binary Property: ${prop}`);
   }
}

main().catch((error) => {
   console.error('Error executing script:', error);
   process.exit(1);
});
