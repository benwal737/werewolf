import { Socket, Server } from "socket.io";
import { setPhase } from "./gameManager.ts";
import { getGame, getSafeGameState, assignRoles } from "./gameManager.ts";
import { GamePhase, NightSubstep } from "./types/index.ts";

export default function registerGameHandlers(io: Server, socket: Socket) {
  const nextPhase = (lobbyId: string, nightStep: NightSubstep) => {
    if (nightStep === "foreteller") {
      const nextPhase = "night";
      const nextStep = "werewolves";
      setPhase(lobbyId, nextPhase, nextStep);
      const game = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", game);
      startCountdown(lobbyId, 30, nextStep);
    }
  };

  const startCountdown = (
    lobbyId: string,
    seconds: number,
    nightStep: NightSubstep
  ) => {
    const game = getGame(lobbyId);
    if (!game || game.interval) return;

    let timeLeft = seconds;
    game.countdown = timeLeft;

    const interval = setInterval(() => {
      game.countdown = timeLeft;
      io.to(lobbyId).emit("countdownTick", timeLeft);
      if (timeLeft < 1) {
        clearInterval(interval);
        game.interval = undefined;
        game.countdown = undefined;
        nextPhase(lobbyId, nightStep);
      }
      timeLeft--;
    }, 1000);

    game.interval = interval;
  };

  socket.on("joinGame", (lobbyId: string, playerId: string, cb) => {
    const game = getGame(lobbyId);
    if (!game || game.phase === "lobby")
      return socket.emit("joinError", "Game not found");

    socket.join(lobbyId);

    if (game.host === playerId && game.phase === "start") {
      console.log("setting phase to foreteller");
      setPhase(lobbyId, "night", "foreteller");
      console.log("starting countdown");
      startCountdown(lobbyId, 30, "foreteller");
    }
    const updated = getSafeGameState(lobbyId);
    console.log("sending back updated game");
    cb(updated);
  });

  // socket.on("changePhase", (lobbyId, phase, step, cb) => {
  //   setPhase(lobbyId, phase, step);
  //   const game = getGame(lobbyId);
  //   cb(game);

  //   if (phase === "night" && step === "foreteller") {
  //     startCountdown(io, lobbyId, phase);
  //   }
  // });

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

  socket.on(
    "requestCountdown",
    (lobbyId: string, cb: (timeLeft: number | null) => void) => {
      const game = getGame(lobbyId);
      cb(game?.countdown ?? null);
    }
  );

  socket.onAny((event, ...args) => {
    console.log("[Server socket event]:", event, args);
  });
}
