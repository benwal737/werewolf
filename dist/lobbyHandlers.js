"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLobbyHandlers = registerLobbyHandlers;
const gameManager_1 = require("./gameManager");
console.log("📦 lobbyHandlers.js loaded");
function registerLobbyHandlers(io, socket) {
    console.log("📡 Lobby handlers registered");
    socket.on("createLobby", (lobbyId, playerId, playerName) => {
        console.log("creating lobby");
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
            players: (0, gameManager_1.getGame)(lobbyId)?.players,
            host: game.host,
        });
    });
    socket.on("joinLobby", (lobbyId, playerId, playerName) => {
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
            players: (0, gameManager_1.getGame)(lobbyId)?.players,
            host: game.host,
        });
    });
    socket.on("leaveLobby", (lobbyId, playerId) => {
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        socket.leave(lobbyId);
        io.to(lobbyId).emit("playerJoined", {
            players: (0, gameManager_1.getGame)(lobbyId)?.players,
            host: (0, gameManager_1.getGame)(lobbyId)?.host,
        });
    });
    socket.on("kickPlayer", (lobbyId, playerId) => {
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        io.to(lobbyId).emit("playerJoined", {
            players: (0, gameManager_1.getGame)(lobbyId)?.players,
            host: (0, gameManager_1.getGame)(lobbyId)?.host,
        });
        io.to(playerId).emit("kicked");
    });
    socket.on("checkLobby", (lobbyId, callback) => {
        console.log("checking lobby");
        const game = (0, gameManager_1.getGame)(lobbyId);
        callback(!!game && game.phase === "lobby");
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
}
