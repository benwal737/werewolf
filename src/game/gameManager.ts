import {
  Game,
  Player,
  GamePhase,
  RoleCounts,
  Role,
  NightSubstep,
} from "./types";

const gameStates = new Map<string, Game>();

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
    nightStep: null,
    roleCounts,
    totalPlayers,
  };
  gameStates.set(lobbyId, newGame);
  return newGame;
};

export const getGame = (lobbyId: string) => {
  return gameStates.get(lobbyId);
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
  nightStep: NightSubstep
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

  // shuffle
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
