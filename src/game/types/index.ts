export type Role = "werewolf" | "villager" | "witch" | "foreteller";

export type GamePhase =
  | "lobby"
  | "start"
  | "night"
  | "voting"
  | "results"
  | "end";

export type NightSubstep = "foreteller" | "werewolves" | "witch" | "none";

export type Player = {
  id: string;
  name: string;
  role: string;
  alive: boolean;
  vote?: string;
  numVotes?: number;
};

export type Game = {
  host: string | null;
  players: Record<string, Player>;
  phase: GamePhase;
  nightStep: NightSubstep;
  roleCounts: RoleCounts;
  totalPlayers: number;
  countdown?: number;
  interval?: NodeJS.Timeout;
  werewolfKill?: Player;
  witchSave?: Player;
  witchKill?: Player;
  witchKilling?: boolean;
};

export type RoleCounts = Record<Role, number>;
