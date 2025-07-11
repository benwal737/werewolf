import React from "react";
import { TypographyH4 } from "@/components/ui/typography";

interface NarrationProps {
  narration: React.ReactNode;
  countdown: number | null;
}

const Narration = ({ narration, countdown }: NarrationProps) => {
  return (
    <div className="flex justify-center gap-2">
      <TypographyH4>{narration}:</TypographyH4>
      <TypographyH4>{countdown ?? ""}</TypographyH4>
    </div>
  );
};

export default Narration;
