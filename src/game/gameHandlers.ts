import { Socket, Server } from "socket.io";
import { setPhase } from "./gameManager.ts";
import { Player, RoleCounts, GamePhase } from "./types";
import { getGame, assignRoles } from "./gameManager.ts";

console.log("📦 gameHandlers.js loaded");

export default function registerGameHandlers(io: Server, socket: Socket) {
  console.log("📡 Game handlers registered");

  socket.on("joinGame", (lobbyId: string, cb) => {
    const game = getGame(lobbyId);
    if (!game || game.phase === "lobby") return socket.emit("joinError", "Game not found");
    cb(game);
  });

  socket.on("changePhase", (lobbyId: string, phase: GamePhase) => {
    setPhase(lobbyId, phase);
    io.to(lobbyId).emit("updateGamePhase", phase);
  });

  socket.on("startGame", (lobbyId: string) => {
    assignRoles(lobbyId);
    setPhase(lobbyId, "start");
  });
}
