import React from "react";
import { IoIosTimer } from "react-icons/io";
import { useGameContext } from "@/context/GameContext";

const CountdownTimer = () => {
  const { countdown } = useGameContext();
  return (
    <div className="text-2xl md:text-4xl font-bold flex justify-end w-[4ch] items-center gap-1">
      <span className="w-fit text-center">{countdown ? countdown : ""}</span>
      <IoIosTimer />
    </div>
  );
};

export default CountdownTimer;
