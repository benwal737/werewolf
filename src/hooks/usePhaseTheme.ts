import { GameState } from '@/game/types';
import { useEffect, useState } from 'react'

const usePhaseTheme = (gameState: GameState | null) => {
  const [phaseTheme, setPhaseTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const phase = gameState?.phase;
    const theme = phase === 'night' || phase === 'start' ? 'dark' : 'light';
    setPhaseTheme(theme);
  }, [gameState]);

  return phaseTheme;
}

export default usePhaseTheme  