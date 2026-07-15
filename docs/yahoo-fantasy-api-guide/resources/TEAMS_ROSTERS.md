# Teams And Rosters

Official source: [Team APIs](https://sports.yahoo.com/developer/docs/#team-apis)

A team belongs to one league and has one or more managers. A roster is that team's lineup for one scoring period.

Team key:

```text
{game_key}.l.{league_id}.t.{team_id}
```

## Team Resource

```text
GET /team/{team_key}
```

| Child | Purpose | Parameters |
| --- | --- | --- |
| `metadata` | Team identity, managers, and logos; default | none |
| `stats` | Team stats and points | `type`; `week` for NFL or `date` for MLB/NBA/NHL |
| `standings` | Rank, record, and percentage | none |
| `roster` | One lineup period | `week` or `date` |
| `draftresults` | Players drafted by the team | none documented |
| `matchups` | H2H schedule and results | `weeks` |

Yahoo also documents team-qualified player collections:

```text
/team/{team_key}/players
```

Examples:

```text
/team/{team_key}/standings
/team/{team_key}/stats;type=week;week=2 # NFL
/team/{team_key}/matchups;weeks=1,3,6
/team/{team_key}/draftresults
/team/{team_key};out=roster,stats,matchups
```

## Teams Collection

```text
/league/{league_key}/teams
/teams;team_keys={team_key1},{team_key2}
/teams;team_keys={team_key1},{team_key2}/players
/users;use_login=1/teams
/users;use_login=1/games;game_keys={game_key}/teams
```

Yahoo says team children apply beneath a teams collection. Core roster, stats, and matchup paths have passed live with `team_keys`.

## Roster Resource

```text
GET /team/{team_key}/roster;week={week}
GET /team/{team_key}/roster;date={yyyy-mm-dd}
GET /team/{team_key}/roster;week={week}/players
```

- NFL rosters are weekly and default to the current week.
- MLB, NBA, and NHL rosters are date-based and default to today.
- Yahoo supports one roster period per team request; `roster` is not a plural roster collection.
- `players` is the default roster child.

## Edit A Lineup

`PUT /team/{team_key}/roster` with an XML body changes selected positions. Omitted players retain their positions.

```xml
<fantasy_content>
  <roster>
    <coverage_type>week</coverage_type>
    <week>2</week>
    <players>
      <player>
        <player_key>{player_key}</player_key>
        <position>WR</position>
      </player>
    </players>
  </roster>
</fantasy_content>
```

Use `coverage_type=date` and `<date>YYYY-MM-DD</date>` for daily sports. Live behavior returns a compact success confirmation or an HTTP error; one observed conflict message is `That position has already been filled.`
