"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "../../../socket";
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

type Player = {
  id: string;
  name: string;
  role: string;
  alive: boolean;
};

export default function Lobby() {
  const lobbyId = useParams().id;
  const [players, setPlayers] = useState<Player[]>([]);
  const { playerName, playerId } = getPlayer();

  useEffect(() => {
    console.log("emitting joinLobby event with", lobbyId, playerId, playerName);
    socket.emit("joinLobby", lobbyId, playerId, playerName);

    const handlePlayerJoined = (playerList: Record<string, Player>) => {
      console.log("player list update:", playerList);
      setPlayers(Object.values(playerList));
    };

    socket.on("playerJoined", handlePlayerJoined);

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
    };
  }, [lobbyId, playerId, playerName]);

  return (
    <div>
      <h2>Players:</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
