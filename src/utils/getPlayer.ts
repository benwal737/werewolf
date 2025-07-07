"use client";

import { v4 as uuidv4 } from "uuid";

export const getPlayer = () => {
  if (typeof window === "undefined") {
    return { playerId: null, playerName: null };
  }

  let playerId = localStorage.getItem("playerId");
  let playerName = localStorage.getItem("playerName");

  if (!playerId) {
    playerId = uuidv4();
    localStorage.setItem("playerId", playerId);
  }

  return { playerId, playerName };
};
