import { basename } from 'node:path';

const baseCommit = '65b8f14';
const fixtureRoot = 'tests/fixtures/data';
const write = process.argv.includes('--write');
const privateTeamKeyFields = new Set([
   'teamKey',
   'sourceTeamKey',
   'destinationTeamKey',
   'winnerTeamKey',
   'ownerTeamKey',
]);

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

const files = [...new Bun.Glob(`${fixtureRoot}/*.json`).scanSync()].sort();
const originals = new Map<string, Json>();
const originalTexts = new Map<string, string>();

for (const file of files) {
   if (write) {
      const baselineProcess = Bun.spawnSync(['git', 'show', `${baseCommit}:${file}`], {
         stdout: 'pipe',
         stderr: 'pipe',
      });
      if (baselineProcess.exitCode !== 0) {
         throw new Error(`Baseline fixture unavailable: ${basename(file)}`);
      }
      const originalText = baselineProcess.stdout.toString();
      originalTexts.set(file, originalText);
      originals.set(file, JSON.parse(originalText) as Json);
   } else {
      originals.set(file, JSON.parse(await Bun.file(file).text()) as Json);
   }
}

const credentialFields = new Set<string>();
const collectCredentialFields = (value: Json): void => {
   if (Array.isArray(value)) {
      for (const item of value) collectCredentialFields(item);
      return;
   }
   if (!value || typeof value !== 'object') return;
   for (const [key, child] of Object.entries(value)) {
      if (/(?:password|secret|accessToken|refreshToken|oauthToken|credential)/i.test(key)) {
         credentialFields.add(key);
      }
      collectCredentialFields(child);
   }
};
for (const value of originals.values()) collectCredentialFields(value);
if (credentialFields.size > 0) {
   throw new Error(
      `Credential-like fixture fields found: ${[...credentialFields].sort().join(', ')}`,
   );
}

const values = {
   email: new Set<string>(),
   guid: new Set<string>(),
   leagueKey: new Set<string>(),
   leagueName: new Set<string>(),
   managerId: new Set<number>(),
   nickname: new Set<string>(),
   profileImage: new Set<string>(),
   teamKey: new Set<string>(),
   teamLogo: new Set<string>(),
   teamName: new Set<string>(),
   transactionKey: new Set<string>(),
};

const collect = (value: Json, path: string[] = []): void => {
   if (Array.isArray(value)) {
      for (const item of value) collect(item, path);
      return;
   }
   if (!value || typeof value !== 'object') return;

   const object = value as JsonObject;
   const isLeague = typeof object.leagueKey === 'string';
   const isTeam = typeof object.teamKey === 'string';
   const isManager = typeof object.managerId === 'number';

   if (isLeague && typeof object.name === 'string') values.leagueName.add(object.name);
   if (isTeam && typeof object.name === 'string') values.teamName.add(object.name);
   if (isManager) values.managerId.add(object.managerId as number);

   for (const [key, child] of Object.entries(object)) {
      if (typeof child === 'string') {
         if (key === 'guid') values.guid.add(child);
         if (key === 'email') values.email.add(child);
         if (key === 'nickname') values.nickname.add(child);
         if (key === 'leagueKey') values.leagueKey.add(child);
         if (privateTeamKeyFields.has(key)) {
            values.teamKey.add(child);
            const [leagueKey] = child.split('.t.');
            if (leagueKey) values.leagueKey.add(leagueKey);
         }
         if (key === 'transactionKey') {
            values.transactionKey.add(child);
            const [leagueKey] = child.split('.tr.');
            if (leagueKey) values.leagueKey.add(leagueKey);
         }
         if (key.endsWith('TeamName')) values.teamName.add(child);
         if (key === 'imageUrl' && isManager) values.profileImage.add(child);
         if (key === 'url' && path.includes('teamLogos')) values.teamLogo.add(child);
      }
      collect(child, [...path, key]);
   }
};
for (const value of originals.values()) collect(value);

const indexedMap = <T>(source: Set<T>, make: (index: number, value: T) => T) =>
   new Map(
      [...source]
         .sort((a, b) => String(a).localeCompare(String(b)))
         .map((value, index) => [value, make(index + 1, value)]),
   );
const pad = (value: number, length = 3) => String(value).padStart(length, '0');

