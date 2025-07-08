import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";
import { GiCauldron, GiFarmer, GiWerewolf, GiThirdEye } from "react-icons/gi";
import { FaQuestion } from "react-icons/fa";

interface PlayerCardProps {
  player: Player;
  foretellerTurn: boolean;
  werewolfTurn: boolean;
  user: Player;
  foretellerSelected: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  foretellerTurn,
  werewolfTurn,
  user,
  foretellerSelected,
  onClick,
}: PlayerCardProps) {
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
    if (user.id !== player.id && player.alive) {
      return <FaQuestion size={35} />;
    }
    if (!player.alive) {
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
      (werewolfTurn && user.role === "werewolf")) &&
      player.id === user.id) ||
    !player.alive;
  const choosing =
    (!foretellerSelected &&
      foretellerTurn &&
      user.role === "foreteller" &&
      player.id !== user.id &&
      player.alive) ||
    (werewolfTurn &&
      user.role === "werewolf" &&
      player.role !== "werewolf" &&
      player.alive);
  const selected = user.vote === player.id;
  return (
    <Card
      onClick={onClick}
      className={cn(
        "px-6 py-4 flex flex-col items-center text-center transition-all border-2 w-50 justify-between",
        disable ? "opacity-40 grayscale" : "opacity-100",
        choosing && !selected && "hover:bg-stone-300 cursor-pointer",
        selected && "bg-emerald-100"
      )}
    >
      <div className="text-lg font-semibold truncate w-full">
        {player.name}
        {user.id === player.id ? " (you)" : ""}
      </div>
      <div>{renderRoleIcon()}</div>
      {werewolfTurn && user.role === "werewolf" && (
        <div className="text-lg font-semibold min-h-[1.5rem]">
          votes: {player.numVotes}
        </div>
      )}
      <div className="text-sm mt-1 text-muted-foreground">
        {player.alive ? "Alive" : "Dead"}
      </div>
    </Card>
  );
}
