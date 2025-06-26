import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player } from "@/game/types";

interface PlayerCardProps {
  player: Player;
  foretellerTurn: boolean;
  isForeteller: boolean;
  playerId: string;
  foretellerSelected: boolean;
  onClick?: () => void;
}

export default function PlayerCard({
  player,
  foretellerTurn,
  isForeteller,
  playerId,
  foretellerSelected,
  onClick,
}: PlayerCardProps) {
  const foretellerDisable =
    player.role === "foreteller" && foretellerTurn && isForeteller;
  const foretellerChoosing =
    !foretellerSelected && isForeteller && player.id !== playerId;
  return (
    <Card
      onClick={onClick}
      className={cn(
        "px-6 py-4 flex flex-col items-center text-center transition-all border-2 w-40",
        foretellerDisable || !player.alive
          ? "opacity-40 grayscale"
          : "opacity-100",
        foretellerChoosing && "hover:bg-stone-300 cursor-pointer"
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
