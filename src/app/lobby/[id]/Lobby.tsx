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
import { getBackground } from "@/utils/getBackground";
import { LuClipboardCopy } from "react-icons/lu";
import PageTheme from "@/components/PageTheme";

export default function Lobby() {
  const lobbyId = useParams().id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { playerName, playerId } = getPlayer();
  const router = useRouter();

  const handleStartGame = () => {
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
  const background = getBackground();
  return (
    <PageTheme forcedTheme="dark">
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 py-8"
        style={{
          backgroundImage: background,
        }}
      >
        <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm">
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="relative w-[24vw] flex items-center">
              <TypographyH1 className="w-full text-center">
                {screen.width > 768 ? "Lobby ID:" : ""} <span className="font-mono">{lobbyId}</span>
              </TypographyH1>
              {/* TODO: make this work on mobile */}
              {screen.width > 768 && <Button
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(lobbyId)}
                className="w-8 absolute right-0 top-1/2 -translate-y-1/2"
                aria-label="Copy Lobby ID"
              >
                <LuClipboardCopy />
              </Button>}
            </div>
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
                  disabled={
                    players.length !== totalPlayers || countdown !== null
                  }
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

        <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center">
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
    </PageTheme>
  );
}
