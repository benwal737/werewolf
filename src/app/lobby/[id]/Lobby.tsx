"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { v4 as uuidv4 } from "uuid";
import { Player } from "@/game/types";
import PlayerList from "./PlayerList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TypographyH1,
  TypographyH2,
  TypographySmall,
} from "@/components/ui/typography";

export const getPlayer = () => {
  let playerId = localStorage.getItem("playerId");
  let playerName = localStorage.getItem("playerName");
  if (!playerId) {
    playerId = uuidv4();
    localStorage.setItem("playerId", playerId);
  }

  return { playerId, playerName };
};

export default function Lobby() {
  const lobbyId = useParams().id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const { playerName, playerId } = getPlayer();
  const router = useRouter();

  useEffect(() => {
    console.log("emitting joinLobby event with", lobbyId, playerId, playerName);
    socket.emit("joinLobby", lobbyId, playerId, playerName);

    const handleJoinError = (msg: string) => {
      alert(msg);
      router.push("/");
    };

    const handlePlayerJoined = (data: {
      players: Record<string, Player>;
      host: string;
    }) => {
      setPlayers(Object.values(data.players));
      setHost(data.host);
    };

    const handleKicked = () => {
      alert("You have been kicked from the lobby");
      router.push("/");
    };

    socket.on("joinError", handleJoinError);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("kicked", handleKicked);
    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("joinError", handleJoinError);
      socket.off("kicked", handleKicked);
    };
  }, [lobbyId, playerId, playerName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      <Card className="w-full max-w-xl shadow-xl bg-slate-600">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <TypographyH1 className="text-center">Game Lobby</TypographyH1>
          <div className="">
            Lobby ID: <span className="font-mono">{lobbyId}</span>
          </div>

          <div className="w-full flex justify-end">
            <Button
              variant="destructive"
              onClick={() => {
                socket.emit("leaveLobby", lobbyId, playerId);
                localStorage.removeItem("playerName");
                router.push("/");
              }}
            >
              Leave Lobby
            </Button>
          </div>

          <div className="w-full">
            <TypographyH2 className="mb-2">Players</TypographyH2>
            <PlayerList
              players={players}
              host={host}
              playerId={playerId}
              lobbyId={lobbyId}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
