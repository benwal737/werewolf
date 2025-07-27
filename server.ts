process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:");
  console.dir(err, { depth: null });
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:");
  console.dir(reason, { depth: null });
});

import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import registerLobbyHandlers from "./src/game/lobbyHandlers.ts";
import registerGameHandlers from "./src/game/gameHandlers.ts";

console.log("> Server starting");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

try {
  app.prepare().then(() => {
    console.log("> Server prepared");
    const server = createServer(handler);
    const io = new Server(server);

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);
      registerLobbyHandlers(io, socket);
      registerGameHandlers(io, socket);
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
