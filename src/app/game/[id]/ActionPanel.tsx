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
  const playerId = gameState.host;
  const [chosen, setChosen] = useState<boolean>(false);
  const handleSave = () => {
    setChosen(true);
    socket.emit("witchSave", lobbyId, playerId);
  };
  const handleKill = () => {
    setChosen(true);
    socket.emit("witchKilling", lobbyId, playerId);
  };
  return (
    <Card className=" flex flex-col gap-2 bg-slate-800 border-none p-5">
      <div className="flex gap-2">
      <Button className="w-20 m-auto" onClick={handleSave} disabled={gameState.witchSave !== undefined || chosen}>Save ❤️</Button>
      <p className="m-auto text-white">({gameState.witchSave ? 0 : 1})</p>
      </div>
      <div className="flex gap-2">
      <Button className="w-20 m-auto" onClick={handleKill} disabled={gameState.witchKill !== undefined || chosen}>Kill 🔪</Button>
      <p className="m-auto text-white">({gameState.witchKill ? 0 : 1})</p>
      </div>
    </Card>
  );
};

export default ActionPanel;
