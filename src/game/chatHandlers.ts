import { Socket, Server } from "socket.io";
import { getGame, getSafeGameState } from "./gameManager";
import { Message, Player } from "./types";
import { v4 as uuidv4 } from "uuid";

export default function registerGameHandlers(io: Server, socket: Socket) {
  socket.on(
    "sendMessage",
    (
      lobbyId: string,
      message: string,
      player: Player,
      chat: "gameChat" | "werewolfChat" | "deadChat"
    ) => {
      const game = getGame(lobbyId);
      if (!game) return;
      const newMessage: Message = {
        id: uuidv4(),
        sender: player,
        text: message,
      };
      game[chat].push(newMessage);
      const updated = getSafeGameState(lobbyId);
      io.to(lobbyId).emit("gameUpdated", updated);
    }
  );
}
