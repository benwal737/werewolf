import { useState } from "react";
import { Game } from "@/game/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socketClient";
import { useParams } from "next/navigation";

interface ActionPanelProps {
  gameState: Game;
}

const ActionPanel = ({ gameState }: ActionPanelProps) => {
  const { id } = useParams();
  const lobbyId = id as string;
  const willDie = gameState.werewolfKill;
  const [chosen, setChosen] = useState<boolean>(false);
  const handleSave = () => {
    setChosen(true);
    socket.emit("witchSave", lobbyId, willDie?.id);
  };
  const handleKill = () => {
    setChosen(true);
    socket.emit("witchKilling", lobbyId);
  };
  return (
    <Card className=" flex flex-col gap-2 bg-slate-800 border-none p-5">
      <div className="flex gap-2">
        <Button
          className="w-20 m-auto"
          onClick={handleSave}
          disabled={gameState.witchSaved || chosen || !willDie}
        >
          Save ❤️
        </Button>
        <p className="m-auto text-white">({gameState.witchSaved ? 0 : 1})</p>
      </div>
      <div className="flex gap-2">
        <Button
          className="w-20 m-auto"
          onClick={handleKill}
          disabled={gameState.witchKilled || chosen}
        >
          Kill 🔪
        </Button>
        <p className="m-auto text-white">({gameState.witchKilled ? 0 : 1})</p>
      </div>
    </Card>
  );
};

export default ActionPanel;
