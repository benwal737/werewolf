import { useEffect, useState } from "react";
import { socket } from "../lib/socketClient";
import { usePlayer } from "./usePlayer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function useOngoingGame(parentPath: "home" | "lobby") {
  const { userId } = usePlayer();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (!userId) return;
    socket.emit("checkExistingGame", userId, (path: string | null) => {
      if (path) {
        setShowAlert(true);
        if (showAlert) return;
        const lobbyType = path.split("/")[0];
        const pathToPush = parentPath === "home" ? path : path.split("/")[1];
        toast(`Ongoing ${lobbyType} found`, {
          description: "Lobby ID: " + path.split("/").pop(),
          duration: Infinity,
          closeButton: true,
          position: "top-right",
          action: {
            label: "Reconnect",
            onClick: () => router.push(pathToPush),
          },
        });
      }
    });
  });
}
