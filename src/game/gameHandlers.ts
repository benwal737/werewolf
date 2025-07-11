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
  const handleForetellerPhase = (lobbyId: string) => {
    setPhase(lobbyId, "night", "werewolves");
    const game = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", game);

    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, "werewolves");
    });
  };

  const handleWerewolvesPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;

    let maxVotes = 0;
    let candidates: Player[] = [];

    for (const player of getPlayers(lobbyId)) {
      if (!player.alive || !player.numVotes) continue;
      if (player.numVotes > maxVotes) {
        maxVotes = player.numVotes;
        candidates = [player];
      } else if (player.numVotes === maxVotes && maxVotes > 0) {
        candidates.push(player);
      }
    }

    game.werewolfKill = candidates.length === 1 ? candidates[0] : undefined;

    // reset votes and check if witch alive
    let witchAlive = false;
    for (const player of getPlayers(lobbyId)) {
      if (player.alive && player.role === "witch") witchAlive = true;
      player.vote = undefined;
      player.numVotes = 0;
    }

    const hasWitch = game.roleCounts.witch > 0 && witchAlive;
    const step = hasWitch ? "witch" : "none";
    const phase: GamePhase = hasWitch ? "night" : "voting";

    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);

    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, step);
    });
  };

  const phaseHandlers: Record<NightSubstep, (lobbyId: string) => void> = {
    foreteller: handleForetellerPhase,
    werewolves: handleWerewolvesPhase,
    witch: () => {}, // need to add later
    none: () => {},
  };

  const nextPhase = (lobbyId: string, nightStep: NightSubstep) => {
    const handler = phaseHandlers[nightStep];
    if (handler) handler(lobbyId);
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
    setPhase(lobbyId, "start", "none");
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
