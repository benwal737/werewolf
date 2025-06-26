import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  foretellerTurn: boolean;
  isForeteller: boolean;
  playerId: string;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  isSelected,
  foretellerTurn,
  isForeteller,
  playerId,
  onClick,
}: PlayerCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "px-6 py-4 flex flex-col items-center text-center transition-all cursor-pointer border-2 w-40",
        (player.role === "foreteller" && foretellerTurn && isForeteller) ||
          !player.alive
          ? "opacity-40 grayscale"
          : "opacity-100",
        isSelected ? "border-blue-500 ring ring-blue-300" : "border-muted"
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
