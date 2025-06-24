"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLobbyHandlers = registerLobbyHandlers;
const gameManager_1 = require("./gameManager");
function registerLobbyHandlers(io, socket) {
    socket.on("createLobby", (lobbyId, playerId, playerName) => {
        var _a;
        const game = (0, gameManager_1.createGame)(lobbyId, playerId);
        const player = {
            id: playerId,
            name: playerName,
            role: "unassigned",
            alive: true,
        };
        (0, gameManager_1.addPlayer)(lobbyId, player);
        socket.join(lobbyId);
        socket.join(playerId);
        io.to(lobbyId).emit("playerJoined", {
            players: (_a = (0, gameManager_1.getGame)(lobbyId)) === null || _a === void 0 ? void 0 : _a.players,
            host: game.host,
        });
    });
    socket.on("joinLobby", (lobbyId, playerId, playerName) => {
        var _a;
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return socket.emit("joinError", "Lobby not found");
        if (!game.players[playerId]) {
            const player = {
                id: playerId,
                name: playerName,
                role: "unassigned",
                alive: true,
            };
            (0, gameManager_1.addPlayer)(lobbyId, player);
        }
        socket.join(lobbyId);
        socket.join(playerId);
        io.to(lobbyId).emit("playerJoined", {
            players: (_a = (0, gameManager_1.getGame)(lobbyId)) === null || _a === void 0 ? void 0 : _a.players,
            host: game.host,
        });
    });
    socket.on("leaveLobby", (lobbyId, playerId) => {
        var _a, _b;
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        socket.leave(lobbyId);
        io.to(lobbyId).emit("playerJoined", {
            players: (_a = (0, gameManager_1.getGame)(lobbyId)) === null || _a === void 0 ? void 0 : _a.players,
            host: (_b = (0, gameManager_1.getGame)(lobbyId)) === null || _b === void 0 ? void 0 : _b.host,
        });
    });
    socket.on("kickPlayer", (lobbyId, playerId) => {
        var _a, _b;
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        io.to(lobbyId).emit("playerJoined", {
            players: (_a = (0, gameManager_1.getGame)(lobbyId)) === null || _a === void 0 ? void 0 : _a.players,
            host: (_b = (0, gameManager_1.getGame)(lobbyId)) === null || _b === void 0 ? void 0 : _b.host,
        });
        io.to(playerId).emit("kicked");
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
}
