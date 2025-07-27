import { GameState, Player } from "@/game/types";
import { clickSound } from "@/utils/sounds";
import { Socket } from "socket.io-client";
import { ParamValue } from "next/dist/server/request/params";

const usePlayerAction = (
  socket: Socket,
  lobbyId: ParamValue,
  playerId: string | null,
  target: Player,
  player: Player | null,
  gameState: GameState | null,
  witchSelected: boolean,
  setWitchSelected: (value: boolean) => void
) => {
  const isForeteller = player?.role === "foreteller";
  const foretellerTurn = gameState?.substep === "foreteller";
  const isWerewolf = player?.role === "werewolf";
  const werewolfTurn = gameState?.substep === "werewolves";
  const voteStep = gameState?.substep === "vote";
  const isWitch = player?.role === "witch";
  const witchTurn = gameState?.substep === "witch";

  const foretellerAction = (target: Player) => {
    if (gameState?.foretellerRevealed) return;
    clickSound();
    socket.emit("foretellerSelected", lobbyId, target.id);
  };

  const voteAction = (target: Player) => {
    clickSound();
    socket.emit("playerVoted", lobbyId, playerId, target.id);
  };

  const witchAction = (target: Player) => {
    if (witchSelected) return;
    clickSound();
    socket.emit("witchKilled", lobbyId, target.id);
    setWitchSelected(true);
  };

  if (!player?.alive) return undefined;
  if (target.id == null || !gameState?.players[target.id].alive)
    return undefined;
  if (foretellerTurn && isForeteller) {
    return () => foretellerAction(target);
  } else if ((werewolfTurn && isWerewolf) || voteStep) {
    return () => voteAction(target);
  } else if (witchTurn && isWitch) {
    return () => witchAction(target);
  } else {
    return undefined;
  }
};

export default usePlayerAction;
