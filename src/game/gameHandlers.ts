import { Socket, Server } from "socket.io";
import { setPhase } from "./gameManager.ts";
import { GamePhase, NightSubstep } from "./types";
import { getGame, assignRoles } from "./gameManager.ts";

console.log("📦 gameHandlers.js loaded");

export default function registerGameHandlers(io: Server, socket: Socket) {
  console.log("📡 Game handlers registered");

  socket.on("joinGame", (lobbyId: string, cb) => {
    const game = getGame(lobbyId);
    if (!game || game.phase === "lobby")
      return socket.emit("joinError", "Game not found");
    cb(game);
  });

  socket.on(
    "changePhase",
    (lobbyId: string, phase: GamePhase, nightStep: NightSubstep, cb) => {
      console.log("Changing phase to:", phase, nightStep);
      setPhase(lobbyId, phase, nightStep);
      cb(getGame(lobbyId));
    }
  );

  socket.on("startGame", (lobbyId: string) => {
    assignRoles(lobbyId);
    setPhase(lobbyId, "night", null);
  });

  socket.on("foretellerSelected", (lobbyId: string, target: string) => {
    console.log("foreteller selected")
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[target];
    io.to(lobbyId).emit("foretellerReveal", player);
  });
}
