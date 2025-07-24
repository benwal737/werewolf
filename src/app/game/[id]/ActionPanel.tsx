import { useState } from "react";
import { GameState } from "@/game/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socketClient";
import { useParams } from "next/navigation";
import { clickSound } from "@/utils/sounds";
import { GiSpellBook } from "react-icons/gi";

interface ActionPanelProps {
  gameState: GameState;
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
    <Card className=" flex flex-col gap-2 p-5 bg-card/50 backdrop-blur-sm w-1/2">
      {gameState.witchKilling ? (
        <p className="text-center">
          Choose Wisely. One you select a player, your answer will be locked in.
        </p>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <GiSpellBook size={80} color="foreground-muted" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button
                className="w-20"
                onClick={handleSave}
                disabled={gameState.witchSaved || chosen || !willDie}
              >
                Save
              </Button>
              <p
                className={
                  gameState.witchSaved ? "text-muted" : "text-muted-foreground"
                }
              >
                ({gameState.witchSaved ? 0 : 1})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="w-20"
                onClick={handleKill}
                disabled={gameState.witchKilled || chosen}
              >
                Kill
              </Button>
              <p
                className={
                  gameState.witchKilled ? "text-muted" : "text-muted-foreground"
                }
              >
                ({gameState.witchKilled ? 0 : 1})
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActionPanel;
