"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { Player, GameState } from "@/game/types";
import PlayerList from "./PlayerList";
import Button from "@/components/ui/sound-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import { Loader2Icon, Users } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import dynamic from "next/dynamic";
import GameChat from "@/app/game/[id]/GameChat";
import { GiSandsOfTime } from "react-icons/gi";
import { bleep, mellowAlert, ping } from "@/utils/sounds";

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
  const { username, userId } = usePlayer();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validLobby, setValidLobby] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const player: Player | null =
    userId && gameState ? gameState.players[userId] : null;

  const handleStartGame = () => {
    setLoading(true);
    socket.emit("startGameCountdown", lobbyId);
  };

  const hasPlayedAlert = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (copied) setCopied(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    const handleJoinError = () => {
      router.push("/lobby/not-found");
    };

    if (!userId || !username) return;

    socket.emit("checkLobby", lobbyId, (exists: boolean) => {
      if (!exists) {
        return handleJoinError();
      }
      socket.emit(
        "joinLobby",
        lobbyId,
        userId,
        username,
        (gameState: GameState) => {
          setGameState(gameState);
          setValidLobby(true);
        }
      );
    });

    const handleLobbyUpdated = (gameState: GameState) => {
      setGameState(gameState);
      setValidLobby(true);
    };

    const handleKicked = () => {
      router.push("/");
    };

    const handleStartCountdown = () => {
      if (!hasPlayedAlert.current) {
        mellowAlert();
        hasPlayedAlert.current = true;
      }
      setStarted(true);
    };

    const handleCountdownComplete = () => {
      socket.emit("startGame", lobbyId);
      router.push(`/game/${lobbyId}`);
    };

    socket.on("playerJoined", () => {
      bleep();
    });

    socket.on("playerLeft", () => {
      ping();
    });

    socket.on("joinError", handleJoinError);
    socket.on("gameUpdated", handleLobbyUpdated);
    socket.on("kicked", handleKicked);
    socket.on("startCountdown", handleStartCountdown);
    socket.on("countdownComplete", handleCountdownComplete);

    return () => {
      socket.off("gameUpdated", handleLobbyUpdated);
      socket.off("joinError", handleJoinError);
      socket.off("kicked", handleKicked);
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("startCountdown");
      socket.off("countdownComplete");
    };
  }, [lobbyId, userId, username, router]);

  return (
    <PageTheme forcedTheme="dark">
      <div
        className={`transition-opacity duration-300 min-h-screen overflow-y-auto flex justify-center ${
          validLobby && gameState && userId ? "" : "items-center"
        }`}
      >
        {validLobby && gameState && userId ? (
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 my-10 mx-10">
            {/* Left: Lobby Card */}
            <div className="order-1 lg:order-1 flex flex-col">
              <Card className="bg-card/50 backdrop-blur-sm h-52.5">
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
                        socket.emit("leaveLobby", lobbyId, userId);
                        localStorage.removeItem("playerName");
                        router.push("/");
                      }}
                      className="min-w-[80px]"
                    >
                      Leave
                    </Button>
                    {userId === gameState.host && (
                      <Button
                        onClick={handleStartGame}
                        disabled={
                          Object.values(gameState.players).length !==
                            gameState.totalPlayers || started
                        }
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
              <Card className="bg-card/50 backdrop-blur-sm min-h-52.5">
                <CardHeader className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle className="text-2xl">Players</CardTitle>
                  </div>
                  <CardTitle className="align-bottom">
                    {started ? (
                      <TextShimmer>Game starting...</TextShimmer>
                    ) : Object.values(gameState.players).length !==
                      gameState.totalPlayers ? (
                      <span>{`Waiting (${
                        Object.values(gameState.players).length
                      }/${gameState.totalPlayers})`}</span>
                    ) : (
                      <span>{`Ready (${
                        Object.values(gameState.players).length
                      }/${gameState.totalPlayers})`}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerList
                    players={Object.values(gameState.players)}
                    host={gameState.host}
                    playerId={userId}
                    lobbyId={lobbyId}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Right: Game Chat */}
            <div className="order-3 lg:order-3 w-full flex flex-col">
              {player && <GameChat gameState={gameState} player={player} />}
            </div>
          </div>
        ) : (
          <TextShimmer className="text-2xl">Validating lobby...</TextShimmer>
        )}
      </div>
    </PageTheme>
  );
}
