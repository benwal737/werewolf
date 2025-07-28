import { Socket, Server } from "socket.io";
import {
  getGame,
  getSafeGameState,
  assignRolesAndColors,
  setPhase,
  getPlayers,
  startCountdown,
  setNightDeaths,
  isWinner,
  countVotes,
  setDayDeaths,
  resetNightDeaths,
} from "./gameManager.ts";
import { GamePhase, Substep } from "./types/index.ts";

const FORETELLER_TIME = 20;
const WEREWOLVES_TIME = 20;
const WITCH_TIME = 20;
const DEATHS_TIME = 10;
const VOTE_TIME = 20;
const RESULTS_TIME = 10;

export default function registerGameHandlers(io: Server, socket: Socket) {
  const resolveForetellerPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;
    game.foretellerRevealed = false;
    setPhase(lobbyId, "night", "werewolves");
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, WEREWOLVES_TIME, () => {
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

    const step = witchAlive ? "witch" : "deaths";
    const time = witchAlive ? WITCH_TIME : DEATHS_TIME;
    const phase: GamePhase = witchAlive ? "night" : "day";

    if (!witchAlive) {
      setNightDeaths(lobbyId);
      const winner = isWinner(lobbyId, io);
      if (winner) return;
    }
    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, time, () => {
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
    const winner = isWinner(lobbyId, io);
    if (winner) return;
    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, DEATHS_TIME, () => {
      nextPhase(lobbyId, step);
    });
  };

  const resolveDeathsPhase = (lobbyId: string) => {
    resetNightDeaths(lobbyId);
    const step = "vote";
    const phase: GamePhase = "day";
    setPhase(lobbyId, phase, step);
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, VOTE_TIME, () => {
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

    setDayDeaths(lobbyId);
    for (const player of getPlayers(lobbyId)) {
      if (player.vote !== "skip") player.vote = undefined;
    }

    const winner = isWinner(lobbyId, io);
    if (!winner) {
      setPhase(lobbyId, phase, step);
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
      startCountdown(io, lobbyId, RESULTS_TIME, () => {
        nextPhase(lobbyId, step);
      });
    }
  };

  const resolveResultsPhase = (lobbyId: string) => {
    const game = getGame(lobbyId);
    if (!game) return;

    game.villageKill = undefined;
    for (const player of getPlayers(lobbyId)) {
      player.vote = undefined;
      player.numVotes = 0;
    }
    let step: Substep = "werewolves";
    let phase: GamePhase = "night";
    let time = WEREWOLVES_TIME;
    if (
      game.roleCounts.foreteller > 0 &&
      getPlayers(lobbyId).some(
        (player) => player.role === "foreteller" && player.alive
      )
    ) {
      step = "foreteller";
      phase = "night";
      time = FORETELLER_TIME;
    }

    setPhase(lobbyId, phase, step);
    game.dayNum++;
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    startCountdown(io, lobbyId, time, () => {
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
    const playerExists = getPlayers(lobbyId).some(
      (player) => player.id === playerId
    );
    if (!game || game.phase === "lobby" || !playerExists) {
      return socket.emit("joinError");
    }

    socket.join(lobbyId);

    if (game.host === playerId && game.phase === "start") {
      if (game.roleCounts.foreteller > 0) {
        setPhase(lobbyId, "night", "foreteller");
        startCountdown(io, lobbyId, FORETELLER_TIME, () => {
          nextPhase(lobbyId, "foreteller");
        });
      } else {
        setPhase(lobbyId, "night", "werewolves");
        startCountdown(io, lobbyId, WEREWOLVES_TIME, () => {
          nextPhase(lobbyId, "werewolves");
        });
      }
    }
    const updated = getSafeGameState(lobbyId);
    console.log("sending back updated game");
    cb(updated);
  });

  socket.on("startGame", (lobbyId: string) => {
    assignRolesAndColors(lobbyId);
    setPhase(lobbyId, "start", "none");
  });

  socket.on("foretellerSelected", (lobbyId: string, target: string) => {
    console.log("foreteller selected");
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[target];
    game.foretellerRevealed = true;
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
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
      if (targetId === "skip") {
        game.players[playerId].vote = "skip";
        const updated = getSafeGameState(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        return;
      }
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
