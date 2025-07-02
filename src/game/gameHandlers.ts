import { Socket, Server } from "socket.io";
import { setPhase } from "./gameManager.ts";
import { GamePhase, NightSubstep } from "./types";
import { getGame, assignRoles } from "./gameManager.ts";

export default function registerGameHandlers(io: Server, socket: Socket) {
  socket.on("joinGame", (lobbyId: string, cb) => {
    const game = getGame(lobbyId);
    if (!game || game.phase === "lobby")
      return socket.emit("joinError", "Game not found");
    cb(game);
  });

  socket.on(
    "changePhase",
    (lobbyId: string, phase: GamePhase, nightStep: NightSubstep, cb) => {
      console.log("Changing phase to:", phase, nightStep);
      setPhase(lobbyId, phase, nightStep);
      cb(getGame(lobbyId));
    }
  );

  socket.on("startGame", (lobbyId: string) => {
    assignRoles(lobbyId);
    setPhase(lobbyId, "start", null);
  });

  socket.on("foretellerSelected", (lobbyId: string, target: string) => {
    console.log("foreteller selected");
    const game = getGame(lobbyId);
    if (!game) return;
    const player = game.players[target];
    io.to(lobbyId).emit("foretellerReveal", player);
  });

  socket.on("startPhaseCountdown", (lobbyId: string, phase: GamePhase) => {
    console.log("starting countdown for phase:", phase);
    const game = getGame(lobbyId);
    if (!game) return;
    if (game.interval) {
      console.log("countdown already running");
      return;
    }
    let timeLeft = 30;
    game.countdown = timeLeft;
    const interval = setInterval(() => {
      game.countdown = timeLeft;
      io.to(lobbyId).emit("countdownTick", timeLeft);
      if (timeLeft < 0) {
        clearInterval(interval);
        game.interval = undefined;
        game.countdown = undefined;
        io.to(lobbyId).emit("nextPhase");
      }
      timeLeft--;
    }, 1000);
    game.interval = interval;
  });

  socket.on(
    "requestCountdown",
    (lobbyId: string, cb: (timeLeft: number | null) => void) => {
      const game = getGame(lobbyId);
      cb(game?.countdown ?? null);
    }
  );
}
