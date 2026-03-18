# Request Builder Examples

- [01-basic-usage.ts](./01-basic-usage.ts): basic request builder reads and path construction.
- [02-transactions.ts](./02-transactions.ts): authenticated transaction reads and writes.
- [03-roster-editing.ts](./03-roster-editing.ts): authenticated roster lineup updates via PUT.

Notes:

- Transaction and roster write examples require user authentication.
- Roster editing is not available in public mode.
- Use `--path-only` to inspect paths and sample payloads without making API calls.
