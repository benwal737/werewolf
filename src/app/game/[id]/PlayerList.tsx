"use client";

import React, { useState } from "react";
import { Player, GameState } from "@/game/types";
import PlayerCard from "./PlayerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Button from "@/components/ui/sound-button";
import { socket } from "@/lib/socketClient";

interface PlayerListProps {
  players: Player[];
  currentUserId: string;
  gameState: GameState;
  foretellerRevealed: Player | undefined;
  witchSelected: boolean;
  getClickAction: (player: Player) => (() => void) | undefined;
  lobbyId: string;
}

const PlayerList = ({
  players,
  currentUserId,
  gameState,
  foretellerRevealed,
  witchSelected,
  getClickAction,
  lobbyId,
}: PlayerListProps) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === currentUserId && a.alive) return -1;
    if (b.id === currentUserId && b.alive) return 1;
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    return 0;
  });

  const [showingConfirmation, setShowingConfirmation] = useState(false);
  const user = gameState.players[currentUserId];
  const werewolfVoting =
    gameState.substep === "werewolves" && user.role === "werewolf";

  const handleSkipVote = () => {
    socket.emit("playerVoted", lobbyId, user.id, "skip");
  };

  const skipVoteColors = players
    .filter((p) => p.vote === "skip")
    .map((p) => p.color);

  return (
    <Card className="bg-card/30 backdrop-blur-sm">
      <CardHeader className="flex justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle className="text-2xl">Players</CardTitle>
        </div>
        {(gameState.substep === "vote" ||
          gameState.substep === "results" ||
          werewolfVoting) && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 min-h-[1rem] items-center justify-end">
              {(gameState.substep === "results" || werewolfVoting) &&
                skipVoteColors.map((color, i) => (
                  <span
                    key={`${color}-${i}`}
                    className={`inline-block w-2 h-2 rounded-full ${color} border-1`}
                  />
                ))}
            </div>
            <Button
              onClick={handleSkipVote}
              disabled={
                showingConfirmation ||
                !!user.vote ||
                !user.alive ||
                gameState.substep === "results"
              }
              className="h-8 py-0"
            >
              Skip Vote
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              gameState={gameState}
              user={user}
              foretellerRevealed={foretellerRevealed}
              witchSelected={witchSelected}
              playerAction={getClickAction(player)}
              showingConfirmation={showingConfirmation}
              setShowingConfirmation={setShowingConfirmation}
              lobbyId={lobbyId}
              playerId={player.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerList;
