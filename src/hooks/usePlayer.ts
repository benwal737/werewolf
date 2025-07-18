"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const usePlayer = () => {
  const [player, setPlayer] = useState<{
    playerId: string | null;
    playerName: string | null;
  }>({
    playerId: null,
    playerName: null,
  });

  useEffect(() => {
    let playerId = localStorage.getItem("playerId");
    const playerName = localStorage.getItem("playerName");

    if (!playerId) {
      playerId = uuidv4();
      localStorage.setItem("playerId", playerId);
    }

    setPlayer({ playerId, playerName });
  }, []);

  return player;
};
