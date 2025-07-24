import React from "react";
import { IoIosTimer } from "react-icons/io";

interface CountdownTimerProps {
  countdown: number | null;
}

const CountdownTimer = ({ countdown }: CountdownTimerProps) => {
  return (
    <div className="text-4xl font-bold flex justify-end w-[4ch] items-center gap-1">
      <span className="w-fit text-center">{countdown ? countdown : ""}</span>
      <IoIosTimer />
    </div>
  );
};

export default CountdownTimer;
