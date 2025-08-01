import React from "react";
import { GameState, Player } from "@/game/types";
import { isLoser, isWinner } from "@/utils/winConditions";
import { useGameContext } from "@/context/GameContext";

const Narration = () => {
  const { gameState, user } = useGameContext();
  const isForeteller = user.role === "foreteller";
  const isWerewolf = user.role === "werewolf";
  const isWitch = user.role === "witch";
  const { substep: nightStep, phase, witchSave, witchKill } = gameState;
  const gameOver = phase === "end";

  function getForetellerNarration() {
    const revealed = gameState.foretellerRevealed;
    return isForeteller ? (
      revealed ? (
        <p>
          You saw a vision of <b>{revealed.name}</b> - they are a{" "}
          <b
            className={
              revealed.role === "werewolf"
                ? "text-destructive"
                : "text-emerald-600"
            }
          >
            {revealed.role}
          </b>
        </p>
      ) : (
        <p>Select a player to reveal their role</p>
      )
    ) : (
      <p>Foreteller is revealing a role...</p>
    );
  }

  function getWerewolfNarration() {
    if (isWerewolf && user.alive) return <p>Choose a player to kill.</p>;
    return <p>Werewolves are hunting...</p>;
  }

  function getWitchNarration() {
    if (!isWitch) return <p>The witch is brewing...</p>;
    if (gameState.witchKilling && !witchKill) {
      return <p>Choose a player to kill</p>;
    } else if (gameState.witchKilling && witchKill) {
      return (
        <p>
          You chose to kill <b className="text-destructive">{witchKill.name}</b>
        </p>
      );
    } else if (gameState.werewolfKill && !witchSave) {
      return (
        <>
          <p>
            <b className="text-destructive">{gameState.werewolfKill.name}</b>{" "}
            will die tonight. Choose an available action, or do nothing.
          </p>
        </>
      );
    } else if (gameState.werewolfKill && witchSave) {
      return (
        <p>
          You saved{" "}
          <b className="text-emerald-600">{gameState.werewolfKill.name}</b>
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
        <b className="text-destructive">
          {gameState.nightDeaths.map((player) => player.name).join(", ")}
        </b>
      </p>
    ) : (
      <p>No one died last night.</p>
    );
  }

  function getVoteStepNarration() {
    return user?.alive ? (
      <p>Vote on a player to kill</p>
    ) : (
      <p>The village is voting...</p>
    );
  }

  function getResultsStepNarration() {
    return gameState.villageKill ? (
      <p>
        <b className="text-destructive">{gameState.villageKill.name}</b> was
        killed by the village.
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

  return (
    <div
      className={
        isLoser(gameState, user)
          ? "text-destructive text-lg"
          : isWinner(gameState, user)
          ? "text-emerald-600 text-lg"
          : "text-muted-foreground text-lg"
      }
    >
      {narration}
    </div>
  );
};

export default Narration;
