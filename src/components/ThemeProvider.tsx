"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { useTheme } from "next-themes";

export function ThemeProvider({
  children,
  forcedTheme,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & { forcedTheme?: "light" | "dark" }) {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    if (forcedTheme && theme !== forcedTheme) {
      setTheme(forcedTheme);
    }
  }, [forcedTheme, theme, setTheme]);

  return (
    <NextThemesProvider {...props}>{children}</NextThemesProvider>
  );
}

