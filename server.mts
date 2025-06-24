import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import registerLobbyHandlers from "./src/game/lobbyHandlers.ts";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handler);
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);
    registerLobbyHandlers(io, socket);
  });

  server.listen(3000, () => {
    console.log("> Server running at http://localhost:3000");
  });
});
