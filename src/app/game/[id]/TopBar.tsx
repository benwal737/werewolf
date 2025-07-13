import React from "react";
import { GamePhase } from "@/game/types";
import { TypographyH1 } from "@/components/ui/typography";

interface TopBarProps {
  phase: GamePhase | undefined;
}

const TopBar = ({ phase }: TopBarProps) => {
  return (
    <div className="p-3 w-full bg-primary">
      <TypographyH1>{phase === "end" ? "GAME OVER" : phase?.toLocaleUpperCase()}</TypographyH1>
    </div>
  );
};

export default TopBar;
