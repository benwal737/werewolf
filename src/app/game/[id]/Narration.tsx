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

  let narration: React.ReactNode = <span>Some other phase</span>;

  if (foretellerTurn) {
    narration = isForeteller
      ? <span>Select a player to reveal their role</span>
      : <span>Foreteller is revealing a role</span>;
  } else if (werewolfTurn) {
    narration = isWerewolf
      ? <span>Select a player to kill</span>
      : <span>Werewolves selecting a player to kill</span>;
  } else if (witchTurn) {
    if (isWitch) {
      if (gameState.witchKilling) {
        narration = <span>Choose a player to kill</span>;
      } else if (gameState.werewolfKill) {
        narration = (
          <>
            <span>
              <b className="text-red-500">{gameState.werewolfKill.name}</b> will die tonight.
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
    narration = gameState.nightDeaths?.length
      ? (
        <span>
          These players died last night:{" "}
          <b className="text-red-500">
            {gameState.nightDeaths.map((player) => player.name).join(", ")}
          </b>
        </span>
      )
      : <span>No one died last night</span>;
  } else if (voteStep) {
    narration = <span>Vote for a player to die</span>;
  } else if (resultsStep) {
    narration = gameState.villageKill ? (
      <span>
        <b className="text-red-500">{gameState.villageKill.name}</b> was killed by the village.
      </span>
    ) : (
      <span>No one was killed today</span>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      <TypographyH4>{narration}</TypographyH4>
      <TypographyH4>{countdown ?? ""}</TypographyH4>
    </div>
  );
};

export default Narration;
