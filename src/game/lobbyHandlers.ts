import { Socket, Server } from "socket.io";
import { createGame, addPlayer, removePlayer, getGame } from "./gameManager.ts";
import { Player, RoleCounts } from "./types";

export default function registerLobbyHandlers(io: Server, socket: Socket) {
  socket.on(
    "createLobby",
    (
      lobbyId: string,
      playerId: string,
      playerName: string,
      roleCounts: RoleCounts,
      totalPlayers: number,
      callback: () => void
    ) => {
      if (
        roleCounts.werewolf < 1 ||
        roleCounts.villager < 1 ||
        roleCounts.witch > 1 ||
        roleCounts.foreteller > 1
      ) {
        return;
      }
      const game = createGame(lobbyId, playerId, roleCounts, totalPlayers);
      const player: Player = {
        id: playerId,
        name: playerName,
        role: "unassigned",
        alive: true,
      };
      addPlayer(lobbyId, player);
      socket.join(lobbyId);
      socket.join(playerId);
      callback();
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
      if (!game) return;

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
        players: game.players,
        host: game.host,
        totalPlayers: game.totalPlayers,
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
    console.log("checking lobby");
    const game = getGame(lobbyId);
    callback(!!game && game.phase === "lobby");
  });

  const countdowns = new Map<string, NodeJS.Timeout>();

  socket.on("startGameCountdown", (lobbyId: string) => {
    if (countdowns.has(lobbyId)) {
      console.log("countdown already started in lobby");
      return;
    }
    let timeLeft = 5;
    const interval = setInterval(() => {
      io.to(lobbyId).emit("countdownTick", timeLeft);
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(interval);
        countdowns.delete(lobbyId);
        io.to(lobbyId).emit("countdownComplete");
      }
    }, 1000);
    countdowns.set(lobbyId, interval);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
}
