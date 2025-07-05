/** @format */
"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "./Web3Provider";

export default function WalletConnector() {
  const { wallet, pets, isGameReady, isConnecting } = useWeb3();

  return (
    <div>
      {/* RainbowKit Connect Button */}
      <div>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // Note: If your app doesn't use authentication, you
            // can remove all 'authenticationStatus' checks
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold"
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect Wallet"}
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-semibold"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex gap-2">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg transition-colors"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                              display: "inline-block",
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex gap-5"
                      >
                        <span>{account.displayName}</span>
                        <span className="font-semibold">
                          {account.displayBalance
                            ? ` ${account.displayBalance}`
                            : ""}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {/* Game Status Panel */}
      {/* {wallet && (
        <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="font-semibold">Game Status</span>
          </div>

          <div className="space-y-1 text-xs">
            <div>
              <span className="text-gray-300">Username:</span>
              <div>{wallet.username}</div>
            </div>
            <div>
              <span className="text-gray-300">Pets Owned:</span>
              <div>{pets.filter((pet) => pet.unlocked).length} NFTs</div>
            </div>
            <div>
              <span className="text-gray-300">Game:</span>
              <div
                className={isGameReady ? "text-green-400" : "text-yellow-400"}
              >
                {isGameReady ? "Ready" : "Loading..."}
              </div>
            </div>
            <div>
              <span className="text-gray-300">Network:</span>
              <div className="text-blue-400">Monad Testnet</div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
