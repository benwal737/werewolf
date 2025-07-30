import { GameState, Player } from "@/game/types";

export const isLoser = (
  gameState: GameState,
  player: Player | null
): boolean => {
  if (!player) return false;
  return (
    (gameState.winner === "villagers" && player?.role === "werewolf") ||
    (gameState.winner === "werewolves" && player?.role !== "werewolf")
  );
};

export const isWinner = (
  gameState: GameState,
  player: Player | null
): boolean => {
  if (!player) return false;
  return (
    (gameState.winner === "villagers" && player?.role !== "werewolf") ||
    (gameState.winner === "werewolves" && player?.role === "werewolf")
  );
};
