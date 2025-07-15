"use client";
import { useTheme } from "next-themes";

export const getBackground = () => {
  const { theme } = useTheme();
  if (theme === "light") {
    return "linear-gradient(rgba(81, 116, 150, 0.8),rgba(196, 255, 255, 0.8)), url('/layered-peaks-light.svg')";
  } else {
    return "linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url('/layered-peaks-dark.svg')";
  }
};
