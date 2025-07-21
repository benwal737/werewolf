"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Player } from "@/game/types";
import PlayerList from "./PlayerList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH1, TypographyH4 } from "@/components/ui/typography";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import { Loader2Icon } from "lucide-react";
import { clickSound } from "@/utils/sounds";
import { TextShimmer } from "@/components/ui/text-shimmer";
import Clipboard from "react-clipboard-animation";

export default function Lobby() {
  const lobbyId = useParams().id as string;
  const { playerName, playerId } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [host, setHost] = useState<string | null>(null);
  const [totalPlayers, setTotalPlayers] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validLobby, setValidLobby] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleStartGame = () => {
    clickSound();
    setLoading(true);
    socket.emit("startGameCountdown", lobbyId);
  };

  const handleJoinError = () => {
    console.log("join error");
    router.push("/");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) setCopied(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!playerId || !playerName) return;

    socket.emit("joinLobby", lobbyId, playerId, playerName);

    const handlePlayerJoined = (data: {
      players: Record<string, Player>;
      host: string;
      totalPlayers: number;
    }) => {
      console.log("player joined", data);
      setPlayers(Object.values(data.players));
      setHost(data.host);
      setTotalPlayers(data.totalPlayers);
      setValidLobby(true);
    };

    const handleKicked = () => {
      router.push("/");
    };

    socket.on("joinError", handleJoinError);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("kicked", handleKicked);
    socket.on("startCountdown", () => {
      setStarted(true);
    });
    socket.on("countdownComplete", () => {
      socket.emit("startGame", lobbyId);
      router.push(`/game/${lobbyId}`);
    });

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("joinError", handleJoinError);
      socket.off("kicked", handleKicked);
      socket.off("startCountdown");
      socket.off("countdownComplete");
    };
  }, [lobbyId, playerId, playerName, router]);

  return (
    <PageTheme forcedTheme="dark">
      <div
        className={`transition-opacity duration-300 flex flex-col items-center gap-8 px-4 py-30 justify-start min-h-screen`}
      >
        {validLobby ? (
          <>
            <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm p-8">
              <CardContent className="flex flex-col items-center gap-2">
                <div className="relative w-[24vw] flex items-center">
                  <TypographyH1 className="w-full text-center">
                    Lobby ID:
                    <span className="font-mono"> {lobbyId}</span>
                  </TypographyH1>
                  <Clipboard
                    copied={copied}
                    setCopied={setCopied}
                    text={lobbyId}
                    color="white"
                    size={24}
                    className=""
                  />
                </div>
                <TypographyH4 className="mb-4">
                  Share this code to play with friends!
                </TypographyH4>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      clickSound();
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
                      disabled={players.length !== totalPlayers || started}
                      className="w-17"
                    >
                      {loading ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        "Start"
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-sm p-8">
              <CardContent className="flex flex-col items-center gap-2">
                <TypographyH1 className="mb-4">Players</TypographyH1>
                {started ? (
                  <TextShimmer>Game starting...</TextShimmer>
                ) : players.length !== totalPlayers ? (
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
          </>
        ) : (
          <TextShimmer className="mx-auto text-2xl">
            Validating lobby...
          </TextShimmer>
        )}
      </div>
    </PageTheme>
  );
}
