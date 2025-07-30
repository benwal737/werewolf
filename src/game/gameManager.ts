import {
  GameState,
  Player,
  GamePhase,
  RoleCounts,
  Role,
  Substep,
} from "./types";

import { Server } from "socket.io";

const gameStates = new Map<string, GameState>();

interface EarlyProceedResult {
  proceed: boolean;
  newTimeLeft: number | null;
}

const earlyProceed = (io: Server, lobbyId: string): EarlyProceedResult => {
  const game = getGame(lobbyId);
  if (!game) return { proceed: false, newTimeLeft: null };

  const phase = game.phase;
  const step = game.substep;

  if (step === "witch" && (game.witchKill || game.witchSave)) {
    return { proceed: true, newTimeLeft: 6 };
  }

  if (step === "foreteller" && game.foretellerRevealed) {
    return { proceed: true, newTimeLeft: 11 };
  }

  let expectedVoters: string[] = [];

  if (phase === "night" && step === "werewolves") {
    expectedVoters = getPlayers(lobbyId)
      .filter((p) => p.alive && p.role === "werewolf")
      .map((p) => p.id);
  } else if (phase === "day" && step === "vote") {
    expectedVoters = getPlayers(lobbyId)
      .filter((p) => p.alive)
      .map((p) => p.id);
  } else {
    return { proceed: false, newTimeLeft: null };
  }

  const allVoted = expectedVoters.every((id) => !!game.players[id]?.vote);
  if (!allVoted) return { proceed: false, newTimeLeft: null };

  return { proceed: true, newTimeLeft: 1 };
};

export const startCountdown = (
  io: Server,
  lobbyId: string,
  seconds: number,
  onComplete: () => void
) => {
  const game = getGame(lobbyId);
  if (!game || game.interval) return;

  let timeLeft = seconds;
  game.countdown = timeLeft;
  io.to(lobbyId).emit("countdownTick", timeLeft);

  let earlyProceedTriggered = false;

  const interval = setInterval(() => {
    if (!earlyProceedTriggered) {
      const { proceed, newTimeLeft } = earlyProceed(io, lobbyId);
      if (proceed && newTimeLeft !== null) {
        timeLeft = newTimeLeft;
        earlyProceedTriggered = true;
      }
    }

    timeLeft--;
    game.countdown = timeLeft;
    io.to(lobbyId).emit("countdownTick", timeLeft);

    if (timeLeft < 1) {
      clearInterval(interval);
      game.interval = undefined;
      game.countdown = undefined;
      onComplete();
    }
  }, 1000);

  game.interval = interval;
};

export const createGame = (
  lobbyId: string,
  hostId: string,
  roleCounts: RoleCounts,
  totalPlayers: number
) => {
  const newGame: GameState = {
    host: hostId,
    players: {},
    phase: "lobby",
    substep: "none",
    roleCounts,
    totalPlayers,
    dayNum: 1,
    gameChat: [],
    werewolfChat: [],
    deadChat: [],
  };
  gameStates.set(lobbyId, newGame);
  return newGame;
};

export const getGame = (lobbyId: string) => {
  return gameStates.get(lobbyId);
};

export const getSafeGameState = (lobbyId: string): GameState => {
  const game = getGame(lobbyId);
  if (!game) throw new Error("Game not found");

  return {
    ...game,
    interval: undefined,
  };
};

export const addPlayer = (lobbyId: string, player: Player) => {
  const game = getGame(lobbyId);
  if (game) game.players[player.id] = player;
};

export const removePlayer = (lobbyId: string, playerId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;

  delete game.players[playerId];

  if (game.host === playerId) {
    const remainingPlayerIds = Object.keys(game.players);
    game.host = remainingPlayerIds[0] || null;
  }

  if (Object.keys(game.players).length === 0) {
    deleteGame(lobbyId);
  }
};

export const getPlayers = (lobbyId: string) => {
  const game = getGame(lobbyId);
  return game ? Object.values(game.players) : [];
};

export const deleteGame = (lobbyId: string) => {
  gameStates.delete(lobbyId);
};

