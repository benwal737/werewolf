import { Socket, Server } from "socket.io";
import { createGame, addPlayer, removePlayer, getGame } from "./gameManager.ts";
import { Player } from "./types";

console.log("📦 lobbyHandlers.js loaded");

export default function registerLobbyHandlers(io: Server, socket: Socket) {
  console.log("📡 Lobby handlers registered");
  socket.on(
    "createLobby",
    (lobbyId: string, playerId: string, playerName: string) => {
      console.log("creating lobby")
      const game = createGame(lobbyId, playerId);
      const player: Player = {
        id: playerId,
        name: playerName,
        role: "unassigned",
        alive: true,
      };
      addPlayer(lobbyId, player);
      socket.join(lobbyId);
      socket.join(playerId);
      io.to(lobbyId).emit("playerJoined", {
        players: getGame(lobbyId)?.players,
        host: game.host,
      });
    }
  );

  socket.on(
    "joinLobby",
    (lobbyId: string, playerId: string, playerName: string) => {
      const game = getGame(lobbyId);
      if (!game) return socket.emit("joinError", "Lobby not found");

      if (!game.players[playerId]) {
        const player: Player = {
          id: playerId,
          name: playerName,
          role: "unassigned",
          alive: true,
        };
        addPlayer(lobbyId, player);
      }

      socket.join(lobbyId);
      socket.join(playerId);
      io.to(lobbyId).emit("playerJoined", {
        players: getGame(lobbyId)?.players,
        host: game.host,
      });
    }
  );

  socket.on("leaveLobby", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    socket.leave(lobbyId);
    io.to(lobbyId).emit("playerJoined", {
      players: getGame(lobbyId)?.players,
      host: getGame(lobbyId)?.host,
    });
  });

  socket.on("kickPlayer", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    io.to(lobbyId).emit("playerJoined", {
      players: getGame(lobbyId)?.players,
      host: getGame(lobbyId)?.host,
    });
    io.to(playerId).emit("kicked");
  });

  socket.on("checkLobby", (lobbyId, callback) => {
    console.log("checking lobby")
    const game = getGame(lobbyId);
    callback(!!game && game.phase === "lobby");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
}
