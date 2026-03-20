# Test Environment Setup Guide

This guide helps you configure test league and team keys for integration testing.

## Quick Setup

1. **Get your Yahoo API Credentials**
   - Already configured in `.env`
   - Client ID and Client Secret are set

2. **Get Test League and Team Keys**

### Method 1: From Yahoo Fantasy Website (Easiest)

1. Go to your Yahoo Fantasy league page
2. Look at the URL - it will look like:
   ```
   https://hockey.fantasysports.yahoo.com/hockey/12345
   ```
   or
   ```
   https://football.fantasysports.yahoo.com/f1/67890/1
   ```

3. Extract the keys from the URL:
   - **For Hockey (NHL):** URL `/hockey/12345` → League Key: `nhl.l.12345`
   - **For Football (NFL):** URL `/f1/67890` → League Key: `nfl.l.67890`
   - **For Basketball (NBA):** URL `/nba/12345` → League Key: `nba.l.12345`
   - **For Baseball (MLB):** URL `/baseball/12345` → League Key: `mlb.l.12345`

4. For team keys, go to your team page and look for:
   ```
   https://hockey.fantasysports.yahoo.com/hockey/12345/1
   ```
   The team key format is: `{sport_code}.l.{league_id}.t.{team_id}`
   Example: `nhl.l.12345.t.1`

### Method 2: Using the Current Auth Helpers

Use the existing auth flow and integration helpers instead:

```bash
# 1. Copy the committed template
cp .env.test.example .env.test

# 2. Fill in your Yahoo app credentials in .env.test
# 3. Run the integration tests
bun test tests/integration
```

If you do not preconfigure `YAHOO_ACCESS_TOKEN`, `YAHOO_REFRESH_TOKEN`, and
`YAHOO_TOKEN_EXPIRES_AT`, the integration auth helper will prompt for OAuth
authentication and save reusable test tokens to `.test-tokens.json`.

## Manual .env.test Setup

Start from `.env.test.example` and update it with your local values:

```bash
# Yahoo API Credentials
YAHOO_CLIENT_ID=your_client_id_here
YAHOO_CLIENT_SECRET=your_client_secret_here
YAHOO_REDIRECT_URI=oob

# Optional OAuth Tokens
# Leave these unset to use the interactive integration-test auth flow.
YAHOO_ACCESS_TOKEN=your_access_token_here
YAHOO_REFRESH_TOKEN=your_refresh_token_here
YAHOO_TOKEN_EXPIRES_AT=your_expiration_timestamp_here

# Test League and Team Keys (REPLACE WITH YOUR VALUES)
TEST_LEAGUE_KEY=nhl.l.12345
TEST_TEAM_KEY=nhl.l.12345.t.1

# Optional
DEBUG=false
SKIP_INTEGRATION_TESTS=false
```

## Getting Your Keys - Step by Step

### For NHL League:

1. Go to https://hockey.fantasysports.yahoo.com/
2. Click on your league
3. URL will be: `https://hockey.fantasysports.yahoo.com/hockey/123456`
4. Your league key is: `nhl.l.123456`
5. Click on your team
6. URL will be: `https://hockey.fantasysports.yahoo.com/hockey/123456/1`
7. Your team key is: `nhl.l.123456.t.1`

### Key Formats by Sport:

- **NHL:** `nhl.l.{league_id}` and `nhl.l.{league_id}.t.{team_id}`
- **NFL:** `nfl.l.{league_id}` and `nfl.l.{league_id}.t.{team_id}`
- **NBA:** `nba.l.{league_id}` and `nba.l.{league_id}.t.{team_id}`
- **MLB:** `mlb.l.{league_id}` and `mlb.l.{league_id}.t.{team_id}`

## Using Game Keys Instead

If you don't have a league yet, you can use game keys for some tests:

```bash
# Instead of league keys, use game keys for public API tests
TEST_GAME_KEY=nhl    # or nfl, nba, mlb
```

## Running Tests

Once configured:

```bash
# Bun will load .env.test automatically for test runs.
bun test tests/integration

# Run specific tests
bun test tests/integration/resources/league.test.ts
bun test tests/integration/resources/team.test.ts
```

## Troubleshooting

### "No league/team found" errors
- Verify you copied the keys correctly
- Make sure the league season is active
- Check that you're a member of the league

### Token expired errors  
- Run an authentication script to get fresh tokens
- Delete `.test-tokens.json` to force a fresh interactive login for tests
- Or update `.env.test` with fresh token values

### Permission errors
- Ensure your Yahoo app has the correct permissions
- The league must be accessible by your Yahoo account
- Some leagues may be private and require authorization

## Recommended Test Setup

For comprehensive testing, it's recommended to:

1. **Join or create a test league** - Use a league you control
2. **Use an active season** - Current or most recent season
3. **Have at least one team** - You need to be rostered
4. **Use a league with public settings** - Easier for testing

Example ideal setup:
```
TEST_LEAGUE_KEY=nhl.l.123456       # Your test league
TEST_TEAM_KEY=nhl.l.123456.t.1     # Your team in that league
```

## Next Steps

1. Get your league and team keys from Yahoo Fantasy website
2. Update `.env.test` with your keys
3. Run integration tests: `bun test tests/integration`
4. Complete the interactive OAuth prompt if you did not preconfigure tokens
