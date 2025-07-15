"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Game as GameState, Role, GamePhase, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import PhaseIndicator from "./PhaseIndicator";
import ActionPanel from "./ActionPanel";
import { getPlayer } from "@/utils/getPlayer";
import PlayerCard from "./PlayerCard";
import { toast } from "sonner";
import Narration from "./Narration";
import { getBackground } from "@/utils/getBackground";
import PageTheme from "@/components/PageTheme";

const Game = () => {
  const router = useRouter();
  const lobbyId = useParams().id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const hasJoinedRef = useRef(false);

  const [witchSelected, setWitchSelected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [phaseTheme, setPhaseTheme] = useState<"light" | "dark">("dark");

  const { playerId } = getPlayer();
  const player: Player | null =
    playerId && gameState ? gameState.players[playerId] : null;

  const foretellerRevealed = gameState?.foretellerRevealed;
  const isForeteller = player?.role === "foreteller";
  const foretellerTurn = gameState?.substep === "foreteller";
  const isWerewolf = player?.role === "werewolf";
  const werewolfTurn = gameState?.substep === "werewolves";
  const isWitch = player?.role === "witch";
  const witchTurn = gameState?.substep === "witch";
  const voteStep = gameState?.substep === "vote";

  const foretellerAction = (target: Player) => {
    if (foretellerRevealed) return;
    socket.emit("foretellerSelected", lobbyId, target.id);
  };

  const voteAction = (target: Player) => {
    socket.emit("playerVoted", lobbyId, playerId, target.id);
  };

  const witchAction = (target: Player) => {
    if (witchSelected) return;
    socket.emit("witchKilled", lobbyId, target.id);
    setWitchSelected(true);
  };

  const getClickAction = (target: Player) => {
    if (!player?.alive) return undefined;
    if (playerId === target.id) return undefined;
    if (target.id == null || !gameState?.players[target.id].alive)
      return undefined;
    if (foretellerTurn && isForeteller) {
      return () => foretellerAction(target);
    } else if ((werewolfTurn && isWerewolf) || voteStep) {
      return () => voteAction(target);
    } else if (witchTurn && isWitch) {
      return () => witchAction(target);
    } else {
      return undefined;
    }
  };

  const handleJoinError = useCallback(
    (msg: string) => {
      alert(msg);
      router.push("/");
    },
    [router]
  );

  const handleForetellerReveal = useCallback(
    (target: Player) => {
      if (!playerId) return;
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
    },
    [playerId, gameStateRef]
  );

  const handleCountdownTick = useCallback(
    (timeLeft: number) => {
      setCountdown(timeLeft);
    },
    [setCountdown]
  );

  useEffect(() => {
    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    socket.emit("joinGame", lobbyId, playerId, (game: GameState) => {
      console.log("updating game");
      setGameState(game);
      console.log("game state upon joining:", game);
    });
  }, [lobbyId, playerId]);

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

  useEffect(() => {
    const phase = gameState?.phase;
    const theme = phase === "night" || phase === "start" ? "dark" : "light";
    console.log("theme:", theme);
    setPhaseTheme(theme);
  }, [gameState]);

  const background = getBackground();
  return (
    player &&
    playerId &&
    gameState && (
      <PageTheme forcedTheme={phaseTheme}>
        <div
          className="flex flex-col min-h-screen w-full bg-cover bg-center"
          style={{
            backgroundImage: background,
          }}
        >
          {/* Phase Indicator  */}
          <div className="flex justify-center mt-5 w-full">
            <PhaseIndicator
              gameState={gameState}
              countdown={countdown}
              player={player}
            />
          </div>
          {/* Main Content */}
          {/* Player List */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4 py-12 max-w-5xl mx-auto">
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

          {witchTurn && isWitch && !gameState.witchKilling && (
            <div className="flex justify-center mt-5 w-full">
              <ActionPanel gameState={gameState} />
            </div>
          )}
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
