import { Socket, Server } from "socket.io";
import {
  createGame,
  addPlayer,
  removePlayer,
  getGame,
  getPlayers,
  getSafeGameState,
  findExistingGame,
} from "./gameManager";
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
      createGame(io, lobbyId, playerId, roleCounts, totalPlayers);
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
      const updated = getSafeGameState(lobbyId);
      console.log("lobby created:", updated);
      io.to(lobbyId).emit("gameUpdated", updated);
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
        (getPlayers(lobbyId).length >= game.totalPlayers &&
          !game.players[playerId])
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
      const updated = getSafeGameState(lobbyId);
      callback(updated);
      io.to(lobbyId).emit("playerJoined");
      io.to(lobbyId).emit("gameUpdated", updated);
    }
  );

  socket.on("leaveLobby", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    socket.leave(lobbyId);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("playerLeft");
    io.to(lobbyId).emit("gameUpdated", updated);
  });

  socket.on("kickPlayer", (lobbyId: string, playerId: string) => {
    removePlayer(lobbyId, playerId);
    const updated = getSafeGameState(lobbyId);
    io.to(playerId).emit("kicked");
    io.to(lobbyId).emit("gameUpdated", updated);
    io.to(lobbyId).emit("playerLeft");
  });

  socket.on("checkLobby", (lobbyId, playerId, callback) => {
    const game = getGame(lobbyId);
    callback(
      !!game &&
        game.phase === "lobby" &&
        (game.totalPlayers > getPlayers(lobbyId).length ||
          game.players[playerId])
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

  socket.on("checkExistingGame", (playerId, callback) => {
    const existingGame = findExistingGame(playerId);
    callback(existingGame);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
}
