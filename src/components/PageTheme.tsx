"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

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

  if (!mounted) return null;

  return <>{children}</>;
}
