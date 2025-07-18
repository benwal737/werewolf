"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useBackground } from "@/utils/useBackground";
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
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            backgroundImage: background,
          }}
        >
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
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  if (forcedTheme === "light") {
    return (
      <div
        className="min-h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: background }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: background }}
    >
      {children}
    </div>
  );
}
