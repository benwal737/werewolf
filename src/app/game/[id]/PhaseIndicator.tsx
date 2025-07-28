import React from "react";
import { GameState, Player } from "@/game/types";
import { Card, CardContent } from "@/components/ui/card";
import CountdownTimer from "./CountdownTimer";
import Narration from "./Narration";
import { Moon, Sun } from "lucide-react";

interface PhaseIndicatorProps {
  gameState: GameState;
  countdown: number | null;
  player: Player;
}

const PhaseIndicator = ({
  gameState,
  countdown,
  player,
}: PhaseIndicatorProps) => {
  let heading = "";
  switch (gameState.phase) {
    case "night":
      heading = "Night";
      break;
    case "day":
      heading = "Day";
      break;
    case "end":
      heading = "Game Over";
      break;
  }

  const phase = gameState.phase;
  const phaseNumber = gameState.dayNum;
  return (
    <Card className="bg-card/50 backdrop-blur-sm w-full mx-10 md:mx-20">
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            {phase === "night" ? (
              <Moon className="h-12 w-12 fill-amber-300 stroke-border" />
            ) : (
              <Sun className="h-12 w-12 fill-amber-300" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {heading} {phase !== "end" && phaseNumber}
            </h2>
            <Narration gameState={gameState} player={player} />
          </div>
        </div>

        {phase !== "end" && (
          <div className="text-right">
            <CountdownTimer countdown={countdown} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhaseIndicator;
