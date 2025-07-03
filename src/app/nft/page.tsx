/** @format */
"use client";

import { WalletConnect } from "@/components/web3/WalletConnect";
import { NFTManager } from "@/components/web3/NFTManager";

export default function NFTPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden p-8">
      <div className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          NFT Pet Management
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Wallet Connection</h2>
            <WalletConnect />
          </div>
          
          {/* NFT Management Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Pet Management</h2>
            <NFTManager />
          </div>
        </div>
        
        {/* Instructions */}
        <div className="bg-gray-800 p-6 rounded-lg text-white">
          <h3 className="text-xl font-semibold mb-4">How it works:</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>Connect your wallet to interact with NFT pets</li>
            <li>Your pet's stats are synchronized between the game and blockchain</li>
            <li>Use the controls here or in-game to care for your pet</li>
            <li>Mint NFTs to preserve your pet's progress permanently</li>
            <li>Trade or showcase your pets on NFT marketplaces</li>
          </ul>
        </div>
      </div>
    </main>
  );
}