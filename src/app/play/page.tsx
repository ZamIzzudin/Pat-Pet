/** @format */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const GameScreen = dynamic(() => import("../../components/game/GameScreen"), {
  ssr: false,
});

export default function Play() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden">
      {mounted && <GameScreen />}
    </main>
  );
}
