import { spawnSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const artifact = resolve(process.argv[2] ?? '');
if (!process.argv[2]) throw new Error('Tarball path is required.');

const directory = resolve('.package-consumer');
await rm(directory, { recursive: true, force: true });
await mkdir(directory, { recursive: true });
await cp('tests/package/runtime.mjs', `${directory}/runtime.mjs`);
await cp('tests/package/consumer.ts', `${directory}/consumer.ts`);
await writeFile(
   `${directory}/package.json`,
   JSON.stringify(
      {
         private: true,
         type: 'module',
         dependencies: { 'yfs-api': `file:${artifact}` },
      },
      null,
      2,
   ),
);
await writeFile(
   `${directory}/tsconfig.json`,
   JSON.stringify(
      {
         compilerOptions: {
            strict: true,
            noEmit: true,
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            skipLibCheck: false,
         },
         include: ['consumer.ts'],
      },
      null,
      2,
   ),
);

function run(command, args) {
   const result = spawnSync(command, args, {
      cwd: directory,
      stdio: 'inherit',
   });
   if (result.status !== 0)
      throw new Error(`${command} ${args.join(' ')} failed.`);
}

run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund']);
run('node', ['runtime.mjs']);
run(resolve('node_modules/.bin/tsc'), ['-p', 'tsconfig.json']);
