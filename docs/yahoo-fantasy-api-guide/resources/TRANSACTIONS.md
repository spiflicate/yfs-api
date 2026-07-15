# Transactions

Official source: [Transaction APIs](https://sports.yahoo.com/developer/docs/#transaction-apis)

Transactions represent adds, drops, trades, commissioner changes, waiver claims, and pending trades.

## Keys

```text
Completed:     {game_key}.l.{league_id}.tr.{transaction_id}
Waiver claim:  {game_key}.l.{league_id}.w.c.{claim_id}
Pending trade: {game_key}.l.{league_id}.pt.{pending_trade_id}
```

## Read

```text
GET /transaction/{transaction_key}
GET /transaction/{transaction_key}/players
GET /transactions;transaction_keys={key1},{key2}
GET /league/{league_key}/transactions
GET /leagues;league_keys={key1},{key2}/transactions
```

The transaction resource defaults to `metadata` and `players`.

**Current evidence**: `/league/{league_key}/transactions;count=5` passed for an NHL public league fixture. Direct transaction-key paths, keyed Transactions collections, and Leagues-collection descendants are official but lacked current concrete evidence. Cross-sport transaction keys are unavailable.

Filters:

| Filter | Meaning |
| --- | --- |
| `type` | One transaction type |
| `types` | Comma-separated transaction types |
| `team_key` | Transactions relevant to one team |
| `count` | Positive result limit |

An unfiltered league feed contains completed transactions. Discover pending waivers and trades with a team filter:

```text
/league/{league_key}/transactions;types=waiver,pending_trade;team_key={team_key}
```

## Create

`POST /league/{league_key}/transactions` with XML to add, drop, add/drop, or propose a trade. A claim for a player on waivers returns a pending waiver transaction rather than an immediate roster change. FAAB leagues accept `faab_bid` in the transaction body.

```xml
<fantasy_content>
  <transaction>
    <type>add</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>add</type>
        <destination_team_key>{team_key}</destination_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

## Modify Or Cancel

- `PUT /transaction/{transaction_key}` edits waiver priority/FAAB or acts on a pending trade.
- Pending trade actions include `accept`, `reject`, `allow`, `disallow`, and `vote_against`, subject to role and league rules.
- `DELETE /transaction/{transaction_key}` cancels an eligible pending waiver or unaccepted trade.

Mutation permissions and timing are league-dependent. Validate destructive workflows against a disposable league before automating them.

Mutation implementations are intentionally not part of the stable package-root API. Transaction DTOs describe read responses only.
