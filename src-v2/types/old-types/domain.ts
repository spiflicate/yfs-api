export type Manager = {
  id: string;
  nickname: string;
};

export type Standing = {
  rank: number;
  points: number;
};

export type TeamBase = {
  id: string;
  name: string;
};

export type PlayerBase = {
  id: string;
  name: string;
  position: string;
};

export type MatchupBase = {
  id: string;
  week: number;
};
