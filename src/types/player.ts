type Role = "werewolf" | "villager" | "witch" | "foreteller" | "unassigned";

export type Player = {
  id: string;
  name: string;
  role: Role;
  alive: boolean;
};
