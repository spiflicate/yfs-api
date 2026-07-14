# Integration Auth Helper

`tests/integration/helpers/authFlow.ts` is manual-test infrastructure, not a
package export. It checks token environment variables first, then an optional
local `.test-tokens.json`, then an interactive OAuth flow when a TTY exists.

File storage implements the public asynchronous `TokenStorage` contract.
Token files are ignored by Git and must never be printed or committed.

The normal integration command does not use the interactive helper and cannot
run resource mutations. Use the helper only while intentionally running live
tests on a trusted local machine.
