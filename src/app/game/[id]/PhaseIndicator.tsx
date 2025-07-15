import React from "react";
import { GamePhase, Game } from "@/game/types";
import { TypographyH1 } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";

interface PhaseIndicatorProps {
  gameState: Game;
}

const PhaseIndicator = ({ gameState }: PhaseIndicatorProps) => {
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

  return (
    <Card className="bg-card/50">
      <CardContent>
        <TypographyH1>
          {heading} {gameState.dayNum}
        </TypographyH1>
      </CardContent>
    </Card>
  );
};

export default PhaseIndicator;
