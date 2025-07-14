import { Socket, Server } from "socket.io";
import {
  getGame,
  getSafeGameState,
  assignRoles,
  setPhase,
  getPlayers,
  startCountdown,
  setNightDeaths,
  checkWinner,
  countVotes,
  setDayDeaths,
  resetNightDeaths,
} from "./gameManager.ts";
import { GamePhase, Substep } from "./types/index.ts";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const resolveForetellerPhase = (lobbyId: string) => {
    setPhase(lobbyId, "night", "werewolves");
    const game = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", game);
    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, "werewolves");
    });
  };

  const resolveWerewolvesPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;

    const candidates = countVotes(lobbyId);
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
    const phase: GamePhase = hasWitch ? "night" : "day";

    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, step);
    });
  };

  const resolveWitchPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    game.witchKilling = false;
    const step = "deaths";
    const phase: GamePhase = "day";
    setNightDeaths(lobbyId);
    game.witchSave = undefined;
    game.witchKill = undefined;
    checkWinner(lobbyId);
    if (game.winner) {
      setPhase(lobbyId, "end", "none");
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      return;
    } else {
      setPhase(lobbyId, phase, step);
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      startCountdown(io, lobbyId, 10, () => {
        nextPhase(lobbyId, step);
      });
    }
  };

  const resolveDeathsPhase = (lobbyId: string) => {
    resetNightDeaths(lobbyId);
    const step = "vote";
    const phase: GamePhase = "day";
    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, step);
    });
  };

  const resolveVotePhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    const step = "results";
    const phase: GamePhase = "day";

    const candidates = countVotes(lobbyId);
    game.villageKill = candidates.length === 1 ? candidates[0] : undefined;

    // reset votes
    for (const player of getPlayers(lobbyId)) {
      player.vote = undefined;
      player.numVotes = 0;
    }
    setDayDeaths(lobbyId);
    checkWinner(lobbyId);
    if (game.winner) {
      setPhase(lobbyId, "end", "none");
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      return;
    } else {
      setPhase(lobbyId, phase, step);
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      startCountdown(io, lobbyId, 10, () => {
        nextPhase(lobbyId, step);
      });
    }
  };

  const resolveResultsPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    game.villageKill = undefined;
    let step: Substep;
    let phase: GamePhase;

    if (
      game.roleCounts.foreteller > 0 &&
      getPlayers(lobbyId).some(
        (player) => player.role === "foreteller" && player.alive
      )
    ) {
      step = "foreteller";
      phase = "night";
    } else {
      step = "werewolves";
      phase = "night";
    }

    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, 30, () => {
      nextPhase(lobbyId, step);
    });
  };

  const phaseResolvers: Record<Substep, (lobbyId: string) => void> = {
    foreteller: resolveForetellerPhase,
    werewolves: resolveWerewolvesPhase,
    witch: resolveWitchPhase,
    deaths: resolveDeathsPhase,
    vote: resolveVotePhase,
    results: resolveResultsPhase,
    none: () => {},
  };

  const nextPhase = (lobbyId: string, nightStep: Substep) => {
    const resolver = phaseResolvers[nightStep];
    if (resolver) resolver(lobbyId);
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
        if (prev === targetId) {
          game.players[playerId].vote = undefined;
        }
      }
      if (!prev || prev !== targetId) {
        game.players[playerId].vote = targetId;
        const targetVotes = game.players[targetId].numVotes;
        game.players[targetId].numVotes = targetVotes ? targetVotes + 1 : 1;
      }
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
    }
  );

  socket.on("witchSave", (lobbyId: string, playerId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[playerId];
    game.witchSave = player;
    game.witchSaved = true;
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
  });

  socket.on("witchKilling", (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    game.witchKilling = true;
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
  });

  socket.on("witchKilled", (lobbyId: string, targetId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[targetId];
    game.witchKill = player;
    game.witchKilled = true;
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
  });

  socket.onAny((event, ...args) => {
    console.log("[Server socket event]:", event, args);
  });
}
