"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhase = exports.setPhase = exports.deleteGame = exports.isHost = exports.getPlayers = exports.removePlayer = exports.addPlayer = exports.getGame = exports.createGame = void 0;
const gameStates = new Map();
const createGame = (lobbyId, hostId) => {
    const newGame = {
        host: hostId,
        players: {},
        phase: "lobby",
    };
    gameStates.set(lobbyId, newGame);
    return newGame;
};
exports.createGame = createGame;
const getGame = (lobbyId) => {
    return gameStates.get(lobbyId);
};
exports.getGame = getGame;
const addPlayer = (lobbyId, player) => {
    const game = (0, exports.getGame)(lobbyId);
    if (game)
        game.players[player.id] = player;
};
exports.addPlayer = addPlayer;
const removePlayer = (lobbyId, playerId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    delete game.players[playerId];
    if (game.host === playerId) {
        const remainingPlayerIds = Object.keys(game.players);
        game.host = remainingPlayerIds[0] || null;
    }
    if (Object.keys(game.players).length === 0) {
        (0, exports.deleteGame)(lobbyId);
    }
};
exports.removePlayer = removePlayer;
const getPlayers = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    return game ? Object.values(game.players) : [];
};
exports.getPlayers = getPlayers;
const isHost = (lobbyId, playerId) => {
    const game = (0, exports.getGame)(lobbyId);
    return (game === null || game === void 0 ? void 0 : game.host) === playerId;
};
exports.isHost = isHost;
const deleteGame = (lobbyId) => {
    gameStates.delete(lobbyId);
};
exports.deleteGame = deleteGame;
const setPhase = (lobbyId, phase) => {
    const game = (0, exports.getGame)(lobbyId);
    if (game)
        game.phase = phase;
};
exports.setPhase = setPhase;
const getPhase = (lobbyId) => {
    var _a;
    return (_a = (0, exports.getGame)(lobbyId)) === null || _a === void 0 ? void 0 : _a.phase;
};
exports.getPhase = getPhase;
