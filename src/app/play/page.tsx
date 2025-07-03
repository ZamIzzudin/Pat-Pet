/** @format */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { NFTManager } from "@/components/web3/NFTManager";

const GameScreen = dynamic(() => import("../../components/game/GameScreen"), {
  ssr: false,
});

export default function Play() {
  const [mounted, setMounted] = useState(false);
  const [showWeb3Panel, setShowWeb3Panel] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden relative">
      {/* Game Container */}
      <div className="relative">
        {mounted && <GameScreen />}
      </div>

      {/* Web3 Panel Toggle Button */}
      <button
        onClick={() => setShowWeb3Panel(!showWeb3Panel)}
        className="fixed top-20 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
      >
        {showWeb3Panel ? 'Hide Web3' : 'Show Web3'}
      </button>

      {/* Web3 Panel */}
      {showWeb3Panel && (
        <div className="fixed top-20 right-4 z-40 w-80 max-h-[80vh] overflow-y-auto bg-gray-900 rounded-lg shadow-xl border border-gray-700">
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Web3 Controls</h2>
            
            {/* Wallet Connection */}
            <WalletConnect />
            
            {/* NFT Manager */}
            <NFTManager />
          </div>
        </div>
      )}
    </main>
  );
}