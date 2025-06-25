import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  isSelected,
  onClick,
}: PlayerCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "px-6 py-4 flex flex-col items-center text-center transition-all cursor-pointer border-2 w-30",
        player.alive ? "opacity-100" : "opacity-40 grayscale",
        isSelected ? "border-blue-500 ring ring-blue-300" : "border-muted"
      )}
    >
      <div className="text-lg font-semibold truncate w-full">{player.name}</div>
      <div className="text-sm mt-1 text-muted-foreground">
        {player.alive ? "Alive" : "Dead"}
      </div>
    </Card>
  );
}
