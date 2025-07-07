"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Game as GameState, Role, GamePhase, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import TopBar from "./TopBar";
import { getPlayer } from "@/utils/getPlayer";
import PlayerCard from "./PlayerCard";
import { TypographyH4 } from "@/components/ui/typography";
import { toast } from "sonner";
import { useRef } from "react";

const Game = () => {
  const router = useRouter();
  const lobbyId = useParams().id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const hasJoinedRef = useRef(false);

  const { playerId } = getPlayer();
  const player = playerId ? gameState?.players[playerId] : null;
  if (!playerId) return null;

  const isForeteller = player?.role === "foreteller";
  const foretellerTurn = gameState?.nightStep === "foreteller";
  const isWerewolf = player?.role === "werewolf";
  const werewolfTurn = gameState?.nightStep === "werewolves";

  const [foretellerRevealed, setForetellerRevealed] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const narration = foretellerTurn
    ? isForeteller
      ? "Select a player to reveal their role"
      : "Foreteller is revealing a role"
    : werewolfTurn
    ? isWerewolf
      ? "Select a player to kill"
      : "Werewolves selecting a player to kill"
    : "Some other phase";

  const foretellerAction = (target: Player) => {
    if (foretellerRevealed) return;
    socket.emit("foretellerSelected", lobbyId, target.id);
    setForetellerRevealed(true);
  };

  const getClickAction = (target: Player) => {
    if (foretellerTurn && isForeteller) {
      if (playerId === target.id) return undefined;
      return () => foretellerAction(target);
    } else {
      return undefined;
    }
  };

  const handleJoinError = (msg: string) => {
    alert(msg);
    router.push("/");
  };

  const handleForetellerReveal = (target: Player) => {
    const isCurrentForeteller = () =>
      gameStateRef.current?.players[playerId]?.role === "foreteller";
    if (isCurrentForeteller()) {
      console.log("you’re the foreteller and you just revealed");
      toast(`You saw ${target.name} - they are a ${target.role}.`, {
        description: "Foreteller Vision",
        duration: 10000,
        position: "top-left",
      });
    } else {
      console.log(
        "you are not the foreteller, but the foreteller just revealed"
      );
    }
  };

  const handleCountdownTick = (timeLeft: number) => {
    setCountdown(timeLeft);
  };

  useEffect(() => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    socket.emit("joinGame", lobbyId, playerId, (game: GameState) => {
      console.log("updating game");
      setGameState(game);
      console.log("game state upon joining:", game);
    });
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    socket.emit("requestCountdown", lobbyId, (timeLeft: number | null) => {
      console.log("requesting countdown");
      console.log("time left:", timeLeft);
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

    // socket.onAny((event, ...args) => {
    //   console.log("[Client socket event]:", event, args);
    // });

    return () => {
      socket.off("joinError", handleJoinError);
      socket.off("foretellerReveal", handleForetellerReveal);
      socket.off("countdownTick", handleCountdownTick);
      socket.off("gameUpdated");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Top Bar */}
      <div className="w-full">
        <TopBar phase={gameState?.phase as GamePhase} />
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mt-5">
        {/* Narration */}
        <div className="flex justify-center gap-2">
          <TypographyH4>{narration}:</TypographyH4>
          <TypographyH4>{countdown}</TypographyH4>
        </div>
        {/* Player List */}
        {gameState && (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4 py-12 max-w-5xl mx-auto">
              {Object.values(gameState.players).map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  foretellerTurn={foretellerTurn}
                  werewolfTurn={werewolfTurn}
                  role={gameState.players[playerId].role as Role}
                  playerId={playerId}
                  foretellerSelected={foretellerRevealed}
                  onClick={getClickAction(player)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Bottom Bar */}
      <div className="w-full flex justify-center items-center fixed bottom-0">
        <BottomBar role={player?.role as Role} />
      </div>
    </div>
  );
};

export default Game;
