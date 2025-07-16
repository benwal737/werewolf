import React from "react";
import { Game, Player } from "@/game/types";

interface NarrationProps {
  gameState: Game;
  player: Player;
}

const Narration = ({ gameState, player }: NarrationProps) => {
  const isForeteller = player.role === "foreteller";
  const isWerewolf = player.role === "werewolf";
  const isWitch = player.role === "witch";
  const { substep: nightStep, phase, witchSave, witchKill } = gameState;
  const gameOver = phase === "end";

  function getForetellerNarration() {
    return isForeteller ? (
      <p>Select a player to reveal their role</p>
    ) : (
      <p>Foreteller is revealing a role</p>
    );
  }

  function getWerewolfNarration() {
    if (isWerewolf && player.alive) return <p>Choose a player to kill</p>;
    return <p>Werewolves are hunting</p>;
  }

  function getWitchNarration() {
    if (!isWitch) return <p>The witch is casting spells</p>;
    if (gameState.witchKilling && !witchKill) {
      return <p>Choose a player to kill</p>;
    } else if (gameState.witchKilling && witchKill) {
      return (
        <p>
          You chose to kill <b className="text-red-500">{witchKill.name}</b>
        </p>
      );
    } else if (gameState.werewolfKill && !witchSave) {
      return (
        <>
          <p>
            <b className="text-red-500">{gameState.werewolfKill.name}</b> will
            die tonight. Choose an available action, or do nothing.
          </p>
        </>
      );
    } else if (gameState.werewolfKill && witchSave) {
      return (
        <p>
          You saved{" "}
          <b className="text-green-500">{gameState.werewolfKill.name}</b>
        </p>
      );
    } else {
      return (
        <>
          <p>
            No one will die tonight. Choose an available action, or do nothing.
          </p>
        </>
      );
    }
  }

  function getDeathStepNarration() {
    return gameState.nightDeaths?.length ? (
      <p>
        These players died last night:{" "}
        <b className="text-red-500">
          {gameState.nightDeaths.map((player) => player.name).join(", ")}
        </b>
      </p>
    ) : (
      <p>No one died last night.</p>
    );
  }

  function getVoteStepNarration() {
    return player?.alive ? (
      <p>Vote on a player to kill</p>
    ) : (
      <p>The village is voting</p>
    );
  }

  function getResultsStepNarration() {
    return gameState.villageKill ? (
      <p>
        <b className="text-red-500">{gameState.villageKill.name}</b> was killed
        by the village.
      </p>
    ) : (
      <p>The village could not agree on a player to kill.</p>
    );
  }

  function getGameOverNarration() {
    if (gameState.winner === "werewolves") return <p>Werewolves win!</p>;
    if (gameState.winner === "villagers") return <p>Villagers win!</p>;
    return <p>It&apos;s a draw!</p>;
  }

  let narration: React.ReactNode = <p>Some other phase</p>;
  if (gameOver) {
    narration = getGameOverNarration();
  } else {
    switch (nightStep) {
      case "foreteller":
        narration = getForetellerNarration();
        break;
      case "werewolves":
        narration = getWerewolfNarration();
        break;
      case "witch":
        narration = getWitchNarration();
        break;
      case "deaths":
        narration = getDeathStepNarration();
        break;
      case "vote":
        narration = getVoteStepNarration();
        break;
      case "results":
        narration = getResultsStepNarration();
        break;
      default:
        narration = <p>Loading...</p>;
      // setTimeout(() => {
      //   window.location.reload();
      // }, 1000);
    }
  }

  return <div className="text-muted-foreground text-lg">{narration}</div>;
};

export default Narration;
