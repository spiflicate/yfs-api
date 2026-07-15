# Yahoo Fantasy API Chain Matrix

This matrix separates what Yahoo documents from what the API has accepted in this repository's live route probes. It is not a claim that every combination of listed edges is valid.

| Parent | Child | Official | Live evidence | Notes |
| --- | --- | --- | --- | --- |
| `users` | `games` | yes | passed | Primary league-discovery path |
| `users` | `teams` | yes | passed | Listed in Yahoo's Teams collection table |
| `users` | `leagues` | no | rejected | Use `users/games/leagues` |
| `users/games` | `leagues` | yes | passed | May fail if a selected game lacks league support |
| `users/games` | `teams` | yes | passed | User-owned teams only |
| `users/games/leagues` | `settings`, `teams`, `players` | generic composition | passed | Deep collection composition works for tested user games |
| `users/games/teams` | `roster` | generic composition | passed | Tested with authorized user data |
| `game` | `players`, `game_weeks` | yes | passed | Direct routes |
| `game` | `leagues` | yes | passed with `league_keys` | Unfiltered route can return `league ids expected` |
| `game/leagues` | `teams`, `players`, `transactions` | generic composition | passed with `league_keys` | Keep the league filter on the `leagues` segment |
| `games` | `metadata`, `players` | yes | passed | Filter games as needed |
| `games` | `leagues` | generic composition | passed with `league_keys` | Unfiltered family remains unreliable |
| `league` | `settings`, `standings`, `scoreboard`, `teams`, `players`, `transactions` | yes | passed | `draftresults` is official but not in the route suite |
| `leagues` | league children | yes | passed for core children | Supply `league_keys` |
| `league/teams` | `roster/players` | generic composition | passed with `team_keys` | Filter selected teams for predictable results |
| `team` | `roster`, `matchups`, `stats` | yes | passed | `standings` and `draftresults` are official, not yet in suite |
| `teams` | `roster`, `matchups`, `stats` | yes | passed | Supply `team_keys` |
| `teams` | `players` | yes | not current | Explicit Yahoo collection example; not in the latest route suite |
| `roster` | `players` | yes | passed | One roster period per team request |
| `player` | `stats`, `ownership`, `percent_owned` | yes | passed | `draft_analysis` is official, not yet in suite |
| `players` | `stats`, `ownership`, `percent_owned` | generic composition | passed | Supply `player_keys` at a top-level collection |
| `transaction` | `players` | yes | not current | Concrete transaction fixtures were stale |

## `out` Evidence

| Path family | Status |
| --- | --- |
| `game/{key};out=players,game_weeks` | passed |
| `league/{key};out=settings,standings,scoreboard` | passed |
| `leagues;league_keys=...;out=settings,standings` | passed |
| `team/{key};out=roster,stats,matchups` | passed |
| `teams;team_keys=...;out=roster,stats` | passed |
| `player/{key};out=stats,ownership` | passed |
| `users;use_login=1/games;game_keys=...;out=leagues,teams` | passed |
| `users;use_login=1;out=leagues` | rejected |
| `games;...;out=leagues` | provisional; repeated failures |

## Stability Rule

Use this order when deciding whether to publish a route:

1. Prefer an official example that also passes live.
2. Accept a generic composed route only after a successful live request with realistic filters.
3. Mark parameter-contract failures provisional rather than unsupported.
4. Mark direct `subresource ... not supported` failures unsupported.
5. Revalidate mutations and transaction-key routes with disposable, current fixtures before relying on them.
