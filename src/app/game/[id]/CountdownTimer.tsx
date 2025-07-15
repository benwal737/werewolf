import React from "react";

interface CountdownTimerProps {
  countdown: number | null;
}

const CountdownTimer = ({ countdown }: CountdownTimerProps) => {
  return (
    <div className="flex items-center gap-2 rounded px-4 py-2 w-[90px] justify-center text-2xl font-bold">
      <span className="w-[2ch] tabular-nums text-center">
        {countdown ?? ""}
      </span>
    </div>
  );
};

export default CountdownTimer;
