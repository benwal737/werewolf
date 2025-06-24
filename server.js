import { Server } from "socket.io";
import { createServer } from "http";
import next from "next";
import { pl } from "zod/v4/locales";

console.log("Starting server...");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const gameStates = {};

app.prepare().then(() => {
  const server = createServer(handler);
  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected with socket id", socket.id);

    socket.on("joinLobby", (lobbyId, playerId, playerName) => {
      console.log(
        `Received joinLobby from ${socket.id} for lobby ${lobbyId} with playerId ${playerId} and playerName ${playerName}`
      );
      if (!gameStates[lobbyId]) {
        gameStates[lobbyId] = {
          players: {},
        };
      }
      gameStates[lobbyId].players[playerId] = {
        name: playerName,
        id: playerId,
      };
      console.log("players:", gameStates[lobbyId].players);
      socket.join(lobbyId);
      io.to(lobbyId).emit("playerJoined", gameStates[lobbyId].players);
    });
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", socket.id, reason);
    });
  });

  server
    .once("error", (error) => {
      console.error(error);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
