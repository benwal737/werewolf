import { Socket, Server } from "socket.io";
import {
  createGame,
  addPlayer,
  removePlayer,
  getGame,
  getPlayers,
  getSafeGameState,
} from "./gameManager.ts";
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
      createGame(lobbyId, playerId, roleCounts, totalPlayers);
      const player: Player = {
        id: playerId,
        name: playerName,
        role: "villager",
        alive: true,
      };
      addPlayer(lobbyId, player);
      socket.join(lobbyId);
      socket.join(playerId);
      callback();
      const updatedGame = getSafeGameState(lobbyId);
      console.log("lobby created:", updatedGame);
      io.to(lobbyId).emit("lobbyUpdated", {
        gameState: updatedGame,
      });
    }
  );

  socket.on(
    "joinLobby",
    (
      lobbyId: string,
      playerId: string,
      playerName: string,
      callback: (gameState: ReturnType<typeof getSafeGameState>) => void
    ) => {
      const game = getGame(lobbyId);
      if (
        !game ||
        game.phase !== "lobby" ||
        getPlayers(lobbyId).length >= game.totalPlayers
      ) {
        return socket.emit("joinError");
      }

      if (!game.players[playerId]) {
        const player: Player = {
          id: playerId,
          name: playerName,
          role: "villager",
          alive: true,
        };
        addPlayer(lobbyId, player);
      }

      socket.join(lobbyId);
      socket.join(playerId);
      const updatedGame = getSafeGameState(lobbyId);
      console.log("lobby joined:", updatedGame);
      callback(updatedGame);
      io.to(lobbyId).emit("lobbyUpdated", {
        gameState: updatedGame,
      });
    }
  );

  socket.on("leaveLobby", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    socket.leave(lobbyId);
    io.to(lobbyId).emit("lobbyUpdated", {
      gameState: getSafeGameState(lobbyId),
    });
  });

  socket.on("kickPlayer", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    io.to(lobbyId).emit("lobbyUpdated", {
      gameState: getSafeGameState(lobbyId),
    });
    io.to(playerId).emit("kicked");
  });

  socket.on("checkLobby", (lobbyId, callback) => {
    const game = getGame(lobbyId);
    callback(
      !!game &&
        game.phase === "lobby" &&
        game.totalPlayers > getPlayers(lobbyId).length
    );
  });

  const countdowns = new Map<string, NodeJS.Timeout>();

  socket.on("startGameCountdown", (lobbyId: string) => {
    if (countdowns.has(lobbyId)) {
      return;
    }
    let timeLeft = 3;
    const interval = setInterval(() => {
      io.to(lobbyId).emit("startCountdown");
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
