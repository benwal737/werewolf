import React from "react";
import { IoIosTimer } from "react-icons/io";

interface CountdownTimerProps {
  countdown: number | null;
}

const CountdownTimer = ({ countdown }: CountdownTimerProps) => {
  return (
    <div className="text-4xl font-mono font-bold flex">
      <IoIosTimer />
      <span className="w-[2ch] tabular-nums text-center">
        {countdown ? countdown : ""}
      </span>
    </div>
  );
};

export default CountdownTimer;
