import { Game, Player, GamePhase } from "./types";

const gameStates = new Map<string, Game>();

export const createGame = (lobbyId: string, hostId: string) => {
  const newGame: Game = {
    host: hostId,
    players: {},
    phase: "lobby",
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

export const setPhase = (lobbyId: string, phase: GamePhase) => {
  const game = getGame(lobbyId);
  if (game) game.phase = phase;
};

export const getPhase = (lobbyId: string) => {
  return getGame(lobbyId)?.phase;
};
