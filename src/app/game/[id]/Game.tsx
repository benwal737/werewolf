"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Game as GameState, Role, GamePhase } from "@/game/types";
import BottomBar from "./BottomBar";
import TopBar from "./TopBar";
import { getPlayer } from "@/utils/getPlayer";
import PlayerCard from "./PlayerCard";

const Game = () => {
  const lobbyId = useParams().id;
  const router = useRouter();
  const { playerName, playerId } = getPlayer();
  const [gameState, setGameState] = useState<GameState | null>(null);
  useEffect(() => {
    socket.emit("joinGame", lobbyId, (game: GameState) => {
      setGameState(game);
    });
    socket.emit(
      "changePhase",
      lobbyId,
      "night",
      "foreteller",
      (game: GameState) => {
        setGameState(game);
      }
    );
    const handleJoinError = (msg: string) => {
      alert(msg);
      router.push("/");
    };
    socket.on("joinError", handleJoinError);
    return () => {
      socket.off("joinError", handleJoinError);
    };
  }, [lobbyId]);
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="w-full">
        <TopBar phase={gameState?.phase as GamePhase} />
      </div>

      <div className="flex-1 overflow-y-aut">
        {gameState && (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4 py-12 max-w-5xl mx-auto">
              {Object.values(gameState.players).map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center items-center fixed bottom-0">
        <BottomBar role={gameState?.players[playerId].role as Role} />
      </div>
    </div>
  );
};

export default Game;
