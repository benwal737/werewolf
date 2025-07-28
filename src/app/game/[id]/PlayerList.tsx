"use client";

import React, { useState } from "react";
import { Player, GameState } from "@/game/types";
import PlayerCard from "./PlayerCard";

interface PlayerListProps {
  players: Player[];
  currentUserId: string;
  gameState: GameState;
  foretellerRevealed: boolean | undefined;
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
      {sortedPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          gameState={gameState}
          user={gameState.players[currentUserId]}
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
  );
};

export default PlayerList;
