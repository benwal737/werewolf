import { Server } from "socket.io";
import { createServer } from "http";
import next from "next";

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

    socket.on("checkLobby", (lobbyId, callback) => {
      const exists = !!gameStates[lobbyId];
      callback(exists);
    });

    socket.on("createLobby", (lobbyId, playerId, playerName) => {
      if (gameStates[lobbyId]) {
        socket.emit("error", "Lobby ID already exists");
        return;
      }

      gameStates[lobbyId] = {
        players: {},
      };

      gameStates[lobbyId].players[playerId] = {
        name: playerName,
        id: playerId,
      };

      socket.join(lobbyId);
      io.to(lobbyId).emit("playerJoined", gameStates[lobbyId].players);
    });

    socket.on("joinLobby", (lobbyId, playerId, playerName) => {
      if (!gameStates[lobbyId]) {
        socket.emit("joinError", "Lobby does not exist");
        return;
      }

      gameStates[lobbyId].players[playerId] = {
        name: playerName,
        id: playerId,
      };

      socket.join(lobbyId);
      io.to(lobbyId).emit("playerJoined", gameStates[lobbyId].players);
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
