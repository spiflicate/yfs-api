import { describe, expect, test } from 'bun:test';
import gameMlbFixture from '../../tests/fixtures/data/game-mlb.json';
import gameMlbMultipleFixture from '../../tests/fixtures/data/game-mlb-multiple.json';
import gameNbaFixture from '../../tests/fixtures/data/game-nba.json';
import gameNbaMultipleFixture from '../../tests/fixtures/data/game-nba-multiple.json';
import gameNflFixture from '../../tests/fixtures/data/game-nfl.json';
import gameNflMultipleFixture from '../../tests/fixtures/data/game-nfl-multiple.json';
import gameNhlFixture from '../../tests/fixtures/data/game-nhl.json';
import gameNhlMultipleFixture from '../../tests/fixtures/data/game-nhl-multiple.json';
import leagueFixture from '../../tests/fixtures/data/league-nhl-l-121384.json';
import leagueScoreboardFixture from '../../tests/fixtures/data/league-nhl-l-121384-scoreboard.json';
import leagueSettingsFixture from '../../tests/fixtures/data/league-nhl-l-121384-settings.json';
import leagueStandingsFixture from '../../tests/fixtures/data/league-nhl-l-121384-standings.json';
import leagueTransactionsFixture from '../../tests/fixtures/data/league-nhl-l-121384-transactions.json';
import playerFixture from '../../tests/fixtures/data/player-465-p-7147.json';
import playerOwnershipFixture from '../../tests/fixtures/data/player-465-p-7147-ownership.json';
import playerStatsFixture from '../../tests/fixtures/data/player-465-p-7147-stats.json';
import teamFixture from '../../tests/fixtures/data/team-nhl-l-121384-t-14.json';
import teamMatchupsFixture from '../../tests/fixtures/data/team-nhl-l-121384-t-14-matchups.json';
import teamRosterFixture from '../../tests/fixtures/data/team-nhl-l-121384-t-14-roster.json';
import teamStatsFixture from '../../tests/fixtures/data/team-nhl-l-121384-t-14-stats.json';
import userCurrentFixture from '../../tests/fixtures/data/user-current.json';
import userGamesFixture from '../../tests/fixtures/data/user-games.json';
import userTeamsFixture from '../../tests/fixtures/data/user-teams.json';
import type {
   YahooGameDto,
   YahooLeagueDto,
   YahooLeagueWithScoreboardDto,
   YahooLeagueWithSettingsDto,
   YahooLeagueWithStandingsDto,
   YahooLeagueWithTransactionsDto,
   YahooLoggedInUserDto,
   YahooPlayerDto,
   YahooPlayerWithOwnershipDto,
   YahooPlayerWithStatsDto,
   YahooRosterUpdateConfirmationDto,
   YahooTeamDto,
   YahooTeamWithMatchupsDto,
   YahooTeamWithRosterDto,
   YahooTeamWithStatsDto,
} from '../index.js';

/*
Fixture matrix (sanitized in place):
| Family | Selected fixtures |
| game | game-{nhl,nfl,mlb,nba}.json; game-{nhl,nfl,mlb,nba}-multiple.json |
| league | league-nhl-l-121384.json; -settings.json; -standings.json; -scoreboard.json |
| team | team-nhl-l-121384-t-14.json; -roster.json; -stats.json; -matchups.json |
| player | player-465-p-7147.json; -stats.json; -ownership.json |
| user | user-current.json; user-games.json; user-teams.json |
| transaction | league-nhl-l-121384-transactions.json |
*/

const typed = <T>(value: T): T => value;

