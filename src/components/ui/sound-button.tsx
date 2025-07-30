import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { clickSound } from "@/utils/sounds";

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export default function SoundButton({ onClick, ...props }: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    clickSound();
    onClick?.(e);
  };

  return <Button {...props} onClick={handleClick} />;
}