export const setPhase = (
  lobbyId: string,
  phase: GamePhase,
  nightStep: Substep
) => {
  const game = getGame(lobbyId);
  if (game) {
    game.phase = phase;
    game.substep = nightStep;
  }
};

export const setNightDeaths = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  const deaths: Player[] = [];

  console.log(
    "setting night deaths:",
    game.werewolfKill?.name,
    game.witchKill?.name
  );

  if (game.werewolfKill && game.werewolfKill !== game.witchSave) {
    console.log("adding werewolf kill:", game.werewolfKill.name);
    game.players[game.werewolfKill.id].alive = false;
    deaths.push(game.werewolfKill);
  }
  if (game.witchKill && game.witchKill !== game.werewolfKill) {
    console.log("adding witch kill:", game.witchKill.name);
    game.players[game.witchKill.id].alive = false;
    deaths.push(game.witchKill);
  }
  game.nightDeaths = deaths;
};

export const resetNightDeaths = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  game.nightDeaths = [];
};

export const setDayDeaths = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  if (game.villageKill) {
    game.players[game.villageKill.id].alive = false;
  }
};

const colorPool = [
  "bg-red-500",
  "bg-green-500",
  "bg-amber-400",
  "bg-blue-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-cyan-400",
  "bg-pink-400",
  "bg-lime-400",
  "bg-slate-700",
  "bg-teal-600",
  "bg-violet-300",
  "bg-indigo-500",
  "bg-fuchsia-500",
  "bg-sky-500",
];

export const assignRolesAndColors = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;

  const rolesToAssign: Role[] = [];
  for (const role in game.roleCounts) {
    const count = game.roleCounts[role as Role];
    for (let i = 0; i < count; i++) {
      rolesToAssign.push(role as Role);
    }
  }

  // shuffffle
  for (let i = rolesToAssign.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
  }

  const playerIds = Object.keys(game.players);
  playerIds.forEach((playerId, index) => {
    const role = rolesToAssign[index];
    game.players[playerId].role = role;
    game.players[playerId].color = colorPool[index];
  });
};

export const getRole = (lobbyId: string, playerId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  return game.players[playerId]?.role;
};

export const isWinner = (lobbyId: string, io: Server): boolean => {
  const game = getGame(lobbyId);
  if (!game) return false;

  const villagersAlive = getPlayers(lobbyId).filter(
    (player) => player.alive && player.role !== "werewolf"
  );
  const werewolvesAlive = getPlayers(lobbyId).filter(
    (player) => player.alive && player.role === "werewolf"
  );

  if (villagersAlive.length === 0 && werewolvesAlive.length === 0) {
    game.winner = "draw";
  } else if (villagersAlive.length === 0) {
    game.winner = "werewolves";
  } else if (werewolvesAlive.length === 0) {
    game.winner = "villagers";
  }

  if (game.winner) {
    for (const player of getPlayers(lobbyId)) {
      player.vote = undefined;
      player.numVotes = 0;
    }
    setPhase(lobbyId, "end", "none");
    const updated = getSafeGameState(lobbyId);
    io.to(lobbyId).emit("gameUpdated", updated);
    return true;
  } else {
    return false;
  }
};

export const countVotes = (lobbyId: string) => {
  let skipVotes = 0;
  for (const player of getPlayers(lobbyId)) {
    if (!player.alive) continue;
    if (player.vote === "skip") {
      skipVotes++;
    }
  }

  let candidates: Player[] = [];
  let maxVotes = skipVotes;

  for (const player of getPlayers(lobbyId)) {
    if (!player.alive || !player.numVotes) continue;
    if (player.numVotes > maxVotes) {
      maxVotes = player.numVotes;
      candidates = [player];
    } else if (
      player.numVotes === maxVotes &&
      maxVotes > 0 &&
      maxVotes !== skipVotes
    ) {
      candidates.push(player);
    }
  }
  return candidates;
};

export const allVotesIn = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return false;

  const { substep } = game;
  return getPlayers(lobbyId).every((player) => {
    if (!player.alive) return true;

    if (substep === "werewolves" && player.role !== "werewolf") return true;
    if (substep === "vote" || substep === "werewolves")
      return player.vote !== undefined;

    return true;
  });
};
