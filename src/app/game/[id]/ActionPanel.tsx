import { useState } from "react";
import { GameState } from "@/game/types";
import Button from "@/components/ui/sound-button";
import { Card, CardContent } from "@/components/ui/card";
import { socket } from "@/lib/socketClient";
import { useParams } from "next/navigation";
import {
  GiSpellBook,
  GiHealthPotion,
  GiPotionOfMadness,
  GiNightSleep,
} from "react-icons/gi";

interface ActionPanelProps {
  gameState: GameState;
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
  const handleSkip = () => {
    setChosen(true);
    socket.emit("witchSkip", lobbyId);
  };
  return (
    <Card className="bg-card/50 backdrop-blur-sm sm:w-full lg:w-full h-45 mb-5 transition-all duration-500">
      <CardContent>
        <div className="flex items-center justify-between w-full h-full px-5">
          <div className="flex flex-col gap-2">
            <Button
              className="w-40"
              onClick={handleSave}
              disabled={gameState.witchSaved || chosen || !willDie}
            >
              <div className="flex justify-between w-full px-2">
                <div className="flex gap-1 items-center">
                  <GiHealthPotion />
                  Save
                </div>
                <span
                  className={`${
                    gameState.witchSaved ? "text-destructive" : ""
                  }`}
                >
                  ({gameState.witchSaved ? 0 : 1})
                </span>
              </div>
            </Button>
            <Button
              className="w-40"
              onClick={handleKill}
              disabled={gameState.witchKilled || chosen}
            >
              <div className="flex justify-between w-full px-2">
                <div className="flex gap-1 items-center">
                  <GiPotionOfMadness />
                  Kill
                </div>
                <span
                  className={`${
                    gameState.witchKilled ? "text-destructive" : ""
                  }`}
                >
                  ({gameState.witchKilled ? 0 : 1})
                </span>
              </div>
            </Button>
            <Button className="w-40" onClick={handleSkip} disabled={chosen}>
              <div className="flex justify-between w-full px-2">
                <div className="flex gap-1 items-center">
                  <GiNightSleep />
                  Skip
                </div>
                <span className="">(∞)</span>
              </div>
            </Button>
          </div>
          <GiSpellBook size={120} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
