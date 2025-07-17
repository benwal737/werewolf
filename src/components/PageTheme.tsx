"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useBackground } from "@/utils/useBackground";

export default function PageTheme({
  children,
  forcedTheme,
}: {
  children: React.ReactNode;
  forcedTheme: "light" | "dark";
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (resolvedTheme !== forcedTheme) {
      setTheme(forcedTheme);
    }
  }, [mounted, forcedTheme, resolvedTheme, setTheme]);

  const background = useBackground();

  if (!mounted)
    return (
      <div
        className="flex flex-col min-h-screen w-full bg-cover bg-center"
        style={{
          backgroundImage: background,
        }}
      ></div>
    );

  return <>{children}</>;
}
