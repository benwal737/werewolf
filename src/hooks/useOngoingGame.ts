import { useEffect, useState } from "react";
import { socket } from "../lib/socketClient";
import { usePlayer } from "./usePlayer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function useOngoingGame() {
  const { userId } = usePlayer();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (!userId) return;
    socket.emit("checkExistingGame", userId, (paths: string[]) => {
      if (paths.length === 0) return;
      const path = paths[paths.length - 1];
      const lobbyType = path.split("/")[0];
      if (showAlert) return;
      toast(`Ongoing ${lobbyType} found`, {
        description: "Lobby ID: " + path.split("/").pop(),
        duration: Infinity,
        closeButton: true,
        position: "top-right",
        action: {
          label: "Reconnect",
          onClick: () => router.push(path),
        },
      });
      setShowAlert(true);
    });
  });
}
