import { Socket, Server } from "socket.io";
import {
  getGame,
  getSafeGameState,
  assignRoles,
  setPhase,
  getPlayers,
  startCountdown,
} from "./gameManager.ts";
import { GamePhase, NightSubstep, Player } from "./types/index.ts";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const nextPhase = (lobbyId: string, nightStep: NightSubstep) => {
    if (nightStep === "foreteller") {
      const phase = "night";
      const step = "werewolves";
      setPhase(lobbyId, phase, step);
      const game = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", game);
      startCountdown(io, lobbyId, 30, () => {
        nextPhase(lobbyId, step);
      });
    }
    if (nightStep === "werewolves") {
      const game = getGame(lobbyId);
      if (!game) return;

      let maxVotes = 0;
      let candidates: Player[] = [];

      for (const player of getPlayers(lobbyId)) {
        if (!player.alive) continue;
        if (!player.numVotes) continue;

        if (player.numVotes > maxVotes) {
          maxVotes = player.numVotes;
          candidates = [player];
        } else if (player.numVotes === maxVotes && maxVotes > 0) {
          candidates.push(player);
        }
      }

      // tied vote means no kill
      if (candidates.length === 1) {
        game.werewolfKill = candidates[0].id;
      } else {
        game.werewolfKill = undefined;
      }

      // reset and see if witch alive
      let witchAlive = false;
      for (const player of getPlayers(lobbyId)) {
        if (player.alive && player.role === "witch") witchAlive = true;
        player.vote = undefined;
        player.numVotes = 0;
      }
      let phase: GamePhase = "voting";
      let step: NightSubstep = null;
      if (game.roleCounts.witch > 0 && witchAlive) {
        phase = "night";
        step = "witch";
      }
      setPhase(lobbyId, phase, step);
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      startCountdown(io, lobbyId, 30, () => {
        nextPhase(lobbyId, step);
      });
    }
  };

  socket.on("joinGame", (lobbyId: string, playerId: string, cb) => {
    const game = getGame(lobbyId);
    if (!game || game.phase === "lobby")
      return socket.emit("joinError", "Game not found");

    socket.join(lobbyId);

    if (game.host === playerId && game.phase === "start") {
      if (game.roleCounts.foreteller > 0) {
        setPhase(lobbyId, "night", "foreteller");
        startCountdown(io, lobbyId, 30, () => {
          nextPhase(lobbyId, "foreteller");
        });
      } else {
        setPhase(lobbyId, "night", "werewolves");
        startCountdown(io, lobbyId, 30, () => {
          nextPhase(lobbyId, "werewolves");
        });
      }
    }
    const updated = getSafeGameState(lobbyId);
    console.log("sending back updated game");
    cb(updated);
  });

  socket.on("startGame", (lobbyId: string) => {
    assignRoles(lobbyId);
    setPhase(lobbyId, "start", null);
  });

  socket.on("foretellerSelected", (lobbyId: string, target: string) => {
    console.log("foreteller selected");
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[target];
    io.to(lobbyId).emit("foretellerReveal", player);
  });

  socket.on(
    "requestCountdown",
    (lobbyId: string, cb: (timeLeft: number | null) => void) => {
      const game = getGame(lobbyId);
      cb(game?.countdown ?? null);
    }
  );

  socket.on(
    "playerVoted",
    (lobbyId: string, playerId: string, targetId: string) => {
      const game = getGame(lobbyId);
      if (!game) return;
      const prev = game.players[playerId].vote;
      if (prev) {
        if (!game.players[prev].numVotes) return;
        game.players[prev].numVotes--;
      }
      game.players[playerId].vote = targetId;
      const targetVotes = game.players[targetId].numVotes;
      game.players[targetId].numVotes = targetVotes ? targetVotes + 1 : 1;
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
    }
  );

  socket.onAny((event, ...args) => {
    console.log("[Server socket event]:", event, args);
  });
}
