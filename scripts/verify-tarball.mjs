import { spawnSync } from 'node:child_process';

const artifact = process.argv[2];
if (!artifact) throw new Error('Tarball path is required.');

const result = spawnSync('tar', ['-tzf', artifact], { encoding: 'utf8' });
if (result.status !== 0)
   throw new Error(result.stderr || 'Unable to read tarball.');

const files = result.stdout.trim().split('\n');
const required = [
   'package/package.json',
   'package/README.md',
   'package/CHANGELOG.md',
   'package/LICENSE',
   'package/dist/index.js',
   'package/dist/index.d.ts',
];

for (const file of required) {
   if (!files.includes(file))
      throw new Error(`Tarball is missing ${file}.`);
}

const forbidden = files.filter(
   (file) =>
      file.endsWith('.tsbuildinfo') ||
      file.includes('transaction-builder') ||
      file.startsWith('package/src/') ||
      file.startsWith('package/tests/') ||
      file.startsWith('package/examples/'),
);
if (forbidden.length > 0) {
   throw new Error(
      `Tarball contains forbidden files:\n${forbidden.join('\n')}`,
   );
}

console.log(`Verified ${artifact} (${files.length} entries).`);