const leagueKeys = indexedMap(values.leagueKey, (index, value) => {
   const gameKey = value.split('.l.')[0] ?? '0';
   return `${gameKey}.l.${90000 + index}`;
});
const teamKeys = indexedMap(values.teamKey, (index, value) => {
   const [leagueKey] = value.split('.t.');
   const mappedLeague = leagueKeys.get(leagueKey ?? '') ?? leagueKey;
   return `${mappedLeague}.t.${index}`;
});
const transactionKeys = indexedMap(values.transactionKey, (index, value) => {
   const [leagueKey] = value.split('.tr.');
   const mappedLeague = leagueKeys.get(leagueKey ?? '') ?? leagueKey;
   return `${mappedLeague}.tr.${index}`;
});
const leagueNames = indexedMap(values.leagueName, (index) => `Synthetic League ${pad(index)}`);
const teamNames = indexedMap(values.teamName, (index) => `Synthetic Team ${pad(index)}`);
const guids = indexedMap(values.guid, (index) => `SYNTHETICGUID${pad(index, 12)}`);
const emails = indexedMap(values.email, (index) => `manager-${pad(index)}@example.invalid`);
const nicknames = indexedMap(values.nickname, (index) => `Manager ${pad(index)}`);
const managerIds = indexedMap(values.managerId, (index) => 7000 + index);
const profileImages = indexedMap(
   values.profileImage,
   (index) => `https://example.invalid/profile/${pad(index)}.png`,
);
const teamLogos = indexedMap(
   values.teamLogo,
   (index) => `https://example.invalid/team-logo/${pad(index)}.png`,
);

const mappedNumericId = (mappedKey: string | undefined, marker: string): number | undefined => {
   const raw = mappedKey?.split(marker)[1]?.split('.')[0];
   return raw ? Number(raw) : undefined;
};

const sanitize = (value: Json, path: string[] = []): Json => {
   if (Array.isArray(value)) return value.map((item) => sanitize(item, path));
   if (!value || typeof value !== 'object') return value;

   const original = value as JsonObject;
   const result: JsonObject = {};
   const originalLeagueKey =
      typeof original.leagueKey === 'string' ? original.leagueKey : undefined;
   const originalTeamKey = typeof original.teamKey === 'string' ? original.teamKey : undefined;
   const originalTransactionKey =
      typeof original.transactionKey === 'string' ? original.transactionKey : undefined;
   const isManager = typeof original.managerId === 'number';

   for (const [key, child] of Object.entries(original)) {
      let replacement: Json | undefined;

      if (typeof child === 'string') {
         if (key === 'leagueKey') replacement = leagueKeys.get(child);
         else if (privateTeamKeyFields.has(key)) replacement = teamKeys.get(child);
         else if (key === 'transactionKey') replacement = transactionKeys.get(child);
         else if (key === 'guid') replacement = guids.get(child);
         else if (key === 'email') replacement = emails.get(child);
         else if (key === 'nickname') replacement = nicknames.get(child);
         else if (key.endsWith('TeamName')) replacement = teamNames.get(child);
         else if (key === 'name' && originalLeagueKey) replacement = leagueNames.get(child);
         else if (key === 'name' && originalTeamKey) replacement = teamNames.get(child);
         else if (key === 'imageUrl' && isManager) replacement = profileImages.get(child);
         else if (key === 'url' && path.includes('teamLogos')) replacement = teamLogos.get(child);
         else if (key === 'logoUrl') replacement = 'https://example.invalid/league-logo/001.png';
         else if (key === 'url' && originalLeagueKey) {
            replacement = `https://example.invalid/fantasy/league/${leagueKeys.get(originalLeagueKey)}`;
         } else if (key === 'url' && originalTeamKey) {
            replacement = `https://example.invalid/fantasy/team/${teamKeys.get(originalTeamKey)}`;
         } else if (key === 'persistentUrl') {
            replacement = 'https://example.invalid/league/synthetic-league';
         } else if (key === 'sendbirdChannelUrl') replacement = 'synthetic-chat-channel';
         else if (key === 'irisGroupChatId' && child !== '') replacement = 'synthetic-chat-group';
      } else if (typeof child === 'number') {
         if (key === 'leagueId' && originalLeagueKey) {
            replacement = mappedNumericId(leagueKeys.get(originalLeagueKey), '.l.');
         } else if (key === 'teamId' && originalTeamKey) {
            replacement = mappedNumericId(teamKeys.get(originalTeamKey), '.t.');
         } else if (key === 'transactionId' && originalTransactionKey) {
            replacement = mappedNumericId(transactionKeys.get(originalTransactionKey), '.tr.');
         } else if (key === 'managerId') replacement = managerIds.get(child);
         else if (isManager && key === 'feloScore') replacement = 500;
      }

      if (isManager && key === 'feloTier' && typeof child === 'string') {
         replacement = 'bronze';
      }
      result[key] = replacement ?? sanitize(child, [...path, key]);
   }
   return result;
};

