import React from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import Button from "@/components/ui/sound-button";
import RoleCard from "./RoleCard";
import { socket } from "@/lib/socketClient";
import { useRouter } from "next/navigation";
import { useGameContext } from "@/context/GameContext";
import { useParams } from "next/navigation";

const BottomBar = () => {
  const router = useRouter();
  const { gameState, user } = useGameContext();
  const lobbyId = useParams().id;
  const handleLeave = () => {
    socket.emit("leaveGame", lobbyId, user?.id);
    router.push("/");
  };
  return (
    <div className="bg-card/50 backdrop-blur-sm w-full flex justify-center items-center p-3 h-18 gap-5">
      <Dialog>
        <DialogTrigger asChild>
          {user && (
            <Button
              type="button"
              className="text-2xl py-6 w-30"
              variant="default"
            >
              Your Role
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="p-0 max-w-xs bg-transparent border-none shadow-none">
          <RoleCard role={user.role} />
        </DialogContent>
      </Dialog>
      {gameState.phase === "end" && (
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
