/** @format */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import MultiplayerStatus from "@/components/MultiplayerStatus";
import Web3Provider from "@/components/Web3Provider";
import WalletConnector from "@/components/WalletConnector";

const GameScreen = dynamic(
  () => import("../../components/game/screen/GameScreen"),
  {
    ssr: false,
  }
);

export default function Play() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Web3Provider>
      <main className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden">
        <MultiplayerStatus />
        <WalletConnector />
        {mounted && <GameScreen />}
      </main>
    </Web3Provider>
  );
}