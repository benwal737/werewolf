"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Game as GameState, Role, GamePhase } from "@/game/types";
import BottomBar from "./BottomBar";
import TopBar from "./TopBar";
import { getPlayer } from "@/utils/getPlayer";

const Game = () => {
  const lobbyId = useParams().id;
  const router = useRouter();
  const { playerName, playerId } = getPlayer();
  const [gameState, setGameState] = useState<GameState | null>(null);
  useEffect(() => {
    const handleJoinError = (msg: string) => {
      alert(msg);
      router.push("/");
    };
    socket.emit("joinGame", lobbyId, (game: GameState) => {
      setGameState(game);
    });
    socket.on("joinError", handleJoinError);
    return () => {
      socket.off("joinError", handleJoinError);
    };
  }, [lobbyId]);
  return (
    <div>
      <div className="w-full flex justify-center items-center fixed top-0">
        <TopBar phase={gameState?.phase as GamePhase} />
      </div>
      <div className="w-full flex justify-center items-center fixed bottom-0">
        <BottomBar role={gameState?.players[playerId].role as Role} />
      </div>
    </div>
  );
};

export default Game;
