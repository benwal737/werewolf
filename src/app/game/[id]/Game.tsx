"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { GameState, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import PhaseIndicator from "./PhaseIndicator";
import ActionPanel from "./ActionPanel";
import PlayerList from "./PlayerList";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import usePhaseTheme from "@/hooks/usePhaseTheme";
import GameChat from "./GameChat";
import Confetti from "react-confetti";
import { turnSound } from "@/utils/sounds";
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
      turnSound(prevGameStateRef.current, updated, userId);
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
          <div className="flex flex-col min-h-screen h-dvh w-full bg-cover bg-center">
            {isWinner(gameState, user) && (
              <Confetti
                className="w-full h-full"
                recycle={false}
                numberOfPieces={500}
              />
            )}
            <div className="flex-1 flex flex-col gap-4 md:gap-5">
              {/* Phase Indicator  */}
              <div className="flex justify-center mt-5 w-full">
                <PhaseIndicator />
              </div>
              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row justify-center lg:items-start items-stretch gap-5 mx-10 md:mx-20 pb-20 h-full">
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
                <div className="w-full lg:w-1/3 h-full flex flex-col">
                  {/* Action Panel (lg and up) */}
                  {witchTurn && isWitch && (
                    <div className="hidden lg:block">
                      <ActionPanel />
                    </div>
                  )}
                  <div className="flex-1 min-h-[50vh] max-h-[60vh] lg:max-h-[72vh]">
                    <GameChat gameState={gameState} player={user} />
                  </div>
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
