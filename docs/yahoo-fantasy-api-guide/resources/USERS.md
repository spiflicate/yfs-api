# Users

Official source: [User APIs](https://sports.yahoo.com/developer/docs/#user-apis)

Yahoo only exposes fantasy information for the authorized user. Use the Users collection with `use_login=1`; Yahoo does not document a usable direct `/user/{guid}` route.

## Safe Paths

```text
/users;use_login=1
/users;use_login=1/games
/users;use_login=1/games;game_keys={game_key}/leagues
/users;use_login=1/games;game_keys={game_key}/teams
/users;use_login=1/teams
/users;use_login=1/games;game_keys={game_key};out=leagues,teams
```

These return only games, leagues, and teams associated with the authorized user. Yahoo warns that selecting a game that does not support a requested child can make the entire request fail, so filter `games` when descending.

## Important Boundary

Do not use:

```text
/users;use_login=1/leagues
/users;use_login=1;out=leagues
```

Live requests received `subresource leagues not supported`. League discovery must pass through `games`:

```text
/users;use_login=1/games/leagues
```

The direct `/users;use_login=1/teams` path is both listed in Yahoo's Teams collection table and live-validated, even though Yahoo's User sub-resource table only lists game-based paths.
