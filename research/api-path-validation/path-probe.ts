import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
   buildRequestUrl,
   RequestRouteError,
   requestRoute,
} from './research-http.js';
import type { RouteMode } from './static-route-definitions.js';

interface ProbeArgs {
   mode: RouteMode;
   path: string;
}

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const researchDirectory = fileURLToPath(new URL('.', import.meta.url));

function printUsage(): never {
   console.error(
      'Usage: bun run research:path-probe -- --mode public "/game/nfl"',
   );
   process.exit(1);
}

export function normalizeInputPath(inputPath: string): string {
   const trimmed = inputPath.trim();
   if (!trimmed) throw new Error('A non-empty path is required');

   if (/^https?:\/\//.test(trimmed)) {
      const url = new URL(trimmed);
      const prefix = '/fantasy/v2';
      const pathname = url.pathname.startsWith(prefix)
         ? url.pathname.slice(prefix.length)
         : url.pathname;
      if (!pathname) {
         throw new Error('The URL does not include a Yahoo API path');
      }
      return pathname.startsWith('/') ? pathname : `/${pathname}`;
   }

   return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function parseArgs(args: string[]): ProbeArgs {
   let mode: RouteMode = 'public';
   let path: string | undefined;

   for (let index = 0; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === '--mode') {
         const value = args[index + 1];
         if (value !== 'public' && value !== 'private') printUsage();
         mode = value;
         index += 1;
      } else if (arg === '--public') mode = 'public';
      else if (arg === '--private') mode = 'private';
      else if (!path && arg) path = arg;
      else printUsage();
   }

   if (!path) printUsage();
   return { mode, path: normalizeInputPath(path) };
}

function collectPreview(
   value: unknown,
   currentPath = '$',
   depth = 0,
   lines: string[] = [],
): string[] {
   if (Array.isArray(value)) {
      lines.push(`${currentPath}: array(${value.length})`);
      if (depth < 3 && value[0] !== undefined) {
         collectPreview(value[0], `${currentPath}[0]`, depth + 1, lines);
      }
      return lines;
   }
   if (value && typeof value === 'object') {
      const entries = Object.entries(value);
      lines.push(
         `${currentPath}: object(${entries.map(([key]) => key).join(',')})`,
      );
      if (depth < 3) {
         for (const [key, child] of entries.slice(0, 8)) {
            collectPreview(
               child,
               `${currentPath}.${key}`,
               depth + 1,
               lines,
            );
         }
      }
      return lines;
   }
   lines.push(`${currentPath}: ${value === null ? 'null' : typeof value}`);
   return lines;
}

function classifyFailure(note: string): string {
   const normalized = note.toLowerCase();
   if (
      normalized.includes('subresource') &&
      normalized.includes('not supported')
   ) {
      return 'unsupported-route';
   }
   if (
      normalized.includes('unauthorized') ||
      normalized.includes('access token')
   ) {
      return 'auth-or-scope';
   }
   if (normalized.includes('429') || normalized.includes('timeout')) {
      return 'rate-limited-or-transient';
   }
   if (normalized.includes('temporary problem')) {
      return 'rate-limited-or-transient';
   }
   if (
      normalized.includes('ids expected') ||
      normalized.includes('invalid')
   ) {
      return 'fixture-invalid';
   }
   return 'unknown-failure';
}

function sanitize(value: string): string {
   return value
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100);
}

async function writeDump(
   args: ProbeArgs,
   suffix: 'error' | 'response',
   payload: unknown,
): Promise<string> {
   const directory = `${researchDirectory}tmp/${runId}`;
   await mkdir(directory, { recursive: true });
   const path = `${directory}/${args.mode}-${sanitize(args.path)}-${suffix}.json`;
   await Bun.write(path, JSON.stringify(payload, null, 2));
   return path;
}

async function main(): Promise<void> {
   const args = parseArgs(process.argv.slice(2));
   try {
      const execution = await requestRoute(args.mode, args.path);
      const dump = await writeDump(args, 'response', {
         mode: args.mode,
         path: args.path,
         rawBody: execution.rawBody,
         response: execution.parsedResponse,
         url: execution.url,
      });
      console.log(`PASS ${args.mode} ${args.path}`);
      console.log(`URL: ${execution.url}`);
      console.log(`Dump: ${dump}`);
      for (const line of collectPreview(execution.parsedResponse).slice(
         0,
         20,
      )) {
         console.log(`  ${line}`);
      }
   } catch (error) {
      const note = error instanceof Error ? error.message : String(error);
      const dump = await writeDump(args, 'error', {
         error: note,
         mode: args.mode,
         path: args.path,
         rawBody:
            error instanceof RequestRouteError ? error.rawBody : undefined,
         url:
            error instanceof RequestRouteError
               ? error.url
               : buildRequestUrl(args.path),
      });
      console.error(`FAIL ${args.mode} ${args.path}`);
      console.error(`Classification: ${classifyFailure(note)}`);
      console.error(`Error: ${note}`);
      console.error(`Dump: ${dump}`);
      process.exitCode = 1;
   }
}

if (import.meta.main) await main();
