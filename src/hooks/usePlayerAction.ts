import { GameState, Player } from "@/game/types";
import { clickSound } from "@/utils/sounds";
import { Socket } from "socket.io-client";
import { ParamValue } from "next/dist/server/request/params";

const usePlayerAction = (
  socket: Socket,
  lobbyId: ParamValue,
  target: Player,
  user: Player,
  gameState: GameState,
  witchSelected: boolean,
  setWitchSelected: (value: boolean) => void
) => {
  const isForeteller = user.role === "foreteller";
  const foretellerTurn = gameState.substep === "foreteller";
  const isWerewolf = user.role === "werewolf";
  const werewolfTurn = gameState.substep === "werewolves";
  const voteStep = gameState.substep === "vote";
  const isWitch = user.role === "witch";
  const witchTurn = gameState?.substep === "witch";

  const foretellerAction = (target: Player) => {
    if (gameState?.foretellerRevealed) return;
    if (target.id === user.id) return;
    clickSound();
    socket.emit("foretellerSelected", lobbyId, target.id);
  };

  const voteAction = (target: Player) => {
    socket.emit("playerVoted", lobbyId, user.id, target.id);
  };

  const witchAction = (target: Player) => {
    if (witchSelected) return;
    clickSound();
    socket.emit("witchKilled", lobbyId, target.id);
    setWitchSelected(true);
  };

  if (!user?.alive) return undefined;
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
