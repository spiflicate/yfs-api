# Integration Tests

This directory contains integration tests for the Yahoo Fantasy Sports API wrapper. These tests verify real API interactions and end-to-end workflows.

## Directory Structure

```
integration/
├── auth/           # Authentication tests
│   ├── oauth1.test.ts   # OAuth 1.0 (Public Mode) tests
│   └── oauth2.test.ts   # OAuth 2.0 (User Auth) tests
├── resources/      # Resource-specific tests
│   ├── league.test.ts   # League resource tests
│   └── team.test.ts     # Team resource tests
├── workflows/      # End-to-end workflow tests
│   └── e2e.test.ts      # Complete user workflows
└── helpers/        # Test utilities
    ├── testConfig.ts    # Configuration helpers
    └── testStorage.ts   # Token storage helpers
```

## Prerequisites

Integration tests require valid Yahoo API credentials and (for user auth tests) valid access tokens.

### Required Environment Variables

#### For All Tests
- `YAHOO_CLIENT_ID` - Your Yahoo Developer App Client ID
- `YAHOO_CLIENT_SECRET` - Your Yahoo Developer App Client Secret

#### For OAuth 2.0 User Auth Tests
- `YAHOO_REDIRECT_URI` - OAuth redirect URI (optional, defaults to 'oob')
- `YAHOO_ACCESS_TOKEN` - Valid access token
- `YAHOO_REFRESH_TOKEN` - Valid refresh token
- `YAHOO_TOKEN_EXPIRES_AT` - Token expiration timestamp (milliseconds)

#### For Resource Tests
- `TEST_LEAGUE_KEY` - A valid league key (e.g., "423.l.12345")
- `TEST_TEAM_KEY` - A valid team key (e.g., "423.l.12345.t.1")

### Optional Environment Variables
- `DEBUG=true` - Enable debug logging
- `SKIP_INTEGRATION_TESTS=true` - Skip all integration tests

## Running the Tests

### Run All Integration Tests
```bash
bun test tests/integration
```

### Run Specific Test Suites

#### OAuth Tests
```bash
bun test tests/integration/auth/oauth1.test.ts  # Public mode
bun test tests/integration/auth/oauth2.test.ts  # User auth mode
```

#### Resource Tests
```bash
bun test tests/integration/resources/league.test.ts
bun test tests/integration/resources/team.test.ts
```

#### Workflow Tests
```bash
bun test tests/integration/workflows/e2e.test.ts
```

## Test Categories

### 1. Authentication Tests (`auth/`)

#### OAuth 1.0 (Public Mode) - `oauth1.test.ts`
Tests public API access without user authorization:
- ✓ Client configuration
- ✓ Public endpoints (games, player search)
- ✓ Multiple concurrent requests
- ✓ Error handling

**Requirements:** `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`

#### OAuth 2.0 (User Auth) - `oauth2.test.ts`
Tests user authentication flow:
- ✓ Authorization URL generation
- ✓ Token management
- ✓ Token refresh
- ✓ Token storage integration
- ✓ Authenticated API access

**Requirements:** Valid OAuth tokens

### 2. Resource Tests (`resources/`)

#### League Resource - `league.test.ts`
Tests league-related operations:
- ✓ League metadata fetching
- ✓ League settings
- ✓ Standings retrieval
- ✓ Scoreboard access
- ✓ Team listings

**Requirements:** `TEST_LEAGUE_KEY`, valid tokens

#### Team Resource - `team.test.ts`
Tests team-related operations:
- ✓ Team metadata fetching
- ✓ Roster management
- ✓ Team statistics
- ✓ Matchup information

**Requirements:** `TEST_TEAM_KEY`, valid tokens

### 3. Workflow Tests (`workflows/`)

#### End-to-End - `e2e.test.ts`
Tests complete user workflows:
- ✓ Authentication flow
- ✓ User and league discovery
- ✓ Team management
- ✓ Player search and analysis
- ✓ League analysis
- ✓ Cross-resource data integrity
- ✓ Error recovery

**Requirements:** Valid tokens, optional league/team keys

## Setting Up for Testing

