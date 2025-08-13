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
    socket.emit("leaveLobby", lobbyId, user.id);
    router.replace("/");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };
  return (
    <div className="bg-card/50 backdrop-blur-sm w-full flex justify-center items-center p-3 h-15 gap-5">
      {gameState.phase !== "end" ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="text-xl py-5"
              variant="default"
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-xs bg-transparent border-none shadow-none">
            <RoleCard role={user.role} />
          </DialogContent>
        </Dialog>
      ) : (
        <Button
          onClick={handleLeave}
          className="text-xl py-5"
          variant="destructive"
        >
          Leave
        </Button>
      )}
    </div>
  );
};

export default BottomBar;
