import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player, Role } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  foretellerTurn: boolean;
  werewolfTurn: boolean;
  role: Role;
  playerId: string;
  foretellerSelected: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  foretellerTurn,
  werewolfTurn,
  role,
  playerId,
  foretellerSelected,
  onClick,
}: PlayerCardProps) {
  const disable =
    (player.role === "foreteller" && foretellerTurn && role === "foreteller") ||
    (player.role === "werewolf" && werewolfTurn && role === "werewolf") ||
    !player.alive;
  const choosing =
    (!foretellerSelected && role === "foreteller" && player.id !== playerId && player.alive) ||
    (werewolfTurn && role === "werewolf" && player.role !== "werewolf" && player.alive);
  return (
    <Card
      onClick={onClick}
      className={cn(
        "px-6 py-4 flex flex-col items-center text-center transition-all border-2 w-40",
        disable ? "opacity-40 grayscale" : "opacity-100",
        choosing && "hover:bg-stone-300 cursor-pointer"
      )}
    >
      <div className="text-lg font-semibold truncate w-full">
        {player.name}
        {playerId === player.id ? " (you)" : ""}
      </div>
      <div className="text-sm mt-1 text-muted-foreground">
        {player.alive ? "Alive" : "Dead"}
      </div>
    </Card>
  );
}