### 1. Create Yahoo Developer App
1. Go to [Yahoo Developer Network](https://developer.yahoo.com/apps/)
2. Create a new app
3. Note your Client ID and Client Secret

### 2. Get OAuth Tokens (for user auth tests)

#### Option A: Use Example Scripts
```bash
# Run authentication example
YAHOO_CLIENT_ID=your_id \
YAHOO_CLIENT_SECRET=your_secret \
YAHOO_REDIRECT_URI=oob \
bun run examples/hockey/01-authentication.ts
```

#### Option B: Use Test Token File
Create a `.test-tokens.json` file (git-ignored):
```json
{
  "accessToken": "your_access_token",
  "refreshToken": "your_refresh_token",
  "expiresAt": 1234567890123,
  "tokenType": "bearer",
  "expiresIn": 3600
}
```

### 3. Set Environment Variables

Create a `.env.test` file:
```bash
# Required for all tests
YAHOO_CLIENT_ID=your_client_id
YAHOO_CLIENT_SECRET=your_client_secret

# Required for OAuth 2.0 tests
YAHOO_ACCESS_TOKEN=your_access_token
YAHOO_REFRESH_TOKEN=your_refresh_token
YAHOO_TOKEN_EXPIRES_AT=1234567890123

# Optional for resource tests
TEST_LEAGUE_KEY=423.l.12345
TEST_TEAM_KEY=423.l.12345.t.1

# Optional
DEBUG=false
SKIP_INTEGRATION_TESTS=false
```

Load environment variables:
```bash
source .env.test
bun test tests/integration
```

## Test Behavior

### Conditional Execution
Tests automatically skip when:
- `SKIP_INTEGRATION_TESTS=true` is set
- Required credentials are missing
- Specific resource keys are not provided

### Network Requests
Integration tests make real API calls to Yahoo Fantasy Sports:
- **Rate Limiting:** Tests respect API rate limits
- **Retries:** Failed requests are retried automatically
- **Timeouts:** Default 30-second timeout per request

### Token Management
- Tests use real OAuth tokens
- Tokens are automatically refreshed when expired
- Token storage is tested with in-memory implementation

## Troubleshooting

### Tests Are Skipped
- Verify all required environment variables are set
- Check that tokens haven't expired
- Ensure Yahoo API credentials are valid

### Authentication Errors
- Tokens may have expired - regenerate them
- Check Client ID and Client Secret are correct
- Verify redirect URI matches your app settings

### API Errors
- Check Yahoo Fantasy API status
- Verify league/team keys are valid and accessible
- Ensure your Yahoo app has appropriate permissions

### Rate Limiting
- Tests may be rate-limited by Yahoo API
- Wait a few minutes and retry
- Consider running fewer tests concurrently

## Best Practices

1. **Don't commit credentials** - Use environment variables
2. **Use test accounts** - Don't use production leagues for testing
3. **Run periodically** - API behavior can change
4. **Monitor failures** - Integration test failures may indicate API changes
5. **Keep tokens fresh** - Regenerate test tokens regularly

## CI/CD Integration

For continuous integration:

```yaml
# Example GitHub Actions
env:
  YAHOO_CLIENT_ID: ${{ secrets.YAHOO_CLIENT_ID }}
  YAHOO_CLIENT_SECRET: ${{ secrets.YAHOO_CLIENT_SECRET }}
  YAHOO_ACCESS_TOKEN: ${{ secrets.YAHOO_ACCESS_TOKEN }}
  YAHOO_REFRESH_TOKEN: ${{ secrets.YAHOO_REFRESH_TOKEN }}
  YAHOO_TOKEN_EXPIRES_AT: ${{ secrets.YAHOO_TOKEN_EXPIRES_AT }}
  
steps:
  - name: Run Integration Tests
    run: bun test tests/integration
```

**Note:** Consider skipping integration tests in CI if tokens are unavailable:
```yaml
env:
  SKIP_INTEGRATION_TESTS: true
```

## Contributing

When adding new integration tests:
1. Follow existing patterns for test organization
2. Use `describe.skipIf()` for conditional execution
3. Add appropriate documentation
4. Handle missing credentials gracefully
5. Clean up any test data created
6. Update this README with new test information
