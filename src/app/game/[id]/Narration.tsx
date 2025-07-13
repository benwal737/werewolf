import React from "react";
import { TypographyH4 } from "@/components/ui/typography";

import { Game, Player } from "@/game/types";

interface NarrationProps {
  gameState: Game | null;
  player: Player | null;
  countdown: number | null;
}

const Narration = ({ gameState, player, countdown }: NarrationProps) => {
  if (!gameState) return null;

  const isForeteller = player?.role === "foreteller";
  const isWerewolf = player?.role === "werewolf";
  const isWitch = player?.role === "witch";
  const foretellerTurn = gameState.nightStep === "foreteller";
  const werewolfTurn = gameState.nightStep === "werewolves";
  const witchTurn = gameState.nightStep === "witch";
  const deathStep = gameState.nightStep === "deaths";
  const voteStep = gameState.nightStep === "vote";
  const resultsStep = gameState.nightStep === "results";
  const gameOver = gameState.phase === "end";

  let narration: React.ReactNode = <span>Some other phase</span>;

  if (foretellerTurn) {
    narration = isForeteller ? (
      <span>Select a player to reveal their role</span>
    ) : (
      <span>Foreteller is revealing a role</span>
    );
  } else if (werewolfTurn) {
    narration = isWerewolf ? (
      <span>Select a player to kill</span>
    ) : (
      <span>Werewolves selecting a player to kill</span>
    );
  } else if (witchTurn) {
    if (isWitch) {
      if (gameState.witchKilling) {
        narration = <span>Choose a player to kill</span>;
      } else if (gameState.werewolfKill) {
        narration = (
          <>
            <span>
              <b className="text-red-500">{gameState.werewolfKill.name}</b> will
              die tonight.
            </span>
            <br />
            <span>Choose an available action, or do nothing</span>
          </>
        );
      } else {
        narration = (
          <>
            <span>No one will die tonight.</span>
            <br />
            <span>Choose an available action, or do nothing</span>
          </>
        );
      }
    } else {
      narration = <span>The witch has awoken</span>;
    }
  } else if (deathStep) {
    narration = gameState.nightDeaths?.length ? (
      <span>
        These players died last night:{" "}
        <b className="text-red-500">
          {gameState.nightDeaths.map((player) => player.name).join(", ")}
        </b>
      </span>
    ) : (
      <span>No one died last night</span>
    );
  } else if (voteStep) {
    narration = <span>Vote for a player to die</span>;
  } else if (resultsStep) {
    narration = gameState.villageKill ? (
      <span>
        <b className="text-red-500">{gameState.villageKill.name}</b> was killed
        by the village.
      </span>
    ) : (
      <span>No one was killed today</span>
    );
  } else if (gameOver) {
    narration =
      gameState.winner === "werewolves" ? (
        <span>Werewolves win!</span>
      ) : gameState.winner === "villagers" ? (
        <span>Villagers win!</span>
      ) : (
        <span>It's a draw!</span>
      );
  }

  return (
    <div className="flex items-center w-full py-4 relative">
      <div className="flex-1 text-center">
        <TypographyH4>{narration}</TypographyH4>
      </div>
      <div className="flex items-center gap-1 absolute right-6 top-1/2 -translate-y-1/2 bg-slate-800 rounded px-3 py-1 shadow-lg min-w-[6ch] justify-center">
        <span role="img" aria-label="timer">⏰</span>
        <TypographyH4 className="w-[2ch] tabular-nums text-center">{countdown ?? ""}</TypographyH4>
      </div>
    </div>
  );
};

export default Narration;
