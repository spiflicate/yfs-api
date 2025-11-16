# Public API Examples

✅ **NOW SUPPORTED** ✅

This directory contains examples for accessing Yahoo Fantasy Sports API public endpoints using **OAuth 1.0 2-legged authentication** (public mode).

## What is Public API Mode?

Public API mode allows you to access public endpoints without requiring user authorization. This is useful for:

- **Game metadata**: Information about available fantasy sports games (NHL, NFL, NBA, MLB)
- **Game stat categories**: Scoring categories and position types for each sport
- **Game-level player searches**: Search for players across all teams
- **Public league data**: Some league information that doesn't require user access

## How It Works

According to [Yahoo's documentation](https://developer.yahoo.com/fantasysports/guide/authentication.html), accessing "public" endpoints without user authorization requires **OAuth 1.0 2-legged authentication** with HMAC-SHA1 request signing.

1. Your application authenticates requests using your Client ID and Client Secret
2. Each request is signed with an OAuth 1.0 signature (HMAC-SHA1)
3. You can access public endpoints with signed requests
4. **No user authorization needed**
5. **No redirect URI needed**

## Differences from User Authentication

| Feature | User Authentication | Public API Mode |
|---------|-------------------|-----------------|
| **OAuth Flow** | OAuth 2.0 Authorization Code Grant | OAuth 1.0 2-legged |
| **User Authorization** | Required | Not required |
| **Redirect URI** | Required | Not required |
| **Access Level** | User-specific data | Public data only |
| **Endpoints** | All endpoints | Public endpoints only |

## Usage

### Configuration

```typescript
import { YahooFantasyClient } from 'yahoo-fantasy-sports';

const client = new YahooFantasyClient({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!,
  publicMode: true, // Enable public API mode (OAuth 1.0)
});

// No authentication flow needed!
// Start making API calls immediately
const games = await client.game.getGames();
```

### Running the Examples

```bash
# Set your credentials
export YAHOO_CLIENT_ID="your-client-id"
export YAHOO_CLIENT_SECRET="your-client-secret"

# Run the example
bun run examples/public-api/01-public-endpoints.ts
```

## Available Examples

### 01-public-endpoints.ts

Demonstrates accessing various public endpoints:
- Getting game metadata (game info, seasons, availability)
- Listing all available games
- Filtering games by code and season
- Searching for players across all teams

## Supported Public Endpoints

Based on Yahoo's API documentation, the following endpoints work in public mode:

### Game Resource ✅
- `GET /game/{game_key}` - Get game metadata
- `GET /games` - List games with filters
- `GET /game/{game_key}/players` - Search players in a game

### League Resource (limited)
- `GET /league/{league_key}` - Get public league info (if league is public)

### Player Resource (game-level)
- `GET /game/{game_key}/players` - Search and filter players

## Limitations

Public mode **does NOT** work with user-specific endpoints:

- ❌ User teams and leagues (`/users;use_login=1/...`)
- ❌ Team rosters and management (`/team/{team_key}/roster`)
- ❌ Transactions (`/league/{league_key}/transactions`)
- ❌ Private league data

For these endpoints, you must use **user authentication mode** with the full OAuth 2.0 flow.

## When to Use Public Mode

Use public mode when you need to:
- Build a fantasy sports information app
- Create player search/comparison tools
- Display game and season information
- Show public league standings

Use user authentication when you need to:
- Access user's teams and leagues
- Manage rosters
- Make transactions (add/drop/trade)
- Access private league data

## Important Notes

1. **Request Signing**: All requests are automatically signed with OAuth 1.0 HMAC-SHA1 signatures
2. **Rate Limits**: Public mode uses the same rate limits as user authentication
3. **Yahoo Restrictions**: Not all endpoints may support public access - test thoroughly
4. **Application-Level Access**: Requests are signed with your app credentials, not a user token

## Troubleshooting

### "Authentication failed" error

If you get authentication errors in public mode:
1. Verify your Client ID and Client Secret are correct
2. Check that your Yahoo Developer App is properly configured
3. Ensure the endpoint you're accessing supports public access
4. Try the same endpoint with user authentication to verify it works

### "Access denied" or "Forbidden" errors

Some endpoints may require user authorization even if they seem public. If you encounter access denied errors, switch to user authentication mode for those endpoints.

## Further Reading

- [OAuth 1.0 RFC 5849](https://tools.ietf.org/html/rfc5849)
- [Yahoo Fantasy Sports Authentication Guide](https://developer.yahoo.com/fantasysports/guide/authentication.html)
- [Yahoo Fantasy Sports API Guide](https://developer.yahoo.com/fantasysports/guide/)
