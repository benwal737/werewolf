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
  role: Role;
  alive: boolean;
  vote?: string | "skip";
  numVotes?: number;
  color?: string;
};

export type Message = {
  id: string;
  text: string;
  sender: Player;
};

export type GameState = {
  host: string | null;
  players: Record<string, Player>;
  phase: GamePhase;
  substep: Substep;
  roleCounts: RoleCounts;
  totalPlayers: number;
  countdown?: number;
  interval?: NodeJS.Timeout;
  foretellerRevealed?: Player;
  werewolfKill?: Player;
  witchSave?: Player;
  witchSaved?: boolean;
  witchKill?: Player;
  witchKilling?: boolean;
  witchKilled?: boolean;
  witchSkipped?: boolean;
  nightDeaths?: Player[];
  villageKill?: Player;
  winner?: "werewolves" | "villagers" | "draw";
  dayNum: number;
  gameChat: Message[];
  werewolfChat: Message[];
  deadChat: Message[];
};

export type RoleCounts = Record<Role, number>;
