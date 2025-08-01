"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { GameState, Role, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import PhaseIndicator from "./PhaseIndicator";
import ActionPanel from "./ActionPanel";
import PlayerList from "./PlayerList";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import usePhaseTheme from "@/hooks/usePhaseTheme";
import GameChat from "./GameChat";
import Confetti from "react-confetti";
import { mystery, endGame, turnSound } from "@/utils/sounds";
import { isWinner } from "@/utils/winConditions";
import GameContextProvider from "@/context/GameContext";

const Game = () => {
  const router = useRouter();
  const lobbyId = useParams().id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const prevGameStateRef = useRef<GameState | null>(null);
  const phaseTheme = usePhaseTheme(gameState);
  const hasJoinedRef = useRef(false);

  const [witchSelected, setWitchSelected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { userId } = usePlayer();
  const user: Player | null =
    userId && gameState ? gameState.players[userId] : null;

  const foretellerRevealed = gameState?.foretellerRevealed;
  const isWitch = user?.role === "witch";
  const witchTurn = gameState?.substep === "witch";

  const handleJoinError = useCallback(() => {
    router.push("/not-found");
  }, [router]);

  const handleCountdownTick = useCallback(
    (timeLeft: number) => {
      setCountdown(timeLeft);
    },
    [setCountdown]
  );

  useEffect(() => {
    if (!userId) return;
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    socket.emit("joinGame", lobbyId, userId, (game: GameState) => {
      setGameState(game);
    });
  }, [lobbyId, userId]);

  useEffect(() => {
    socket.emit("requestCountdown", lobbyId, (timeLeft: number | null) => {
      if (typeof timeLeft === "number") {
        setCountdown(timeLeft);
      }
    });

    socket.on("countdownTick", handleCountdownTick);
    socket.on("joinError", handleJoinError);
    socket.on("gameUpdated", (updated: GameState) => {
      const prevSubstep = prevGameStateRef.current?.substep;
      console.log("prevSubstep", prevSubstep);
      if (updated.substep === "deaths") {
        mystery();
      } else if (updated.phase === "end") {
        const updatedPlayer = userId ? updated.players[userId] : null;
        if (!updatedPlayer) return;
        endGame(updated, updatedPlayer);
      } else {
        turnSound(prevSubstep || "none", updated.substep);
      }
      setGameState(updated);
      prevGameStateRef.current = updated;
    });

    return () => {
      socket.off("joinError", handleJoinError);
      socket.off("countdownTick", handleCountdownTick);
      socket.off("gameUpdated");
    };
  }, [lobbyId, userId, handleJoinError, handleCountdownTick]);

  return (
    user &&
    userId &&
    gameState && (
      <PageTheme forcedTheme={phaseTheme}>
        <GameContextProvider
          gameState={gameState}
          user={user}
          witchSelected={witchSelected}
          setWitchSelected={setWitchSelected}
          countdown={countdown}
        >
          <div className="flex flex-col min-h-screen w-full bg-cover bg-center overflow-y-auto">
            {isWinner(gameState, user) && (
              <Confetti
                className="w-full h-full"
                recycle={false}
                numberOfPieces={500}
              />
            )}
            {/* Phase Indicator  */}
            <div className="flex justify-center mt-5 w-full">
              <PhaseIndicator />
            </div>
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row justify-center my-5 lg:items-start items-stretch gap-5 mx-10 md:mx-20">
              {/* Left Container */}
              <div className="lg:w-2/3 lg:mb-0 w-full">
                {/* Action Panel (md and below) */}
                {witchTurn && isWitch && (
                  <div className="block lg:hidden mb-4">
                    <ActionPanel />
                  </div>
                )}
                {/* Player List */}
                <PlayerList />
              </div>
              {/* Right Container */}
              <div className="w-full lg:w-1/3">
                {/* Action Panel (lg and up) */}
                {witchTurn && isWitch && (
                  <div className="hidden lg:block mb-4">
                    <ActionPanel />
                  </div>
                )}
                <div className="h-[66vh]">
                  <GameChat gameState={gameState} player={user} />
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Bar */}
          <div className="w-full flex justify-center items-center fixed bottom-0">
            <BottomBar />
          </div>
        </GameContextProvider>
      </PageTheme>
    )
  );
};

export default Game;
