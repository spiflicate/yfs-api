# API Coverage Matrix

This document tracks the implementation status of Yahoo Fantasy Sports API features.

Legend:
- ✅ Implemented
- 🚧 In Progress
- 📋 Planned
- ⏸️ Deferred
- ❌ Not Planned

---

## Resources

| Resource | GET | POST | PUT | DELETE | Priority | Status | Notes |
|----------|-----|------|-----|--------|----------|--------|-------|
| Game | 📋 | N/A | N/A | N/A | High | Planned | Metadata only |
| League | 📋 | N/A | N/A | N/A | High | Planned | Read-only |
| Team | 📋 | N/A | 📋 | N/A | High | Planned | PUT for roster |
| Player | 📋 | N/A | N/A | N/A | High | Planned | Read-only |
| Roster | 📋 | N/A | 📋 | N/A | High | Planned | Roster management |
| Transaction | 📋 | 📋 | 📋 | 📋 | High | Planned | Full CRUD |
| User | 📋 | N/A | N/A | N/A | High | Planned | Read-only |

---

## Sub-Resources

### Game Sub-Resources

| Sub-Resource | Implemented | Sport Support | Notes |
|--------------|-------------|---------------|-------|
| metadata | 📋 | All | Basic game info |
| leagues | 📋 | All | User's leagues in game |
| players | ⏸️ | All | Deferred to v0.3+ |
| game_weeks | 📋 | NFL | NFL only |
| stat_categories | 📋 | All | Scoring rules |
| position_types | 📋 | All | Valid positions |

### League Sub-Resources

| Sub-Resource | Implemented | Sport Support | Notes |
|--------------|-------------|---------------|-------|
| metadata | 📋 | All | League info |
| settings | 📋 | All | League settings |
| standings | 📋 | All | Current standings |
| scoreboard | 📋 | All | Week/date scores |
| teams | 📋 | All | Teams in league |
| players | 📋 | All | Player search |
| draftresults | ⏸️ | All | Deferred to v0.2+ |
| transactions | 📋 | All | Transaction history |

### Team Sub-Resources

| Sub-Resource | Implemented | Sport Support | Notes |
|--------------|-------------|---------------|-------|
| metadata | 📋 | All | Team info |
| stats | 📋 | All | Team stats |
| standings | 📋 | All | Team standing |
| roster | 📋 | All | Current roster |
| roster/{week} | 📋 | NFL | NFL specific |
| roster/{date} | 📋 | NHL/MLB/NBA | Date-based |
| matchups | 📋 | All | Team matchups |
| draftresults | ⏸️ | All | Deferred to v0.2+ |

### Player Sub-Resources

| Sub-Resource | Implemented | Sport Support | Notes |
|--------------|-------------|---------------|-------|
| metadata | 📋 | All | Player info |
| stats | 📋 | All | Player stats |
| ownership | 📋 | All | Ownership % |
| percent_owned | 📋 | All | League specific |
| draft_analysis | ⏸️ | All | Deferred to v0.2+ |

### Transaction Sub-Resources

| Sub-Resource | Implemented | Sport Support | Notes |
|--------------|-------------|---------------|-------|
| metadata | 📋 | All | Transaction details |
| players | 📋 | All | Players involved |

---

## Filters & Parameters

### Player Collection Filters

| Filter | Resources | NHL | NFL | MLB | NBA | Status | Notes |
|--------|-----------|-----|-----|-----|-----|--------|-------|
| position | players | 📋 | 📋 | 📋 | 📋 | Planned | Sport-specific |
| status | players | 📋 | 📋 | 📋 | 📋 | Planned | A/FA/W/T/K |
| search | players | 📋 | 📋 | 📋 | 📋 | Planned | Name search |
| sort | players | 📋 | 📋 | 📋 | 📋 | Planned | By stat |
| sort_type | players | 📋 | 📋 | 📋 | 📋 | Planned | season/date/week |
| start | players | 📋 | 📋 | 📋 | 📋 | Planned | Pagination |
| count | players | 📋 | 📋 | 📋 | 📋 | Planned | Limit |

### Game Collection Filters

