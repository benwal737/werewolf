import React from "react";
import { GamePhase, Role } from "@/game/types";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import Button from "@/components/ui/sound-button";
import RoleCard from "./RoleCard";
import { socket } from "@/lib/socketClient";
import { useRouter } from "next/navigation";

interface BottomBarProps {
  role: Role | undefined;
  phase: GamePhase;
  lobbyId: string;
  playerId: string;
}

const BottomBar = ({ role, phase, lobbyId, playerId }: BottomBarProps) => {
  const router = useRouter();
  const handleLeave = () => {
    socket.emit("leaveGame", lobbyId, playerId);
    router.push("/");
  };
  return (
    <div className="bg-card/50 backdrop-blur-sm w-full flex justify-center items-center p-3 h-18 gap-5">
      <Dialog>
        <DialogTrigger asChild>
          {role && (
            <Button
              type="button"
              className="text-2xl py-6 w-30"
              variant="default"
            >
              {role[0].toUpperCase() + role.slice(1)}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="p-0 max-w-xs bg-transparent border-none shadow-none">
          <RoleCard role={role} />
        </DialogContent>
      </Dialog>
      {phase === "end" && (
        <Button
          onClick={handleLeave}
          className="text-2xl py-6 w-30"
          variant="destructive"
        >
          Leave
        </Button>
      )}
    </div>
  );
};

export default BottomBar;
