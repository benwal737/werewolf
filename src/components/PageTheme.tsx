"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useBackground } from "@/hooks/useBackground";
import Particles from "@/blocks/Backgrounds/Particles/Particles";

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

  if (!mounted) {
    return (
      <div
        className="flex flex-col min-h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: background }}
      />
    );
  }

  if (forcedTheme === "dark") {
    return (
      <div
        className="relative min-h-screen w-full bg-cover bg-center overflow-x-hidden"
        style={{ backgroundImage: background }}
      >
        <div className="absolute inset-0 z-0">
          <Particles
            particleColors={["#ffffff", "#ffffff"]}
            particleCount={150}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={75}
            moveParticlesOnHover={false}
            alphaParticles={false}
            disableRotation={true}
          />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: background }}
    >
      {children}
    </div>
  );
}
