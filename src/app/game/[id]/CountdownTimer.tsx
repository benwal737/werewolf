import React from "react";
import { IoIosTimer } from "react-icons/io";

interface CountdownTimerProps {
  countdown: number | null;
}

const CountdownTimer = ({ countdown }: CountdownTimerProps) => {
  return (
    <div className="text-4xl font-bold flex justify-start w-[4ch] items-center">
      <IoIosTimer />
      <span className="w-fit text-center">
        {countdown ? countdown : ""}
      </span>
    </div>
  );
};

export default CountdownTimer;
