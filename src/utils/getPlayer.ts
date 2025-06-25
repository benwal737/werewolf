"use client";

import { v4 as uuidv4 } from "uuid";

export const getPlayer = () => {
  let playerId = localStorage.getItem("playerId");
  let playerName = localStorage.getItem("playerName");
  if (!playerId) {
    playerId = uuidv4();
    localStorage.setItem("playerId", playerId);
  }

  return { playerId, playerName };
};
