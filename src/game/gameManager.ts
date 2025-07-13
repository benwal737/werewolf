import { Game, Player, GamePhase, RoleCounts, Role, Substep } from "./types";

import { Server } from "socket.io";

const gameStates = new Map<string, Game>();

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

  const interval = setInterval(() => {
    timeLeft--;
    game.countdown = timeLeft;
    io.to(lobbyId).emit("countdownTick", timeLeft);
    if (timeLeft === 1) {
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
  const newGame: Game = {
    host: hostId,
    players: {},
    phase: "lobby",
    nightStep: "none",
    roleCounts,
    totalPlayers,
  };
  gameStates.set(lobbyId, newGame);
  return newGame;
};

export const getGame = (lobbyId: string) => {
  return gameStates.get(lobbyId);
};

export const getSafeGameState = (lobbyId: string): Game => {
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

export const isHost = (lobbyId: string, playerId: string) => {
  const game = getGame(lobbyId);
  return game?.host === playerId;
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
    game.nightStep = nightStep;
  }
};

export const getPhase = (lobbyId: string) => {
  return getGame(lobbyId)?.phase;
};

export const setNightDeaths = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  const deaths: Player[] = [];

  console.log("setting night deaths:", game.werewolfKill?.name, game.witchKill?.name)

  if (game.werewolfKill && game.werewolfKill !== game.witchSave) {
    console.log("adding werewolf kill:", game.werewolfKill.name)
    game.players[game.werewolfKill.id].alive = false;
    deaths.push(game.werewolfKill);
  }
  if (game.witchKill && game.witchKill !== game.werewolfKill) {
    console.log("adding witch kill:", game.witchKill.name)
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

export const assignRoles = (lobbyId: string) => {
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
  });
};

export const getRole = (lobbyId: string, playerId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;
  return game.players[playerId]?.role;
};

export const checkWinner = (lobbyId: string) => {
  const game = getGame(lobbyId);
  if (!game) return;

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
};

export const countVotes = (lobbyId: string) => {
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
  return candidates;
};
