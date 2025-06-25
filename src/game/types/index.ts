export type Role = "werewolf" | "villager" | "witch" | "foreteller";

export type GamePhase = "lobby" | "night" | "voting" | "results" | "end";

export type NightSubstep = "foreteller" | "werewolves" | "witch" | null;

export type Player = {
  id: string;
  name: string;
  role: string;
  alive: boolean;
};

export type Game = {
  host: string | null;
  players: Record<string, Player>;
  phase: GamePhase;
  nightStep: NightSubstep
  roleCounts: RoleCounts;
  totalPlayers: number;
};

export type RoleCounts = Record<Role, number>;