describe('normalized Yahoo DTO fixture contracts', () => {
   test('covers singular and expanded games for all four sports', () => {
      const singular = [
         typed<YahooGameDto>(gameNhlFixture),
         typed<YahooGameDto>(gameNflFixture),
         typed<YahooGameDto>(gameMlbFixture),
         typed<YahooGameDto>(gameNbaFixture),
      ];
      const expanded = [
         typed<YahooGameDto>(gameNhlMultipleFixture),
         typed<YahooGameDto>(gameNflMultipleFixture),
         typed<YahooGameDto>(gameMlbMultipleFixture),
         typed<YahooGameDto>(gameNbaMultipleFixture),
      ];

      expect(singular.map((game) => game.code)).toEqual([
         'nhl',
         'nfl',
         'mlb',
         'nba',
      ]);
      expect(
         singular.every((game) => typeof game.gameId === 'number'),
      ).toBe(true);
      expect(singular[2]?.isGameOver).toBe(true);
      expect(singular[2]?.alternateStartDeadline).toBe('2025-03-26');
      expect(expanded.every((game) => Array.isArray(game.players))).toBe(
         true,
      );
      expect(
         expanded.every((game) =>
            Array.isArray(game.statCategories?.stats),
         ),
      ).toBe(true);
      expect(
         expanded.every((game) => Array.isArray(game.positionTypes)),
      ).toBe(true);
      expect(expanded[0]?.players?.[0]?.isKeeper.cost).toBe('');
   });

   test('preserves league subresources at their observed nesting', () => {
      const league = typed<YahooLeagueDto>(leagueFixture);
      const settings = typed<YahooLeagueWithSettingsDto>(
         leagueSettingsFixture,
      );
      const standings = typed<YahooLeagueWithStandingsDto>(
         leagueStandingsFixture,
      );
      const scoreboard = typed<YahooLeagueWithScoreboardDto>(
         leagueScoreboardFixture,
      );

      expect(league.numTeams).toBe(14);
      expect(league.renew).toBe('');
      expect(settings.settings.usesPlayoff).toBe(true);
      expect(settings.settings.rosterPositions).toBeArray();
      expect(settings.settings.weekHasEnoughQualifyingDays.week12).toBe(
         false,
      );
      expect(standings.standings.teams).toBeArray();
      expect(
         standings.standings.teams[0]?.teamPoints.stats?.[0]?.value,
      ).toBe('');
      expect(scoreboard.scoreboard.matchups).toBeArray();
      expect(
         scoreboard.scoreboard.matchups[0]?.statWinners?.[0]?.isTied,
      ).toBe(true);
      expect(
         scoreboard.scoreboard.matchups[0]?.teams[0]?.teamRemainingGames
            .total.liveGames,
      ).toBe(0);
   });

   test('preserves team roster, stats, and matchup variants', () => {
      const team = typed<YahooTeamDto>(teamFixture);
      const roster = typed<YahooTeamWithRosterDto>(teamRosterFixture);
      const stats = typed<YahooTeamWithStatsDto>(teamStatsFixture);
      const matchups = typed<YahooTeamWithMatchupsDto>(teamMatchupsFixture);

      expect(team.managers).toBeArray();
      expect(team.hasDraftGrade).toBe(false);
      expect(roster.roster.players).toBeArray();
      expect(roster.roster.isEditable).toBe(true);
      expect(
         roster.roster.players[0]?.eligiblePositions.position,
      ).toBeArray();
      expect(stats.teamStats.stats[0]?.value).toBeNumber();
      expect(stats.teamPoints?.stats?.[0]?.value).toBe('');
      expect(matchups.matchups).toBeArray();
      expect(matchups.matchups[0]?.teams).toHaveLength(2);
      expect(matchups.matchups[0]?.isTied).toBe(false);
   });

   test('preserves player metadata, mixed stat values, and empty ownership', () => {
      const player = typed<YahooPlayerDto>(playerFixture);
      const stats = typed<YahooPlayerWithStatsDto>(playerStatsFixture);
      const ownership = typed<YahooPlayerWithOwnershipDto>(
         playerOwnershipFixture,
      );

      expect(player.eligiblePositions.position).toBeArray();
      expect(player.eligiblePositionsToAdd).toBe('');
      expect(player.hasPlayerNotes).toBe(true);
      expect(
         stats.playerStats.stats.some(
            (stat) => typeof stat.value === 'string',
         ),
      ).toBe(true);
      expect(
         stats.playerStats.stats.some(
            (stat) => typeof stat.value === 'number',
         ),
      ).toBe(true);
      expect(stats.playerAdvancedStats?.stats).toBeArray();
      expect(ownership.ownership).toBe('');
   });

   test('preserves logged-in user game and team collections', () => {
      const current = typed<YahooLoggedInUserDto[]>(userCurrentFixture);
      const games = typed<YahooLoggedInUserDto[]>(userGamesFixture);
      const teams = typed<YahooLoggedInUserDto[]>(userTeamsFixture);

      expect(current).toHaveLength(1);
      expect(games[0]?.games).toBeArray();
      expect(games[0]?.games?.some((game) => game.code === 'nba')).toBe(
         true,
      );
      expect(teams[0]?.games?.[0]?.teams).toBeArray();
      expect(teams[0]?.games?.[0]?.teams?.[0]?.numberOfTrades).toBeNumber();
   });

   test('preserves transaction collections nested on league reads', () => {
      const league = typed<YahooLeagueWithTransactionsDto>(
         leagueTransactionsFixture,
      );

      expect(league.transactions).toBeArray();
      expect(league.transactions[0]?.transactionId).toBeNumber();
      expect(league.transactions[0]?.players).toBeArray();
      expect(
         league.transactions[0]?.players?.[0]?.transactionData
            .destinationType,
      ).toBe('waivers');
   });

   test('represents the probed roster update success confirmation', () => {
      const response = typed<YahooRosterUpdateConfirmationDto>({
         confirmation: { status: 'success' },
      });

      expect(response.confirmation.status).toBe('success');
      expect(Object.keys(response)).toEqual(['confirmation']);
   });
});
