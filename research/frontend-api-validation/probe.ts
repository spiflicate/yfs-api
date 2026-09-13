import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FRONTEND_API_ORIGINS } from '../../src/client/frontend.js';
import {
   FRONTEND_PROBE_MATRIX,
   type FrontendProbeDefinition,
   localPolicy,
   missingRequirements,
   type ProbeAuth,
   type ProbeHost,
} from './route-matrix.js';

type ProbeClassification =
   | 'success'
   | 'auth-required'
   | 'client-error'
   | 'server-error'
   | 'network-error'
   | 'fixture-missing';

interface ProbeResult {
   id: string;
   category: FrontendProbeDefinition['category'];
   description: string;
   auth: ProbeAuth;
   host: ProbeHost;
   path: string;
   localPolicy: 'allowed' | 'rejected';
   classification: ProbeClassification;
   status?: number;
   contentType?: string;
   topLevelKeys?: string[];
   error?: string;
}

const outputDirectory = fileURLToPath(new URL('./tmp/', import.meta.url));

function parseArgs(args: string[]): { dryRun: boolean; ids?: Set<string> } {
   let dryRun = false;
   let ids: Set<string> | undefined;
   for (let index = 0; index < args.length; index += 1) {
      const arg = args[index];
      if (arg === '--dry-run') dryRun = true;
      else if (arg === '--ids') {
         const value = args[index + 1];
         if (!value)
            throw new Error('--ids requires a comma-separated value');
         ids = new Set(value.split(',').map((id) => id.trim()));
         index += 1;
      } else {
         throw new Error(`Unknown argument: ${arg}`);
      }
   }
   return { dryRun, ids };
}

function authModes(): ProbeAuth[] {
   return process.env.YAHOO_SESSION_COOKIE
      ? ['public', 'cookie']
      : ['public'];
}

function origin(host: ProbeHost): string {
   return FRONTEND_API_ORIGINS[host];
}

function classify(status: number): ProbeClassification {
   if (status === 401 || status === 403) return 'auth-required';
   if (status >= 200 && status < 300) return 'success';
   if (status >= 400 && status < 500) return 'client-error';
   return 'server-error';
}

function topLevelKeys(
   body: string,
   contentType: string,
): string[] | undefined {
   try {
      if (!contentType.includes('json')) return undefined;
      const parsed: unknown = JSON.parse(body);
      return parsed && typeof parsed === 'object'
         ? Object.keys(parsed)
         : [];
   } catch {
      return undefined;
   }
}

async function probe(
   definition: FrontendProbeDefinition,
   auth: ProbeAuth,
): Promise<ProbeResult> {
   const base: ProbeResult = {
      id: definition.id,
      category: definition.category,
      description: definition.description,
      auth,
      host: definition.host,
      path: definition.path,
      localPolicy: localPolicy(definition.path),
      classification: 'network-error',
   };
   const missing = missingRequirements(definition);
   if (missing.length > 0) {
      return {
         ...base,
         classification: 'fixture-missing',
         error: missing.join(', '),
      };
   }

   try {
      const headers: Record<string, string> = {
         Accept:
            definition.host === 'neutral'
               ? 'application/json'
               : 'application/xml',
      };
      if (auth === 'cookie')
         headers.Cookie = process.env.YAHOO_SESSION_COOKIE ?? '';
      const response = await fetch(
         new URL(definition.path, origin(definition.host)),
         {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(20_000),
         },
      );
      const contentType = response.headers.get('content-type') ?? '';
      const body = await response.text();
      return {
         ...base,
         classification: classify(response.status),
         status: response.status,
         contentType,
         topLevelKeys: topLevelKeys(body, contentType),
      };
   } catch (error) {
      return {
         ...base,
         error: error instanceof Error ? error.message : String(error),
      };
   }
}

async function main(): Promise<void> {
   const { dryRun, ids } = parseArgs(process.argv.slice(2));
   const definitions = FRONTEND_PROBE_MATRIX.filter(
      (definition) => !ids || ids.has(definition.id),
   );
   const results = dryRun
      ? definitions.flatMap((definition) =>
           authModes().map((auth) => ({
              id: definition.id,
              category: definition.category,
              description: definition.description,
              auth,
              host: definition.host,
              path: definition.path,
              localPolicy: localPolicy(definition.path),
              classification: missingRequirements(definition).length
                 ? 'fixture-missing'
                 : 'network-error',
           })),
        )
      : await Promise.all(
           definitions.flatMap((definition) =>
              authModes().map((auth) => probe(definition, auth)),
           ),
        );
   const runId = new Date().toISOString().replace(/[:.]/g, '-');
   const outputPath = `${outputDirectory}${runId}.json`;
   if (!dryRun) {
      await mkdir(outputDirectory, { recursive: true });
      await Bun.write(
         outputPath,
         JSON.stringify({ run: runId, results }, null, 2),
      );
   }
   console.log(
      JSON.stringify(
         {
            run: runId,
            dryRun,
            outputPath: dryRun ? undefined : outputPath,
            results,
         },
         null,
         2,
      ),
   );
}

if (import.meta.main) await main();
