import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";
import { GiCauldron, GiVillage, GiWolfHead, GiThirdEye } from "react-icons/gi";
import { FaQuestion } from "react-icons/fa";

import { GameState } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  gameState: GameState;
  user: Player;
  foretellerRevealed: boolean | undefined;
  witchSelected: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PlayerCard({
  player,
  gameState,
  user,
  foretellerRevealed,
  witchSelected,
  onClick,
  className,
}: PlayerCardProps) {
  const foretellerTurn = gameState.substep === "foreteller";
  const werewolfTurn = gameState.substep === "werewolves";
  const witchTurn = gameState.substep === "witch";
  const witchKilling = gameState.witchKilling;
  const witchKill = gameState.witchKill;
  const voteStep = gameState.substep === "vote";
  const gameOver = gameState.phase === "end";
  const renderRoleIcon = () => {
    if (user.role === "werewolf" && player.role === "werewolf") {
      return (
        <div className={`icon-badge ${player.color}`}>
          <GiWolfHead size={30} />
        </div>
      );
    }
    if (user.id === player.id) {
      switch (user.role) {
        case "foreteller":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiThirdEye size={30} />
            </div>
          );
        case "witch":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiCauldron size={30} />
            </div>
          );
        case "villager":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiVillage size={30} />
            </div>
          );
        case "werewolf":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiWolfHead size={30} />
            </div>
          );
        case "villager":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiVillage size={30} />
            </div>
          );
      }
    }
    if (user.id !== player.id && player.alive && !gameOver && user.alive) {
      return (
        <div className={`icon-badge ${player.color}`}>
          <FaQuestion size={30} />
        </div>
      );
    }
    if (!player.alive || gameOver || !user.alive) {
      switch (player.role) {
        case "werewolf":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiWolfHead size={30} />
            </div>
          );
        case "foreteller":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiThirdEye size={30} />
            </div>
          );
        case "witch":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiCauldron size={30} />
            </div>
          );
        case "villager":
          return (
            <div className={`icon-badge ${player.color}`}>
              <GiVillage size={30} />
            </div>
          );
      }
    }
    return null;
  };
  const disable =
    (((foretellerTurn && user.role === "foreteller") ||
      (werewolfTurn && user.role === "werewolf") ||
      (witchTurn && user.role === "witch" && witchKilling)) &&
      player.id === user.id) ||
    (voteStep && player.id === user.id && player.alive && user.alive) ||
    !player.alive;
  const isForetellerChoosing =
    !foretellerRevealed &&
    foretellerTurn &&
    user.role === "foreteller" &&
    player.id !== user.id;

  const isWerewolfChoosing =
    werewolfTurn && user.role === "werewolf" && player.role !== "werewolf";

  const isWitchChoosing =
    !witchSelected &&
    witchTurn &&
    user.role === "witch" &&
    witchKilling &&
    player.id !== user.id;

  const isVoteChoosing = voteStep && player.id !== user.id;

  const choosing =
    (isForetellerChoosing ||
      isWerewolfChoosing ||
      isWitchChoosing ||
      isVoteChoosing) &&
    player.alive &&
    user.alive;
  const selected =
    user.vote === player.id || (witchKilling && witchKill?.id === player.id);
  return (
    <Card
      onClick={onClick}
      className={cn(
        "bg-card/50 backdrop-blur-sm px-6 py-4 transition-all h-20 justify-center",
        className,
        disable ? "opacity-50" : "",
        choosing && !selected && "hover:backdrop-brightness-125 cursor-pointer",
        selected &&
          "backdrop-saturate-200" +
            (werewolfTurn || voteStep ? " cursor-pointer" : "")
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>{renderRoleIcon()}</div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold">{player.name}</span>
            <span className="text-md text-muted-foreground">
              {user.id === player.id && "(You)"}
            </span>
          </div>
        </div>
        {(voteStep ||
          (werewolfTurn && (user.role === "werewolf" || !user.alive))) && (
          <div className="text-lg font-semibold min-h-[1.5rem]">
            votes: {player.numVotes}
          </div>
        )}
        <div
          className={cn(
            "text-sm mt-1",
            player.alive && "text-green-600",
            !player.alive && "text-red-500"
          )}
        >
          {player.alive ? "Alive" : "Dead"}
        </div>
      </div>
    </Card>
  );
}
