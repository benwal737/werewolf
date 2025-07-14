"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Player } from "@/game/types";
import PlayerList from "./PlayerList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH1, TypographyH4 } from "@/components/ui/typography";
import { getPlayer } from "@/utils/getPlayer";

export default function Lobby() {
  const lobbyId = useParams().id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { playerName, playerId } = getPlayer();
  const router = useRouter();

  const handleStartGame = () => {
    console.log("clicked start");
    socket.emit("startGameCountdown", lobbyId);
  };

  useEffect(() => {
    socket.emit("joinLobby", lobbyId, playerId, playerName);

    const handleJoinError = (msg: string) => {
      alert(msg);
      router.push("/");
    };

    const handlePlayerJoined = (data: {
      players: Record<string, Player>;
      host: string;
      totalPlayers: number;
    }) => {
      setPlayers(Object.values(data.players));
      setHost(data.host);
      setTotalPlayers(data.totalPlayers);
    };

    const handleKicked = () => {
      alert("You have been kicked from the lobby");
      router.push("/");
    };

    socket.on("joinError", handleJoinError);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("kicked", handleKicked);
    socket.on("countdownTick", (seconds: number) => {
      setCountdown(seconds);
    });
    socket.on("countdownComplete", () => {
      socket.emit("startGame", lobbyId);
      router.push(`/game/${lobbyId}`);
    });

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("joinError", handleJoinError);
      socket.off("kicked", handleKicked);
      socket.off("countdownTick");
      socket.off("countdownComplete");
    };
  }, [lobbyId, playerId, playerName, router]);
  const backgroundUrl = "/layered-peaks-dark.svg";
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url('${backgroundUrl}')`,
      }}
    >
      <Card className="w-full max-w-2xl shadow-lg bg-card/50 backdrop-blur-xl">
        <CardContent className="p-6 space-y-4">
          <TypographyH1 className="text-center">
            Lobby ID: <span className="font-mono">{lobbyId}</span>
          </TypographyH1>
          <TypographyH4 className="mb-4">
            Share this code to play with friends!
          </TypographyH4>

          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              onClick={() => {
                socket.emit("leaveLobby", lobbyId, playerId);
                localStorage.removeItem("playerName");
                router.push("/");
              }}
              className="w-17"
            >
              Leave
            </Button>

            {playerId === host && (
              <Button
                onClick={handleStartGame}
                disabled={players.length !== totalPlayers || countdown !== null}
                className="w-17"
              >
                Start
              </Button>
            )}
          </div>

          {countdown !== null && (
            <div className="text-center text-xl font-bold text-red-600 animate-pulse">
              Game starting in {countdown}...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl shadow-md bg-card/50 backdrop-blur-xl">
        <CardContent className="p-6 flex flex-col items-center">
          <TypographyH1 className="mb-4">Players</TypographyH1>
          {players.length !== totalPlayers ? (
            <TypographyH4 className="mb-4">{`Waiting (${players.length}/${totalPlayers})`}</TypographyH4>
          ) : (
            <TypographyH4 className="mb-4">{`Ready (${players.length}/${totalPlayers})`}</TypographyH4>
          )}
          <PlayerList
            players={players}
            host={host}
            playerId={playerId}
            lobbyId={lobbyId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
