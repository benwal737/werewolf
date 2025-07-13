export type Role = "werewolf" | "villager" | "witch" | "foreteller";

export type GamePhase = "lobby" | "start" | "night" | "day" | "end";

export type Substep =
  | "foreteller"
  | "werewolves"
  | "witch"
  | "deaths"
  | "vote"
  | "results"
  | "none";

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
  nightStep: Substep;
  roleCounts: RoleCounts;
  totalPlayers: number;
  countdown?: number;
  interval?: NodeJS.Timeout;
  werewolfKill?: Player;
  witchSave?: Player;
  witchSaved?: boolean;
  witchKill?: Player;
  witchKilling?: boolean;
  witchKilled?: boolean;
  nightDeaths?: Player[];
  villageKill?: Player;
  winner?: "werewolves" | "villagers" | "draw";
};

export type RoleCounts = Record<Role, number>;
