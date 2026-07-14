import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.argv[2] ?? 'dist';
const files = [];

async function collect(directory) {
   for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (['.js', '.ts'].includes(extname(path))) files.push(path);
   }
}

await collect(root);
const invalid = [];
const specifierPattern = /(?:from\s+|import\s*)['"](\.{1,2}\/[^'"]+)['"]/g;

for (const file of files) {
   const source = await readFile(file, 'utf8');
   for (const match of source.matchAll(specifierPattern)) {
      if (!match[1]?.endsWith('.js')) invalid.push(`${file}: ${match[1]}`);
   }
}

if (invalid.length > 0) {
   throw new Error(
      `Extensionless relative imports found:\n${invalid.join('\n')}`,
   );
}

console.log(
   `Scanned ${files.length} emitted JavaScript/declaration files.`,
);
