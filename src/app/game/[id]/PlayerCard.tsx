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

interface PlayerCardProps {
  player: Player;
  gameState: GameState;
  user: Player;
  foretellerRevealed: boolean | undefined;
  witchSelected: boolean;
  playerAction?: () => void;
  className?: string;
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
  className,
  showingConfirmation,
  setShowingConfirmation,
}: PlayerCardProps) {
  const foretellerTurn = gameState.substep === "foreteller";
  const werewolfTurn = gameState.substep === "werewolves";
  const witchTurn = gameState.substep === "witch";
  const witchKilling = gameState.witchKilling;
  const witchKill = gameState.witchKill;
  const voteStep = gameState.substep === "vote";
  const deathStep = gameState.substep === "results";
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

  const disable =
    (((foretellerTurn && user.role === "foreteller") ||
      (werewolfTurn && user.role === "werewolf") ||
      (witchTurn && user.role === "witch" && witchKilling)) &&
      player.id === user.id) ||
    (voteStep && player.id === user.id && player.alive && user.alive) ||
    !player.alive;
  const isForetellerChoosing =
    !foretellerRevealed &&
    foretellerTurn &&
    user.role === "foreteller" &&
    player.id !== user.id;

  const isWerewolfChoosing =
    werewolfTurn && user.role === "werewolf" && player.role !== "werewolf";

  const isWitchChoosing =
    !witchSelected &&
    witchTurn &&
    user.role === "witch" &&
    witchKilling &&
    player.id !== user.id;

  const isVoteChoosing =
    voteStep && player.id !== user.id && !voted && !showConfirmation;

  const choosing =
    (isForetellerChoosing ||
      isWerewolfChoosing ||
      isWitchChoosing ||
      isVoteChoosing) &&
    player.alive &&
    user.alive;
  const selected =
    user.vote === player.id || (witchKilling && witchKill?.id === player.id);
  return (
    <Card
      onClick={
        voteStep
          ? showConfirmation
            ? () => {}
            : handleShowConfirmation
          : playerAction
      }
      className={cn(
        "bg-card/50 backdrop-blur-sm px-6 py-4 transition-all h-20 justify-center",
        className,
        disable ? "opacity-50" : "",
        choosing && !selected && "hover:backdrop-brightness-125 cursor-pointer",
        selected &&
          "backdrop-saturate-200" +
            (werewolfTurn || voteStep ? " cursor-pointer" : "")
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>{renderRoleIcon()}</div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-semibold">{player.name}</span>
            <span className="text-md text-muted-foreground">
              {user.id === player.id && "(You)"}
            </span>
          </div>
        </div>
        {(werewolfTurn && (user.role === "werewolf" || !user.alive)) ||
          (deathStep && (
            <div className="text-lg font-semibold min-h-[1.5rem]">
              votes: {player.numVotes}
            </div>
          ))}
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
  );
}
