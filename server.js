
import { Server } from "socket.io";
import { createServer } from "http";
import next from "next";

console.log("Starting server...");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(handler);
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("a user connected with socket id", socket.id);
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