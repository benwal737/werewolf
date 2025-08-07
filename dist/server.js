"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const next_1 = __importDefault(require("next"));
const lobbyHandlers_1 = __importDefault(require("./src/game/lobbyHandlers"));
const gameHandlers_1 = __importDefault(require("./src/game/gameHandlers"));
const chatHandlers_1 = __importDefault(require("./src/game/chatHandlers"));
console.log("> Server starting");
const dev = process.env.NODE_ENV !== "production";
const app = (0, next_1.default)({ dev });
const handler = app.getRequestHandler();
try {
    app.prepare().then(() => {
        console.log("> Server prepared");
        const server = (0, http_1.createServer)(handler);
        const io = new socket_io_1.Server(server);
        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            (0, lobbyHandlers_1.default)(io, socket);
            (0, gameHandlers_1.default)(io, socket);
            (0, chatHandlers_1.default)(io, socket);
        });
        server.listen(3000, () => {
            console.log("> Server running at http://localhost:3000");
        });
    });
}
catch (err) {
    console.error("Server error:", err instanceof Error ? err.stack : JSON.stringify(err));
    process.exit(1);
}
