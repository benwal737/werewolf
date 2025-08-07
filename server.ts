import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import registerLobbyHandlers from "./src/game/lobbyHandlers";
import registerGameHandlers from "./src/game/gameHandlers";
import registerChatHandlers from "./src/game/chatHandlers";

console.log("> Server starting");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

try {
  app.prepare().then(() => {
    console.log("> Server prepared");
    const server = createServer(handler);
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
      registerLobbyHandlers(io, socket);
      registerGameHandlers(io, socket);
      registerChatHandlers(io, socket);
    });

    server.listen(3000, () => {
      console.log("> Server running at http://localhost:3000");
    });
  });
} catch (err) {
  console.error(
    "Server error:",
    err instanceof Error ? err.stack : JSON.stringify(err)
  );
  process.exit(1);
}
