import { useState } from "react";
import { Game } from "@/game/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socketClient";
import { useParams } from "next/navigation";
import { clickSound } from "@/utils/sounds";

interface ActionPanelProps {
  gameState: Game;
}

const ActionPanel = ({ gameState }: ActionPanelProps) => {
  const { id } = useParams();
  const lobbyId = id as string;
  const willDie = gameState.werewolfKill;
  const [chosen, setChosen] = useState<boolean>(false);
  const handleSave = () => {
    clickSound();
    setChosen(true);
    socket.emit("witchSave", lobbyId, willDie?.id);
  };
  const handleKill = () => {
    clickSound();
    setChosen(true);
    socket.emit("witchKilling", lobbyId);
  };
  return (
    <Card className=" flex flex-col gap-2 p-5 bg-card/50 backdrop-blur-sm">
      <div className="flex gap-2">
        <Button
          className="w-20 m-auto"
          onClick={handleSave}
          disabled={gameState.witchSaved || chosen || !willDie}
        >
          Save
        </Button>
        <p
          className={
            gameState.witchSaved
              ? "text-muted m-auto"
              : "text-muted-foreground m-auto"
          }
        >
          ({gameState.witchSaved ? 0 : 1})
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          className="w-20 m-auto"
          onClick={handleKill}
          disabled={gameState.witchKilled || chosen}
        >
          Kill
        </Button>
        <p
          className={
            gameState.witchKilled
              ? "text-muted m-auto"
              : "text-muted-foreground m-auto"
          }
        >
          ({gameState.witchKilled ? 0 : 1})
        </p>
      </div>
    </Card>
  );
};

export default ActionPanel;
