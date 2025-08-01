import { GameState, Player, Substep } from "../game/types";
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

export const turnSound = (prev: Substep, current: Substep) => {
  if (current === "werewolves" && prev !== "werewolves") {
    new Audio("/werewolf.mp3").play();
  } else if (current === "foreteller" && prev !== "foreteller") {
    new Audio("/foreteller.mp3").play();
  } else if (current === "witch" && prev !== "witch") {
    new Audio("/witch.wav").play();
  }
};
