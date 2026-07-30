# Yahoo Browser-Cookie Tooling

This directory contains internal, read-only tooling for investigating Yahoo's
browser-authenticated frontend routes. It is deliberately separate from the
public `yfs-api` client and does not add cookies to `Config` or fall back from
OAuth bearer authentication.

`BrowserCookieClient` accepts either a Playwright-compatible `storageState`
object, its `cookies` array, or an explicitly supplied `Cookie` header. The
caller must intentionally provide the session. The module does not log cookie
values, response bodies, or credentials.

Only `GET` requests to the approved `pub-api-ro` and frontend V3 origins are
allowed. Writes, arbitrary hosts, and unrecognized routes fail before fetch.
HTTP `401` and `403` responses are classified as session failures so callers
can request a fresh browser login instead of treating an expired session as a
route or data error.

Example:

```ts
import {
   BrowserCookieClient,
   loadStorageState,
} from './browser-cookie-client.js';

const storageState = await loadStorageState('./local-only/storage-state.json');
const client = new BrowserCookieClient({ cookies: storageState });
const game = await client.get('/fantasy/v2/game/nhl?format=json');
```

Storage state and cookie headers are credentials. Keep them outside the
repository, do not print them, and remove them when the Yahoo session expires.
