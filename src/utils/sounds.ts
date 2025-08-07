import { GameState, Player } from "../game/types";
import { isWinner } from "./winConditions";

export const clickSound = () => {
  new Audio("/clicking.mp3").play();
};

export const mellowAlert = () => {
  new Audio("/mellow_alert.mp3").play();
};

export const mystery = () => {
  new Audio("/mystery.mp3").play();
};

export const victory = () => {
  new Audio("/victory.mp3").play();
};

export const defeat = () => {
  new Audio("/defeat.mp3").play();
};

export const resolve = () => {
  new Audio("/resolve.mp3").play();
};

export const ping = () => {
  new Audio("/ping.mp3").play();
};

export const bleep = () => {
  new Audio("/bleep.mp3").play();
};

export const endGame = (game: GameState, player: Player) => {
  if (game.winner === "draw") {
    resolve();
  } else if (isWinner(game, player)) {
    victory();
  } else {
    defeat();
  }
};

export const turnSound = (
  prev: GameState | null,
  current: GameState,
  userId: string | null
) => {
  const currentStep = current.substep;
  const currentPhase = current.phase;
  const prevStep = prev?.substep;
  const prevPhase = prev?.phase;
  if (currentStep === "deaths" && prevStep !== "deaths") {
    mystery();
  }
  if (currentPhase === "end" && prevPhase !== "end") {
    const updatedPlayer = userId ? current.players[userId] : null;
    if (!updatedPlayer) return;
    endGame(current, updatedPlayer);
  } else if (currentStep === "werewolves" && prevStep !== "werewolves") {
    new Audio("/werewolf.mp3").play();
  } else if (currentStep === "foreteller" && prevStep !== "foreteller") {
    new Audio("/foreteller.mp3").play();
  } else if (currentStep === "witch" && prevStep !== "witch") {
    new Audio("/witch.wav").play();
  }
};
