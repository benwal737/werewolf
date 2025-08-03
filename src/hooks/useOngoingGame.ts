import { useEffect } from "react";
import { socket } from "../lib/socketClient";
import { usePlayer } from "./usePlayer";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function useOngoingGame() {
  const { userId } = usePlayer();
  const router = useRouter();
  useEffect(() => {
    if (!userId) return;
    socket.emit("checkExistingGame", userId, (path: string | null) => {
      if (path) {
        toast("Existing game found", {
          description: "Lobby ID: " + path.split("/").pop(),
          duration: Infinity,
          closeButton: true,
          position: "top-right",
          action: {
            label: "Reconnect",
            onClick: () => router.push(path),
          },
        });
      }
    });
  });
}
