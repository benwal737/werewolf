import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Player, Role } from "@/game/types";
import { GiCauldron, GiVillage, GiWolfHead, GiThirdEye } from "react-icons/gi";
import { FaQuestion } from "react-icons/fa";
import { useState } from "react";
import { GameState } from "@/game/types";
import { Button } from "@/components/ui/button";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { IconType } from "react-icons";
import { GlowEffect } from "@/components/ui/glow-effect";
import { motion } from "motion/react";

interface PlayerCardProps {
  player: Player;
  gameState: GameState;
  user: Player;
  foretellerRevealed: boolean | undefined;
  witchSelected: boolean;
  playerAction?: () => void;
  showingConfirmation?: boolean;
  setShowingConfirmation?: (showingConfirmation: boolean) => void;
}

export default function PlayerCard({
  player,
  gameState,
  user,
  foretellerRevealed,
  witchSelected,
  playerAction,
  showingConfirmation,
  setShowingConfirmation,
}: PlayerCardProps) {
  const foretellerTurn = gameState.substep === "foreteller";
  const werewolfTurn = gameState.substep === "werewolves";
  const witchTurn = gameState.substep === "witch";
  const witchKilling = gameState.witchKilling;
  const witchKill = gameState.witchKill;
  const voteStep = gameState.substep === "vote";
  const resultsStep = gameState.substep === "results";
  const gameOver = gameState.phase === "end";
  const voted = user.vote !== undefined;

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleShowConfirmation = () => {
    if (
      voted ||
      showingConfirmation ||
      !user.alive ||
      !player.alive ||
      user.id === player.id
    )
      return;
    setShowConfirmation(true);
    setShowingConfirmation?.(true);
  };

  const handleConfirmVote = () => {
    clearConfirmation();
    playerAction?.();
  };

  const clearConfirmation = () => {
    setShowConfirmation(false);
    setShowingConfirmation?.(false);
  };

  const roleIcons: Record<Role, IconType> = {
    foreteller: GiThirdEye,
    witch: GiCauldron,
    villager: GiVillage,
    werewolf: GiWolfHead,
  };

  const getRoleIcon = (role: Role) => {
    const Icon = roleIcons[role];
    return Icon ? <Icon size={30} /> : null;
  };

  const renderRoleIcon = () => {
    const role: Role = player.role;
    const IconWrapper = (
      <div className={`icon-badge ${player.color}`}>{getRoleIcon(role)}</div>
    );

    if (user.role === "werewolf" && player.role === "werewolf")
      return IconWrapper;

    if (user.id === player.id) return IconWrapper;

    if (player.alive && user.alive && !gameOver && user.id !== player.id)
      return (
        <div className={`icon-badge ${player.color}`}>
          <FaQuestion size={30} />
        </div>
      );

    if (!player.alive || gameOver || !user.alive) return IconWrapper;

    return null;
  };

  const isForetellerChoosing =
    !foretellerRevealed && foretellerTurn && user.role === "foreteller";

  const isWerewolfChoosing = werewolfTurn && user.role === "werewolf";

  const isWitchChoosing =
    !witchSelected && witchTurn && user.role === "witch" && witchKilling;

  const isVoteChoosing = voteStep && !voted && !showConfirmation;

  const disable =
    !player.alive || (isForetellerChoosing && player.id === user.id);

  const choosing =
    (isForetellerChoosing ||
      isWerewolfChoosing ||
      isWitchChoosing ||
      isVoteChoosing) &&
    user.alive;

  const selected =
    user.vote === player.id || (witchKilling && witchKill?.id === player.id);

  const shouldHighlight = choosing && !selected && !disable;

  const players = Object.values(gameState.players);
  const playerVoteColors = players
    .filter((person) => person.vote === player.id)
    .map((person) => person.color);

  return (
    <div className="relative w-full h-full">
      {selected && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            opacity: selected ? 1 : 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <GlowEffect
            colors={["#0894FF", "#C959DD", "#FF2E54", "#FF9004"]}
            mode="colorShift"
            blur="soft"
            duration={4}
          />
        </motion.div>
      )}
      <Card
        onClick={
          voteStep
            ? showConfirmation
              ? () => {}
              : handleShowConfirmation
            : playerAction
        }
        className={cn(
          "backdrop-blur-sm px-6 py-4 h-20 justify-center relative z-10",
          selected ? "bg-card" : "bg-card/50",
          disable ? "opacity-50" : "",
          shouldHighlight ? "hover:backdrop-brightness-125 cursor-pointer" : "",
          showConfirmation ? "backdrop-brightness-125" : "",
          selected && werewolfTurn ? "cursor-pointer" : ""
        )}
      >
        <div className="flex justify-between items-center relative">
          <div className="flex items-center gap-4">
            <div>{renderRoleIcon()}</div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">{player.name}</span>
              <span className="text-md text-muted-foreground">
                {user.id === player.id && "(You)"}
              </span>
            </div>
          </div>
          {((werewolfTurn && (user.role === "werewolf" || !user.alive)) ||
            resultsStep) && (
            <div className="text-lg font-semibold min-h-[1.5rem]">
              votes:{" "}
              <div className="flex gap-1">
                {playerVoteColors.map((color, i) => (
                  <span
                    key={`${color}-${i}`}
                    className={`inline-block w-2 h-2 rounded-full ${color}`}
                  />
                ))}
              </div>
            </div>
          )}
          {showConfirmation && (
            <div className="flex gap-2">
              <Button onClick={handleConfirmVote}>
                <IoMdCheckmark size={20} />
              </Button>
              <Button onClick={clearConfirmation}>
                <IoMdClose size={20} />
              </Button>
            </div>
          )}
          <div
            className={cn(
              "text-sm mt-1",
              player.alive && "text-green-600",
              !player.alive && "text-red-500"
            )}
          >
            {player.alive ? "Alive" : "Dead"}
          </div>
        </div>
      </Card>
    </div>
  );
}
