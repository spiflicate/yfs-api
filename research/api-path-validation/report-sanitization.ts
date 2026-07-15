const SENSITIVE_FACT_KEYS = new Set([
   'leagueKey',
   'leagueName',
   'playerKey',
   'teamKey',
   'transactionKey',
]);

export function sanitizeReportFacts(
   facts: Record<string, string[]>,
): Record<string, string[]> {
   return Object.fromEntries(
      Object.entries(facts).filter(
         ([key]) => !SENSITIVE_FACT_KEYS.has(key),
      ),
   );
}

export function redactFixtureKeys(value: string): string {
   return value.replace(
      /\b(?:\d+|nfl|mlb|nba|nhl)\.(?:p\.\d+|l\.\d+(?:(?:\.tr|\.t|\.p|\.pt)\.\d+|\.w\.c\.\d+(?:_\d+)?)*)\b/g,
      '{fixture_key}',
   );
}

export function sanitizeReportNotes(
   mode: 'private' | 'public',
   failed: boolean,
   notes: readonly string[],
): string {
   if (mode === 'private' && failed) {
      return 'raw private failure omitted; see local artifact';
   }
   return redactFixtureKeys(notes.join('; ') || 'none');
}
