import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";
import { GiCauldron, GiFarmer, GiWerewolf, GiThirdEye } from "react-icons/gi";
import { FaQuestion } from "react-icons/fa";

import { Game } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  gameState: Game;
  user: Player;
  foretellerRevealed: boolean | undefined;
  witchSelected: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  gameState,
  user,
  foretellerRevealed,
  witchSelected,
  onClick,
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
      return <GiWerewolf size={40} />;
    }
    if (user.id === player.id) {
      switch (user.role) {
        case "foreteller":
          return <GiThirdEye size={35} />;
        case "witch":
          return <GiCauldron size={35} />;
        case "villager":
          return <GiFarmer size={40} />;
      }
    }
    if (user.id !== player.id && player.alive && !gameOver && user.alive) {
      return <FaQuestion size={35} />;
    }
    if (!player.alive || gameOver || !user.alive) {
      switch (player.role) {
        case "werewolf":
          return <GiWerewolf size={40} />;
        case "foreteller":
          return <GiThirdEye size={35} />;
        case "witch":
          return <GiCauldron size={35} />;
        case "villager":
          return <GiFarmer size={40} />;
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
        "bg-card/50 backdrop-blur-sm px-6 py-4 flex flex-col items-center text-center transition-all w-50 justify-between",
        disable ? "opacity-50" : "",
        choosing && !selected && "hover:backdrop-brightness-125 cursor-pointer",
        selected &&
          "backdrop-saturate-200" +
            (werewolfTurn || voteStep ? " cursor-pointer" : ""),
      )}
    >
      <div className="text-lg font-semibold truncate w-full">
        {player.name}
        {user.id === player.id ? " (you)" : ""}
      </div>
      <div>{renderRoleIcon()}</div>
      {(voteStep ||
        (werewolfTurn && (user.role === "werewolf" || !user.alive))) && (
        <div className="text-lg font-semibold min-h-[1.5rem]">
          votes: {player.numVotes}
        </div>
      )}
      <div className={cn("text-sm mt-1", player.alive && "text-green-600", !player.alive && "text-red-500")}>
        {player.alive ? "Alive" : "Dead"}
      </div>
    </Card>
  );
}
