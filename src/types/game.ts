import { Player } from "./player";

type GamePhase = "lobby" | "night" | "day" | "end";

type GameState = {
  host: Player;
  players: Player[]
  phase: GamePhase;


};
