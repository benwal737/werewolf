"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { GameState, Role, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import PhaseIndicator from "./PhaseIndicator";
import ActionPanel from "./ActionPanel";
import { usePlayer } from "@/hooks/usePlayer";
import usePlayerAction from "@/hooks/usePlayerAction";
import PlayerCard from "./PlayerCard";
import { toast } from "sonner";
import PageTheme from "@/components/PageTheme";
import usePhaseTheme from "@/hooks/usePhaseTheme";

const Game = () => {
  const router = useRouter();
  const lobbyId = useParams().id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const phaseTheme = usePhaseTheme(gameState);
  const hasJoinedRef = useRef(false);

  const [witchSelected, setWitchSelected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { playerId } = usePlayer();
  const player: Player | null =
    playerId && gameState ? gameState.players[playerId] : null;

  const foretellerRevealed = gameState?.foretellerRevealed;
  const isForeteller = player?.role === "foreteller";
  const isWitch = player?.role === "witch";
  const witchTurn = gameState?.substep === "witch";

  const getClickAction = (target: Player) => {
    return usePlayerAction(
      socket,
      lobbyId,
      playerId,
      target,
      player,
      gameState,
      witchSelected,
      setWitchSelected
    );
  };

  const handleJoinError = useCallback(() => {
    router.push("/not-found");
  }, [router]);

  const handleForetellerReveal = useCallback(
    (target: Player) => {
      if (isForeteller) {
        toast(`You saw ${target.name} - they are a ${target.role}.`, {
          description: "Foreteller Vision",
          duration: 10000,
          position: "top-left",
        });
      }
    },
    [isForeteller]
  );

  const handleCountdownTick = useCallback(
    (timeLeft: number) => {
      setCountdown(timeLeft);
    },
    [setCountdown]
  );

  useEffect(() => {
    if (!playerId) return;
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    socket.emit("joinGame", lobbyId, playerId, (game: GameState) => {
      setGameState(game);
    });
  }, [lobbyId, playerId]);

  useEffect(() => {
    socket.emit("requestCountdown", lobbyId, (timeLeft: number | null) => {
      if (typeof timeLeft === "number") {
        setCountdown(timeLeft);
      }
    });

    socket.on("countdownTick", handleCountdownTick);
    socket.on("foretellerReveal", handleForetellerReveal);
    socket.on("joinError", handleJoinError);
    socket.on("gameUpdated", (updated: GameState) => {
      setGameState(updated);
    });

    return () => {
      socket.off("joinError", handleJoinError);
      socket.off("foretellerReveal", handleForetellerReveal);
      socket.off("countdownTick", handleCountdownTick);
      socket.off("gameUpdated");
    };
  }, [
    lobbyId,
    playerId,
    handleForetellerReveal,
    handleJoinError,
    handleCountdownTick,
  ]);

  return (
    player &&
    playerId &&
    gameState && (
      <PageTheme forcedTheme={phaseTheme}>
        <div className="flex flex-col min-h-screen w-full bg-cover bg-center">
          {/* Phase Indicator  */}
          <div className="flex justify-center mt-5 w-full">
            <PhaseIndicator
              gameState={gameState}
              countdown={countdown}
              player={player}
            />
          </div>
          {/* Main Content */}
          <div className="flex justify-between w-full">
            {/* Player List */}
            <div className="mx-20 w-1/2">
              {/* Action Panel */}
              {witchTurn && isWitch && (
                <div className="flex justify-center mt-5 w-full">
                  <ActionPanel gameState={gameState} />
                </div>
              )}
              <div className="flex flex-col justify-center gap-4 py-12 w-full mx-auto">
                {Object.values(gameState.players).map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    gameState={gameState}
                    user={gameState.players[playerId]}
                    foretellerRevealed={foretellerRevealed}
                    witchSelected={witchSelected}
                    onClick={getClickAction(player)}
                  />
                ))}
              </div>
            </div>
            {/* Game Chat */}
            <div className="mr-20 w-1/2 bg-card/50 backdrop-blur-sm p-5"></div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="w-full flex justify-center items-center fixed bottom-0">
          <BottomBar role={player?.role as Role} />
        </div>
      </PageTheme>
    )
  );
};

export default Game;
