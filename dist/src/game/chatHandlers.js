"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerGameHandlers;
const gameManager_1 = require("./gameManager");
const uuid_1 = require("uuid");
function registerGameHandlers(io, socket) {
    socket.on("sendMessage", (lobbyId, message, player, chat) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const newMessage = {
            id: (0, uuid_1.v4)(),
            sender: player,
            text: message,
        };
        game[chat].push(newMessage);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
}
