# Leagues

Official source: [League APIs](https://sports.yahoo.com/developer/docs/#league-apis)

A league is a competition inside one game. Private league data is available only to an authorized member or otherwise eligible user.

League key: `{game_key}.l.{league_id}`

**Current league/team evidence is from a single NHL public league.** NFL/MLB/NBA routes are fixture-unavailable until public league keys are configured for those sports.

## Resource

```text
GET /league/{league_key}
```

| Child | Purpose | Parameters |
| --- | --- | --- |
| `metadata` | Name, key, draft state, size, season information; default | none |
| `settings` | Draft, scoring, roster, waiver, trade, playoff, and stat rules | none |
| `standings` | Ranked teams and records | none |
| `scoreboard` | Matchups and team scores | `week` |
| `teams` | Teams in the league | `team_keys` when selecting teams |
| `players` | League-eligible player pool | player filters |
| `draftresults` | Draft picks for all teams | none documented |
| `transactions` | Adds, drops, trades, commissioner actions | transaction filters |

```text
/league/{league_key}/settings
/league/{league_key}/scoreboard;week=2
/league/{league_key}/draftresults
/league/{league_key}/transactions;count=25
```

Those explicit routes passed against the current NHL public fixture. Yahoo also documents `/league/{league_key}/players;...` and `out` expansion, but the current suite does not exercise those forms.

Interpret player points and stats using the league's `settings`; scoring is not globally uniform.

## Collection

```text
GET /leagues;league_keys={league_key1},{league_key2}
```

The current NHL run passed keyed collection metadata and `/teams`. Yahoo documents every league child as valid beneath a leagues collection, but the remaining examples are documented-only:

```text
/leagues;league_keys={key1},{key2}/teams
/leagues;league_keys={key1},{key2}/players                 # documented-only
/leagues;league_keys={key1},{key2}/transactions            # documented-only
/leagues;league_keys={key1},{key2};out=settings,standings   # documented-only
```

Use full `league_keys`. Live-observed `league_ids` filtering on nested collections is provisional and less portable.
