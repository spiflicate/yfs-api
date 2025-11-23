# Yahoo Fantasy Sports API – Transactions

This document summarizes the **Transaction resource** and **Transactions collection** from the official Yahoo Fantasy Sports API guide.

## Contents
- [Transaction Resource](#transaction-resource)
  - [Description](#description)
  - [Transaction Keys](#transaction-keys)
  - [HTTP Operations](#http-operations)
  - [URIs](#uris)
  - [Sub-resources](#sub-resources)
  - [Sample Responses](#sample-responses)
  - [PUT – Editing Waivers & Trades](#put--editing-waivers--trades)
  - [DELETE – Cancelling Pending Transactions](#delete--cancelling-pending-transactions)
- [Transactions Collection](#transactions-collection)
  - [Description](#description-1)
  - [HTTP Operations](#http-operations-1)
  - [URIs](#uris-1)
  - [Filters](#filters)
  - [POST – Creating Transactions](#post--creating-transactions)

---

## Transaction Resource

### Description

A **transaction** represents a change affecting players or league settings within a league. Types include:
- **Add** – adding a player from free agents or waivers to a team.
- **Drop** – dropping a player from a team to waivers or free agents.
- **Add/Drop** – atomic replacement of one player with another on a team.
- **Waiver** – a pending claim on a player subject to waiver rules and priorities.
- **Pending Trade** – proposed trade between two teams that is not yet executed.
- **Commish** – commissioner changes to league settings or rosters.

The Transaction API lets you:
- `GET` transaction details.
- `PUT` to edit waiver priorities or FAAB bids, and to accept/reject/vote on trades.
- `DELETE` to cancel pending waivers and trades.

Access is scoped to a league, and visibility of pending transactions can be limited:
- Pending waivers/trades may only be visible to teams they involve or commissioners.

### Transaction Keys

Transaction key formats vary by type:

- **Completed transaction** (add/drop/commish/trade):

  ```text
  {game_key}.l.{league_id}.tr.{transaction_id}
  ```

  Example: `pnfl.l.431.tr.26`, `223.l.431.tr.26`.

- **Waiver claim**:

  ```text
  {game_key}.l.{league_id}.w.c.{claim_id}
  ```

  Example: `257.l.193.w.c.2_6390`.

- **Pending trade**:

  ```text
  {game_key}.l.{league_id}.pt.{pending_trade_id}
  ```

  Example: `257.l.193.pt.1`.

### HTTP Operations

- `GET` – retrieve transaction details.
- `PUT` – edit waiver priority/FAAB bid; manage trade lifecycle (accept/reject/allow/disallow/vote_against).
- `DELETE` – cancel pending waivers and trades (prior to execution).

### URIs

Base transaction resource URI:

```text
https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

Sub‑resources (rarely used separately) follow the pattern:

```text
https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}/{sub_resource}
```

Adding `out` works as with other resources:

```text
/transaction/{transaction_key};out={sub_resource_1},{sub_resource_2}
```

### Sub-resources

The documentation lists default sub‑resources:

- `metadata`
- `players`

Players involved in the transaction are returned under `<players>`.

### Sample Responses

#### Completed add/drop transaction

Example: `GET /fantasy/v2/transaction/257.l.193.tr.2` (simplified):

```xml
<fantasy_content>
  <transaction>
    <transaction_key>257.l.193.tr.2</transaction_key>
    <transaction_id>2</transaction_id>
    <type>add/drop</type>
    <status>successful</status>
    <timestamp>1310694660</timestamp>
    <players count="2">
      <player>
        <player_key>257.p.7847</player_key>
        <player_id>7847</player_id>
        <name>...</name>
        <transaction_data>
          <type>add</type>
          <source_type>freeagents</source_type>
          <destination_type>team</destination_type>
          <destination_team_key>257.l.193.t.1</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>257.p.6390</player_key>
        <player_id>6390</player_id>
        <name>...</name>
        <transaction_data>
          <type>drop</type>
          <source_type>team</source_type>
          <source_team_key>257.l.193.t.1</source_team_key>
          <destination_type>waivers</destination_type>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

#### Waiver claim transaction

Example: `GET /fantasy/v2/transaction/257.l.193.w.c.2_6390` returns:
- `type` = `waiver`.
- `status` = `pending`.
- `waiver_player_key`, `waiver_team_key`.
- `waiver_date`, `waiver_priority`.
- `<players>` with add/drop details, similar to completed transactions.

#### Pending trade transaction

Example: `GET /fantasy/v2/transaction/257.l.193.pt.1` returns:
- `type` = `pending_trade`.
- `status` = e.g. `proposed`.
- `trader_team_key`, `tradee_team_key`.
- `trade_proposed_time` and optional `trade_note`.
- `<players>` with each side of the trade indicated via `transaction_data` elements.

### PUT – Editing Waivers & Trades

You can `PUT` to transactions of types **`waiver`** or **`pending_trade`**.

Endpoint:

```text
PUT https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

#### Editing Waiver Priority / FAAB Bid

Once you have the waiver transaction key (e.g. from the league transactions collection filtered by `type=waiver` and `team_key`), you can modify:
- `waiver_priority`
- `faab_bid` (for FAAB leagues)

Example body:

```xml
<?xml version="1.0"?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.w.c.2_6093</transaction_key>
    <type>waiver</type>
    <waiver_priority>1</waiver_priority>
    <faab_bid>20</faab_bid>
  </transaction>
</fantasy_content>
```

#### Accepting Trades

To accept a pending trade that was proposed **to you**:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>accept</action>
    <trade_note>Dude, that is a totally fair trade.</trade_note>
  </transaction>
</fantasy_content>
```

#### Rejecting Trades

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>reject</action>
    <trade_note>No way!</trade_note>
  </transaction>
</fantasy_content>
```

#### Allowing / Disallowing Trades (Commissioner)

If the league requires commissioner trade approval, the commissioner can allow or disallow:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>allow</action>
  </transaction>
</fantasy_content>
```

Or:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>disallow</action>
  </transaction>
</fantasy_content>
```

#### Voting Against Trades (Manager Voting)

If the league allows managers to veto trades, managers can vote against:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <transaction_key>248.l.55438.pt.11</transaction_key>
    <type>pending_trade</type>
    <action>vote_against</action>
    <voter_team_key>248.l.55438.t.2</voter_team_key>
  </transaction>
</fantasy_content>
```

### DELETE – Cancelling Pending Transactions

You can `DELETE` pending waivers and trades (before they are executed).

Endpoint:

```text
DELETE https://fantasysports.yahooapis.com/fantasy/v2/transaction/{transaction_key}
```

Constraints:
- Only applies to `waiver` or `pending_trade` transactions.
- Pending trades must **not yet be accepted** to be cancellable.

---

## Transactions Collection

### Description

The **Transactions** collection exposes multiple transactions in a league.

You can:
- `GET` to list transactions, optionally filtered by type, team, or count.
- `POST` to create new transactions:
  - Add a player.
  - Drop a player.
  - Add/drop (one in, one out) atomically.
  - Propose trades.

Each element under `<transactions>` is a `<transaction>` resource as described above.

### HTTP Operations

- `GET` – read existing transactions.
- `POST` – create new transactions.

### URIs

Transactions collection is scoped to a league:

```text
https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions
```

Within the guide’s shorthand notation:

```text
/transactions/{sub_resource}
/transactions;transaction_keys={transaction_key1},{transaction_key2}/{sub_resource}
```

Adding `out` for expansions:

```text
/transactions;out={sub_resource_1},{sub_resource_2}
/transactions;transaction_keys={t1},{t2};out={sub_resource_1},{sub_resource_2}
```

### Filters

Supported filters from the guide:

| Filter      | Description                           | Example                                           |
|-------------|---------------------------------------|---------------------------------------------------|
| `type`      | Single type: `add`, `drop`, `commish`, `trade` | `/transactions;type=add`                          |
| `types`     | Multiple types                        | `/transactions;types=add,trade`                   |
| `team_key`  | Restrict to a specific team           | `/transactions;team_key=257.l.193.t.1`            |
| `type` with `team_key` | Special types `waiver`, `pending_trade` only valid when combined with `team_key` | `/transactions;team_key=257.l.193.t.1;type=waiver` |
| `count`     | Limit number of results (>0)          | `/transactions;count=5`                           |

Filters can be combined, e.g.:

```text
/league/{league_key}/transactions;team_key=257.l.193.t.1;type=waiver
```

### POST – Creating Transactions

`POST` to the league transactions collection to perform adds/drops and propose trades.

Endpoint:

```text
POST https://fantasysports.yahooapis.com/fantasy/v2/league/{league_key}/transactions
```

#### Adding a Player

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

#### Dropping a Player

```xml
<fantasy_content>
  <transaction>
    <type>drop</type>
    <player>
      <player_key>{player_key}</player_key>
      <transaction_data>
        <type>drop</type>
        <source_team_key>{team_key}</source_team_key>
      </transaction_data>
    </player>
  </transaction>
</fantasy_content>
```

#### Add/Drop (One In, One Out)

```xml
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <players>
      <player>
        <player_key>{add_player_key}</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>{team_key}</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>{drop_player_key}</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>{team_key}</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

If the added player is on waivers, the API returns a **waiver claim transaction** instead of an immediate add. League rules and other claims determine whether the team ultimately receives the player.

##### FAAB Bids on Waivers

For FAAB leagues, you can specify a `faab_bid`:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>add/drop</type>
    <faab_bid>25</faab_bid>
    <players>
      <player>
        <player_key>238.p.5484</player_key>
        <transaction_data>
          <type>add</type>
          <destination_team_key>238.l.627060.t.6</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>238.p.6327</player_key>
        <transaction_data>
          <type>drop</type>
          <source_team_key>238.l.627060.t.6</source_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once such a waiver claim exists, you can:
- `PUT` to adjust `faab_bid` or `waiver_priority`.
- `DELETE` to cancel the claim.

#### Proposing Trades

Example XML for proposing a pending trade:

```xml
<?xml version='1.0'?>
<fantasy_content>
  <transaction>
    <type>pending_trade</type>
    <trader_team_key>248.l.55438.t.11</trader_team_key>
    <tradee_team_key>248.l.55438.t.4</tradee_team_key>
    <trade_note>Yo yo yo yo yo!!!</trade_note>
    <players>
      <player>
        <player_key>248.p.4130</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>248.l.55438.t.11</source_team_key>
          <destination_team_key>248.l.55438.t.4</destination_team_key>
        </transaction_data>
      </player>
      <player>
        <player_key>248.p.2415</player_key>
        <transaction_data>
          <type>pending_trade</type>
          <source_team_key>248.l.55438.t.4</source_team_key>
          <destination_team_key>248.l.55438.t.11</destination_team_key>
        </transaction_data>
      </player>
    </players>
  </transaction>
</fantasy_content>
```

Once the pending trade transaction exists, the involved parties and/or commissioner can manage it through `PUT` and `DELETE` as described above.