import { GameState, Player } from "@/game/types";
import { createContext, useContext } from "react";

interface GameContextType {
  gameState: GameState;
  user: Player;
  witchSelected: boolean;
  setWitchSelected: (selected: boolean) => void;
  countdown: number | null;
}

const GameContext = createContext<GameContextType | null>(null);

export default function GameContextProvider({
  gameState,
  user,
  witchSelected,
  setWitchSelected,
  countdown,
  children,
}: {
  gameState: GameState;
  user: Player;
  witchSelected: boolean;
  setWitchSelected: (selected: boolean) => void;
  countdown: number | null;
  children: React.ReactNode;
}) {
  return (
    <GameContext.Provider value={{ gameState, user, witchSelected, setWitchSelected, countdown }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
};
