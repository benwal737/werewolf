"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Game as GameState, Role, GamePhase, Player } from "@/game/types";
import BottomBar from "./BottomBar";
import TopBar from "./TopBar";
import ActionPanel from "./ActionPanel";
import { getPlayer } from "@/utils/getPlayer";
import PlayerCard from "./PlayerCard";
import { toast } from "sonner";
import Narration from "./Narration";

const Game = () => {
  const router = useRouter();
  const lobbyId = useParams().id;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const hasJoinedRef = useRef(false);

  const [foretellerRevealed, setForetellerRevealed] = useState(false);
  const [witchSelected, setWitchSelected] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { playerId } = getPlayer();
  const player = playerId ? gameState?.players[playerId] : null;

  const isForeteller = player?.role === "foreteller";
  const foretellerTurn = gameState?.nightStep === "foreteller";
  const isWerewolf = player?.role === "werewolf";
  const werewolfTurn = gameState?.nightStep === "werewolves";
  const isWitch = player?.role === "witch";
  const witchTurn = gameState?.nightStep === "witch";
  const deathStep = gameState?.nightStep === "deaths";

  const narration = foretellerTurn ? (
    isForeteller ? (
      <span>Select a player to reveal their role</span>
    ) : (
      <span>Foreteller is revealing a role</span>
    )
  ) : werewolfTurn ? (
    isWerewolf ? (
      <span>Select a player to kill</span>
    ) : (
      <span>Werewolves selecting a player to kill</span>
    )
  ) : witchTurn ? (
    isWitch ? (
      gameState.witchKilling ? (
        <>
          <span>Choose a player to kill</span>
        </>
      ) : gameState.werewolfKill ? (
        <>
          <span>
            <b className="text-red-500">{gameState.werewolfKill.name}</b> will
            die tonight.
          </span>
          <br />
          <span>Choose an avaliable action, or do nothing</span>
        </>
      ) : (
        <>
          <span>No one will die tonight.</span>
          <br />
          <span>Choose an avaliable action, or do nothing</span>
        </>
      )
    ) : (
      <span>The witch has awoken</span>
    )
  ) : deathStep ? (
    gameState.nightDeaths?.length ? (
      <span>
        These players died last night:{" "}
        <b className="text-red-500">
          {gameState.nightDeaths?.map((player) => player.name).join(", ")}
        </b>
      </span>
    ) : (
      <span>No one died last night</span>
    )
  ) : (
    <span>Some other phase</span>
  );

  const foretellerAction = (target: Player) => {
    if (foretellerRevealed) return;
    socket.emit("foretellerSelected", lobbyId, target.id);
    setForetellerRevealed(true);
  };

  const werewolfAction = (target: Player) => {
    socket.emit("playerVoted", lobbyId, playerId, target.id);
  };

  const witchAction = (target: Player) => {
    if (witchSelected) return;
    socket.emit("witchKilled", lobbyId, target.id);
    setWitchSelected(true);
  };

  const getClickAction = (target: Player) => {
    if (playerId === target.id) return undefined;
    if (!gameState?.players[target.id].alive) return undefined;
    if (foretellerTurn && isForeteller) {
      return () => foretellerAction(target);
    } else if (werewolfTurn && isWerewolf) {
      return () => werewolfAction(target);
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

  return (
    playerId && (
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Bar */}
        <div className="w-full">
          <TopBar phase={gameState?.phase as GamePhase} />
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto mt-5">
          <Narration narration={narration} countdown={countdown} />
          {/* Player List */}
          {gameState && (
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-4 py-12 max-w-5xl mx-auto">
                {Object.values(gameState.players).map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    gameState={gameState}
                    user={gameState.players[playerId]}
                    foretellerSelected={foretellerRevealed}
                    witchSelected={witchSelected}
                    onClick={getClickAction(player)}
                  />
                ))}
              </div>
            </div>
          )}
          {gameState && witchTurn && isWitch && !gameState.witchKilling && (
            <div className="flex justify-center mt-5 w-full">
              <ActionPanel gameState={gameState} />
            </div>
          )}
        </div>
        {/* Bottom Bar */}
        <div className="w-full flex justify-center items-center fixed bottom-0">
          <BottomBar role={player?.role as Role} />
        </div>
      </div>
    )
  );
};

export default Game;
