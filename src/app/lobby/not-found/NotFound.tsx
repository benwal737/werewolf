"use client";

import React from "react";
import FuzzyText from "@/blocks/TextAnimations/FuzzyText/FuzzyText";
import PageTheme from "@/components/PageTheme";
import Link from "next/link";
import useOngoingGame from "@/hooks/useOngoingGame";

const NotFound = () => {
  useOngoingGame();
  return (
    <PageTheme forcedTheme="dark">
      <div className="flex flex-col items-center justify-center h-screen gap-1">
        <FuzzyText baseIntensity={0.2} hoverIntensity={0.5} enableHover={true}>
          404
        </FuzzyText>
        <div className="text-2xl font-bold mt-4">Lobby Not Found</div>
        <Link href="/" className="text-primary font-bold text-lg">
          Go Back Home
        </Link>
      </div>
    </PageTheme>
  );
};

export default NotFound;