const shape = (value: Json): Json => {
   if (Array.isArray(value)) return { length: value.length, items: value.map(shape) };
   if (value === null) return 'null';
   if (typeof value !== 'object') return typeof value;
   return Object.fromEntries(
      Object.entries(value)
         .sort(([a], [b]) => a.localeCompare(b))
         .map(([key, child]) => [key, shape(child)]),
   );
};

const verifyPrivacy = (value: Json, path: string[] = [], failures: Set<string>): void => {
   if (Array.isArray(value)) {
      for (const item of value) verifyPrivacy(item, path, failures);
      return;
   }
   if (!value || typeof value !== 'object') return;
   const object = value as JsonObject;
   const isLeague = typeof object.leagueKey === 'string';
   const isTeam = typeof object.teamKey === 'string';
   const isManager = typeof object.managerId === 'number';

   for (const [key, child] of Object.entries(object)) {
      const fail = (category: string) => failures.add(`${key} (${category})`);
      if (typeof child === 'string') {
         if (key === 'guid' && !child.startsWith('SYNTHETICGUID')) fail('user/manager');
         if (key === 'email' && !child.endsWith('@example.invalid')) fail('contact');
         if (key === 'nickname' && !child.startsWith('Manager ')) fail('manager');
         if (key === 'name' && isLeague && !child.startsWith('Synthetic League ')) fail('league');
         if (key === 'name' && isTeam && !child.startsWith('Synthetic Team ')) fail('team');
         if (key.endsWith('TeamName') && !child.startsWith('Synthetic Team ')) fail('team');
         if (key === 'imageUrl' && isManager && !child.startsWith('https://example.invalid/profile/')) fail('profile');
         if (key === 'url' && path.includes('teamLogos') && !child.startsWith('https://example.invalid/team-logo/')) fail('team logo');
         if (key === 'logoUrl' && !child.startsWith('https://example.invalid/league-logo/')) fail('league logo');
         if (key === 'persistentUrl' && !child.startsWith('https://example.invalid/league/')) fail('league URL');
         if (key === 'sendbirdChannelUrl' && child !== 'synthetic-chat-channel') fail('chat');
         if (key === 'irisGroupChatId' && child !== '' && child !== 'synthetic-chat-group') fail('chat');
      }
      verifyPrivacy(child, [...path, key], failures);
   }
};

if (write) {
   for (const [file, original] of originals) {
      const sanitized = sanitize(original);
      const content =
         JSON.stringify(sanitized) === JSON.stringify(original)
            ? originalTexts.get(file)
            : JSON.stringify(sanitized, null, 2);
      if (content === undefined) throw new Error(`Missing source fixture: ${basename(file)}`);
      await Bun.write(file, content);
   }
}

const failures = new Set<string>();
for (const file of files) {
   const current = JSON.parse(await Bun.file(file).text()) as Json;
   const baselineProcess = Bun.spawnSync(['git', 'show', `${baseCommit}:${file}`], {
      stdout: 'pipe',
      stderr: 'pipe',
   });
   if (baselineProcess.exitCode !== 0) {
      failures.add(`${basename(file)} (baseline unavailable)`);
      continue;
   }
   const baseline = JSON.parse(baselineProcess.stdout.toString()) as Json;
   if (JSON.stringify(shape(current)) !== JSON.stringify(shape(baseline))) {
      failures.add(`${basename(file)} (structure)`);
   }
   verifyPrivacy(current, [], failures);
}

if (failures.size > 0) {
   throw new Error(`Fixture verification failed: ${[...failures].sort().join(', ')}`);
}

console.log(
   `Verified ${files.length} fixture files: valid JSON, unchanged structure, approved privacy placeholders.`,
);