| Filter | Status | Notes |
|--------|--------|-------|
| is_available | 📋 | Current season only |
| game_types | 📋 | full/pickem-team/etc |
| game_codes | 📋 | nfl/nhl/mlb/nba |
| seasons | 📋 | Year filter |

### Transaction Collection Filters

| Filter | Status | Notes |
|--------|--------|-------|
| type | 📋 | add/drop/trade/commish |
| types | 📋 | Multiple types |
| team_key | 📋 | Team specific |
| count | 📋 | Limit results |

---

## Sport-Specific Features

### NHL (Hockey) 🏒

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Positions (C/LW/RW/D/G) | 📋 | High | v0.1.0 |
| Bench (BN) | 📋 | High | v0.1.0 |
| Injured Reserve (IR/IR+) | 📋 | High | v0.1.0 |
| Date-based roster | 📋 | High | v0.1.0 |
| Daily stats | 📋 | Medium | v0.1.0 |
| Goalie stats | 📋 | Medium | v0.1.0 |

### NFL (Football) 🏈

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Positions (QB/RB/WR/TE/K/DEF) | 📋 | Medium | v0.3.0 |
| Flex positions (W/R/T) | 📋 | Medium | v0.3.0 |
| Week-based roster | 📋 | Medium | v0.3.0 |
| Weekly stats | 📋 | Medium | v0.3.0 |
| Projected stats | 📋 | Low | v0.3.0 |

### MLB (Baseball) ⚾

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Positions (C/1B/2B/SS/3B/OF) | 📋 | Medium | v0.3.0 |
| Pitcher positions (SP/RP/P) | 📋 | Medium | v0.3.0 |
| DL (Disabled List) | 📋 | Medium | v0.3.0 |
| Date-based roster | 📋 | Medium | v0.3.0 |
| Daily stats | 📋 | Medium | v0.3.0 |

### NBA (Basketball) 🏀

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Positions (PG/SG/SF/PF/C) | 📋 | Medium | v0.3.0 |
| Utility positions | 📋 | Medium | v0.3.0 |
| IL (Injured List) | 📋 | Medium | v0.3.0 |
| Date-based roster | 📋 | Medium | v0.3.0 |
| Daily stats | 📋 | Medium | v0.3.0 |

---

## Transaction Types

| Type | GET | POST | PUT | DELETE | Status | Priority |
|------|-----|------|-----|--------|--------|----------|
| Add/Drop | 📋 | 📋 | N/A | N/A | Planned | High |
| Waiver Claim | 📋 | 📋 | 📋 | 📋 | Planned | High |
| Trade (Propose) | 📋 | 📋 | N/A | 📋 | Planned | Medium |
| Trade (Accept) | 📋 | N/A | 📋 | N/A | Planned | Medium |
| Trade (Reject) | 📋 | N/A | 📋 | N/A | Planned | Medium |
| Trade (Vote) | 📋 | N/A | 📋 | N/A | Planned | Low |
| Commissioner | 📋 | 📋 | 📋 | N/A | Planned | Low |

---

## Authentication

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| OAuth 2.0 Flow | 📋 | High | Three-legged |
| Token Storage | 📋 | High | Secure storage |
| Token Refresh | 📋 | High | Auto-refresh |
| 2-Legged OAuth | ⏸️ | Low | Public data only |

---

## Performance Features

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Request Retry | 📋 | High | Exponential backoff |
| Rate Limiting | 📋 | High | Prevent 429s |
| Request Caching | ⏸️ | Medium | v0.2.0 |
| Batch Requests | ⏸️ | Low | v0.4.0 |
| Request Dedup | ⏸️ | Low | v0.4.0 |

---

## Error Handling

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Custom Error Types | 📋 | High | YahooApiError, etc |
| HTTP Status Codes | 📋 | High | Proper error mapping |
| Validation Errors | 📋 | High | Client-side validation |
| Network Errors | 📋 | High | Timeout, connection |
| Auth Errors | 📋 | High | 401, token expired |

---

## Updates

**2024-11-15**: Initial coverage matrix created. All items marked as "Planned" for v0.1.0 (NHL MVP) or later versions.

---

*Last Updated: 2024-11-15*
