/** @format */
"use client";

import React from 'react';
import { useWeb3 } from './Web3Provider';

export default function WalletConnector() {
  const { wallet, connectWallet, disconnectWallet, pets, isGameReady } = useWeb3();

  if (wallet) {
    return (
      <div className="fixed top-20 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm z-50 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="font-semibold">Wallet Connected</span>
        </div>
        
        <div className="space-y-1 text-xs">
          <div>
            <span className="text-gray-300">Address:</span>
            <div className="font-mono">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
          </div>
          <div>
            <span className="text-gray-300">Username:</span>
            <div>{wallet.username}</div>
          </div>
          <div>
            <span className="text-gray-300">Pets:</span>
            <div>{pets.filter(pet => pet.unlocked).length} owned</div>
          </div>
          <div>
            <span className="text-gray-300">Game:</span>
            <div className={isGameReady ? "text-green-400" : "text-yellow-400"}>
              {isGameReady ? "Ready" : "Loading..."}
            </div>
          </div>
        </div>

        <button
          onClick={disconnectWallet}
          className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-xs transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="font-semibold">Wallet Required</span>
      </div>
      
      <p className="text-xs text-gray-300 mb-3">
        Connect your wallet to start playing with your NFT pets
      </p>

      <button
        onClick={connectWallet}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs transition-colors"
      >
        Connect Wallet
      </button>
    </div>
  );
}