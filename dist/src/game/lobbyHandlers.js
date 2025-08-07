"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerLobbyHandlers;
const gameManager_1 = require("./gameManager");
function registerLobbyHandlers(io, socket) {
    socket.on("createLobby", (lobbyId, playerId, playerName, roleCounts, totalPlayers, callback) => {
        if (roleCounts.werewolf < 1 ||
            roleCounts.villager < 1 ||
            roleCounts.witch > 1 ||
            roleCounts.foreteller > 1) {
            return;
        }
        (0, gameManager_1.createGame)(lobbyId, playerId, roleCounts, totalPlayers);
        const player = {
            id: playerId,
            name: playerName,
            role: "villager",
            alive: true,
        };
        (0, gameManager_1.addPlayer)(lobbyId, player);
        socket.join(lobbyId);
        socket.join(playerId);
        callback();
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        console.log("lobby created:", updated);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("joinLobby", (lobbyId, playerId, playerName, callback) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game ||
            game.phase !== "lobby" ||
            ((0, gameManager_1.getPlayers)(lobbyId).length >= game.totalPlayers &&
                !game.players[playerId])) {
            return socket.emit("joinError");
        }
        if (!game.players[playerId]) {
            const player = {
                id: playerId,
                name: playerName,
                role: "villager",
                alive: true,
            };
            (0, gameManager_1.addPlayer)(lobbyId, player);
        }
        socket.join(lobbyId);
        socket.join(playerId);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        callback(updated);
        io.to(lobbyId).emit("playerJoined");
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("leaveLobby", (lobbyId, playerId) => {
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        socket.leave(lobbyId);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("playerLeft");
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("kickPlayer", (lobbyId, playerId) => {
        (0, gameManager_1.removePlayer)(lobbyId, playerId);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(playerId).emit("kicked");
        io.to(lobbyId).emit("gameUpdated", updated);
        io.to(lobbyId).emit("playerLeft");
    });
    socket.on("checkLobby", (lobbyId, playerId, callback) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        callback(!!game &&
            game.phase === "lobby" &&
            (game.totalPlayers > (0, gameManager_1.getPlayers)(lobbyId).length ||
                game.players[playerId]));
    });
    const countdowns = new Map();
    socket.on("startGameCountdown", (lobbyId) => {
        if (countdowns.has(lobbyId)) {
            return;
        }
        let timeLeft = 3;
        const interval = setInterval(() => {
            io.to(lobbyId).emit("startCountdown");
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(interval);
                countdowns.delete(lobbyId);
                io.to(lobbyId).emit("countdownComplete");
            }
        }, 1000);
        countdowns.set(lobbyId, interval);
    });
    socket.on("checkExistingGame", (playerId, callback) => {
        const existingGame = (0, gameManager_1.findExistingGame)(playerId);
        callback(existingGame);
    });
    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
}
