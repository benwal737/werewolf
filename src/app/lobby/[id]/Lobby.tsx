"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Player, Message } from "@/game/types";
import PlayerList from "./PlayerList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import { Loader2Icon, Users } from "lucide-react";
import { clickSound } from "@/utils/sounds";
import { TextShimmer } from "@/components/ui/text-shimmer";
import dynamic from "next/dynamic";
import GameChat from "@/app/game/[id]/GameChat";
import { GiSandsOfTime } from "react-icons/gi";

const messages: Message[] = [
  {
    id: "1",
    text: "Hello",
    sender: { id: "1", name: "Player 1", role: "werewolf", alive: true },
  },
  {
    id: "2",
    text: "Whats up",
    sender: { id: "2", name: "Player 2", role: "villager", alive: true },
  },
  {
    id: "3",
    text: "Whats up",
    sender: { id: "3", name: "Player 3", role: "witch", alive: true },
  },
  {
    id: "4",
    text: "Whats up",
    sender: { id: "4", name: "Player 4", role: "foreteller", alive: true },
  },
  {
    id: "5",
    text: "Whats up",
    sender: { id: "5", name: "Player 5", role: "villager", alive: true },
  },
  {
    id: "6",
    text: "Whats up",
    sender: { id: "6", name: "Player 6", role: "villager", alive: true },
  },
  {
    id: "7",
    text: "Whats up",
    sender: { id: "7", name: "Player 7", role: "villager", alive: true },
  },
  {
    id: "8",
    text: "Whats up",
    sender: { id: "8", name: "Player 8", role: "villager", alive: true },
  },
  {
    id: "9",
    text: "Whats up",
    sender: { id: "9", name: "Player 9", role: "villager", alive: true },
  },
];

interface ClipboardProps {
  copied: boolean;
  setCopied: (copied: boolean) => void;
  text: string;
  color?: string;
  size?: number;
  className?: string;
}

const Clipboard = dynamic<ClipboardProps>(
  () => import("react-clipboard-animation").then((mod) => mod.default || mod),
  { ssr: false }
);

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) setCopied(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    const handleJoinError = () => {
      console.log("join error");
      router.push("/lobby/not-found");
    };

    if (!playerId || !playerName) return;

    socket.emit("checkLobby", lobbyId, (exists: boolean) => {
      if (!exists) {
        return handleJoinError();
      }
      socket.emit("joinLobby", lobbyId, playerId, playerName);
    });

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
        className={
          "transition-opacity duration-300 min-h-screen overflow-y-auto flex justify-center"
        }
      >
        {validLobby ? (
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 my-10 mx-10">
            {/* Left: Lobby Card */}
            <div className="order-1 lg:order-1 flex flex-col">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex items-center gap-2">
                  <GiSandsOfTime className="h-5 w-5" />
                  <CardTitle className="text-2xl">Lobby</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lobby ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-mono font-bold">
                          {lobbyId}
                        </p>
                        <Clipboard
                          copied={copied}
                          setCopied={setCopied}
                          text={lobbyId}
                          color="white"
                          size={24}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-4 w-full justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        clickSound();
                        socket.emit("leaveLobby", lobbyId, playerId);
                        localStorage.removeItem("playerName");
                        router.push("/");
                      }}
                      className="min-w-[80px]"
                    >
                      Leave
                    </Button>
                    {playerId === host && (
                      <Button
                        onClick={handleStartGame}
                        disabled={players.length !== totalPlayers || started}
                        className="min-w-[80px]"
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
            </div>
            {/* Center: Player List */}
            <div className="order-2 lg:order-2 w-full flex flex-col">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-2xl">Players</CardTitle>
                  </div>
                  <CardTitle className="align-bottom">
                    {started ? (
                      <TextShimmer>Game starting...</TextShimmer>
                    ) : players.length !== totalPlayers ? (
                      <span>{`Waiting (${players.length}/${totalPlayers})`}</span>
                    ) : (
                      <span>{`Ready (${players.length}/${totalPlayers})`}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerList
                    players={players}
                    host={host}
                    playerId={playerId}
                    lobbyId={lobbyId}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Right: Game Chat */}
            <div className="order-3 lg:order-3 w-full flex flex-col">
              <GameChat messages={messages} />
            </div>
          </div>
        ) : (
          <TextShimmer className="mx-auto text-2xl">
            Validating lobby...
          </TextShimmer>
        )}
      </div>
    </PageTheme>
  );
}
