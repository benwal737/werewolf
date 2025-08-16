import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import CountdownTimer from "./CountdownTimer";
import Narration from "./Narration";
import { Moon, Sun } from "lucide-react";
import { useGameContext } from "@/context/GameContext";

const PhaseIndicator = () => {
  const { gameState, user } = useGameContext();
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

  const showTimer =
    ((gameState.substep === "foreteller" && user.role === "foreteller") ||
      (gameState.substep === "werewolves" && user.role === "werewolf") ||
      (gameState.substep === "witch" && user.role === "witch") ||
      gameState.substep === "deaths" ||
      gameState.substep === "vote" ||
      gameState.substep === "results" ||
      !user.alive) &&
    gameState.phase !== "end";

  const phaseNumber = gameState.dayNum;
  return (
    <Card className="bg-card/50 backdrop-blur-sm w-full mx-5 md:mx-10 lg:mx-20">
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            {gameState.phase === "night" ? (
              <Moon className="h-12 w-12 fill-amber-300 stroke-border" />
            ) : (
              <Sun className="h-12 w-12 fill-amber-300" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {heading} {gameState.phase !== "end" && phaseNumber}
              </h2>
              {showTimer && (
                <div className="block md:hidden text-right">
                  <CountdownTimer />
                </div>
              )}
            </div>
            <Narration />
          </div>
        </div>

        {showTimer && (
          <div className="hidden md:block text-right">
            <CountdownTimer />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhaseIndicator;
