"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { GameState, Role, Player, Message } from "@/game/types";
import BottomBar from "./BottomBar";
import PhaseIndicator from "./PhaseIndicator";
import ActionPanel from "./ActionPanel";
import PlayerList from "./PlayerList";
import { usePlayer } from "@/hooks/usePlayer";
import usePlayerAction from "@/hooks/usePlayerAction";
import { toast } from "sonner";
import PageTheme from "@/components/PageTheme";
import usePhaseTheme from "@/hooks/usePhaseTheme";
import GameChat from "./GameChat";
import Confetti from "react-confetti";

const messages: Message[] = [
  {
    id: "1",
    text: "Hello",
    sender: { id: "1", name: "Player 1", role: "werewolf", alive: true },
  },
  {
    id: "2",
    text: "Whats up",
    sender: { id: "2", name: "Player 2", role: "villager", alive: true },
  },
  {
    id: "3",
    text: "Whats up",
    sender: { id: "3", name: "Player 3", role: "witch", alive: true },
  },
  {
    id: "4",
    text: "Whats up",
    sender: { id: "4", name: "Player 4", role: "foreteller", alive: true },
  },
  {
    id: "5",
    text: "Whats up",
    sender: { id: "5", name: "Player 5", role: "villager", alive: true },
  },
  {
    id: "6",
    text: "Whats up",
    sender: { id: "6", name: "Player 6", role: "villager", alive: true },
  },
];

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

  const isWinner =
    (gameState?.winner === "villagers" && player?.role !== "werewolf") ||
    (gameState?.winner === "werewolves" && player?.role === "werewolf");

  return (
    player &&
    playerId &&
    gameState && (
      <PageTheme forcedTheme={phaseTheme}>
        <div className="flex flex-col min-h-screen w-full bg-cover bg-center overflow-y-auto">
          {isWinner && (
            <Confetti
              className="w-full h-full"
              recycle={false}
              numberOfPieces={500}
            />
          )}
          {/* Phase Indicator  */}
          <div className="flex justify-center mt-5 w-full">
            <PhaseIndicator
              gameState={gameState}
              countdown={countdown}
              player={player}
            />
          </div>
          {/* Main Content */}
          <div className="flex flex-col lg:flex-row justify-center my-5 lg:items-start items-stretch gap-5 mx-10 md:mx-20">
            {/* Left Container */}
            <div className="lg:w-2/3 lg:mb-0 w-full">
              {/* Action Panel (md and below) */}
              {witchTurn && isWitch && (
                <div className="block lg:hidden mb-4">
                  <ActionPanel gameState={gameState} />
                </div>
              )}
              {/* Player List */}
              <PlayerList
                players={Object.values(gameState.players)}
                currentUserId={playerId}
                gameState={gameState}
                foretellerRevealed={foretellerRevealed}
                witchSelected={witchSelected}
                getClickAction={getClickAction}
              />
            </div>
            {/* Right Container */}
            <div className="w-full lg:w-1/3">
              {/* Action Panel (lg and up) */}
              {witchTurn && isWitch && (
                <div className="hidden lg:block mb-4">
                  <ActionPanel gameState={gameState} />
                </div>
              )}
              <div className="h-[66vh]">
                <GameChat messages={messages} />
              </div>
            </div>
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
