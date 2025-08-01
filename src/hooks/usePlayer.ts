"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export const usePlayer = () => {
  const [player, setPlayer] = useState<{
    userId: string | null;
    username: string | null;
  }>({
    userId: null,
    username: null,
  });

  useEffect(() => {
    let userId = localStorage.getItem("playerId");
    const username = localStorage.getItem("username");

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem("playerId", userId);
    }

    setPlayer({ userId, username });
  }, []);

  return player;
};
