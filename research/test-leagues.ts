// Test data for yahoo api calls

type LeagueDataSet = {
   leagueKey: string;
   leagueId: number;
   gameCode: string;
   gameId: number;
   name: string;
   url: string;
   season: string;
   private: boolean;
   owner: boolean;
   teamKey: string | undefined;
   teamId: number | undefined;
};

const leagues: LeagueDataSet[] = [
   {
      leagueKey: '465.l.30702',
      leagueId: 30702,
      gameCode: 'nhl',
      gameId: 465,
      name: 'SPCFHL 25-26',
      url: 'https://hockey.fantasysports.yahoo.com/hockey/30702',
      season: '2025',
      private: true,
      owner: true,
      teamKey: '465.l.30702.t.9',
      teamId: 9,
   },
   {
      leagueKey: '465.l.121384',
      leagueId: 121384,
      gameCode: 'nhl',
      gameId: 465,
      name: 'T4 Jinesjo 25-26',
      url: 'https://hockey.fantasysports.yahoo.com/hockey/121384',
      season: '2025',
      private: true,
      owner: true,
      teamKey: '465.l.121384.t.14',
      teamId: 14,
   },
   {
      leagueKey: '465.l.50894',
      leagueId: 50894,
      gameCode: 'nhl',
      gameId: 465,
      name: 'T1 Sweden 25-26',
      url: 'https://hockey.fantasysports.yahoo.com/hockey/50894',
      season: '2025',
      private: false,
      owner: false,
      teamKey: undefined,
      teamId: undefined,
   },
   {
      leagueKey: '465.l.121343',
      leagueId: 121343,
      gameCode: 'nhl',
      gameId: 465,
      name: 'T4 Linus 25-26',
      url: 'https://hockey.fantasysports.yahoo.com/hockey/121343',
      season: '2025',
      private: false,
      owner: false,
      teamKey: undefined,
      teamId: undefined,
   },
   {
      leagueKey: '466.l.260774',
      leagueId: 260774,
      gameCode: 'nba',
      gameId: 466,
      name: 'Yahoo High Score 260774',
      url: 'https://basketball.fantasysports.yahoo.com/nba/260774',
      season: '2025',
      private: true,
      owner: true,
      teamKey: '466.l.260774.t.8',
      teamId: 8,
   },
   {
      leagueKey: '469.l.230332',
      leagueId: 230332,
      gameCode: 'mlb',
      gameId: 469,
      name: 'Swing from the hills',
      url: 'https://baseball.fantasysports.yahoo.com/b1/230332',
      season: '2025',
      private: true,
      owner: true,
      teamKey: '469.l.230332.t.4',
      teamId: 4,
   },
];

export { leagues };
