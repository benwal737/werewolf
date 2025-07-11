import React from "react";
import { Game } from "@/game/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ActionPanelProps {
  gameState: Game;
}

const ActionPanel = ({ gameState }: ActionPanelProps) => {
  return (
    <Card className=" flex flex-col gap-2 bg-slate-800 border-none p-5">
      <Button className="w-20 m-auto">Save ❤️‍🩹</Button>
      <Button className="w-20 m-auto">Kill 🔪</Button>
    </Card>
  );
};

export default ActionPanel;
